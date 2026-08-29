import { type ReactNode, useEffect, useState } from "react";
import { X } from "lucide-react";
import { useFloatingPopup } from "@/hooks";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type FloatingPopupPosition = "bottom-right" | "bottom-left" | "top-right" | "top-left";

const POSITION_CLASSES: Record<FloatingPopupPosition, string> = {
  "bottom-right": "bottom-3 right-3",
  "bottom-left": "bottom-3 left-3",
  "top-right": "top-3 right-3",
  "top-left": "top-3 left-3",
};

const TYPING_SPEED_MS = 80;
const DELETING_SPEED_MS = 40;
const PAUSE_DURATION_MS = 1500;

// Cycles through messages via a type/pause/delete animation; static text has no need for it.
const useMessageCycle = (messages: string[]) => {
  const [text, setText] = useState("");
  const [index, setIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (messages.length === 0) return;
    const current = messages[index % messages.length];

    if (!isDeleting && text === current) {
      const pause = setTimeout(() => setIsDeleting(true), PAUSE_DURATION_MS);
      return () => clearTimeout(pause);
    }

    if (isDeleting && text === "") {
      const next = setTimeout(() => {
        setIsDeleting(false);
        setIndex((i) => i + 1);
      }, 0);
      return () => clearTimeout(next);
    }

    const timeout = setTimeout(
      () => setText(current.slice(0, isDeleting ? text.length - 1 : text.length + 1)),
      isDeleting ? DELETING_SPEED_MS : TYPING_SPEED_MS,
    );
    return () => clearTimeout(timeout);
  }, [text, isDeleting, index, messages]);

  return text;
};

type FloatingPopupProps = {
  storageKey: string;
  intervalDays: number;
  messages: string[];
  linkText: string;
  linkHref: string;
  icon?: ReactNode;
  position?: FloatingPopupPosition;
  className?: string;
  onVisibleChange?: (visible: boolean) => void;
};

export const FloatingPopup = ({
  storageKey,
  intervalDays,
  messages,
  linkText,
  linkHref,
  icon,
  position = "bottom-right",
  className,
  onVisibleChange,
}: FloatingPopupProps) => {
  const { visible, dismiss } = useFloatingPopup({ storageKey, intervalDays });
  const isAnimated = messages.length > 1;
  const typedMessage = useMessageCycle(visible && isAnimated ? messages : []);
  const displayedMessage = isAnimated ? typedMessage : (messages[0] ?? "");

  useEffect(() => {
    onVisibleChange?.(visible);
  }, [visible, onVisibleChange]);

  if (!visible) return null;

  return (
    <Card
      className={cn(
        "fixed z-50 w-64 max-w-[calc(100vw-1.5rem)] flex-row items-start gap-3 p-3 pr-8",
        POSITION_CLASSES[position],
        className,
      )}
    >
      <Button
        variant="ghost"
        size="icon-xs"
        shape="pill"
        className="absolute top-1.5 right-1.5"
        onClick={dismiss}
        title="Dismiss"
        aria-label="Dismiss"
      >
        <X className="size-3.5" />
      </Button>
      {icon}
      <div className="min-w-0 flex-1 text-xs">
        <div className="h-5 truncate">{displayedMessage}</div>
        <a
          href={linkHref}
          target="_blank"
          rel="noreferrer noopener"
          className="font-medium underline hover:no-underline"
        >
          {linkText}
        </a>
      </div>
    </Card>
  );
};
