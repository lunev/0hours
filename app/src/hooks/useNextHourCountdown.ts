import { useEffect, useState } from "react";

/**
 * Live countdown to the top of the next hour, ticking every second, plus a
 * localized label for what that next hour is.
 */
export const useNextHourCountdown = () => {
  const [timeLeft, setTimeLeft] = useState("00:00");
  const [nextHourLabel, setNextHourLabel] = useState("00:00");

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

  return { timeLeft, nextHourLabel };
};
