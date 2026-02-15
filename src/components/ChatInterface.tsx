import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Sparkles, Loader2, Paperclip, Wand2, Image as ImageIcon, X, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { streamChat, Message } from "@/lib/chat";
import { generateImage } from "@/lib/image-gen";
import { IndustryMode, getModeName, getModeIcon } from "./ModeSelector";
import { MessageContent } from "./MessageContent";
import { MessageActions } from "./MessageActions";
import { toast } from "@/hooks/use-toast";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ChatInterfaceProps {
  mode: IndustryMode;
  toolPrompt?: string;
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  onMessagesChange?: (messages: Message[]) => void;
}

const quickPromptsByMode: Record<IndustryMode, { text: string; icon: string }[]> = {
  general: [
    { text: "Summarize this document for me", icon: "📄" },
    { text: "Help me brainstorm creative ideas", icon: "💡" },
    { text: "Analyze this data and provide insights", icon: "📊" },
    { text: "Generate an image of a futuristic cityscape", icon: "🎨" },
  ],
  "real-estate": [
    { text: "Create a compelling property listing", icon: "🏠" },
    { text: "Analyze current market trends in my area", icon: "📈" },
    { text: "Generate an image of a luxury modern home", icon: "🎨" },
    { text: "Draft a buyer consultation script", icon: "🤝" },
  ],
  healthcare: [
    { text: "Summarize patient records", icon: "📋" },
    { text: "Research latest treatment protocols", icon: "🔬" },
    { text: "Create patient education materials", icon: "📚" },
    { text: "Generate a medical infographic concept", icon: "🎨" },
  ],
  education: [
    { text: "Create an engaging lesson plan", icon: "📚" },
    { text: "Design a comprehensive assessment", icon: "📝" },
    { text: "Generate an educational illustration", icon: "🎨" },
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
    { text: "Generate an investment dashboard mockup", icon: "🎨" },
    { text: "Build a detailed budget plan", icon: "🧮" },
  ],
  tech: [
    { text: "Review and optimize this code", icon: "💻" },
    { text: "Write comprehensive documentation", icon: "📝" },
    { text: "Design system architecture", icon: "🏗️" },
    { text: "Generate a UI mockup concept", icon: "🎨" },
  ],
  hr: [
    { text: "Write a compelling job description", icon: "📋" },
    { text: "Create a performance review template", icon: "⭐" },
    { text: "Draft an HR policy document", icon: "📄" },
    { text: "Design an onboarding program", icon: "🎓" },
  ],
};

