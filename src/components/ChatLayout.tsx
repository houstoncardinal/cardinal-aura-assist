import { useState, useCallback, useEffect } from "react";
import { MessageSquare, Plus, Settings, User, LogOut, Menu, ChevronLeft, ChevronRight, Sparkles, Trash2, Command as CommandIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  const [showToolPanel, setShowToolPanel] = useState(true);
  const [commandOpen, setCommandOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);

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

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      <div className="p-4 luxury-border border-b">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold tracking-tight">Cardinal GPT</h1>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-primary-foreground font-semibold text-xs">C</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 luxury-glass">
                <DropdownMenuItem className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="space-y-2">
          <Button
            className="w-full justify-start luxury-shadow hover:luxury-shadow-hover transition-all group"
            size="lg"
            onClick={handleNewConversation}
          >
            <Plus className="mr-2 h-4 w-4 group-hover:rotate-90 transition-transform duration-300" />
            New Conversation
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start text-xs text-muted-foreground"
            onClick={() => setCommandOpen(true)}
          >
            <CommandIcon className="mr-2 h-3 w-3" />
            Command Palette
            <kbd className="ml-auto px-1.5 py-0.5 rounded border border-border bg-muted text-[10px] font-mono">⌘K</kbd>
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1 px-2">
        <div className="space-y-1 py-2">
          {conversations.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-8">No conversations yet</p>
          ) : (
            conversations.map((conv) => (
              <div
                key={conv.id}
                className={cn(
                  "w-full text-left px-3 py-3 rounded-lg transition-all duration-200 group hover:scale-[1.01] flex items-start gap-3 cursor-pointer",
                  activeConversationId === conv.id
                    ? "bg-primary/10 border border-primary/20"
                    : "hover:bg-muted/50"
                )}
                onClick={() => handleLoadConversation(conv)}
              >
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                  <MessageSquare className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate text-foreground group-hover:text-primary transition-colors">
                    {conv.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {new Date(conv.updatedAt).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDeleteConversation(conv.id); }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-destructive/10 rounded"
                >
                  <Trash2 className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                </button>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );

  return (
    <div className="flex h-screen bg-background overflow-hidden">
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
      <aside className="hidden lg:flex w-80 luxury-border border-r">
        <SidebarContent />
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 luxury-border border-b luxury-glass">
        <div className="flex items-center justify-between p-4">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 p-0 luxury-glass">
              <SidebarContent />
            </SheetContent>
          </Sheet>
          <h1 className="text-lg font-bold tracking-tight">Cardinal GPT</h1>
          <ThemeToggle />
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col lg:pt-0 pt-16">
        <div className="luxury-border border-b">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowModeSelector(!showModeSelector)}
                className="gap-2 group hover:scale-105 transition-all"
              >
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-all">
                  <ModeIcon className="h-4 w-4" />
                </div>
                <div className="flex flex-col items-start">
                  <span className="text-xs text-muted-foreground">Mode</span>
                  <span className="font-semibold text-sm">{getModeName(selectedMode)}</span>
                </div>
                {showModeSelector ? <ChevronLeft className="h-3 w-3 ml-2" /> : <ChevronRight className="h-3 w-3 ml-2" />}
              </Button>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowToolPanel(!showToolPanel)}
              className="lg:flex hidden"
            >
              {showToolPanel ? "Hide Tools" : "Show Tools"}
            </Button>
          </div>

          {showModeSelector && (
            <div className="animate-fade-in-up">
              <ModeSelector selectedMode={selectedMode} onModeChange={setSelectedMode} />
            </div>
          )}
        </div>

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
            <aside className="hidden lg:block w-80 animate-slide-in-right">
              <ToolPanel mode={selectedMode} onToolSelect={handleToolSelect} />
            </aside>
          )}
        </div>
      </main>
    </div>
  );
}
