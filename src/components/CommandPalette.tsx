import { useEffect, useState } from "react";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Building2, Heart, GraduationCap, Code, TrendingUp, Scale, Users, Sparkles,
  Sun, Moon, Plus, Image, FileText, Search, MessageSquare, Wand2,
} from "lucide-react";
import { IndustryMode } from "./ModeSelector";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onModeChange: (mode: IndustryMode) => void;
  onNewConversation: () => void;
  onToolSelect: (prompt: string) => void;
  onToggleTheme: () => void;
  currentTheme: "light" | "dark";
}

const modeItems: { id: IndustryMode; name: string; icon: React.ElementType }[] = [
  { id: "general", name: "General", icon: Sparkles },
  { id: "real-estate", name: "Real Estate", icon: Building2 },
  { id: "healthcare", name: "Healthcare", icon: Heart },
  { id: "education", name: "Education", icon: GraduationCap },
  { id: "legal", name: "Legal", icon: Scale },
  { id: "finance", name: "Finance", icon: TrendingUp },
  { id: "tech", name: "Technology", icon: Code },
  { id: "hr", name: "Human Resources", icon: Users },
];

const quickActions = [
  { name: "Generate Image", icon: Image, action: "Generate an image of:" },
  { name: "Summarize Text", icon: FileText, action: "Summarize this:" },
  { name: "Research Topic", icon: Search, action: "Research:" },
  { name: "Draft Content", icon: Wand2, action: "Draft:" },
];

export function CommandPalette({
  open,
  onOpenChange,
  onModeChange,
  onNewConversation,
  onToolSelect,
  onToggleTheme,
  currentTheme,
}: CommandPaletteProps) {
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open, onOpenChange]);

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        <CommandGroup heading="Actions">
          <CommandItem onSelect={() => { onNewConversation(); onOpenChange(false); }}>
            <Plus className="mr-2 h-4 w-4" />
            New Conversation
          </CommandItem>
          <CommandItem onSelect={() => { onToggleTheme(); onOpenChange(false); }}>
            {currentTheme === "light" ? <Moon className="mr-2 h-4 w-4" /> : <Sun className="mr-2 h-4 w-4" />}
            Toggle {currentTheme === "light" ? "Dark" : "Light"} Mode
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Quick Tools">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <CommandItem key={action.name} onSelect={() => { onToolSelect(action.action); onOpenChange(false); }}>
                <Icon className="mr-2 h-4 w-4" />
                {action.name}
              </CommandItem>
            );
          })}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Switch Mode">
          {modeItems.map((mode) => {
            const Icon = mode.icon;
            return (
              <CommandItem key={mode.id} onSelect={() => { onModeChange(mode.id); onOpenChange(false); }}>
                <Icon className="mr-2 h-4 w-4" />
                {mode.name}
              </CommandItem>
            );
          })}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
