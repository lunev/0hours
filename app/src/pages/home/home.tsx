import { NextChime } from "@/pages/home/components/NextChime";
import { Button } from "@/components/ui/button";
import { useSettings } from "@/hooks";
import { translations } from "@/locales";
import { Link } from "react-router";
import { ROUTES } from "@/config";

export const Home = () => {
  const { settings, setSettings, isLoading } = useSettings();
  const t = translations[settings.language];

  if (!settings || isLoading) return null;

  return (
    <div className="py-13 px-10 flex flex-col justify-center items-center gap-5 animate-in slide-in-from-bottom-20 duration-500">
      {/* Logo */}
      <div className="mb-7 select-none text-center">
        <span className="text-7xl font-bold tracking-tighter text-foreground">
          <span className="inline-block -mr-3">0</span>
          <span className="inline-block text-primary">h</span>
        </span>
      </div>

      {settings.active ? (
        <>
          <NextChime lang={settings.language} />

          <Button onClick={() => setSettings({ ...settings, active: false })}>
            {t.actions.deactivate}
          </Button>
        </>
      ) : (
        <>
          <div className="text-center text-sm text-muted-foreground">{t.message.activateHint}</div>
          <Button
            size="xl"
            className="min-w-80"
            onClick={() => setSettings({ ...settings, active: true })}
          >
            {t.actions.activate}
          </Button>
        </>
      )}

      <Button asChild variant="link" className="text-muted-foreground">
        <Link to={ROUTES.SETTINGS}>{t.settings.title}</Link>
      </Button>
    </div>
  );
};
