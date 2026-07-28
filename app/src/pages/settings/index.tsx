import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { DEFAULT_SETTINGS, ROUTES } from "@/config";
import { useSettings } from "@/hooks";
import type { Settings as SettingsType } from "@/types";
import { ArrowLeft } from "lucide-react";
import { LanguageSetting } from "./components/LanguageSetting";
import { VolumeSetting } from "./components/VolumeSetting";
import { QuietHoursSetting } from "./components/QuietHoursSetting";

export const SettingsPage = () => {
  const { settings, setSettings } = useSettings();
  const [localSettings, setLocalSettings] = useState<SettingsType>(DEFAULT_SETTINGS);
  const navigate = useNavigate();

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    await setSettings(localSettings);
    navigate(ROUTES.HOME);
  };

  if (!settings) {
    return (
      <div className="p-5 flex flex-col items-center gap-3 text-center">
        <p className="text-sm text-muted-foreground">Failed to load settings</p>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Try again
        </Button>
        <Button variant="ghost" size="sm" asChild>
          <Link to={ROUTES.HOME}>Back</Link>
        </Button>
      </div>
    );
  }

  return (
    <form className="animate-in slide-in-from-right-50 duration-400" onSubmit={handleSubmit}>
      <div className="p-5 flex items-center gap-4">
        <Button size="icon-sm" variant="ghost" className="bg-muted" asChild>
          <Link to={ROUTES.HOME}>
            <ArrowLeft className="size-5" />
          </Link>
        </Button>
        <h1 className="text-xl font-semibold text-foreground">Settings</h1>
      </div>

      <div className="p-5 pt-0 flex flex-col gap-5">
        <LanguageSetting
          value={localSettings.language}
          onChange={(language) => setLocalSettings({ ...localSettings, language })}
        />

        <VolumeSetting
          volume={localSettings.volume}
          language={localSettings.language}
          onChange={(volume) => setLocalSettings({ ...localSettings, volume })}
        />

        <QuietHoursSetting
          quietHours={localSettings.quietHours}
          onChange={(quietHours) => setLocalSettings({ ...localSettings, quietHours })}
        />

        <div className="flex gap-4">
          <Button type="button" className="flex-1" variant="outline" asChild size="lg">
            <Link to={ROUTES.HOME}>Cancel</Link>
          </Button>
          <Button type="submit" className="flex-1" size="lg">
            Save
          </Button>
        </div>
      </div>
    </form>
  );
};
