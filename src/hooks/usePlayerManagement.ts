import { useState } from 'react'
import { shuffle } from '../utils/matchGenerator'

export function usePlayerManagement(sampleNames: string[]) {
  const [players, setPlayers] = useState<string[]>([])
  const [playerInput, setPlayerInput] = useState<string>('')
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

  return {
    players,
    setPlayers,
    playerInput,
    setPlayerInput,
    maxPlayers,
    handleAddPlayer,
    removePlayer,
    quickFill,
  }
}
