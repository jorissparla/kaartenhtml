import React, { useEffect, useMemo, useRef, useState } from "react";
import { Theme, themes } from "./themes";
import { Toaster, toast } from "react-hot-toast";
import { collection, doc, getDocs, writeBatch } from "firebase/firestore";

import { db } from "./firebase";
import PlayerCards from "./components/PlayerCards";
import MatchSchedule from "./components/MatchSchedule";
import type { CourtSetup, Match } from "./types";
import { loadCourtSetups, replaceAllCourtSetups, normalizeCourtSetupDraft, MAX_COURTS_PER_SETUP } from "./utils/courtSetupsFirestore";
import { shuffle, generateMatches, defaultNumCourts, autoCourtLabels } from "./utils/matchGenerator";

const COURT_SETUP_STORAGE_KEY = "courtSetupSelection";

export default function App() {
  const [players, setPlayers] = useState<string[]>([]);
  const [playerInput, setPlayerInput] = useState<string>("");
  const [sampleNames, setSampleNames] = useState<string[]>([]);
  const [showResults, setShowResults] = useState<boolean>(false);
  const [matchScheduleGeneration, setMatchScheduleGeneration] = useState(0);
  const [settingsOpen, setSettingsOpen] = useState<boolean>(false);
  const [themeOpen, setThemeOpen] = useState<boolean>(false);
  const [settingsNames, setSettingsNames] = useState<string[]>([]);
  const [newSampleName, setNewSampleName] = useState("");
  const [courtSetups, setCourtSetups] = useState<CourtSetup[]>([]);
  const [settingsCourtSetups, setSettingsCourtSetups] = useState<CourtSetup[]>([]);
  const [selectedCourtSetupId, setSelectedCourtSetupId] = useState<string>(() => {
    if (typeof window === "undefined") return "auto";
    const raw = localStorage.getItem(COURT_SETUP_STORAGE_KEY);
    return raw && raw !== "auto" ? raw : "auto";
  });
  const [courtSetupsHydrated, setCourtSetupsHydrated] = useState(false);
  const [postGenTab, setPostGenTab] = useState<"schedule" | "numbers">("schedule");
  const [settingsSection, setSettingsSection] = useState<"names" | "courts">("names");
  const defaultTheme: Theme = themes.find((t) => t.id === "light") ?? { name: "Light", id: "light", swatch: "#0969da" };
  const [selectedTheme, setSelectedTheme] = useState<Theme>(defaultTheme);
  const postGenMobileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function load() {
      try {
        const querySnapshot = await getDocs(collection(db, "sample_names"));
        if (querySnapshot.empty) {
          const DEFAULT_SAMPLE_NAMES = [
            "Joris",
            "Rene",
            "Boudewijn",
            "JanB",
            "JanJ",
            "Koos",
            "Johan",
            "Ronald",
            "Mart",
            "Frank",
            "Justin",
            "Jurgen",
            "Johnny",
            "Willem",
            "Edwin",
            "Martijn",
          ].sort((a, b) => a.localeCompare(b));
          setSampleNames(DEFAULT_SAMPLE_NAMES);
          await saveSampleNames(DEFAULT_SAMPLE_NAMES, { silent: true });
        } else {
          const names = querySnapshot.docs.map((doc) => doc.data().name).sort((a, b) => a.localeCompare(b));
          setSampleNames(names);
        }
      } catch (e) {
        console.warn("Load names failed; using defaults", e);
      }
    }
    load();
  }, []);

  useEffect(() => {
    async function loadCourts() {
      try {
        const setups = await loadCourtSetups(db);
        setCourtSetups(setups);
      } catch (e) {
        console.warn("Load court setups failed", e);
      } finally {
        setCourtSetupsHydrated(true);
      }
    }
    void loadCourts();
  }, []);

  useEffect(() => {
    if (!courtSetupsHydrated) return;
    if (selectedCourtSetupId === "auto") return;
    if (!courtSetups.some((s) => s.id === selectedCourtSetupId)) {
      setSelectedCourtSetupId("auto");
    }
  }, [courtSetups, courtSetupsHydrated, selectedCourtSetupId]);

  useEffect(() => {
    localStorage.setItem(COURT_SETUP_STORAGE_KEY, selectedCourtSetupId);
  }, [selectedCourtSetupId]);

  useEffect(() => {
    const savedThemeName = localStorage.getItem("theme");
    if (savedThemeName) {
      const found = themes.find((t) => t.name === savedThemeName);
      setSelectedTheme((prev) => (found ? found : prev));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("theme", selectedTheme.name);
  }, [selectedTheme]);

  useEffect(() => {
    if (showResults) setPostGenTab("schedule");
  }, [showResults]);

  useEffect(() => {
    if (!showResults) return;
    if (!window.matchMedia("(max-width: 639px)").matches) return;
    let innerRaf = 0;
    const outerRaf = requestAnimationFrame(() => {
      innerRaf = requestAnimationFrame(() => {
        postGenMobileRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
    return () => {
      cancelAnimationFrame(outerRaf);
      cancelAnimationFrame(innerRaf);
    };
  }, [showResults]);

  async function saveSampleNames(
    names: string[],
    { replaceAll = true, silent = false }: { replaceAll?: boolean; silent?: boolean } = {}
  ): Promise<boolean> {
    const cleaned = Array.from(new Set((names || []).map((n) => (typeof n === "string" ? n.trim() : "")).filter(Boolean))).sort((a, b) =>
      a.localeCompare(b)
    );
    if (cleaned.length === 0) {
      if (!silent) toast.error("Cannot save empty list of names.");
      return false;
    }
    try {
      const batch = writeBatch(db);
      if (replaceAll) {
        const querySnapshot = await getDocs(collection(db, "sample_names"));
        querySnapshot.forEach((doc) => {
          batch.delete(doc.ref);
        });
      }
      cleaned.forEach((name) => {
        const docRef = doc(collection(db, "sample_names"));
        batch.set(docRef, { name });
      });
      await batch.commit();
      setSampleNames(cleaned);
      if (!silent) toast.success("Player names saved");
      return true;
    } catch (e) {
      console.error("Save failed", e);
      if (!silent) toast.error("Failed to save names. Check console and Firebase rules.");
      return false;
    }
  }

  const maxPlayers = 16;

  function handleAddPlayer(e: React.FormEvent) {
    e.preventDefault();
    const name = playerInput.trim();
    if (!name || players.length >= maxPlayers) return;
    setPlayers((p) => [...p, name]);
    setPlayerInput("");
  }

  function removePlayer(index: number) {
    setPlayers((arr) => arr.filter((_, i) => i !== index));
  }

  function quickFill() {
    setPlayers(shuffle(sampleNames));
  }

  const { numCourts, courtLabels } = useMemo(() => {
    if (selectedCourtSetupId === "auto") {
      const n = defaultNumCourts(players.length);
      return { numCourts: n, courtLabels: autoCourtLabels(n) };
    }
    const setup = courtSetups.find((s) => s.id === selectedCourtSetupId);
    if (!setup) {
      const n = defaultNumCourts(players.length);
      return { numCourts: n, courtLabels: autoCourtLabels(n) };
    }
    return { numCourts: setup.courts.length, courtLabels: setup.courts };
  }, [selectedCourtSetupId, courtSetups, players.length]);

  const numbers = useMemo<number[]>(() => shuffle([...Array(players.length)].map((_, i) => i + 1)), [players.length, showResults, matchScheduleGeneration]);
  const cards = useMemo(
    () => players.map((name, i) => ({ name, number: numbers[i] ?? i + 1 })).sort((a, b) => a.number - b.number),
    [players, numbers]
  );
  const rounds = useMemo<Match[][]>(() => (showResults ? generateMatches(players, numCourts) : []), [showResults, players, numCourts, matchScheduleGeneration]);

  function openSettings() {
    setSettingsNames(sampleNames);
    setSettingsCourtSetups(courtSetups.map((s) => ({ ...s, courts: [...s.courts] })));
    setSettingsSection("names");
    setSettingsOpen(true);
  }
  function closeSettings() {
    setSettingsOpen(false);
  }
  function openTheme() {
    setThemeOpen(true);
  }
  function closeTheme() {
    setThemeOpen(false);
  }
  async function saveSettings() {
    const nameCleaned = Array.from(
      new Set((settingsNames || []).map((n) => (typeof n === "string" ? n.trim() : "")).filter(Boolean))
    ).sort((a, b) => a.localeCompare(b));
    if (nameCleaned.length === 0) {
      toast.error("Cannot save empty list of names.");
      return;
    }
    try {
      const namesOk = await saveSampleNames(settingsNames, { replaceAll: true, silent: true });
      if (!namesOk) {
        toast.error("Failed to save sample names. Check console and Firebase rules.");
        return;
      }
      const validOldIds = settingsCourtSetups
        .filter((s) => normalizeCourtSetupDraft({ label: s.label, courts: s.courts }))
        .map((s) => s.id);
      const next = await replaceAllCourtSetups(
        db,
        settingsCourtSetups.map((s) => ({ label: s.label, courts: s.courts }))
      );
      setCourtSetups(next);
      if (selectedCourtSetupId !== "auto") {
        const idx = validOldIds.indexOf(selectedCourtSetupId);
        if (idx >= 0 && next[idx]) setSelectedCourtSetupId(next[idx]!.id);
        else setSelectedCourtSetupId("auto");
      }
      toast.success("Settings saved");
      setSettingsOpen(false);
    } catch (e) {
      console.error("Settings save failed", e);
      toast.error("Failed to save settings. Check console and Firebase rules.");
    }
  }

  function addCourtSetup() {
    setSettingsCourtSetups((prev) => [
      ...prev,
      { id: crypto.randomUUID(), label: "New setup", courts: ["Court 1"] },
    ]);
  }

  function removeCourtSetup(index: number) {
    setSettingsCourtSetups((prev) => prev.filter((_, i) => i !== index));
  }

  function updateCourtSetupLabel(index: number, label: string) {
    setSettingsCourtSetups((prev) => prev.map((s, i) => (i === index ? { ...s, label } : s)));
  }

  function addCourtToSetup(setupIndex: number) {
    setSettingsCourtSetups((prev) =>
      prev.map((s, i) => {
        if (i !== setupIndex || s.courts.length >= MAX_COURTS_PER_SETUP) return s;
        return { ...s, courts: [...s.courts, `Court ${s.courts.length + 1}`] };
      })
    );
  }

  function updateCourtName(setupIndex: number, courtIndex: number, name: string) {
    setSettingsCourtSetups((prev) =>
      prev.map((s, i) => {
        if (i !== setupIndex) return s;
        const courts = [...s.courts];
        courts[courtIndex] = name;
        return { ...s, courts };
      })
    );
  }

  function removeCourtFromSetup(setupIndex: number, courtIndex: number) {
    setSettingsCourtSetups((prev) =>
      prev.map((s, i) => (i === setupIndex ? { ...s, courts: s.courts.filter((_, j) => j !== courtIndex) } : s))
    );
  }

  function handleAddSampleName() {
    const name = newSampleName.trim();
    if (name && !settingsNames.includes(name)) {
      setSettingsNames([...settingsNames, name]);
      setNewSampleName("");
    }
  }

  function handleRemoveSampleName(index: number) {
    setSettingsNames(settingsNames.filter((_, i) => i !== index));
  }

  return (
    <div data-theme={selectedTheme.id} className={`min-h-screen bg-[var(--bg)] text-[var(--fg)]`}>
      <Toaster />
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-center flex-1">padel matches</h1>
          <div className="flex items-center">
            <button onClick={openTheme} className={`ml-4 text-sm bg-surface hover:bg-opacity-80 py-2 px-3 rounded transition-colors`}>
              Theme
            </button>
            <button onClick={openSettings} className={`ml-2 text-sm bg-surface hover:bg-opacity-80 py-2 px-3 rounded transition-colors`}>
              Settings
            </button>
          </div>
        </div>

        <div
          className={`mb-16 flex flex-col gap-8 ${showResults ? "max-sm:flex-col-reverse max-sm:gap-6" : ""}`}
        >
          <div className={`max-w-md mx-auto bg-surface p-6 rounded-lg shadow-lg w-full`}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Players ({players.length})</h2>
              <button
                onClick={quickFill}
                className={`text-sm bg-primary bg-primary-hover py-1 px-3 rounded transition-colors text-[var(--primary-contrast)]`}
              >
                Quick Fill ({sampleNames.length})
              </button>
            </div>

            <form onSubmit={handleAddPlayer} className="flex gap-2 mb-4">
              <input
                type="text"
                value={playerInput}
                onChange={(e) => setPlayerInput(e.target.value)}
                className="flex-grow p-2 rounded bg-surface text-fg focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
                placeholder="Enter player name"
              />
              <button
                type="submit"
                className={`bg-primary bg-primary-hover py-2 px-4 rounded-lg text-[var(--primary-contrast)] font-semibold transition-colors`}
              >
                Add
              </button>
            </form>

            <div className="space-y-2 max-h-[min(50vh,20rem)] sm:max-h-none overflow-y-auto pr-0.5">
              {players.map((p, i) => (
                <div key={`${p}-${i}`} className={`flex items-center justify-between bg-surface p-3 rounded-lg`}>
                  <span className="font-semibold">{p}</span>
                  <button onClick={() => removePlayer(i)} className="text-accent hover:opacity-80" title="Remove player">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              ))}
            </div>

            {players.length > 0 && (
              <>
                <label htmlFor="court-setup-select" className={`block text-sm font-medium mt-4 mb-1 text-fg`}>
                  Court setup
                </label>
                <select
                  id="court-setup-select"
                  value={selectedCourtSetupId}
                  onChange={(e) => setSelectedCourtSetupId(e.target.value)}
                  className={`w-full p-2 rounded bg-surface text-fg border border-token focus:outline-none focus:ring-2 focus:ring-[var(--ring)] mb-4`}
                >
                  <option value="auto">Automatic (2 or 3 courts from number of players)</option>
                  {courtSetups.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label} ({s.courts.length} {s.courts.length === 1 ? "court" : "courts"})
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => {
                    setShowResults(true);
                    setMatchScheduleGeneration((n) => n + 1);
                  }}
                  className={`w-full bg-primary bg-primary-hover text-[var(--primary-contrast)] py-2 px-4 rounded transition-colors`}
                >
                  Finish & Generate Matches
                </button>
              </>
            )}
          </div>

          {showResults && (
            <>
              <div ref={postGenMobileRef} className="sm:hidden max-w-md mx-auto w-full scroll-mt-4">
                <div
                  role="tablist"
                  aria-label="Match results"
                  className="flex rounded-lg border border-token overflow-hidden mb-4"
                >
                  <button
                    type="button"
                    role="tab"
                    aria-selected={postGenTab === "schedule"}
                    id="postgen-tab-schedule"
                    aria-controls="postgen-panel-schedule"
                    onClick={() => setPostGenTab("schedule")}
                    className={`flex-1 py-2.5 px-3 text-sm font-semibold transition-colors ${
                      postGenTab === "schedule" ? "bg-primary text-[var(--primary-contrast)]" : "bg-surface text-fg hover:bg-opacity-80"
                    }`}
                  >
                    Schedule
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={postGenTab === "numbers"}
                    id="postgen-tab-numbers"
                    aria-controls="postgen-panel-numbers"
                    onClick={() => setPostGenTab("numbers")}
                    className={`flex-1 py-2.5 px-3 text-sm font-semibold transition-colors border-l border-token ${
                      postGenTab === "numbers" ? "bg-primary text-[var(--primary-contrast)]" : "bg-surface text-fg hover:bg-opacity-80"
                    }`}
                  >
                    Player numbers
                  </button>
                </div>
                <div
                  role="tabpanel"
                  id="postgen-panel-schedule"
                  aria-labelledby="postgen-tab-schedule"
                  hidden={postGenTab !== "schedule"}
                  className={postGenTab !== "schedule" ? "hidden" : undefined}
                >
                  <MatchSchedule rounds={rounds} cards={cards} courtLabels={courtLabels} />
                </div>
                <div
                  role="tabpanel"
                  id="postgen-panel-numbers"
                  aria-labelledby="postgen-tab-numbers"
                  hidden={postGenTab !== "numbers"}
                  className={postGenTab !== "numbers" ? "hidden" : undefined}
                >
                  <PlayerCards cards={cards} />
                </div>
              </div>

              <div className="hidden sm:block">
                <PlayerCards cards={cards} />
                <hr className="border-t border-token my-6 sm:my-12" />
                <MatchSchedule rounds={rounds} cards={cards} courtLabels={courtLabels} />
              </div>
            </>
          )}
        </div>
      </div>

      {settingsOpen && (
        <div
          className={`fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center p-4 z-50 ${settingsOpen ? "settings-sheet-open" : ""}`}
          onClick={closeSettings}
        >
          <div
            className={`settings-sheet bg-surface w-full max-w-2xl rounded-t-lg sm:rounded-lg shadow-xl transform transition-transform duration-300 ease-in-out translate-y-full sm:translate-y-0 max-h-[90vh] flex flex-col`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`flex items-center justify-between p-4 border-b border-token shrink-0`}>
              <h3 className="text-lg font-semibold">Settings</h3>
              <button onClick={closeSettings} className={`text-fg hover:opacity-80`} title="Close settings">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="px-4 pt-3 pb-3 border-b border-token shrink-0">
              <div role="tablist" aria-label="Settings sections" className="flex rounded-lg border border-token overflow-hidden">
                <button
                  type="button"
                  role="tab"
                  aria-selected={settingsSection === "names"}
                  id="settings-tab-names"
                  aria-controls="settings-panel-names"
                  onClick={() => setSettingsSection("names")}
                  className={`flex-1 py-2.5 px-3 text-sm font-semibold transition-colors ${
                    settingsSection === "names" ? "bg-primary text-[var(--primary-contrast)]" : "bg-surface text-fg hover:bg-opacity-80"
                  }`}
                >
                  Sample names
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={settingsSection === "courts"}
                  id="settings-tab-courts"
                  aria-controls="settings-panel-courts"
                  onClick={() => setSettingsSection("courts")}
                  className={`flex-1 py-2.5 px-3 text-sm font-semibold transition-colors border-l border-token ${
                    settingsSection === "courts" ? "bg-primary text-[var(--primary-contrast)]" : "bg-surface text-fg hover:bg-opacity-80"
                  }`}
                >
                  Court setups
                </button>
              </div>
            </div>
            <div className="p-4 overflow-y-auto flex-1 min-h-0">
              <div
                role="tabpanel"
                id="settings-panel-names"
                aria-labelledby="settings-tab-names"
                hidden={settingsSection !== "names"}
                className={settingsSection !== "names" ? "hidden" : undefined}
              >
                <h4 className="text-sm font-semibold text-fg mb-2">Sample names (quick fill)</h4>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newSampleName}
                    onChange={(e) => setNewSampleName(e.target.value)}
                    className={`flex-grow p-2 rounded bg-surface text-fg focus:outline-none focus:ring-2 focus:ring-[var(--ring)] resize-none border border-token`}
                    placeholder="Add a new name"
                  />
                  <button
                    onClick={handleAddSampleName}
                    className="bg-primary bg-primary-hover py-2 px-4 rounded-lg text-[var(--primary-contrast)] font-semibold transition-colors shrink-0"
                  >
                    Add
                  </button>
                </div>
                <div className={`h-48 overflow-y-auto border border-token rounded-lg`}>
                  <table className="w-full text-left">
                    <tbody className={`divide-y divide-[var(--border)]`}>
                      {settingsNames.map((name, index) => (
                        <tr key={index}>
                          <td className="p-3">{name}</td>
                          <td className="p-3 text-right">
                            <button onClick={() => handleRemoveSampleName(index)} className="text-accent hover:opacity-80" title="Remove name">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div
                role="tabpanel"
                id="settings-panel-courts"
                aria-labelledby="settings-tab-courts"
                hidden={settingsSection !== "courts"}
                className={settingsSection !== "courts" ? "hidden" : undefined}
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <h4 className="text-sm font-semibold text-fg">Court setups</h4>
                  <button
                    type="button"
                    onClick={addCourtSetup}
                    className="text-sm bg-primary bg-primary-hover py-1.5 px-3 rounded text-[var(--primary-contrast)] font-semibold transition-colors"
                  >
                    Add setup
                  </button>
                </div>
                <p className={`text-xs text-fg opacity-80 mb-3`}>
                  Each setup is a day or venue: name it and list courts (order is kept). Up to {MAX_COURTS_PER_SETUP} courts per setup. Saved setups
                  appear in the Court setup menu before you generate matches.
                </p>
                {settingsCourtSetups.length === 0 ? (
                  <p className={`text-sm text-fg opacity-70 py-2`}>No setups yet. Add one to pick courts when generating.</p>
                ) : (
                  <div className="space-y-4 max-h-64 overflow-y-auto pr-1">
                    {settingsCourtSetups.map((setup, setupIndex) => (
                      <div key={setup.id} className={`border border-token rounded-lg p-3 bg-surface-2`}>
                        <div className="flex gap-2 items-start mb-2">
                          <input
                            type="text"
                            value={setup.label}
                            onChange={(e) => updateCourtSetupLabel(setupIndex, e.target.value)}
                            className={`flex-grow p-2 rounded bg-surface text-fg text-sm border border-token focus:outline-none focus:ring-2 focus:ring-[var(--ring)]`}
                            placeholder="Day or venue name"
                            aria-label="Court setup name"
                          />
                          <button
                            type="button"
                            onClick={() => removeCourtSetup(setupIndex)}
                            className="text-accent hover:opacity-80 p-2 shrink-0"
                            title="Remove setup"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </div>
                        <div className="space-y-2">
                          {setup.courts.map((courtName, courtIndex) => (
                            <div key={courtIndex} className="flex gap-2 items-center">
                              <input
                                type="text"
                                value={courtName}
                                onChange={(e) => updateCourtName(setupIndex, courtIndex, e.target.value)}
                                className={`flex-grow p-2 rounded bg-surface text-fg text-sm border border-token focus:outline-none focus:ring-2 focus:ring-[var(--ring)]`}
                                placeholder="Court name"
                                aria-label={`Court ${courtIndex + 1}`}
                              />
                              <button
                                type="button"
                                onClick={() => removeCourtFromSetup(setupIndex, courtIndex)}
                                className="text-accent hover:opacity-80 p-1 shrink-0 text-sm"
                                title="Remove court"
                                disabled={setup.courts.length <= 1}
                              >
                                Remove
                              </button>
                            </div>
                          ))}
                        </div>
                        <button
                          type="button"
                          onClick={() => addCourtToSetup(setupIndex)}
                          disabled={setup.courts.length >= MAX_COURTS_PER_SETUP}
                          className={`mt-2 text-sm py-1.5 px-3 rounded border border-token transition-colors ${
                            setup.courts.length >= MAX_COURTS_PER_SETUP ? "opacity-50 cursor-not-allowed" : "hover:bg-surface"
                          }`}
                        >
                          Add court
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="p-4 flex items-center justify-end gap-4 border-t border-token shrink-0">
              <button
                onClick={closeSettings}
                className={`bg-surface hover:bg-opacity-80 py-2 px-4 rounded-lg text-fg font-semibold transition-colors`}
              >
                Cancel
              </button>
              <button
                onClick={saveSettings}
                className={`bg-primary bg-primary-hover py-2 px-4 rounded-lg text-[var(--primary-contrast)] font-semibold transition-colors`}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {themeOpen && (
        <div
          className={`fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center p-4 z-50 ${themeOpen ? "settings-sheet-open" : ""}`}
          onClick={closeTheme}
        >
          <div
            className={`settings-sheet bg-surface w-full max-w-md rounded-t-lg sm:rounded-lg shadow-xl transform transition-transform duration-300 ease-in-out translate-y-full sm:translate-y-0`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`flex items-center justify-between p-4 border-b border-token`}>
              <h3 className="text-lg font-semibold">Theme</h3>
              <button onClick={closeTheme} className={`text-fg hover:opacity-80`} title="Close theme">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4 space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {themes.map((theme) => (
                  <button
                    key={theme.name}
                    onClick={() => setSelectedTheme(theme)}
                    className={`p-4 rounded-lg text-center font-semibold transition-colors ${
                      selectedTheme.name === theme.name ? "ring-2 ring-[var(--ring)]" : "bg-surface hover:bg-opacity-80"
                    }`}
                    aria-pressed={selectedTheme.name === theme.name}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <span className="inline-block w-4 h-4 rounded-full border theme-swatch" data-swatch={theme.swatch} />
                      <span>{theme.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
            <div className="p-4 flex items-center justify-end gap-4 border-t border-token">
              <button onClick={closeTheme} className={`bg-surface hover:bg-opacity-80 py-2 px-4 rounded-lg text-fg font-semibold transition-colors`}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* Add this CSS to src/index.css or a global CSS file:
.theme-swatch {
  border-color: var(--border);
  background-color: var(--bg);
}
.theme-swatch[data-swatch] {
  background-color: attr(data-swatch color, #fff);
}
*/
