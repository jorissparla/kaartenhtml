import React, { useEffect, useMemo, useState } from 'react'

type PlayerNum = { name: string; number: number | '-' }
type Match = { team1: [PlayerNum, PlayerNum]; team2: [PlayerNum, PlayerNum] }





function shuffle<T>(array: T[]): T[] {
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const tmp = arr[i]!
    arr[i] = arr[j]!
    arr[j] = tmp
  }
  return arr
}

function generateMatches(players: string[]): Match[][] {
  const rounds: Match[][] = []
  const playerNumbers: PlayerNum[] = players.map((player, index) => ({ name: player, number: index + 1 }))
  if (playerNumbers.length % 2 !== 0) playerNumbers.push({ name: 'Dummy', number: '-' })
  const numCourts = playerNumbers.length >= 12 ? 3 : 2
  for (let round = 0; round < 3; round++) {
    const matches: Match[] = []
    const available = [...playerNumbers]
    let courtCount = 0
    while (available.length >= 4 && courtCount < numCourts) {
      const team1: [PlayerNum, PlayerNum] = [
        available.splice(Math.floor(Math.random() * available.length), 1)[0]!,
        available.splice(Math.floor(Math.random() * available.length), 1)[0]!,
      ]
      const team2: [PlayerNum, PlayerNum] = [
        available.splice(Math.floor(Math.random() * available.length), 1)[0]!,
        available.splice(Math.floor(Math.random() * available.length), 1)[0]!,
      ]
      matches.push({ team1, team2 })
      courtCount++
    }
    rounds.push(matches)
  }
  return rounds
}

import { themes, Theme } from './themes';
import { db } from './firebase';
import { collection, getDocs, writeBatch, doc } from 'firebase/firestore';

