import { describe, expect, it } from "vitest";
import type { Match, PlayerNum } from "../types";
import { formatScheduleForShare } from "./formatScheduleForShare";

const cards: PlayerNum[] = [
  { name: "Alice", number: 3 },
  { name: "Bob", number: 7 },
  { name: "Carol", number: 2 },
  { name: "Dan", number: 5 },
];

const rounds: Match[][] = [
  [
    {
      team1: [
        { name: "Alice", number: 1 },
        { name: "Bob", number: 2 },
      ],
      team2: [
        { name: "Carol", number: 3 },
        { name: "Dan", number: 4 },
      ],
    },
  ],
];

describe("formatScheduleForShare", () => {
  it("uses shirt numbers from cards, not match roster indices", () => {
    const text = formatScheduleForShare(rounds, cards);
    expect(text).toContain("Alice (3)");
    expect(text).toContain("Bob (7)");
    expect(text).toContain("Carol (2)");
    expect(text).toContain("Dan (5)");
    expect(text).toContain("*Round 1*");
    expect(text).toContain("Court 1");
    expect(text).toMatch(/\nCourt 1\n/);
    expect(text).toContain("    vs");
    expect(text).toContain("Padel match schedule");
    expect(text).toContain("─".repeat(20));
  });

  it("uses custom court labels when provided", () => {
    const text = formatScheduleForShare(rounds, cards, ["Center court"]);
    expect(text).toContain("Center court");
    expect(text).toMatch(/\nCenter court\n/);
    expect(text).not.toContain("Court 1");
  });
});
