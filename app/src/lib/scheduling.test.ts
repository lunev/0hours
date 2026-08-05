import { describe, expect, it } from "vitest";
import type { Settings } from "@/types";
import {
  CHIME_DRIFT_THRESHOLD_MS,
  getDisplayHour,
  getSecondsToNextHour,
  isChimeDrifted,
  isQuietNow,
  shouldPlayChime,
} from "./scheduling";

describe("getSecondsToNextHour", () => {
  it("returns a full hour right on the hour mark", () => {
    expect(getSecondsToNextHour(new Date(2026, 0, 1, 14, 0, 0))).toBe(3600);
  });

  it("returns the remaining time mid-hour", () => {
    expect(getSecondsToNextHour(new Date(2026, 0, 1, 14, 30, 0))).toBe(1800);
  });

  it("returns 1 second right before the hour rolls over", () => {
    expect(getSecondsToNextHour(new Date(2026, 0, 1, 14, 59, 59))).toBe(1);
  });
});

describe("isChimeDrifted", () => {
  const scheduled = 1_000_000;

  it("is not drifted when fired exactly on schedule", () => {
    expect(isChimeDrifted(scheduled, scheduled)).toBe(false);
  });

  it("is not drifted just under the threshold", () => {
    expect(isChimeDrifted(scheduled, scheduled + CHIME_DRIFT_THRESHOLD_MS - 1)).toBe(false);
  });

  it("is not drifted exactly at the threshold", () => {
    expect(isChimeDrifted(scheduled, scheduled + CHIME_DRIFT_THRESHOLD_MS)).toBe(false);
  });

  it("is drifted just past the threshold", () => {
    expect(isChimeDrifted(scheduled, scheduled + CHIME_DRIFT_THRESHOLD_MS + 1)).toBe(true);
  });

  it("is drifted when the alarm fires early by more than the threshold", () => {
    expect(isChimeDrifted(scheduled, scheduled - CHIME_DRIFT_THRESHOLD_MS - 1)).toBe(true);
  });
});

describe("getDisplayHour", () => {
  it("maps midnight (0) to 12", () => {
    expect(getDisplayHour(0)).toBe(12);
  });

  it("maps noon (12) to 12", () => {
    expect(getDisplayHour(12)).toBe(12);
  });

  it("maps afternoon hours to their 12-hour equivalent", () => {
    expect(getDisplayHour(13)).toBe(1);
    expect(getDisplayHour(23)).toBe(11);
  });

  it("leaves morning hours unchanged", () => {
    expect(getDisplayHour(1)).toBe(1);
    expect(getDisplayHour(11)).toBe(11);
  });
});

describe("isQuietNow", () => {
  describe("standard interval (start before end)", () => {
    const start = "10:00";
    const end = "18:00";

    it("is quiet inside the interval", () => {
      expect(isQuietNow(start, end, new Date(2026, 0, 1, 12, 0))).toBe(true);
    });

    it("is quiet exactly at the start boundary", () => {
      expect(isQuietNow(start, end, new Date(2026, 0, 1, 10, 0))).toBe(true);
    });

    it("is not quiet exactly at the end boundary", () => {
      expect(isQuietNow(start, end, new Date(2026, 0, 1, 18, 0))).toBe(false);
    });

    it("is not quiet before the interval", () => {
      expect(isQuietNow(start, end, new Date(2026, 0, 1, 9, 59))).toBe(false);
    });

    it("is not quiet after the interval", () => {
      expect(isQuietNow(start, end, new Date(2026, 0, 1, 18, 1))).toBe(false);
    });
  });

  describe("overnight interval (start after end)", () => {
    const start = "22:00";
    const end = "08:00";

    it("is quiet late at night", () => {
      expect(isQuietNow(start, end, new Date(2026, 0, 1, 23, 0))).toBe(true);
    });

    it("is quiet early in the morning", () => {
      expect(isQuietNow(start, end, new Date(2026, 0, 1, 5, 0))).toBe(true);
    });

    it("is not quiet during the day", () => {
      expect(isQuietNow(start, end, new Date(2026, 0, 1, 12, 0))).toBe(false);
    });

    it("is quiet exactly at the start boundary", () => {
      expect(isQuietNow(start, end, new Date(2026, 0, 1, 22, 0))).toBe(true);
    });

    it("is not quiet exactly at the end boundary", () => {
      expect(isQuietNow(start, end, new Date(2026, 0, 1, 8, 0))).toBe(false);
    });
  });
});

describe("shouldPlayChime", () => {
  const baseSettings: Settings = {
    active: true,
    language: "en",
    volume: 100,
    quietHours: { enabled: false, start: "22:00", end: "08:00" },
  };
  const now = new Date(2026, 0, 1, 14, 0, 0);
  const scheduledTime = now.getTime();

  it("plays when active, on schedule, and quiet hours are off", () => {
    expect(shouldPlayChime(baseSettings, scheduledTime, now)).toBe(true);
  });

  it("does not play when settings are missing (not yet loaded)", () => {
    expect(shouldPlayChime(null, scheduledTime, now)).toBe(false);
  });

  it("does not play when the extension is turned off", () => {
    expect(shouldPlayChime({ ...baseSettings, active: false }, scheduledTime, now)).toBe(false);
  });

  it("does not play when the alarm fired too late (drift)", () => {
    const lateNow = new Date(scheduledTime + CHIME_DRIFT_THRESHOLD_MS + 1);
    expect(shouldPlayChime(baseSettings, scheduledTime, lateNow)).toBe(false);
  });

  it("does not play during enabled quiet hours", () => {
    const quietNight = new Date(2026, 0, 1, 23, 0, 0);
    const settings: Settings = {
      ...baseSettings,
      quietHours: { enabled: true, start: "22:00", end: "08:00" },
    };
    expect(shouldPlayChime(settings, quietNight.getTime(), quietNight)).toBe(false);
  });

  it("plays outside quiet hours even when quiet hours are enabled", () => {
    const settings: Settings = {
      ...baseSettings,
      quietHours: { enabled: true, start: "22:00", end: "08:00" },
    };
    expect(shouldPlayChime(settings, scheduledTime, now)).toBe(true);
  });

  it("ignores quiet hours window when quiet hours are disabled", () => {
    const quietNight = new Date(2026, 0, 1, 23, 0, 0);
    expect(shouldPlayChime(baseSettings, quietNight.getTime(), quietNight)).toBe(true);
  });
});
