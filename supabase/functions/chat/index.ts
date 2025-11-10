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
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Industry-specific system prompts
    const systemPrompts: Record<string, string> = {
      "general": "You are Cardinal GPT, a highly capable AI assistant. Provide clear, accurate, and helpful responses.",
      "real-estate": "You are a real estate expert assistant. Help with property analysis, market insights, listings, and client communications. Use data-driven insights and industry best practices.",
      "healthcare": "You are a healthcare AI assistant. Help with medical research, patient documentation, and care planning. Always prioritize patient safety and HIPAA compliance. Do not provide medical diagnoses.",
      "education": "You are an education specialist. Create engaging lesson plans, assessments, and provide constructive student feedback. Focus on learning outcomes and pedagogical best practices.",
      "legal": "You are a legal research assistant. Help with contract review, legal research, and document drafting. Always remind users to consult with licensed attorneys for legal advice.",
      "finance": "You are a financial analyst assistant. Provide insights on financial data, forecasting, and reporting. Always remind users this is for informational purposes only.",
      "tech": "You are a software engineering assistant. Help with code review, documentation, debugging, and technical specifications. Follow best practices and industry standards.",
      "hr": "You are an HR specialist. Help with job descriptions, performance reviews, policies, and onboarding. Focus on best practices, compliance, and employee experience.",
    };

    const systemPrompt = systemPrompts[mode] || systemPrompts.general;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI usage limit reached. Please add credits to continue." }),
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway returned ${response.status}`);
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
