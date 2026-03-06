import { useState, useRef, useCallback } from "react";
import { Mic, MicOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  disabled?: boolean;
}

export function VoiceInput({ onTranscript, disabled }: VoiceInputProps) {
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  const isSupported =
    typeof window !== "undefined" &&
    ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);

  const toggle = useCallback(() => {
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }

    const SR =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SR) {
      toast({
        title: "Not supported",
        description: "Speech recognition is not available in this browser.",
        variant: "destructive",
      });
      return;
    }

    const recognition = new SR();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    let finalTranscript = "";

    recognition.onresult = (e: any) => {
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) {
          finalTranscript += t + " ";
        } else {
          interim = t;
        }
      }
      onTranscript((finalTranscript + interim).trim());
    };

    recognition.onerror = (e: any) => {
      if (e.error !== "aborted") {
        toast({
          title: "Voice error",
          description: `Speech recognition error: ${e.error}`,
          variant: "destructive",
        });
      }
      setListening(false);
    };

    recognition.onend = () => setListening(false);

    recognition.start();
    recognitionRef.current = recognition;
    setListening(true);
    finalTranscript = "";
  }, [listening, onTranscript]);

  if (!isSupported) return null;

  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn(
        "h-8 w-8 rounded-lg transition-all duration-300",
        listening
          ? "text-destructive bg-destructive/10 animate-pulse"
          : "text-muted-foreground hover:text-foreground"
      )}
      onClick={toggle}
      disabled={disabled}
      title={listening ? "Stop listening" : "Voice input"}
    >
      {listening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
    </Button>
  );
}
