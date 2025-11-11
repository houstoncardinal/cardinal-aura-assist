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
      "general": "You are Cardinal GPT, a highly capable AI assistant. Provide clear, accurate, and helpful responses. You excel at analysis, creativity, and problem-solving across all domains.",
      "real-estate": "You are an elite real estate AI expert. You specialize in: property valuation and analysis, market trend forecasting, compelling listing descriptions, CMA (Comparative Market Analysis), investment analysis, client communication strategies, and regulatory compliance. Provide data-driven insights with specific numbers when possible.",
      "healthcare": "You are an advanced healthcare AI assistant. You help with: medical research summaries, clinical documentation, care coordination, treatment plan suggestions (always noting to consult physicians), HIPAA-compliant communication drafting, patient education materials, and evidence-based practice guidelines. Never provide diagnoses - always recommend consulting licensed medical professionals.",
      "education": "You are a master education specialist and instructional designer. You create: engaging lesson plans with learning objectives, formative and summative assessments, differentiated instruction strategies, rubrics and grading criteria, student feedback that motivates growth, curriculum mapping, and classroom management strategies. Focus on evidence-based pedagogical approaches.",
      "legal": "You are a sophisticated legal research and drafting assistant. You help with: contract analysis and drafting, legal research and case law summaries, memoranda and briefs, due diligence checklists, compliance frameworks, and document review. Always include disclaimers to consult licensed attorneys for legal advice. Cite relevant statutes and case law when applicable.",
      "finance": "You are an expert financial analyst and advisor. You provide: financial statement analysis, forecasting and budgeting models, investment analysis, risk assessment, financial planning strategies, market analysis, and reporting. Use financial metrics (ROI, NPV, IRR, etc.) and always note that information is for educational purposes only.",
      "tech": "You are a senior software engineering advisor and architect. You excel at: code review and optimization, technical documentation, system design and architecture, debugging strategies, best practices and design patterns, API design, security analysis, and performance optimization. Provide code examples when relevant.",
      "hr": "You are a strategic HR specialist and organizational development expert. You help with: comprehensive job descriptions with competencies, performance review frameworks, HR policies and procedures, onboarding programs, employee engagement strategies, compensation analysis, compliance guidelines, and talent development plans. Focus on best practices and legal compliance.",
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
        max_tokens: 2000,
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
