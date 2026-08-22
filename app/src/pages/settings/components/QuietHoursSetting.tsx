import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { SettingInfo } from "@/components/setting-info";
import { BellOff } from "lucide-react";
import type { Settings } from "@/types";

type QuietHoursSettingProps = {
  quietHours: Settings["quietHours"];
  onChange: (value: Settings["quietHours"]) => void;
};

export const QuietHoursSetting = ({ quietHours, onChange }: QuietHoursSettingProps) => {
  return (
    <Card>
      <div className="w-full flex gap-4">
        <div className="flex flex-1 items-center gap-2">
          <BellOff className="size-3.5 text-muted-foreground" />
          <label
            htmlFor="quiet-hours"
            className="uppercase text-[10px] tracking-widest font-bold text-muted-foreground"
          >
            Silence Mode
          </label>
          <SettingInfo label="Silence Mode">
            Mute the hourly chime during a set time window, like overnight.
          </SettingInfo>
        </div>
        <Switch
          id="quiet-hours"
          checked={quietHours.enabled || false}
          onCheckedChange={(val) => onChange({ ...quietHours, enabled: val })}
        />
      </div>
      {quietHours.enabled && (
        <div className="w-full flex items-center gap-3 animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="flex flex-1 items-center gap-2">
            <label
              htmlFor="quiet-hours-start"
              className="text-[10px] uppercase tracking-widest text-muted-foreground"
            >
              From
            </label>
            <Input
              id="quiet-hours-start"
              type="time"
              className="flex-1 text-xs"
              required
              value={quietHours.start}
              onChange={(e) => onChange({ ...quietHours, start: e.target.value })}
            />
          </div>
          <div className="flex flex-1 items-center gap-2">
            <label
              htmlFor="quiet-hours-end"
              className="text-[10px] uppercase tracking-widest text-muted-foreground"
            >
              To
            </label>
            <Input
              id="quiet-hours-end"
              type="time"
              className="flex-1 text-xs"
              required
              value={quietHours.end}
              onChange={(e) => onChange({ ...quietHours, end: e.target.value })}
            />
          </div>
        </div>
      )}
    </Card>
  );
};
