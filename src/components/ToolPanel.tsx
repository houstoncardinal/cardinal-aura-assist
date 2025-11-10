import { Search, FileText, Mail, Image, FileSpreadsheet, ClipboardList, Briefcase, Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { IndustryMode } from "./ModeSelector";

interface Tool {
  id: string;
  name: string;
  icon: React.ElementType;
  description: string;
  action: string;
}

const toolsByMode: Record<IndustryMode, Tool[]> = {
  general: [
    { id: "summarize", name: "Summarize", icon: FileText, description: "Condense long text", action: "Summarize this:" },
    { id: "search", name: "Web Search", icon: Search, description: "Search the web", action: "Search for:" },
    { id: "image", name: "Generate Image", icon: Image, description: "Create visuals", action: "Generate an image of:" },
    { id: "email", name: "Draft Email", icon: Mail, description: "Professional emails", action: "Draft an email about:" },
  ],
  "real-estate": [
    { id: "listing", name: "Property Listing", icon: FileText, description: "Generate property descriptions", action: "Create a listing for a property with:" },
    { id: "market", name: "Market Analysis", icon: Calculator, description: "Analyze market trends", action: "Analyze the market for:" },
    { id: "outreach", name: "Client Outreach", icon: Mail, description: "Personalized outreach", action: "Draft outreach for:" },
    { id: "comps", name: "Comparative Analysis", icon: FileSpreadsheet, description: "Property comparisons", action: "Compare properties:" },
  ],
  healthcare: [
    { id: "summary", name: "Patient Summary", icon: ClipboardList, description: "Summarize records", action: "Summarize patient information:" },
    { id: "research", name: "Medical Research", icon: Search, description: "Latest research", action: "Research medical information on:" },
    { id: "notes", name: "Clinical Notes", icon: FileText, description: "Documentation help", action: "Help document clinical notes for:" },
    { id: "plan", name: "Care Plan", icon: Briefcase, description: "Treatment planning", action: "Create a care plan for:" },
  ],
  education: [
    { id: "lesson", name: "Lesson Plan", icon: FileText, description: "Create lesson plans", action: "Create a lesson plan for:" },
    { id: "assessment", name: "Assessment", icon: ClipboardList, description: "Generate tests", action: "Create an assessment on:" },
    { id: "feedback", name: "Student Feedback", icon: Mail, description: "Personalized feedback", action: "Write feedback for:" },
    { id: "rubric", name: "Rubric Creator", icon: FileSpreadsheet, description: "Grading rubrics", action: "Create a rubric for:" },
  ],
  legal: [
    { id: "review", name: "Contract Review", icon: FileText, description: "Analyze contracts", action: "Review this contract:" },
    { id: "research", name: "Legal Research", icon: Search, description: "Case law & statutes", action: "Research legal precedent for:" },
    { id: "brief", name: "Case Brief", icon: ClipboardList, description: "Summarize cases", action: "Brief the following case:" },
    { id: "memo", name: "Legal Memo", icon: Mail, description: "Draft memos", action: "Draft a legal memo on:" },
  ],
  finance: [
    { id: "analysis", name: "Financial Analysis", icon: Calculator, description: "Analyze financials", action: "Analyze financial data for:" },
    { id: "forecast", name: "Forecasting", icon: FileSpreadsheet, description: "Project trends", action: "Create a forecast for:" },
    { id: "report", name: "Report Builder", icon: FileText, description: "Financial reports", action: "Generate a financial report on:" },
    { id: "model", name: "Model Builder", icon: Briefcase, description: "Financial modeling", action: "Build a financial model for:" },
  ],
  tech: [
    { id: "review", name: "Code Review", icon: FileText, description: "Review code", action: "Review this code:" },
    { id: "docs", name: "Documentation", icon: ClipboardList, description: "Generate docs", action: "Document this code:" },
    { id: "spec", name: "Tech Spec", icon: Briefcase, description: "Technical specs", action: "Create a technical spec for:" },
    { id: "debug", name: "Debug Help", icon: Search, description: "Troubleshoot issues", action: "Help debug this issue:" },
  ],
  hr: [
    { id: "job", name: "Job Description", icon: FileText, description: "Create JDs", action: "Write a job description for:" },
    { id: "review", name: "Performance Review", icon: ClipboardList, description: "Review templates", action: "Create a performance review for:" },
    { id: "policy", name: "Policy Draft", icon: Briefcase, description: "HR policies", action: "Draft an HR policy on:" },
    { id: "onboard", name: "Onboarding Plan", icon: Mail, description: "Onboarding guides", action: "Create an onboarding plan for:" },
  ],
};

interface ToolPanelProps {
  mode: IndustryMode;
  onToolSelect: (prompt: string) => void;
}

export function ToolPanel({ mode, onToolSelect }: ToolPanelProps) {
  const tools = toolsByMode[mode];

  return (
    <div className="h-full flex flex-col border-l border-border/50 glass-panel">
      <div className="p-4 border-b border-border/50">
        <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
          Quick Tools
        </h2>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-3 space-y-2">
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <Button
                key={tool.id}
                variant="ghost"
                className="w-full justify-start h-auto py-3 px-3 hover:bg-muted/50 group"
                onClick={() => onToolSelect(tool.action)}
              >
                <div className="flex items-start gap-3 text-left w-full">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">{tool.name}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{tool.description}</div>
                  </div>
                </div>
              </Button>
            );
          })}
        </div>
      </ScrollArea>

      <Separator />

      <div className="p-4">
        <p className="text-xs text-muted-foreground text-center">
          Click any tool to start a specialized workflow
        </p>
      </div>
    </div>
  );
}
