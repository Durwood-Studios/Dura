import Link from "next/link";
import {
  Monitor,
  Server,
  Layers,
  Cloud,
  Brain,
  Shield,
  Database,
  TestTube,
  Activity,
  Smartphone,
  Users,
  Compass,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Role } from "@/types/career-track";

const ICON_MAP: Record<string, LucideIcon> = {
  Monitor,
  Server,
  Layers,
  Cloud,
  Brain,
  Shield,
  Database,
  TestTube,
  Activity,
  Smartphone,
  Users,
  Compass,
};

const DEMAND_STYLES: Record<string, { label: string; className: string }> = {
  high: { label: "High Demand", className: "bg-amber-500/10 text-amber-400" },
  "very-high": { label: "Very High Demand", className: "bg-emerald-500/10 text-emerald-400" },
  extreme: { label: "Extreme Demand", className: "bg-rose-500/10 text-rose-400" },
};

interface RoleCardProps {
  role: Role;
  isHighlighted?: boolean;
}

/** Card linking to a role's detail page. Server Component. */
export function RoleCard({ role, isHighlighted = false }: RoleCardProps): React.ReactElement {
  const Icon = ICON_MAP[role.icon];
  const demand = DEMAND_STYLES[role.demandLevel];
  const juniorSkillCount = role.levels.junior.required.length;

  return (
    <Link
      href={`/tracks/${role.slug}`}
      className={`dura-card group flex items-start gap-4 overflow-hidden p-5 transition-colors ${
        isHighlighted ? "ring-2 ring-emerald-500/50" : ""
      }`}
      style={{ borderLeft: `4px solid ${role.color}` }}
    >
      {Icon && (
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
          style={{ backgroundColor: `${role.color}15` }}
        >
          <Icon className="h-5 w-5" style={{ color: role.color }} aria-hidden="true" />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <h3 className="text-base font-semibold text-[var(--color-text-primary)] transition-colors group-hover:text-emerald-400">
          {role.title}
        </h3>
        <p className="mt-0.5 text-sm text-[var(--color-text-secondary)]">{role.tagline}</p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {demand && (
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${demand.className}`}>
              {demand.label}
            </span>
          )}
          <span className="text-xs text-[var(--color-text-muted)]">
            {juniorSkillCount} skills at junior level
          </span>
        </div>
      </div>
    </Link>
  );
}
