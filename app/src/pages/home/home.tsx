import { NextChime } from "@/pages/home/components/NextChime";
import { Button } from "@/components/ui/button";
import { useSettings } from "@/hooks";
import { translations } from "@/locales";
import { Link } from "react-router";
import { ROUTES } from "@/config";
import LanguagesToggle from "./components/LanguagesToggle";
import { isQuietNow } from "@/lib";
import { Moon } from "lucide-react";

export const Home = () => {
  const { settings, setSettings, isLoading } = useSettings();
  const t = translations[settings.language];
  const isQuietHours =
    settings?.quietHours?.enabled &&
    isQuietNow(settings?.quietHours?.start, settings?.quietHours?.end);

  if (!settings || isLoading) return null;

  return (
    <div className="py-13 px-10 flex flex-col justify-center items-center gap-5 animate-in slide-in-from-bottom-20 duration-500">
      {/* Logo */}
      <div className="mb-7 select-none text-center relative">
        <span className="text-7xl font-bold tracking-tighter text-foreground">
          <span className="inline-block -mr-3">0</span>
          <span className="inline-block text-primary">h</span>
        </span>
        {settings.active && isQuietHours && (
          <Moon className="absolute -top-2 -right-6 size-6 text-primary" />
        )}
      </div>

      {settings.active ? (
        <>
          <NextChime lang={settings.language} isQuietTime={isQuietHours} />
          <Button onClick={() => setSettings({ ...settings, active: false })}>
            {t.actions.deactivate}
          </Button>
        </>
      ) : (
        <>
          <div className="text-center text-sm text-muted-foreground">{t.text.activateHint}</div>
          <Button
            size="xl"
            className="min-w-60"
            onClick={() => setSettings({ ...settings, active: true })}
          >
            {t.actions.activate}
          </Button>
          <LanguagesToggle
            settings={settings}
            onToggle={(lang) => setSettings({ ...settings, language: lang })}
          />
        </>
      )}

      <Button asChild variant="link" className="text-muted-foreground">
        <Link to={ROUTES.SETTINGS}>{t.settings.title}</Link>
      </Button>
    </div>
  );
};
