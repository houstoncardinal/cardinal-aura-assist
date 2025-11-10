import { useState } from "react";
import { MessageSquare, Plus, Settings, User, LogOut, Menu } from "lucide-react";
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

interface ChatLayoutProps {
  children: React.ReactNode;
}

export function ChatLayout({ children }: ChatLayoutProps) {
  const [conversations] = useState([
    { id: "1", title: "Product Strategy Discussion", timestamp: "2 hours ago" },
    { id: "2", title: "Market Analysis Q4", timestamp: "Yesterday" },
    { id: "3", title: "Technical Architecture Review", timestamp: "3 days ago" },
  ]);

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border/50">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold text-gradient">Cardinal GPT</h1>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary/10 text-primary">C</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 glass-panel">
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <Button className="w-full justify-start glow-sm" size="lg">
          <Plus className="mr-2 h-4 w-4" />
          New Conversation
        </Button>
      </div>

      {/* Conversations */}
      <ScrollArea className="flex-1 px-2">
        <div className="space-y-1 py-2">
          {conversations.map((conv) => (
            <button
              key={conv.id}
              className="w-full text-left px-3 py-3 rounded-lg hover:bg-muted/50 transition-all duration-200 group"
            >
              <div className="flex items-start gap-3">
                <MessageSquare className="h-4 w-4 text-muted-foreground mt-0.5 group-hover:text-primary transition-colors" />
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
    <div className="flex h-screen bg-background gradient-mesh overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-80 border-r border-border/50 glass-panel">
        <SidebarContent />
      </aside>

      {/* Mobile Header & Sidebar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 border-b border-border/50 glass-panel">
        <div className="flex items-center justify-between p-4">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 p-0 glass-panel">
              <SidebarContent />
            </SheetContent>
          </Sheet>
          <h1 className="text-lg font-semibold text-gradient">Cardinal GPT</h1>
          <div className="w-10" /> {/* Spacer for centering */}
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col lg:pt-0 pt-16">
        {children}
      </main>
    </div>
  );
}
