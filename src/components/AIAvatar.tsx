import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface AIAvatarProps {
  isThinking?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function AIAvatar({ isThinking = false, size = "sm", className }: AIAvatarProps) {
  const sizes = {
    sm: "w-8 h-8 sm:w-9 sm:h-9",
    md: "w-10 h-10 sm:w-11 sm:h-11",
    lg: "w-14 h-14 sm:w-16 sm:h-16",
  };

  const iconSizes = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-7 w-7",
  };

  return (
    <div className={cn("relative flex-shrink-0 mt-1", className)}>
      {/* Status ring - breathing animation */}
      {isThinking && (
        <>
          <motion.div
            className="absolute -inset-1 rounded-xl border-2 border-primary/20"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.4, 0.1, 0.4],
            }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute -inset-0.5 rounded-xl border border-primary/30"
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.6, 0.2, 0.6],
            }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
          />
        </>
      )}

      {/* Avatar core */}
      <motion.div
        className={cn(
          sizes[size],
          "rounded-xl glass flex items-center justify-center glow-border"
        )}
        animate={
          isThinking
            ? { scale: [1, 1.03, 1], rotate: [0, 1, -1, 0] }
            : {}
        }
        transition={{
          duration: 2,
          repeat: isThinking ? Infinity : 0,
          ease: "easeInOut",
        }}
      >
        <motion.div
          animate={isThinking ? { rotate: 360 } : {}}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        >
          <Sparkles className={cn(iconSizes[size], "text-foreground/70")} />
        </motion.div>
      </motion.div>

      {/* Alive indicator dot */}
      <motion.div
        className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-background"
        style={{ backgroundColor: isThinking ? "hsl(var(--primary))" : "hsl(142 76% 46%)" }}
        animate={isThinking ? { scale: [1, 1.3, 1] } : { opacity: [1, 0.6, 1] }}
        transition={{ duration: isThinking ? 1 : 3, repeat: Infinity }}
      />
    </div>
  );
}
