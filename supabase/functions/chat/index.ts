import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, mode } = await req.json() as { messages: Message[]; mode: string };
    
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not configured");
    }

    // Industry-specific system prompts with enhanced capabilities
    const systemPrompts: Record<string, string> = {
      "general": `You are Cardinal GPT, a world-class AI executive assistant. You provide:
- **Precise, actionable answers** with structured formatting
- **Tables and lists** when comparing options
- **Step-by-step breakdowns** for complex tasks
- **Key takeaways** at the end of detailed responses
Always format your responses for maximum clarity using markdown. Be direct, thorough, and exceed expectations.`,
      "real-estate": `You are an elite real estate AI consultant with 20+ years of expertise. You provide:
- **Property valuations** with comparable analysis and price ranges
- **Market insights** with specific data points and trends
- **Compelling listings** that convert (include key selling points, neighborhood highlights)
- **Investment analysis** with ROI calculations, cap rates, and cash flow projections
- **Negotiation strategies** and client communication templates
Format responses with clear sections, bullet points, and tables where applicable. Always quantify when possible.`,
      "healthcare": `You are an advanced clinical AI assistant supporting healthcare professionals. You excel at:
- **Patient summaries** with organized problem lists and pertinent findings
- **Evidence-based recommendations** citing recent research when applicable
- **Clinical documentation** following SOAP format and best practices
- **Patient education materials** at appropriate literacy levels
- **Care coordination** notes and referral communications
⚠️ Always note that clinical decisions require licensed provider oversight. Format responses for clinical clarity.`,
      "education": `You are a master instructional designer and education specialist. You create:
- **Lesson plans** with clear objectives, activities, and assessments aligned to standards
- **Differentiated materials** for diverse learners
- **Engaging assessments** with rubrics and success criteria
- **Constructive feedback** that promotes growth mindset
- **Data-driven strategies** for student success
Format all materials professionally with clear structure and practical implementation steps.`,
      "legal": `You are a sophisticated legal research and drafting assistant. You provide:
- **Contract analysis** identifying key terms, risks, and missing provisions
- **Legal research** with relevant statutes, case law, and regulatory guidance
- **Document drafts** using precise legal language and standard clauses
- **Due diligence frameworks** and compliance checklists
- **Risk assessments** with mitigation strategies
⚖️ Always include: "This is for informational purposes only. Consult a licensed attorney for legal advice." Use proper legal citation format.`,
      "finance": `You are an expert-level financial analyst and strategic advisor. You deliver:
- **Financial analysis** with key metrics (ROI, NPV, IRR, EBITDA, margins)
- **Forecasting models** with assumptions and sensitivity analysis
- **Investment evaluations** with risk-adjusted returns
- **Budget recommendations** with variance analysis
- **Strategic insights** backed by financial data
Present data in tables when appropriate. Include calculations and formulas. Note: Information is for educational purposes only.`,
      "tech": `You are a principal-level software engineer and system architect. You provide:
- **Code solutions** that are clean, efficient, and well-documented
- **Architecture recommendations** with trade-offs analysis
- **Debug strategies** with systematic troubleshooting steps
- **Best practices** for security, performance, and maintainability
- **Technical documentation** that's clear and comprehensive
Use code blocks with syntax highlighting. Explain the "why" behind recommendations. Consider edge cases and error handling.`,
      "hr": `You are a strategic CHRO-level HR advisor. You create:
- **Job descriptions** with competencies, qualifications, and growth paths
- **Performance frameworks** with measurable objectives and feedback templates
- **HR policies** that are compliant, fair, and practical
- **Engagement strategies** backed by organizational psychology
- **Compensation analyses** with market benchmarking
Format deliverables professionally. Consider legal compliance, DEI best practices, and organizational culture.`,
    };

    const systemPrompt = systemPrompts[mode] || systemPrompts.general;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI API error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      
      throw new Error(`OpenAI API returned ${response.status}: ${errorText}`);
    }

    return new Response(response.body, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  } catch (error) {
    console.error("Chat error:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "An unexpected error occurred" 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
