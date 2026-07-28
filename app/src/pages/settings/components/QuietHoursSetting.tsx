import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { BellOff } from "lucide-react";
import type { Settings } from "@/types";

type QuietHoursSettingProps = {
  quietHours: Settings["quietHours"];
  onChange: (value: Settings["quietHours"]) => void;
};

export const QuietHoursSetting = ({ quietHours, onChange }: QuietHoursSettingProps) => {
  return (
    <div className="bg-card p-4 flex flex-col gap-4 rounded-xl">
      <div className="w-full flex gap-4">
        <div className="flex flex-1 items-center gap-2">
          <BellOff className="size-3.5 text-muted-foreground" />
          <label
            htmlFor="quiet-hours"
            className="uppercase flex-1 text-[10px] tracking-widest font-bold text-muted-foreground"
          >
            Silence Mode
          </label>
        </div>
        <Switch
          id="quiet-hours"
          checked={quietHours.enabled || false}
          onCheckedChange={(val) => onChange({ ...quietHours, enabled: val })}
        />
      </div>
      <fieldset disabled={!quietHours.enabled} className="w-full flex gap-4">
        <Input
          type="time"
          className="flex-1"
          required
          value={quietHours.start}
          onChange={(e) => onChange({ ...quietHours, start: e.target.value })}
        />
        <Input
          type="time"
          className="flex-1"
          required
          value={quietHours.end}
          onChange={(e) => onChange({ ...quietHours, end: e.target.value })}
        />
      </fieldset>
    </div>
  );
};
