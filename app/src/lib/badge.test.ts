import { afterEach, describe, expect, it, vi } from "vitest";
import type { Settings } from "@/types";
import { BADGE_TEXT, BADGE_TITLE } from "@/config";
import { getBadgeAppearance, updateChimeBadge } from "./badge";

describe("getBadgeAppearance", () => {
  it("shows no badge when off", () => {
    expect(getBadgeAppearance("off")).toEqual({
      text: BADGE_TEXT.off,
      title: BADGE_TITLE.off,
    });
  });

  it("shows no badge when chiming normally", () => {
    expect(getBadgeAppearance("chiming")).toEqual({
      text: BADGE_TEXT.chiming,
      title: BADGE_TITLE.chiming,
    });
  });

  it("shows the moon badge during quiet hours", () => {
    expect(getBadgeAppearance("quiet-hours")).toEqual({
      text: BADGE_TEXT["quiet-hours"],
      title: BADGE_TITLE["quiet-hours"],
    });
  });

  it("shows the muted-page badge with its own tooltip, same look as quiet hours", () => {
    const appearance = getBadgeAppearance("muted-page");
    expect(appearance).toEqual({
      text: BADGE_TEXT["muted-page"],
      title: BADGE_TITLE["muted-page"],
    });
    // Both muted states intentionally share one badge look; the tooltip is
    // the only thing that tells them apart.
    expect(appearance.title).not.toBe(getBadgeAppearance("quiet-hours").title);
  });
});

describe("updateChimeBadge", () => {
  const chromeActionMock = {
    setBadgeText: vi.fn().mockResolvedValue(undefined),
    setTitle: vi.fn().mockResolvedValue(undefined),
  };

  vi.stubGlobal("chrome", { action: chromeActionMock });

  afterEach(() => {
    vi.clearAllMocks();
  });

  const baseSettings: Settings = {
    active: true,
    language: "en",
    volume: 100,
    quietHours: { enabled: false, start: "22:00", end: "08:00" },
    mutedPages: { enabled: false, patterns: [] },
  };
  const now = new Date(2026, 0, 1, 14, 0, 0);

  it("applies the 'off' appearance when settings are missing", async () => {
    await updateChimeBadge(null, undefined, now);

    expect(chromeActionMock.setBadgeText).toHaveBeenCalledWith({ text: BADGE_TEXT.off });
    expect(chromeActionMock.setTitle).toHaveBeenCalledWith({ title: BADGE_TITLE.off });
  });

  it("applies the 'chiming' appearance when nothing mutes the chime", async () => {
    await updateChimeBadge(baseSettings, undefined, now);

    expect(chromeActionMock.setBadgeText).toHaveBeenCalledWith({ text: BADGE_TEXT.chiming });
    expect(chromeActionMock.setTitle).toHaveBeenCalledWith({ title: BADGE_TITLE.chiming });
  });

  it("applies the 'quiet-hours' appearance during the quiet hours window", async () => {
    const settings: Settings = {
      ...baseSettings,
      quietHours: { enabled: true, start: "22:00", end: "08:00" },
    };
    const quietNight = new Date(2026, 0, 1, 23, 0, 0);

    await updateChimeBadge(settings, undefined, quietNight);

    expect(chromeActionMock.setBadgeText).toHaveBeenCalledWith({ text: BADGE_TEXT["quiet-hours"] });
    expect(chromeActionMock.setTitle).toHaveBeenCalledWith({ title: BADGE_TITLE["quiet-hours"] });
  });

  it("applies the 'muted-page' appearance when the active tab matches a muted page", async () => {
    const settings: Settings = {
      ...baseSettings,
      mutedPages: { enabled: true, patterns: ["example.com"] },
    };

    await updateChimeBadge(settings, "https://example.com/page", now);

    expect(chromeActionMock.setBadgeText).toHaveBeenCalledWith({ text: BADGE_TEXT["muted-page"] });
    expect(chromeActionMock.setTitle).toHaveBeenCalledWith({ title: BADGE_TITLE["muted-page"] });
  });
});
