import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
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
    <div className="bg-card p-4 flex flex-col gap-2 rounded-xl border border-border/40">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <VolumeIcon className="size-3.5 text-muted-foreground" />
          <label className="uppercase text-[10px] tracking-widest font-bold text-muted-foreground">
            Volume
          </label>
        </div>
        <Button
          type="button"
          variant={isPlaying ? "destructive" : "secondary"}
          size="icon-xs"
          className="transition-colors"
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
    </div>
  );
};
