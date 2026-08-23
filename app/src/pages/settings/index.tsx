import { useState } from "react";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ROUTES } from "@/config";
import { useSettings } from "@/hooks";
import { ArrowLeft, MessageCircleQuestion } from "lucide-react";
import { LanguageSetting } from "./components/LanguageSetting";
import { VolumeSetting } from "./components/VolumeSetting";
import { QuietHoursSetting } from "./components/QuietHoursSetting";
import { MutedPagesSetting } from "./components/MutedPagesSetting";

export const SettingsPage = () => {
  const { settings, setSettings, isLoading } = useSettings();
  const [isTestPlaying, setIsTestPlaying] = useState(false);

  if (isLoading) {
    return null;
  }

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
      <div className="p-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                shape="pill"
                title="Back"
                aria-label="Back"
                asChild
              >
                <Link to={ROUTES.HOME}>
                  <ArrowLeft className="size-5" />
                </Link>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Back</TooltipContent>
          </Tooltip>
          <h1 className="text-xl font-semibold text-foreground">Settings</h1>
        </div>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              shape="pill"
              title="Feedback"
              aria-label="Feedback"
              asChild
            >
              <a
                href="https://chromewebstore.google.com/detail/0hours-—-talking-clock-ho/gjkpcdjhkpjjehejhieaibmekliiemic/support"
                target="_blank"
                rel="noreferrer"
              >
                <MessageCircleQuestion className="size-5" />
              </a>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Feedback</TooltipContent>
        </Tooltip>
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

        <MutedPagesSetting
          mutedPages={settings.mutedPages}
          onChange={(mutedPages) => setSettings({ ...settings, mutedPages })}
        />
      </div>
    </>
  );
};
