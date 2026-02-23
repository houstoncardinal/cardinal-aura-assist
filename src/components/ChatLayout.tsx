import { useState, useCallback, useEffect } from "react";
import { MessageSquare, Plus, Menu, Trash2, Command as CommandIcon, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { IndustryMode, ModeSelector, getModeName, getModeIcon } from "./ModeSelector";
import { ToolPanel } from "./ToolPanel";
import { ThemeToggle } from "./ThemeToggle";
import { CommandPalette } from "./CommandPalette";
import { Message } from "@/lib/chat";
import {
  Conversation,
  loadConversations,
  saveConversation,
  deleteConversation,
  generateTitle,
} from "@/lib/chat-history";
import { cn } from "@/lib/utils";

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
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const [theme, setTheme] = useState<"light" | "dark">(() => {
    return document.documentElement.classList.contains("dark") ? "dark" : "light";
  });

  useEffect(() => {
    setConversations(loadConversations());
  }, []);

  const ModeIcon = getModeIcon(selectedMode);

  const handleToolSelect = (prompt: string) => {
    setToolPrompt(prompt);
    setTimeout(() => setToolPrompt(undefined), 100);
  };

  const handleNewConversation = useCallback(() => {
    setMessages([]);
    setActiveConversationId(null);
  }, []);

  const handleMessagesChange = useCallback((newMessages: Message[]) => {
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
  }, [activeConversationId, selectedMode]);

  const handleLoadConversation = useCallback((conv: Conversation) => {
    setMessages(conv.messages.map(m => ({ ...m, timestamp: new Date(m.timestamp) })));
    setActiveConversationId(conv.id);
    setSelectedMode(conv.mode);
  }, []);

  const handleDeleteConversation = useCallback((id: string) => {
    deleteConversation(id);
    setConversations(loadConversations());
    if (activeConversationId === id) {
      setMessages([]);
      setActiveConversationId(null);
    }
  }, [activeConversationId]);

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

      {/* Conversation list */}
      <ScrollArea className="flex-1 px-2">
        <div className="space-y-0.5 py-3">
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider px-3 mb-2">History</p>
          {conversations.length === 0 ? (
            <div className="text-center py-12 px-4">
              <div className="w-12 h-12 rounded-xl glass mx-auto mb-3 flex items-center justify-center">
                <MessageSquare className="h-5 w-5 text-muted-foreground/50" />
              </div>
              <p className="text-xs text-muted-foreground">No conversations yet</p>
              <p className="text-[10px] text-muted-foreground/50 mt-1">Start a new chat to begin</p>
            </div>
          ) : (
            conversations.map((conv) => (
              <div
                key={conv.id}
                className={cn(
                  "w-full text-left px-3 py-2.5 rounded-xl transition-all duration-200 group flex items-center gap-3 cursor-pointer",
                  activeConversationId === conv.id
                    ? "glass bg-primary/5"
                    : "hover:bg-muted/50"
                )}
                onClick={() => handleLoadConversation(conv)}
              >
                <MessageSquare className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate">{conv.title}</p>
                  <p className="text-[10px] text-muted-foreground">{new Date(conv.updatedAt).toLocaleDateString()}</p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDeleteConversation(conv.id); }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-destructive/10 rounded-lg"
                >
                  <Trash2 className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                </button>
              </div>
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
          <p className="text-[10px] text-muted-foreground">8 industry modes • AI text & image</p>
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

      {/* Desktop Sidebar */}
      <aside className={cn(
        "hidden lg:flex flex-col border-r border-border/30 transition-all duration-300",
        sidebarCollapsed ? "w-0 overflow-hidden" : "w-72"
      )}>
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

          {showModeSelector && (
            <div className="animate-scale-in">
              <ModeSelector
                selectedMode={selectedMode}
                onModeChange={(mode) => {
                  setSelectedMode(mode);
                  setShowModeSelector(false);
                }}
              />
            </div>
          )}
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
          {showToolPanel && (
            <aside className="hidden lg:block w-72 animate-slide-in-right">
              <ToolPanel mode={selectedMode} onToolSelect={handleToolSelect} />
            </aside>
          )}
        </div>
      </main>
    </div>
  );
}
