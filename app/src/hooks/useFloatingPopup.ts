import { useEffect, useState } from "react";
import { storage } from "@/lib/storage";

type UseFloatingPopupOptions = {
  storageKey: string;
  intervalDays: number;
};

export const useFloatingPopup = ({ storageKey, intervalDays }: UseFloatingPopupOptions) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const checkVisibility = async () => {
      const lastDismissedAt = await storage.get<number>(storageKey);
      if (cancelled) return;

      const intervalMs = intervalDays * 24 * 60 * 60 * 1000;
      const isDue = !lastDismissedAt || Date.now() - lastDismissedAt >= intervalMs;
      if (isDue) setVisible(true);
    };

    checkVisibility();

    return () => {
      cancelled = true;
    };
  }, [storageKey, intervalDays]);

  const dismiss = async () => {
    await storage.set(storageKey, Date.now());
    setVisible(false);
  };

  return { visible, dismiss };
};
