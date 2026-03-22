export type PlayerNum = { name: string; number: number | "-" };
export type Match = { team1: [PlayerNum, PlayerNum]; team2: [PlayerNum, PlayerNum] };
export type CourtSetup = { id: string; label: string; courts: string[] };
