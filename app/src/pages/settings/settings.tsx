import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { DEFAULT_SETTINGS, languages, ROUTES } from "@/config";
import { useSettings } from "@/hooks";
import { translations } from "@/locales";
import type { Settings as SettingsType } from "@/types";
import { ArrowLeft, Volume2, Languages, BellOff, Play, SquareStopIcon } from "lucide-react";

export const Settings = () => {
  const { settings, setSettings, isLoading } = useSettings();
  const [localSettings, setLocalSettings] = useState<SettingsType>(DEFAULT_SETTINGS);
  const t = translations[settings.language];
  const navigate = useNavigate();
  const [isPlaying, setIsPlaying] = useState(false);
  const bipRef = useRef<HTMLAudioElement | null>(null);
  const voiceRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  useEffect(() => {
    return () => {
      bipRef.current?.pause();
      voiceRef.current?.pause();
    };
  }, []);

  const toggleTestSound = () => {
    if (isPlaying) {
      bipRef.current?.pause();
      if (bipRef.current) bipRef.current.currentTime = 0;

      voiceRef.current?.pause();
      if (voiceRef.current) voiceRef.current.currentTime = 0;

      setIsPlaying(false);
      return;
    }

    const hour = new Date().getHours();
    const displayHour = hour % 12 || 12;
    const filePath = `/audio/${localSettings.language}/${displayHour}.mp3`;
    const bipPath = `/audio/bip.mp3`;

    bipRef.current = new Audio(bipPath);
    voiceRef.current = new Audio(filePath);

    bipRef.current.volume = localSettings.volume / 100;
    voiceRef.current.volume = localSettings.volume / 100;

    setIsPlaying(true);

    bipRef.current.play().catch(() => setIsPlaying(false));

    bipRef.current.onended = () => {
      voiceRef.current?.play().catch(() => setIsPlaying(false));
    };

    voiceRef.current.onended = () => {
      setIsPlaying(false);
    };
  };

  useEffect(() => {
    return () => {
      bipRef.current?.pause();
      voiceRef.current?.pause();
    };
  }, []);

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    await setSettings(localSettings);
    navigate(ROUTES.HOME);
  };

  if (!settings || isLoading) return null;

  return (
    <form className="animate-in slide-in-from-right-50 duration-400" onSubmit={handleSubmit}>
      {/* Header */}
      <div className="p-5 flex items-center gap-4">
        <Button size="icon-sm" variant="ghost" className="bg-muted" asChild>
          <Link to={ROUTES.HOME}>
            <ArrowLeft className="size-5" />
          </Link>
        </Button>
        <h1 className="text-xl font-semibold text-foreground">{t.settings.title}</h1>
      </div>

      {/* Settings */}
      <div className="p-5 pt-0 flex flex-col gap-5">
        {/* Language */}
        <div className="bg-card p-4 flex flex-col gap-3 rounded-xl shadow-sm border border-border/40">
          <div className="flex items-center gap-2">
            <Languages className="size-3.5 text-muted-foreground" />
            <label className="uppercase text-[10px] tracking-widest font-bold text-muted-foreground">
              {t.settings.languageLabel}
            </label>
          </div>
          <div className="flex gap-2">
            {languages.map((lang) => (
              <Button
                size="sm"
                key={lang}
                type="button"
                variant={localSettings.language === lang ? "default" : "outline"}
                className="flex-1 uppercase text-xs"
                onClick={() => setSettings({ ...settings, language: lang })}
              >
                {lang === "uk" ? "Українська" : "English"}
              </Button>
            ))}
          </div>
        </div>

        {/* Volume Settings */}
        <div className="bg-card p-4 flex flex-col gap-4 rounded-xl border border-border/40">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Volume2 className="size-3.5 text-muted-foreground" />
              <label className="uppercase text-[10px] tracking-widest font-bold text-muted-foreground">
                {t.settings.volume}
              </label>
            </div>
            <span className="text-xs font-mono font-bold">{localSettings.volume}%</span>
          </div>

          <Slider
            defaultValue={[localSettings.volume]}
            value={[localSettings.volume]}
            max={100}
            step={1}
            onValueChange={(vals) => setLocalSettings({ ...localSettings, volume: vals[0] })}
            className="py-2"
          />

          <Button
            type="button"
            variant={isPlaying ? "destructive" : "secondary"}
            size="sm"
            className="w-full text-[10px] uppercase tracking-wider font-bold h-8 transition-colors"
            onClick={toggleTestSound}
          >
            {isPlaying ? (
              <>
                <SquareStopIcon className="mr-2 size-3 fill-current" />
                {t.actions.stop}
              </>
            ) : (
              <>
                <Play className="mr-2 size-3" />
                {t.actions.play}
              </>
            )}
          </Button>
        </div>

        {/* Silence Mode */}
        <div className="bg-card p-4 flex flex-col gap-4 rounded-xl">
          <div className="w-full flex gap-4">
            <div className="flex flex-1 items-center gap-2">
              <BellOff className="size-3.5 text-muted-foreground" />
              <label
                htmlFor="quiet-hours"
                className="uppercase flex-1 text-[10px] tracking-widest font-bold text-muted-foreground"
              >
                {t.settings.quietHours}
              </label>
            </div>
            <Switch
              id="quiet-hours"
              checked={localSettings.quietHours.enabled || false}
              onCheckedChange={(val) =>
                setLocalSettings({
                  ...localSettings,
                  quietHours: { ...localSettings.quietHours, enabled: val },
                })
              }
            />
          </div>
          <fieldset disabled={!localSettings.quietHours.enabled} className="w-full flex gap-4">
            <Input
              type="time"
              className="flex-1"
              required
              value={localSettings.quietHours.start}
              onChange={(e) =>
                setLocalSettings({
                  ...localSettings,
                  quietHours: { ...localSettings.quietHours, start: e.target.value },
                })
              }
            />
            <Input
              type="time"
              className="flex-1"
              required
              value={localSettings.quietHours.end}
              onChange={(e) =>
                setLocalSettings({
                  ...localSettings,
                  quietHours: { ...localSettings.quietHours, end: e.target.value },
                })
              }
            />
          </fieldset>
        </div>

        <div className="flex gap-4">
          <Button type="button" className="flex-1" variant="outline" asChild size="lg">
            <Link to={ROUTES.HOME}>{t.actions.cancel}</Link>
          </Button>
          <Button type="submit" className="flex-1" size="lg">
            {t.actions.save}
          </Button>
        </div>
      </div>
    </form>
  );
};
