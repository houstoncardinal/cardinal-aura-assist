import { Building2, Heart, GraduationCap, Code, TrendingUp, Scale, Users, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  color: string;
  description: string;
}

const modes: Mode[] = [
  {
    id: "general",
    name: "General",
    icon: Sparkles,
    color: "from-primary to-accent",
    description: "All-purpose AI assistant",
  },
  {
    id: "real-estate",
    name: "Real Estate",
    icon: Building2,
    color: "from-blue-500 to-cyan-500",
    description: "Property analysis, market insights, client outreach",
  },
  {
    id: "healthcare",
    name: "Healthcare",
    icon: Heart,
    color: "from-red-500 to-pink-500",
    description: "Patient summaries, medical research, documentation",
  },
  {
    id: "education",
    name: "Education",
    icon: GraduationCap,
    color: "from-purple-500 to-violet-500",
    description: "Lesson plans, assessments, student feedback",
  },
  {
    id: "legal",
    name: "Legal",
    icon: Scale,
    color: "from-amber-500 to-orange-500",
    description: "Contract review, legal research, case analysis",
  },
  {
    id: "finance",
    name: "Finance",
    icon: TrendingUp,
    color: "from-green-500 to-emerald-500",
    description: "Market analysis, financial modeling, reporting",
  },
  {
    id: "tech",
    name: "Technology",
    icon: Code,
    color: "from-indigo-500 to-blue-500",
    description: "Code review, documentation, technical specs",
  },
  {
    id: "hr",
    name: "Human Resources",
    icon: Users,
    color: "from-pink-500 to-rose-500",
    description: "Job descriptions, performance reviews, policies",
  },
];

interface ModeSelectorProps {
  selectedMode: IndustryMode;
  onModeChange: (mode: IndustryMode) => void;
  className?: string;
}

export function ModeSelector({ selectedMode, onModeChange, className }: ModeSelectorProps) {
  return (
    <ScrollArea className={cn("w-full", className)}>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 p-4">
        {modes.map((mode) => {
          const Icon = mode.icon;
          const isSelected = selectedMode === mode.id;

          return (
              <button
                key={mode.id}
                onClick={() => onModeChange(mode.id)}
                className={cn(
                  "relative group p-4 rounded-xl border transition-all duration-300",
                  "hover:scale-105 luxury-shadow hover:luxury-shadow-hover",
                  isSelected
                    ? "luxury-card border-primary/30 bg-primary/5"
                    : "bg-card luxury-border hover:border-primary/20"
                )}
              >
                <div
                  className={cn(
                    "w-12 h-12 rounded-lg bg-primary/10 mb-3 flex items-center justify-center",
                    "transition-transform group-hover:scale-110"
                  )}
                >
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="font-semibold text-sm mb-1 text-left">{mode.name}</h3>
                <p className="text-xs text-muted-foreground text-left line-clamp-2">
                  {mode.description}
                </p>
                {isSelected && (
                  <div className="absolute inset-0 rounded-xl border-2 border-primary pointer-events-none" />
                )}
              </button>
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
