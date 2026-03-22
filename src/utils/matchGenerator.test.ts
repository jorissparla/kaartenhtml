import { describe, expect, it } from "vitest";
import { defaultNumCourts, effectivePlayerCountForCourts, generateMatches } from "./matchGenerator";

describe("defaultNumCourts", () => {
  it("uses 2 courts below 12 effective players", () => {
    expect(defaultNumCourts(8)).toBe(2);
    expect(defaultNumCourts(10)).toBe(2);
    expect(defaultNumCourts(11)).toBe(3);
  });
  it("uses 3 courts at 12+ effective players", () => {
    expect(defaultNumCourts(12)).toBe(3);
    expect(defaultNumCourts(16)).toBe(3);
  });
});

describe("effectivePlayerCountForCourts", () => {
  it("adds one for odd player counts", () => {
    expect(effectivePlayerCountForCourts(11)).toBe(12);
    expect(effectivePlayerCountForCourts(10)).toBe(10);
  });
});

describe("generateMatches", () => {
  it("respects numCourts cap", () => {
    const players = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];
    const withOneCourt = generateMatches(players, 1);
    expect(withOneCourt.every((r) => r.length <= 1)).toBe(true);
    const withFour = generateMatches(players, 4);
    expect(withFour.every((r) => r.length <= 4)).toBe(true);
    expect(withFour[0]!.length).toBe(3);
  });
});
