import { describe, expect, it } from "vitest";
import { formatElapsedMs } from "@/utils/formatElapsed";

describe("formatElapsedMs", () => {
  it("formats sub-minute times with tenths", () => {
    expect(formatElapsedMs(4500)).toBe("4.5s");
    expect(formatElapsedMs(0)).toBe("0.0s");
  });

  it("formats minute times", () => {
    expect(formatElapsedMs(125_400)).toBe("2:05.4");
  });
});
