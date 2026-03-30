import { motion } from "framer-motion";
import { Brain } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface DeepThinkToggleProps {
  enabled: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

export function DeepThinkToggle({ enabled, onToggle, disabled }: DeepThinkToggleProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onToggle}
            disabled={disabled}
            className={cn(
              "h-8 px-3 rounded-lg flex items-center gap-1.5 transition-all duration-300 text-xs font-medium",
              enabled
                ? "bg-primary/15 text-primary border border-primary/30 shadow-[0_0_12px_-3px_hsl(var(--primary)/0.4)]"
                : "glass-subtle text-muted-foreground hover:text-foreground hover:bg-muted/50",
              disabled && "opacity-50 cursor-not-allowed"
            )}
          >
            <Brain className={cn("h-3.5 w-3.5", enabled && "animate-pulse")} />
            <span className="hidden sm:inline">Deep Think</span>
            {enabled && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"
              />
            )}
          </motion.button>
        </TooltipTrigger>
        <TooltipContent side="top" className="glass-strong border-border/30">
          <p className="text-xs">
            {enabled
              ? "Deep thinking enabled — AI will reason more carefully"
              : "Enable deep reasoning for complex analysis"}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
