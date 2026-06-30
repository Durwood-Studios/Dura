import type { AssessmentQuestion } from "@/types/assessment";

/**
 * Phase 12 question bank — 54 questions across 9 modules.
 * Covers modern C++ for HFT, IEEE 754 numerics, cache-aware programming,
 * lock-free data structures, kernel-bypass networking, ITCH/OUCH market data,
 * FIX protocol, the order-book capstone, and quant finance mathematics.
 */

function q(
  id: string,
  moduleId: string,
  type: AssessmentQuestion["type"],
  question: string,
  options: string[],
  correct: number | number[],
  explanation: string,
  difficulty: AssessmentQuestion["difficulty"],
  tags: string[]
): AssessmentQuestion {
  return {
    id,
    phaseId: "12",
    moduleId,
    type,
    question,
    options,
    correct,
    explanation,
    difficulty,
    tags,
    standards: { bloom: "understand" },
  };
}

export const PHASE_12_QUESTIONS: AssessmentQuestion[] = [
  // ── Module q-1: Modern C++ for HFT ───────────────────────────────────────
  q(
    "q-1-q1",
    "q-1",
    "multiple-choice",
    "A function returns a locally-constructed `std::vector<Order>` as `return orders;`. A reviewer suggests changing it to `return std::move(orders);` to avoid a copy. What is the correct response?",
    [
      "Accept — std::move always avoids a copy and is strictly faster",
      "Reject — `return orders;` already qualifies for NRVO; the compiler builds the vector directly in the caller's storage. Adding `std::move` defeats NRVO by converting the named local to an rvalue, potentially introducing a move that NRVO would have eliminated",
      "Accept — without std::move, the vector is deep-copied on the way out",
      "Reject — std::move is only valid on heap-allocated objects",
    ],
    1,
    "Named Return Value Optimization (NRVO): returning a named local is the case the compiler constructs directly in the caller's return slot, eliminating both copy and move. `std::move` forces the expression to be an rvalue, which disqualifies NRVO and reintroduces an avoidable move. Never `std::move` a return value.",
    "medium",
    ["move-semantics", "rvo-nrvo", "cpp"]
  ),
  q(
    "q-1-q2",
    "q-1",
    "multiple-choice",
    "Inside a perfect-forwarding wrapper `template <typename... Args> void log(Args&&... args)`, the implementation writes `target(std::move(args)...)`. What breaks?",
    [
      "Nothing — std::move and std::forward are interchangeable inside a template",
      "It fails to compile because std::move does not accept a parameter pack",
      "For any argument passed as an lvalue, std::move unconditionally casts it to an rvalue, so `target` may move-from (steal) the caller's variable — leaving it in a valid-but-empty state without the caller's knowledge",
      "It adds a runtime branch that slows performance",
    ],
    2,
    "`Args&&...` in a deduced context is a forwarding reference — it remembers whether each argument was an lvalue or rvalue. `std::forward` replays that distinction. `std::move` discards it and casts everything to rvalue, silently stealing from lvalues the caller still owns. The bug compiles and may pass tests where all arguments happen to be temporaries.",
    "hard",
    ["perfect-forwarding", "std-forward", "cpp"]
  ),
  q(
    "q-1-q3",
    "q-1",
    "multiple-choice",
    "Why do HFT hot-path codebases ban `virtual` functions and replace them with templates?",
    [
      "Templates produce smaller binaries, which is the primary latency concern",
      "A virtual call is an indirect branch through a vtable — an extra memory load and a branch the CPU frequently mispredicts (~15 ns pipeline flush); a template is resolved at compile time and inlined, so the abstraction disappears and the call becomes a direct predictable instruction",
      "Virtual functions cannot be marked `noexcept`",
      "Concepts perform the type check at runtime, giving better error messages",
    ],
    1,
    "Virtual dispatch: load vtable pointer, load function pointer from vtable, indirect branch — the indirect branch is notoriously hard to predict and flushes the pipeline when it mispredicts. Templates eliminate the indirection: the compiler knows the concrete type at instantiation and inlines the call. Same abstraction, zero runtime cost.",
    "medium",
    ["cpp", "templates", "hot-path"]
  ),
  q(
    "q-1-q4",
    "q-1",
    "multiple-choice",
    "What does marking a move constructor `noexcept` enable that a non-`noexcept` move constructor does not?",
    [
      "The move constructor can then be called from a `constexpr` context",
      "`std::vector` and similar containers choose to MOVE (not copy) elements during reallocation only when the move constructor is declared `noexcept`; without it, the container falls back to copying to maintain the strong exception guarantee",
      "`noexcept` eliminates the need for a corresponding copy constructor",
      "It enables the compiler to inline the move constructor at all call sites",
    ],
    1,
    "`std::vector::push_back` may reallocate. If the element's move constructor is not `noexcept`, the vector cannot move elements — a throwing move during reallocation would leave the vector in a corrupted state with no recovery. So if move throws, the standard mandates copying. `noexcept` on the move constructor is what lets the vector avoid the more expensive copy during reallocation.",
    "hard",
    ["move-semantics", "noexcept", "cpp"]
  ),
  q(
    "q-1-q5",
    "q-1",
    "multiple-choice",
    "What is `std::span<const std::byte>` and what problem does it solve compared to a raw pointer-plus-length pair?",
    [
      "It is an owning smart pointer that manages a byte buffer's lifetime",
      "It is a non-owning view over a contiguous byte sequence that packages the pointer and the count together, enables bounds-aware access via `subspan()`, and converts from any contiguous container (array, vector, string) without copying — eliminating the fragile two-argument pattern where pointer and length can disagree",
      "It is a heap-allocated resizable buffer suitable for network receive buffers",
      "It performs runtime type-checking on the underlying bytes",
    ],
    1,
    "`std::span` is a lightweight non-owning view: a pointer plus a size, passed by value (two words). It replaces the C-style `(ptr, len)` pair with a single type that carries its own length, supports range-based for, can be bounds-checked (in debug builds), and is constructed from any contiguous container without copying. Zero runtime overhead over raw pointer arithmetic.",
    "easy",
    ["std-span", "cpp"]
  ),

  // ── Module q-2: IEEE 754 Numerics ─────────────────────────────────────────
  q(
    "q-2-q1",
    "q-2",
    "multiple-choice",
    "Why does `(a + b) + c` sometimes produce a different result than `a + (b + c)` when `a`, `b`, `c` are `double`?",
    [
      "It is a compiler bug; IEEE 754 mandates that floating-point addition is associative",
      "Each individual addition rounds the exact mathematical result to the nearest representable double; the order of rounding changes the accumulated error, so different groupings of the same addends produce different final bits",
      "The CPU uses different arithmetic units for different evaluation orders",
      "Associativity fails only when values differ by more than 10^6",
    ],
    1,
    "IEEE 754 defines each operation as: compute the exact mathematical result, then round to the nearest representable value. Rounding accumulates differently in different orders. This is why `(1e16 + -1e16) + 1.0 = 1.0` but `1e16 + (-1e16 + 1.0) = 0.0` — the `+1` is smaller than one ULP at 1e16 and vanishes when added first.",
    "medium",
    ["ieee-754", "floating-point-associativity"]
  ),
  q(
    "q-2-q2",
    "q-2",
    "multiple-choice",
    "A risk system and a matching engine sum the same 5,000 fills and disagree by one cent. Both run identical source formulas. What is the single most likely cause?",
    [
      "A logic bug — one system is applying a different formula",
      "The two systems sum the fills in a different order (or one binary was built with `-ffast-math`), so per-addition IEEE 754 rounding accumulates differently; the cent disappears when both sum in the same canonical order on a binary without `-ffast-math`, or when prices are stored as integer ticks where addition is exact",
      "Floating-point hardware is non-deterministic; one-cent differences are expected and should be tolerated",
      "One CPU has a different IEEE 754 implementation; only identical hardware models produce identical results",
    ],
    1,
    "IEEE 754 guarantees each individual addition is correctly rounded — but not that two different orderings of the same addends agree. The cent break appears when sum order differs or when one binary allows re-association via `-ffast-math`. The fix/diagnosis: canonical sum order without `-ffast-math`, or integer tick representation where addition is exact and associative.",
    "easy",
    ["ieee-754", "deterministic-pricing"]
  ),
  q(
    "q-2-q3",
    "q-2",
    "multiple-choice",
    "What do FTZ (Flush-To-Zero) and DAZ (Denormals-Are-Zero) CPU mode bits do, and what do they trade away?",
    [
      "They accelerate all floating-point operations by using 32-bit instead of 64-bit precision",
      "FTZ forces subnormal RESULTS to zero; DAZ treats subnormal INPUTS as zero — both eliminate the 10-100x latency cliff subnormal operands cause on x86 at the cost of leaving strict IEEE 754 conformance (gradual underflow is no longer guaranteed, and a host with these flags on can disagree numerically with one that has them off)",
      "They disable denormal support to reduce power consumption, with no impact on numerical results",
      "They are compiler flags, not CPU mode bits, and affect only debug builds",
    ],
    1,
    "On x86, arithmetic producing or consuming subnormal (denormal) values triggers a microcode-assisted slow path that can be tens to hundreds of times slower — appearing as random latency spikes in a hot loop. FTZ/DAZ buy bounded latency by forcing these values to zero, trading away the IEEE 754 gradual-underflow guarantee and introducing a new source of cross-machine divergence.",
    "medium",
    ["ieee-754", "denormal", "flush-to-zero"]
  ),
  q(
    "q-2-q4",
    "q-2",
    "multiple-choice",
    "Why do HFT systems store prices as integer ticks (e.g., `int64_t` hundredths of a cent) instead of `double`?",
    [
      "Integer arithmetic is slower but more precise, which is worth the latency tradeoff",
      "Exchange prices live on a discrete tick grid; integer ticks represent every valid price exactly — addition is associative, results are bit-identical on any machine and any compiler flag, and reconciliation breaks are impossible. `double` cannot exactly represent many tick-aligned prices because decimal fractions like 0.01 are repeating fractions in binary",
      "Integer ticks allow prices to be stored in 32 bits, saving memory",
      "This is an older practice that modern C++ `double` has made obsolete",
    ],
    1,
    "Tick-aligned prices are multiples of an integer tick size. Storing them as `int64_t` makes them exactly representable, addition associative, and results bit-identical across machines, compilers, and flags. The one-cent reconciliation break problem disappears structurally. `double` is reserved for inherently real-valued math (volatility, square roots) where exact representation is not achievable anyway.",
    "easy",
    ["fixed-point", "ticks", "deterministic-pricing"]
  ),

  // ── Module q-3: Cache-Aware Programming ──────────────────────────────────
  q(
    "q-3-q1",
    "q-3",
    "multiple-choice",
    "What is the x86-64 cache line size, and why does it matter for memory layout decisions?",
    [
      "8 bytes — the size of a pointer on a 64-bit system",
      "64 bytes — the CPU moves this entire unit when reading or writing any byte within it, so objects that share a line are loaded or evicted together; layout decisions that minimize the number of lines touched on a hot path directly reduce memory latency",
      "4096 bytes — the operating system virtual memory page size",
      "The cache line size varies per-CPU and cannot be relied on in code",
    ],
    1,
    "The cache line is 64 bytes on every mainstream x86-64 processor. All cache operations (load, store, eviction, coherence traffic) are at line granularity — never individual bytes. A hot path that reads 8 bytes but lives in the middle of a 64-byte line loaded from DRAM still pays the full DRAM latency for that line.",
    "easy",
    ["cache-line", "cache-hierarchy"]
  ),
  q(
    "q-3-q2",
    "q-3",
    "multiple-choice",
    "A hot loop scans 1,000,000 `Order` structs (32 bytes each: id, timestamp, price, quantity, flags) reading ONLY the `price` field. A colleague proposes converting to structure-of-arrays (SoA). Analyze the cache effect.",
    [
      "No effect — the same total bytes are read either way",
      "SoA is strictly worse because it scatters fields across five separate arrays",
      "AoS loads a full 32-byte Order per element, so one 64B line holds 2 prices and 3/4 of every line is unused fields; SoA packs 8 int64 prices per line and brings in zero unused bytes — roughly 4x fewer lines touched and a clean sequential stride for the hardware prefetcher",
      "AoS is better when any fields other than price might also be read in the future",
    ],
    2,
    "The access pattern is the decision: this loop reads MANY records but ONE field. AoS pays for the full record (32B) to get 8B of price — 75% cache waste. SoA packs prices densely (8 per 64B line) and feeds the hardware prefetcher a predictable stride. The principle: SoA wins for scan-one-field; AoS wins for read-whole-record.",
    "medium",
    ["aos", "soa", "cache-line", "spatial-locality"]
  ),
  q(
    "q-3-q3",
    "q-3",
    "multiple-choice",
    "Two threads each increment their own `std::atomic<uint64_t>` counter, but throughput is 6x worse than single-threaded with no lock. `struct S { std::atomic<uint64_t> a; std::atomic<uint64_t> b; };`. What is the root cause and fix?",
    [
      "The atomics need `std::memory_order_seq_cst` instead of relaxed",
      "False sharing: `a` and `b` are 8 bytes each (16 bytes total), fitting on a single 64-byte cache line. Each core's write to its own counter invalidates the other core's cached copy of the SAME LINE via the MESI coherence protocol — causing the line to ping-pong between cores. Fix: pad each counter to its own line with `alignas(std::hardware_destructive_interference_size)`",
      "A data race — the atomics should be protected by a mutex",
      "64-bit atomics are not lock-free on x86-64 and require internal kernel locks",
    ],
    1,
    "This is the canonical false-sharing bug. The two atomics are logically independent but physically share a 64-byte cache line. MESI coherence works at line granularity: thread 1's write to `a` puts the line in Modified state on core 1, invalidating core 2's copy of the SAME line — even though core 2 only needs `b`. The line ping-pongs. Fix: `alignas(std::hardware_destructive_interference_size)` plus padding to a full line.",
    "medium",
    ["false-sharing", "cache-line-padding"]
  ),
  q(
    "q-3-q4",
    "q-3",
    "multiple-choice",
    "When is `__builtin_prefetch` useful, and when does it hurt?",
    [
      "Prefetch is useful for all memory access patterns and should be used everywhere",
      "Prefetch helps when the next address is hardware-unpredictable (pointer chasing, computed index) and issued far enough ahead to overlap the load latency with useful computation; it hurts (or is wasted) on sequential forward scans the hardware prefetcher already handles automatically — redundant instructions compete for issue slots and can pollute the cache",
      "Prefetch only works on stack-allocated memory; heap memory uses a different mechanism",
      "Prefetch improves results because it reorders memory operations, changing the sum",
    ],
    1,
    "The hardware stride prefetcher handles predictable sequential access automatically. Manual prefetch earns its cost only when: (1) the next address is unpredictable to the hardware, (2) the prefetch is issued far enough ahead to hide load latency, and (3) there is useful overlapping work. A prefetch on a sequential scan is a no-op or slight negative.",
    "hard",
    ["prefetch", "cache-miss"]
  ),

  // ── Module q-4: Lock-Free Data Structures ─────────────────────────────────
  q(
    "q-4-q1",
    "q-4",
    "multiple-choice",
    "Why is a non-atomic read of a variable concurrent with a non-atomic write to that variable undefined behavior in C++ — not merely a 'stale read'?",
    [
      "The CPU can only perform one memory operation per cycle; a concurrent read and write create a queue overflow",
      "A data race is undefined behavior under the C++ standard, meaning the compiler is allowed to assume it cannot happen and generate code that produces any result — including values that were never written, reordered operations, or omitted stores the compiler deemed 'unnecessary'",
      "Non-atomic reads always return 0 when a concurrent write is in progress",
      "It is a stale read; 'undefined behavior' is C++ hyperbole for implementation-defined",
    ],
    1,
    "The C++ memory model defines a data race (non-atomic concurrent read + write to the same object) as undefined behavior — not 'might return stale value.' The compiler is permitted to optimize under the assumption that the race cannot happen; code that 'works' today may break under a new optimizer, different flags, or different hardware.",
    "medium",
    ["data-race", "atomic", "memory-model"]
  ),
  q(
    "q-4-q2",
    "q-4",
    "multiple-choice",
    "In the SPSC ring buffer, the producer stores the tail index with `std::memory_order_release`. The consumer loads it with `std::memory_order_acquire`. Why is this pairing essential?",
    [
      "Release and acquire together make the index update atomic",
      "The release store publishes everything the producer wrote BEFORE it (the payload in the buffer slot); when the consumer's acquire load observes the new tail value, the C++ memory model guarantees the consumer also sees the payload — establishing a happens-before edge from producer's buffer write to consumer's buffer read",
      "Release/acquire prevents the compiler from optimizing the index updates",
      "It is a convention only; relaxed orderings would work on all platforms",
    ],
    1,
    "The release/acquire pair is the MECHANISM that makes the SPSC queue correct. Without it there is no happens-before between the payload write and payload read across threads — a weakly-ordered CPU (ARM, POWER) is allowed to deliver the new tail value to the consumer before delivering the buffer payload that the producer wrote. 'Program order in source' is meaningless across thread boundaries without explicit ordering.",
    "hard",
    ["memory-order-release", "memory-order-acquire", "happens-before", "spsc-ring-buffer"]
  ),
  q(
    "q-4-q3",
    "q-4",
    "multiple-choice",
    "What is the ABA problem in a lock-free stack using `compare_exchange`?",
    [
      "It is when `compare_exchange_weak` spuriously fails three times in a row",
      "Thread 1 reads head pointer `A`, stalls. Thread 2 pops `A`, pops another node, frees `A`, pushes a new node that the allocator places at address `A`. Thread 1 wakes and its CAS succeeds (head still == `A`) — but `A` now points to a different node than Thread 1 observed. The compare matched the VALUE but the STRUCTURE underneath changed",
      "ABA is when two threads simultaneously succeed in compare_exchange on different nodes",
      "ABA is a formal verification term; it does not affect runtime correctness",
    ],
    1,
    "CAS compares values, not histories. An address can be freed and reallocated to the same location — recycled pointers are the classic case. The ABA problem: the value matches but the semantics it represented are gone. Fixes: version-tagged pointers (pack a monotonic counter with the pointer so the tag differs even when the address recycles), or deferred reclamation (hazard pointers / epoch-based) so no pointer is recycled while another thread holds a reference to it.",
    "medium",
    ["aba-problem", "compare-exchange", "lock-free"]
  ),
  q(
    "q-4-q4",
    "q-4",
    "multiple-choice",
    "An SPSC ring buffer's `push()` runs a fixed sequence of operations with no retry loop. A multi-producer CAS-loop stack's `push()` may retry an unbounded number of times. Which is preferred on an HFT hot path and why?",
    [
      "The CAS-loop stack — higher average throughput means better performance",
      "The SPSC ring buffer — it is wait-free (each push completes in a bounded number of steps regardless of other threads), giving bounded tail latency; the CAS-loop is only lock-free (system makes progress, but one thread may retry unboundedly), so its tail latency is unbounded; HFT hot paths care about worst-case tail latency, not average throughput",
      "Both are equivalent for latency; only throughput differs between them",
      "The CAS-loop stack is preferred because it supports multiple producers",
    ],
    0,
    "Wait-free: EVERY thread completes its operation in a bounded number of its own steps. Lock-free: at least ONE thread in the SYSTEM makes progress, but an individual thread can be starved. A CAS-loop is lock-free, not wait-free — an individual producer can lose the race an unbounded number of times. For an HFT system where a single delayed tick costs a fill, bounded tail latency (wait-free) is the right guarantee even if average throughput is slightly lower.",
    "hard",
    ["wait-free", "lock-free", "spsc-ring-buffer"]
  ),

  // ── Module q-5: Kernel-Bypass Networking ──────────────────────────────────
  q(
    "q-5-q1",
    "q-5",
    "multiple-choice",
    "What are the four main sources of latency the Linux kernel network stack adds between a packet landing on the NIC and your application receiving it?",
    [
      "Encryption, compression, routing, and authentication",
      "Hardware interrupt (context switch), kernel-to-user memory copy, protocol stack processing (Ethernet/IP/TCP), and the system-call overhead of `recv()`",
      "TCP retransmission, DNS lookup, TCP slow start, and kernel scheduling jitter",
      "NIC driver initialization, interrupt coalescing delay, socket buffer allocation, and epoll latency",
    ],
    1,
    "The four kernel path costs: (1) hardware interrupt tears the CPU away from its current work; (2) the kernel copies the packet from kernel memory to user-space on `recv()`; (3) the kernel walks the protocol stack (Ethernet → IP → TCP/UDP) managing checksums and connection state; (4) each `recv()` is a system call crossing the user/kernel privilege boundary, which modern Spectre/Meltdown mitigations made more expensive.",
    "medium",
    ["kernel-bypass", "system-call", "context-switch"]
  ),
  q(
    "q-5-q2",
    "q-5",
    "multiple-choice",
    "How does a DPDK poll-mode driver receive packets, and what is the cost of this approach?",
    [
      "DPDK uses the same interrupt-driven model as the kernel but processes packets in user space",
      "A DPDK PMD spins on a NIC descriptor ring in user space without interrupts or system calls — when a descriptor is ready it reads the packet directly from DMA-mapped memory; the cost is that the polling thread runs at 100% CPU utilization on a dedicated core even when there is no traffic",
      "DPDK uses io_uring to batch recv() system calls, reducing kernel crossing overhead",
      "DPDK achieves kernel bypass through a custom Linux kernel module that intercepts all network packets",
    ],
    1,
    "A poll-mode driver (PMD) busy-polls the NIC's receive descriptor ring continuously. When the NIC DMAes a packet, the PMD detects it in the descriptor ring immediately — no interrupt, no copy, no kernel involvement. The trade: one CPU core at 100% utilization permanently, regardless of traffic. On an HFT system this trade is almost always accepted because one idle core is cheap compared to microseconds of interrupt latency.",
    "medium",
    ["poll-mode-driver", "busy-polling", "dpdk"]
  ),
  q(
    "q-5-q3",
    "q-5",
    "multiple-choice",
    "When is io_uring a better choice than full DPDK kernel bypass for a trading application?",
    [
      "io_uring is never appropriate for trading applications — DPDK is always better",
      "io_uring is preferable when latency requirements are microseconds rather than sub-100-nanoseconds, the application needs to run on commodity hardware without a dedicated DPDK-compatible NIC or a dedicated polling core, and the application benefits from integrating with the kernel's socket model (existing code, TLS, etc.)",
      "io_uring is better than DPDK for market data but not for order entry",
      "io_uring is the kernel-bypass solution and DPDK is the in-kernel solution",
    ],
    1,
    "DPDK is the extreme end: microsecond or sub-microsecond latency at the cost of a dedicated core, specialized NICs, and no kernel networking features. io_uring is a middle ground: it batches I/O into a ring without a system call PER operation (reducing syscall overhead significantly), but the kernel is still involved. The right tool depends on the latency budget and infrastructure constraints.",
    "hard",
    ["kernel-bypass", "io-uring", "tail-latency"]
  ),
  q(
    "q-5-q4",
    "q-5",
    "multiple-choice",
    "Why do DPDK and similar kernel-bypass frameworks require hugepages (2MB or 1GB pages instead of 4KB) for packet buffer memory?",
    [
      "The kernel forbids user-space drivers from using standard 4KB pages",
      "Large packet buffers allocated in 4KB pages produce many TLB entries; TLB misses on every packet buffer access add latency. Hugepages reduce the TLB footprint dramatically — a 2MB hugepage covers the same memory as 512 4KB pages in a single TLB entry — keeping the packet receive path TLB-resident under high packet rates",
      "Hugepages are required because NIC DMA engines can only address 2MB-aligned regions",
      "Hugepages provide faster memory access in hardware because the memory controller optimizes for 2MB boundaries",
    ],
    1,
    "The Translation Lookaside Buffer (TLB) is a hardware cache for virtual-to-physical address translations. At high packet rates, touching many 4KB packet buffers fills and evicts TLB entries constantly. Hugepages pack the same total memory into far fewer TLB entries, keeping the packet processing path TLB-resident and avoiding the ~100-cycle penalty of a TLB miss that goes to the page table.",
    "hard",
    ["hugepages", "dpdk", "kernel-bypass"]
  ),

  // ── Module q-6: Market Data — ITCH and OUCH ──────────────────────────────
  q(
    "q-6-q1",
    "q-6",
    "multiple-choice",
    "Why does Nasdaq ITCH encode prices as 4-byte unsigned integers with 4 implied decimal places instead of floating-point numbers?",
    [
      "Floating-point encoding would require more than 4 bytes, wasting bandwidth",
      "Integer encoding is exact — every valid exchange price on the tick grid is represented perfectly with no rounding; floating-point would introduce the representability and associativity problems of binary64, making decoders on different machines or compiled with different flags produce different prices",
      "ITCH was designed in the 1980s before IEEE 754 floating-point hardware was available",
      "Integers enable compression via FAST encoding which is not possible with floating-point",
    ],
    1,
    "Exchange prices live on a discrete tick grid. An integer count of the smallest increment (e.g., 4 implied decimal places means 10,000 ticks per dollar) represents every valid price exactly. Floating-point cannot exactly represent many tick-aligned prices (0.1 is a repeating fraction in binary), and floating-point comparison for equality is unreliable. Binary protocols eliminate ambiguity at the wire layer.",
    "medium",
    ["itch", "fixed-width-binary", "implied-decimal"]
  ),
  q(
    "q-6-q2",
    "q-6",
    "multiple-choice",
    "An ITCH parser reads a 4-byte price field directly into an `int32_t` variable on an x86-64 (little-endian) machine. The price displays as garbage. What is most likely wrong?",
    [
      "The variable should be `int64_t` — ITCH prices require 64-bit integers",
      "ITCH fields are big-endian (most-significant byte first, the network convention); x86-64 is little-endian; reading bytes directly without byte-swapping reverses the byte order, producing a garbage value. The fix is to call `ntohl()` or `__builtin_bswap32()` after the read",
      "The field offset is wrong — price is at a different byte position in the struct",
      "The compiler inserted padding before the price field because the struct is unaligned",
    ],
    1,
    "ITCH uses big-endian byte order (network byte order). x86-64 uses little-endian. A 4-byte big-endian value read directly into an x86-64 `int32_t` has its bytes in reversed order — the MSB becomes the LSB and vice versa. Every multi-byte ITCH field must be byte-swapped after reading. The standard fix: mark the struct with `__attribute__((packed))` and call byte-swap helpers on each multi-byte field.",
    "medium",
    ["itch", "big-endian", "byte-swap"]
  ),
  q(
    "q-6-q3",
    "q-6",
    "multiple-choice",
    "What does the SoupBinTCP sequence number enable, and what must a client do when it detects a gap?",
    [
      "The sequence number identifies the message type so the parser knows which struct to use",
      "SoupBinTCP attaches a monotonically increasing sequence number to every message; if a client's received sequence jumps from N to N+2, it knows message N+1 was dropped; the client must request a replay (via the SOUP retransmit request) or re-subscribe to the feed to recover the missing data before processing subsequent messages",
      "The sequence number enables the exchange to authenticate the client's identity",
      "The sequence number is padding with no protocol significance in ITCH 5.0",
    ],
    1,
    "SoupBinTCP sequence numbers are how clients detect packet loss. Exchanges publish UDP multicast (ITCH) plus a TCP retransmit channel. A gap in received sequence numbers triggers a retransmit request to the TCP channel to recover missed messages. Processing subsequent ITCH messages without the missed ones would result in a corrupt book with missing orders.",
    "medium",
    ["soupbintcp", "sequence-number", "itch"]
  ),
  q(
    "q-6-q4",
    "q-6",
    "multiple-choice",
    "What is the functional difference between the Nasdaq ITCH protocol and the Nasdaq OUCH protocol?",
    [
      "ITCH is for equities; OUCH is for options",
      "ITCH is a broadcast market-data feed (exchange → you, read-only): it delivers every add/execute/cancel/trade event for all symbols. OUCH is a private order-entry session (you → exchange): it is how your firm sends, modifies, and cancels individual orders",
      "ITCH is TCP-based; OUCH is UDP-based",
      "They are both order-entry protocols; the difference is only which firm initiates the connection",
    ],
    1,
    "ITCH is read-only market data — one exchange, many subscribers, every event for all symbols. OUCH is a private bilateral session between one participant and the exchange for order entry. Same binary philosophy (fixed-width, big-endian), completely different direction and semantics.",
    "easy",
    ["itch", "ouch", "market-data-feed", "order-entry"]
  ),

  // ── Module q-7: FIX Protocol ──────────────────────────────────────────────
  q(
    "q-7-q1",
    "q-7",
    "multiple-choice",
    "What is the basic structure of a FIX message field?",
    [
      'A JSON key-value pair: `{"tag": 35, "value": "D"}`',
      "A tag number, an equals sign, a value, and an ASCII SOH (0x01) delimiter: `35=D<SOH>`",
      "A TLV (type-length-value) binary triplet",
      'An XML element: `<field tag="35">D</field>`',
    ],
    1,
    "FIX uses a tag=value encoding where each field is a numeric tag identifier, an `=`, the value as ASCII text, and an ASCII SOH (0x01) byte as a separator. This self-describing format allows any receiver to parse any FIX message by reading tag numbers, even without prior knowledge of the message structure.",
    "easy",
    ["fix-protocol", "tag-value-encoding", "soh-delimiter"]
  ),
  q(
    "q-7-q2",
    "q-7",
    "multiple-choice",
    "How is the FIX CheckSum (tag 10) calculated?",
    [
      "MD5 hash of the message body, truncated to 3 decimal digits",
      "Sum of all byte values in the message (excluding the `10=xxx<SOH>` field itself) modulo 256, formatted as a 3-digit zero-padded decimal string",
      "CRC32 of the message body, formatted as a 3-digit hexadecimal string",
      "XOR of all tag numbers in the message modulo 256",
    ],
    1,
    "FIX CheckSum is deliberately simple: add up the ASCII values of every byte from the beginning of the message through the `9=<BodyLength>` tag (including all delimiters), take modulo 256, and format as a 3-digit zero-padded decimal. This simplicity enables fast verification at the session layer. A wrong checksum causes the receiver to send a `35=5` (Logout) or `35=2` (Resend Request).",
    "medium",
    ["fix-protocol", "checksum"]
  ),
  q(
    "q-7-q3",
    "q-7",
    "multiple-choice",
    "What is the `MsgType` (tag 35) field, and what value identifies a NewOrderSingle?",
    [
      "Tag 35 identifies the FIX session version; `D` means FIX 4.4",
      "Tag 35 identifies the application message type; `35=D` is the NewOrderSingle message — the standard FIX message for placing a new order",
      "Tag 35 is the sequence number of the message within the session",
      "Tag 35 carries the ClOrdID that uniquely identifies this order",
    ],
    1,
    "`MsgType` (tag 35) is the single most important field in any FIX message — it tells the receiver what the message IS. `35=D` = NewOrderSingle (place an order). `35=8` = ExecutionReport (order acknowledgment/fill). `35=F` = OrderCancelRequest. Reading a FIX log starts with finding tag 35 on each line.",
    "easy",
    ["fix-protocol", "msg-type", "new-order-single"]
  ),
  q(
    "q-7-q4",
    "q-7",
    "multiple-choice",
    "What does FIXP offer over classic FIX-over-TCP, and in what context would you choose it?",
    [
      "FIXP adds SSL/TLS encryption that classic FIX lacks",
      "FIXP is a modern binary transport for FIX that eliminates the tag=value ASCII encoding and per-message TCP framing overhead, reducing serialization/deserialization latency; you choose it when connecting to a venue that offers it and your latency budget is tighter than classic FIX allows but you need broader venue compatibility than ITCH/OUCH provides",
      "FIXP replaces the checksum with a CRC32 for better error detection",
      "FIXP is a regulatory requirement for all order entry sessions in the US since 2022",
    ],
    1,
    "Classic FIX's ASCII tag=value encoding is verbose — parsing text fields, scanning for SOH delimiters, and converting ASCII numbers all cost time. FIXP (FIX Performance) uses a binary encoding that can be mapped to memory structs directly, similar to ITCH, while retaining the FIX application-layer semantics (same message types and tags). Use it when a venue offers it and sub-millisecond order entry matters.",
    "hard",
    ["fix-protocol", "fixp", "fast-encoding"]
  ),

  // ── Module q-8: Capstone — Order Book ─────────────────────────────────────
  q(
    "q-8-q1",
    "q-8",
    "multiple-choice",
    "In the order book capstone, why are prices stored as integer ticks rather than `double` in the book's internal data structures?",
    [
      "Integer comparison is faster than floating-point comparison on x86-64",
      "Integer ticks guarantee every valid exchange price is exactly representable; arithmetic on tick prices is exact and associative; best-bid/best-ask comparison requires equality and ordering that floating-point cannot provide reliably for tick-aligned values",
      "The ITCH wire format delivers prices as integers and converting to double would waste CPU time",
      "Integer prices allow the book to use bit manipulation for price-level indexing",
    ],
    1,
    "The order book does equality comparisons (`price == best_bid`), accumulates quantities at price levels, and emits mid-price calculations. These operations on floating-point values introduce rounding that makes equality checks unreliable and results non-reproducible. Integer ticks make all these operations exact, consistent with lesson Q2.",
    "medium",
    ["limit-order-book", "integer-price", "ticks"]
  ),
  q(
    "q-8-q2",
    "q-8",
    "multiple-choice",
    "The capstone emits book-update events to a downstream strategy thread via the SPSC ring from Q4. Why not use a `std::mutex`-protected queue instead?",
    [
      "A mutex cannot protect `std::queue<BookUpdate>` — only lock-free structures can",
      "A mutex-protected queue allows the OS to deschedule the market-data thread when it blocks on the lock, adding microseconds of latency; the SPSC ring is wait-free — each push completes in a bounded number of steps with no kernel involvement, giving bounded tail latency compatible with a microsecond latency budget",
      "A mutex introduces memory ordering overhead that the SPSC ring avoids",
      "The SPSC ring has higher throughput than a mutex queue for any number of producers and consumers",
    ],
    1,
    "A thread blocked on a contended mutex can be descheduled by the kernel for microseconds — an eternity for a market-data path. The SPSC ring (Q4) is wait-free: push() and pop() always complete in a fixed bounded number of steps. No kernel, no blocking, no descheduling. This is exactly the topology (one producer: market-data thread; one consumer: strategy thread) SPSC is designed for.",
    "medium",
    ["limit-order-book", "spsc-ring-buffer", "hot-path"]
  ),
  q(
    "q-8-q3",
    "q-8",
    "multiple-choice",
    "The capstone profiles per-message latency using `rdtsc`. What does `rdtsc` measure and why is it preferred over `clock_gettime(CLOCK_MONOTONIC)` on the hot path?",
    [
      "`rdtsc` reads the CPU's programmable interval timer; `clock_gettime` reads the system clock",
      "`rdtsc` reads the hardware Time Stamp Counter — a 64-bit cycle count register readable in ~5-10 CPU cycles with no system call; `clock_gettime` is a syscall (or vDSO call) with more overhead, making `rdtsc` preferable for sub-microsecond measurement on the hot path",
      "`rdtsc` measures wall-clock time; `clock_gettime` measures CPU time",
      "`rdtsc` is only available on x86; `clock_gettime` is portable across architectures",
    ],
    1,
    "`rdtsc` is a single x86 instruction that reads the TSC — a cycle counter that increments with each CPU clock. Reading it takes roughly 5-10 cycles with no kernel involvement. `clock_gettime` with CLOCK_MONOTONIC may invoke the vDSO (fast path, ~20 cycles) but has more overhead. On a 3 GHz CPU, 10 cycles is ~3 ns — important when measuring events that complete in tens of nanoseconds.",
    "hard",
    ["rdtsc", "latency-percentile", "hot-path"]
  ),

  // ── Module 12-9: Quant Finance Mathematics ────────────────────────────────
  q(
    "12-9-q1",
    "12-9",
    "multiple-choice",
    "Why are stock prices modeled with a log-normal distribution rather than a normal distribution?",
    [
      "Log-normal distributions are easier to compute than normal distributions",
      "Prices cannot go below zero — a log-normal distribution respects this constraint (since the logarithm can be negative but the price, which is exp(log-normal), is always positive); a normal distribution allows negative values, which is physically impossible for a price",
      "Daily stock returns follow a log-normal distribution by empirical observation",
      "The log-normal distribution accounts for dividends that the normal distribution cannot model",
    ],
    1,
    "A key property of prices: they cannot be negative. If returns are normally distributed, then log(price) is normally distributed, which means price itself follows a log-normal distribution — always positive. The normal distribution for prices would allow P < 0, which is nonsensical. Additionally, multiplicative changes (percentage returns) compose naturally in log space.",
    "easy",
    ["probability-distribution", "log-normal-distribution"]
  ),
  q(
    "12-9-q2",
    "12-9",
    "multiple-choice",
    "What does a p-value of 0.03 mean when evaluating a trading signal's backtest?",
    [
      "The strategy has a 3% chance of making money in the future",
      "If the null hypothesis (the signal has no edge) were true, there is only a 3% probability of observing results at least as extreme as those seen in the backtest by chance — the signal passes at a 5% significance threshold but requires further validation (out-of-sample test) before being deployed",
      "The strategy beats the benchmark 97% of the time",
      "The strategy has 3% annual alpha over the risk-free rate",
    ],
    1,
    "A p-value is the probability of observing results at least as extreme as your data UNDER THE NULL HYPOTHESIS (no edge). p = 0.03 means 3% — if the signal were noise, you'd see these results only 3% of the time. This passes a 5% threshold but is NOT a guarantee of future performance; it is weak evidence that deserves out-of-sample validation.",
    "medium",
    ["hypothesis-testing", "p-value"]
  ),
  q(
    "12-9-q3",
    "12-9",
    "multiple-choice",
    "What does the Sharpe ratio measure, and what value is generally considered 'good'?",
    [
      "The maximum drawdown relative to the average return; a Sharpe above 0 is good",
      "The ratio of a strategy's annualized excess return (above the risk-free rate) to its annualized volatility (standard deviation of returns); a Sharpe above 1.0 is generally considered acceptable, above 2.0 is good, and above 3.0 is exceptional for live trading strategies",
      "The probability of a positive return on any given day",
      "The ratio of profitable to losing trades",
    ],
    1,
    "Sharpe = (annualized return - risk-free rate) / annualized standard deviation. It measures return per unit of risk. A Sharpe of 1.0 means you earn one unit of excess return per unit of volatility — reasonable but not impressive. Elite systematic strategies often target Sharpe > 2. A Sharpe below 0.5 raises serious doubts about whether the edge justifies the risk.",
    "medium",
    ["sharpe-ratio"]
  ),
  q(
    "12-9-q4",
    "12-9",
    "multiple-choice",
    "In the context of Geometric Brownian Motion (GBM), what do the 'drift' and 'diffusion' terms represent?",
    [
      "Drift is the mean return and diffusion is the risk-free rate",
      "Drift (μ) is the deterministic expected return per unit time (the trend); diffusion (σ) is the volatility — the standard deviation of the random shock per unit time. GBM: dS = μS dt + σS dW, where dW is a Wiener process increment",
      "Drift is the systematic risk and diffusion is the idiosyncratic risk",
      "Drift and diffusion are both components of volatility — they just describe different timescales",
    ],
    1,
    "In GBM: `dS = μS dt + σS dW`. The `μS dt` term is the drift — deterministic expected growth proportional to the current price. The `σS dW` term is the diffusion — a random shock with standard deviation proportional to σ and the price. This is why log-returns are normally distributed: the stochastic part is additive in log space.",
    "medium",
    ["geometric-brownian-motion", "drift", "diffusion", "sde"]
  ),
  q(
    "12-9-q5",
    "12-9",
    "multiple-choice",
    "What does 'delta' (Δ) measure in the context of options pricing, and why does a delta-neutral hedger continuously adjust their hedge?",
    [
      "Delta measures the option's sensitivity to volatility changes; hedging eliminates volatility exposure",
      "Delta (Δ = ∂C/∂S) measures how much the option's price changes for a $1 move in the underlying stock price; a delta-neutral hedger continuously rebalances because delta itself changes as the stock price moves (gamma effect) — a portfolio that was delta-neutral at S=$100 is no longer neutral at S=$102",
      "Delta is the time decay of an option; hedging eliminates time-value erosion",
      "Delta is the probability that the option expires in the money",
    ],
    1,
    "Delta is the first derivative of option price with respect to underlying price. Delta = 0.5 means a $1 stock move produces a $0.50 option price change. But delta is not constant — it changes with the stock price (that's gamma). A delta-hedged portfolio has zero directional exposure INSTANTANEOUSLY, but as the stock moves, delta drifts and must be rebalanced. This is dynamic hedging.",
    "medium",
    ["delta", "dynamic-hedging", "black-scholes"]
  ),
  q(
    "12-9-q6",
    "12-9",
    "multiple-choice",
    "In statistical arbitrage pairs trading, what does 'cointegration' mean for two price series, and how is it different from correlation?",
    [
      "Cointegration and correlation are the same concept — a correlation above 0.9 implies cointegration",
      "Correlation measures the degree to which two prices move together in direction; cointegration means there exists a linear combination of the two series that is stationary (mean-reverting) even though each series individually is non-stationary (random walk). Two cointegrated stocks can temporarily diverge but their SPREAD reverts to a stable mean — which is the tradeable signal",
      "Cointegration means the two assets always have the same price",
      "Cointegration measures the historical tendency of one stock to lead the other in time",
    ],
    1,
    "Correlation measures directional co-movement but is not sufficient for pairs trading — two stocks can be highly correlated yet their spread drifts without bound. Cointegration is stronger: it guarantees the spread is stationary (mean-reverting). The Engle-Granger test uses an ADF test on the spread residuals to test for stationarity. A significant result supports the mean-reversion assumption underlying the strategy.",
    "hard",
    ["cointegration", "pairs-trading", "statistical-arbitrage"]
  ),
  q(
    "12-9-q7",
    "12-9",
    "multiple-choice",
    "Why do regulators and risk committees prefer Expected Shortfall (ES) over Value-at-Risk (VaR) as a risk measure?",
    [
      "ES is easier to compute than VaR for large portfolios",
      "VaR only reports the threshold loss at a given confidence level (e.g., 'we lose no more than $X on 99% of days') without saying anything about HOW MUCH we lose on the worst 1% of days; ES (also called CVaR) answers that question: it is the average loss given that we ARE in the worst 1%, capturing the severity of tail events — critical for fat-tailed financial distributions",
      "ES satisfies the requirements of the Basel III regulatory framework; VaR satisfies Basel II",
      "ES can be computed without historical return data; VaR requires it",
    ],
    1,
    "VaR is a quantile — it tells you where the tail starts but not how bad the tail is. A strategy can satisfy VaR by clustering large losses just inside the VaR threshold. ES averages the losses BEYOND the VaR, capturing the actual severity of extreme events. Financial returns have fat tails (kurtosis > 3); the mass beyond VaR matters enormously for catastrophic risk, which is why regulators switched from VaR to ES in Basel III/FRTB.",
    "hard",
    ["value-at-risk", "expected-shortfall", "risk-management"]
  ),
];
