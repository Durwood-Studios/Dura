"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ParallaxCard } from "@/components/discover/ParallaxCard";

interface Room {
  slug: string;
  name: string;
  tagline: string;
  emoji: string;
  color: string;
  activityCount: number;
  concept: string;
  phaseId: string;
}

export function DiscoverGrid({ rooms }: { rooms: Room[] }): React.ReactElement {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {rooms.map((room) => (
        <ParallaxCard key={room.slug}>
          <Link
            href={`/discover/${room.slug}`}
            className="group relative flex min-h-[260px] flex-col overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] transition-shadow duration-200 hover:shadow-lg hover:shadow-black/20"
          >
            {/* Colored accent band */}
            <div className="h-1.5 w-full shrink-0" style={{ backgroundColor: room.color }} />

            <div className="flex flex-1 flex-col p-6">
              {/* Header: emoji + concept badge */}
              <div className="flex items-start justify-between gap-3">
                <span className="text-3xl" role="img" aria-hidden="true">
                  {room.emoji}
                </span>
                <span
                  className="rounded-full px-2.5 py-1 text-xs font-medium tracking-wide uppercase"
                  style={{
                    backgroundColor: `${room.color}1f`,
                    color: room.color,
                  }}
                >
                  {room.concept}
                </span>
              </div>

              {/* Title + tagline */}
              <h2 className="mt-4 text-xl font-bold text-[var(--color-text-primary)]">
                {room.name}
              </h2>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-[var(--color-text-secondary)]">
                {room.tagline}
              </p>

              {/* Footer: activity count + curriculum link */}
              <div className="mt-5 flex items-center justify-between border-t border-[var(--color-border)] pt-4">
                <span className="text-xs text-[var(--color-text-muted)]">
                  {room.activityCount} activities
                </span>
                <span className="inline-flex items-center gap-1 text-xs font-medium text-[var(--color-text-secondary)]">
                  Phase {room.phaseId}
                  <ArrowRight size={12} className="transition group-hover:translate-x-0.5" />
                </span>
              </div>
            </div>
          </Link>
        </ParallaxCard>
      ))}
    </div>
  );
}
