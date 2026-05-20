import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ConstellationAvatarProps {
  size?: number;
  isThinking?: boolean;
  className?: string;
}

/**
 * Neural Constellation — a living, gilded organism.
 * Two slowly-counter-rotating gold rings frame a pulsing four-point star,
 * with animated diagonal light traces evoking neural connections.
 */
export function ConstellationAvatar({
  size = 128,
  isThinking = false,
  className,
}: ConstellationAvatarProps) {
  return (
    <div
      className={cn("relative flex items-center justify-center", className)}
      style={{ width: size, height: size }}
    >
      {/* Outer glow halo */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          background:
            "radial-gradient(circle, hsl(var(--gold) / 0.35) 0%, transparent 65%)",
          filter: "blur(28px)",
        }}
        animate={{ scale: isThinking ? [1, 1.18, 1] : [1, 1.08, 1] }}
        transition={{ duration: isThinking ? 1.6 : 3, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Outer ring — slow clockwise */}
      <motion.div
        className="absolute inset-0 rounded-full border"
        style={{ borderColor: "hsl(var(--gold) / 0.35)" }}
        animate={{ rotate: 360 }}
        transition={{ duration: isThinking ? 8 : 18, repeat: Infinity, ease: "linear" }}
      >
        {/* Orbit nodes */}
        {[0, 72, 144, 216, 288].map((deg, i) => (
          <span
            key={i}
            className="absolute size-1.5 rounded-full"
            style={{
              background: i % 2 === 0 ? "hsl(var(--gold-bright))" : "hsl(var(--gold))",
              top: "50%",
              left: "50%",
              transform: `rotate(${deg}deg) translate(${size / 2}px) translate(-50%, -50%)`,
              boxShadow: "0 0 8px hsl(var(--gold))",
            }}
          />
        ))}
      </motion.div>

      {/* Inner ring — counter-rotating */}
      <motion.div
        className="absolute rounded-full border"
        style={{
          inset: size * 0.18,
          borderColor: "hsl(var(--gold-bright) / 0.28)",
        }}
        animate={{ rotate: -360 }}
        transition={{ duration: isThinking ? 5 : 12, repeat: Infinity, ease: "linear" }}
      />

      {/* Diagonal light traces */}
      <div className="absolute inset-0 flex items-center justify-center opacity-50">
        <div
          className="absolute h-full w-px rotate-45"
          style={{
            background:
              "linear-gradient(180deg, transparent 0%, hsl(var(--gold) / 0.7) 50%, transparent 100%)",
          }}
        />
        <div
          className="absolute h-full w-px -rotate-45"
          style={{
            background:
              "linear-gradient(180deg, transparent 0%, hsl(var(--gold-bright) / 0.6) 50%, transparent 100%)",
          }}
        />
      </div>

      {/* Central four-point star */}
      <motion.svg
        viewBox="0 0 24 24"
        className="relative z-10"
        style={{ width: size * 0.42, height: size * 0.42 }}
        animate={{
          scale: isThinking ? [1, 1.08, 1] : [1, 1.02, 1],
          opacity: [1, 0.7, 1],
        }}
        transition={{ duration: isThinking ? 1.8 : 3.2, repeat: Infinity, ease: "easeInOut" }}
      >
        <defs>
          <linearGradient id="constellationGold" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="hsl(44, 76%, 75%)" />
            <stop offset="100%" stopColor="hsl(44, 53%, 54%)" />
          </linearGradient>
        </defs>
        <path
          d="M12 2L14.85 9.15L22 12L14.85 14.85L12 22L9.15 14.85L2 12L9.15 9.15L12 2Z"
          fill="url(#constellationGold)"
        />
        <circle cx="12" cy="12" r="1.6" fill="hsl(var(--noir))" />
      </motion.svg>
    </div>
  );
}
