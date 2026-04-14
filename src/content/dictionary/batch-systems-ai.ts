import type { DictionaryTerm } from "@/types/dictionary";

/**
 * Dictionary batch: Systems & AI topics (70 terms).
 * Covers OS, Networking, DB Internals, Cloud, AI, RAG/Agents, and Fine-tuning/Production.
 */
export const SYSTEMS_AI_TERMS: DictionaryTerm[] = [
  // ── OS (10) ───────────────────────────────────────────────────────────
  {
    slug: "process-os",
    term: "Process",
    aliases: ["task"],
    category: "systems",
    phaseIds: ["5"],
    lessonIds: [],
    definitions: {
      beginner:
        "A running program. When you open an app, the operating system creates a process to manage it.",
      intermediate:
        "An instance of a program in execution, with its own memory space, file descriptors, and at least one thread. The OS scheduler allocates CPU time to each process.",
      advanced:
        "A unit of resource ownership managed by the kernel, encapsulating a virtual address space, file descriptor table, signal disposition, and one or more threads of execution. Process isolation is enforced via hardware memory protection (MMU page tables) and privilege rings.",
    },
    seeAlso: ["thread-os", "context-switch", "virtual-memory"],
  },
  {
    slug: "thread-os",
    term: "Thread",
    aliases: ["lightweight process", "execution thread"],
    category: "systems",
    phaseIds: ["5"],
    lessonIds: [],
    definitions: {
      beginner:
        "A smaller unit of work inside a process. A single app can have multiple threads doing different things at the same time.",
      intermediate:
        "The smallest schedulable unit of execution within a process. Threads share the process's memory and file descriptors but each has its own stack and register state, enabling concurrent execution.",
      advanced:
        "A schedulable entity sharing the virtual address space and file descriptor table of its parent process. POSIX threads (pthreads) map to kernel-level threads on Linux (clone with CLONE_VM | CLONE_FS | CLONE_FILES), while user-space M:N models (goroutines, green threads) multiplex many logical threads onto fewer kernel threads.",
    },
    seeAlso: ["process-os", "context-switch"],
  },
  {
    slug: "virtual-memory",
    term: "Virtual Memory",
    aliases: ["VM"],
    category: "systems",
    phaseIds: ["5"],
    lessonIds: [],
    definitions: {
      beginner:
        "A trick the OS uses to make each program think it has its own huge block of memory, even if physical RAM is limited.",
      intermediate:
        "An abstraction where each process gets a private, contiguous address space mapped to physical RAM (and disk swap) via page tables. This provides isolation, allows overcommit, and simplifies memory allocation.",
      advanced:
        "A memory management scheme using hardware-assisted page table translation (TLB-cached) to map per-process virtual addresses to physical frames. Supports demand paging, copy-on-write, memory-mapped files, and NUMA-aware placement. The kernel's page replacement algorithm (e.g., LRU clock) governs eviction to swap.",
    },
    seeAlso: ["page-fault", "process-os"],
  },
  {
    slug: "page-fault",
    term: "Page Fault",
    aliases: [],
    category: "systems",
    phaseIds: ["5"],
    lessonIds: [],
    definitions: {
      beginner:
        "When a program tries to access memory that isn't loaded yet, the OS pauses it briefly to fetch the data — like a librarian retrieving a book from the back room.",
      intermediate:
        "An interrupt triggered when a process accesses a virtual page not currently mapped to a physical frame. A minor fault resolves from the page cache; a major fault requires disk I/O to load the page from swap or a file.",
      advanced:
        "A synchronous exception (trap 14 on x86) raised by the MMU when a page table entry is not present or its protection bits disallow the access. The kernel fault handler classifies it as minor (page in page cache, just wire the PTE), major (requires disk read), or invalid (SIGSEGV). Major faults dominate latency — on the order of milliseconds for rotational media, tens of microseconds for NVMe.",
    },
    seeAlso: ["virtual-memory"],
  },
  {
    slug: "context-switch",
    term: "Context Switch",
    aliases: [],
    category: "systems",
    phaseIds: ["5"],
    lessonIds: [],
    definitions: {
      beginner:
        "When the OS stops one program and starts running another, saving the first program's place so it can resume later.",
      intermediate:
        "The kernel operation of saving the current thread's CPU register state and loading the saved state of the next thread. Context switches enable multitasking but introduce overhead from cache and TLB invalidation.",
      advanced:
        "The act of saving a thread's architectural state (general-purpose registers, program counter, stack pointer, FPU/SIMD state, and segment registers) to its kernel thread control block and restoring another thread's state. Cross-process switches additionally flush the TLB (or use PCID/ASID tagging) and switch the CR3 page-table base. Cost varies from ~1 µs (same-process) to ~5 µs (cross-process with TLB flush) on modern x86-64.",
    },
    seeAlso: ["process-os", "thread-os"],
  },
  {
    slug: "system-call",
    term: "System Call",
    aliases: ["syscall"],
    category: "systems",
    phaseIds: ["5"],
    lessonIds: [],
    definitions: {
      beginner:
        "The way a program asks the operating system to do something it can't do on its own, like reading a file or sending data over the internet.",
      intermediate:
        "A controlled entry point into the kernel that lets user-space programs request privileged operations (file I/O, network access, process management). The CPU transitions from user mode to kernel mode via a trap instruction.",
      advanced:
        "A software interrupt or instruction (syscall/sysenter on x86-64, SVC on ARM) that transitions the CPU from ring 3 to ring 0, dispatching through the kernel's syscall table. Arguments are passed in registers per the ABI. The vDSO mechanism optimizes frequent, read-only calls (gettimeofday, clock_gettime) by mapping kernel pages into user space.",
    },
    seeAlso: ["process-os", "file-descriptor"],
  },
  {
    slug: "inode",
    term: "Inode",
    aliases: ["index node"],
    category: "systems",
    phaseIds: ["5"],
    lessonIds: [],
    definitions: {
      beginner:
        "A hidden record the filesystem keeps for every file, storing details like size, permissions, and where the data lives on disk — the file's name is stored separately.",
      intermediate:
        "A data structure in Unix filesystems that stores metadata about a file (owner, permissions, timestamps, size, block pointers) but not the filename. Filenames are directory entries that map a name to an inode number.",
      advanced:
        "A fixed-size on-disk structure (e.g., 256 bytes in ext4) identified by an integer inode number within its filesystem. Contains uid/gid, mode bits, timestamps (atime, mtime, ctime), link count, and a set of direct, indirect, double-indirect, and triple-indirect block pointers (or extents in ext4). Hard links create additional directory entries referencing the same inode; unlink decrements the link count and frees blocks when it reaches zero and no open file descriptors remain.",
    },
    seeAlso: ["file-descriptor"],
  },
  {
    slug: "file-descriptor",
    term: "File Descriptor",
    aliases: ["fd"],
    category: "systems",
    phaseIds: ["5"],
    lessonIds: [],
    definitions: {
      beginner:
        "A number the OS gives your program to represent an open file, socket, or pipe — like a ticket number at a deli counter.",
      intermediate:
        "A non-negative integer index into a process's file descriptor table, referencing an open file description in the kernel. Standard descriptors 0, 1, and 2 map to stdin, stdout, and stderr.",
      advanced:
        "An index into the per-process fd table, each entry pointing to a struct file (open file description) in the kernel. The struct file holds the current offset, access mode, and a pointer to the inode's file_operations vtable. The dup/dup2 syscalls alias entries; fork copies the table, sharing the underlying open file descriptions. The per-process limit is controlled by RLIMIT_NOFILE; the system-wide limit by /proc/sys/fs/file-max.",
    },
    seeAlso: ["inode", "pipe-os", "socket-programming"],
  },
  {
    slug: "pipe-os",
    term: "Pipe",
    aliases: ["unnamed pipe"],
    category: "systems",
    phaseIds: ["5"],
    lessonIds: [],
    definitions: {
      beginner:
        "A one-way channel that lets one program send data to another — the | symbol in a terminal command connects two programs with a pipe.",
      intermediate:
        "A unidirectional inter-process communication mechanism backed by a kernel buffer. Created via the pipe() syscall, it returns two file descriptors — one for reading and one for writing. Named pipes (FIFOs) extend this to unrelated processes via the filesystem.",
      advanced:
        "A kernel-buffered, unidirectional byte stream created by pipe2(). The default buffer size is one page (4 KiB on Linux, adjustable via F_SETPIPE_SZ up to /proc/sys/fs/pipe-max-size). Writes smaller than PIPE_BUF (4096 bytes POSIX minimum) are atomic. Named pipes (mkfifo) provide a filesystem entry point, enabling communication between unrelated processes without shared ancestry.",
    },
    seeAlso: ["file-descriptor", "signal-os"],
  },
  {
    slug: "signal-os",
    term: "Signal",
    aliases: ["Unix signal"],
    category: "systems",
    phaseIds: ["5"],
    lessonIds: [],
    definitions: {
      beginner:
        "A message the OS sends to a program to tell it something happened — like pressing Ctrl+C sends a signal that says 'please stop.'",
      intermediate:
        "An asynchronous notification delivered to a process by the kernel or another process. Common signals include SIGTERM (graceful shutdown), SIGKILL (forced kill), SIGINT (interrupt from terminal), and SIGSEGV (invalid memory access). Processes can register custom handlers for most signals.",
      advanced:
        "A software interrupt delivered via the kernel's signal dispatch mechanism. Standard signals (1–31) are non-queuing; real-time signals (SIGRTMIN–SIGRTMAX) are queued and ordered. Signal delivery interrupts the current execution, pushing a signal frame onto the user stack (or an alternate signal stack set via sigaltstack). The sigaction() interface allows specifying SA_RESTART, SA_SIGINFO, and signal masks. Signal-safety constraints limit which functions may be called inside handlers (async-signal-safe functions only).",
    },
    seeAlso: ["process-os", "system-call"],
  },

  // ── Networking (10) ───────────────────────────────────────────────────
  {
    slug: "tcp-ip",
    term: "TCP/IP",
    aliases: ["Transmission Control Protocol", "Internet Protocol"],
    category: "networking",
    phaseIds: ["5"],
    lessonIds: [],
    definitions: {
      beginner:
        "The set of rules computers use to talk to each other over the internet. TCP makes sure all the data arrives correctly; IP handles addressing and routing.",
      intermediate:
        "A layered protocol suite where IP provides best-effort packet delivery via logical addressing and routing, and TCP adds reliable, ordered, connection-oriented byte-stream delivery with flow control (sliding window) and congestion control (Reno, CUBIC).",
      advanced:
        "The TCP/IP stack comprises link, internet (IPv4/IPv6), transport (TCP/UDP), and application layers. TCP provides full-duplex, reliable delivery via sequence numbers, cumulative/selective ACKs, and retransmission timers (RTO via Karn/Partridge). Modern kernels implement CUBIC or BBR congestion control, TCP Fast Open (TFO), and ECN. IP provides connectionless, best-effort datagram forwarding with TTL-bounded hop traversal and fragmentation/reassembly.",
    },
    seeAlso: ["udp-protocol", "socket-programming"],
  },
  {
    slug: "udp-protocol",
    term: "UDP",
    aliases: ["User Datagram Protocol"],
    category: "networking",
    phaseIds: ["5"],
    lessonIds: [],
    definitions: {
      beginner:
        "A way to send data quickly without waiting for confirmation that it arrived — used for video calls, games, and streaming where speed matters more than perfection.",
      intermediate:
        "A connectionless transport protocol that sends datagrams without establishing a session, ordering guarantees, or retransmission. Lower overhead than TCP, making it suitable for latency-sensitive applications like DNS, VoIP, and gaming.",
      advanced:
        "A minimal transport protocol (RFC 768) providing port-level multiplexing and an optional checksum over an IP datagram. No handshake, no congestion control, no ordering — application-layer protocols (QUIC, DTLS, RTP) add reliability and security as needed. UDP-based QUIC (RFC 9000) now underpins HTTP/3, incorporating its own congestion control and TLS 1.3.",
    },
    seeAlso: ["tcp-ip", "http3-quic"],
  },
  {
    slug: "http2",
    term: "HTTP/2",
    aliases: ["h2"],
    category: "networking",
    phaseIds: ["5"],
    lessonIds: [],
    definitions: {
      beginner:
        "A faster version of the protocol browsers use to load web pages. It can fetch many files at once over a single connection instead of waiting in line.",
      intermediate:
        "A binary-framed protocol that multiplexes multiple request/response streams over a single TCP connection. Features include header compression (HPACK), server push, and stream prioritization, eliminating HTTP/1.1's head-of-line blocking at the application layer.",
      advanced:
        "Defined in RFC 9113, HTTP/2 frames requests into HEADERS and DATA frames on numbered streams sharing one TCP connection. HPACK (RFC 7541) uses Huffman coding and a dynamic table for header compression. While it resolves HTTP-level head-of-line blocking, TCP-level HOL blocking persists — a single lost packet stalls all streams. This limitation motivated HTTP/3's move to QUIC/UDP.",
    },
    seeAlso: ["http3-quic", "tls-handshake"],
  },
  {
    slug: "http3-quic",
    term: "HTTP/3 (QUIC)",
    aliases: ["h3", "QUIC"],
    category: "networking",
    phaseIds: ["5"],
    lessonIds: [],
    definitions: {
      beginner:
        "The newest version of the web protocol, built on top of UDP instead of TCP. It makes web pages load faster, especially on spotty connections.",
      intermediate:
        "HTTP/3 runs over QUIC, a UDP-based transport with built-in TLS 1.3 encryption and independent stream multiplexing. Eliminates TCP's head-of-line blocking — a lost packet only stalls the affected stream, not the entire connection.",
      advanced:
        "RFC 9114 specifies HTTP/3 over QUIC (RFC 9000). QUIC provides per-stream flow control, zero-RTT resumption (0-RTT data with replay protection caveats), connection migration via connection IDs (survives IP changes), and pluggable congestion control. QPACK (RFC 9204) replaces HPACK for header compression, using separate encoder/decoder streams to avoid head-of-line blocking in the compression layer itself.",
    },
    seeAlso: ["http2", "udp-protocol", "tls-handshake"],
  },
  {
    slug: "tls-handshake",
    term: "TLS Handshake",
    aliases: ["SSL handshake"],
    category: "networking",
    phaseIds: ["5"],
    lessonIds: [],
    definitions: {
      beginner:
        "The process a browser and server go through to set up a secure, encrypted connection — they agree on a secret code before any real data is sent.",
      intermediate:
        "A protocol exchange where client and server negotiate a cipher suite, authenticate via certificates, and derive shared encryption keys. TLS 1.3 completes in one round trip (1-RTT), or zero (0-RTT) for resumed sessions.",
      advanced:
        "TLS 1.3 (RFC 8446) handshake: ClientHello (with key_share and supported_groups) → ServerHello + EncryptedExtensions + Certificate + CertificateVerify + Finished → client Finished. Key exchange uses ephemeral ECDHE (X25519 or P-256). The handshake transcript is hashed to derive traffic keys via HKDF. 0-RTT resumption sends early data encrypted under a PSK derived from a prior session, accepting the replay risk for idempotent requests.",
    },
    seeAlso: ["http2", "http3-quic"],
  },
  {
    slug: "dns-record",
    term: "DNS Record",
    aliases: ["domain name record"],
    category: "networking",
    phaseIds: ["5"],
    lessonIds: [],
    definitions: {
      beginner:
        "An entry in the internet's phone book that maps a domain name (like example.com) to an IP address or other information.",
      intermediate:
        "A resource record in the Domain Name System mapping a domain to data. Common types: A (IPv4 address), AAAA (IPv6), CNAME (alias), MX (mail server), TXT (arbitrary text for SPF/DKIM), NS (name server). Each record has a TTL controlling cache duration.",
      advanced:
        "A DNS resource record (RR) as defined in RFC 1035, consisting of (NAME, TYPE, CLASS, TTL, RDLENGTH, RDATA). Resolution follows iterative or recursive query patterns through the hierarchy (root → TLD → authoritative). DNSSEC (RFC 4033-4035) adds RRSIG, DNSKEY, DS, and NSEC/NSEC3 records for cryptographic authentication of responses. DNS-over-HTTPS (DoH, RFC 8484) and DNS-over-TLS (DoT, RFC 7858) encrypt queries to recursive resolvers.",
    },
    seeAlso: ["tcp-ip"],
  },
  {
    slug: "socket-programming",
    term: "Socket",
    aliases: ["network socket", "Berkeley socket"],
    category: "networking",
    phaseIds: ["5"],
    lessonIds: [],
    definitions: {
      beginner:
        "An endpoint for sending and receiving data over a network — like a mailbox that programs use to communicate with each other.",
      intermediate:
        "A software abstraction for network communication identified by an (IP, port, protocol) tuple. The BSD socket API provides socket(), bind(), listen(), accept(), connect(), send(), and recv() for both TCP and UDP communication.",
      advanced:
        "A kernel object (struct socket → struct sock in Linux) encapsulating protocol state, send/receive buffers (sk_sndbuf/sk_rcvbuf), and a file descriptor interface. Socket options (SO_REUSEADDR, SO_REUSEPORT, TCP_NODELAY, TCP_CORK) tune behavior. Multiplexing is handled via select/poll/epoll (Linux), kqueue (BSD), or IOCP (Windows). Non-blocking I/O combined with epoll (edge-triggered) underpins high-performance event loops (libuv, tokio, io_uring for async I/O).",
    },
    seeAlso: ["tcp-ip", "file-descriptor"],
  },
  {
    slug: "websocket-protocol",
    term: "WebSocket",
    aliases: ["ws", "wss"],
    category: "networking",
    phaseIds: ["5"],
    lessonIds: [],
    definitions: {
      beginner:
        "A technology that lets a browser and server keep an open connection so they can send messages back and forth instantly — used in chat apps and live updates.",
      intermediate:
        "A full-duplex communication protocol (RFC 6455) that upgrades from an HTTP/1.1 connection via the Upgrade header. Once established, both sides can send frames independently with minimal overhead, enabling real-time applications.",
      advanced:
        "Initiated via an HTTP/1.1 101 Switching Protocols response after a Sec-WebSocket-Key/Accept handshake. The framing protocol uses 2-14 byte headers with opcode (text, binary, ping, pong, close), mask bit (client-to-server frames must be masked), and payload length. Extensions like permessage-deflate (RFC 7692) add compression. For HTTP/2 environments, RFC 8441 defines WebSocket bootstrapping via CONNECT with the :protocol pseudo-header.",
    },
    seeAlso: ["http2", "socket-programming"],
  },
  {
    slug: "load-balancer-l7",
    term: "Layer 7 Load Balancer",
    aliases: ["application load balancer", "ALB"],
    category: "networking",
    phaseIds: ["5"],
    lessonIds: [],
    definitions: {
      beginner:
        "A traffic director that reads the content of web requests to decide which server should handle them — it can route based on the URL path or headers.",
      intermediate:
        "A load balancer operating at the application layer (HTTP/HTTPS) that can inspect request content — URL paths, headers, cookies — to make routing decisions. Supports features like SSL termination, sticky sessions, and content-based routing.",
      advanced:
        "An application-layer proxy (e.g., NGINX, HAProxy, AWS ALB, Envoy) that terminates client connections and initiates new backend connections. Routing rules evaluate L7 attributes (Host header, URI path, query parameters, JWT claims). Supports weighted routing, canary deployments, circuit breaking, and connection draining. Unlike L4 balancers (which forward TCP/UDP packets), L7 balancers must fully parse the protocol, adding latency but enabling richer traffic management and observability (request-level metrics, distributed tracing headers).",
    },
    seeAlso: ["reverse-proxy", "http2"],
  },
  {
    slug: "reverse-proxy",
    term: "Reverse Proxy",
    aliases: [],
    category: "networking",
    phaseIds: ["5"],
    lessonIds: [],
    definitions: {
      beginner:
        "A server that sits in front of your actual servers and forwards requests to them — visitors never talk directly to your app servers.",
      intermediate:
        "A server that accepts client requests and forwards them to one or more backend servers, returning the response as if it originated from the proxy itself. Provides benefits like SSL termination, caching, compression, and hiding backend topology.",
      advanced:
        "An intermediary that terminates client connections at the network edge, applying security policies (WAF rules, rate limiting, IP allowlisting), TLS termination, HTTP header manipulation, and response caching before proxying to upstream servers. Modern implementations (Envoy, Caddy, Traefik) support dynamic configuration via control planes, automatic certificate management (ACME/Let's Encrypt), gRPC proxying, and observability integration (OpenTelemetry spans). Reverse proxies form the foundation of service mesh data planes.",
    },
    seeAlso: ["load-balancer-l7", "cdn-edge"],
  },

  // ── DB Internals (10) ─────────────────────────────────────────────────
  {
    slug: "b-tree-index",
    term: "B-Tree Index",
    aliases: ["B+ tree index"],
    category: "databases",
    phaseIds: ["5"],
    lessonIds: [],
    definitions: {
      beginner:
        "A way databases organize data so they can find records quickly — like a book's index that tells you exactly which page to turn to.",
      intermediate:
        "A self-balancing tree structure used by most relational databases for indexing. B+ trees store keys in sorted order across internal nodes and data pointers in leaf nodes, enabling O(log n) lookups, range scans, and ordered traversals.",
      advanced:
        "A B+ tree variant where internal nodes contain separator keys and child pointers (fanout typically 100–500 for 8 KiB pages), and leaf nodes form a doubly-linked list for efficient range scans. Write amplification occurs from page splits and compaction. Most RDBMS (PostgreSQL, MySQL/InnoDB) use B+ trees as the primary index structure. Buffer pool management, page-level locking, and write-ahead logging interact closely with B-tree operations.",
    },
    seeAlso: ["lsm-tree", "query-optimizer"],
  },
  {
    slug: "lsm-tree",
    term: "LSM Tree",
    aliases: ["Log-Structured Merge-Tree"],
    category: "databases",
    phaseIds: ["5"],
    lessonIds: [],
    definitions: {
      beginner:
        "A way to store data that's optimized for writing — new data is quickly added to memory, then gradually organized on disk in the background.",
      intermediate:
        "A write-optimized data structure that buffers writes in a memory-resident sorted structure (memtable), then flushes to immutable sorted files (SSTables) on disk. Background compaction merges SSTables to maintain read performance. Used by LevelDB, RocksDB, Cassandra, and HBase.",
      advanced:
        "Writes go to a WAL (for durability) and an in-memory skip list or red-black tree (memtable). When the memtable exceeds a threshold, it is flushed as an immutable SSTable to L0. Compaction strategies (leveled, tiered, FIFO) trade write amplification against read amplification and space amplification. Bloom filters on each SSTable reduce point-query I/O. Read path: memtable → L0 (potentially overlapping) → L1..Ln (non-overlapping per level). Key challenges: write stalls during compaction, space amplification from temporary duplication, and tombstone accumulation.",
    },
    seeAlso: ["b-tree-index", "write-ahead-log"],
  },
  {
    slug: "write-ahead-log",
    term: "Write-Ahead Log",
    aliases: ["WAL", "transaction log", "redo log"],
    category: "databases",
    phaseIds: ["5"],
    lessonIds: [],
    definitions: {
      beginner:
        "A diary the database keeps before making changes — if something goes wrong, it can replay the diary to recover everything.",
      intermediate:
        "A durability mechanism where every modification is first written sequentially to an append-only log file before being applied to the actual data pages. On crash recovery, the WAL is replayed to restore committed transactions.",
      advanced:
        "An append-only, sequential log that records before-images, after-images, or both (depending on ARIES or shadow-page model) for each modification. WAL entries include an LSN (Log Sequence Number) for ordering. The force-at-commit policy ensures all log records for a transaction are fsynced before acknowledging commit. Group commit batches multiple transactions' fsync calls. Checkpointing writes dirty pages to disk and records a checkpoint LSN, bounding recovery time. PostgreSQL's WAL also supports streaming replication and point-in-time recovery (PITR).",
    },
    seeAlso: ["wal-checkpoint", "mvcc-db"],
  },
  {
    slug: "mvcc-db",
    term: "MVCC",
    aliases: ["Multi-Version Concurrency Control"],
    category: "databases",
    phaseIds: ["5"],
    lessonIds: [],
    definitions: {
      beginner:
        "A technique that lets multiple users read and write to a database at the same time without blocking each other, by keeping multiple versions of the data.",
      intermediate:
        "A concurrency control method where each transaction sees a consistent snapshot of the database. Writers create new versions of rows rather than overwriting, so readers never block writers and vice versa. Used by PostgreSQL, MySQL/InnoDB, and Oracle.",
      advanced:
        "Each row version carries a creation transaction ID (xmin in PostgreSQL) and an optional deletion transaction ID (xmax). A transaction's visibility check compares these against its snapshot — a set of active transaction IDs at snapshot time. PostgreSQL implements snapshot isolation via xmin/xmax and a commit log (CLOG); InnoDB uses undo logs to reconstruct prior versions. VACUUM (PostgreSQL) or purge threads (InnoDB) reclaim dead versions. Serializable Snapshot Isolation (SSI) extends MVCC to detect write skew anomalies.",
    },
    seeAlso: ["write-ahead-log", "query-optimizer"],
  },
  {
    slug: "query-optimizer",
    term: "Query Optimizer",
    aliases: ["query planner"],
    category: "databases",
    phaseIds: ["5"],
    lessonIds: [],
    definitions: {
      beginner:
        "The part of a database that figures out the fastest way to find the data you asked for — like a GPS finding the best route.",
      intermediate:
        "A database component that analyzes SQL queries and generates an efficient execution plan. It considers available indexes, table statistics, join ordering, and cost estimates to choose between strategies like sequential scans, index scans, hash joins, and merge joins.",
      advanced:
        "Transforms a parsed query AST through logical optimization (predicate pushdown, join reordering, subquery decorrelation, view merging) and physical optimization (access path selection, join algorithm choice, parallelism). Cost-based optimizers (PostgreSQL, Oracle, SQL Server) estimate I/O and CPU costs using table statistics (pg_statistic: histograms, MCVs, distinct counts, correlation). Dynamic programming or greedy algorithms explore the join-order search space. Adaptive query execution (Spark AQE, Oracle adaptive plans) adjusts at runtime based on actual cardinalities.",
    },
    seeAlso: ["b-tree-index", "storage-engine"],
  },
  {
    slug: "storage-engine",
    term: "Storage Engine",
    aliases: ["database engine"],
    category: "databases",
    phaseIds: ["5"],
    lessonIds: [],
    definitions: {
      beginner:
        "The part of a database responsible for actually saving and retrieving data from disk — different engines make different trade-offs between speed and reliability.",
      intermediate:
        "The component that handles how data is physically stored, indexed, and retrieved. MySQL supports pluggable engines (InnoDB for ACID, MyISAM for read-heavy, RocksDB for write-heavy). Each engine makes different trade-offs between read performance, write throughput, and storage efficiency.",
      advanced:
        "Manages the page/block format, buffer pool, index structures, transaction logging, and concurrency control. InnoDB uses a clustered B+ tree (primary key organizes row storage) with a buffer pool, doublewrite buffer, and ARIES-style WAL. RocksDB (LSM-based) optimizes for write-heavy workloads with configurable compaction. WiredTiger (MongoDB) supports both B-tree and LSM modes with block-level compression (snappy, zlib, zstd). The storage engine API in MySQL separates query processing from physical data management.",
    },
    seeAlso: ["b-tree-index", "lsm-tree", "write-ahead-log"],
  },
  {
    slug: "wal-checkpoint",
    term: "WAL Checkpoint",
    aliases: ["checkpoint"],
    category: "databases",
    phaseIds: ["5"],
    lessonIds: [],
    definitions: {
      beginner:
        "A save point where the database writes everything from its recovery log to the actual data files, so it doesn't have to replay as much if it crashes.",
      intermediate:
        "A periodic operation where the database flushes dirty pages from the buffer pool to disk and records the current WAL position. This bounds crash-recovery time by establishing a known-good starting point for log replay.",
      advanced:
        "In PostgreSQL, a checkpoint writes all dirty buffers to disk, issues an fsync, and records the checkpoint LSN in pg_control. Recovery starts from the last checkpoint's redo point. Fuzzy checkpoints (InnoDB) continuously flush dirty pages sorted by LSN, avoiding the I/O spike of sharp checkpoints. Checkpoint frequency is a trade-off: too frequent increases write I/O; too infrequent increases recovery time. PostgreSQL controls this via checkpoint_timeout and max_wal_size; InnoDB uses innodb_max_dirty_pages_pct and adaptive flushing.",
    },
    seeAlso: ["write-ahead-log"],
  },
  {
    slug: "read-replica",
    term: "Read Replica",
    aliases: ["replica", "follower"],
    category: "databases",
    phaseIds: ["5"],
    lessonIds: [],
    definitions: {
      beginner:
        "A copy of your database that handles read requests, so the main database isn't overwhelmed — like having extra cashiers who can look up orders but not create new ones.",
      intermediate:
        "A secondary database instance that continuously replicates data from the primary (leader) and serves read-only queries. Reduces load on the primary and can be placed in different regions for lower latency. Replication may be synchronous (strong consistency) or asynchronous (eventual consistency).",
      advanced:
        "Implemented via physical replication (shipping WAL segments or streaming WAL, as in PostgreSQL) or logical replication (decoding WAL into row-level changes). Asynchronous replicas introduce replication lag, visible as stale reads — mitigated by monotonic-read guarantees or causal consistency. Synchronous replication (synchronous_commit in PostgreSQL, semi-sync in MySQL) ensures durability on the replica before acknowledging commit, trading latency for consistency. Promotion to primary on failover requires fencing the old primary (STONITH) to avoid split-brain.",
    },
    seeAlso: ["partitioning-db", "write-ahead-log"],
  },
  {
    slug: "partitioning-db",
    term: "Partitioning",
    aliases: ["sharding", "horizontal partitioning"],
    category: "databases",
    phaseIds: ["5"],
    lessonIds: [],
    definitions: {
      beginner:
        "Splitting a large database table into smaller pieces so queries run faster and data can be spread across multiple servers.",
      intermediate:
        "Dividing a table's data across multiple storage units based on a partition key. Horizontal partitioning (sharding) distributes rows across nodes; vertical partitioning splits columns. Common strategies include hash, range, and list partitioning. Improves query performance and enables horizontal scaling.",
      advanced:
        "Horizontal partitioning maps rows to partitions via a function of the partition key: hash (consistent hashing for uniform distribution), range (ordered data for range scans), or composite. Cross-partition queries (scatter-gather) and distributed transactions (2PC) are expensive. Rebalancing (splitting hot partitions, merging cold ones) must be online. Systems like CockroachDB and Spanner use automatic range-based sharding with Raft consensus per range. Vitess and Citus add sharding layers atop MySQL and PostgreSQL respectively.",
    },
    seeAlso: ["read-replica", "nosql"],
  },
  {
    slug: "nosql",
    term: "NoSQL",
    aliases: ["non-relational database"],
    category: "databases",
    phaseIds: ["5"],
    lessonIds: [],
    definitions: {
      beginner:
        "A type of database that doesn't use traditional tables with rows and columns — it can store data as documents, key-value pairs, graphs, or wide columns.",
      intermediate:
        "A category of databases optimized for specific access patterns rather than general-purpose relational queries. Types include document stores (MongoDB), key-value (Redis, DynamoDB), wide-column (Cassandra, HBase), and graph (Neo4j). Trade relational flexibility for horizontal scalability and schema flexibility.",
      advanced:
        "NoSQL systems relax one or more ACID guarantees in favor of availability and partition tolerance (CAP theorem), though many now offer tunable consistency (Cassandra's quorum reads/writes, DynamoDB's strong consistency option). Document stores use BSON/JSON with flexible schemas and secondary indexes; wide-column stores model data as sorted maps of maps; graph databases optimize traversal queries via index-free adjacency. The Dynamo-style (consistent hashing, vector clocks, sloppy quorum) and Bigtable-style (sorted string tables, column families, tablet servers) architectures represent the two major lineages.",
    },
    seeAlso: ["partitioning-db", "b-tree-index"],
  },

  // ── Cloud (10) ────────────────────────────────────────────────────────
  {
    slug: "vpc",
    term: "VPC",
    aliases: ["Virtual Private Cloud"],
    category: "cloud",
    phaseIds: ["6"],
    lessonIds: [],
    definitions: {
      beginner:
        "Your own private section of the cloud, isolated from other users — like having your own fenced-off area in a shared data center.",
      intermediate:
        "A logically isolated virtual network within a cloud provider's infrastructure. You define its IP address range (CIDR block), subnets, route tables, and gateways. Resources within a VPC communicate privately; internet access requires an internet gateway or NAT gateway.",
      advanced:
        "An overlay network implemented via encapsulation (VXLAN, Geneve, or proprietary) on the cloud provider's physical fabric. Each VPC gets a private CIDR block (RFC 1918); inter-VPC communication uses peering (non-transitive, full-mesh) or transit gateways (hub-and-spoke, supports transitive routing). Flow logs capture L4 metadata for audit. VPC endpoints (AWS PrivateLink, GCP Private Service Connect) enable private connectivity to managed services without traversing the public internet, reducing attack surface and data transfer costs.",
    },
    seeAlso: ["subnet", "security-group"],
  },
  {
    slug: "subnet",
    term: "Subnet",
    aliases: ["subnetwork"],
    category: "cloud",
    phaseIds: ["6"],
    lessonIds: [],
    definitions: {
      beginner:
        "A smaller section within your VPC that groups resources together — like dividing an office floor into departments.",
      intermediate:
        "A range of IP addresses within a VPC, associated with a specific availability zone. Public subnets have routes to an internet gateway; private subnets route through a NAT gateway or remain fully isolated. Subnets enable network segmentation and control traffic flow.",
      advanced:
        "A CIDR subdivision of the VPC address space, bound to a single availability zone (AWS) or region (GCP). Route tables attached to subnets determine next-hop forwarding. Network ACLs provide stateless L4 filtering at the subnet boundary (evaluated before security groups). Best practice: use /24 or /20 blocks, separate public-facing (load balancers) from private (compute, databases) subnets, and use separate subnets per AZ for HA. IPv6 dual-stack subnets require explicit egress-only internet gateway configuration.",
    },
    seeAlso: ["vpc", "security-group"],
  },
  {
    slug: "security-group",
    term: "Security Group",
    aliases: ["SG", "firewall rules"],
    category: "cloud",
    phaseIds: ["6"],
    lessonIds: [],
    definitions: {
      beginner:
        "A set of rules that controls which network traffic is allowed to reach your cloud resources — like a bouncer deciding who gets in.",
      intermediate:
        "A stateful virtual firewall attached to cloud resources (EC2 instances, RDS databases, etc.) that filters inbound and outbound traffic by protocol, port, and source/destination. Rules are allow-only — there are no explicit deny rules; unmatched traffic is implicitly denied.",
      advanced:
        "A stateful L4 packet filter implemented in the hypervisor's virtual switch (ENI-level in AWS). Because they are stateful, return traffic for an allowed inbound connection is automatically permitted. Security groups can reference other security groups as sources, enabling self-referential rules (e.g., allow all traffic within the SG). Evaluation order: all rules are evaluated collectively (no priority ordering). Contrast with NACLs, which are stateless, ordered, and support explicit deny. Best practice: least-privilege rules, separate SGs per role (web, app, db), and avoid 0.0.0.0/0 on ingress.",
    },
    seeAlso: ["vpc", "subnet"],
  },
  {
    slug: "s3-storage",
    term: "S3",
    aliases: ["Simple Storage Service", "object storage"],
    category: "cloud",
    phaseIds: ["6"],
    lessonIds: [],
    definitions: {
      beginner:
        "A place in the cloud to store any amount of files — photos, backups, website assets — that's always available and never runs out of space.",
      intermediate:
        "An object storage service that stores data as objects in buckets with flat namespaces (key-value). Provides 99.999999999% (11 nines) durability, versioning, lifecycle policies, and multiple storage classes (Standard, IA, Glacier) for cost optimization. Access is controlled via bucket policies and IAM.",
      advanced:
        "Objects are replicated across ≥3 AZs within a region (or across regions with CRR). The data model is key → (metadata, body); no partial updates — objects are immutable and replaced atomically. Strong read-after-write consistency (since Dec 2020). Multipart upload supports objects up to 5 TiB. S3 Select and S3 Object Lambda enable server-side filtering. Storage classes leverage tiered retrieval latency/cost: Standard (ms), Standard-IA (ms, retrieval fee), Glacier Instant (ms), Glacier Flexible (minutes-hours), Deep Archive (12-48h). Event notifications integrate with Lambda, SQS, and SNS.",
    },
    seeAlso: ["lambda-function", "cdn-edge"],
  },
  {
    slug: "lambda-function",
    term: "Lambda Function",
    aliases: ["serverless function", "FaaS"],
    category: "cloud",
    phaseIds: ["6"],
    lessonIds: [],
    definitions: {
      beginner:
        "A small piece of code that runs in the cloud only when triggered — you don't manage any servers, and you only pay for the time it actually runs.",
      intermediate:
        "A serverless compute service that executes code in response to events (HTTP requests, file uploads, queue messages) without provisioning servers. Auto-scales from zero to thousands of concurrent instances. Billed per invocation and execution duration (GB-seconds).",
      advanced:
        "Runs in a microVM (Firecracker) or container sandbox with a frozen execution environment that is reused across warm invocations (container reuse). Cold starts (100ms–10s depending on runtime and package size) occur when no warm environment exists. Provisioned concurrency pre-warms environments. Execution model: event source → Lambda service polls or receives push → invokes handler → returns response. Constraints: 15-min max duration, 10 GB memory, 512 MB /tmp (configurable to 10 GB), 6 MB synchronous payload. Extensions and layers customize the runtime. SnapStart (Java) and response streaming reduce cold start and TTFB.",
    },
    seeAlso: ["auto-scaling", "s3-storage"],
  },
  {
    slug: "cdn-edge",
    term: "CDN Edge",
    aliases: ["content delivery network", "edge location"],
    category: "cloud",
    phaseIds: ["6"],
    lessonIds: [],
    definitions: {
      beginner:
        "Copies of your website's files stored in data centers around the world, so users load pages from a server close to them instead of one far away.",
      intermediate:
        "A globally distributed network of cache servers (edge locations) that serve content from the nearest location to the user. Reduces latency and origin server load. Supports static assets, dynamic content acceleration, and edge compute (Cloudflare Workers, Lambda@Edge).",
      advanced:
        "CDN edge servers implement HTTP caching (Cache-Control, ETag, Vary), TLS termination, DDoS mitigation, and increasingly, compute at the edge (V8 isolates in Cloudflare Workers, Lambda@Edge/CloudFront Functions). Cache hierarchies (edge → regional → origin shield → origin) reduce origin fetches. Anycast routing directs users to the nearest POP. Cache invalidation strategies include TTL-based expiry, explicit purge APIs, and surrogate keys (cache tags). Modern CDNs support HTTP/3, Early Hints (103), and stale-while-revalidate for improved perceived performance.",
    },
    seeAlso: ["reverse-proxy", "s3-storage"],
  },
  {
    slug: "auto-scaling",
    term: "Auto Scaling",
    aliases: ["autoscaling", "elastic scaling"],
    category: "cloud",
    phaseIds: ["6"],
    lessonIds: [],
    definitions: {
      beginner:
        "The cloud's ability to automatically add more servers when traffic increases and remove them when it decreases — you never have to manually adjust capacity.",
      intermediate:
        "A cloud service that automatically adjusts the number of compute instances based on demand metrics (CPU, memory, request count, custom metrics). Includes scaling policies (target tracking, step, scheduled) and health checks to replace unhealthy instances.",
      advanced:
        "Comprises a launch template (AMI, instance type, user data), an auto scaling group (min/max/desired capacity, AZ distribution), and scaling policies. Target tracking policies maintain a metric at a set point (e.g., 70% CPU) using a PID-like control loop. Predictive scaling uses ML to forecast demand. Scale-in protection and lifecycle hooks enable graceful shutdown (drain connections, deregister from load balancer, persist state). Kubernetes HPA (Horizontal Pod Autoscaler) scales by metrics-server data or custom metrics; KEDA extends to event-driven scaling.",
    },
    seeAlso: ["kubernetes", "load-balancer-l7"],
  },
  {
    slug: "kubernetes",
    term: "Kubernetes",
    aliases: ["K8s"],
    category: "cloud",
    phaseIds: ["6"],
    lessonIds: [],
    definitions: {
      beginner:
        "A system that manages containers (packaged applications) — it decides where to run them, restarts them if they crash, and scales them up or down automatically.",
      intermediate:
        "An open-source container orchestration platform that automates deployment, scaling, and management of containerized applications. Core concepts: Pods (smallest deployable unit), Services (stable network endpoint), Deployments (desired state management), and Namespaces (logical isolation).",
      advanced:
        "Architecture: control plane (kube-apiserver, etcd, scheduler, controller-manager) and worker nodes (kubelet, kube-proxy, container runtime). The declarative model reconciles desired state (stored in etcd) with actual state via control loops. Scheduling considers resource requests/limits, affinity/anti-affinity, taints/tolerations, and topology spread constraints. Networking: every Pod gets a unique IP (CNI plugin), Services provide stable ClusterIP/NodePort/LoadBalancer endpoints, and Ingress controllers handle L7 routing. Storage: PersistentVolumes with CSI drivers. Extensibility via CRDs and operators enables domain-specific automation.",
    },
    seeAlso: ["helm-chart", "auto-scaling"],
  },
  {
    slug: "helm-chart",
    term: "Helm Chart",
    aliases: ["Helm"],
    category: "cloud",
    phaseIds: ["6"],
    lessonIds: [],
    definitions: {
      beginner:
        "A package of pre-configured Kubernetes files that makes deploying complex applications as easy as installing an app from a store.",
      intermediate:
        "A package manager for Kubernetes that bundles related manifests (Deployments, Services, ConfigMaps) into a versioned chart. Supports templating with Go templates, values files for customization, and dependency management between charts.",
      advanced:
        "A chart is a directory containing Chart.yaml (metadata, dependencies), values.yaml (default configuration), and templates/ (Go templates producing Kubernetes manifests). Helm 3 is tiller-less — it stores release state as Secrets in the target namespace. Template functions (sprig library), named templates (_helpers.tpl), and hooks (pre-install, post-upgrade) enable complex deployment logic. OCI registries store charts alongside container images. Helmfile and ArgoCD integrate Helm into GitOps workflows, rendering charts with environment-specific values.",
    },
    seeAlso: ["kubernetes", "infrastructure-as-code"],
  },
  {
    slug: "infrastructure-as-code",
    term: "Infrastructure as Code",
    aliases: ["IaC"],
    category: "cloud",
    phaseIds: ["6"],
    lessonIds: [],
    definitions: {
      beginner:
        "Managing servers, networks, and cloud resources by writing code files instead of clicking buttons in a dashboard — this makes setups repeatable and trackable.",
      intermediate:
        "The practice of defining and provisioning infrastructure through declarative configuration files (Terraform HCL, AWS CloudFormation, Pulumi). Changes are version-controlled, reviewed via PRs, and applied through CI/CD pipelines, ensuring reproducibility and auditability.",
      advanced:
        "Declarative IaC tools (Terraform, CloudFormation) maintain a state file mapping logical resources to physical ones, computing a diff (plan) before applying changes. Terraform's provider model abstracts cloud APIs; the state file enables import, drift detection, and targeted operations. Imperative/hybrid tools (Pulumi, CDK) use general-purpose languages, compiling to CloudFormation or Terraform under the hood. Best practices: remote state with locking (S3 + DynamoDB), modular composition, policy-as-code (OPA, Sentinel), and GitOps-driven apply pipelines. Challenges include state file corruption, provider version drift, and blast radius of monolithic state.",
    },
    seeAlso: ["kubernetes", "helm-chart"],
  },

  // ── AI Additional (10) ────────────────────────────────────────────────
  {
    slug: "few-shot-learning",
    term: "Few-Shot Learning",
    aliases: ["few-shot prompting", "in-context learning"],
    category: "ai",
    phaseIds: ["7"],
    lessonIds: [],
    definitions: {
      beginner:
        "Showing an AI a few examples of what you want before asking it to do the task — like showing someone two solved math problems before giving them a new one.",
      intermediate:
        "A prompting technique where several input-output examples are included in the prompt to guide the model's behavior without fine-tuning. The model generalizes the pattern from these examples. More examples generally improve accuracy up to the context window limit.",
      advanced:
        "Leverages in-context learning, where transformer attention mechanisms implicitly perform a form of gradient descent over the provided examples (as suggested by Akyürek et al., 2023). Performance depends on example diversity, ordering (recency bias), and label balance. Few-shot prompting can be formalized as conditioning on a task distribution: P(output | input, examples). Retrieval-augmented few-shot dynamically selects examples most similar to the current input, improving generalization over static example sets.",
    },
    seeAlso: ["chain-of-thought", "retrieval-augmented"],
  },
  {
    slug: "chain-of-thought",
    term: "Chain of Thought",
    aliases: ["CoT", "step-by-step reasoning"],
    category: "ai",
    phaseIds: ["7"],
    lessonIds: [],
    definitions: {
      beginner:
        "Asking an AI to show its work and think step by step — this helps it solve harder problems more accurately.",
      intermediate:
        "A prompting strategy where the model is instructed to produce intermediate reasoning steps before the final answer. Significantly improves performance on arithmetic, logic, and multi-step reasoning tasks. Can be zero-shot ('Let's think step by step') or few-shot (providing examples with reasoning traces).",
      advanced:
        "CoT prompting (Wei et al., 2022) elicits sequential reasoning by conditioning generation on intermediate tokens that decompose a problem. The emergent ability appears primarily in models above ~100B parameters. Variants include self-consistency (sample multiple CoT paths, majority vote), tree-of-thought (branching exploration), and program-of-thought (generating executable code as reasoning). CoT effectiveness correlates with the model's pretraining on reasoning-heavy corpora (math, code). Faithfulness of CoT traces (whether they reflect actual computation) remains an open research question.",
    },
    seeAlso: ["few-shot-learning"],
  },
  {
    slug: "retrieval-augmented",
    term: "Retrieval-Augmented Generation",
    aliases: ["RAG"],
    category: "ai",
    phaseIds: ["7"],
    lessonIds: [],
    definitions: {
      beginner:
        "A technique where an AI looks up relevant information from a knowledge base before answering, so its responses are grounded in real data instead of just memory.",
      intermediate:
        "An architecture that combines a retrieval system (vector search, keyword search) with a generative model. User queries are used to fetch relevant documents, which are then included in the prompt as context. Reduces hallucinations and enables the model to access up-to-date or private information.",
      advanced:
        "The RAG pipeline: query → embedding → ANN search (HNSW, IVF) over a vector store → top-k retrieval → reranking (cross-encoder) → context assembly → LLM generation with citations. Advanced patterns include multi-hop retrieval (iterative refinement), query decomposition, hypothetical document embeddings (HyDE), and fusion retrieval (combining dense and sparse signals). Chunking strategy (token-based, semantic, recursive) and chunk size critically affect retrieval precision. Evaluation: context relevance (recall@k), faithfulness (groundedness), and answer correctness as orthogonal metrics.",
    },
    seeAlso: ["cosine-similarity", "hybrid-search", "document-loader"],
  },
  {
    slug: "cosine-similarity",
    term: "Cosine Similarity",
    aliases: [],
    category: "ai",
    phaseIds: ["7"],
    lessonIds: [],
    definitions: {
      beginner:
        "A way to measure how similar two pieces of text are by comparing their numerical representations — a score of 1 means identical meaning, 0 means completely different.",
      intermediate:
        "A metric that measures the cosine of the angle between two vectors, producing a value from -1 to 1. In NLP and RAG, embedding vectors of text are compared using cosine similarity to find semantically similar documents. Widely used because it's normalized for vector magnitude.",
      advanced:
        "Defined as cos(θ) = (A · B) / (||A|| ||B||), cosine similarity is equivalent to the dot product of L2-normalized vectors. For unit-norm embeddings (common in modern models like text-embedding-3), cosine similarity equals the dot product, enabling efficient MIPS (Maximum Inner Product Search) via ANN indices. Inner product search on normalized vectors with HNSW or IVF-PQ indices achieves sub-linear query time. Limitations: it measures directional similarity, not absolute semantic distance; negative values are rare but possible with certain embedding models.",
    },
    seeAlso: ["retrieval-augmented", "bpe-tokenization"],
  },
  {
    slug: "bpe-tokenization",
    term: "BPE Tokenization",
    aliases: ["Byte Pair Encoding"],
    category: "ai",
    phaseIds: ["7"],
    lessonIds: [],
    definitions: {
      beginner:
        "The way AI models break text into smaller pieces called tokens — common words stay whole, but rare words get split into parts the model recognizes.",
      intermediate:
        "A subword tokenization algorithm that iteratively merges the most frequent adjacent byte/character pairs to build a vocabulary. Balances vocabulary size against sequence length. Used by GPT models (via tiktoken) and many other transformers. Handles unknown words by decomposing them into known subword units.",
      advanced:
        "BPE (Sennrich et al., 2016) starts with a character-level (or byte-level for GPT-2+) vocabulary and greedily merges the most frequent adjacent pair, adding the merged token to the vocabulary. Repeated until the target vocabulary size is reached (e.g., 100K for GPT-4 cl100k_base). Encoding uses a priority queue of merge rules applied left-to-right. SentencePiece implements BPE/Unigram as a language-independent model. Tokenization granularity directly impacts context window utilization — inefficient tokenization (e.g., for non-Latin scripts) wastes budget. tiktoken provides efficient O(n) encoding via a regex pre-split and byte-level BPE.",
    },
    seeAlso: ["token-budget"],
  },
  {
    slug: "rlhf",
    term: "RLHF",
    aliases: ["Reinforcement Learning from Human Feedback"],
    category: "ai",
    phaseIds: ["7"],
    lessonIds: [],
    definitions: {
      beginner:
        "A training technique where humans rate an AI's responses, and the AI learns to give better answers based on that feedback — like a student improving from teacher corrections.",
      intermediate:
        "A fine-tuning method where a reward model is trained on human preference data (comparisons between model outputs), then used to optimize the language model via reinforcement learning (PPO). Aligns model behavior with human values and preferences beyond what supervised fine-tuning achieves.",
      advanced:
        "The RLHF pipeline: (1) supervised fine-tuning on demonstrations, (2) reward model training on human comparisons (Bradley-Terry model), (3) RL optimization (PPO) maximizing reward while penalizing KL divergence from the SFT policy. DPO (Direct Preference Optimization) simplifies this by deriving an equivalent closed-form loss that trains directly on preferences without a separate reward model. Challenges include reward hacking (model exploits reward model weaknesses), distribution shift between RM training and RL generation, and the cost/noise of human annotation. Constitutional AI offers a scalable alternative using AI-generated feedback.",
    },
    seeAlso: ["constitutional-ai", "training-data-ai"],
  },
  {
    slug: "constitutional-ai",
    term: "Constitutional AI",
    aliases: ["CAI"],
    category: "ai",
    phaseIds: ["7"],
    lessonIds: [],
    definitions: {
      beginner:
        "A method where an AI is given a set of principles (a 'constitution') and learns to follow them, reducing the need for humans to review every response.",
      intermediate:
        "An alignment technique developed by Anthropic where the model critiques and revises its own outputs based on a set of written principles. Reduces reliance on human feedback by using AI-generated feedback (RLAIF) guided by constitutional principles covering helpfulness, harmlessness, and honesty.",
      advanced:
        "CAI (Bai et al., 2022) operates in two phases: (1) supervised learning — the model generates responses, then critiques/revises them based on constitutional principles, producing a refined SFT dataset; (2) RLAIF — the model generates preference pairs judged by an AI evaluator against the constitution, training a reward model without human labels. This enables scalable alignment while making the value system explicit and auditable. The constitution can be updated without retraining the base model, providing a governance mechanism. Composing multiple principles requires careful balancing to avoid conflicts.",
    },
    seeAlso: ["rlhf"],
  },
  {
    slug: "model-distillation",
    term: "Model Distillation",
    aliases: ["knowledge distillation"],
    category: "ai",
    phaseIds: ["7"],
    lessonIds: [],
    definitions: {
      beginner:
        "Training a small, fast AI model to mimic a large, smart one — the small model learns from the big model's answers rather than from scratch.",
      intermediate:
        "A technique where a smaller 'student' model is trained to reproduce the outputs (or intermediate representations) of a larger 'teacher' model. The student learns from the teacher's soft probability distributions, capturing richer information than hard labels alone. Produces models suitable for deployment where latency and cost matter.",
      advanced:
        "Hinton et al. (2015) introduced training on softened teacher logits (temperature-scaled softmax). Modern LLM distillation variants: (1) output distillation — student trained on teacher-generated completions (black-box), (2) logit distillation — student matches teacher token probabilities (white-box, requires teacher logits), (3) feature distillation — aligning intermediate representations. Distillation can be combined with quantization and pruning. For LLMs, generating high-quality synthetic training data from a teacher model is the dominant approach, as API-only access precludes logit-level distillation. Legal/ToS implications of distilling from proprietary models are an active concern.",
    },
    seeAlso: ["quantization-ai", "inference-optimization"],
  },
  {
    slug: "quantization-ai",
    term: "Quantization",
    aliases: ["model quantization"],
    category: "ai",
    phaseIds: ["7"],
    lessonIds: [],
    definitions: {
      beginner:
        "Shrinking an AI model by using less precise numbers to store its data — like rounding to fewer decimal places so it runs faster and uses less memory.",
      intermediate:
        "Reducing a model's numerical precision from 32-bit or 16-bit floating point to lower-bit representations (8-bit, 4-bit). Decreases memory footprint and inference latency with minimal quality loss. Post-training quantization (PTQ) is applied after training; quantization-aware training (QAT) accounts for precision loss during training.",
      advanced:
        "PTQ methods: RTN (round-to-nearest), GPTQ (layer-wise optimal quantization using second-order information), AWQ (activation-aware weight quantization preserving salient channels), and SqueezeLLM (non-uniform quantization with sparse outlier storage). QAT simulates quantization noise during training via straight-through estimators. Precision formats: INT8, INT4, NF4 (QLoRA's normalized float), FP8 (E4M3/E5M2 in H100). GGUF format (llama.cpp) supports mixed quantization (different bits per layer). Key trade-off: perplexity degradation vs. throughput gain. 4-bit quantization typically preserves >95% of FP16 quality for large models.",
    },
    seeAlso: ["model-distillation", "inference-optimization"],
  },
  {
    slug: "inference-optimization",
    term: "Inference Optimization",
    aliases: ["serving optimization"],
    category: "ai",
    phaseIds: ["7"],
    lessonIds: [],
    definitions: {
      beginner:
        "Techniques to make AI models respond faster and cheaper when people use them — like tuning a car engine for better performance.",
      intermediate:
        "Methods to reduce the latency and cost of running model predictions. Includes KV-cache reuse, continuous batching, speculative decoding, quantization, and optimized attention implementations (FlashAttention). Critical for serving models at scale.",
      advanced:
        "Key optimizations: (1) KV-cache — stores key/value tensors from prior tokens, converting O(n²) recomputation to O(n) per step; PagedAttention (vLLM) manages KV-cache as virtual memory pages to eliminate fragmentation. (2) Continuous/dynamic batching — inflight scheduling that adds new requests to the batch as earlier ones complete, maximizing GPU utilization. (3) Speculative decoding — a small draft model proposes tokens verified in parallel by the target model, achieving 2-3x speedup without quality loss. (4) FlashAttention — tiling attention computation to stay in SRAM, reducing HBM bandwidth bottleneck. (5) Tensor parallelism and pipeline parallelism for multi-GPU serving. Frameworks: vLLM, TensorRT-LLM, TGI.",
    },
    seeAlso: ["quantization-ai", "model-serving"],
  },

  // ── RAG/Agents Additional (10) ────────────────────────────────────────
  {
    slug: "document-loader",
    term: "Document Loader",
    aliases: ["data loader"],
    category: "ai",
    phaseIds: ["7"],
    lessonIds: [],
    definitions: {
      beginner:
        "A tool that reads documents in various formats (PDF, HTML, Word) and converts them into plain text that an AI can process.",
      intermediate:
        "A component in a RAG pipeline that ingests documents from various sources (files, URLs, APIs, databases) and converts them into a standardized text format with metadata. Handles format-specific parsing: PDF extraction, HTML cleaning, OCR for images, and structured data flattening.",
      advanced:
        "Document loaders abstract source-specific I/O and parsing: Unstructured.io handles multi-format extraction with layout detection (hi-res mode using detectron2); PDF parsers vary from text-layer extraction (pdfminer, pypdf) to vision-based (marker, nougat for academic papers). Metadata extraction (title, date, source URL, page number) is critical for downstream filtering and citation. Loaders must handle encoding detection, deduplication, incremental updates (change detection via hashing), and error recovery for malformed documents. LangChain and LlamaIndex provide standardized loader interfaces.",
    },
    seeAlso: ["text-splitter", "retrieval-augmented"],
  },
  {
    slug: "text-splitter",
    term: "Text Splitter",
    aliases: ["chunker", "document chunker"],
    category: "ai",
    phaseIds: ["7"],
    lessonIds: [],
    definitions: {
      beginner:
        "A tool that breaks long documents into smaller, overlapping pieces so an AI can search through them effectively.",
      intermediate:
        "A component that divides documents into chunks suitable for embedding and retrieval. Strategies include fixed-size (token count), recursive character splitting (respecting paragraph/sentence boundaries), and semantic splitting (detecting topic shifts). Chunk size and overlap significantly affect retrieval quality.",
      advanced:
        "Chunking strategies: (1) fixed-size with overlap — simple but breaks mid-sentence; (2) recursive character — splits by paragraph, then sentence, then word, preserving structure; (3) semantic — uses embedding similarity between adjacent segments to detect topic boundaries (Greg Kamradt's approach); (4) document-structure-aware — leverages headings, code blocks, and list structure from markdown/HTML. Optimal chunk size depends on the embedding model's context window, retrieval granularity needs, and the LLM's ability to synthesize across chunks. Metadata propagation (parent document ID, section hierarchy, page number) from the original document to each chunk enables parent-document retrieval and citation.",
    },
    seeAlso: ["document-loader", "parent-document-retrieval"],
  },
  {
    slug: "hybrid-search",
    term: "Hybrid Search",
    aliases: ["hybrid retrieval"],
    category: "ai",
    phaseIds: ["7"],
    lessonIds: [],
    definitions: {
      beginner:
        "Combining keyword search (exact word matching) with AI-powered semantic search (meaning matching) to find the most relevant results.",
      intermediate:
        "A retrieval approach that combines sparse retrieval (BM25/TF-IDF keyword matching) with dense retrieval (vector similarity search) and fuses the results. Captures both exact keyword matches and semantic meaning, outperforming either method alone for most RAG use cases.",
      advanced:
        "Typically implemented as parallel retrieval followed by score fusion: Reciprocal Rank Fusion (RRF) merges ranked lists without requiring score normalization; Convex Combination Fusion (CCF) weights normalized scores from each retriever. BM25 excels at exact matches, acronyms, and rare terms; dense retrieval captures paraphrases and semantic similarity. Cross-encoder reranking on the fused candidate set further improves precision. Vector databases (Weaviate, Qdrant, Pinecone) and search engines (Elasticsearch with kNN, OpenSearch) increasingly support hybrid search natively. Sparse learned models (SPLADE) offer a middle ground by learning term importance weights.",
    },
    seeAlso: ["retrieval-augmented", "maximal-marginal-relevance"],
  },
  {
    slug: "maximal-marginal-relevance",
    term: "Maximal Marginal Relevance",
    aliases: ["MMR"],
    category: "ai",
    phaseIds: ["7"],
    lessonIds: [],
    definitions: {
      beginner:
        "A technique that picks search results that are both relevant to your question AND different from each other, so you don't get five results that all say the same thing.",
      intermediate:
        "A retrieval reranking algorithm that balances relevance (similarity to the query) with diversity (dissimilarity to already-selected results). Controlled by a lambda parameter: λ=1 maximizes relevance only; λ=0 maximizes diversity. Prevents redundant chunks from consuming the LLM's context window.",
      advanced:
        "MMR (Carbonell & Goldstein, 1998): iteratively selects the document maximizing λ·sim(doc, query) - (1-λ)·max(sim(doc, selected_docs)). Computationally O(k·n) for selecting k documents from n candidates. In RAG pipelines, MMR is applied after initial retrieval (top-50 → MMR-selected top-5) to maximize information density in the prompt. The optimal λ is task-dependent: factual QA benefits from higher relevance weight; summarization benefits from more diversity. Some vector databases (Chroma, LangChain's vectorstore interface) implement MMR as a built-in retrieval mode.",
    },
    seeAlso: ["hybrid-search", "retrieval-augmented"],
  },
  {
    slug: "parent-document-retrieval",
    term: "Parent Document Retrieval",
    aliases: ["small-to-big retrieval"],
    category: "ai",
    phaseIds: ["7"],
    lessonIds: [],
    definitions: {
      beginner:
        "A search technique that finds the best small chunk of text, then sends the larger surrounding section to the AI for more context — like finding a sentence in a book and then reading the whole page.",
      intermediate:
        "A retrieval strategy that embeds small chunks for precision but returns their parent documents (or larger surrounding chunks) as context. Small chunks improve embedding precision; larger context gives the LLM more information to work with. Requires maintaining a mapping between child chunks and parent documents.",
      advanced:
        "Implementation: documents are split into small chunks (e.g., 200 tokens) for embedding, each tagged with a parent_id referencing a larger chunk (e.g., 2000 tokens) stored in a document store. At retrieval time, small chunks are matched via vector search, deduplicated by parent_id, and the corresponding parent chunks are returned. Variants include multi-level hierarchies (sentence → paragraph → section) and windowed expansion (return N chunks surrounding the match). LangChain's ParentDocumentRetriever and LlamaIndex's AutoMergingRetriever implement this pattern. Key trade-off: context relevance vs. context size — larger parents risk diluting signal.",
    },
    seeAlso: ["text-splitter", "retrieval-augmented"],
  },
  {
    slug: "agent-loop",
    term: "Agent Loop",
    aliases: ["agentic loop", "agent execution loop"],
    category: "ai",
    phaseIds: ["7"],
    lessonIds: [],
    definitions: {
      beginner:
        "The cycle an AI agent follows: think about what to do, use a tool to take action, observe the result, and repeat until the task is complete.",
      intermediate:
        "The core execution pattern of an AI agent: the model receives a goal, reasons about the next step, selects and executes a tool/action, observes the result, and loops until the task is complete or a termination condition is met. Each iteration adds to the conversation context.",
      advanced:
        "The agent loop implements a closed-loop control system: observe(state) → reason(state, goal) → act(tool_call) → update(state, observation) → terminate_or_continue. Key design decisions: (1) context management — summarizing or truncating history to fit the context window; (2) error recovery — retrying failed tool calls, reprompting on malformed output; (3) termination — max iterations, confidence threshold, or explicit 'task complete' signal; (4) planning — single-step reactive (ReAct) vs. multi-step planning (Plan-and-Solve). Token cost grows linearly per iteration; techniques like trajectory compression and checkpoint/resume reduce cost for long-running agents.",
    },
    seeAlso: ["react-pattern-ai", "tool-definition"],
  },
  {
    slug: "react-pattern-ai",
    term: "ReAct Pattern",
    aliases: ["Reason+Act"],
    category: "ai",
    phaseIds: ["7"],
    lessonIds: [],
    definitions: {
      beginner:
        "An AI approach where the model alternates between thinking out loud (reasoning) and doing something (acting) — the reasoning helps it make better decisions about what to do next.",
      intermediate:
        "A prompting framework (Yao et al., 2022) where the model alternates between Thought (reasoning about the current state), Action (calling an external tool), and Observation (receiving the tool's output). Combines chain-of-thought reasoning with tool use for grounded, multi-step problem solving.",
      advanced:
        "ReAct interleaves reasoning traces and actions in a single generation: Thought → Action[tool_name(args)] → Observation[result] → Thought → ... The reasoning trace provides interpretability and helps the model plan, while actions ground the computation in external data. Compared to pure CoT (no grounding) or pure Act (no reasoning), ReAct reduces hallucination on knowledge-intensive tasks and improves success rates on decision-making tasks. Modern implementations (LangChain agents, Claude tool use) structure this as function-calling with optional chain-of-thought, letting the model format tool calls as structured JSON rather than free-text action strings.",
    },
    seeAlso: ["agent-loop", "chain-of-thought"],
  },
  {
    slug: "tool-definition",
    term: "Tool Definition",
    aliases: ["function definition", "tool schema"],
    category: "ai",
    phaseIds: ["7"],
    lessonIds: [],
    definitions: {
      beginner:
        "A description you give to an AI agent explaining what a tool does and what inputs it needs — like an instruction manual that tells the AI how to use the tool.",
      intermediate:
        "A structured specification (typically JSON Schema) that describes a tool's name, purpose, required/optional parameters, and return format. The LLM uses these definitions to decide when and how to call tools. Clear, descriptive schemas with examples improve tool selection accuracy.",
      advanced:
        "Tool definitions are provided as part of the system prompt or via a dedicated tool-use API (Anthropic tool use, OpenAI function calling). The schema includes name, description (critical for selection — the model uses this to match intent), input_schema (JSON Schema with property descriptions, types, enums, required fields), and optionally output_schema. Best practices: use descriptive names and detailed descriptions, constrain parameters with enums where possible, include examples in descriptions, separate read vs. write tools, and keep the tool count manageable (tool selection accuracy degrades with >20-30 tools — use tool routing or hierarchical tool menus).",
    },
    seeAlso: ["agent-loop", "mcp-resource"],
  },
  {
    slug: "mcp-resource",
    term: "MCP Resource",
    aliases: ["Model Context Protocol resource"],
    category: "ai",
    phaseIds: ["7"],
    lessonIds: [],
    definitions: {
      beginner:
        "A piece of data (like a file or database record) that an AI can access through the Model Context Protocol — resources let AI read information from external systems.",
      intermediate:
        "A data endpoint exposed by an MCP server that provides context to AI models. Resources are identified by URIs and can be static (file contents, configuration) or dynamic (database queries, API responses). Unlike tools, resources are read-only and are typically loaded into the model's context automatically or on request.",
      advanced:
        "MCP resources follow a URI-based addressing scheme (e.g., file:///path, db://table/id) and support both direct resources (concrete URI) and resource templates (URI with parameters). Resources have MIME types for content negotiation and can return text or binary (base64-encoded) content. Subscription-based resources notify the client of changes. Resources complement tools: resources provide passive context (the model reads them), while tools enable active operations (the model invokes them). Server-side, resources are registered via server.resources.list and server.resources.read handlers, with optional change notification via server.resources.subscribe.",
    },
    seeAlso: ["mcp-transport", "tool-definition"],
  },
  {
    slug: "mcp-transport",
    term: "MCP Transport",
    aliases: ["Model Context Protocol transport"],
    category: "ai",
    phaseIds: ["7"],
    lessonIds: [],
    definitions: {
      beginner:
        "The communication channel between an AI application and an MCP server — it defines how messages are sent back and forth, like choosing between a phone call and a letter.",
      intermediate:
        "The communication layer of the Model Context Protocol that carries JSON-RPC 2.0 messages between client and server. Standard transports include stdio (for local process communication) and HTTP with Server-Sent Events (for remote servers). The transport is independent of the protocol logic above it.",
      advanced:
        "MCP defines a transport-agnostic protocol over JSON-RPC 2.0 with two standard transports: (1) stdio — client spawns the server as a subprocess, communicating via stdin/stdout with newline-delimited JSON; low-latency, no network setup, ideal for local tools. (2) Streamable HTTP — client sends requests via HTTP POST to a single endpoint; server responds with SSE streams for streaming results and server-initiated messages. Supports session management via Mcp-Session-Id headers and optional session resumability. The transport layer handles message framing, connection lifecycle, and reconnection. Custom transports can be implemented by conforming to the Transport interface (send, receive, close).",
    },
    seeAlso: ["mcp-resource", "tool-definition"],
  },

  // ── Fine-tuning/Production (10) ───────────────────────────────────────
  {
    slug: "training-data-ai",
    term: "Training Data",
    aliases: ["fine-tuning data", "training dataset"],
    category: "ai",
    phaseIds: ["7"],
    lessonIds: [],
    definitions: {
      beginner:
        "The examples used to teach an AI model — like textbook problems that help a student learn. Better examples lead to a better model.",
      intermediate:
        "The curated dataset used to train or fine-tune a model, consisting of input-output pairs that demonstrate the desired behavior. Data quality (accuracy, diversity, consistency) matters more than quantity. Common formats include JSONL with instruction/response pairs and conversation arrays.",
      advanced:
        "Training data for LLM fine-tuning follows provider-specific schemas: OpenAI uses {messages: [{role, content}]} in JSONL; Anthropic accepts similar conversation formats. Key data engineering concerns: (1) decontamination — removing eval set overlaps; (2) deduplication — exact and near-duplicate removal (MinHash, SimHash); (3) quality filtering — perplexity-based, classifier-based, or LLM-as-judge scoring; (4) balance — representing edge cases and minority classes; (5) formatting consistency — uniform system prompts, output structures. Data flywheel: production logs → human review → filtered training set → fine-tuned model → better production outputs. Synthetic data generation from stronger models augments human-authored data.",
    },
    seeAlso: ["jsonl-format", "rlhf"],
  },
  {
    slug: "jsonl-format",
    term: "JSONL Format",
    aliases: ["JSON Lines", "newline-delimited JSON"],
    category: "ai",
    phaseIds: ["7"],
    lessonIds: [],
    definitions: {
      beginner:
        "A simple file format where each line is a separate JSON object — used to store training data for AI models because it's easy to read one example at a time.",
      intermediate:
        "A text format where each line is a valid JSON object, separated by newlines. Standard format for ML training data, API batch inputs, and log files. Advantages over JSON arrays: streaming reads without loading the entire file, easy concatenation, and line-level parallelism.",
      advanced:
        "JSONL (JSON Lines, jsonlines.org) uses UTF-8 encoding with \\n line separators. Each line must be a self-contained JSON value (typically an object). For LLM fine-tuning: OpenAI expects {messages: [{role: 'system'|'user'|'assistant', content: string}]} per line; validation includes format checking, token counting, and cost estimation. Processing patterns: streaming with line-by-line parsing (avoids OOM for large datasets), GNU parallel for multi-core processing, and memory-mapped I/O for random access. JSONL's append-only nature makes it ideal for data pipelines: each stage reads, transforms, and writes to the next JSONL file.",
    },
    seeAlso: ["training-data-ai"],
  },
  {
    slug: "adapter-layer",
    term: "Adapter Layer",
    aliases: ["LoRA", "low-rank adapter"],
    category: "ai",
    phaseIds: ["7"],
    lessonIds: [],
    definitions: {
      beginner:
        "A small add-on that modifies an AI model's behavior without changing the whole model — like adding a lens filter to a camera instead of buying a new camera.",
      intermediate:
        "A parameter-efficient fine-tuning technique that inserts small trainable layers into a frozen base model. LoRA (Low-Rank Adaptation) decomposes weight updates into two small matrices, reducing trainable parameters by 1000x while achieving comparable quality to full fine-tuning.",
      advanced:
        "LoRA (Hu et al., 2021) represents weight updates as ΔW = BA where B ∈ ℝ^(d×r) and A ∈ ℝ^(r×k), with rank r << min(d,k). Only A and B are trained; the base model stays frozen. QLoRA (Dettmers et al., 2023) combines LoRA with 4-bit NF4 quantization of the base model, enabling fine-tuning of 65B models on a single 48GB GPU. Adapters can be hot-swapped at serving time (vLLM, LoRAX) for multi-tenant deployment — one base model serves multiple fine-tuned variants. Hyperparameters: rank (4-64), alpha (scaling factor, typically 2×rank), target modules (attention Q/K/V/O, MLP). Higher ranks capture more complex adaptations but increase memory and risk overfitting.",
    },
    seeAlso: ["training-data-ai", "quantization-ai"],
  },
  {
    slug: "huggingface-transformers",
    term: "Hugging Face Transformers",
    aliases: ["transformers library", "HF"],
    category: "ai",
    phaseIds: ["7"],
    lessonIds: [],
    definitions: {
      beginner:
        "A popular open-source library and community hub where you can download, use, and share AI models — like an app store for machine learning.",
      intermediate:
        "An open-source Python library providing thousands of pre-trained models for NLP, vision, and audio tasks. The unified API (AutoModel, AutoTokenizer, pipeline) supports loading models from the Hugging Face Hub. Integrates with PyTorch, TensorFlow, and JAX. The Hub hosts models, datasets, and Spaces (demo apps).",
      advanced:
        "The Transformers library provides a model-agnostic abstraction: AutoClass dispatchers select the correct architecture from config.json. Model weights are stored as safetensors (safe, fast, memory-mappable) or PyTorch state_dicts. The Trainer class wraps training loops with gradient accumulation, mixed precision (AMP), distributed training (FSDP, DeepSpeed), and evaluation. PEFT integration adds LoRA/QLoRA. Accelerate handles multi-GPU/TPU distribution. The Hub uses Git-LFS for model versioning, supports gated models (license-protected access), and provides inference endpoints for serverless deployment. Model cards document capabilities, limitations, and bias assessments.",
    },
    seeAlso: ["adapter-layer", "model-serving"],
  },
  {
    slug: "model-serving",
    term: "Model Serving",
    aliases: ["inference serving", "model deployment"],
    category: "ai",
    phaseIds: ["7"],
    lessonIds: [],
    definitions: {
      beginner:
        "Running an AI model on a server so applications can send it questions and get answers back — turning a trained model into a usable service.",
      intermediate:
        "The infrastructure for deploying trained models as API endpoints. Handles request batching, GPU scheduling, model loading, health checks, and autoscaling. Frameworks include vLLM, TGI (Text Generation Inference), TensorRT-LLM, and Triton Inference Server. Key metrics: latency (time to first token, time per output token), throughput (tokens/second), and GPU utilization.",
      advanced:
        "Production serving requires: (1) efficient batching — continuous batching (iteration-level scheduling) outperforms static batching by 10-20x; (2) KV-cache management — PagedAttention (vLLM) eliminates memory fragmentation; (3) model parallelism — tensor parallelism across GPUs within a node, pipeline parallelism across nodes; (4) quantization — INT8/INT4 for reduced memory and compute; (5) speculative decoding for latency reduction. Deployment patterns: single-model (vLLM, TGI), multi-model (Triton with model repository), or multi-LoRA (one base model, many adapters). Scaling: GPU-aware autoscaling based on queue depth and latency percentiles. Observability: token-level metrics, request traces, and GPU telemetry (nvitop, DCGM).",
    },
    seeAlso: ["inference-optimization", "ai-gateway"],
  },
  {
    slug: "token-budget",
    term: "Token Budget",
    aliases: ["context budget", "token limit"],
    category: "ai",
    phaseIds: ["7"],
    lessonIds: [],
    definitions: {
      beginner:
        "The maximum amount of text an AI model can handle in a single conversation — you need to fit your question, context, and the answer all within this limit.",
      intermediate:
        "The total context window available for a request, shared between input tokens (system prompt, user message, retrieved context) and output tokens (model response). Managing the budget involves prioritizing the most relevant context, truncating or summarizing less important content, and reserving space for the model's response.",
      advanced:
        "Token budget management is a core RAG engineering challenge. Budget allocation: system prompt (fixed) + retrieved context (variable, largest portion) + conversation history (compressed or windowed) + output reservation. Optimization techniques: (1) dynamic retrieval — retrieve fewer chunks for simple queries; (2) context compression — LLMLingua, extractive summarization, or map-reduce over chunks; (3) tiered context — primary context (high relevance) in-prompt, secondary context available via tools; (4) caching — prompt caching (Anthropic, OpenAI) amortizes input token costs for repeated prefixes. Cost model: total cost = input_tokens × input_price + output_tokens × output_price; input is typically 3-10x cheaper than output.",
    },
    seeAlso: ["bpe-tokenization", "prompt-caching"],
  },
  {
    slug: "prompt-caching",
    term: "Prompt Caching",
    aliases: ["context caching", "prefix caching"],
    category: "ai",
    phaseIds: ["7"],
    lessonIds: [],
    definitions: {
      beginner:
        "A way to save money and speed up AI responses by reusing the processing of repeated parts of your prompt — the AI remembers the common parts instead of re-reading them every time.",
      intermediate:
        "A provider feature that caches the processed representation of a prompt prefix so subsequent requests sharing that prefix skip redundant computation. Reduces latency (up to 85%) and cost (cached tokens billed at a discount). Available in Anthropic (automatic for >1024 tokens) and OpenAI (automatic for >1024 tokens) APIs.",
      advanced:
        "Caching operates on the KV-cache: the provider stores the key-value tensors computed for the static prefix, so only the new suffix tokens require a forward pass. Anthropic's implementation uses cache breakpoints and charges a write-once premium (25% surcharge) with subsequent reads at 90% discount. Effective strategies: place static content (system prompt, tool definitions, large reference documents) at the beginning of the prompt; append variable content (user query, conversation history) at the end. Cache TTL (typically 5 minutes of inactivity) means high-frequency applications benefit most. For RAG: caching the system prompt + tool definitions saves ~1-2K tokens of recomputation per request.",
    },
    seeAlso: ["token-budget", "inference-optimization"],
  },
  {
    slug: "ai-gateway",
    term: "AI Gateway",
    aliases: ["LLM gateway", "AI proxy"],
    category: "ai",
    phaseIds: ["7"],
    lessonIds: [],
    definitions: {
      beginner:
        "A middleman service between your application and AI providers that handles things like rate limiting, retries, and switching between providers — so your app stays reliable even if one AI service has problems.",
      intermediate:
        "A proxy layer between applications and LLM providers that centralizes concerns like API key management, rate limiting, cost tracking, caching, fallback routing, and observability. Enables switching providers without application changes. Examples: LiteLLM, Portkey, Cloudflare AI Gateway.",
      advanced:
        "An AI gateway implements: (1) unified API — translates between provider-specific formats (OpenAI, Anthropic, Bedrock, Vertex) behind a common interface; (2) resilience — retry with exponential backoff, circuit breaking per provider, automatic failover to alternate models; (3) governance — per-tenant rate limiting, cost budgets, content policy enforcement; (4) observability — request/response logging, token usage tracking, latency percentiles, cost attribution; (5) optimization — semantic caching (cache responses for similar queries via embedding similarity), prompt routing (direct simple queries to cheaper models). Production architectures often combine a gateway with an evaluation layer that scores response quality for continuous monitoring.",
    },
    seeAlso: ["model-routing", "model-serving"],
  },
  {
    slug: "content-moderation",
    term: "Content Moderation",
    aliases: ["safety filter", "guardrails"],
    category: "ai",
    phaseIds: ["7"],
    lessonIds: [],
    definitions: {
      beginner:
        "Safety systems that check what goes into and comes out of an AI model to block harmful, inappropriate, or policy-violating content.",
      intermediate:
        "Input and output filtering layers that detect and block harmful content in AI applications. Input moderation screens user prompts for jailbreak attempts, PII, and policy violations. Output moderation checks model responses for harmful content, hallucinations, and data leakage. Implemented via classifier models, rule-based filters, or LLM-as-judge.",
      advanced:
        "A multi-layered defense: (1) input classifiers — detect prompt injection (fine-tuned models like PromptGuard, Rebuff), PII (regex + NER models), and content policy violations (OpenAI moderation endpoint, Perspective API); (2) system prompt hardening — clear boundaries, input/output delimiters, instruction hierarchy; (3) output validation — topic adherence scoring, factual grounding checks against retrieved context, structured output validation (JSON schema conformance); (4) LLM-as-judge — a separate model evaluates the primary model's output against safety criteria. NeMo Guardrails and Guardrails AI provide declarative frameworks. Key challenge: balancing safety (low false-negative rate) with usability (low false-positive rate).",
    },
    seeAlso: ["constitutional-ai", "ai-gateway"],
  },
  {
    slug: "model-routing",
    term: "Model Routing",
    aliases: ["LLM routing", "model selection"],
    category: "ai",
    phaseIds: ["7"],
    lessonIds: [],
    definitions: {
      beginner:
        "Automatically choosing the best AI model for each request — simple questions go to a fast, cheap model while complex questions go to a powerful, expensive one.",
      intermediate:
        "A system that dynamically selects the optimal model for each request based on task complexity, cost constraints, latency requirements, or content type. A lightweight classifier or heuristic routes simple queries to smaller models and complex ones to larger models, optimizing the cost-quality trade-off.",
      advanced:
        "Model routing strategies: (1) classifier-based — a small model (BERT-class) predicts task difficulty and routes accordingly; (2) cascade — try the cheapest model first, escalate to larger models if confidence is below a threshold (measured by logprobs, self-consistency, or a verifier); (3) semantic routing — embed the query and match against route descriptions (Semantic Router library); (4) capability-based — route by detected task type (code → code-specialized model, math → reasoning model). Production systems combine routing with fallback (if the primary model is overloaded) and A/B testing (evaluate new models on a traffic slice). Metrics: cost per query, quality at each tier (eval scores), routing accuracy (fraction of queries correctly assigned). The routing model itself must be extremely fast (<10ms) to avoid adding latency.",
    },
    seeAlso: ["ai-gateway", "inference-optimization"],
  },
];
