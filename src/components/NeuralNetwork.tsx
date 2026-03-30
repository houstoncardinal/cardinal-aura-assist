import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface NeuralNetworkProps {
  isActive: boolean;
  className?: string;
}

interface Node {
  id: number;
  x: number;
  y: number;
  layer: number;
  radius: number;
  pulseDelay: number;
}

interface Connection {
  from: Node;
  to: Node;
  strength: number;
}

function generateNetwork(): { nodes: Node[]; connections: Connection[] } {
  const layers = [3, 5, 7, 5, 3];
  const nodes: Node[] = [];
  let id = 0;

  layers.forEach((count, layerIdx) => {
    const x = (layerIdx / (layers.length - 1)) * 280 + 10;
    for (let i = 0; i < count; i++) {
      const y = ((i + 1) / (count + 1)) * 160;
      nodes.push({
        id: id++,
        x,
        y,
        layer: layerIdx,
        radius: layerIdx === 2 ? 4.5 : 3.5,
        pulseDelay: Math.random() * 2,
      });
    }
  });

  const connections: Connection[] = [];
  for (let l = 0; l < layers.length - 1; l++) {
    const fromNodes = nodes.filter((n) => n.layer === l);
    const toNodes = nodes.filter((n) => n.layer === l + 1);
    fromNodes.forEach((from) => {
      // Connect to 2-3 random nodes in the next layer
      const shuffled = [...toNodes].sort(() => Math.random() - 0.5);
      const count = Math.min(2 + Math.floor(Math.random() * 2), shuffled.length);
      for (let i = 0; i < count; i++) {
        connections.push({ from, to: shuffled[i], strength: 0.3 + Math.random() * 0.7 });
      }
    });
  }

  return { nodes, connections };
}

export function NeuralNetwork({ isActive, className }: NeuralNetworkProps) {
  const [network] = useState(() => generateNetwork());
  const [activeConnections, setActiveConnections] = useState<Set<number>>(new Set());
  const [activeNodes, setActiveNodes] = useState<Set<number>>(new Set());
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    if (!isActive) {
      setActiveConnections(new Set());
      setActiveNodes(new Set());
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    // Simulate neural activity — fire random paths
    const fire = () => {
      const startLayer = 0;
      const startNodes = network.nodes.filter((n) => n.layer === startLayer);
      const startNode = startNodes[Math.floor(Math.random() * startNodes.length)];
      
      const path: number[] = [startNode.id];
      const conns: number[] = [];
      let current = startNode;

      for (let l = 0; l < 4; l++) {
        const outgoing = network.connections.filter(
          (c, idx) => c.from.id === current.id && !conns.includes(idx)
        );
        if (outgoing.length === 0) break;
        const connIdx = network.connections.indexOf(
          outgoing[Math.floor(Math.random() * outgoing.length)]
        );
        conns.push(connIdx);
        current = network.connections[connIdx].to;
        path.push(current.id);
      }

      setActiveNodes((prev) => new Set([...prev, ...path]));
      setActiveConnections((prev) => new Set([...prev, ...conns]));

      setTimeout(() => {
        setActiveNodes((prev) => {
          const next = new Set(prev);
          path.forEach((id) => next.delete(id));
          return next;
        });
        setActiveConnections((prev) => {
          const next = new Set(prev);
          conns.forEach((id) => next.delete(id));
          return next;
        });
      }, 800);
    };

    fire();
    intervalRef.current = setInterval(fire, 300);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isActive, network]);

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.4 }}
          className={cn("relative", className)}
        >
          <svg viewBox="0 0 300 170" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
            <defs>
              <filter id="glow">
                <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <linearGradient id="conn-active" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.8" />
                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.2" />
              </linearGradient>
            </defs>

            {/* Connections */}
            {network.connections.map((conn, idx) => {
              const active = activeConnections.has(idx);
              return (
                <line
                  key={idx}
                  x1={conn.from.x}
                  y1={conn.from.y}
                  x2={conn.to.x}
                  y2={conn.to.y}
                  stroke={active ? "url(#conn-active)" : "hsl(var(--muted-foreground))"}
                  strokeWidth={active ? 1.5 : 0.3}
                  strokeOpacity={active ? 1 : 0.15}
                  className="transition-all duration-300"
                />
              );
            })}

            {/* Nodes */}
            {network.nodes.map((node) => {
              const active = activeNodes.has(node.id);
              return (
                <g key={node.id}>
                  {active && (
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={node.radius * 2.5}
                      fill="hsl(var(--primary))"
                      opacity={0.15}
                      className="animate-pulse"
                    />
                  )}
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={node.radius}
                    fill={active ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))"}
                    opacity={active ? 0.9 : 0.25}
                    filter={active ? "url(#glow)" : undefined}
                    className="transition-all duration-300"
                  />
                </g>
              );
            })}

            {/* Center label */}
            <text
              x="150"
              y="165"
              textAnchor="middle"
              className="fill-muted-foreground text-[7px]"
              opacity={0.5}
            >
              Neural Processing
            </text>
          </svg>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
