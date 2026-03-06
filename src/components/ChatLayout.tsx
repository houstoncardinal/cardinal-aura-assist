import { useState, useCallback, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare, Plus, Menu, Trash2, Search, Pin, PinOff,
  Download, Wand2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { IndustryMode, ModeSelector, getModeName, getModeIcon } from "./ModeSelector";
import { ToolPanel } from "./ToolPanel";
import { ThemeToggle } from "./ThemeToggle";
import { CommandPalette } from "./CommandPalette";
import { KeyboardShortcuts } from "./KeyboardShortcuts";
import { Message } from "@/lib/chat";
import {
  Conversation,
  loadConversations,
  saveConversation,
  deleteConversation,
  togglePin,
  exportConversation,
  generateTitle,
} from "@/lib/chat-history";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

interface ChatLayoutProps {
  children: (props: {
    mode: IndustryMode;
    toolPrompt?: string;
    messages: Message[];
    setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
    onMessagesChange: (messages: Message[]) => void;
  }) => React.ReactNode;
}

export function ChatLayout({ children }: ChatLayoutProps) {
  const [selectedMode, setSelectedMode] = useState<IndustryMode>("general");
  const [toolPrompt, setToolPrompt] = useState<string | undefined>();
  const [showModeSelector, setShowModeSelector] = useState(false);
  const [showToolPanel, setShowToolPanel] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [mobileToolsOpen, setMobileToolsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [theme, setTheme] = useState<"light" | "dark">(() => {
    return document.documentElement.classList.contains("dark") ? "dark" : "light";
  });

  useEffect(() => {
    setConversations(loadConversations());
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isTyping = target.matches("input, textarea, [contenteditable]");

      if (e.key === "?" && !isTyping) {
        e.preventDefault();
        setShortcutsOpen(true);
      }
      if (e.key === "n" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        handleNewConversation();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const ModeIcon = getModeIcon(selectedMode);

  // Filter & sort conversations
  const sortedConversations = useMemo(() => {
    let filtered = conversations;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = conversations.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.messages.some((m) => m.content.toLowerCase().includes(q))
      );
    }
    return [...filtered].sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
  }, [conversations, searchQuery]);

  const handleToolSelect = (prompt: string) => {
    setToolPrompt(prompt);
    setTimeout(() => setToolPrompt(undefined), 100);
  };

  const handleNewConversation = useCallback(() => {
    setMessages([]);
    setActiveConversationId(null);
  }, []);

  const handleMessagesChange = useCallback(
    (newMessages: Message[]) => {
      if (newMessages.length === 0) return;
      const id = activeConversationId || crypto.randomUUID();
      const conv: Conversation = {
        id,
        title: generateTitle(newMessages),
        mode: selectedMode,
        messages: newMessages,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      saveConversation(conv);
      setActiveConversationId(id);
      setConversations(loadConversations());
    },
    [activeConversationId, selectedMode]
  );

  const handleLoadConversation = useCallback((conv: Conversation) => {
    setMessages(conv.messages.map((m) => ({ ...m, timestamp: new Date(m.timestamp) })));
    setActiveConversationId(conv.id);
    setSelectedMode(conv.mode);
  }, []);

  const handleDeleteConversation = useCallback(
    (id: string) => {
      deleteConversation(id);
      setConversations(loadConversations());
      if (activeConversationId === id) {
        setMessages([]);
        setActiveConversationId(null);
      }
    },
    [activeConversationId]
  );

  const handleTogglePin = useCallback((id: string) => {
    togglePin(id);
    setConversations(loadConversations());
  }, []);

  const handleExport = useCallback((conv: Conversation) => {
    const md = exportConversation(conv);
    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${conv.title.replace(/[^a-z0-9]/gi, "-").slice(0, 50)}.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ description: "Conversation exported as Markdown" });
  }, []);

  const toggleTheme = useCallback(() => {
    const root = document.documentElement;
    const newTheme = theme === "light" ? "dark" : "light";
    root.classList.remove(theme);
    root.classList.add(newTheme);
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  }, [theme]);

  const SidebarContent = ({ isMobile = false }: { isMobile?: boolean }) => (
    <div className="flex h-full flex-col">
      {/* Brand header */}
      <div className="p-4 pb-3">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl glass glow-border flex items-center justify-center">
              <span className="font-display font-bold text-sm">C</span>
            </div>
            <div>
              <h1 className="text-base font-display font-bold tracking-tight">Cardinal</h1>
              <p className="text-[10px] text-muted-foreground -mt-0.5">GPT Platform</p>
            </div>
          </div>
          <ThemeToggle />
        </div>

        <div className="space-y-2">
          <Button
            className="w-full justify-start gap-2 h-10 rounded-xl glass-subtle hover:bg-primary/10 border-0 transition-all group"
            variant="outline"
            onClick={handleNewConversation}
          >
            <Plus className="h-4 w-4 group-hover:rotate-90 transition-transform duration-300" />
            <span className="text-sm">New Chat</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-xs text-muted-foreground h-8 rounded-lg"
            onClick={() => setCommandOpen(true)}
          >
            <Search className="mr-2 h-3 w-3" />
            Search...
            <kbd className="ml-auto glass-subtle rounded px-1.5 py-0.5 text-[9px] font-mono">⌘K</kbd>
          </Button>
        </div>
      </div>

      {/* Divider */}
      <div className="mx-4 h-px bg-border/50" />

      {/* Search conversations */}
      <div className="px-3 pt-3">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
          <Input
            placeholder="Search history..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-8 pl-8 text-xs rounded-lg glass-subtle border-border/30 focus-visible:ring-1"
          />
        </div>
      </div>

      {/* Conversation list */}
      <ScrollArea className="flex-1 px-2">
        <div className="space-y-0.5 py-3">
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider px-3 mb-2">
            History {searchQuery && `(${sortedConversations.length})`}
          </p>
          {sortedConversations.length === 0 ? (
            <div className="text-center py-12 px-4">
              <div className="w-12 h-12 rounded-xl glass mx-auto mb-3 flex items-center justify-center">
                <MessageSquare className="h-5 w-5 text-muted-foreground/50" />
              </div>
              <p className="text-xs text-muted-foreground">
                {searchQuery ? "No results found" : "No conversations yet"}
              </p>
              <p className="text-[10px] text-muted-foreground/50 mt-1">
                {searchQuery ? "Try a different search" : "Start a new chat to begin"}
              </p>
            </div>
          ) : (
            sortedConversations.map((conv) => (
              <motion.div
                key={conv.id}
                layout
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className={cn(
                  "w-full text-left px-3 py-2.5 rounded-xl transition-all duration-200 group flex items-center gap-3 cursor-pointer relative",
                  activeConversationId === conv.id
                    ? "glass bg-primary/5"
                    : "hover:bg-muted/50"
                )}
                onClick={() => handleLoadConversation(conv)}
              >
                {conv.pinned && (
                  <Pin className="h-2.5 w-2.5 text-primary/50 absolute top-1.5 right-1.5 fill-primary/30" />
                )}
                <MessageSquare className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate">{conv.title}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {new Date(conv.updatedAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTogglePin(conv.id);
                    }}
                    className="p-1 hover:bg-muted rounded-lg"
                    title={conv.pinned ? "Unpin" : "Pin"}
                  >
                    {conv.pinned ? (
                      <PinOff className="h-3 w-3 text-muted-foreground" />
                    ) : (
                      <Pin className="h-3 w-3 text-muted-foreground" />
                    )}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleExport(conv);
                    }}
                    className="p-1 hover:bg-muted rounded-lg"
                    title="Export"
                  >
                    <Download className="h-3 w-3 text-muted-foreground" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteConversation(conv.id);
                    }}
                    className="p-1 hover:bg-destructive/10 rounded-lg"
                    title="Delete"
                  >
                    <Trash2 className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </ScrollArea>

      {/* Bottom section */}
      <div className="p-4 pt-2">
        <div className="glass-subtle rounded-xl p-3">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full bg-primary/60 animate-pulse" />
            <span className="text-[11px] font-medium">Enterprise Ready</span>
          </div>
          <p className="text-[10px] text-muted-foreground">
            8 modes • Text & Image AI • Voice input
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-background overflow-hidden mesh-bg">
      <CommandPalette
        open={commandOpen}
        onOpenChange={setCommandOpen}
        onModeChange={setSelectedMode}
        onNewConversation={handleNewConversation}
        onToolSelect={handleToolSelect}
        onToggleTheme={toggleTheme}
        currentTheme={theme}
      />
      <KeyboardShortcuts open={shortcutsOpen} onOpenChange={setShortcutsOpen} />

      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden lg:flex flex-col border-r border-border/30 transition-all duration-300",
          sidebarCollapsed ? "w-0 overflow-hidden" : "w-72"
        )}
      >
        <SidebarContent />
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 glass-strong border-b border-border/30">
        <div className="flex items-center justify-between px-3 py-2.5 safe-area-inset">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 p-0 glass-strong border-r border-border/30">
              <SidebarContent isMobile />
            </SheetContent>
          </Sheet>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg glass flex items-center justify-center">
              <span className="font-display font-bold text-xs">C</span>
            </div>
            <span className="text-sm font-display font-semibold">Cardinal GPT</span>
          </div>
          <ThemeToggle />
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col lg:pt-0 pt-[52px]">
        {/* Top toolbar */}
        <div className="glass-subtle border-b border-border/30">
          <div className="flex items-center justify-between px-3 sm:px-4 py-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowModeSelector(!showModeSelector)}
              className="gap-2 group rounded-xl h-9 hover:bg-primary/5 transition-all"
            >
              <div className="w-7 h-7 rounded-lg glass flex items-center justify-center group-hover:scale-105 transition-transform">
                <ModeIcon className="h-3.5 w-3.5" />
              </div>
              <span className="font-medium text-sm hidden sm:inline">{getModeName(selectedMode)}</span>
              <span className="font-medium text-xs sm:hidden">{getModeName(selectedMode)}</span>
            </Button>

            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="hidden lg:flex h-8 rounded-lg text-xs text-muted-foreground"
              >
                {sidebarCollapsed ? "Show sidebar" : "Hide sidebar"}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowToolPanel(!showToolPanel)}
                className="hidden lg:flex h-8 rounded-lg text-xs text-muted-foreground"
              >
                {showToolPanel ? "Hide tools" : "Tools"}
              </Button>
            </div>
          </div>

          <AnimatePresence>
            {showModeSelector && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25 }}
              >
                <ModeSelector
                  selectedMode={selectedMode}
                  onModeChange={(mode) => {
                    setSelectedMode(mode);
                    setShowModeSelector(false);
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Chat + Tools */}
        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1">
            {children({
              mode: selectedMode,
              toolPrompt,
              messages,
              setMessages,
              onMessagesChange: handleMessagesChange,
            })}
          </div>
          <AnimatePresence>
            {showToolPanel && (
              <motion.aside
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 288, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="hidden lg:block overflow-hidden"
              >
                <ToolPanel mode={selectedMode} onToolSelect={handleToolSelect} />
              </motion.aside>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Mobile Tools FAB */}
      <div className="lg:hidden fixed bottom-20 right-4 z-40">
        <Sheet open={mobileToolsOpen} onOpenChange={setMobileToolsOpen}>
          <SheetTrigger asChild>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                size="icon"
                className="h-12 w-12 rounded-xl glass-strong shadow-lg border border-border/30"
              >
                <Wand2 className="h-5 w-5" />
              </Button>
            </motion.div>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[60vh] rounded-t-2xl glass-strong p-0">
            <ToolPanel
              mode={selectedMode}
              onToolSelect={(p) => {
                handleToolSelect(p);
                setMobileToolsOpen(false);
              }}
            />
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}
