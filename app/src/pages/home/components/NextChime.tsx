import { useState, useEffect } from "react";
import { translations, type Language } from "@/locales";

interface NextChimeProps {
  lang: Language;
  isQuietTime: boolean;
}

const localeMap: Record<Language, string> = {
  en: "en-US",
  uk: "uk-UA",
};

export const NextChime: React.FC<NextChimeProps> = ({ lang, isQuietTime }) => {
  const [timeLeft, setTimeLeft] = useState("00:00");
  const [nextHourLabel, setNextHourLabel] = useState("00:00");

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();

      const nextHour = new Date();
      nextHour.setHours(now.getHours() + 1, 0, 0, 0);

      const hourLabel = nextHour.toLocaleTimeString(localeMap[lang], {
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
  }, [lang]);

  return (
    <div className="flex flex-col items-center gap-2">
      {isQuietTime ? (
        <span className="text-xs uppercase tracking-widest text-muted-foreground">
          {translations[lang].text.quietModeActive}
        </span>
      ) : (
        <>
          <span className="text-xs uppercase tracking-widest text-muted-foreground">
            {translations[lang].text.nextChime}
          </span>
          <span className="font-mono text-5xl font-light tabular-nums text-foreground">
            {timeLeft}
          </span>
          <span className="text-sm text-muted-foreground">{nextHourLabel}</span>
        </>
      )}
    </div>
  );
};
