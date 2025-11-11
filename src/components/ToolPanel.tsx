import { Search, FileText, Mail, Image, FileSpreadsheet, ClipboardList, Briefcase, Calculator, TrendingUp, DollarSign, BarChart3, PieChart, Users, Target, Zap, Home, Building, MapPin, LineChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
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
    { id: "email", name: "Draft Email", icon: Mail, description: "Professional emails", action: "Draft an email about:", badge: "Communication" },
    { id: "brainstorm", name: "Brainstorm", icon: Zap, description: "Generate ideas", action: "Help me brainstorm ideas for:", badge: "Creative" },
    { id: "analyze", name: "Analyze", icon: BarChart3, description: "Deep analysis", action: "Analyze this data:", badge: "Analysis" },
  ],
  "real-estate": [
    { id: "listing", name: "Property Listing", icon: Home, description: "Generate compelling listings", action: "Create a detailed property listing for:", badge: "Marketing" },
    { id: "market", name: "Market Analysis", icon: TrendingUp, description: "Analyze market trends", action: "Analyze the real estate market for:", badge: "Analysis" },
    { id: "outreach", name: "Client Outreach", icon: Mail, description: "Personalized outreach", action: "Draft a client outreach email for:", badge: "Communication" },
    { id: "comps", name: "CMA Report", icon: BarChart3, description: "Comparative market analysis", action: "Create a comparative market analysis for:", badge: "Report" },
    { id: "valuation", name: "Property Valuation", icon: DollarSign, description: "Estimate property value", action: "Help me value a property with these details:", badge: "Analysis" },
    { id: "investment", name: "Investment Analysis", icon: Calculator, description: "ROI calculations", action: "Analyze this investment opportunity:", badge: "Financial" },
    { id: "tour", name: "Tour Script", icon: MapPin, description: "Virtual tour scripts", action: "Create a property tour script for:", badge: "Marketing" },
    { id: "contract", name: "Contract Review", icon: FileText, description: "Review agreements", action: "Review this real estate contract:", badge: "Legal" },
  ],
  healthcare: [
    { id: "summary", name: "Patient Summary", icon: ClipboardList, description: "Summarize records", action: "Summarize patient information:", badge: "Clinical" },
    { id: "research", name: "Medical Research", icon: Search, description: "Latest research", action: "Research medical information on:", badge: "Research" },
    { id: "notes", name: "Clinical Notes", icon: FileText, description: "Documentation help", action: "Help document clinical notes for:", badge: "Documentation" },
    { id: "plan", name: "Care Plan", icon: Briefcase, description: "Treatment planning", action: "Create a care plan for:", badge: "Planning" },
    { id: "education", name: "Patient Education", icon: Users, description: "Patient materials", action: "Create patient education material about:", badge: "Education" },
    { id: "referral", name: "Referral Letter", icon: Mail, description: "Referral documentation", action: "Draft a referral letter for:", badge: "Communication" },
  ],
  education: [
    { id: "lesson", name: "Lesson Plan", icon: FileText, description: "Create lesson plans", action: "Create a comprehensive lesson plan for:", badge: "Planning" },
    { id: "assessment", name: "Assessment", icon: ClipboardList, description: "Generate tests", action: "Create an assessment on:", badge: "Testing" },
    { id: "feedback", name: "Student Feedback", icon: Mail, description: "Personalized feedback", action: "Write constructive feedback for:", badge: "Communication" },
    { id: "rubric", name: "Rubric Creator", icon: FileSpreadsheet, description: "Grading rubrics", action: "Create a detailed rubric for:", badge: "Assessment" },
    { id: "activity", name: "Learning Activity", icon: Zap, description: "Engaging activities", action: "Design a learning activity for:", badge: "Activity" },
    { id: "differentiation", name: "Differentiation", icon: Users, description: "Adapt for learners", action: "Create differentiated instruction for:", badge: "Strategy" },
  ],
  legal: [
    { id: "review", name: "Contract Review", icon: FileText, description: "Analyze contracts", action: "Review this contract:", badge: "Analysis" },
    { id: "research", name: "Legal Research", icon: Search, description: "Case law & statutes", action: "Research legal precedent for:", badge: "Research" },
    { id: "brief", name: "Case Brief", icon: ClipboardList, description: "Summarize cases", action: "Brief the following case:", badge: "Summary" },
    { id: "memo", name: "Legal Memo", icon: Mail, description: "Draft memos", action: "Draft a legal memo on:", badge: "Documentation" },
    { id: "checklist", name: "Due Diligence", icon: Target, description: "Checklist creator", action: "Create a due diligence checklist for:", badge: "Planning" },
    { id: "agreement", name: "Draft Agreement", icon: FileText, description: "Contract drafting", action: "Draft an agreement for:", badge: "Drafting" },
  ],
  finance: [
    { id: "analysis", name: "Financial Analysis", icon: Calculator, description: "Analyze financials", action: "Analyze financial data for:", badge: "Analysis" },
    { id: "forecast", name: "Forecasting", icon: TrendingUp, description: "Project trends", action: "Create a financial forecast for:", badge: "Projection" },
    { id: "report", name: "Report Builder", icon: FileText, description: "Financial reports", action: "Generate a financial report on:", badge: "Report" },
    { id: "model", name: "Model Builder", icon: Briefcase, description: "Financial modeling", action: "Build a financial model for:", badge: "Modeling" },
    { id: "valuation", name: "Valuation", icon: DollarSign, description: "Company valuation", action: "Help me value:", badge: "Analysis" },
    { id: "budget", name: "Budget Planning", icon: PieChart, description: "Budget creation", action: "Create a budget for:", badge: "Planning" },
    { id: "investment", name: "Investment Analysis", icon: LineChart, description: "Investment evaluation", action: "Analyze this investment:", badge: "Analysis" },
  ],
  tech: [
    { id: "review", name: "Code Review", icon: FileText, description: "Review code", action: "Review this code:", badge: "Quality" },
    { id: "docs", name: "Documentation", icon: ClipboardList, description: "Generate docs", action: "Document this code:", badge: "Documentation" },
    { id: "spec", name: "Tech Spec", icon: Briefcase, description: "Technical specs", action: "Create a technical specification for:", badge: "Planning" },
    { id: "debug", name: "Debug Help", icon: Search, description: "Troubleshoot issues", action: "Help debug this issue:", badge: "Support" },
    { id: "architecture", name: "System Design", icon: Building, description: "Architecture design", action: "Design system architecture for:", badge: "Architecture" },
    { id: "optimize", name: "Optimization", icon: Zap, description: "Performance tuning", action: "Optimize this code:", badge: "Performance" },
  ],
  hr: [
    { id: "job", name: "Job Description", icon: FileText, description: "Create JDs", action: "Write a comprehensive job description for:", badge: "Hiring" },
    { id: "review", name: "Performance Review", icon: ClipboardList, description: "Review templates", action: "Create a performance review for:", badge: "Assessment" },
    { id: "policy", name: "Policy Draft", icon: Briefcase, description: "HR policies", action: "Draft an HR policy on:", badge: "Policy" },
    { id: "onboard", name: "Onboarding Plan", icon: Mail, description: "Onboarding guides", action: "Create an onboarding plan for:", badge: "Training" },
    { id: "compensation", name: "Compensation Analysis", icon: DollarSign, description: "Salary benchmarking", action: "Analyze compensation for:", badge: "Analysis" },
    { id: "engagement", name: "Engagement Strategy", icon: Users, description: "Employee engagement", action: "Create an engagement strategy for:", badge: "Strategy" },
  ],
};

