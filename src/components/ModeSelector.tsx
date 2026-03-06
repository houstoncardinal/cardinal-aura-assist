import { motion } from "framer-motion";
import { Building2, Heart, GraduationCap, Code, TrendingUp, Scale, Users, Sparkles } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

export type IndustryMode =
  | "general"
  | "real-estate"
  | "healthcare"
  | "education"
  | "legal"
  | "finance"
  | "tech"
  | "hr";

interface Mode {
  id: IndustryMode;
  name: string;
  icon: React.ElementType;
  emoji: string;
  description: string;
}

const modes: Mode[] = [
  { id: "general", name: "General", icon: Sparkles, emoji: "✨", description: "All-purpose AI assistant" },
  { id: "real-estate", name: "Real Estate", icon: Building2, emoji: "🏠", description: "Property & market intelligence" },
  { id: "healthcare", name: "Healthcare", icon: Heart, emoji: "🏥", description: "Clinical & patient support" },
  { id: "education", name: "Education", icon: GraduationCap, emoji: "🎓", description: "Teaching & curriculum tools" },
  { id: "legal", name: "Legal", icon: Scale, emoji: "⚖️", description: "Contract & case analysis" },
  { id: "finance", name: "Finance", icon: TrendingUp, emoji: "💹", description: "Financial modeling & analysis" },
  { id: "tech", name: "Technology", icon: Code, emoji: "💻", description: "Code review & architecture" },
  { id: "hr", name: "Human Resources", icon: Users, emoji: "👥", description: "Talent & policy management" },
];

interface ModeSelectorProps {
  selectedMode: IndustryMode;
  onModeChange: (mode: IndustryMode) => void;
  className?: string;
}

export function ModeSelector({ selectedMode, onModeChange, className }: ModeSelectorProps) {
  return (
    <ScrollArea className={cn("w-full", className)}>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 sm:p-4">
        {modes.map((mode, i) => {
          const isSelected = selectedMode === mode.id;

          return (
            <motion.button
              key={mode.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, duration: 0.25 }}
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onModeChange(mode.id)}
              className={cn(
                "relative group p-3 sm:p-4 rounded-xl transition-all duration-300 text-left",
                isSelected
                  ? "glass bg-primary/5 ring-1 ring-primary/20"
                  : "glass-subtle hover:bg-muted/50"
              )}
            >
              <span className="text-xl sm:text-2xl block mb-2">{mode.emoji}</span>
              <h3 className="font-semibold text-xs sm:text-sm mb-0.5">{mode.name}</h3>
              <p className="text-[10px] sm:text-xs text-muted-foreground line-clamp-1">
                {mode.description}
              </p>
              {isSelected && (
                <motion.div
                  layoutId="mode-indicator"
                  className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary/60"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </ScrollArea>
  );
}

export function getModeName(mode: IndustryMode): string {
  return modes.find((m) => m.id === mode)?.name || "General";
}

export function getModeIcon(mode: IndustryMode): React.ElementType {
  return modes.find((m) => m.id === mode)?.icon || Sparkles;
}
