import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { SettingInfo } from "@/components/setting-info";
import { Play, SquareStopIcon, Volume1, Volume2, VolumeX } from "lucide-react";
import { toggleTestSound } from "@/lib";
import type { LanguageType } from "@/config";

type VolumeSettingProps = {
  volume: number;
  language: LanguageType;
  isPlaying: boolean;
  onPlayingChange: (value: boolean) => void;
  onChange: (value: number) => void;
};

export const VolumeSetting = ({
  volume,
  language,
  isPlaying,
  onPlayingChange,
  onChange,
}: VolumeSettingProps) => {
  const bipRef = useRef<HTMLAudioElement | null>(null);
  const voiceRef = useRef<HTMLAudioElement | null>(null);
  const VolumeIcon = volume === 0 ? VolumeX : volume < 50 ? Volume1 : Volume2;

  useEffect(() => {
    const bip = bipRef.current;
    const voice = voiceRef.current;
    return () => {
      bip?.pause();
      voice?.pause();
    };
  }, []);

  return (
    <Card>
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <VolumeIcon className="size-3.5 text-muted-foreground" />
          <label className="uppercase text-[10px] tracking-widest font-bold text-muted-foreground">
            Volume
          </label>
          <SettingInfo label="Volume">Adjust how loud the hourly chime plays.</SettingInfo>
        </div>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant={isPlaying ? "destructive" : "ghost"}
              shape="pill"
              title={isPlaying ? "Stop" : "Play test sound"}
              aria-label={isPlaying ? "Stop" : "Play test sound"}
              onClick={() =>
                toggleTestSound(isPlaying, onPlayingChange, bipRef, voiceRef, language, volume)
              }
            >
              {isPlaying ? (
                <SquareStopIcon className="size-3 fill-current" />
              ) : (
                <Play className="size-3" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>{isPlaying ? "Stop" : "Play test sound"}</TooltipContent>
        </Tooltip>
      </div>

      <Slider
        disabled={isPlaying}
        defaultValue={[volume]}
        value={[volume]}
        max={100}
        step={1}
        onValueChange={(vals) => onChange(vals[0])}
        className="py-2"
      />
    </Card>
  );
};
