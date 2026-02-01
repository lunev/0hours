import { en } from './en';
import { uk } from './uk';

export const translations = { en, uk };
export type Language = keyof typeof translations;
