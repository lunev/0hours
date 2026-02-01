import { Button } from "@/components/ui/button";
import { languages } from "@/config";
import type { Language } from "@/locales";
import type { Settings } from "@/types";

interface LanguagesToggleProps {
  settings: Settings;
  onToggle: (language: Language) => void;
}

const LanguagesToggle: React.FC<LanguagesToggleProps> = ({ settings, onToggle }) => {
  return (
    <div className="flex gap-2">
      {languages.map((lang) => (
        <Button
          key={lang}
          type="button"
          variant={settings.language === lang ? "default" : "outline"}
          className="flex-1 uppercase text-xs"
          onClick={() => {
            onToggle(lang);
          }}
        >
          {lang}
        </Button>
      ))}
    </div>
  );
};

export default LanguagesToggle;
