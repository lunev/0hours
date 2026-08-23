// @vitest-environment jsdom
import { cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useActiveTabUrl } from "./useActiveTabUrl";

const chromeTabsMock = {
  query: vi.fn(),
};

vi.stubGlobal("chrome", {
  tabs: chromeTabsMock,
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("useActiveTabUrl", () => {
  it("returns the active tab's full URL when found", async () => {
    chromeTabsMock.query.mockImplementation((_details, callback) => {
      callback([{ url: "https://example.com/path" }]);
    });

    const { result } = renderHook(() => useActiveTabUrl());

    await waitFor(() => expect(result.current).toBe("https://example.com/path"));
  });

  it("returns null when there is no active tab", async () => {
    chromeTabsMock.query.mockImplementation((_details, callback) => {
      callback([]);
    });

    const { result } = renderHook(() => useActiveTabUrl());

    await waitFor(() => expect(result.current).toBeNull());
  });

  it("returns null when the active tab has no URL", async () => {
    chromeTabsMock.query.mockImplementation((_details, callback) => {
      callback([{}]);
    });

    const { result } = renderHook(() => useActiveTabUrl());

    await waitFor(() => expect(result.current).toBeNull());
  });
});
