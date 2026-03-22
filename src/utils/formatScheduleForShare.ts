import type { Match, PlayerNum } from "../types";

const TITLE_SEPARATOR = "─".repeat(20);

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

function formatTeam(cards: PlayerNum[], team: [PlayerNum, PlayerNum]): string {
  return `${formatPlayer(cards, team[0])} · ${formatPlayer(cards, team[1])}`;
}

export function formatScheduleForShare(rounds: Match[][], cards: PlayerNum[], courtLabels?: string[]): string {
  const lines: string[] = ["Padel match schedule", TITLE_SEPARATOR, ""];
  rounds.forEach((round, roundIndex) => {
    lines.push(`*Round ${roundIndex + 1}*`, "");
    round.forEach((match, courtIndex) => {
      lines.push(courtLineLabel(courtIndex, courtLabels));
      lines.push(formatTeam(cards, match.team1));
      lines.push("    vs");
      lines.push(formatTeam(cards, match.team2));
      if (courtIndex < round.length - 1) lines.push("");
    });
    lines.push("");
  });
  return lines.join("\n").trimEnd();
}