export default function App() {
  const [players, setPlayers] = useState<string[]>([])
  const [playerInput, setPlayerInput] = useState<string>('')
  const [sampleNames, setSampleNames] = useState<string[]>([])
  const [showResults, setShowResults] = useState<boolean>(false)
  const [settingsOpen, setSettingsOpen] = useState<boolean>(false)
  const [themeOpen, setThemeOpen] = useState<boolean>(false)
  const [settingsNames, setSettingsNames] = useState<string[]>([])
  const [newSampleName, setNewSampleName] = useState('')
  const defaultTheme: Theme = themes.find((t) => t.id === 'light') ?? { name: 'Light', id: 'light', swatch: '#0969da' }
  const [selectedTheme, setSelectedTheme] = useState<Theme>(defaultTheme);

  useEffect(() => {
    async function load() {
      try {
        const querySnapshot = await getDocs(collection(db, 'sample_names'));
        if (querySnapshot.empty) {
          const DEFAULT_SAMPLE_NAMES = [
            'Joris',
            'Rene',
            'Boudewijn',
            'JanB',
            'JanJ',
            'Koos',
            'Johan',
            'Ronald',
            'Mart',
            'Frank',
            'Justin',
            'Jurgen',
            'Johnny',
            'Willem',
            'Edwin',
            'Martijn',
          ].sort((a, b) => a.localeCompare(b));
          setSampleNames(DEFAULT_SAMPLE_NAMES);
          await saveSampleNames(DEFAULT_SAMPLE_NAMES, { silent: true });
        } else {
          const names = querySnapshot.docs.map(doc => doc.data().name).sort((a, b) => a.localeCompare(b));
          setSampleNames(names);
        }
      } catch (e) {
        console.warn('Load names failed; using defaults', e);
      }
    }
    load();
  }, []);

  useEffect(() => {
    const savedThemeName = localStorage.getItem('theme');
    if (savedThemeName) {
      const found = themes.find((t) => t.name === savedThemeName);
      setSelectedTheme((prev) => (found ? found : prev));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('theme', selectedTheme.name);
  }, [selectedTheme]);

  async function saveSampleNames(names: string[], { replaceAll = true, silent = false }: { replaceAll?: boolean; silent?: boolean } = {}) {
    const cleaned = Array.from(new Set((names || []).map((n) => (typeof n === 'string' ? n.trim() : '')).filter(Boolean))).sort(
      (a, b) => a.localeCompare(b)
    )
    if (cleaned.length === 0) {
      if (!silent) alert('Cannot save empty list of names.')
      return
    }
    try {
      const batch = writeBatch(db);
      if (replaceAll) {
        const querySnapshot = await getDocs(collection(db, 'sample_names'));
        querySnapshot.forEach(doc => {
          batch.delete(doc.ref);
        });
      }
      cleaned.forEach(name => {
        const docRef = doc(collection(db, 'sample_names'));
        batch.set(docRef, { name });
      });
      await batch.commit();
      setSampleNames(cleaned);
      if (!silent) alert('Sample names saved');
    } catch (e) {
      console.error('Save failed', e);
      if (!silent) alert('Failed to save names. Check console and Firebase rules.');
    }
  }

  const maxPlayers = 16

  function handleAddPlayer(e: React.FormEvent) {
    e.preventDefault()
    const name = playerInput.trim()
    if (!name || players.length >= maxPlayers) return
    setPlayers((p) => [...p, name])
    setPlayerInput('')
  }

  function removePlayer(index: number) {
    setPlayers((arr) => arr.filter((_, i) => i !== index))
  }

  function quickFill() {
    setPlayers(shuffle(sampleNames))
  }

  const numbers = useMemo<number[]>(() => shuffle([...Array(players.length)].map((_, i) => i + 1)), [players.length, showResults])
  const cards = useMemo(
    () => players.map((name, i) => ({ name, number: numbers[i] ?? i + 1 })).sort((a, b) => a.number - b.number),
    [players, numbers]
  )
  const rounds = useMemo<Match[][]>(() => (showResults ? generateMatches(players) : []), [showResults, players])

  function openSettings() {
    setSettingsNames(sampleNames)
    setSettingsOpen(true)
  }
  function closeSettings() {
    setSettingsOpen(false)
  }
  function openTheme() {
    setThemeOpen(true)
  }
  function closeTheme() {
    setThemeOpen(false)
  }
  async function saveSettings() {
    await saveSampleNames(settingsNames, { replaceAll: true })
    setSettingsOpen(false)
  }

  function handleAddSampleName() {
    const name = newSampleName.trim();
    if (name && !settingsNames.includes(name)) {
      setSettingsNames([...settingsNames, name]);
      setNewSampleName('');
    }
  }

  function handleRemoveSampleName(index: number) {
    setSettingsNames(settingsNames.filter((_, i) => i !== index));
  }

  return (
    <div data-theme={selectedTheme.id} className={`min-h-screen bg-[var(--bg)] text-[var(--fg)]`}>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-center flex-1">padel matches</h1>
          <div className="flex items-center">
            <button
              onClick={openTheme}
              className={`ml-4 text-sm bg-surface hover:bg-opacity-80 py-2 px-3 rounded transition-colors`}
            >
              Theme
            </button>
            <button
              onClick={openSettings}
              className={`ml-2 text-sm bg-surface hover:bg-opacity-80 py-2 px-3 rounded transition-colors`}
            >
              Settings
            </button>
          </div>
        </div>

        <div className="mb-16">
          <div className={`max-w-md mx-auto bg-surface p-6 rounded-lg shadow-lg mb-8`}>
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
              <button type="submit" className={`bg-primary bg-primary-hover py-2 px-4 rounded-lg text-[var(--primary-contrast)] font-semibold transition-colors`}>
                Add
              </button>
            </form>

            <div className="space-y-2">
              {players.map((p, i) => (
                <div
                  key={`${p}-${i}`}
                  className={`flex items-center justify-between bg-surface p-3 rounded-lg`}
                >
                  <span className="font-semibold">{p}</span>
                  <button
                    onClick={() => removePlayer(i)}
                    className="text-red-500 hover:text-red-400"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>

            {players.length > 0 && (
              <button
                onClick={() => setShowResults(true)}
                className={`w-full bg-primary bg-primary-hover text-[var(--primary-contrast)] py-2 px-4 rounded transition-colors mt-4`}
              >
                Finish & Generate Matches
              </button>
            )}
          </div>

          {showResults && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mt-8">
                {cards.map((c) => (
                  <div key={`${c.name}-${c.number}`} className={`bg-surface-2 p-5 rounded-lg border border-token text-center`}>
                    <h3 className="text-xl font-bold mb-2">{c.name}</h3>
                    <div className={`text-3xl font-bold text-accent`}>{c.number}</div>
                  </div>
                ))}
              </div>

              <hr className="border-t border-token my-12" />

              <div className={`bg-[var(--bg)] rounded-xl p-8`}>
                <div>
                  <h2 className={`text-2xl font-bold mb-6 text-fg`}>Match Schedule</h2>
                  <div className="space-y-8">
                    {rounds.map((round, roundIndex) => (
                      <div key={roundIndex} className={`bg-surface p-5 rounded-lg border border-token`}>
                        <h3 className={`text-xl font-bold mb-4 text-fg`}>Round {roundIndex + 1}</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {round.map((match, i) => (
                            <div
                              key={i}
                              className={`bg-surface-2 p-4 rounded-lg border border-token hover:bg-opacity-80 transition-colors`}
                            >
                              <div className={`text-fg text-sm font-semibold mb-3 border-b border-token pb-2`}>
                                Court {i + 1}
                              </div>
                              <div className="flex items-center justify-between gap-4">
                                <div className="w-5/12">
                                  <div className="flex items-center gap-2 mb-2">
                                    <span className={`inline-flex items-center justify-center bg-primary text-[var(--primary-contrast)] w-6 h-6 rounded-full text-xs font-bold`}>
                                      {match.team1[0].number}
                                    </span>
                                    <span className={`text-fg truncate`}>{match.team1[0].name}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className={`inline-flex items-center justify-center bg-primary text-[var(--primary-contrast)] w-6 h-6 rounded-full text-xs font-bold`}>
                                      {match.team1[1].number}
                                    </span>
                                    <span className={`text-fg truncate`}>{match.team1[1].name}</span>
                                  </div>
                                </div>
                                <div className="w-5/12 text-right">
                                  <div className="flex items-center gap-2 justify-end mb-2">
                                    <span className={`text-fg truncate`}>{match.team2[0].name}</span>
                                    <span className={`inline-flex items-center justify-center bg-primary text-[var(--primary-contrast)] w-6 h-6 rounded-full text-xs font-bold`}>
                                      {match.team2[0].number}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2 justify-end">
                                    <span className={`text-fg truncate`}>{match.team2[1].name}</span>
                                    <span className={`inline-flex items-center justify-center bg-primary text-[var(--primary-contrast)] w-6 h-6 rounded-full text-xs font-bold`}>
                                      {match.team2[1].number}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {settingsOpen && (
        <div className={`fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center p-4 z-50 ${settingsOpen ? 'settings-sheet-open' : ''}`} onClick={closeSettings}>
          <div
            className={`settings-sheet bg-surface w-full max-w-xl rounded-t-lg sm:rounded-lg shadow-xl transform transition-transform duration-300 ease-in-out translate-y-full sm:translate-y-0`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`flex items-center justify-between p-4 border-b border-token`}>
              <h3 className="text-lg font-semibold">Settings — Sample Names</h3>
              <button onClick={closeSettings} className={`text-fg hover:opacity-80`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newSampleName}
                  onChange={(e) => setNewSampleName(e.target.value)}
                  className={`flex-grow p-2 rounded bg-surface text-fg focus:outline-none focus:ring-2 focus:ring-[var(--ring)] resize-none`}

                  placeholder="Add a new name"
                />
                <button
                  onClick={handleAddSampleName}
                  className="bg-primary bg-primary-hover py-2 px-4 rounded-lg text-[var(--primary-contrast)] font-semibold transition-colors"
                >
                  Add
                </button>
              </div>
              <div className={`h-60 overflow-y-auto border border-token rounded-lg`}>
                <table className="w-full text-left">
                  <tbody className={`divide-y divide-[var(--border)]`}>
                    {settingsNames.map((name, index) => (
                      <tr key={index}>
                        <td className="p-3">{name}</td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => handleRemoveSampleName(index)}
                            className="text-red-500 hover:text-red-400"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="p-4 flex items-center justify-end gap-4 border-t border-token">
              <button onClick={closeSettings} className={`bg-surface hover:bg-opacity-80 py-2 px-4 rounded-lg text-fg font-semibold transition-colors`}>
                Cancel
              </button>
              <button onClick={saveSettings} className={`bg-primary bg-primary-hover py-2 px-4 rounded-lg text-[var(--primary-contrast)] font-semibold transition-colors`}>
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {themeOpen && (
        <div className={`fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center p-4 z-50 ${themeOpen ? 'settings-sheet-open' : ''}`} onClick={closeTheme}>
          <div
            className={`settings-sheet bg-surface w-full max-w-md rounded-t-lg sm:rounded-lg shadow-xl transform transition-transform duration-300 ease-in-out translate-y-full sm:translate-y-0`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`flex items-center justify-between p-4 border-b border-token`}>
              <h3 className="text-lg font-semibold">Theme</h3>
              <button onClick={closeTheme} className={`text-fg hover:opacity-80`}>
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
                      selectedTheme.name === theme.name
                        ? 'ring-2 ring-[var(--ring)]'
                        : 'bg-surface hover:bg-opacity-80'
                    }`}
                    aria-pressed={selectedTheme.name === theme.name}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <span
                        className="inline-block w-4 h-4 rounded-full border"
                        style={{ backgroundColor: theme.swatch, borderColor: 'var(--border)' }}
                      />
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
  )
}
