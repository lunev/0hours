import { useState, useEffect } from "react";
import { Volume1, Volume2, VolumeX } from "lucide-react";
import { LANGUAGE_FLAGS, type LanguageType } from "@/config";

interface NextChimeProps {
  isQuietTime: boolean;
  language: LanguageType;
  volume: number;
}

export const NextChime = ({ isQuietTime, language, volume }: NextChimeProps) => {
  const [timeLeft, setTimeLeft] = useState("00:00");
  const [nextHourLabel, setNextHourLabel] = useState("00:00");
  const VolumeIcon = volume === 0 ? VolumeX : volume < 50 ? Volume1 : Volume2;
  const Flag = LANGUAGE_FLAGS[language];

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();

      const nextHour = new Date();
      nextHour.setHours(now.getHours() + 1, 0, 0, 0);

      const hourLabel = nextHour.toLocaleTimeString(undefined, {
        hour: "2-digit",
        minute: "2-digit",
      });
      setNextHourLabel(hourLabel);

      const diff = nextHour.getTime() - now.getTime();
      const minutes = Math.floor((diff / 1000 / 60) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      const display = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
      setTimeLeft(display);
    };

    updateTimer();
    const timer = setInterval(updateTimer, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col items-center gap-2">
      {isQuietTime ? (
        <span className="text-xs uppercase tracking-widest text-muted-foreground">
          Silent Mode On
        </span>
      ) : (
        <>
          <span className="text-xs uppercase tracking-widest text-muted-foreground">
            Next chime
          </span>
          <span className="font-mono text-5xl font-light tabular-nums text-foreground">
            {timeLeft}
          </span>
          <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
            {nextHourLabel} · <Flag className="w-4 rounded-[2px]" /> ·{" "}
            <VolumeIcon className="size-3.5" />
          </span>
        </>
      )}
    </div>
  );
};
