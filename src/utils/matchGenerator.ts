import { PlayerNum, Match } from '../types'

export function shuffle<T>(array: T[]): T[] {
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const tmp = arr[i]!
    arr[i] = arr[j]!
    arr[j] = tmp
  }
  return arr
}

export function generateMatches(players: string[]): Match[][] {
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
