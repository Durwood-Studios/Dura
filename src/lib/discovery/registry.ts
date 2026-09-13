import { z } from "zod";

/** Reachable activities; the route registry is checked against these exact keys. */
export const DISCOVERY_ACTIVITIES = [
  {
    slug: "binary-painter",
    title: "Binary Painter",
    roomSlug: "secret-codes",
    roomName: "Secret Codes",
  },
  {
    slug: "morse-code",
    title: "Morse Code",
    roomSlug: "secret-codes",
    roomName: "Secret Codes",
  },
  {
    slug: "pixel-art",
    title: "Pixel Art",
    roomSlug: "secret-codes",
    roomName: "Secret Codes",
  },
  {
    slug: "secret-encoder",
    title: "Secret Encoder",
    roomSlug: "secret-codes",
    roomName: "Secret Codes",
  },
  {
    slug: "hash-avalanche",
    title: "Hash Avalanche",
    roomSlug: "secret-codes",
    roomName: "Secret Codes",
  },
  {
    slug: "algorithm-kitchen",
    title: "Algorithm Kitchen",
    roomSlug: "robot-chef",
    roomName: "Robot Chef",
  },
  {
    slug: "robot-dance",
    title: "Robot Dance",
    roomSlug: "robot-chef",
    roomName: "Robot Chef",
  },
  {
    slug: "treasure-map",
    title: "Treasure Map",
    roomSlug: "robot-chef",
    roomName: "Robot Chef",
  },
  {
    slug: "sorting-race",
    title: "Sorting Race",
    roomSlug: "robot-chef",
    roomName: "Robot Chef",
  },
  {
    slug: "pathfinding",
    title: "Pathfinding",
    roomSlug: "robot-chef",
    roomName: "Robot Chef",
  },
  {
    slug: "network-post-office",
    title: "Network Post Office",
    roomSlug: "internet-explorer",
    roomName: "Internet Explorer",
  },
  {
    slug: "dns-phonebook",
    title: "DNS Phonebook",
    roomSlug: "internet-explorer",
    roomName: "Internet Explorer",
  },
  {
    slug: "website-builder",
    title: "Website Builder",
    roomSlug: "internet-explorer",
    roomName: "Internet Explorer",
  },
  {
    slug: "event-loop",
    title: "Event Loop",
    roomSlug: "web-platform",
    roomName: "Web Platform",
  },
  {
    slug: "pattern-machine",
    title: "Pattern Machine",
    roomSlug: "pattern-factory",
    roomName: "Pattern Factory",
  },
  {
    slug: "fractal-tree",
    title: "Fractal Tree",
    roomSlug: "pattern-factory",
    roomName: "Pattern Factory",
  },
  {
    slug: "music-beats",
    title: "Music Beats",
    roomSlug: "pattern-factory",
    roomName: "Pattern Factory",
  },
  {
    slug: "tile-designer",
    title: "Tile Designer",
    roomSlug: "pattern-factory",
    roomName: "Pattern Factory",
  },
  {
    slug: "memoization-cliff",
    title: "Memoization Cliff",
    roomSlug: "pattern-factory",
    roomName: "Pattern Factory",
  },
  {
    slug: "embedding-galaxy",
    title: "Embedding Galaxy",
    roomSlug: "pattern-factory",
    roomName: "Pattern Factory",
  },
  {
    slug: "bug-detective",
    title: "Bug Detective",
    roomSlug: "bug-lab",
    roomName: "Bug Lab",
  },
  {
    slug: "logic-gates",
    title: "Logic Gates",
    roomSlug: "bug-lab",
    roomName: "Bug Lab",
  },
  {
    slug: "story-builder",
    title: "Story Builder",
    roomSlug: "bug-lab",
    roomName: "Bug Lab",
  },
  {
    slug: "race-condition",
    title: "Race Condition",
    roomSlug: "bug-lab",
    roomName: "Bug Lab",
  },
  {
    slug: "n-plus-one",
    title: "N+1 Query Problem",
    roomSlug: "data-vault",
    roomName: "Data Vault",
  },
  {
    slug: "optimistic-ui",
    title: "Optimistic UI",
    roomSlug: "state-machine",
    roomName: "State Machine",
  },
  {
    slug: "gc-visualizer",
    title: "GC Visualizer",
    roomSlug: "bug-lab",
    roomName: "Bug Lab",
  },
  {
    slug: "pubsub",
    title: "Pub/Sub",
    roomSlug: "live-wire",
    roomName: "Live Wire",
  },
] as const;

export type DiscoveryActivitySlug = (typeof DISCOVERY_ACTIVITIES)[number]["slug"];
export const DISCOVERY_ACTIVITY_SLUGS = DISCOVERY_ACTIVITIES.map((activity) => activity.slug);
export const DiscoveryActivitiesSchema = z
  .array(z.enum(DISCOVERY_ACTIVITY_SLUGS))
  .max(DISCOVERY_ACTIVITIES.length)
  .refine((values) => new Set(values).size === values.length, "Passport activities must be unique");

/** Guard route and persistence inputs against removed or invented activities. */
export function isDiscoveryActivitySlug(value: string): value is DiscoveryActivitySlug {
  return DISCOVERY_ACTIVITY_SLUGS.some((slug) => slug === value);
}
