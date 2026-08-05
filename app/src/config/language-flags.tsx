import { CN, DE, ES, FR, GB, IT, JP, KR, PL, PT, SE, TR, UA } from "country-flag-icons/react/3x2";
import type { LanguageType } from "./languages";

export const LANGUAGE_FLAGS: Record<
  LanguageType,
  React.ComponentType<React.SVGAttributes<HTMLElement>>
> = {
  en: GB,
  fr: FR,
  de: DE,
  it: IT,
  ja: JP,
  ko: KR,
  pl: PL,
  pt: PT,
  es: ES,
  sv: SE,
  tr: TR,
  uk: UA,
  zh: CN,
};
