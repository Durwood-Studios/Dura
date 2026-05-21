"use client";

import Link from "next/link";
import { ParallaxCard } from "@/components/discover/ParallaxCard";

interface Room {
  slug: string;
  name: string;
  tagline: string;
  emoji: string;
  color: string;
  activityCount: number;
}

export function DiscoverGrid({ rooms }: { rooms: Room[] }): React.ReactElement {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {rooms.map((room) => (
        <ParallaxCard key={room.slug}>
          <Link
            href={`/discover/${room.slug}`}
            className="group relative flex min-h-[240px] flex-col items-center justify-center overflow-hidden rounded-2xl border border-[var(--color-border)] transition-shadow duration-200 hover:shadow-lg hover:shadow-black/20"
          >
            {/* Gradient background */}
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background: `linear-gradient(135deg, ${room.color}18 0%, ${room.color}08 100%)`,
              }}
            />
            <div className="relative z-10 flex flex-col items-center px-6 py-8">
              <span className="text-6xl" role="img" aria-hidden="true">
                {room.emoji}
              </span>
              <h2 className="mt-4 text-xl font-bold text-[var(--color-text-primary)]">
                {room.name}
              </h2>
              <p className="mt-1 text-[15px] text-[var(--color-text-muted)]">{room.tagline}</p>
              <span
                className="mt-3 rounded-full px-3 py-0.5 text-xs font-medium"
                style={{
                  backgroundColor: `${room.color}20`,
                  color: room.color,
                }}
              >
                {room.activityCount} activities
              </span>
            </div>
          </Link>
        </ParallaxCard>
      ))}
    </div>
  );
}
