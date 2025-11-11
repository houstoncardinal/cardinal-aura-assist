import { useState } from "react";
import { MessageSquare, Plus, Settings, User, LogOut, Menu, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
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

interface ChatLayoutProps {
  children: (props: { mode: IndustryMode; toolPrompt?: string }) => React.ReactNode;
}

export function ChatLayout({ children }: ChatLayoutProps) {
  const [selectedMode, setSelectedMode] = useState<IndustryMode>("general");
  const [toolPrompt, setToolPrompt] = useState<string | undefined>();
  const [showModeSelector, setShowModeSelector] = useState(true);
  const [showToolPanel, setShowToolPanel] = useState(true);
  const [conversations] = useState([
    { id: "1", title: "Product Strategy Discussion", timestamp: "2 hours ago" },
    { id: "2", title: "Market Analysis Q4", timestamp: "Yesterday" },
    { id: "3", title: "Technical Architecture Review", timestamp: "3 days ago" },
  ]);

  const ModeIcon = getModeIcon(selectedMode);

  const handleToolSelect = (prompt: string) => {
    setToolPrompt(prompt);
    setTimeout(() => setToolPrompt(undefined), 100);
  };

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="p-4 luxury-border border-b">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold tracking-tight">Cardinal GPT</h1>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary text-primary-foreground font-semibold">C</AvatarFallback>
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

        <Button className="w-full justify-start luxury-shadow hover:luxury-shadow-hover transition-all group" size="lg">
          <Plus className="mr-2 h-4 w-4 group-hover:rotate-90 transition-transform duration-300" />
          New Conversation
        </Button>
      </div>

      {/* Conversations */}
      <ScrollArea className="flex-1 px-2">
        <div className="space-y-1 py-2">
          {conversations.map((conv) => (
            <button
              key={conv.id}
              className="w-full text-left px-3 py-3 rounded-lg hover:bg-muted/50 transition-all duration-200 group hover:scale-[1.02]"
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                  <MessageSquare className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate text-foreground group-hover:text-primary transition-colors">
                    {conv.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">{conv.timestamp}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-80 luxury-border border-r">
        <SidebarContent />
      </aside>

      {/* Mobile Header & Sidebar */}
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
        {/* Mode Bar */}
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

        {/* Chat + Tools */}
        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1">
            {children({ mode: selectedMode, toolPrompt })}
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
