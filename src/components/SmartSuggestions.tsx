import { useMemo } from "react";
import { motion } from "framer-motion";
import { Zap } from "lucide-react";
import { IndustryMode } from "./ModeSelector";

interface SmartSuggestionsProps {
  content: string;
  mode: IndustryMode;
  onSelect: (suggestion: string) => void;
}

function generateSuggestions(content: string, mode: IndustryMode): string[] {
  const suggestions: string[] = [];
  const lower = content.toLowerCase();

  // Content-based contextual suggestions
  if (lower.includes("table") || lower.includes("comparison") || lower.includes("vs"))
    suggestions.push("Create a visual chart from this data");
  if (lower.includes("step") || lower.includes("process") || lower.includes("1."))
    suggestions.push("Elaborate on each step in detail");
  if (lower.includes("risk") || lower.includes("concern") || lower.includes("warning"))
    suggestions.push("How can I mitigate these risks?");
  if (lower.includes("code") || lower.includes("```"))
    suggestions.push("Write tests for this code");
  if (lower.includes("budget") || lower.includes("cost") || lower.includes("price"))
    suggestions.push("Optimize for cost savings");
  if (content.length > 1000)
    suggestions.push("Summarize the key takeaways");

  // Mode-specific defaults
  const modeDefaults: Record<IndustryMode, string[]> = {
    general: ["Tell me more about this", "Generate an image based on this"],
    "real-estate": ["Compare to market averages", "Draft a property listing from this"],
    healthcare: ["What do the clinical guidelines say?", "Create patient education materials"],
    education: ["Differentiate for diverse learners", "Create an assessment for this"],
    legal: ["What are the relevant precedents?", "Identify potential liabilities"],
    finance: ["Run a sensitivity analysis", "Create financial projections"],
    tech: ["Optimize this for performance", "Write documentation for this"],
    hr: ["Draft a policy based on this", "Create a template from this"],
  };

  const defaults = modeDefaults[mode] || modeDefaults.general;
  for (const d of defaults) {
    if (suggestions.length < 3 && !suggestions.includes(d)) suggestions.push(d);
  }

  return suggestions.slice(0, 3);
}

export function SmartSuggestions({ content, mode, onSelect }: SmartSuggestionsProps) {
  const suggestions = useMemo(() => generateSuggestions(content, mode), [content, mode]);

  if (!suggestions.length) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      className="flex items-start gap-2 pl-12 sm:pl-12"
    >
      <Zap className="h-3 w-3 text-muted-foreground/50 mt-1.5 flex-shrink-0" />
      <div className="flex flex-wrap gap-1.5">
        {suggestions.map((s, i) => (
          <motion.button
            key={s}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 + i * 0.1 }}
            onClick={() => onSelect(s)}
            className="glass-subtle rounded-full px-3 py-1.5 text-[11px] text-muted-foreground hover:text-foreground hover:bg-primary/5 transition-all duration-200 hover:scale-[1.03] active:scale-[0.97]"
          >
            {s}
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
