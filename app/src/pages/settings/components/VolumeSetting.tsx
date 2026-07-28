import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Volume2, Play, SquareStopIcon } from "lucide-react";
import { toggleTestSound } from "@/lib";
import type { LanguageType } from "@/config";

type VolumeSettingProps = {
  volume: number;
  language: LanguageType;
  onChange: (value: number) => void;
};

export const VolumeSetting = ({ volume, language, onChange }: VolumeSettingProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const bipRef = useRef<HTMLAudioElement | null>(null);
  const voiceRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const bip = bipRef.current;
    const voice = voiceRef.current;
    return () => {
      bip?.pause();
      voice?.pause();
    };
  }, []);

  return (
    <div className="bg-card p-4 flex flex-col gap-4 rounded-xl border border-border/40">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Volume2 className="size-3.5 text-muted-foreground" />
          <label className="uppercase text-[10px] tracking-widest font-bold text-muted-foreground">
            Volume
          </label>
        </div>
        <span className="text-xs font-mono font-bold">{volume}%</span>
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

      <Button
        type="button"
        variant={isPlaying ? "destructive" : "secondary"}
        size="sm"
        className="w-full text-[10px] uppercase tracking-wider font-bold h-8 transition-colors"
        onClick={() => toggleTestSound(isPlaying, setIsPlaying, bipRef, voiceRef, language, volume)}
      >
        {isPlaying ? (
          <>
            <SquareStopIcon className="mr-2 size-3 fill-current" />
            Stop
          </>
        ) : (
          <>
            <Play className="mr-2 size-3" />
            Play
          </>
        )}
      </Button>
    </div>
  );
};
