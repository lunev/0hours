import { useEffect, useState } from "react";

/**
 * The full URL of the active tab in the popup's window, or null if it's
 * unknown/unavailable (e.g. no active tab, or a page URL Chrome withholds).
 */
export const useActiveTabUrl = () => {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
      setUrl(tab?.url ?? null);
    });
  }, []);

  return url;
};
