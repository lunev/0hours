import { getHostname } from "@/lib";
import { useActiveTabUrl } from "./useActiveTabUrl";

/**
 * The hostname of the active tab in the popup's window, or null if it's
 * unknown/unparsable (e.g. no active tab, or a page URL Chrome withholds).
 */
export const useCurrentTabHost = () => {
  const url = useActiveTabUrl();
  return url ? getHostname(url) : null;
};
