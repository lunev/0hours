import type { Language } from "@/locales";

export interface Settings {
  active: boolean;
  language: Language;
  volume: number;
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
}
