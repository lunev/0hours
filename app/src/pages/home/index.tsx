import { NextChime } from "@/pages/home/components/NextChime";
import { Button } from "@/components/ui/button";
import { useSettings } from "@/hooks";
import { Link } from "react-router";
import { ROUTES } from "@/config";
import { isQuietNow } from "@/lib";
import { Moon } from "lucide-react";

export const HomePage = () => {
  const { settings, setSettings, isLoading } = useSettings();
  const isQuietHours =
    settings?.quietHours?.enabled &&
    isQuietNow(settings?.quietHours?.start, settings?.quietHours?.end);

  if (!settings || isLoading) return null;

  return (
    <div className="py-13 px-10 flex flex-col justify-center items-center gap-5">
      {/* Logo */}
      <div className="mb-7 select-none text-center relative">
        <span className="text-7xl font-bold tracking-tighter text-foreground">
          <span className="inline-block -mr-3 dark:text-white">0</span>
          <span className="inline-block text-primary">h</span>
        </span>
        {settings.active && isQuietHours && (
          <Moon className="absolute -top-2 -right-6 size-6 text-primary" />
        )}
      </div>

      {settings.active ? (
        <>
          <NextChime
            isQuietTime={isQuietHours}
            language={settings?.language}
            volume={settings?.volume}
          />
          <Button shape="pill" onClick={() => setSettings({ ...settings, active: false })}>
            Deactivate
          </Button>
        </>
      ) : (
        <>
          <div className="text-center text-sm text-muted-foreground">
            Tap to activate hourly chimes
          </div>
          <Button
            size="lg"
            shape="pill"
            className="min-w-40"
            onClick={() => setSettings({ ...settings, active: true })}
          >
            Activate
          </Button>
        </>
      )}

      <Button asChild variant="link" className="text-muted-foreground dark:text-link">
        <Link to={ROUTES.SETTINGS}>Settings</Link>
      </Button>
    </div>
  );
};
