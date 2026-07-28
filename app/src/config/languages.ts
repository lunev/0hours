export const LANGUAGES = {
  en: "English",
  fr: "French",
  de: "German",
  it: "Italian",
  ja: "Japanese",
  ko: "Korean",
  pl: "Polish",
  pt: "Portuguese",
  es: "Spanish",
  tr: "Turkish",
  uk: "Ukrainian",
} as const;

export type LanguageType = keyof typeof LANGUAGES;
