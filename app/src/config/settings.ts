import type { Settings } from "@/types";

export const DEFAULT_SETTINGS: Settings = {
  active: false,
  language: "en",
  volume: 100,
  quietHours: {
    enabled: false,
    start: "20:00",
    end: "09:00",
  },
  mutedPages: {
    enabled: false,
    patterns: [],
  },
};
