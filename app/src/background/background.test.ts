import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import type { Settings } from "@/types";
import { BADGE_TEXT, BADGE_TITLE } from "@/config";

const chromeMock = {
  alarms: {
    clear: vi.fn().mockResolvedValue(true),
    create: vi.fn(),
    onAlarm: { addListener: vi.fn() },
  },
  tabs: {
    query: vi.fn().mockResolvedValue([]),
    onActivated: { addListener: vi.fn() },
    onUpdated: { addListener: vi.fn() },
  },
  runtime: {
    onInstalled: { addListener: vi.fn() },
    onStartup: { addListener: vi.fn() },
    sendMessage: vi.fn(),
    getContexts: vi.fn().mockResolvedValue([]),
    ContextType: { OFFSCREEN_DOCUMENT: "OFFSCREEN_DOCUMENT" },
  },
  offscreen: {
    createDocument: vi.fn().mockResolvedValue(undefined),
    Reason: { AUDIO_PLAYBACK: "AUDIO_PLAYBACK" },
  },
  storage: {
    local: {
      get: vi.fn().mockResolvedValue({}),
      set: vi.fn().mockResolvedValue(undefined),
      remove: vi.fn().mockResolvedValue(undefined),
    },
    onChanged: { addListener: vi.fn() },
  },
  action: {
    setBadgeText: vi.fn().mockResolvedValue(undefined),
    setTitle: vi.fn().mockResolvedValue(undefined),
  },
};

vi.stubGlobal("chrome", chromeMock);

const baseSettings: Settings = {
  active: true,
  language: "en",
  volume: 100,
  quietHours: { enabled: false, start: "22:00", end: "08:00" },
  mutedPages: { enabled: false, patterns: [] },
};

const getListener = <T extends (...args: never[]) => unknown>(mockFn: { mock: { calls: T[][] } }) =>
  mockFn.mock.calls[0][0];

// Captured once, right after the module registers its listeners against the
// mock — `vi.clearAllMocks()` in afterEach wipes `addListener`'s recorded
// calls too, so re-deriving these from mock.calls later would break.
let onInstalled: (details: { reason: string }) => unknown;
let onStartup: () => unknown;
let onActivated: (info: { tabId: number; windowId: number }) => unknown;
let onUpdated: (
  tabId: number,
  changeInfo: chrome.tabs.OnUpdatedInfo,
  tab: chrome.tabs.Tab,
) => unknown;
let onAlarm: (alarm: chrome.alarms.Alarm) => unknown;
let onStorageChanged: (
  changes: Record<string, chrome.storage.StorageChange>,
  areaName: string,
) => unknown;

