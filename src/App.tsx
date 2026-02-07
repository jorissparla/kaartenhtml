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
import PlayerCards from './components/PlayerCards';
import MatchSchedule from './components/MatchSchedule';

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

  return (
    <div data-theme={selectedTheme.id} className={`min-h-screen bg-[var(--bg)] text-[var(--fg)]`}>
      <Toaster />
      <div className="container mx-auto px-4 py-8">
        <Header onOpenTheme={openTheme} onOpenSettings={() => setSettingsOpen(true)} />

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
              <PlayerCards cards={cards} />

              <hr className="border-t border-token my-12" />

              <MatchSchedule rounds={rounds} />
            </>
          )}
        </div>
      </div>

      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
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
