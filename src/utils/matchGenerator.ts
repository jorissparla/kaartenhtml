import { PlayerNum, Match } from "../types";

export function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = arr[i]!;
    arr[i] = arr[j]!;
    arr[j] = tmp;
  }
  return arr;
}

/** Player count including a dummy when the roster is odd (same rule as inside generateMatches). */
export function effectivePlayerCountForCourts(players: number): number {
  return players + (players % 2 === 1 ? 1 : 0);
}

export function defaultNumCourts(players: number): number {
  return effectivePlayerCountForCourts(players) >= 12 ? 3 : 2;
}

export function autoCourtLabels(numCourts: number): string[] {
  return Array.from({ length: numCourts }, (_, i) => `Court ${i + 1}`);
}

export function generateMatches(players: string[], numCourts: number): Match[][] {
  const rounds: Match[][] = [];
  const playerNumbers: PlayerNum[] = players.map((player, index) => ({ name: player, number: index + 1 }));
  if (playerNumbers.length % 2 !== 0) playerNumbers.push({ name: "Dummy", number: "-" });
  const cap = Math.max(1, numCourts);
  for (let round = 0; round < 3; round++) {
    const matches: Match[] = [];
    const available = [...playerNumbers];
    let courtCount = 0;
    while (available.length >= 4 && courtCount < cap) {
      const team1: [PlayerNum, PlayerNum] = [
        available.splice(Math.floor(Math.random() * available.length), 1)[0]!,
        available.splice(Math.floor(Math.random() * available.length), 1)[0]!,
      ];
      const team2: [PlayerNum, PlayerNum] = [
        available.splice(Math.floor(Math.random() * available.length), 1)[0]!,
        available.splice(Math.floor(Math.random() * available.length), 1)[0]!,
      ];
      matches.push({ team1, team2 });
      courtCount++;
    }
    rounds.push(matches);
  }
  return rounds;
}
