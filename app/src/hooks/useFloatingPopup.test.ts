// @vitest-environment jsdom
import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useFloatingPopup } from "./useFloatingPopup";

const DAY_MS = 24 * 60 * 60 * 1000;

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

describe("useFloatingPopup", () => {
  it("shows on first-ever run (no prior storage) without writing storage", async () => {
    chromeStorageMock.get.mockResolvedValue({});

    const { result } = renderHook(() => useFloatingPopup({ storageKey: "k", intervalDays: 30 }));

    await waitFor(() => expect(result.current.visible).toBe(true));
    expect(chromeStorageMock.set).not.toHaveBeenCalled();
  });

  it("stays hidden before the interval has elapsed since it was last dismissed", async () => {
    chromeStorageMock.get.mockResolvedValue({ k: Date.now() - 5 * DAY_MS });

    const { result } = renderHook(() => useFloatingPopup({ storageKey: "k", intervalDays: 30 }));
    await waitFor(() => expect(chromeStorageMock.get).toHaveBeenCalled());

    expect(result.current.visible).toBe(false);
  });

  it("shows again once the interval has elapsed since it was last dismissed", async () => {
    chromeStorageMock.get.mockResolvedValue({ k: Date.now() - 31 * DAY_MS });

    const { result } = renderHook(() => useFloatingPopup({ storageKey: "k", intervalDays: 30 }));

    await waitFor(() => expect(result.current.visible).toBe(true));
  });

  it("dismiss() hides it and records the dismissal timestamp", async () => {
    chromeStorageMock.get.mockResolvedValue({});
    chromeStorageMock.set.mockResolvedValue(undefined);

    const { result } = renderHook(() => useFloatingPopup({ storageKey: "k", intervalDays: 30 }));
    await waitFor(() => expect(result.current.visible).toBe(true));

    await act(async () => {
      await result.current.dismiss();
    });

    expect(result.current.visible).toBe(false);
    expect(chromeStorageMock.set).toHaveBeenCalledWith({ k: expect.any(Number) });
  });
});
