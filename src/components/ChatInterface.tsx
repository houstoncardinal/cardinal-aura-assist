import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Paperclip, Image as ImageIcon, X, ArrowUp, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { streamChat, Message } from "@/lib/chat";
import { generateImage } from "@/lib/image-gen";
import { IndustryMode, getModeName, getModeIcon } from "./ModeSelector";
import { MessageContent } from "./MessageContent";
import { MessageActions } from "./MessageActions";
import { AIAvatar } from "./AIAvatar";
import { ConstellationAvatar } from "./ConstellationAvatar";
import { VoiceInput } from "./VoiceInput";
import { SmartSuggestions } from "./SmartSuggestions";
import { NeuralNetwork } from "./NeuralNetwork";
import { DeepThinkToggle } from "./DeepThinkToggle";
import { playSound } from "@/lib/sounds";
import { toast } from "@/hooks/use-toast";

interface ChatInterfaceProps {
  mode: IndustryMode;
  toolPrompt?: string;
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  onMessagesChange?: (messages: Message[]) => void;
}

const quickPromptsByMode: Record<IndustryMode, { text: string; icon: string; label: string }[]> = {
  general: [
    { text: "Summarize this document for me", icon: "📄", label: "Summarize" },
    { text: "Help me brainstorm creative ideas", icon: "💡", label: "Brainstorm" },
    { text: "Analyze this data and provide insights", icon: "📊", label: "Analyze" },
    { text: "Generate an image of a futuristic cityscape", icon: "🎨", label: "Create" },
  ],
  "real-estate": [
    { text: "Create a compelling property listing", icon: "🏠", label: "Listing" },
    { text: "Analyze current market trends in my area", icon: "📈", label: "Market" },
    { text: "Generate an image of a luxury modern home", icon: "🎨", label: "Visualize" },
    { text: "Draft a buyer consultation script", icon: "🤝", label: "Consult" },
  ],
  healthcare: [
    { text: "Summarize patient records", icon: "📋", label: "Summarize" },
    { text: "Research latest treatment protocols", icon: "🔬", label: "Research" },
    { text: "Create patient education materials", icon: "📚", label: "Educate" },
    { text: "Generate a medical infographic concept", icon: "🎨", label: "Visualize" },
  ],
  education: [
    { text: "Create an engaging lesson plan", icon: "📚", label: "Plan" },
    { text: "Design a comprehensive assessment", icon: "📝", label: "Assess" },
    { text: "Generate an educational illustration", icon: "🎨", label: "Illustrate" },
    { text: "Build a differentiated learning activity", icon: "🎯", label: "Differentiate" },
  ],
  legal: [
    { text: "Review and analyze this contract", icon: "📜", label: "Review" },
    { text: "Research relevant case law", icon: "⚖️", label: "Research" },
    { text: "Draft a legal memorandum", icon: "📄", label: "Draft" },
    { text: "Create a due diligence checklist", icon: "✅", label: "Checklist" },
  ],
  finance: [
    { text: "Analyze these financial statements", icon: "📊", label: "Analyze" },
    { text: "Create a financial forecast model", icon: "📈", label: "Forecast" },
    { text: "Generate an investment dashboard mockup", icon: "🎨", label: "Visualize" },
    { text: "Build a detailed budget plan", icon: "🧮", label: "Budget" },
  ],
  tech: [
    { text: "Review and optimize this code", icon: "💻", label: "Review" },
    { text: "Write comprehensive documentation", icon: "📝", label: "Document" },
    { text: "Design system architecture", icon: "🏗️", label: "Architect" },
    { text: "Generate a UI mockup concept", icon: "🎨", label: "Design" },
  ],
  hr: [
    { text: "Write a compelling job description", icon: "📋", label: "JD" },
    { text: "Create a performance review template", icon: "⭐", label: "Review" },
    { text: "Draft an HR policy document", icon: "📄", label: "Policy" },
    { text: "Design an onboarding program", icon: "🎓", label: "Onboard" },
  ],
};

