// @vitest-environment jsdom
import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { ChangelogEntry } from "@/types";
import { useChangelogUpdate } from "./useChangelogUpdate";

const fixtureEntries: ChangelogEntry[] = [
  { version: "2.0.0", date: "2026-08-05", highlights: ["Newest highlight"] },
  { version: "1.0.0", date: "2026-06-01", highlights: ["Oldest highlight"] },
];

const chromeStorageMock = {
  get: vi.fn(),
  set: vi.fn(),
  remove: vi.fn(),
};
const getManifestMock = vi.fn();

vi.stubGlobal("chrome", {
  storage: {
    local: chromeStorageMock,
  },
  runtime: {
    getManifest: getManifestMock,
  },
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("useChangelogUpdate", () => {
  it("stays closed when no update is pending", async () => {
    getManifestMock.mockReturnValue({ version: "2.0.0" });
    chromeStorageMock.get.mockResolvedValue({});

    const { result } = renderHook(() => useChangelogUpdate(fixtureEntries));
    await waitFor(() => expect(chromeStorageMock.get).toHaveBeenCalled());

    expect(result.current.isOpen).toBe(false);
    expect(result.current.entry).toBeNull();
  });

  it("opens with the entry matching the current version when an update is pending", async () => {
    getManifestMock.mockReturnValue({ version: "2.0.0" });
    chromeStorageMock.get.mockResolvedValue({ changelogPending: true });

    const { result } = renderHook(() => useChangelogUpdate(fixtureEntries));

    await waitFor(() => expect(result.current.isOpen).toBe(true));
    expect(result.current.entry).toEqual(fixtureEntries[0]);
  });

  it("silently clears the flag and stays closed when the update has no matching entry", async () => {
    getManifestMock.mockReturnValue({ version: "3.0.0" });
    chromeStorageMock.get.mockResolvedValue({ changelogPending: true });
    chromeStorageMock.set.mockResolvedValue(undefined);

    const { result } = renderHook(() => useChangelogUpdate(fixtureEntries));

    await waitFor(() =>
      expect(chromeStorageMock.set).toHaveBeenCalledWith({ changelogPending: false }),
    );
    expect(result.current.isOpen).toBe(false);
    expect(result.current.entry).toBeNull();
  });

  it("dismiss() clears the pending flag and closes", async () => {
    getManifestMock.mockReturnValue({ version: "2.0.0" });
    chromeStorageMock.get.mockResolvedValue({ changelogPending: true });
    chromeStorageMock.set.mockResolvedValue(undefined);

    const { result } = renderHook(() => useChangelogUpdate(fixtureEntries));
    await waitFor(() => expect(result.current.isOpen).toBe(true));

    await act(async () => {
      await result.current.dismiss();
    });

    expect(chromeStorageMock.set).toHaveBeenCalledWith({ changelogPending: false });
    expect(result.current.isOpen).toBe(false);
  });
});
