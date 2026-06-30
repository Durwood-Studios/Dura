import type { AssessmentQuestion } from "@/types/assessment";

/**
 * Phase 11 question bank — 50 questions across 10 modules.
 * Covers SystemVerilog basics, UVM architecture, constrained-random stimulus,
 * functional coverage, UVM sequences, SVA/formal verification, UPF low-power,
 * capstone UART TB, clock-domain crossing, and FPGA emulation.
 * Difficulty spread per module: mix of easy, medium, and hard.
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
    phaseId: "11",
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

export const PHASE_11_QUESTIONS: AssessmentQuestion[] = [
  // ── Module h-1: SystemVerilog Basics ─────────────────────────────────────
  q(
    "h-1-q1",
    "h-1",
    "multiple-choice",
    "Which SystemVerilog data type is 4-state (can hold 0, 1, X, and Z) and replaces both `wire` and `reg` for most use cases?",
    ["bit", "int", "logic", "byte"],
    2,
    "`logic` is the 4-state type that unifies `wire` and `reg`. `bit` is 2-state (0 and 1 only), making it faster in simulation but unable to represent X or Z propagation.",
    "easy",
    ["systemverilog", "data-types"]
  ),
  q(
    "h-1-q2",
    "h-1",
    "multiple-choice",
    "What is the primary purpose of a SystemVerilog `modport` inside an interface?",
    [
      "To declare the clock signals used by the interface",
      "To define directional views (input/output) of interface signals for each connecting module",
      "To instantiate sub-modules inside the interface",
      "To group interface signals into named buses for simulation reports",
    ],
    1,
    "A `modport` defines the signal directions from the perspective of a specific module (master vs slave). This enforces compile-time directional checks so a master cannot drive a slave-only signal and vice versa.",
    "medium",
    ["systemverilog", "interface", "modport"]
  ),
  q(
    "h-1-q3",
    "h-1",
    "true-false",
    "True or false: SystemVerilog classes can be synthesized into hardware by a standard synthesis tool.",
    ["True", "False"],
    1,
    "Classes are verification-only. They allocate on the heap and rely on garbage collection — operations that have no physical hardware analog. Silicon has fixed allocation determined at synthesis time. Classes compile fine in simulation but are unsynthesizable.",
    "easy",
    ["systemverilog", "class", "synthesizable-subset"]
  ),
  q(
    "h-1-q4",
    "h-1",
    "multiple-choice",
    "An engineer uses `fork/join_any` in a testbench to run three concurrent processes: drive_stimulus(), monitor_outputs(), and a watchdog timer that fires after 10,000 ns. What does `join_any` do?",
    [
      "Runs all three processes and waits for ALL to finish",
      "Runs all three processes and returns as soon as ANY one finishes",
      "Runs the three processes sequentially, one after another",
      "Runs only the first process that does not block",
    ],
    1,
    "`join_any` waits for the FIRST process in the fork to complete, then the parent continues. `join` waits for ALL. `join_none` spawns all and returns immediately. Using `join_any` is the common testbench pattern: wait for either the test to finish or the watchdog to fire, whichever comes first.",
    "medium",
    ["systemverilog", "fork-join"]
  ),
  q(
    "h-1-q5",
    "h-1",
    "multiple-choice",
    "Why would an engineer use a `mailbox` rather than a queue (`int q[$]`) to pass transactions between two concurrent processes?",
    [
      "Mailboxes are faster than queues in simulation",
      "A mailbox's `get()` call BLOCKS until an item is available, enabling a clean producer/consumer pattern where the consumer automatically waits without polling; a queue's `pop_front()` is non-blocking and would require explicit wait logic",
      "Queues cannot hold object types, only integers",
      "Mailboxes are synthesizable; queues are not",
    ],
    1,
    "A mailbox's blocking semantics (`get()` waits if empty; `put()` waits if bounded and full) make inter-process communication natural. A queue is synchronous and non-blocking — you must check size and wait manually. UVM's TLM ports are built on this mailbox concept.",
    "hard",
    ["systemverilog", "mailbox"]
  ),

  // ── Module h-2: UVM Testbench Architecture ───────────────────────────────
  q(
    "h-2-q1",
    "h-2",
    "multiple-choice",
    "In the canonical UVM component tree, which component is responsible for converting a high-level transaction object into actual pin wiggles on the interface?",
    ["uvm_monitor", "uvm_scoreboard", "uvm_driver", "uvm_sequencer"],
    2,
    "The `uvm_driver` takes transactions from the sequencer and translates them into interface signal activity. The monitor observes (passively). The scoreboard checks. The sequencer picks which transaction to send next.",
    "easy",
    ["uvm", "driver"]
  ),
  q(
    "h-2-q2",
    "h-2",
    "multiple-choice",
    "What is the UVM factory's primary benefit when running different test scenarios from a single testbench?",
    [
      "It reduces simulation memory by sharing class instances",
      "It allows a test class to substitute one component class for another at runtime without editing the testbench wiring",
      "It automatically generates constrained-random transactions",
      "It connects TLM ports between components automatically",
    ],
    1,
    "The factory's `set_type_override` lets a test swap `normal_driver` for `error_inject_driver` at runtime. The testbench builds normally but every instantiation of the base class silently becomes the override. This is how one testbench runs dozens of different test scenarios.",
    "medium",
    ["uvm", "factory"]
  ),
  q(
    "h-2-q3",
    "h-2",
    "multiple-choice",
    "In UVM's phase model, what is the ordering relationship between `build_phase` and `connect_phase`?",
    [
      "They run in parallel across all components simultaneously",
      "`connect_phase` runs on each component before its children's `build_phase`",
      "All components' `build_phase` completes across the entire hierarchy before any `connect_phase` begins",
      "The phases alternate: build, connect, build, connect per component",
    ],
    2,
    "UVM phases are implicit barrier-synchronized: ALL components complete `build_phase` before any component enters `connect_phase`. This ensures every component exists before any connections are attempted — preventing null-handle TLM connection errors.",
    "medium",
    ["uvm", "phases"]
  ),
  q(
    "h-2-q4",
    "h-2",
    "multiple-choice",
    "A UVM testbench compiles without errors but fails at simulation start with 'No virtual interface set for this driver'. Where is the idiomatic fix applied?",
    [
      "In the driver's constructor — hard-code the interface handle",
      "In the top-level testbench module — set the virtual interface in the config DB with `uvm_config_db#(virtual my_if)::set()` before calling `run_test()`",
      "In the monitor — it should pass the interface to the driver via a TLM port",
      "In the scoreboard — it owns all interface references in UVM",
    ],
    1,
    "The config DB pattern decouples drivers from specific interface instances. The top-level SV module sets the virtual interface in the config DB; each driver's `build_phase` retrieves it with `uvm_config_db#(virtual my_if)::get()`. Hard-coding breaks reuse; passing through monitors or scoreboards violates component roles.",
    "hard",
    ["uvm", "config-db", "virtual-interface"]
  ),
  q(
    "h-2-q5",
    "h-2",
    "multiple-choice",
    "What is the key difference in purpose between a `uvm_analysis_port` and a `uvm_seq_item_pull_port`?",
    [
      "`uvm_analysis_port` is for synchronous hand-off; `uvm_seq_item_pull_port` is for asynchronous broadcast",
      "`uvm_analysis_port` broadcasts to zero or more subscribers (monitor→scoreboard pattern); `uvm_seq_item_pull_port` is a request/response pull between driver and sequencer",
      "They are interchangeable; the naming is a UVM convention only",
      "`uvm_seq_item_pull_port` broadcasts; `uvm_analysis_port` is one-to-one",
    ],
    1,
    "Analysis ports broadcast: any number of subscribers receive every write. The seq_item port is a bilateral pull: the driver requests; the sequencer responds. Analysis is for observation (publish/subscribe); seq_item is for stimulus hand-off (request/grant). The direction distinction is the whole point.",
    "hard",
    ["uvm", "tlm-port"]
  ),

  // ── Module h-3: Constrained-Random Stimulus ──────────────────────────────
  q(
    "h-3-q1",
    "h-3",
    "multiple-choice",
    "What is the behavioral difference between a `rand` field and a `randc` field in a SystemVerilog class?",
    [
      "`rand` cycles through all values before repeating; `randc` picks independently each call",
      "`randc` cycles through all values in the domain before repeating; `rand` picks fresh each call and may repeat values",
      "`randc` is faster but produces fewer unique values",
      "They are identical; the distinction is removed in IEEE 1800-2023",
    ],
    1,
    "`randc` (cyclic random) guarantees every value in the domain is generated before any is repeated — like shuffling a deck. `rand` picks independently each call so values can repeat. Use `randc` when you need to guarantee coverage of all values; use `rand` for independence between draws.",
    "easy",
    ["constrained-random", "rand", "randc"]
  ),
  q(
    "h-3-q2",
    "h-3",
    "multiple-choice",
    "A constraint block has `constraint c1 { x > 100; }` and `constraint c2 { x < 50; }`. What happens when `randomize()` is called?",
    [
      "The solver picks x = 75, the midpoint",
      "The solver returns 0 (failure) because no value of x can satisfy both constraints simultaneously",
      "c1 and c2 are ORed, so any x > 100 or x < 50 is valid",
      "The last defined constraint wins; x < 50 is enforced",
    ],
    1,
    "When constraints are mutually exclusive (no value satisfies all simultaneously), the solver returns 0 and the object's fields are left unchanged. This is an over-constraint bug. Use `constraint_mode(0)` to disable constraints one at a time to find the conflict.",
    "medium",
    ["constrained-random", "solver"]
  ),
  q(
    "h-3-q3",
    "h-3",
    "multiple-choice",
    "An engineer adds `soft addr inside { [0 : 32'h0FFF] };` as a constraint on the `addr` field. A test calls `tx.randomize() with { addr inside { [32'h1_0000 : 32'h2_0000] }; }`. Which range wins?",
    [
      "The soft constraint wins — soft constraints always take priority",
      "The inline `randomize() with` constraint wins — it overrides the soft constraint for this call",
      "Neither — the constraints conflict and randomize() returns 0",
      "The intersection is used: addresses from 0 to 0FFF AND 1_0000 to 2_0000, which is empty",
    ],
    1,
    "`soft` constraints are lower-priority defaults. An inline `randomize() with` clause adds a hard constraint that overrides conflicting soft constraints. This is the intended use: soft = sensible default, overridable per-test without editing the class.",
    "medium",
    ["constrained-random", "soft-constraint"]
  ),
  q(
    "h-3-q4",
    "h-3",
    "multiple-choice",
    "A constrained-random testbench runs 50,000 transactions and achieves only 35% coverage closure. What is the most effective next step?",
    [
      "Run 500,000 transactions — more volume will close the holes",
      "Add `dist` directives to bias the solver toward the under-covered values, then write targeted sequences for any remaining structural holes",
      "Reduce the number of constraint blocks so the solver has more freedom",
      "Change `rand` to `randc` on every field",
    ],
    1,
    "Pure scale rarely closes structural holes. The fix is to analyze which bins are empty, add `dist` weights to bias the distribution toward them, and write directed-random sequences for corner cases. This is the 'coverage-driven verification' loop: constrain, randomize, measure, refine.",
    "hard",
    ["constrained-random", "coverage-closure"]
  ),

  // ── Module h-4: Functional Coverage ─────────────────────────────────────
  q(
    "h-4-q1",
    "h-4",
    "multiple-choice",
    "What does `cp_size : coverpoint size;` (with no explicit bins) produce in a SystemVerilog covergroup?",
    [
      "No bins — an explicit bin definition is required",
      "One bin for each unique value seen during simulation",
      "Automatic bins, one per value in the type's range (2^width total bins)",
      "A single bin covering the entire range of `size`",
    ],
    2,
    "Without explicit bins, SystemVerilog auto-bins a coverpoint — by default it creates one bin per unique value within the type's range. For a `bit [1:0] size`, that is 4 auto-bins (one for values 0, 1, 2, 3). Large types need explicit bins to stay manageable.",
    "medium",
    ["functional-coverage", "covergroup", "bin"]
  ),
  q(
    "h-4-q2",
    "h-4",
    "multiple-choice",
    "What is the purpose of `ignore_bins reserved = { 4'b1111 };` in a coverpoint?",
    [
      "It prevents 4'b1111 from being randomly generated by the constraint solver",
      "It marks 4'b1111 as an explicitly excluded value so the coverage tool treats its non-occurrence as intentional, not an accidental hole",
      "It forces the simulator to skip all transactions where this field equals 4'b1111",
      "It is equivalent to not defining a bin for that value — both are identical",
    ],
    1,
    "`ignore_bins` makes deliberate exclusions auditable. A reviewer can see 'we considered this case and explicitly excluded it' rather than wondering if the missing bin is accidental. Coverage models are sign-off artifacts; `ignore_bins` is the documented form of 'this case is intentionally unreachable.'",
    "medium",
    ["functional-coverage", "ignore-bins"]
  ),
  q(
    "h-4-q3",
    "h-4",
    "multiple-choice",
    "A coverage report shows 100% on both `cp_addr` and `cp_strb` coverpoints but 60% on the cross `cx_addr_strb : cross cp_addr, cp_strb`. What does this mean?",
    [
      "The coverage tool has a bug — 100% on all inputs implies 100% on the cross",
      "Specific COMBINATIONS of `addr` and `strb` values have not been exercised together, even though each field individually has full coverage",
      "The cross is redundant with the individual coverpoints and can be safely removed",
      "60% on the cross means at least 60% of the bins are non-zero, so this is acceptable closure",
    ],
    1,
    "Cross coverage captures combinations. Coverpoints can each be 100% while many combinations remain unexercised — e.g., high-address writes never had partial strobes. The cross coverage holes identify exactly which combinations need targeted stimulus.",
    "hard",
    ["functional-coverage", "cross-coverage"]
  ),
  q(
    "h-4-q4",
    "h-4",
    "multiple-choice",
    "An engineer creates 4096 individual bins for a 32-bit address field and sees near-zero coverage after 100,000 random transactions. What is the fundamental design mistake?",
    [
      "4096 bins is too few — a 32-bit field needs 2^32 bins for meaningful coverage",
      "The coverage model is at the wrong granularity: 4096 bins on a 4.3-billion-value space means each bin covers ~1 million addresses; random distribution almost never hits specific bins. Use 5–10 semantically meaningful bins (low/mid/high/boundary/reserved) that align with what matters for DUT behavior",
      "The randomize() call needs `dist` to target specific addresses",
      "Bins above 256 are not supported in the SystemVerilog standard",
    ],
    1,
    "Covergroups should reflect verification INTENT, not mechanical enumeration. 4096 fine-grained bins on a huge address space produce bins the random solver rarely hits. Coarse semantic bins (low, mid, high, boundary) reflect what the DUT actually cares about and close naturally under reasonable stimulus volume.",
    "hard",
    ["functional-coverage", "bin", "coverage-closure"]
  ),

  // ── Module h-5: UVM Sequences ────────────────────────────────────────────
  q(
    "h-5-q1",
    "h-5",
    "multiple-choice",
    "What is the purpose of calling `phase.raise_objection(this)` before a sequence runs in `run_phase`?",
    [
      "It locks out other sequences from running concurrently",
      "It tells the UVM phase scheduler that this component has work to do, preventing the run_phase from ending before the sequence completes",
      "It raises the priority of this test component above others",
      "It is optional — UVM automatically waits for all sequences to finish",
    ],
    1,
    "UVM phases end when NO component holds an objection. Without raising one before starting a sequence, the phase scheduler sees 'no work to do' and ends the simulation immediately at time 0 — a very common newcomer bug. The `raise/drop_objection` pair is the contract that says 'I have work; keep simulating until I drop.'",
    "easy",
    ["uvm", "objection", "run-phase"]
  ),
  q(
    "h-5-q2",
    "h-5",
    "multiple-choice",
    "Why is `start_item(tx)` / `finish_item(tx)` used instead of directly driving signals from a sequence?",
    [
      "It is a mandatory syntax requirement with no functional difference from direct driving",
      "It provides the sequencer handshake that enables arbitration between competing sequences, driver substitution via the factory, and phase scheduler visibility — direct signal driving from a sequence breaks the agent boundary and prevents reuse",
      "It allows the transaction to be randomized multiple times before sending",
      "It is only required for virtual sequences; regular sequences can drive directly",
    ],
    1,
    "`start_item` requests permission from the sequencer (arbitration between competing sequences). Between start and finish, you randomize and configure the transaction. `finish_item` hands it to the driver and waits for acknowledgment. This separation keeps sequences reusable — the driver can be substituted without changing sequences.",
    "medium",
    ["uvm", "sequence", "start-item"]
  ),
  q(
    "h-5-q3",
    "h-5",
    "multiple-choice",
    "A test scenario requires: configure registers via APB, drive 100 AXI writes, then wait for an interrupt. Which UVM construct coordinates this multi-agent, multi-step scenario?",
    [
      "A very large single UVM sequence that calls APB driver tasks and AXI driver tasks directly",
      "Three separate test classes that execute in sequence",
      "A virtual sequence that holds handles to the APB, AXI, and IRQ sequencers and orchestrates per-agent sequences temporally using fork/join",
      "The uvm_env's run_phase method, which can drive any sequencer",
    ],
    2,
    "A virtual sequence runs above individual agent boundaries. It holds handles to multiple sequencers and composes per-agent sequences in temporal order using SV concurrency. The per-agent sequences stay simple and reusable; only the virtual sequence knows about multi-agent coordination.",
    "medium",
    ["uvm", "virtual-sequence"]
  ),
  q(
    "h-5-q4",
    "h-5",
    "multiple-choice",
    "In a layered sequence (parent calls child via `burst.start(m_sequencer, this)`), what sequencer does the child sequence use?",
    [
      "The child creates its own sequencer automatically",
      "The parent's sequencer (`m_sequencer`) is inherited by the child — all sequences in the hierarchy drive the same sequencer",
      "The child uses the scoreboard's analysis port as its sequencer",
      "The child sequence runs on a dedicated child sequencer spawned at the parent's request",
    ],
    1,
    "Child sequences inherit the parent's sequencer via the `m_sequencer` handle. This keeps all traffic from a layered sequence hierarchy flowing through a single sequencer, maintaining proper arbitration and ordering.",
    "hard",
    ["uvm", "sequence", "layered-sequence"]
  ),

  // ── Module h-6: Formal Verification / SVA ────────────────────────────────
  q(
    "h-6-q1",
    "h-6",
    "multiple-choice",
    "What does the `|->` (overlapping implication) operator mean in a SystemVerilog concurrent assertion?",
    [
      "If the antecedent is true, the consequent must be true starting one cycle later",
      "If the antecedent is true, the consequent must be true starting in the SAME cycle",
      "The antecedent must hold throughout the entire sequence duration",
      "The consequent fires only on the rising edge of the antecedent",
    ],
    1,
    "`|->` is OVERLAPPING implication: the consequent evaluation begins in the same cycle the antecedent ends. `|=>` is NON-OVERLAPPING: the consequent starts one cycle later. Use `|->` for combinational responses; `|=>` for registered (clocked) responses.",
    "medium",
    ["sva", "assertion", "implication"]
  ),
  q(
    "h-6-q2",
    "h-6",
    "multiple-choice",
    "Why should every concurrent SVA assertion include `disable iff (!rst_n)`?",
    [
      "It improves simulation performance by skipping assertion checking during reset",
      "During reset the design is in an intentionally undefined state; without `disable iff`, every assertion fires spurious errors in the reset window, drowning real failures in noise",
      "It is required by the IEEE 1800-2023 standard for all synthesizable assertions",
      "It prevents the assertion from consuming simulation memory",
    ],
    1,
    "Reset is when the design is architecturally undefined. Assertions firing during reset produce false positive noise that makes the report useless. `disable iff (!rst_n)` gates the assertion to the post-reset window. This is ubiquitous in real SVA and is omitted only by beginners.",
    "easy",
    ["sva", "assertion", "disable-iff"]
  ),
  q(
    "h-6-q3",
    "h-6",
    "multiple-choice",
    "A FIFO's property `!(fifo_full && wr_en)` is checked against a DUT by a formal tool. The tool returns a counterexample. What does this mean?",
    [
      "The FIFO passed all checks — a counterexample in formal means the property holds",
      "The formal tool found a specific sequence of inputs that leads to a state where the FIFO is full AND write-enable is asserted simultaneously — a valid bug the DUT can reach from a reachable state",
      "The property specification is incorrect and needs to be rewritten",
      "The formal tool ran out of resources and approximated the result",
    ],
    1,
    "A counterexample is a proof that the property CAN be violated. The formal tool found the exact input sequence that breaks the invariant. This is a real bug — the DUT can overflow if given those inputs. Formal's power is that it explores ALL possible input sequences, not just those a simulation engineer thought to generate.",
    "medium",
    ["formal-verification", "counterexample"]
  ),
  q(
    "h-6-q4",
    "h-6",
    "multiple-choice",
    "In which class of bugs does formal verification provide a decisive advantage over extensive constrained-random simulation?",
    [
      "Performance bugs where the design runs slowly under heavy load",
      "Bugs triggered by a specific, rare sequence of inputs that random simulation is statistically unlikely to generate — like an overflow reachable only on cycle 10,000 with a specific input pattern",
      "All bugs — formal is always better than simulation in every category",
      "Configuration bugs where the DUT is set up incorrectly before the test starts",
    ],
    1,
    "Formal explores all possible inputs symbolically within a bounded depth. Bugs that require rare input sequences — those simulation would hit only by coincidence — are exactly what formal finds deterministically. For large system-level designs, formal is impractical due to exponential complexity; for block-level protocol correctness, it is often decisive.",
    "hard",
    ["formal-verification", "bounded-model-checking"]
  ),

  // ── Module h-7: Low-Power Verification (UPF) ─────────────────────────────
  q(
    "h-7-q1",
    "h-7",
    "multiple-choice",
    "What is the role of isolation cells in a multi-power-domain design?",
    [
      "They reduce power consumption by gating unused clock signals",
      "They clamp the outputs of a powered-down domain to a known value (typically 0), preventing X-propagation from an unpowered domain into always-on logic",
      "They store register values when a domain powers down for later restoration",
      "They shift voltage levels between two domains running at different supply voltages",
    ],
    1,
    "When a power domain is off, its outputs are electrically X (undefined). Without isolation cells at the domain boundary, X propagates into always-on receiving logic and corrupts it. Isolation cells are physical gates that clamp outputs to a defined value while the source domain is unpowered.",
    "medium",
    ["upf", "isolation-cell", "power-domain"]
  ),
  q(
    "h-7-q2",
    "h-7",
    "multiple-choice",
    "What is the difference between a retention flop and a non-retention flop in UPF power-aware design?",
    [
      "Retention flops consume more power during normal operation but save area",
      "Retention flops have a small always-on secondary supply that preserves their state through power-down; non-retention flops lose state and must be re-initialized after power-up",
      "Retention flops are faster but cannot hold state longer than one clock cycle",
      "The distinction is a simulation artifact; both behave identically in silicon",
    ],
    1,
    "Retention flops use an always-on supply rail for retention storage. After power-up, a restore signal transfers the saved state back to the main flop. Non-retention flops reset to defaults. Over-retention wastes power; under-retention loses state. UPF specifies which flops retain.",
    "easy",
    ["upf", "retention"]
  ),
  q(
    "h-7-q3",
    "h-7",
    "multiple-choice",
    "A plain RTL simulation passes 100% but the chip fails to wake from deep sleep. What structural gap in the verification flow is most likely responsible?",
    [
      "The testbench was not running with randomized inputs during RTL simulation",
      "RTL simulation models all supplies as always-on and cannot model power domain behavior; power-aware simulation (with UPF) is required to expose isolation violations, retention bugs, and power-sequencing errors that only manifest in silicon",
      "The DUT was not connected to a formal tool during RTL simulation",
      "RTL simulation is inherently insufficient and must be replaced by emulation",
    ],
    1,
    "RTL simulation has all supplies permanently on — it literally cannot represent power-domain state. Power-aware simulation reads the UPF file and models supply behavior: signals become X when domains are off, isolation cells clamp, retention saves/restores. Only power-aware sim catches this class of bug.",
    "medium",
    ["upf", "power-aware-sim"]
  ),
  q(
    "h-7-q4",
    "h-7",
    "multiple-choice",
    "In a UPF file, the assertion `property p_iso_before_off; @(posedge clk) $rose(cpu_pwr_req) |-> ##[0:5] cpu_iso_en; endproperty` is checking what relationship?",
    [
      "That isolation is disabled before the CPU domain powers up",
      "That when a power-down request rises, isolation is enabled within 5 clock cycles — ensuring outputs are clamped before the domain loses power",
      "That cpu_pwr_req and cpu_iso_en are always in phase",
      "That the CPU runs for at least 5 cycles before entering low-power mode",
    ],
    1,
    "The assertion checks power-sequencing: when cpu_pwr_req rises (a domain power-down is requested), cpu_iso_en must become active within 5 cycles. This ensures isolation cells clamp outputs before the domain shuts off, preventing X propagation.",
    "hard",
    ["upf", "assertion", "power-sequencing"]
  ),

  // ── Module h-8: Capstone — UART UVM Testbench ────────────────────────────
  q(
    "h-8-q1",
    "h-8",
    "multiple-choice",
    "In the UART capstone testbench, why are TWO agents needed — one for the parallel side and one for the serial side?",
    [
      "Two agents are required by the UVM standard for any capstone project",
      "The UART has two distinct protocol interfaces: the parallel register bus (host side) and the serial pin (TX/RX wire). Each interface has different signal semantics and needs its own driver/monitor pair",
      "The second agent handles power management for the UART",
      "Two agents are used to run parallel tests at twice the simulation speed",
    ],
    1,
    "The parallel agent drives register-level transactions (write to TX register, read RX data). The serial agent passively monitors the raw bit stream on the TX/RX pins and reconstructs bytes. Each interface has completely different timing, encoding, and protocols — requiring separate agents.",
    "medium",
    ["uvm", "capstone", "uart"]
  ),
  q(
    "h-8-q2",
    "h-8",
    "multiple-choice",
    "The UART capstone coverage model includes `cross baud, par`. Why is cross coverage important here beyond per-field coverage?",
    [
      "Cross coverage is required by the UVM standard; it has no additional verification value",
      "Each baud-rate and parity-mode combination may expose different timing-dependent bugs; cross coverage ensures the DUT is tested at every combination, not just every baud rate and every parity mode independently",
      "Cross coverage reduces simulation time by combining two coverage points into one",
      "Cross coverage is identical to AND-ing two coverpoints; it adds no new information",
    ],
    1,
    "Certain bugs may only appear at specific combinations — e.g., even parity + highest baud rate may have a framing glitch that doesn't appear at other combinations. Individual coverpoints guarantee each field is exercised; cross coverage guarantees the interaction between fields is exercised.",
    "hard",
    ["uvm", "functional-coverage", "cross-coverage", "uart"]
  ),
  q(
    "h-8-q3",
    "h-8",
    "multiple-choice",
    "What does the `bind uart_dut uart_assertions u_assert(.*)` construct do in the capstone?",
    [
      "It instantiates a second copy of the UART DUT for redundancy checking",
      "It attaches the `uart_assertions` module to the `uart_dut` without modifying the DUT's source code, enabling non-invasive SVA assertion monitoring",
      "It replaces the UART DUT with the assertions module for formal verification",
      "It is a compile directive that enables all SVA assertions in the file",
    ],
    1,
    "`bind` is the SystemVerilog construct for non-invasive assertion attachment. It instantiates a checker module in the scope of the target without touching the target's source. This is best practice: DUT code stays clean, assertions live in a separate file, and they can be removed for synthesis without modifying the DUT.",
    "medium",
    ["sva", "bind", "capstone"]
  ),

  // ── Module 11-9: Clock Domain Crossing ───────────────────────────────────
  q(
    "11-9-q1",
    "11-9",
    "multiple-choice",
    "What is metastability in a flip-flop, and what happens to its output when it enters this state?",
    [
      "Metastability is when the flip-flop's clock is too fast; the output toggles randomly",
      "Metastability is when the flip-flop's input data transitions inside its setup/hold window; the output enters an unstable analog state between 0 and 1 that resolves probabilistically via thermal noise — it is not a timing violation fixable by optimization",
      "Metastability is a simulation model that only appears in testbenches",
      "Metastability occurs when two flip-flops share a clock and their outputs disagree",
    ],
    1,
    "Metastability is a physical analog failure: the flip-flop's internal feedback node sits at a voltage where the cross-coupled inverters are equally balanced. The node eventually resolves to 0 or 1 via thermal noise, but 'eventually' is unbounded — it can persist into the downstream logic's sampling window and cause a failure.",
    "medium",
    ["cdc", "metastability"]
  ),
  q(
    "11-9-q2",
    "11-9",
    "multiple-choice",
    "Why does a two-flop synchronizer work to safely cross a single-bit signal between clock domains?",
    [
      "The two flops double-check each other and majority-vote on the output",
      "The first flop may go metastable, but the second flop only samples it after a full source-clock period of resolution time; MTBF scales exponentially with resolution time (exp(T/τ)), making the probability of unresolved metastability propagating to the second flop negligibly small",
      "Two flip-flops are faster than one, so they resolve the signal in half the time",
      "The second flop samples the signal from a parallel path that bypasses the first flop's metastability",
    ],
    1,
    "The first flip-flop may enter metastability. The gap between the first flop's clock edge and the second flop's clock edge provides one full destination-clock period of resolution time. MTBF = exp(τ_r / τ) / (f_clk × f_data × T_W) — every additional period of resolution time multiplies MTBF exponentially.",
    "medium",
    ["cdc", "synchronizer"]
  ),
  q(
    "11-9-q3",
    "11-9",
    "multiple-choice",
    "Why is it incorrect to synchronize a multi-bit counter bus by placing a two-flop synchronizer on each bit independently?",
    [
      "Each bit requires a separate `ASYNC_REG` attribute; placing them on individual bits is against the synthesis standard",
      "Each bit's synchronizer resolves its metastability independently, so the receiving domain may see some bits from the old value and some from the new value — a 'torn' word that never existed in the source domain",
      "It uses too many flip-flops; a single wide synchronizer handles all bits more efficiently",
      "Independent synchronizers work correctly for all clocks except for those that are incommensurate",
    ],
    1,
    "The bits of a counter transition at different times and each synchronizer resolves independently. The destination domain may capture bit[7:4] from count N+1 and bit[3:0] from count N — producing a value like 0b10000111 when transitioning from 7 (0111) to 8 (1000). The fix: Gray code (only 1 bit changes per step) or a handshake protocol.",
    "hard",
    ["cdc", "gray-code", "synchronizer"]
  ),
  q(
    "11-9-q4",
    "11-9",
    "multiple-choice",
    "A CDC analysis tool reports a 'reconvergent' violation. What makes this more dangerous than a simple unsynchronized crossing?",
    [
      "Reconvergence means the signal crosses three or more domains, which multiplies the metastability probability",
      "A reconvergent path means the SAME source signal reaches the destination via two paths: one synchronized and one unsynchronized (or two separately-resolving synchronizers). The destination logic combines both, and the two copies may resolve to different values — creating a glitch in logic that simulation does not expose because simulation does not model metastability",
      "Reconvergent violations are lower severity than unsynchronized violations and can be waived",
      "Reconvergence is only a problem when the two paths have different CDC analysis constraints",
    ],
    1,
    "Reconvergence is insidious because it passes simulation — the synchronized branch looks correct in RTL simulation where metastability is not modeled. In silicon, the synchronized and unsynchronized copies can resolve differently, and logic that combines them (e.g., an AND gate) sees contradictory versions of the same signal. Fix: route ALL consumers through one synchronizer instance.",
    "hard",
    ["cdc", "reconvergent", "cdc-analysis"]
  ),

  // ── Module 11-10: FPGA Emulation ─────────────────────────────────────────
  q(
    "11-10-q1",
    "11-10",
    "multiple-choice",
    "Why is RTL simulation impractical for booting an operating system on a modern SoC design?",
    [
      "RTL simulation cannot model software; operating systems require a different tool",
      "An OS boot requires tens of millions to billions of clock cycles; RTL simulation achieves only ~10–100 kHz of effective throughput for SoC-scale designs, making a single boot attempt take hours to years of wall-clock time",
      "RTL simulation is limited to 10,000 cycles maximum by the IEEE standard",
      "Operating systems require real network interfaces that cannot be modeled in RTL",
    ],
    1,
    "A Linux boot takes ~100M–1B cycles. RTL simulation of a 5B-gate SoC runs at roughly 10–100 kHz (gate count degrades throughput). At 10 kHz, 100M cycles takes 10,000 seconds (~2.8 hours); at the low end, a billion cycles could take months. FPGA emulation at 1–10 MHz reduces the same boot to minutes.",
    "easy",
    ["fpga-emulation", "rtl-simulation"]
  ),
  q(
    "11-10-q2",
    "11-10",
    "multiple-choice",
    "What does an emulation compiler's 'partition' step do and why does a poorly-partitioned design run slowly?",
    [
      "It splits the RTL into synthesizable and simulation-only subsets",
      "It cuts the RTL across multiple FPGAs to fit a design too large for one FPGA; signals crossing FPGA boundaries incur one additional clock cycle of latency each, so tight feedback loops (like CPU and L1 cache) that are cut across FPGAs add mandatory pipeline stalls that degrade throughput",
      "It removes assertion monitors from the design to reduce FPGA area",
      "It replaces multi-clock designs with a single unified clock for FPGA compatibility",
    ],
    1,
    "Every FPGA-to-FPGA signal boundary adds one clock cycle of latency (serialization + backplane + deserialization). A tight CPU/cache feedback loop normally completes in 1–2 cycles; cutting it across FPGAs adds 3–5 cycle roundtrip latency per memory access, degrading throughput on every cache-bound operation. The emulation compiler tries to minimize cuts on timing-critical paths.",
    "medium",
    ["fpga-emulation", "partition"]
  ),
  q(
    "11-10-q3",
    "11-10",
    "multiple-choice",
    "What is the fundamental difference between standalone emulation and in-circuit emulation (ICE)?",
    [
      "Standalone emulation uses real hardware; ICE uses a software model of the target board",
      "Standalone emulation connects the emulated RTL to a host-side testbench or software stack (no physical external hardware); ICE connects the emulated design directly to a real physical PCB so real I/O signals drive the emulated design and vice versa",
      "Standalone emulation runs at higher frequency than ICE",
      "ICE is used for formal verification; standalone emulation is used for simulation replacement",
    ],
    1,
    "Standalone: testbench is software running on the host, connected via SCE-MI/DPI. Used for OS boot, long regression, power analysis. ICE: real physical board I/O drives the emulated design — actual peripheral hardware, real protocol signals. Used for hardware/software integration before silicon exists.",
    "medium",
    ["fpga-emulation", "in-circuit-emulation"]
  ),
  q(
    "11-10-q4",
    "11-10",
    "multiple-choice",
    "Why does FPGA emulation have much less debug visibility than RTL simulation, and what is the emulation platform's mechanism to restore some observability?",
    [
      "FPGA emulation uses encrypted bitfiles that prevent signal inspection",
      "FPGA emulation has less visibility because signals inside FPGAs are real electrical circuits — you cannot read them without physical probes or dedicated logic. Emulation platforms insert trace-buffer instrumentation: pre-selected signals are captured into on-chip RAM when a trigger condition fires, then read back to the host. Pre-selection must happen before the run; adding new signals requires recompiling the bitfile",
      "FPGA emulation only lacks visibility on clock signals; data signals remain fully observable",
      "RTL simulation has less visibility than emulation; emulation's real hardware provides more insight",
    ],
    1,
    "Simulation observability is perfect and free — every signal is a software variable. Emulation observability has cost: each signal observed requires gate logic and routing to capture. Trace buffers pre-capture selected signals with finite depth. Adding a new probe after a run requires hours of recompilation — the core emulation debug constraint.",
    "hard",
    ["fpga-emulation", "debug-visibility"]
  ),
];
