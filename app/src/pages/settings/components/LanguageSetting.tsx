import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LANGUAGES, type LanguageType } from "@/config";
import { Languages } from "lucide-react";

type LanguageSettingProps = {
  value: LanguageType;
  onChange: (value: LanguageType) => void;
};

export const LanguageSetting = ({ value, onChange }: LanguageSettingProps) => {
  return (
    <div className="bg-card p-4 flex flex-col gap-3 rounded-xl shadow-sm border border-border/40">
      <div className="flex items-center gap-2">
        <Languages className="size-3.5 text-muted-foreground" />
        <label className="uppercase text-[10px] tracking-widest font-bold text-muted-foreground">
          Voice Language
        </label>
      </div>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select language">
            {value ? LANGUAGES[value] : undefined}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {Object.entries(LANGUAGES).map(([code, name]) => (
            <SelectItem key={code} value={code} className="uppercase text-xs">
              {name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
