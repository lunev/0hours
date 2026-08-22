import type { ReactNode } from "react";
import { Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

type SettingInfoProps = {
  label: string;
  children: ReactNode;
};

export const SettingInfo = ({ label, children }: SettingInfoProps) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <button
        type="button"
        aria-label={`About ${label}`}
        className="text-muted-foreground/60 hover:text-muted-foreground cursor-help"
      >
        <Info className="size-3" />
      </button>
    </TooltipTrigger>
    <TooltipContent>
      <p className="max-w-56">{children}</p>
    </TooltipContent>
  </Tooltip>
);
