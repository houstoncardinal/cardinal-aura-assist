import { useState, useRef, useEffect } from "react";
import { Send, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { streamChat, Message } from "@/lib/chat";
import { IndustryMode, getModeName, getModeIcon } from "./ModeSelector";
import { toast } from "@/hooks/use-toast";

interface ChatInterfaceProps {
  mode: IndustryMode;
  toolPrompt?: string;
}

const quickPromptsByMode: Record<IndustryMode, string[]> = {
  general: ["Summarize this document", "Help me brainstorm ideas", "Analyze this data", "Draft an email"],
  "real-estate": ["Create a property listing", "Analyze market trends", "Draft client outreach", "Generate CMA report"],
  healthcare: ["Summarize patient records", "Research medical topics", "Document clinical notes", "Create care plan"],
  education: ["Create lesson plan", "Design assessment", "Write student feedback", "Build learning activity"],
  legal: ["Review this contract", "Research case law", "Draft legal memo", "Create due diligence checklist"],
  finance: ["Analyze financials", "Create forecast", "Build financial model", "Evaluate investment"],
  tech: ["Review this code", "Write documentation", "Design system architecture", "Debug this issue"],
  hr: ["Write job description", "Create performance review", "Draft HR policy", "Design onboarding plan"],
};

export function ChatInterface({ mode, toolPrompt }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const ModeIcon = getModeIcon(mode);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (toolPrompt) {
      setInput(toolPrompt + " ");
      textareaRef.current?.focus();
    }
  }, [toolPrompt]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    let assistantContent = "";
    
    await streamChat({
      messages: [...messages, userMessage],
      mode,
      onDelta: (chunk) => {
        assistantContent += chunk;
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          if (last?.role === "assistant" && last.id === "streaming") {
            return prev.map((m) =>
              m.id === "streaming" ? { ...m, content: assistantContent } : m
            );
          }
          return [...prev, { id: "streaming", role: "assistant", content: assistantContent, timestamp: new Date() }];
        });
      },
      onDone: () => {
        setMessages((prev) =>
          prev.map((m) => (m.id === "streaming" ? { ...m, id: Date.now().toString() } : m))
        );
        setIsLoading(false);
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: error,
          variant: "destructive",
        });
        setMessages((prev) => prev.filter((m) => m.id !== "streaming"));
        setIsLoading(false);
      },
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages Area */}
      <ScrollArea ref={scrollRef} className="flex-1 px-4 py-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.length === 0 && (
            <div className="h-full flex items-center justify-center px-4 py-20">
              <div className="max-w-2xl text-center space-y-6 animate-fade-in-up">
                <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-6 shadow-elevated">
                  <ModeIcon className="h-10 w-10 text-primary" />
                </div>
                <div className="space-y-3">
                  <Badge variant="secondary" className="mb-2">{getModeName(mode)}</Badge>
                  <h2 className="text-4xl font-bold text-gradient">
                    Welcome to Cardinal GPT
                  </h2>
                  <p className="text-muted-foreground text-lg">
                    Your AI-powered workspace optimized for {getModeName(mode).toLowerCase()}. 
                    Ask me anything or try one of these quick prompts to get started.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 justify-center pt-6">
                  {quickPromptsByMode[mode].map((prompt) => (
                    <Button
                      key={prompt}
                      variant="outline"
                      size="sm"
                      onClick={() => setInput(prompt)}
                      className="hover:scale-105 transition-all hover:border-primary/50 hover:bg-primary/5"
                    >
                      {prompt}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex gap-4 animate-fade-in-up",
                message.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              {message.role === "assistant" && (
                <Avatar className="h-8 w-8 border border-primary/20">
                  <AvatarFallback className="bg-primary/10 text-primary">
                    <Sparkles className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
              )}

              <div
                className={cn(
                  "rounded-2xl px-5 py-4 max-w-[80%] shadow-elevated transition-all duration-200 hover:scale-[1.01]",
                  message.role === "user"
                    ? "bg-gradient-to-br from-primary to-accent text-primary-foreground glow-sm"
                    : "glass-panel bg-muted/30"
                )}
              >
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
              </div>

              {message.role === "user" && (
                <Avatar className="h-8 w-8 border border-muted">
                  <AvatarFallback className="bg-muted text-muted-foreground">U</AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-4 animate-fade-in">
              <Avatar className="h-8 w-8 border border-primary/20">
                <AvatarFallback className="bg-primary/10 text-primary">
                  <Sparkles className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div className="glass-panel rounded-2xl px-4 py-3">
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="border-t border-border/50 glass-panel p-4">
        <div className="max-w-4xl mx-auto">
          <div className="relative flex items-end gap-2">

            <div className="flex-1 relative">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask me anything..."
                className="min-h-[52px] max-h-[200px] resize-none pr-12 glass-panel border-border/50 focus:border-primary/50 transition-colors"
                rows={1}
              />
            </div>

            <Button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              size="icon"
              className="mb-2 h-10 w-10 glow-sm"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center mt-2">
            Powered by OpenAI GPT-4o-mini • {getModeName(mode)} Mode
          </p>
        </div>
      </div>
    </div>
  );
}
