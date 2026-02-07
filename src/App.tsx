import React, { useMemo, useState } from 'react'
import { Toaster } from 'react-hot-toast';
import { PlayerNum, Match } from './types';
import { shuffle, generateMatches } from './utils/matchGenerator';
import { useTheme } from './hooks/useTheme';
import { useSampleNames } from './hooks/useSampleNames';
import { usePlayerManagement } from './hooks/usePlayerManagement';
import Header from './components/Header';
import SettingsModal from './components/SettingsModal';
import ThemeModal from './components/ThemeModal';
import PlayerForm from './components/PlayerForm';
import PlayerList from './components/PlayerList';

export default function App() {
  const [showResults, setShowResults] = useState<boolean>(false)
  const [settingsOpen, setSettingsOpen] = useState<boolean>(false)
  const { selectedTheme, setSelectedTheme, themeOpen, openTheme, closeTheme } = useTheme();
  const { sampleNames, saveSampleNames } = useSampleNames();
  const { players, playerInput, setPlayerInput, maxPlayers, handleAddPlayer, removePlayer, quickFill } = usePlayerManagement(sampleNames);

  const numbers = useMemo<number[]>(() => shuffle([...Array(players.length)].map((_, i) => i + 1)), [players.length, showResults])
  const cards = useMemo(
    () => players.map((name, i) => ({ name, number: numbers[i] ?? i + 1 })).sort((a, b) => a.number - b.number),
    [players, numbers]
  )
  const rounds = useMemo<Match[][]>(() => (showResults ? generateMatches(players) : []), [showResults, players])

  function openSettings() {
    setSettingsOpen(true)
  }
  function closeSettings() {
    setSettingsOpen(false)
  }

  return (
    <div data-theme={selectedTheme.id} className={`min-h-screen bg-[var(--bg)] text-[var(--fg)]`}>
      <Toaster />
      <div className="container mx-auto px-4 py-8">
        <Header onOpenTheme={openTheme} onOpenSettings={openSettings} />

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

            <PlayerForm
              playerInput={playerInput}
              setPlayerInput={setPlayerInput}
              handleAddPlayer={handleAddPlayer}
            />

            <PlayerList players={players} onRemovePlayer={removePlayer} />

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

      <SettingsModal
        isOpen={settingsOpen}
        onClose={closeSettings}
        sampleNames={sampleNames}
        saveSampleNames={saveSampleNames}
      />

      <ThemeModal
        isOpen={themeOpen}
        onClose={closeTheme}
        selectedTheme={selectedTheme}
        setSelectedTheme={setSelectedTheme}
      />
    </div>
  )
}
