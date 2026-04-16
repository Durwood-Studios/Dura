"use client";

import { useCallback, useState } from "react";
import { markActivityComplete } from "@/components/discover/Passport";

interface StoryNode {
  id: string;
  text: string;
  choices?: { label: string; nextId: string }[];
}

const STORY_NODES: Record<string, StoryNode> = {
  start: {
    id: "start",
    text: "You find a mysterious door at the end of a long hallway.",
    choices: [
      { label: "The door is locked", nextId: "locked" },
      { label: "The door is unlocked", nextId: "unlocked" },
    ],
  },
  locked: {
    id: "locked",
    text: "The door won't budge! You need a key. What do you do?",
    choices: [
      { label: "Search the room", nextId: "search" },
      { label: "Kick the door", nextId: "kick" },
    ],
  },
  unlocked: {
    id: "unlocked",
    text: "The door swings open easily. Beyond it you see two paths.",
    choices: [
      { label: "Enter the garden", nextId: "garden" },
      { label: "Enter the cave", nextId: "cave" },
    ],
  },
  search: {
    id: "search",
    text: "You look carefully around the room... there! A shiny key hidden under the mat. You unlock the door and walk through. Victory!",
  },
  kick: {
    id: "kick",
    text: "OUCH! The door doesn't budge and your foot hurts. Maybe there's a smarter way...",
  },
  garden: {
    id: "garden",
    text: "Sunlight floods in. Butterflies dance around colorful flowers. You've found a secret garden. You win!",
  },
  cave: {
    id: "cave",
    text: "It's dark at first, but then you see a glow... a treasure chest full of golden coins! You're rich!",
  },
};

/** Color for each node in the flowchart. */
const NODE_COLORS: Record<string, string> = {
  start: "#a78bfa",
  locked: "#f97316",
  unlocked: "#22d3ee",
  search: "#22c55e",
  kick: "#f87171",
  garden: "#34d399",
  cave: "#fbbf24",
};

/** Short label for the flowchart display. */
const NODE_LABELS: Record<string, string> = {
  start: "Door",
  locked: "Locked",
  unlocked: "Unlocked",
  search: "Search",
  kick: "Kick",
  garden: "Garden",
  cave: "Cave",
};

/** Builds a branching story using if/then choices with a visual path. */
export function StoryBuilder(): React.ReactElement {
  const [path, setPath] = useState<string[]>(["start"]);
  const [hasCompleted, setHasCompleted] = useState(false);

  const currentNodeId = path[path.length - 1];
  const currentNode = STORY_NODES[currentNodeId];
  const isEnding = !currentNode.choices;

  const makeChoice = useCallback(
    (nextId: string): void => {
      setPath((prev) => [...prev, nextId]);
      if (!hasCompleted) {
        // Complete once kid reaches any ending
        const nextNode = STORY_NODES[nextId];
        if (!nextNode.choices) {
          setHasCompleted(true);
          markActivityComplete("story-builder");
        }
      }
    },
    [hasCompleted]
  );

  const restart = useCallback((): void => {
    setPath(["start"]);
  }, []);

  return (
    <div className="flex flex-col items-center gap-6 lg:flex-row lg:items-start lg:gap-10">
      {/* Story panel */}
      <div className="flex w-full max-w-md flex-col gap-5">
        {/* Story text with path history */}
        <div className="flex flex-col gap-3">
          {path.map((nodeId, i) => {
            const node = STORY_NODES[nodeId];
            const isLatest = i === path.length - 1;
            return (
              <div
                key={`${nodeId}-${i}`}
                className="rounded-2xl border p-4 transition-opacity"
                style={{
                  borderColor: isLatest ? NODE_COLORS[nodeId] : "rgba(255,255,255,0.06)",
                  backgroundColor: isLatest ? `${NODE_COLORS[nodeId]}10` : "rgba(255,255,255,0.02)",
                  opacity: isLatest ? 1 : 0.6,
                }}
              >
                <p className="text-lg leading-relaxed text-white/90">{node.text}</p>
              </div>
            );
          })}
        </div>

        {/* Choice buttons */}
        {currentNode.choices && (
          <div className="flex flex-col gap-3">
            {currentNode.choices.map((choice) => (
              <button
                key={choice.nextId}
                onClick={() => makeChoice(choice.nextId)}
                className="min-h-14 rounded-2xl border-2 px-6 text-lg font-semibold transition-all hover:scale-[1.02]"
                style={{
                  borderColor: NODE_COLORS[choice.nextId],
                  backgroundColor: `${NODE_COLORS[choice.nextId]}15`,
                  color: NODE_COLORS[choice.nextId],
                }}
              >
                {choice.label}
              </button>
            ))}
          </div>
        )}

        {/* Ending + restart */}
        {isEnding && (
          <button
            onClick={restart}
            className="min-h-12 rounded-xl bg-purple-500 px-6 text-lg font-semibold text-white transition-colors hover:bg-purple-400"
          >
            Restart Story
          </button>
        )}
      </div>

      {/* Flowchart sidebar */}
      <div className="w-full max-w-xs">
        <p className="mb-3 text-center text-base font-medium text-white/50">Your path</p>
        <div className="flex flex-col items-center gap-1">
          {path.map((nodeId, i) => (
            <div key={`flow-${nodeId}-${i}`} className="flex flex-col items-center">
              {i > 0 && <div className="h-5 w-0.5 bg-white/20" />}
              <div
                className="flex min-h-10 min-w-28 items-center justify-center rounded-xl px-4 text-base font-semibold text-white"
                style={{ backgroundColor: NODE_COLORS[nodeId] }}
              >
                {NODE_LABELS[nodeId]}
              </div>
            </div>
          ))}
          {/* Show remaining unchosen branches as faded */}
          {currentNode.choices && (
            <>
              <div className="h-5 w-0.5 bg-white/10" />
              <div className="flex gap-3">
                {currentNode.choices.map((choice) => (
                  <div
                    key={choice.nextId}
                    className="flex min-h-10 min-w-20 items-center justify-center rounded-xl border border-dashed px-3 text-sm font-medium"
                    style={{
                      borderColor: `${NODE_COLORS[choice.nextId]}60`,
                      color: `${NODE_COLORS[choice.nextId]}80`,
                    }}
                  >
                    {NODE_LABELS[choice.nextId]}?
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Learning callout — full width below on mobile */}
      <div className="w-full max-w-md rounded-2xl border border-cyan-400/20 bg-cyan-400/5 p-5 lg:hidden">
        <p className="text-lg leading-relaxed text-cyan-200">
          <strong className="text-cyan-300">What you just learned:</strong> You just used{" "}
          <em>conditional logic</em> &mdash; if this, then that. Every time an app checks your
          password, a game decides if you won, or a website shows you content based on your choices,
          it&apos;s using if/then logic.
        </p>
      </div>

      {/* Desktop callout — shown in sidebar area */}
      <div className="hidden w-full max-w-xs rounded-2xl border border-cyan-400/20 bg-cyan-400/5 p-5 lg:block">
        <p className="text-lg leading-relaxed text-cyan-200">
          <strong className="text-cyan-300">What you just learned:</strong> You just used{" "}
          <em>conditional logic</em> &mdash; if this, then that. Every time an app checks your
          password, a game decides if you won, or a website shows you content based on your choices,
          it&apos;s using if/then logic.
        </p>
      </div>
    </div>
  );
}
