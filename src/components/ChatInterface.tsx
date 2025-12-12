import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Sparkles, Loader2, Mic, Paperclip, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { streamChat, Message } from "@/lib/chat";
import { IndustryMode, getModeName, getModeIcon } from "./ModeSelector";
import { MessageContent } from "./MessageContent";
import { MessageActions } from "./MessageActions";
import { toast } from "@/hooks/use-toast";

interface ChatInterfaceProps {
  mode: IndustryMode;
  toolPrompt?: string;
}

const quickPromptsByMode: Record<IndustryMode, { text: string; icon: string }[]> = {
  general: [
    { text: "Summarize this document for me", icon: "📄" },
    { text: "Help me brainstorm creative ideas", icon: "💡" },
    { text: "Analyze this data and provide insights", icon: "📊" },
    { text: "Draft a professional email", icon: "✉️" },
  ],
  "real-estate": [
    { text: "Create a compelling property listing", icon: "🏠" },
    { text: "Analyze current market trends in my area", icon: "📈" },
    { text: "Generate a CMA report for a property", icon: "📋" },
    { text: "Draft a buyer/seller consultation script", icon: "🤝" },
  ],
  healthcare: [
    { text: "Summarize patient records", icon: "📋" },
    { text: "Research latest treatment protocols", icon: "🔬" },
    { text: "Create patient education materials", icon: "📚" },
    { text: "Draft a clinical documentation note", icon: "✍️" },
  ],
  education: [
    { text: "Create an engaging lesson plan", icon: "📚" },
    { text: "Design a comprehensive assessment", icon: "📝" },
    { text: "Write constructive student feedback", icon: "💬" },
    { text: "Build a differentiated learning activity", icon: "🎯" },
  ],
  legal: [
    { text: "Review and analyze this contract", icon: "📜" },
    { text: "Research relevant case law", icon: "⚖️" },
    { text: "Draft a legal memorandum", icon: "📄" },
    { text: "Create a due diligence checklist", icon: "✅" },
  ],
  finance: [
    { text: "Analyze these financial statements", icon: "📊" },
    { text: "Create a financial forecast model", icon: "📈" },
    { text: "Evaluate this investment opportunity", icon: "💰" },
    { text: "Build a detailed budget plan", icon: "🧮" },
  ],
  tech: [
    { text: "Review and optimize this code", icon: "💻" },
    { text: "Write comprehensive documentation", icon: "📝" },
    { text: "Design system architecture", icon: "🏗️" },
    { text: "Debug and troubleshoot this issue", icon: "🔧" },
  ],
  hr: [
    { text: "Write a compelling job description", icon: "📋" },
    { text: "Create a performance review template", icon: "⭐" },
    { text: "Draft an HR policy document", icon: "📄" },
    { text: "Design an onboarding program", icon: "🎓" },
  ],
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

  const sendMessage = useCallback(async (messageContent: string, previousMessages: Message[]) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: messageContent,
      timestamp: new Date(),
    };

    setMessages([...previousMessages, userMessage]);
    setInput("");
    setIsLoading(true);

    let assistantContent = "";
    
    await streamChat({
      messages: [...previousMessages, userMessage],
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
  }, [mode]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    await sendMessage(input, messages);
  };

  const handleRegenerate = useCallback(async (messageIndex: number) => {
    // Find the user message before this assistant message
    const userMessageIndex = messageIndex - 1;
    if (userMessageIndex < 0) return;
    
    const userMessage = messages[userMessageIndex];
    if (userMessage.role !== "user") return;
    
    // Remove messages from this point onwards
    const previousMessages = messages.slice(0, userMessageIndex);
    await sendMessage(userMessage.content, previousMessages);
  }, [messages, sendMessage]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleQuickPrompt = (prompt: string) => {
    setInput(prompt);
    textareaRef.current?.focus();
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages Area */}
      <ScrollArea ref={scrollRef} className="flex-1 px-4 py-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.length === 0 && (
            <div className="h-full flex items-center justify-center px-4 py-20">
              <div className="max-w-2xl text-center space-y-6 animate-fade-in-up">
                <div className="w-20 h-20 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center mb-6 luxury-shadow">
                  <ModeIcon className="h-10 w-10" />
                </div>
                <div className="space-y-3">
                  <Badge variant="secondary" className="mb-2">{getModeName(mode)}</Badge>
                  <h2 className="text-4xl font-bold tracking-tight">
                    Welcome to Cardinal GPT
                  </h2>
                  <p className="text-muted-foreground text-lg">
                    Your AI-powered workspace optimized for {getModeName(mode).toLowerCase()}. 
                    Ask me anything or try one of these quick prompts to get started.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3 pt-6 max-w-lg mx-auto">
                  {quickPromptsByMode[mode].map((prompt) => (
                    <Button
                      key={prompt.text}
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickPrompt(prompt.text)}
                      className="h-auto py-3 px-4 flex items-center gap-2 hover:scale-105 transition-all hover:border-primary/50 hover:bg-primary/5 text-left justify-start"
                    >
                      <span className="text-base">{prompt.icon}</span>
                      <span className="text-xs">{prompt.text}</span>
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {messages.map((message, index) => (
            <div
              key={message.id}
              className={cn(
                "flex gap-4 animate-fade-in-up group",
                message.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              {message.role === "assistant" && (
                <Avatar className="h-8 w-8 border border-primary/20 flex-shrink-0">
                  <AvatarFallback className="bg-primary/10 text-primary">
                    <Sparkles className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
              )}

              <div className="flex flex-col max-w-[80%]">
                <div
                  className={cn(
                    "rounded-2xl px-5 py-4 luxury-shadow transition-all duration-200",
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "luxury-glass"
                  )}
                >
                  <MessageContent content={message.content} isUser={message.role === "user"} />
                </div>
                {message.role === "assistant" && message.id !== "streaming" && (
                  <MessageActions 
                    content={message.content} 
                    onRegenerate={() => handleRegenerate(index)}
                    isLoading={isLoading}
                  />
                )}
              </div>

              {message.role === "user" && (
                <Avatar className="h-8 w-8 border border-muted flex-shrink-0">
                  <AvatarFallback className="bg-muted text-muted-foreground">U</AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}

          {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
            <div className="flex gap-4 animate-fade-in">
              <Avatar className="h-8 w-8 border border-primary/20">
                <AvatarFallback className="bg-primary/10 text-primary">
                  <Sparkles className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div className="luxury-glass rounded-2xl px-4 py-3">
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

      {/* Enhanced Input Area */}
      <div className="luxury-border border-t p-4 bg-background/80 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto">
          <div className="relative flex items-end gap-2 luxury-glass rounded-xl p-2">
            <div className="flex gap-1 px-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                title="Attach file (coming soon)"
              >
                <Paperclip className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex-1 relative">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask Cardinal GPT anything..."
                className="min-h-[48px] max-h-[200px] resize-none border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 p-2"
                rows={1}
              />
            </div>

            <div className="flex gap-1 px-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                title="Voice input (coming soon)"
              >
                <Mic className="h-4 w-4" />
              </Button>
              <Button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                size="icon"
                className="h-9 w-9 rounded-lg"
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-center gap-4 mt-3">
            <p className="text-xs text-muted-foreground">
              Powered by OpenAI GPT-4o-mini
            </p>
            <span className="text-muted-foreground/50">•</span>
            <Badge variant="outline" className="text-xs">
              <Wand2 className="h-3 w-3 mr-1" />
              {getModeName(mode)} Mode
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
}
