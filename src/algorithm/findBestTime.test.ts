import { describe, expect, it } from "vitest";
import { findBestTime } from "./findBestTime.js";

const makeRange = (startIso: string, slots: number): Date[] => {
  const start = new Date(startIso).getTime();
  return Array.from({ length: slots }, (_, i) => new Date(start + i * 15 * 60 * 1000));
};

describe("findBestTime", () => {
  it("finds normal overlap", () => {
    const rangeStart = new Date("2026-02-20T10:00:00.000Z");
    const rangeEnd = new Date("2026-02-20T12:00:00.000Z");
    const base = makeRange("2026-02-20T10:00:00.000Z", 8);

    const result = findBestTime({
      rangeStart,
      rangeEnd,
      durationMinutes: 60,
      participants: [{ id: "a" }, { id: "b" }, { id: "c" }],
      slotsByParticipant: new Map([
        ["a", base.slice(0, 6)],
        ["b", base.slice(2, 8)],
        ["c", base.slice(2, 6)],
      ]),
    });

    expect(result).not.toBeNull();
    expect(result?.startTime.toISOString()).toBe("2026-02-20T10:30:00.000Z");
    expect(result?.count).toBe(3);
  });

  it("returns null when zero overlap exists", () => {
    const base = makeRange("2026-02-20T10:00:00.000Z", 8);
    const result = findBestTime({
      rangeStart: new Date("2026-02-20T10:00:00.000Z"),
      rangeEnd: new Date("2026-02-20T12:00:00.000Z"),
      durationMinutes: 60,
      participants: [{ id: "a" }, { id: "b" }],
      slotsByParticipant: new Map([
        ["a", base.slice(0, 2)],
        ["b", base.slice(6, 8)],
      ]),
    });

    expect(result).toBeNull();
  });

  it("supports single participant response", () => {
    const base = makeRange("2026-02-20T10:00:00.000Z", 8);
    const result = findBestTime({
      rangeStart: new Date("2026-02-20T10:00:00.000Z"),
      rangeEnd: new Date("2026-02-20T12:00:00.000Z"),
      durationMinutes: 30,
      participants: [{ id: "a" }, { id: "b" }],
      slotsByParticipant: new Map([
        ["a", base.slice(0, 4)],
        ["b", []],
      ]),
    });

    expect(result?.count).toBe(1);
    expect(result?.participantIds).toEqual(["a"]);
  });

  it("returns null when duration exceeds available window", () => {
    const result = findBestTime({
      rangeStart: new Date("2026-02-20T10:00:00.000Z"),
      rangeEnd: new Date("2026-02-20T11:00:00.000Z"),
      durationMinutes: 120,
      participants: [{ id: "a" }],
      slotsByParticipant: new Map([["a", makeRange("2026-02-20T10:00:00.000Z", 4)]]),
    });

    expect(result).toBeNull();
  });

  it("uses earliest slot as tie-breaker", () => {
    const base = makeRange("2026-02-20T10:00:00.000Z", 8);
    const result = findBestTime({
      rangeStart: new Date("2026-02-20T10:00:00.000Z"),
      rangeEnd: new Date("2026-02-20T12:00:00.000Z"),
      durationMinutes: 30,
      participants: [{ id: "a" }, { id: "b" }],
      slotsByParticipant: new Map([
        ["a", base.slice(0, 8)],
        ["b", base.slice(0, 8)],
      ]),
    });

    expect(result?.startTime.toISOString()).toBe("2026-02-20T10:00:00.000Z");
    expect(result?.count).toBe(2);
  });
});
