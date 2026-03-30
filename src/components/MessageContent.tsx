import { useState, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import { Copy, Check, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend
} from "recharts";

interface MessageContentProps {
  content: string;
  isUser?: boolean;
  isStreaming?: boolean;
}

interface ChartData {
  type: "line" | "bar" | "pie" | "area";
  title: string;
  data: Array<Record<string, unknown>>;
  xKey?: string;
  yKey?: string;
}

const CHART_COLORS = ["hsl(var(--primary))", "#6366f1", "#14b8a6", "#f59e0b", "#ef4444", "#8b5cf6"];

function ChartRenderer({ chart }: { chart: ChartData }) {
  const { type, title, data, xKey = "name", yKey = "value" } = chart;
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="my-4 glass rounded-xl p-4">
      <p className="text-xs font-semibold mb-3 text-foreground/80">{title}</p>
      <div className="h-48 w-full">
        <ResponsiveContainer width="100%" height="100%">
          {type === "bar" ? (
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis dataKey={xKey} tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 11 }} />
              <Bar dataKey={yKey} radius={[4, 4, 0, 0]}>
                {data.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
              </Bar>
            </BarChart>
          ) : type === "line" ? (
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis dataKey={xKey} tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 11 }} />
              <Line type="monotone" dataKey={yKey} stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          ) : type === "area" ? (
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis dataKey={xKey} tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 11 }} />
              <Area type="monotone" dataKey={yKey} stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.1} strokeWidth={2} />
            </AreaChart>
          ) : (
            <PieChart>
              <Pie data={data} dataKey={yKey} nameKey={xKey} cx="50%" cy="50%" outerRadius={70} fontSize={9}>
                {data.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 11 }} />
              <Legend wrapperStyle={{ fontSize: 10 }} />
            </PieChart>
          )}
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}

function CodeCopyButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    toast({ description: "Code copied!" });
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={handleCopy}
      className="absolute top-2 right-2 glass-subtle rounded-lg p-1.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-muted/60"
      title="Copy code"
    >
      {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5 text-muted-foreground" />}
    </button>
  );
}

function extractCharts(content: string): { cleanContent: string; charts: ChartData[] } {
  const charts: ChartData[] = [];
  const cleanContent = content.replace(/```chart\n([\s\S]*?)```/g, (match, json) => {
    try { charts.push(JSON.parse(json.trim())); return ""; } catch { return match; }
  });
  return { cleanContent, charts };
}

export function MessageContent({ content, isUser, isStreaming }: MessageContentProps) {
  const { cleanContent, charts } = useMemo(() => extractCharts(content), [content]);

  if (isUser) {
    return <p className="text-sm leading-relaxed whitespace-pre-wrap">{content}</p>;
  }

  return (
    <div className="text-sm leading-relaxed prose prose-sm dark:prose-invert max-w-none">
      <ReactMarkdown
        components={{
          p: ({ children }) => <p className="mb-2.5 last:mb-0 leading-relaxed">{children}</p>,
          ul: ({ children }) => <ul className="list-disc pl-4 mb-2.5 space-y-1">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal pl-4 mb-2.5 space-y-1">{children}</ol>,
          li: ({ children }) => <li className="text-sm leading-relaxed">{children}</li>,
          h1: ({ children }) => <h1 className="text-lg font-display font-bold mb-3 mt-4">{children}</h1>,
          h2: ({ children }) => <h2 className="text-base font-display font-bold mb-2 mt-3">{children}</h2>,
          h3: ({ children }) => <h3 className="text-sm font-display font-bold mb-1.5 mt-2">{children}</h3>,
          strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
          a: ({ href, children }) => (
            <a href={href} target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2 hover:text-primary/80 transition-colors inline-flex items-center gap-0.5">
              {children}<ExternalLink className="h-3 w-3 inline-block" />
            </a>
          ),
          code: ({ className, children, ...props }) => {
            const isInline = !className;
            if (isInline) {
              return <code className="bg-muted/80 px-1.5 py-0.5 rounded-md text-xs font-mono" {...props}>{children}</code>;
            }
            const codeString = String(children).replace(/\n$/, "");
            const lang = className?.replace("language-", "") || "";
            return (
              <div className="relative group my-3">
                {lang && <div className="absolute top-0 left-0 glass-subtle rounded-tl-xl rounded-br-lg px-2.5 py-1 text-[9px] font-mono text-muted-foreground/60 uppercase">{lang}</div>}
                <CodeCopyButton code={codeString} />
                <code className={cn("block bg-muted/40 p-4 pt-8 rounded-xl text-xs font-mono overflow-x-auto border border-border/50", className)} {...props}>{children}</code>
              </div>
            );
          },
          pre: ({ children }) => <pre className="rounded-xl overflow-hidden">{children}</pre>,
          table: ({ children }) => (
            <div className="overflow-x-auto my-3 rounded-xl border border-border/50">
              <table className="min-w-full border-collapse text-xs">{children}</table>
            </div>
          ),
          th: ({ children }) => <th className="border-b border-border bg-muted/30 px-3 py-2 text-left font-semibold text-xs">{children}</th>,
          td: ({ children }) => <td className="border-b border-border/30 px-3 py-2 text-xs">{children}</td>,
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-primary/30 pl-4 italic text-muted-foreground my-3 glass-subtle rounded-r-xl py-2 pr-3">{children}</blockquote>
          ),
          img: ({ src, alt }) => (
            <div className="my-3 rounded-xl overflow-hidden border border-border/30 shadow-lg">
              <img src={src} alt={alt || "Generated image"} className="max-w-full w-full" loading="lazy" />
              {alt && alt !== "Generated image" && <div className="px-3 py-2 glass-subtle text-[10px] text-muted-foreground">{alt}</div>}
            </div>
          ),
        }}
      >
        {cleanContent}
      </ReactMarkdown>
      {charts.map((chart, i) => <ChartRenderer key={i} chart={chart} />)}
      {isStreaming && (
        <motion.span className="inline-block w-0.5 h-4 bg-primary/70 ml-0.5 align-text-bottom" animate={{ opacity: [1, 0, 1] }} transition={{ duration: 0.8, repeat: Infinity }} />
      )}
    </div>
  );
}
