import { Volume1, Volume2, VolumeX } from "lucide-react";
import { LANGUAGE_FLAGS, type LanguageType } from "@/config";
import { useNextHourCountdown } from "@/hooks";

interface NextChimeProps {
  isQuietTime: boolean;
  isMutedPage: boolean;
  language: LanguageType;
  volume: number;
}

export const NextChime = ({ isQuietTime, isMutedPage, language, volume }: NextChimeProps) => {
  const { timeLeft, nextHourLabel } = useNextHourCountdown();
  const VolumeIcon = volume === 0 ? VolumeX : volume < 50 ? Volume1 : Volume2;
  const Flag = LANGUAGE_FLAGS[language];

  return (
    <div className="flex flex-col items-center gap-2">
      {isQuietTime ? (
        <span className="text-xs uppercase tracking-widest text-muted-foreground">
          Silent Mode On
        </span>
      ) : isMutedPage ? (
        <span className="text-xs uppercase tracking-widest text-muted-foreground">Page Muted</span>
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
