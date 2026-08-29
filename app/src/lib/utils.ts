import type { LanguageType } from "@/config";
import { clsx, type ClassValue } from "clsx";
import type { RefObject } from "react";
import { twMerge } from "tailwind-merge";
import { getDisplayHour } from "./scheduling";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const toggleTestSound = (
  isPlaying: boolean,
  setIsPlaying: (v: boolean) => void,
  bipRef: RefObject<HTMLAudioElement | null>,
  voiceRef: RefObject<HTMLAudioElement | null>,
  language: LanguageType,
  volume: number,
) => {
  if (isPlaying) {
    bipRef.current?.pause();
    if (bipRef.current) bipRef.current.currentTime = 0;

    voiceRef.current?.pause();
    if (voiceRef.current) voiceRef.current.currentTime = 0;

    setIsPlaying(false);
    return;
  }

  const displayHour = getDisplayHour(new Date().getHours());
  const filePath = `/audio/${language}/${displayHour}.webm`;
  const bipPath = `/audio/bip.webm`;

  bipRef.current = new Audio(bipPath);
  voiceRef.current = new Audio(filePath);

  bipRef.current.volume = volume / 100;
  voiceRef.current.volume = volume / 100;

  setIsPlaying(true);

  bipRef.current.play().catch(() => setIsPlaying(false));

  bipRef.current.onended = () => {
    voiceRef.current?.play().catch(() => setIsPlaying(false));
  };

  voiceRef.current.onended = () => {
    setIsPlaying(false);
  };
};
