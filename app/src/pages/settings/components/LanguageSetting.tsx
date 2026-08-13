import { LANGUAGES, LANGUAGE_FLAGS, type LanguageType } from "@/config";
import { cn } from "@/lib";
import { Card } from "@/components/ui/card";
import { Languages } from "lucide-react";

type LanguageSettingProps = {
  value: LanguageType;
  disabled?: boolean;
  onChange: (value: LanguageType) => void;
};

export const LanguageSetting = ({ value, disabled, onChange }: LanguageSettingProps) => {
  return (
    <Card>
      <div className="flex items-center gap-2">
        <Languages className="size-3.5 text-muted-foreground" />
        <label className="uppercase text-[10px] tracking-widest font-bold text-muted-foreground">
          Voice Language
        </label>
      </div>
      <fieldset disabled={disabled} className="grid grid-cols-9 gap-2">
        {Object.entries(LANGUAGES).map(([code, name]) => {
          const Flag = LANGUAGE_FLAGS[code as LanguageType];
          const isSelected = value === code;
          return (
            <button
              key={code}
              type="button"
              title={name}
              aria-pressed={isSelected}
              onClick={() => onChange(code as LanguageType)}
              className={cn(
                "flex flex-col items-center gap-1 rounded-md border py-1 text-[10px] uppercase transition-colors disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
                isSelected
                  ? "border border-primary bg-primary/50 dark:border dark:bg-transparent dark:border-primary dark:hover:bg-transparent text-foreground"
                  : "border-border/40 bg-muted/30 text-muted-foreground hover:bg-primary/20 hover:text-foreground dark:hover:bg-transparent dark:hover:border-primary dark:hover:text-muted-foreground",
              )}
            >
              <Flag className="w-5 rounded-[2px]" />
              {code}
            </button>
          );
        })}
      </fieldset>
    </Card>
  );
};