beforeAll(async () => {
  await import("./background");

  onInstalled = getListener(chromeMock.runtime.onInstalled.addListener);
  onStartup = getListener(chromeMock.runtime.onStartup.addListener);
  onActivated = getListener(chromeMock.tabs.onActivated.addListener);
  onUpdated = getListener(chromeMock.tabs.onUpdated.addListener);
  onAlarm = getListener(chromeMock.alarms.onAlarm.addListener);
  onStorageChanged = getListener(chromeMock.storage.onChanged.addListener);
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("onInstalled / onStartup", () => {
  it("schedules the badge tick alarm and applies an initial badge on install", async () => {
    chromeMock.storage.local.get.mockResolvedValue({ settings: baseSettings });

    await onInstalled({ reason: "install" });

    expect(chromeMock.alarms.create).toHaveBeenCalledWith("badgeTick", { periodInMinutes: 1 });
    await vi.waitFor(() => {
      expect(chromeMock.action.setBadgeText).toHaveBeenCalledWith({ text: BADGE_TEXT.chiming });
      expect(chromeMock.action.setTitle).toHaveBeenCalledWith({ title: BADGE_TITLE.chiming });
    });
  });

  it("schedules the badge tick alarm and applies an initial badge on startup", async () => {
    chromeMock.storage.local.get.mockResolvedValue({ settings: baseSettings });

    await onStartup();

    expect(chromeMock.alarms.create).toHaveBeenCalledWith("badgeTick", { periodInMinutes: 1 });
    await vi.waitFor(() => {
      expect(chromeMock.action.setTitle).toHaveBeenCalledWith({ title: BADGE_TITLE.chiming });
    });
  });
});

describe("tabs.onActivated", () => {
  it("refreshes the badge when the active tab changes", async () => {
    chromeMock.storage.local.get.mockResolvedValue({
      settings: {
        ...baseSettings,
        quietHours: { enabled: true, start: "00:00", end: "23:59" },
      },
    });

    await onActivated({ tabId: 1, windowId: 1 });

    await vi.waitFor(() => {
      expect(chromeMock.action.setBadgeText).toHaveBeenCalledWith({
        text: BADGE_TEXT["quiet-hours"],
      });
    });
  });
});

describe("tabs.onUpdated", () => {
  it("refreshes the badge when the active tab's URL changes", async () => {
    chromeMock.storage.local.get.mockResolvedValue({
      settings: {
        ...baseSettings,
        mutedPages: { enabled: true, patterns: ["example.com"] },
      },
    });
    chromeMock.tabs.query.mockResolvedValue([{ url: "https://example.com/page", active: true }]);

    await onUpdated(1, { url: "https://example.com/page" }, { active: true } as chrome.tabs.Tab);

    await vi.waitFor(() => {
      expect(chromeMock.action.setBadgeText).toHaveBeenCalledWith({
        text: BADGE_TEXT["muted-page"],
      });
    });
  });

  it("ignores updates to background tabs", async () => {
    await onUpdated(1, { url: "https://example.com/page" }, { active: false } as chrome.tabs.Tab);

    expect(chromeMock.action.setBadgeText).not.toHaveBeenCalled();
  });

  it("ignores updates that don't change the URL", async () => {
    await onUpdated(1, { status: "complete" }, { active: true } as chrome.tabs.Tab);

    expect(chromeMock.action.setBadgeText).not.toHaveBeenCalled();
  });
});

describe("alarms.onAlarm", () => {
  it("refreshes the badge when the badgeTick alarm fires", async () => {
    chromeMock.storage.local.get.mockResolvedValue({
      settings: { ...baseSettings, active: false },
    });

    await onAlarm({ name: "badgeTick", scheduledTime: Date.now() });

    expect(chromeMock.action.setBadgeText).toHaveBeenCalledWith({ text: BADGE_TEXT.off });
    expect(chromeMock.action.setTitle).toHaveBeenCalledWith({ title: BADGE_TITLE.off });
  });

  it("does not touch the badge when the hourlyChime alarm fires", async () => {
    chromeMock.storage.local.get.mockResolvedValue({ settings: baseSettings });

    await onAlarm({ name: "hourlyChime", scheduledTime: Date.now() });

    expect(chromeMock.action.setBadgeText).not.toHaveBeenCalled();
  });
});

describe("storage.onChanged", () => {
  it("refreshes the badge when settings change in local storage", async () => {
    chromeMock.storage.local.get.mockResolvedValue({
      settings: { ...baseSettings, active: false },
    });

    await onStorageChanged({ settings: { newValue: { ...baseSettings, active: false } } }, "local");

    await vi.waitFor(() => {
      expect(chromeMock.action.setBadgeText).toHaveBeenCalledWith({ text: BADGE_TEXT.off });
      expect(chromeMock.action.setTitle).toHaveBeenCalledWith({ title: BADGE_TITLE.off });
    });
  });

  it("ignores changes in a different storage area", async () => {
    await onStorageChanged({ settings: { newValue: baseSettings } }, "sync");

    expect(chromeMock.action.setBadgeText).not.toHaveBeenCalled();
  });

  it("ignores changes to unrelated keys", async () => {
    await onStorageChanged({ changelogPending: { newValue: true } }, "local");

    expect(chromeMock.action.setBadgeText).not.toHaveBeenCalled();
  });
});
