import type { LanguageType } from "@/config";

export interface Settings {
  active: boolean;
  language: LanguageType;
  volume: number;
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
  mutedPages: {
    enabled: boolean;
    patterns: string[];
  };
}
