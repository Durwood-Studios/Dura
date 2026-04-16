"use client";

import { useCallback, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface NetworkNode {
  id: string;
  label: string;
  x: number;
  y: number;
}

interface NetworkEdge {
  from: string;
  to: string;
}

const NODES: NetworkNode[] = [
  { id: "A", label: "Your Computer", x: 60, y: 200 },
  { id: "B", label: "Router 1", x: 220, y: 100 },
  { id: "C", label: "Router 2", x: 220, y: 200 },
  { id: "D", label: "Router 3", x: 380, y: 200 },
  { id: "F", label: "Router 4", x: 220, y: 300 },
  { id: "E", label: "Server", x: 540, y: 200 },
];

const EDGES: NetworkEdge[] = [
  { from: "A", to: "B" },
  { from: "A", to: "C" },
  { from: "A", to: "F" },
  { from: "B", to: "E" },
  { from: "C", to: "D" },
  { from: "D", to: "E" },
  { from: "F", to: "D" },
];

/** Predefined routes packets can take through the network. */
const ROUTES: string[][] = [
  ["A", "B", "E"],
  ["A", "C", "D", "E"],
  ["A", "F", "D", "E"],
];

const PACKET_COLORS = ["#6ee7b7", "#93c5fd", "#fda4af"];

interface Packet {
  id: number;
  route: string[];
  currentHop: number;
  color: string;
  text: string;
  isLost: boolean;
  isRetrying: boolean;
}

/** Returns the node position by id. */
function getNodePos(id: string): { x: number; y: number } {
  const node = NODES.find((n) => n.id === id);
  return node ? { x: node.x, y: node.y } : { x: 0, y: 0 };
}

/** Splits a message into roughly equal chunks. */
function splitMessage(message: string, count: number): string[] {
  const chunkSize = Math.ceil(message.length / count);
  const chunks: string[] = [];
  for (let i = 0; i < message.length; i += chunkSize) {
    chunks.push(message.slice(i, i + chunkSize));
  }
  return chunks;
}

/**
 * Interactive network packet delivery simulation.
 *
 * Users type a message, watch it get split into packets, and see them
 * travel different routes through a visual network to learn how the
 * internet delivers data.
 */
export function NetworkPostOffice(): React.ReactElement {
  const [message, setMessage] = useState("");
  const [packets, setPackets] = useState<Packet[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [reassembled, setReassembled] = useState("");
  const [activeNodes, setActiveNodes] = useState<Set<string>>(new Set());
  const [packetLossEnabled, setPacketLossEnabled] = useState(false);
  const animatingRef = useRef(false);

  const send = useCallback(async (): Promise<void> => {
    const trimmed = message.trim();
    if (!trimmed || isSending) return;

    setIsSending(true);
    setIsComplete(false);
    setReassembled("");
    animatingRef.current = true;

    const packetCount = Math.min(3, Math.max(2, Math.ceil(trimmed.length / 8)));
    const chunks = splitMessage(trimmed, packetCount);

    // Assign routes to packets
    const initialPackets: Packet[] = chunks.map((text, i) => ({
      id: i,
      route: ROUTES[i % ROUTES.length],
      currentHop: 0,
      color: PACKET_COLORS[i % PACKET_COLORS.length],
      text,
      isLost: false,
      isRetrying: false,
    }));

    // If packet loss is enabled, mark one packet to be lost on a middle hop
    const lostPacketIndex = packetLossEnabled ? Math.min(1, packetCount - 1) : -1;

    setPackets(initialPackets);

    // Find the maximum route length for animation timing
    const maxHops = Math.max(...initialPackets.map((p) => p.route.length));

    // Animate hop by hop
    for (let hop = 1; hop < maxHops + 2; hop++) {
      if (!animatingRef.current) break;

      await new Promise((resolve) => setTimeout(resolve, 500));

      setPackets((prev) =>
        prev.map((p) => {
          // Handle lost packet
          if (p.id === lostPacketIndex && !p.isRetrying && hop === 2) {
            return { ...p, isLost: true };
          }

          // If lost, stay in place until retry hop
          if (p.isLost && !p.isRetrying && hop === 3) {
            return { ...p, isLost: false, isRetrying: true, currentHop: 0 };
          }

          if (p.isLost) return p;

          const nextHop = p.isRetrying ? hop - 3 + 1 : hop;
          if (nextHop < p.route.length) {
            return { ...p, currentHop: nextHop };
          }
          return { ...p, currentHop: p.route.length - 1 };
        })
      );

      // Highlight active nodes
      setActiveNodes(() => {
        const active = new Set<string>();
        initialPackets.forEach((p) => {
          const effectiveHop = p.id === lostPacketIndex && hop >= 3 ? hop - 3 + 1 : hop;
          if (effectiveHop < p.route.length) {
            active.add(p.route[effectiveHop]);
          }
        });
        return active;
      });
    }

    // Extra delay for lost packet to arrive
    if (lostPacketIndex >= 0) {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setPackets((prev) =>
        prev.map((p) => ({
          ...p,
          currentHop: p.route.length - 1,
          isLost: false,
          isRetrying: false,
        }))
      );
    }

    await new Promise((resolve) => setTimeout(resolve, 300));
    setActiveNodes(new Set());
    setReassembled(trimmed);
    setIsComplete(true);
    setIsSending(false);
    animatingRef.current = false;
  }, [message, isSending, packetLossEnabled]);

  const reset = useCallback((): void => {
    animatingRef.current = false;
    setPackets([]);
    setIsSending(false);
    setIsComplete(false);
    setReassembled("");
    setActiveNodes(new Set());
  }, []);

  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center gap-8 py-8">
      <h2 className="text-center text-2xl font-semibold text-[var(--color-text-primary)]">
        Network Post Office
      </h2>
      <p className="text-center text-sm text-[var(--color-text-secondary)]">
        Send a message through the internet and watch how packets travel
      </p>

      {/* Message input */}
      <div className="flex w-full max-w-md gap-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value.slice(0, 50))}
          placeholder="Type a short message..."
          disabled={isSending}
          maxLength={50}
          className="min-h-[48px] flex-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-4 py-3 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:ring-2 focus:ring-[var(--color-accent-emerald)] focus:outline-none"
        />
        <button
          type="button"
          onClick={send}
          disabled={!message.trim() || isSending}
          className={cn(
            "min-h-[48px] rounded-lg px-5 py-3 text-sm font-semibold transition-colors duration-150",
            !message.trim() || isSending
              ? "cursor-not-allowed bg-[var(--color-bg-surface)] text-[var(--color-text-muted)]"
              : "bg-[var(--color-accent-emerald)] text-black hover:brightness-110"
          )}
        >
          Send
        </button>
      </div>

      {/* Packet loss toggle */}
      <label className="flex cursor-pointer items-center gap-2 text-sm text-[var(--color-text-secondary)]">
        <button
          type="button"
          role="switch"
          aria-checked={packetLossEnabled}
          onClick={() => setPacketLossEnabled((prev) => !prev)}
          className={cn(
            "relative h-6 w-11 rounded-full transition-colors duration-200",
            packetLossEnabled ? "bg-[var(--color-accent-emerald)]" : "bg-[var(--color-bg-surface)]"
          )}
        >
          <div
            className={cn(
              "absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200",
              packetLossEnabled && "translate-x-5"
            )}
          />
        </button>
        Simulate packet loss
      </label>

      {/* Network visualization */}
      <div className="relative w-full overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] backdrop-blur-xl">
        <svg
          viewBox="0 0 600 400"
          className="h-auto w-full"
          role="img"
          aria-label="Network topology with nodes and connections"
        >
          {/* Edges */}
          {EDGES.map((edge) => {
            const from = getNodePos(edge.from);
            const to = getNodePos(edge.to);
            return (
              <line
                key={`${edge.from}-${edge.to}`}
                x1={from.x}
                y1={from.y}
                x2={to.x}
                y2={to.y}
                stroke="rgba(255,255,255,0.08)"
                strokeWidth={2}
              />
            );
          })}

          {/* Nodes */}
          {NODES.map((node) => {
            const isActive = activeNodes.has(node.id);
            return (
              <g key={node.id}>
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={24}
                  fill={isActive ? "rgba(16,185,129,0.3)" : "rgba(255,255,255,0.04)"}
                  stroke={isActive ? "rgb(16,185,129)" : "rgba(255,255,255,0.12)"}
                  strokeWidth={2}
                  className="transition-all duration-300"
                />
                <text
                  x={node.x}
                  y={node.y + 1}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="#f0f0f0"
                  fontSize={12}
                  fontWeight={600}
                >
                  {node.id}
                </text>
                <text x={node.x} y={node.y + 42} textAnchor="middle" fill="#6b6b75" fontSize={10}>
                  {node.label}
                </text>
              </g>
            );
          })}

          {/* Packets */}
          {packets.map((packet) => {
            const nodeId = packet.route[packet.currentHop];
            const pos = getNodePos(nodeId);
            // Offset packets slightly so they don't stack
            const offsetY = (packet.id - 1) * 14;

            return (
              <g
                key={packet.id}
                className="transition-all duration-500 ease-in-out"
                style={{
                  transform: `translate(${pos.x - 10}px, ${pos.y - 36 + offsetY}px)`,
                  opacity: packet.isLost ? 0.3 : 1,
                }}
              >
                {/* Envelope shape */}
                <rect x={0} y={0} width={20} height={14} rx={2} fill={packet.color} />
                {/* Envelope flap */}
                <path d="M0,0 L10,7 L20,0" fill="none" stroke="rgba(0,0,0,0.2)" strokeWidth={1} />
                {/* Packet number */}
                <text
                  x={10}
                  y={10}
                  textAnchor="middle"
                  fill="rgba(0,0,0,0.6)"
                  fontSize={8}
                  fontWeight={700}
                >
                  {packet.id + 1}
                </text>
                {/* Lost indicator */}
                {packet.isLost && (
                  <text
                    x={10}
                    y={-4}
                    textAnchor="middle"
                    fill="#ef4444"
                    fontSize={10}
                    fontWeight={700}
                  >
                    LOST!
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Packet chunks display */}
      {packets.length > 0 && (
        <div className="flex flex-wrap justify-center gap-2">
          {packets.map((packet) => (
            <div
              key={packet.id}
              className="rounded-lg border px-3 py-1.5 font-[family-name:var(--font-mono)] text-xs"
              style={{
                borderColor: packet.color,
                color: packet.color,
                backgroundColor: `${packet.color}15`,
              }}
            >
              Packet {packet.id + 1}: &ldquo;{packet.text}&rdquo;
            </div>
          ))}
        </div>
      )}

      {/* Reassembled message */}
      {isComplete && (
        <div className="w-full max-w-md rounded-xl border border-[var(--color-accent-emerald)]/30 bg-[var(--color-accent-emerald)]/10 p-5 text-center">
          <p className="mb-1 text-xs font-semibold text-[var(--color-accent-emerald)]">
            Message reassembled at server
          </p>
          <p className="font-[family-name:var(--font-mono)] text-sm text-[var(--color-text-primary)]">
            &ldquo;{reassembled}&rdquo;
          </p>
        </div>
      )}

      {/* Reset button */}
      {(packets.length > 0 || isComplete) && (
        <button
          type="button"
          onClick={reset}
          disabled={isSending}
          className="min-h-[48px] rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-6 py-3 text-sm font-medium text-[var(--color-text-secondary)] transition-colors duration-150 hover:bg-[var(--color-bg-surface-hover)]"
        >
          Reset
        </button>
      )}

      {/* What you just learned */}
      <div className="mt-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-6 backdrop-blur-xl">
        <h3 className="mb-2 text-sm font-semibold text-[var(--color-accent-emerald)]">
          What you just learned
        </h3>
        <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">
          When you send a message online, it gets split into small pieces called packets. Each
          packet finds its own path through the network. They might arrive in different order, but
          the receiving computer puts them back together. That&apos;s how the internet works —
          millions of packets finding their way, right now.
        </p>
      </div>
    </div>
  );
}
