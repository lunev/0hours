import { useEffect, useState } from "react";
import { getHostname } from "@/lib";

/**
 * The hostname of the active tab in the popup's window, or null if it's
 * unknown/unparsable (e.g. no active tab, or a page URL Chrome withholds).
 */
export const useCurrentTabHost = () => {
  const [host, setHost] = useState<string | null>(null);

  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
      setHost(tab?.url ? getHostname(tab.url) : null);
    });
  }, []);

  return host;
};