interface ToolPanelProps {
  mode: IndustryMode;
  onToolSelect: (prompt: string) => void;
}

export function ToolPanel({ mode, onToolSelect }: ToolPanelProps) {
  const tools = toolsByMode[mode];

  return (
    <div className="h-full flex flex-col luxury-border border-l">
      <div className="p-4 luxury-border border-b">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
            Quick Tools
          </h2>
          <Badge variant="secondary" className="text-xs">
            {tools.length} tools
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">
          Industry-optimized workflows
        </p>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-3 space-y-2">
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <Button
                key={tool.id}
                variant="ghost"
                className="w-full justify-start h-auto py-3 px-3 hover:bg-muted/50 group transition-all duration-200 hover:scale-[1.01]"
                onClick={() => onToolSelect(tool.action)}
              >
                <div className="flex items-start gap-3 text-left w-full">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/15 transition-all duration-200">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">{tool.name}</span>
                      {tool.badge && (
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4">
                          {tool.badge}
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">{tool.description}</div>
                  </div>
                </div>
              </Button>
            );
          })}
        </div>
      </ScrollArea>

      <Separator />

      <div className="p-4 space-y-2">
        <p className="text-xs text-muted-foreground text-center">
          Click any tool to start a specialized workflow
        </p>
      </div>
    </div>
  );
}
