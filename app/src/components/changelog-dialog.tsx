import { Sparkles } from "lucide-react";
import { useChangelogUpdate } from "@/hooks";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export const ChangelogDialog = () => {
  const { entry, isOpen, dismiss } = useChangelogUpdate();

  if (!entry) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && dismiss()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="size-4 text-primary" />
            What's new
          </DialogTitle>
          <DialogDescription>0hours was just updated to v{entry.version}.</DialogDescription>
        </DialogHeader>

        <ul className="flex flex-col gap-1.5 text-sm text-foreground">
          {entry.highlights.map((highlight) => (
            <li key={highlight} className="flex gap-2">
              <span className="text-primary">•</span>
              <span>{highlight}</span>
            </li>
          ))}
        </ul>
      </DialogContent>
    </Dialog>
  );
};
