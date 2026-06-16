import type { DictionaryTerm } from "@/types/dictionary";

/**
 * Cache-aware programming dictionary terms.
 * Atomic explainers for the vocabulary referenced by the Phase Q
 * cache-aware programming lesson (q-3): cache hierarchy, locality,
 * AoS/SoA, false sharing, padding, and prefetch.
 */
export const CACHE_AWARE_TERMS: DictionaryTerm[] = [
  {
    slug: "cache-line",
    term: "Cache Line",
    aliases: ["cache block"],
    category: "systems",
    phaseIds: ["q"],
    lessonIds: ["q-3-cache-aware-programming"],
    definitions: {
      beginner:
        "The fixed-size chunk of memory the CPU moves at once. Even if you read one byte, the CPU grabs the whole chunk — 64 bytes on most desktop and server chips.",
      intermediate:
        "The unit of transfer between main memory and CPU cache. Accessing any address pulls in its entire aligned line (64 bytes on mainstream x86-64), so adjacent data comes along for free and coherence is tracked per line, not per byte.",
      advanced:
        "The granularity of cache fills, evictions, and coherence-protocol state transitions. Line size (commonly 64B on x86-64) determines spatial-locality payoff and is the physical reason two logically independent variables on one line can false-share. Distinct from std::hardware_destructive_interference_size, which is >= the line size.",
    },
    seeAlso: ["cache-hierarchy", "false-sharing", "spatial-locality"],
  },
  {
    slug: "cache-hierarchy",
    term: "Cache Hierarchy",
    aliases: ["memory hierarchy", "L1 L2 L3"],
    category: "systems",
    phaseIds: ["q"],
    lessonIds: ["q-3-cache-aware-programming"],
    definitions: {
      beginner:
        "The stack of progressively larger, slower memories between the CPU and main memory — L1 is tiny and fast, L3 is big and slower, DRAM is huge and slowest.",
      intermediate:
        "The layered set of caches (L1d, L2, L3) plus DRAM, each level larger and slower than the one above. L1/L2 are typically per-core; L3 is shared. Each level down is roughly 3-10x slower, with an ~100x cliff from an L1 hit to a DRAM miss.",
      advanced:
        "An inclusive-or-exclusive multilevel cache organization trading capacity against latency. Per-core L1/L2 and a shared L3 form the on-die tiers; the latency curve (single-digit cycles at L1 to hundreds at DRAM) makes line-count, not byte-count, the dominant performance lever in hot paths.",
    },
    seeAlso: ["cache-line", "cache-hit", "cache-miss"],
  },
  {
    slug: "spatial-locality",
    term: "Spatial Locality",
    aliases: [],
    category: "systems",
    phaseIds: ["q"],
    lessonIds: ["q-3-cache-aware-programming"],
    definitions: {
      beginner:
        "Using data that sits near data you just used. Because the CPU loads a whole cache line at once, the next nearby item is usually already there.",
      intermediate:
        "The property that programs tend to access memory addresses close to ones recently accessed. Iterating a contiguous array exploits it: one miss per line, then hits on the rest of that line. The hardware prefetcher rewards forward sequential strides.",
      advanced:
        "The locality dimension the cache-fill granularity and stride prefetcher are built to exploit. Maximized by contiguous, sequentially scanned layouts (e.g. structure-of-arrays for hot fields); defeated by pointer chasing, which makes the next address unpredictable.",
    },
    seeAlso: ["temporal-locality", "cache-line", "prefetch"],
  },
  {
    slug: "temporal-locality",
    term: "Temporal Locality",
    aliases: [],
    category: "systems",
    phaseIds: ["q"],
    lessonIds: ["q-3-cache-aware-programming"],
    definitions: {
      beginner:
        "Using the same data again soon. If it is still in the cache from last time, the re-access is nearly free.",
      intermediate:
        "The property that recently accessed addresses are likely to be accessed again soon. A loop counter or a frequently read value stays resident in L1 because it is touched constantly, so repeated reads hit.",
      advanced:
        "The locality dimension cache replacement policies (LRU-approximating) are tuned for. Working sets that fit a cache level stay resident; exceeding capacity causes capacity misses that evict still-needed lines, the failure mode locality-aware blocking and tiling address.",
    },
    seeAlso: ["spatial-locality", "cache-hit", "cache-hierarchy"],
  },
  {
    slug: "cache-hit",
    term: "Cache Hit",
    aliases: [],
    category: "systems",
    phaseIds: ["q"],
    lessonIds: ["q-3-cache-aware-programming"],
    definitions: {
      beginner:
        "When the data the CPU needs is already in a fast cache, so it does not have to wait for slow main memory.",
      intermediate:
        "An access whose target line is already resident in a cache level, served in that level's latency (single-digit cycles at L1) instead of going further down the hierarchy.",
      advanced:
        "A lookup that resolves at a given cache tier without forwarding the request to a lower level. Hit rate, combined with per-level latency, determines effective memory access time (AMAT); maximizing it is the goal of locality-aware layout.",
    },
    seeAlso: ["cache-miss", "cache-hierarchy", "temporal-locality"],
  },
  {
    slug: "cache-miss",
    term: "Cache Miss",
    aliases: [],
    category: "systems",
    phaseIds: ["q"],
    lessonIds: ["q-3-cache-aware-programming"],
    definitions: {
      beginner:
        "When the data the CPU needs is NOT in a fast cache, so it must fetch it from a slower level — costing far more time.",
      intermediate:
        "An access whose target line is not resident at a cache level, forcing a fetch from a lower (slower) level. A miss all the way to DRAM can cost ~100x an L1 hit, stalling the core for hundreds of cycles.",
      advanced:
        "A lookup that misses at a tier and forwards down the hierarchy. Classified as compulsory, capacity, or conflict (the 3 Cs); a DRAM-bound miss stalls the core for the equivalent of hundreds of instructions and dominates measured latency in tight hot paths.",
    },
    seeAlso: ["cache-hit", "cache-hierarchy", "prefetch"],
  },
  {
    slug: "aos",
    term: "Array of Structs (AoS)",
    aliases: ["array-of-structs"],
    category: "systems",
    phaseIds: ["q"],
    lessonIds: ["q-3-cache-aware-programming"],
    definitions: {
      beginner:
        "A layout where you store a list of whole records, each record holding all its fields together — the natural object-oriented arrangement.",
      intermediate:
        "A memory layout where each record's fields are contiguous and records are laid end to end. Loading one record is cheap (its fields are on one or two lines), but scanning one field across many records drags in the unused fields too.",
      advanced:
        "The record-contiguous layout. Optimal when an access pattern touches most fields of few records; pessimal for read-many-records-few-fields scans because the per-record stride wastes line bandwidth on untouched fields. Contrast structure-of-arrays (SoA).",
    },
    seeAlso: ["soa", "spatial-locality", "cache-line"],
  },
  {
    slug: "soa",
    term: "Structure of Arrays (SoA)",
    aliases: ["structure-of-arrays"],
    category: "systems",
    phaseIds: ["q"],
    lessonIds: ["q-3-cache-aware-programming"],
    definitions: {
      beginner:
        "A layout where each field becomes its own array. All the prices live in one tight array, all the IDs in another — so scanning just prices touches only prices.",
      intermediate:
        "A memory layout where each field of a record is stored in its own contiguous array. A loop reading one field streams it densely (e.g. 8 int64 prices per 64-byte line) with no wasted bytes, feeding the prefetcher a clean stride.",
      advanced:
        "The field-contiguous layout. Optimal for read-many-records-few-fields scans (vectorizes well, maximizes useful bytes per line); costs scattered access when a single whole record is needed. The complement of array-of-structs (AoS); real systems often keep both and choose per access pattern.",
    },
    seeAlso: ["aos", "spatial-locality", "prefetch"],
  },
  {
    slug: "false-sharing",
    term: "False Sharing",
    aliases: [],
    category: "systems",
    phaseIds: ["q"],
    lessonIds: ["q-3-cache-aware-programming"],
    definitions: {
      beginner:
        "When two threads write to two different variables that happen to sit in the same cache line, the CPU treats it like they are fighting over the same data — and everything slows down even though nothing is truly shared.",
      intermediate:
        "A performance bug where logically independent variables written by different cores land on one cache line, so each write invalidates the other core's copy. The line ping-pongs across the interconnect under the coherence protocol, serializing threads with no lock present.",
      advanced:
        "Coherence-induced contention from co-located, independently written data. Because MESI-family protocols operate at line granularity, a write forces the line into Modified state and invalidates remote copies; the ping-pong can cost a 5-10x throughput loss. Eliminated by padding each hot field to a full destructive-interference span.",
    },
    seeAlso: ["cache-line-padding", "cache-line", "hardware-destructive-interference-size"],
  },
  {
    slug: "cache-line-padding",
    term: "Cache-Line Padding",
    aliases: ["padding to a cache line", "alignas padding"],
    category: "systems",
    phaseIds: ["q"],
    lessonIds: ["q-3-cache-aware-programming"],
    definitions: {
      beginner:
        "Adding filler bytes so that each hot variable gets its own cache line and cannot accidentally collide with another thread's variable.",
      intermediate:
        "Aligning and padding a struct (e.g. with alignas plus a trailing char array) so each element occupies a full cache line. This guarantees one core's write cannot invalidate another's line, eliminating false sharing at the cost of a few 'wasted' bytes.",
      advanced:
        "The standard remedy for false sharing: force per-element alignment and a stride of one destructive-interference span so independently written objects never co-reside on a line. The padded bytes buy back the entire coherence penalty — a correct trade on hot, frequently written data.",
    },
    seeAlso: ["false-sharing", "hardware-destructive-interference-size", "cache-line"],
  },
  {
    slug: "prefetch",
    term: "Prefetch",
    aliases: ["prefetching", "__builtin_prefetch"],
    category: "systems",
    phaseIds: ["q"],
    lessonIds: ["q-3-cache-aware-programming"],
    definitions: {
      beginner:
        "Telling the CPU to start loading data you will need soon, so it is already in cache by the time you actually use it.",
      intermediate:
        "Starting a cache-line load before the data is needed, overlapping the load latency with other work. Hardware prefetchers do this automatically for predictable strides; software prefetch hints (e.g. __builtin_prefetch) cover unpredictable patterns the hardware cannot guess.",
      advanced:
        "Speculative line fetch to hide memory latency. A software hint is timing-only (never changes results) and helps only for hardware-unpredictable access (pointer chasing, computed-index gather) issued far enough ahead to land before use without premature eviction. Misused, it wastes issue slots and pollutes cache — the last optimization to reach for, after layout.",
    },
    seeAlso: ["spatial-locality", "cache-miss", "cache-line"],
  },
  {
    slug: "hardware-destructive-interference-size",
    term: "Hardware Destructive Interference Size",
    aliases: ["std::hardware_destructive_interference_size", "destructive interference size"],
    category: "systems",
    phaseIds: ["q"],
    lessonIds: ["q-3-cache-aware-programming"],
    definitions: {
      beginner:
        "A number from the C++ standard library telling you how far apart to put two variables so two threads will not slow each other down by sharing a cache line.",
      intermediate:
        "A C++17 constant (in <new>) giving the minimum offset between two objects that guarantees they will not land on the same cache line — the size to pad to when avoiding false sharing. Implementation-defined: commonly 64 on libc++/x86-64, but often 128 on Intel parts.",
      advanced:
        "The most implementation-defined constant in the standard library. It must be >= the cache line size but is frequently larger: many Intel parts report 128 because the L2 adjacent-line/spatial prefetcher pulls line pairs (hence GCC's -Winterference-size warning and folly hardcoding 128). NOT a portable name for the line size — its sibling std::hardware_constructive_interference_size is the line size.",
    },
    seeAlso: ["false-sharing", "cache-line-padding", "cache-line"],
  },
];
