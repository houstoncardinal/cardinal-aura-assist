import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface KeyboardShortcutsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const shortcuts = [
  { keys: ["⌘", "K"], description: "Open command palette" },
  { keys: ["⌘", "N"], description: "New conversation" },
  { keys: ["?"], description: "Show keyboard shortcuts" },
  { keys: ["Enter"], description: "Send message" },
  { keys: ["Shift", "Enter"], description: "New line in message" },
  { keys: ["Esc"], description: "Close dialogs" },
];

export function KeyboardShortcuts({ open, onOpenChange }: KeyboardShortcutsProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-strong sm:max-w-md rounded-2xl border-border/30">
        <DialogHeader>
          <DialogTitle className="font-display text-lg">Keyboard Shortcuts</DialogTitle>
        </DialogHeader>
        <div className="space-y-1 mt-2">
          {shortcuts.map((s) => (
            <div
              key={s.description}
              className="flex items-center justify-between py-2.5 px-1 border-b border-border/20 last:border-0"
            >
              <span className="text-sm text-muted-foreground">{s.description}</span>
              <div className="flex items-center gap-1">
                {s.keys.map((key) => (
                  <kbd
                    key={key}
                    className="glass-subtle rounded-lg px-2.5 py-1 text-xs font-mono text-foreground/70 min-w-[28px] text-center"
                  >
                    {key}
                  </kbd>
                ))}
              </div>
            </div>
          ))}
        </div>
        <p className="text-[10px] text-muted-foreground/50 text-center mt-2">
          Press <kbd className="glass-subtle rounded px-1.5 py-0.5 text-[9px] font-mono mx-0.5">Esc</kbd> to close
        </p>
      </DialogContent>
    </Dialog>
  );
}
