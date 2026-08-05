// @vitest-environment jsdom
import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_SETTINGS } from "@/config";
import type { Settings } from "@/types";
import { useSettings } from "./useSettings";

const chromeStorageMock = {
  get: vi.fn(),
  set: vi.fn(),
  remove: vi.fn(),
};

vi.stubGlobal("chrome", {
  storage: {
    local: chromeStorageMock,
  },
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("useSettings", () => {
  it("starts in a loading state with default settings", () => {
    chromeStorageMock.get.mockResolvedValue({});

    const { result } = renderHook(() => useSettings());

    expect(result.current.isLoading).toBe(true);
    expect(result.current.settings).toEqual(DEFAULT_SETTINGS);
  });

  it("loads stored settings and merges them over the defaults", async () => {
    const stored: Partial<Settings> = { active: true, volume: 42 };
    chromeStorageMock.get.mockResolvedValue({ settings: stored });

    const { result } = renderHook(() => useSettings());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.settings).toEqual({ ...DEFAULT_SETTINGS, ...stored });
    expect(result.current.isError).toBe("");
  });

  it("keeps the defaults when nothing is stored yet", async () => {
    chromeStorageMock.get.mockResolvedValue({});

    const { result } = renderHook(() => useSettings());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.settings).toEqual(DEFAULT_SETTINGS);
  });

  it("surfaces an error message when loading fails", async () => {
    chromeStorageMock.get.mockRejectedValue(new Error("storage unavailable"));

    const { result } = renderHook(() => useSettings());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.isError).toBe("storage unavailable");
  });

  it("falls back to a generic error message for a non-Error rejection", async () => {
    chromeStorageMock.get.mockRejectedValue("some string rejection");

    const { result } = renderHook(() => useSettings());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.isError).toBe("Failed to load settings");
  });

  it("persists and reflects updated settings", async () => {
    chromeStorageMock.get.mockResolvedValue({});
    chromeStorageMock.set.mockResolvedValue(undefined);

    const { result } = renderHook(() => useSettings());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const updated: Settings = { ...DEFAULT_SETTINGS, active: true, volume: 70 };
    await act(async () => {
      await result.current.setSettings(updated);
    });

    expect(chromeStorageMock.set).toHaveBeenCalledWith({ settings: updated });
    expect(result.current.settings).toEqual(updated);
  });

  it("surfaces an error message when saving fails", async () => {
    chromeStorageMock.get.mockResolvedValue({});
    chromeStorageMock.set.mockRejectedValue(new Error("quota exceeded"));

    const { result } = renderHook(() => useSettings());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.setSettings({ ...DEFAULT_SETTINGS, active: true });
    });

    expect(result.current.isError).toBe("Failed to save settings");
  });
});
