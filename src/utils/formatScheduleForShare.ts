import type { Match, PlayerNum } from "../types";

function formatPlayer(cards: PlayerNum[], p: PlayerNum): string {
  const card = cards.find((c) => c.name === p.name);
  const n = card?.number ?? p.number;
  return `${p.name} (${n})`;
}

function courtLineLabel(courtIndex: number, courtLabels?: string[]): string {
  const custom = courtLabels?.[courtIndex];
  if (custom) return custom;
  return `Court ${courtIndex + 1}`;
}

export function formatScheduleForShare(rounds: Match[][], cards: PlayerNum[], courtLabels?: string[]): string {
  const lines: string[] = ["Padel match schedule", ""];
  rounds.forEach((round, roundIndex) => {
    lines.push(`Round ${roundIndex + 1}`);
    round.forEach((match, courtIndex) => {
      const t1 = `${formatPlayer(cards, match.team1[0])} & ${formatPlayer(cards, match.team1[1])}`;
      const t2 = `${formatPlayer(cards, match.team2[0])} & ${formatPlayer(cards, match.team2[1])}`;
      lines.push(`  ${courtLineLabel(courtIndex, courtLabels)}: ${t1} vs ${t2}`);
    });
    lines.push("");
  });
  return lines.join("\n").trimEnd();
}
