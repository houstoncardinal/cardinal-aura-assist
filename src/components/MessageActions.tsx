import { Copy, Check, RefreshCw, ThumbsUp, ThumbsDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

interface MessageActionsProps {
  content: string;
  onRegenerate?: () => void;
  isLoading?: boolean;
}

export function MessageActions({ content, onRegenerate, isLoading }: MessageActionsProps) {
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState<"up" | "down" | null>(null);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    toast({ description: "Copied to clipboard" });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFeedback = (type: "up" | "down") => {
    setFeedback(type);
    toast({ 
      description: type === "up" ? "Thanks for your feedback!" : "We'll work to improve" 
    });
  };

  return (
    <div className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7"
        onClick={handleCopy}
      >
        {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
      </Button>
      
      {onRegenerate && (
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={onRegenerate}
          disabled={isLoading}
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
        </Button>
      )}
      
      <div className="h-4 w-px bg-border mx-1" />
      
      <Button
        variant="ghost"
        size="icon"
        className={`h-7 w-7 ${feedback === 'up' ? 'text-green-500' : ''}`}
        onClick={() => handleFeedback("up")}
      >
        <ThumbsUp className="h-3.5 w-3.5" />
      </Button>
      
      <Button
        variant="ghost"
        size="icon"
        className={`h-7 w-7 ${feedback === 'down' ? 'text-red-500' : ''}`}
        onClick={() => handleFeedback("down")}
      >
        <ThumbsDown className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}