export function ChatInterface({ mode, toolPrompt, messages, setMessages, onMessagesChange }: ChatInterfaceProps) {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isImageMode, setIsImageMode] = useState(false);
  const [generatingImage, setGeneratingImage] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const ModeIcon = getModeIcon(mode);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (toolPrompt) {
      if (toolPrompt.toLowerCase().startsWith("generate an image")) {
        setIsImageMode(true);
      }
      setInput(toolPrompt + " ");
      textareaRef.current?.focus();
    }
  }, [toolPrompt]);

  const handleImageGeneration = useCallback(async (prompt: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: `🎨 Generate image: ${prompt}`,
      timestamp: new Date(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setGeneratingImage(true);
    setIsLoading(true);

    try {
      const result = await generateImage({ prompt });

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `![Generated Image](${result.url})\n\n${result.revised_prompt ? `**Enhanced prompt:** ${result.revised_prompt}` : ""}`,
        timestamp: new Date(),
      };

      const finalMessages = [...newMessages, assistantMessage];
      setMessages(finalMessages);
      onMessagesChange?.(finalMessages);
    } catch (error) {
      toast({
        title: "Image Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate image",
        variant: "destructive",
      });
    } finally {
      setGeneratingImage(false);
      setIsLoading(false);
    }
  }, [messages, setMessages, onMessagesChange]);

  const sendMessage = useCallback(async (messageContent: string, previousMessages: Message[]) => {
    if (isImageMode) {
      await handleImageGeneration(messageContent);
      return;
    }

    const fileContext = attachedFiles.length > 0
      ? `\n\n[Attached files: ${attachedFiles.map(f => f.name).join(", ")}]`
      : "";

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: messageContent + fileContext,
      timestamp: new Date(),
    };

    const newMessages = [...previousMessages, userMessage];
    setMessages(newMessages);
    setInput("");
    setAttachedFiles([]);
    setIsLoading(true);

    let assistantContent = "";

    await streamChat({
      messages: newMessages,
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
        setMessages((prev) => {
          const final = prev.map((m) => (m.id === "streaming" ? { ...m, id: Date.now().toString() } : m));
          onMessagesChange?.(final);
          return final;
        });
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
  }, [mode, isImageMode, attachedFiles, handleImageGeneration, setMessages, onMessagesChange]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    await sendMessage(input, messages);
  };

  const handleRegenerate = useCallback(async (messageIndex: number) => {
    const userMessageIndex = messageIndex - 1;
    if (userMessageIndex < 0) return;
    const userMessage = messages[userMessageIndex];
    if (userMessage.role !== "user") return;
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
    if (prompt.toLowerCase().includes("generate an image") || prompt.toLowerCase().includes("generate a")) {
      setIsImageMode(true);
    }
    setInput(prompt);
    textareaRef.current?.focus();
  };

  const handleFileAttach = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachedFiles((prev) => [...prev, ...files].slice(0, 5));
    e.target.value = "";
  };

  const removeFile = (index: number) => {
    setAttachedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="flex flex-col h-full">
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
                  <p className="text-muted-foreground text-lg max-w-md mx-auto">
                    Your AI-powered workspace for {getModeName(mode).toLowerCase()}.
                    Generate text, images, and more.
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
                <p className="text-xs text-muted-foreground pt-4">
                  Press <kbd className="px-1.5 py-0.5 rounded border border-border bg-muted text-[10px] font-mono">⌘K</kbd> for command palette
                </p>
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
                <div className="flex items-center gap-2">
                  {generatingImage ? (
                    <>
                      <ImageIcon className="h-4 w-4 animate-pulse" />
                      <span className="text-xs text-muted-foreground">Generating image...</span>
                    </>
                  ) : (
                    <div className="flex gap-1">
                      <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "0ms" }} />
                      <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "150ms" }} />
                      <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="luxury-border border-t p-4 bg-background/80 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto">
          {/* Attached files */}
          {attachedFiles.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {attachedFiles.map((file, i) => (
                <Badge key={i} variant="secondary" className="gap-1 pr-1">
                  <Paperclip className="h-3 w-3" />
                  <span className="text-xs max-w-[120px] truncate">{file.name}</span>
                  <button onClick={() => removeFile(i)} className="ml-1 hover:bg-muted rounded-full p-0.5">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}

          <div className="relative flex items-end gap-2 luxury-glass rounded-xl p-2">
            <div className="flex gap-1 px-1">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={handleFileChange}
                accept=".txt,.pdf,.doc,.docx,.csv,.json,.md,.png,.jpg,.jpeg,.gif,.webp"
              />
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                    onClick={handleFileAttach}
                  >
                    <Paperclip className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Attach files</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={isImageMode ? "default" : "ghost"}
                    size="icon"
                    className={cn("h-8 w-8", !isImageMode && "text-muted-foreground hover:text-foreground")}
                    onClick={() => setIsImageMode(!isImageMode)}
                  >
                    <ImageIcon className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{isImageMode ? "Switch to text mode" : "Switch to image generation"}</TooltipContent>
              </Tooltip>
            </div>

            <div className="flex-1 relative">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={isImageMode ? "Describe the image you want to create..." : "Ask Cardinal GPT anything..."}
                className="min-h-[48px] max-h-[200px] resize-none border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 p-2"
                rows={1}
              />
            </div>

            <div className="flex gap-1 px-1">
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
              Powered by OpenAI {isImageMode ? "DALL·E 3" : "GPT-4o-mini"}
            </p>
            <span className="text-muted-foreground/50">•</span>
            <Badge variant="outline" className="text-xs">
              <Wand2 className="h-3 w-3 mr-1" />
              {getModeName(mode)}
            </Badge>
            {isImageMode && (
              <>
                <span className="text-muted-foreground/50">•</span>
                <Badge className="text-xs bg-primary/20 text-primary border-primary/30">
                  <ImageIcon className="h-3 w-3 mr-1" />
                  Image Mode
                </Badge>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
