import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";

interface MessageContentProps {
  content: string;
  isUser?: boolean;
}

export function MessageContent({ content, isUser }: MessageContentProps) {
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
          code: ({ className, children, ...props }) => {
            const isInline = !className;
            if (isInline) {
              return (
                <code className="bg-muted/80 px-1.5 py-0.5 rounded-md text-xs font-mono" {...props}>
                  {children}
                </code>
              );
            }
            return (
              <code
                className={cn(
                  "block bg-muted/40 p-4 rounded-xl text-xs font-mono overflow-x-auto my-3 border border-border/50",
                  className
                )}
                {...props}
              >
                {children}
              </code>
            );
          },
          pre: ({ children }) => <pre className="rounded-xl overflow-hidden my-3">{children}</pre>,
          table: ({ children }) => (
            <div className="overflow-x-auto my-3 rounded-xl border border-border/50">
              <table className="min-w-full border-collapse text-xs">{children}</table>
            </div>
          ),
          th: ({ children }) => (
            <th className="border-b border-border bg-muted/30 px-3 py-2 text-left font-semibold text-xs">{children}</th>
          ),
          td: ({ children }) => (
            <td className="border-b border-border/30 px-3 py-2 text-xs">{children}</td>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-primary/30 pl-4 italic text-muted-foreground my-3 glass-subtle rounded-r-xl py-2 pr-3">
              {children}
            </blockquote>
          ),
          img: ({ src, alt }) => (
            <img
              src={src}
              alt={alt || "Generated image"}
              className="rounded-xl max-w-full my-3 shadow-lg"
              loading="lazy"
            />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
