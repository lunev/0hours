import { MessageCircleQuestion } from "lucide-react";
import { FloatingPopup } from "@/components/floating-popup";

export const SupportPopup = () => (
  <FloatingPopup
    storageKey="supportPopupDismissedAt"
    intervalDays={14}
    icon={<MessageCircleQuestion className="mt-0.5 size-4 shrink-0" />}
    messages={[
      "Have a question about 0hours?",
      "Got a suggestion for us?",
      "Ran into a problem or bug?",
    ]}
    linkText="Get support here"
    linkHref="https://chromewebstore.google.com/detail/gjkpcdjhkpjjehejhieaibmekliiemic/support"
  />
);
