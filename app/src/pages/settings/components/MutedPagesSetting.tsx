import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { SettingInfo } from "@/components/setting-info";
import { Link2Off, Plus, X } from "lucide-react";
import { normalizeForMatch } from "@/lib";
import { useCurrentTabHost } from "@/hooks";
import type { Settings } from "@/types";

type MutedPagesSettingProps = {
  mutedPages: Settings["mutedPages"];
  onChange: (value: Settings["mutedPages"]) => void;
};

export const MutedPagesSetting = ({ mutedPages, onChange }: MutedPagesSettingProps) => {
  const [draft, setDraft] = useState("");
  const currentTabHost = useCurrentTabHost();

  const addValue = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    const normalized = normalizeForMatch(trimmed);
    const isDuplicate = mutedPages.patterns.some((p) => normalizeForMatch(p) === normalized);
    if (!isDuplicate) {
      onChange({ ...mutedPages, patterns: [...mutedPages.patterns, trimmed] });
    }
  };

  const addPattern = () => {
    addValue(draft);
    setDraft("");
  };

  const removePattern = (pattern: string) => {
    onChange({ ...mutedPages, patterns: mutedPages.patterns.filter((p) => p !== pattern) });
  };

  const isCurrentHostMuted =
    currentTabHost !== null &&
    mutedPages.patterns.some((p) => normalizeForMatch(p) === normalizeForMatch(currentTabHost));

  return (
    <Card>
      <div className="w-full flex gap-4">
        <div className="flex flex-1 items-center gap-2">
          <Link2Off className="size-3.5 text-muted-foreground" />
          <label
            htmlFor="muted-pages"
            className="uppercase text-[10px] tracking-widest font-bold text-muted-foreground"
          >
            Muted Pages
          </label>
          <SettingInfo label="Muted Pages">
            Mute the hourly chime while a listed page is open in your active tab.
          </SettingInfo>
        </div>
        <Switch
          id="muted-pages"
          checked={mutedPages.enabled || false}
          onCheckedChange={(val) => onChange({ ...mutedPages, enabled: val })}
        />
      </div>
      {mutedPages.enabled && (
        <div className="w-full flex flex-col gap-2 animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="flex items-center gap-2">
            <Input
              type="text"
              placeholder="example.com"
              value={draft}
              className="text-xs"
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addPattern();
                }
              }}
            />
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  shape="pill"
                  title="Add page"
                  aria-label="Add page"
                  onClick={addPattern}
                >
                  <Plus />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Add page</TooltipContent>
            </Tooltip>
          </div>
          {currentTabHost && !isCurrentHostMuted && (
            <Button
              type="button"
              variant="outline"
              shape="pill"
              size="xs"
              className="w-fit gap-1.5 text-muted-foreground"
              onClick={() => addValue(currentTabHost)}
            >
              <Plus className="size-3.5" />
              Add {currentTabHost}
            </Button>
          )}
          {mutedPages.patterns.length > 0 && (
            <ul className="flex flex-wrap gap-1.5">
              {mutedPages.patterns.map((pattern) => (
                <li key={pattern}>
                  <Button
                    type="button"
                    variant="chip"
                    shape="pill"
                    size="xs"
                    className="h-auto px-2.5 py-1"
                    title={`Remove ${pattern}`}
                    aria-label={`Remove ${pattern}`}
                    onClick={() => removePattern(pattern)}
                  >
                    {pattern}
                    <X className="size-3" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </Card>
  );
};
