import { Search, FileText, Mail, Image, ClipboardList, Briefcase, Calculator, TrendingUp, DollarSign, BarChart3, PieChart, Users, Target, Zap, Home, Building, MapPin, LineChart, FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { IndustryMode } from "./ModeSelector";

interface Tool {
  id: string;
  name: string;
  icon: React.ElementType;
  description: string;
  action: string;
  badge?: string;
}

const toolsByMode: Record<IndustryMode, Tool[]> = {
  general: [
    { id: "summarize", name: "Summarize", icon: FileText, description: "Condense long text", action: "Summarize this:", badge: "Quick" },
    { id: "search", name: "Web Search", icon: Search, description: "Search the web", action: "Search for:", badge: "Research" },
    { id: "image", name: "Generate Image", icon: Image, description: "Create visuals", action: "Generate an image of:", badge: "Creative" },
    { id: "email", name: "Draft Email", icon: Mail, description: "Professional emails", action: "Draft an email about:", badge: "Comms" },
    { id: "brainstorm", name: "Brainstorm", icon: Zap, description: "Generate ideas", action: "Help me brainstorm ideas for:", badge: "Creative" },
    { id: "analyze", name: "Analyze", icon: BarChart3, description: "Deep analysis", action: "Analyze this data:", badge: "Analysis" },
  ],
  "real-estate": [
    { id: "listing", name: "Property Listing", icon: Home, description: "Generate listings", action: "Create a detailed property listing for:", badge: "Marketing" },
    { id: "market", name: "Market Analysis", icon: TrendingUp, description: "Analyze trends", action: "Analyze the real estate market for:", badge: "Analysis" },
    { id: "outreach", name: "Client Outreach", icon: Mail, description: "Outreach emails", action: "Draft a client outreach email for:", badge: "Comms" },
    { id: "comps", name: "CMA Report", icon: BarChart3, description: "Market analysis", action: "Create a comparative market analysis for:", badge: "Report" },
    { id: "valuation", name: "Valuation", icon: DollarSign, description: "Property value", action: "Help me value a property with these details:", badge: "Analysis" },
    { id: "investment", name: "Investment", icon: Calculator, description: "ROI calculations", action: "Analyze this investment opportunity:", badge: "Finance" },
    { id: "tour", name: "Tour Script", icon: MapPin, description: "Tour scripts", action: "Create a property tour script for:", badge: "Marketing" },
    { id: "contract", name: "Contract Review", icon: FileText, description: "Review contracts", action: "Review this real estate contract:", badge: "Legal" },
  ],
  healthcare: [
    { id: "summary", name: "Patient Summary", icon: ClipboardList, description: "Summarize records", action: "Summarize patient information:", badge: "Clinical" },
    { id: "research", name: "Research", icon: Search, description: "Medical research", action: "Research medical information on:", badge: "Research" },
    { id: "notes", name: "Clinical Notes", icon: FileText, description: "Documentation", action: "Help document clinical notes for:", badge: "Docs" },
    { id: "plan", name: "Care Plan", icon: Briefcase, description: "Treatment plan", action: "Create a care plan for:", badge: "Planning" },
    { id: "education", name: "Patient Ed", icon: Users, description: "Patient materials", action: "Create patient education material about:", badge: "Education" },
    { id: "referral", name: "Referral Letter", icon: Mail, description: "Referral docs", action: "Draft a referral letter for:", badge: "Comms" },
  ],
  education: [
    { id: "lesson", name: "Lesson Plan", icon: FileText, description: "Lesson plans", action: "Create a comprehensive lesson plan for:", badge: "Planning" },
    { id: "assessment", name: "Assessment", icon: ClipboardList, description: "Generate tests", action: "Create an assessment on:", badge: "Testing" },
    { id: "feedback", name: "Feedback", icon: Mail, description: "Student feedback", action: "Write constructive feedback for:", badge: "Comms" },
    { id: "rubric", name: "Rubric", icon: FileSpreadsheet, description: "Grading rubrics", action: "Create a detailed rubric for:", badge: "Assessment" },
    { id: "activity", name: "Activity", icon: Zap, description: "Learning activities", action: "Design a learning activity for:", badge: "Activity" },
    { id: "differentiation", name: "Differentiate", icon: Users, description: "Adapt content", action: "Create differentiated instruction for:", badge: "Strategy" },
  ],
  legal: [
    { id: "review", name: "Contract Review", icon: FileText, description: "Analyze contracts", action: "Review this contract:", badge: "Analysis" },
    { id: "research", name: "Legal Research", icon: Search, description: "Case law", action: "Research legal precedent for:", badge: "Research" },
    { id: "brief", name: "Case Brief", icon: ClipboardList, description: "Summarize cases", action: "Brief the following case:", badge: "Summary" },
    { id: "memo", name: "Legal Memo", icon: Mail, description: "Draft memos", action: "Draft a legal memo on:", badge: "Docs" },
    { id: "checklist", name: "Due Diligence", icon: Target, description: "Checklists", action: "Create a due diligence checklist for:", badge: "Planning" },
    { id: "agreement", name: "Draft Agreement", icon: FileText, description: "Contract drafting", action: "Draft an agreement for:", badge: "Drafting" },
  ],
  finance: [
    { id: "analysis", name: "Analysis", icon: Calculator, description: "Analyze financials", action: "Analyze financial data for:", badge: "Analysis" },
    { id: "forecast", name: "Forecast", icon: TrendingUp, description: "Project trends", action: "Create a financial forecast for:", badge: "Projection" },
    { id: "report", name: "Report", icon: FileText, description: "Financial reports", action: "Generate a financial report on:", badge: "Report" },
    { id: "model", name: "Model Builder", icon: Briefcase, description: "Financial modeling", action: "Build a financial model for:", badge: "Modeling" },
    { id: "valuation", name: "Valuation", icon: DollarSign, description: "Company valuation", action: "Help me value:", badge: "Analysis" },
    { id: "budget", name: "Budget", icon: PieChart, description: "Budget planning", action: "Create a budget for:", badge: "Planning" },
    { id: "investment", name: "Investment", icon: LineChart, description: "Investment eval", action: "Analyze this investment:", badge: "Analysis" },
  ],
  tech: [
    { id: "review", name: "Code Review", icon: FileText, description: "Review code", action: "Review this code:", badge: "Quality" },
    { id: "docs", name: "Docs", icon: ClipboardList, description: "Generate docs", action: "Document this code:", badge: "Docs" },
    { id: "spec", name: "Tech Spec", icon: Briefcase, description: "Technical specs", action: "Create a technical specification for:", badge: "Planning" },
    { id: "debug", name: "Debug", icon: Search, description: "Troubleshoot", action: "Help debug this issue:", badge: "Support" },
    { id: "architecture", name: "Architecture", icon: Building, description: "System design", action: "Design system architecture for:", badge: "Design" },
    { id: "optimize", name: "Optimize", icon: Zap, description: "Performance", action: "Optimize this code:", badge: "Perf" },
  ],
  hr: [
    { id: "job", name: "Job Description", icon: FileText, description: "Create JDs", action: "Write a comprehensive job description for:", badge: "Hiring" },
    { id: "review", name: "Perf Review", icon: ClipboardList, description: "Review templates", action: "Create a performance review for:", badge: "Assessment" },
    { id: "policy", name: "Policy", icon: Briefcase, description: "HR policies", action: "Draft an HR policy on:", badge: "Policy" },
    { id: "onboard", name: "Onboarding", icon: Mail, description: "Onboarding plans", action: "Create an onboarding plan for:", badge: "Training" },
    { id: "compensation", name: "Compensation", icon: DollarSign, description: "Salary data", action: "Analyze compensation for:", badge: "Analysis" },
    { id: "engagement", name: "Engagement", icon: Users, description: "Employee engagement", action: "Create an engagement strategy for:", badge: "Strategy" },
  ],
};

interface ToolPanelProps {
  mode: IndustryMode;
  onToolSelect: (prompt: string) => void;
}

export function ToolPanel({ mode, onToolSelect }: ToolPanelProps) {
  const tools = toolsByMode[mode];

  return (
    <div className="h-full flex flex-col border-l border-border/30">
      <div className="p-4 pb-3 border-b border-border/30">
        <div className="flex items-center justify-between mb-1">
          <h2 className="font-display font-semibold text-sm">Quick Tools</h2>
          <Badge variant="secondary" className="text-[10px] h-5 rounded-md">
            {tools.length}
          </Badge>
        </div>
        <p className="text-[10px] text-muted-foreground">Industry-optimized workflows</p>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <Button
                key={tool.id}
                variant="ghost"
                className="w-full justify-start h-auto py-2.5 px-3 rounded-xl hover:bg-muted/50 group transition-all duration-200 hover:scale-[1.01]"
                onClick={() => onToolSelect(tool.action)}
              >
                <div className="flex items-center gap-3 text-left w-full">
                  <div className="w-8 h-8 rounded-lg glass-subtle flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                    <Icon className="h-4 w-4 text-foreground/70" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-xs">{tool.name}</span>
                      {tool.badge && (
                        <span className="text-[9px] text-muted-foreground/60 bg-muted/50 rounded px-1.5 py-0.5">
                          {tool.badge}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-muted-foreground">{tool.description}</span>
                  </div>
                </div>
              </Button>
            );
          })}
        </div>
      </ScrollArea>

      <div className="p-3 border-t border-border/30">
        <p className="text-[10px] text-muted-foreground text-center">Click any tool to start</p>
      </div>
    </div>
  );
}