async function readFileContents(files: File[]): Promise<string> {
  const parts: string[] = [];
  for (const file of files) {
    if (
      file.type.startsWith("text/") ||
      /\.(txt|md|csv|json|xml|html|css|js|ts|tsx|py|rb|go|rs|java|yaml|toml)$/i.test(file.name)
    ) {
      try {
        const text = await file.text();
        parts.push(`--- File: ${file.name} ---\n${text.slice(0, 8000)}\n--- End of ${file.name} ---`);
      } catch {
        parts.push(`[Attached file: ${file.name} — could not read]`);
      }
    } else {
      parts.push(`[Attached file: ${file.name} (${file.type || "unknown type"}, ${(file.size / 1024).toFixed(1)}KB)]`);
    }
  }
  return parts.join("\n\n");
}

export function ChatInterface({ mode, toolPrompt, messages, setMessages, onMessagesChange }: ChatInterfaceProps) {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [deepThink, setDeepThink] = useState(false);
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
    playSound("send");

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
      playSound("receive");
    } catch (error) {
      toast({ title: "Image Generation Failed", description: error instanceof Error ? error.message : "Failed to generate image", variant: "destructive" });
      playSound("error");
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

    let fileContext = "";
    if (attachedFiles.length > 0) {
      fileContext = "\n\n" + (await readFileContents(attachedFiles));
    }

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
    playSound("send");

    let assistantContent = "";

    await streamChat({
      messages: newMessages,
      mode,
      deepThink,
      onDelta: (chunk) => {
        assistantContent += chunk;
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          if (last?.role === "assistant" && last.id === "streaming") {
            return prev.map((m) => (m.id === "streaming" ? { ...m, content: assistantContent } : m));
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
        playSound("receive");
      },
      onError: (error) => {
        toast({ title: "Error", description: error, variant: "destructive" });
        setMessages((prev) => prev.filter((m) => m.id !== "streaming"));
        setIsLoading(false);
        playSound("error");
      },
    });
  }, [mode, deepThink, isImageMode, attachedFiles, handleImageGeneration, setMessages, onMessagesChange]);

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

  const handleFileAttach = () => fileInputRef.current?.click();
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachedFiles((prev) => [...prev, ...files].slice(0, 5));
    e.target.value = "";
  };
  const removeFile = (index: number) => setAttachedFiles((prev) => prev.filter((_, i) => i !== index));

  const lastAssistant = messages.filter((m) => m.role === "assistant" && m.id !== "streaming").pop();

  return (
    <div className="flex flex-col h-full relative">
      {/* Ambient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="orb orb-1 -top-48 -right-48" />
        <div className="orb orb-2 top-1/2 -left-32" />
        <div className="orb orb-3 -bottom-32 right-1/4" />
      </div>

      <ScrollArea ref={scrollRef} className="flex-1 px-3 sm:px-4 py-4 sm:py-6 relative z-10">
        <div className="max-w-3xl mx-auto space-y-5">
          {/* Welcome State */}
          <AnimatePresence>
            {messages.length === 0 && (
              <motion.div
                key="welcome"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.45 }}
                className="px-2 sm:px-4 pt-6 sm:pt-10 pb-4"
              >
                <div className="max-w-5xl w-full mx-auto relative">
                  {/* Aurora */}
                  <div className="aurora opacity-70" />

                  {/* Hero — Neural Constellation + serif title */}
                  <div className="relative flex flex-col items-center text-center pt-6 sm:pt-10 pb-10 sm:pb-14">
                    <motion.div
                      initial={{ scale: 0.85, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.05, type: "spring", stiffness: 180, damping: 18 }}
                      className="mb-6 sm:mb-8"
                    >
                      <ConstellationAvatar size={132} />
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.18, duration: 0.55 }}
                      className="inline-flex items-center gap-2 glass-subtle rounded-full px-3.5 py-1 mb-5"
                    >
                      <div className="size-1.5 rounded-full bg-gold animate-pulse" />
                      <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-gold">
                        {getModeName(mode)} • Live
                      </span>
                    </motion.div>

                    <motion.h1
                      initial={{ opacity: 0, y: 18 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.22, duration: 0.6 }}
                      className="font-display italic text-5xl sm:text-6xl lg:text-7xl leading-[1.02] text-gold-bright mb-4"
                    >
                      Cardinal GPT
                    </motion.h1>

                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.32, duration: 0.5 }}
                      className="max-w-xl text-sm sm:text-base text-foreground/55 font-light leading-relaxed"
                    >
                      Sophisticated intelligence for the modern enterprise. Navigate the complexity of industry data with cinematic precision.
                    </motion.p>
                  </div>

                  {/* Bento Grid — high-density editorial */}
                  <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.42, duration: 0.6 }}
                    className="grid grid-cols-1 sm:grid-cols-12 gap-3 sm:gap-4 pb-4"
                  >
                    {(() => {
                      const prompts = quickPromptsByMode[mode] || quickPromptsByMode.general;
                      // 4 cards mapped to bento slots
                      const spans = [
                        "sm:col-span-4 sm:row-span-2 min-h-[220px] sm:min-h-[280px]",
                        "sm:col-span-8 min-h-[120px]",
                        "sm:col-span-4 min-h-[120px]",
                        "sm:col-span-4 min-h-[120px]",
                      ];
                      const labels = ["Intelligent Synthesis", "Creative Engine", "Deep Analysis", "Visual Studio"];
                      return prompts.slice(0, 4).map((p, i) => (
                        <motion.button
                          key={p.text}
                          initial={{ opacity: 0, y: 14 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.5 + i * 0.07, duration: 0.45 }}
                          whileHover={{ y: -3 }}
                          whileTap={{ scale: 0.985 }}
                          onClick={() => handleQuickPrompt(p.text)}
                          className={cn(
                            "group relative overflow-hidden text-left rounded-3xl p-5 sm:p-7 transition-all duration-300",
                            "bg-card border border-[hsl(var(--gold)/0.12)] hover:border-[hsl(var(--gold)/0.5)]",
                            "hover:shadow-[0_18px_50px_hsl(var(--gold)/0.08)]",
                            spans[i]
                          )}
                        >
                          {/* Inner gold shimmer on hover */}
                          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                               style={{ background: "radial-gradient(circle at 80% 0%, hsl(var(--gold) / 0.08), transparent 60%)" }} />

                          {i === 0 ? (
                            <div className="relative h-full flex flex-col justify-end">
                              <div className="absolute top-0 right-0 text-7xl sm:text-8xl opacity-15 group-hover:opacity-90 transition-opacity duration-500 leading-none">
                                {p.icon}
                              </div>
                              <span className="text-[10px] font-bold text-gold tracking-[0.3em] uppercase mb-2">{labels[i]}</span>
                              <h3 className="font-display text-2xl sm:text-3xl text-foreground mb-2 leading-tight">{p.label}</h3>
                              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed line-clamp-3">{p.text}</p>
                            </div>
                          ) : (
                            <div className="relative h-full flex items-center justify-between gap-4">
                              <div className="flex-1 min-w-0">
                                <span className="text-[10px] font-bold text-gold tracking-[0.3em] uppercase mb-1.5 block">{labels[i]}</span>
                                <h3 className="font-display text-xl sm:text-2xl text-foreground mb-1 leading-tight truncate">{p.label}</h3>
                                <p className="text-[11px] sm:text-xs text-muted-foreground line-clamp-2">{p.text}</p>
                              </div>
                              <div className="size-12 sm:size-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 border border-[hsl(var(--gold)/0.3)]"
                                   style={{ background: "linear-gradient(135deg, hsl(var(--card)), hsl(var(--gold) / 0.12))" }}>
                                {p.icon}
                              </div>
                            </div>
                          )}
                        </motion.button>
                      ));
                    })()}
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.9 }}
                    className="flex items-center justify-center gap-4 pt-2 pb-2"
                  >
                    <kbd className="glass-subtle rounded-lg px-2.5 py-1 text-[10px] font-mono text-muted-foreground">⌘K</kbd>
                    <span className="text-[10px] text-muted-foreground tracking-wide">Command palette</span>
                    <span className="text-muted-foreground/30">·</span>
                    <kbd className="glass-subtle rounded-lg px-2.5 py-1 text-[10px] font-mono text-muted-foreground">?</kbd>
                    <span className="text-[10px] text-muted-foreground tracking-wide">Shortcuts</span>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>


          {/* Messages */}
          <AnimatePresence mode="popLayout">
            {messages.map((message, index) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className={cn(
                  "flex gap-3 group",
                  message.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                {message.role === "assistant" && (
                  <AIAvatar isThinking={message.id === "streaming"} />
                )}

                <div className="flex flex-col max-w-[85%] sm:max-w-[75%]">
                  <motion.div
                    initial={{ scale: 0.97 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.2 }}
                    className={cn(
                      "rounded-2xl px-4 py-3 sm:px-5 sm:py-4 transition-all duration-200",
                      message.role === "user"
                        ? "bg-[hsl(var(--card))] border border-[hsl(var(--gold)/0.25)] text-foreground rounded-br-md"
                        : "glass rounded-bl-md"
                    )}

                  >
                    <MessageContent
                      content={message.content}
                      isUser={message.role === "user"}
                      isStreaming={message.id === "streaming"}
                    />
                  </motion.div>
                  {message.role === "assistant" && message.id !== "streaming" && (
                    <MessageActions
                      content={message.content}
                      onRegenerate={() => handleRegenerate(index)}
                      isLoading={isLoading}
                    />
                  )}
                </div>

                {message.role === "user" && (
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-xs font-semibold text-foreground/70">U</span>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Smart Suggestions */}
          {lastAssistant && !isLoading && (
            <SmartSuggestions content={lastAssistant.content} mode={mode} onSelect={handleQuickPrompt} />
          )}

          {/* Neural Network + Skeleton loading */}
          {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col gap-3"
            >
              <div className="flex gap-3">
                <AIAvatar isThinking size="sm" />
                <div className="glass rounded-2xl rounded-bl-md px-5 py-4 min-w-[200px] flex-1">
                  {generatingImage ? (
                    <div className="flex items-center gap-2">
                      <ImageIcon className="h-4 w-4 animate-pulse" />
                      <span className="text-xs text-muted-foreground">Creating your image...</span>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {deepThink && (
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                          <span className="text-[11px] font-medium text-primary/80">Deep thinking...</span>
                        </div>
                      )}
                      <div className="h-3 w-48 bg-muted/60 rounded-full shimmer" />
                      <div className="h-3 w-36 bg-muted/40 rounded-full shimmer" />
                      <div className="h-3 w-52 bg-muted/50 rounded-full shimmer" />
                    </div>
                  )}
                </div>
              </div>
              {/* Neural Network Visualization */}
              <div className="pl-12">
                <NeuralNetwork isActive={isLoading} className="max-w-xs h-28 opacity-60" />
              </div>
            </motion.div>
          )}
        </div>
      </ScrollArea>

      {/* Floating Input Area */}
      <div className="relative z-10 p-3 sm:p-4 pb-4 sm:pb-6">
        <div className="max-w-3xl mx-auto">
          {/* Attached files */}
          <AnimatePresence>
            {attachedFiles.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="flex flex-wrap gap-2 mb-2 px-1"
              >
                {attachedFiles.map((file, i) => (
                  <motion.div
                    key={file.name + i}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    className="glass-subtle rounded-lg flex items-center gap-2 px-3 py-1.5"
                  >
                    <Paperclip className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs max-w-[100px] truncate">{file.name}</span>
                    <button onClick={() => removeFile(i)} className="hover:bg-muted rounded-full p-0.5 transition-colors">
                      <X className="h-3 w-3" />
                    </button>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div
            layout
            className="relative rounded-[2rem] p-2.5 transition-all duration-300 group/dock focus-within:shadow-[0_20px_60px_rgba(0,0,0,0.55),0_0_0_1px_hsl(var(--gold)/0.5)]"
            style={{
              background: "hsl(var(--card) / 0.85)",
              backdropFilter: "blur(28px) saturate(180%)",
              WebkitBackdropFilter: "blur(28px) saturate(180%)",
              border: "1px solid hsl(var(--gold) / 0.28)",
              boxShadow: "0 18px 50px rgba(0,0,0,0.45)",
            }}
          >
            {isImageMode && (
              <div className="flex items-center gap-2 px-3 pb-1">
                <Badge className="text-[10px] bg-gold/10 text-gold border-[hsl(var(--gold)/0.3)] gap-1 h-5">
                  <ImageIcon className="h-2.5 w-2.5" />
                  Image Mode
                </Badge>
              </div>
            )}

            <div className="flex items-end gap-2">
              <div className="flex gap-0.5 px-1 pb-1 items-center border-r border-border/40 pr-2 mr-1">
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleFileChange}
                  accept=".txt,.pdf,.doc,.docx,.csv,.json,.md,.png,.jpg,.jpeg,.gif,.webp,.xml,.html,.css,.js,.ts,.tsx,.py,.rb,.go"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-xl text-muted-foreground hover:text-gold-bright hover:bg-[hsl(var(--gold)/0.08)] transition-colors"
                  onClick={handleFileAttach}
                  title="Attach files"
                >
                  <Paperclip className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "h-9 w-9 rounded-xl transition-colors",
                    isImageMode
                      ? "text-gold-bright bg-[hsl(var(--gold)/0.12)]"
                      : "text-muted-foreground hover:text-gold-bright hover:bg-[hsl(var(--gold)/0.08)]"
                  )}
                  onClick={() => setIsImageMode(!isImageMode)}
                  title="Image generation"
                >
                  <ImageIcon className="h-4 w-4" />
                </Button>
                <VoiceInput onTranscript={(t) => setInput(t)} disabled={isLoading} />
              </div>

              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={isImageMode ? "Describe the image you want to create..." : "What intelligence do you require?"}
                className="min-h-[48px] max-h-[180px] resize-none border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 p-2 text-sm sm:text-base placeholder:text-muted-foreground/40"
                rows={1}
              />

              <div className="flex items-center gap-2 px-1 pb-1">
                <DeepThinkToggle enabled={deepThink} onToggle={() => setDeepThink(!deepThink)} disabled={isLoading} />
                <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.94 }}>
                  <Button
                    onClick={handleSend}
                    disabled={!input.trim() || isLoading}
                    size="icon"
                    className="h-11 w-11 rounded-full text-[hsl(var(--noir))] border-0 disabled:opacity-40 disabled:saturate-50"
                    style={{
                      background: "linear-gradient(135deg, hsl(var(--gold)) 0%, hsl(var(--gold-bright)) 100%)",
                      boxShadow: "0 0 24px hsl(var(--gold) / 0.4)",
                    }}
                  >
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowUp className="h-5 w-5" strokeWidth={2.5} />}
                  </Button>
                </motion.div>
              </div>
            </div>
          </motion.div>

          <div className="flex items-center justify-center gap-2 mt-3">
            <p className="text-[9px] text-muted-foreground/50 uppercase tracking-[0.25em]">
              Proprietary LLM Platform • Cardinal GPT
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

