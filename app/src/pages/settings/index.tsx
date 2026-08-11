import { useState } from "react";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/config";
import { useSettings } from "@/hooks";
import { ArrowLeft } from "lucide-react";
import { LanguageSetting } from "./components/LanguageSetting";
import { VolumeSetting } from "./components/VolumeSetting";
import { QuietHoursSetting } from "./components/QuietHoursSetting";

export const SettingsPage = () => {
  const { settings, setSettings } = useSettings();
  const [isTestPlaying, setIsTestPlaying] = useState(false);

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
    <>
      <div className="p-5 flex items-center gap-4">
        <Button size="icon" variant="ghost" asChild>
          <Link to={ROUTES.HOME}>
            <ArrowLeft className="size-5" />
          </Link>
        </Button>
        <h1 className="text-xl font-semibold text-foreground">Settings</h1>
      </div>

      <div className="p-5 pt-0 flex flex-col gap-5">
        <LanguageSetting
          value={settings.language}
          disabled={isTestPlaying}
          onChange={(language) => setSettings({ ...settings, language })}
        />

        <VolumeSetting
          volume={settings.volume}
          language={settings.language}
          isPlaying={isTestPlaying}
          onPlayingChange={setIsTestPlaying}
          onChange={(volume) => setSettings({ ...settings, volume })}
        />

        <QuietHoursSetting
          quietHours={settings.quietHours}
          onChange={(quietHours) => setSettings({ ...settings, quietHours })}
        />
      </div>
    </>
  );
};
