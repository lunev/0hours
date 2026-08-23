// @vitest-environment jsdom
import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useNextHourCountdown } from "./useNextHourCountdown";

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe("useNextHourCountdown", () => {
  it("shows the remaining time mid-hour", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 0, 1, 14, 30, 0));

    const { result } = renderHook(() => useNextHourCountdown());

    expect(result.current.timeLeft).toBe("30:00");
    expect(result.current.nextHourLabel).toMatch(/^\d{1,2}:\d{2}(\s?[AP]M)?$/i);
  });

  it("shows 1 second right before the hour rolls over", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 0, 1, 14, 59, 59));

    const { result } = renderHook(() => useNextHourCountdown());

    expect(result.current.timeLeft).toBe("00:01");
  });

  it("ticks down every second", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 0, 1, 14, 30, 0));

    const { result } = renderHook(() => useNextHourCountdown());
    expect(result.current.timeLeft).toBe("30:00");

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current.timeLeft).toBe("29:59");
  });
});
