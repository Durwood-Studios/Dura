import type { AssessmentQuestion } from "@/types/assessment";

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
    phaseId: "5",
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

export const PHASE_5_QUESTIONS: AssessmentQuestion[] = [
  // ── Module 5-1: Operating Systems ────────────────────────────────────────
  q(
    "5-1-q1",
    "5-1",
    "multiple-choice",
    "What is the primary role of a kernel in an operating system?",
    [
      "Render the graphical desktop",
      "Manage hardware resources and provide system calls to user-space programs",
      "Compile user programs into machine code",
      "Handle network packet routing",
    ],
    1,
    "The kernel sits between hardware and user-space. It manages CPU scheduling, memory, I/O, and exposes system calls — the interface through which programs request OS services.",
    "easy",
    ["kernel", "os", "system-calls"]
  ),
  q(
    "5-1-q2",
    "5-1",
    "multiple-choice",
    "What happens when a process calls fork() in Linux?",
    [
      "A new thread is created sharing the same address space",
      "The process terminates and is replaced by a child process",
      "A copy-on-write duplicate of the calling process is created",
      "The process is moved to the background",
    ],
    2,
    "fork() creates a child process that is an exact copy of the parent. Linux uses copy-on-write — pages are shared until either process writes, then a private copy is made.",
    "medium",
    ["process", "fork", "copy-on-write"]
  ),
  q(
    "5-1-q3",
    "5-1",
    "multiple-choice",
    "What is the difference between a process and a thread?",
    [
      "Processes are faster than threads",
      "Threads share the address space of their process; processes have isolated address spaces",
      "Threads run on separate CPUs; processes share a CPU",
      "There is no difference — they are synonyms",
    ],
    1,
    "Threads within a process share heap, code, and globals. Processes have independent virtual address spaces. Threads are lighter to create but share memory — requiring synchronization.",
    "easy",
    ["process", "thread", "concurrency"]
  ),
  q(
    "5-1-q4",
    "5-1",
    "multiple-choice",
    "What is a page fault?",
    [
      "A bug caused by writing to a null pointer",
      "An error in the CPU cache",
      "The OS routine that loads a page from disk when it is not in physical memory",
      "A network packet loss event",
    ],
    2,
    "Virtual memory lets processes address more memory than physically exists. When they access a page not currently in RAM, the MMU raises a page fault interrupt — the OS loads the page from disk and resumes execution.",
    "medium",
    ["virtual-memory", "paging", "page-fault"]
  ),
  q(
    "5-1-q5",
    "5-1",
    "multiple-choice",
    "Which CPU scheduling algorithm minimizes average waiting time?",
    [
      "First-Come First-Served (FCFS)",
      "Round Robin",
      "Shortest Job First (SJF)",
      "Priority Scheduling",
    ],
    2,
    "SJF gives the CPU to the process with the shortest next burst. Mathematically it minimizes average waiting time. The downside: you must predict burst length, and long processes can starve.",
    "medium",
    ["scheduling", "sjf", "cpu"]
  ),
  q(
    "5-1-q6",
    "5-1",
    "multiple-choice",
    "What condition is NOT required for deadlock to occur?",
    ["Mutual exclusion", "Hold and wait", "Preemption", "Circular wait"],
    2,
    "Deadlock requires four conditions: mutual exclusion, hold-and-wait, no preemption, and circular wait. Preemption (being able to take a resource away) prevents deadlock — its absence is a required condition.",
    "medium",
    ["deadlock", "synchronization", "mutex"]
  ),
  q(
    "5-1-q7",
    "5-1",
    "multiple-choice",
    "What does an inode store in a Unix file system?",
    [
      "The file's name and content",
      "File metadata (permissions, size, timestamps, block pointers) but not the file name",
      "Only the file name",
      "The directory listing",
    ],
    1,
    "Inodes store metadata and pointers to data blocks. File names live in directory entries that map names to inode numbers — so one file can have multiple names (hard links) pointing to the same inode.",
    "medium",
    ["inode", "file-system", "unix"]
  ),
  q(
    "5-1-q8",
    "5-1",
    "multiple-choice",
    "What is DMA (Direct Memory Access)?",
    [
      "A cache replacement policy",
      "Hardware that transfers data between devices and memory without CPU involvement",
      "A memory allocation algorithm",
      "A CPU instruction for fast memory copy",
    ],
    1,
    "DMA controllers transfer data (disk reads, network packets) directly to/from RAM, freeing the CPU to do other work. The CPU initiates the transfer and gets an interrupt when it completes.",
    "medium",
    ["dma", "io", "interrupt"]
  ),
  q(
    "5-1-q9",
    "5-1",
    "multiple-choice",
    "What does strace do?",
    [
      "Traces network packets in real time",
      "Profiles CPU usage of a process",
      "Intercepts and logs system calls made by a process",
      "Displays the call stack on a crash",
    ],
    2,
    "strace attaches to a process and prints every system call it makes — open(), read(), write(), socket(), etc. — along with arguments and return values. Essential for debugging unexpected OS interactions.",
    "easy",
    ["strace", "system-calls", "debugging"]
  ),
  q(
    "5-1-q10",
    "5-1",
    "multiple-choice",
    "In the context of semaphores, what does sem_wait() (P operation) do?",
    [
      "Signals that a resource has been released",
      "Decrements the semaphore count, blocking if it would go below zero",
      "Terminates the process if the semaphore is locked",
      "Increases the semaphore count",
    ],
    1,
    "sem_wait() (P/down) decrements the semaphore. If the count was 0, the calling thread blocks until another thread calls sem_post(). Used to control access to limited resources.",
    "hard",
    ["semaphore", "synchronization", "blocking"]
  ),

  // ── Module 5-2: Computer Networking ──────────────────────────────────────
  q(
    "5-2-q1",
    "5-2",
    "multiple-choice",
    "In the TCP/IP model, which layer handles end-to-end delivery between applications?",
    [
      "Network layer (IP)",
      "Transport layer (TCP/UDP)",
      "Link layer (Ethernet)",
      "Application layer (HTTP)",
    ],
    1,
    "The transport layer provides end-to-end communication. TCP adds reliability, ordering, and flow control. UDP provides connectionless datagrams. IP (network layer) handles host-to-host routing, not port-to-port.",
    "easy",
    ["tcp-ip", "transport-layer", "networking"]
  ),
  q(
    "5-2-q2",
    "5-2",
    "multiple-choice",
    "What is the purpose of TCP's three-way handshake?",
    [
      "To encrypt data before transfer",
      "To negotiate MTU size",
      "To establish a connection and synchronize sequence numbers",
      "To authenticate both endpoints",
    ],
    2,
    "SYN → SYN-ACK → ACK. Each side advertises its initial sequence number so both can track bytes in flight. Establishes state before data flows — enabling reliable, ordered delivery.",
    "easy",
    ["tcp", "handshake", "connection"]
  ),
  q(
    "5-2-q3",
    "5-2",
    "multiple-choice",
    "Why is UDP preferred over TCP for live video streaming?",
    [
      "UDP is more reliable",
      "UDP has lower latency — dropped packets are skipped rather than retransmitted",
      "UDP supports larger packet sizes",
      "UDP has built-in encryption",
    ],
    1,
    "For live video, a retransmitted frame arriving late is useless — just show the next frame. UDP's lack of retransmission means lower latency. Applications handle their own loss recovery (or tolerate it).",
    "easy",
    ["udp", "streaming", "latency"]
  ),
  q(
    "5-2-q4",
    "5-2",
    "multiple-choice",
    "What major improvement did HTTP/2 introduce over HTTP/1.1?",
    [
      "Switching from TCP to UDP",
      "Request/response multiplexing over a single connection, eliminating head-of-line blocking",
      "Adding built-in TLS",
      "Removing the concept of HTTP headers",
    ],
    1,
    "HTTP/1.1 processes one request per connection at a time (pipelining helps but has HOL blocking). HTTP/2 multiplexes multiple streams over one TCP connection via binary framing — no HOL blocking at the application layer.",
    "medium",
    ["http2", "multiplexing", "performance"]
  ),
  q(
    "5-2-q5",
    "5-2",
    "multiple-choice",
    "In TLS, what does a certificate authority (CA) provide?",
    [
      "Encryption of HTTP payloads",
      "A trusted third-party signature proving the server owns the domain",
      "Faster key exchange",
      "IP address allocation",
    ],
    1,
    "CAs sign server certificates with their private key. Browsers trust a pre-installed list of root CAs. When your browser sees a cert signed by a trusted CA for the correct domain, it knows the server is legitimate.",
    "medium",
    ["tls", "certificate", "pki"]
  ),
  q(
    "5-2-q6",
    "5-2",
    "multiple-choice",
    "What is the order of DNS resolution for a new domain lookup?",
    [
      "Root → TLD → Authoritative → Recursive resolver",
      "Browser cache → OS cache → Recursive resolver → Root → TLD → Authoritative",
      "Authoritative → TLD → Root",
      "ISP → Root → Browser",
    ],
    1,
    "Browser cache → OS /etc/hosts → recursive resolver (ISP or 8.8.8.8) → root nameserver → TLD nameserver (.com) → authoritative nameserver for the domain. Each step caches for the TTL.",
    "medium",
    ["dns", "resolution", "recursive"]
  ),
  q(
    "5-2-q7",
    "5-2",
    "multiple-choice",
    "How do WebSockets differ from HTTP long-polling?",
    [
      "WebSockets use UDP; long-polling uses TCP",
      "WebSockets establish a persistent bidirectional connection; long-polling holds an HTTP request open until data arrives",
      "They are identical at the protocol level",
      "Long-polling is faster",
    ],
    1,
    "Long-polling: client sends request → server holds it until data available → client immediately re-requests. WebSocket: single HTTP upgrade request, then full-duplex frames in both directions over one persistent TCP connection.",
    "medium",
    ["websocket", "long-polling", "real-time"]
  ),
  q(
    "5-2-q8",
    "5-2",
    "multiple-choice",
    "What is the difference between L4 and L7 load balancing?",
    [
      "L4 balances by IP/port; L7 balances by HTTP content (URL, headers, cookies)",
      "L7 is faster than L4 in all cases",
      "L4 requires TLS termination; L7 does not",
      "They are the same but named differently by different vendors",
    ],
    0,
    "L4 (transport) load balancers route by IP/port without inspecting payload — lower latency. L7 (application) load balancers can route by URL path, host header, or cookie — more flexible but slightly higher latency.",
    "medium",
    ["load-balancer", "l4", "l7"]
  ),
  q(
    "5-2-q9",
    "5-2",
    "multiple-choice",
    "What does a traceroute command reveal?",
    [
      "Open TCP ports on a host",
      "DNS resolution time",
      "Each network hop between source and destination, with round-trip times",
      "TLS certificate chain",
    ],
    2,
    "traceroute sends packets with incrementing TTL values. Each router that decrements TTL to 0 sends an ICMP 'time exceeded' back — revealing its IP and RTT. Shows the path and where latency or drops occur.",
    "easy",
    ["traceroute", "networking", "debugging"]
  ),
  q(
    "5-2-q10",
    "5-2",
    "multiple-choice",
    "What is TCP congestion control trying to prevent?",
    [
      "Packet encryption failure",
      "Router and network overload from too much in-flight data",
      "DNS resolution failures",
      "Memory leaks in the kernel",
    ],
    1,
    "TCP congestion control (slow start, congestion avoidance, fast retransmit) adjusts the sending rate based on packet loss signals. Without it, senders would flood the network until routers drop everything.",
    "medium",
    ["tcp", "congestion", "flow-control"]
  ),

  // ── Module 5-3: Database Internals ───────────────────────────────────────
  q(
    "5-3-q1",
    "5-3",
    "multiple-choice",
    "What is the key tradeoff between B-tree and LSM-tree storage engines?",
    [
      "B-trees use more RAM; LSM-trees use more CPU",
      "B-trees are read-optimized with in-place updates; LSM-trees are write-optimized with sequential writes and background compaction",
      "LSM-trees support SQL; B-trees do not",
      "B-trees are for SSDs; LSM-trees are for spinning disks",
    ],
    1,
    "B-tree (used by Postgres, MySQL InnoDB) updates pages in-place — good for reads but random writes. LSM-tree (used by RocksDB, Cassandra) buffers writes in memory and flushes sorted runs — excellent write throughput, higher read amplification.",
    "hard",
    ["b-tree", "lsm-tree", "storage-engine"]
  ),
  q(
    "5-3-q2",
    "5-3",
    "multiple-choice",
    "What is a covering index?",
    [
      "An index that covers all tables in a database",
      "An index that contains all columns needed to answer a query — no table heap fetch required",
      "An index that spans multiple databases",
      "A composite index with more than 5 columns",
    ],
    1,
    "A covering index includes all columns referenced in the SELECT and WHERE of a query. The database can answer the query from the index alone without visiting the table's heap pages — eliminating the most expensive part of the lookup.",
    "medium",
    ["covering-index", "b-tree", "query-optimization"]
  ),
  q(
    "5-3-q3",
    "5-3",
    "multiple-choice",
    "What does a query optimizer do?",
    [
      "Rewrites SQL with correct syntax",
      "Generates machine code from SQL",
      "Evaluates multiple query execution plans and selects the one with the lowest estimated cost",
      "Caches query results for reuse",
    ],
    2,
    "The optimizer parses SQL into a logical plan, then explores physical plans (join order, index vs sequential scan, hash vs merge join) using statistics about table sizes and column distributions to estimate cost.",
    "medium",
    ["query-optimizer", "cost-based", "explain"]
  ),
  q(
    "5-3-q4",
    "5-3",
    "multiple-choice",
    "How does MVCC allow readers and writers to not block each other?",
    [
      "It uses a read-write lock that allows concurrent readers",
      "It keeps multiple versions of each row — readers see a consistent snapshot; writers create new versions without overwriting",
      "It queues all operations and processes them serially",
      "It replicates data to separate tables for reads",
    ],
    1,
    "With MVCC, a write creates a new row version tagged with the transaction ID. Readers see the latest version committed before their transaction started — never a partial write. Old versions are cleaned up by vacuum.",
    "hard",
    ["mvcc", "concurrency", "isolation"]
  ),
  q(
    "5-3-q5",
    "5-3",
    "multiple-choice",
    "Why must a WAL entry be written to disk before the data page?",
    [
      "WAL writes are faster than data page writes",
      "So crash recovery can replay committed transactions from the log even if the data page was never flushed",
      "Data pages are encrypted; WAL is not",
      "The OS requires WAL writes first",
    ],
    1,
    "This is the WAL protocol: log the change before applying it. If the system crashes after the log write but before the page write, recovery replays the log. If the page write happens first without a log entry, the change is unrecoverable.",
    "hard",
    ["wal", "crash-recovery", "durability"]
  ),
  q(
    "5-3-q6",
    "5-3",
    "multiple-choice",
    "In leader-follower replication, what is replication lag?",
    [
      "The time to elect a new leader",
      "The delay between a write being committed on the leader and it appearing on followers",
      "The network latency between clients and the leader",
      "The time to take a database backup",
    ],
    1,
    "Followers receive and apply the leader's write-ahead log asynchronously. A follower may be seconds behind. Reading from a lagging follower can return stale data — a key consistency tradeoff.",
    "medium",
    ["replication", "lag", "consistency"]
  ),
  q(
    "5-3-q7",
    "5-3",
    "multiple-choice",
    "What problem does hash partitioning solve compared to range partitioning?",
    [
      "Hash partitioning allows range queries; range does not",
      "Hash partitioning distributes writes evenly across shards, avoiding hotspots when keys are sequential",
      "Hash partitioning uses less storage",
      "Hash partitioning supports automatic rebalancing",
    ],
    1,
    "Range partitioning on a timestamp means all recent writes go to one shard — a hotspot. Hash partitioning spreads keys pseudo-randomly, giving even load. Tradeoff: range queries must hit all shards.",
    "hard",
    ["partitioning", "sharding", "hotspot"]
  ),
  q(
    "5-3-q8",
    "5-3",
    "multiple-choice",
    "When should you prefer a document store over a relational database?",
    [
      "When you need strong ACID transactions across multiple entities",
      "When data is hierarchical or variable-schema and is always accessed as a whole unit",
      "When you need complex JOIN queries",
      "When you need strict referential integrity",
    ],
    1,
    "Document stores (MongoDB, Firestore) shine for self-contained documents — user profiles, product catalogs — where you always read the whole object. They struggle with cross-document joins and multi-document transactions.",
    "medium",
    ["nosql", "document-store", "schema"]
  ),
  q(
    "5-3-q9",
    "5-3",
    "multiple-choice",
    "What does EXPLAIN ANALYZE reveal that EXPLAIN alone does not?",
    [
      "The SQL syntax tree",
      "Actual row counts and execution time from running the query, versus the planner's estimates",
      "Index definitions",
      "Lock wait times",
    ],
    1,
    "EXPLAIN shows the planner's estimated plan and costs. EXPLAIN ANALYZE actually executes the query and shows real row counts, loops, and timing. Discrepancies between estimates and actuals point to stale statistics.",
    "medium",
    ["explain", "query-optimization", "postgres"]
  ),
  q(
    "5-3-q10",
    "5-3",
    "multiple-choice",
    "What is the main advantage of eventual consistency over strong consistency in distributed databases?",
    [
      "Data is always up to date on all nodes",
      "Higher availability and lower latency — writes succeed immediately even if some nodes are unreachable",
      "Easier to program applications",
      "No need for replication",
    ],
    1,
    "Strong consistency requires coordination across nodes — if a node is unreachable, writes can block. Eventual consistency allows writes to proceed and propagates updates asynchronously, maximizing availability (per CAP theorem).",
    "hard",
    ["eventual-consistency", "cap", "distributed"]
  ),

  // ── Module 5-4: Cloud and Infrastructure ─────────────────────────────────
  q(
    "5-4-q1",
    "5-4",
    "multiple-choice",
    "What is the difference between IaaS and PaaS?",
    [
      "IaaS provides raw compute/storage/network; PaaS provides a managed platform where you deploy code",
      "IaaS is more expensive than PaaS",
      "PaaS requires more infrastructure knowledge",
      "They are the same — just different vendor terminology",
    ],
    0,
    "IaaS (EC2, GCE): you manage OS, runtime, dependencies — maximum control. PaaS (Heroku, Cloud Run): you push code; the platform handles servers, scaling, and OS — faster to ship, less control.",
    "easy",
    ["iaas", "paas", "cloud"]
  ),
  q(
    "5-4-q2",
    "5-4",
    "multiple-choice",
    "What is the key benefit of availability zones (AZs)?",
    [
      "Lower latency within a region",
      "Fault isolation — each AZ has independent power and networking so a failure in one doesn't affect others",
      "Cheaper compute costs",
      "Larger storage capacity",
    ],
    1,
    "AZs are physically separate data centers within a region with independent power, cooling, and networking. Distributing across AZs means a rack fire or power failure in one AZ doesn't take down your service.",
    "easy",
    ["availability-zone", "fault-tolerance", "cloud"]
  ),
  q(
    "5-4-q3",
    "5-4",
    "multiple-choice",
    "What is the difference between object storage (S3) and block storage (EBS)?",
    [
      "S3 stores files as key-value pairs with HTTP API access; EBS is a network-attached disk for VMs",
      "S3 is faster for random reads; EBS is faster for sequential reads",
      "EBS can be accessed from multiple regions; S3 cannot",
      "S3 is only for images; EBS is for all file types",
    ],
    0,
    "S3 stores immutable objects accessed via HTTP PUT/GET — great for static files, backups, data lakes. EBS is a block device that mounts to an EC2 instance like a hard drive — read/write at the block level for databases or OS volumes.",
    "medium",
    ["s3", "ebs", "storage"]
  ),
  q(
    "5-4-q4",
    "5-4",
    "multiple-choice",
    "What is a VPC (Virtual Private Cloud)?",
    [
      "A virtual machine with more CPU",
      "A logically isolated network within the cloud where you control IP ranges, subnets, and routing",
      "A private cloud built on-premises",
      "A container orchestration system",
    ],
    1,
    "A VPC is your private network slice of the cloud. You define CIDR ranges, subnets (public/private), route tables, and security groups. Resources in a VPC are isolated from other customers and the internet unless you explicitly allow access.",
    "easy",
    ["vpc", "networking", "cloud"]
  ),
  q(
    "5-4-q5",
    "5-4",
    "multiple-choice",
    "What is the main advantage of Infrastructure as Code (IaC) over clicking in a cloud console?",
    [
      "It is faster to set up initially",
      "Infrastructure is versioned, reproducible, reviewable, and can be applied consistently across environments",
      "Cloud consoles have bugs that IaC avoids",
      "IaC tools are free; cloud consoles charge extra",
    ],
    1,
    "IaC (Terraform, Pulumi, CDK) stores infrastructure definitions in version control. You get diffs, code review, repeatable environments, and disaster recovery — recreate your entire infrastructure from code.",
    "easy",
    ["terraform", "iac", "devops"]
  ),
  q(
    "5-4-q6",
    "5-4",
    "multiple-choice",
    "In observability, what is the difference between metrics, logs, and traces?",
    [
      "They are different names for the same data",
      "Metrics are aggregated numeric measurements; logs are discrete events; traces follow a request across services",
      "Metrics are for errors; logs are for performance; traces are for security",
      "Logs are real-time; metrics and traces are historical",
    ],
    1,
    "Metrics (CPU %, request rate) are time-series numbers — cheap to store and alert on. Logs are individual events with context. Traces link spans across microservices to show where time is spent in a distributed request.",
    "medium",
    ["observability", "metrics", "tracing"]
  ),
  q(
    "5-4-q7",
    "5-4",
    "multiple-choice",
    "What is an error budget in SRE?",
    [
      "The budget allocated for debugging",
      "The allowed downtime or unreliability implied by a service's SLO",
      "The number of bugs allowed per release",
      "The cost of fixing production incidents",
    ],
    1,
    "If your SLO is 99.9% availability, you have 0.1% error budget — about 43 minutes/month. Teams spend this budget on risk: deployments, experiments. When exhausted, feature work freezes and reliability work takes priority.",
    "medium",
    ["slo", "error-budget", "sre"]
  ),
  q(
    "5-4-q8",
    "5-4",
    "multiple-choice",
    "What is chaos engineering?",
    [
      "Uncontrolled production deployments",
      "Deliberately injecting failures into production or staging to verify resilience before they happen unexpectedly",
      "Writing code without tests",
      "Using random algorithms in distributed systems",
    ],
    1,
    "Chaos engineering (pioneered by Netflix's Chaos Monkey) proactively tests whether a system can withstand failures: kill a random instance, inject latency, drop packets. Find weaknesses before users do.",
    "medium",
    ["chaos-engineering", "reliability", "resilience"]
  ),
  q(
    "5-4-q9",
    "5-4",
    "multiple-choice",
    "What is a CDN (Content Delivery Network) primarily used for?",
    [
      "Database replication across regions",
      "Caching static assets at edge servers geographically close to users to reduce latency",
      "Encrypting traffic between microservices",
      "Managing DNS records",
    ],
    1,
    "CDNs cache static assets (images, JS, CSS) at edge nodes worldwide. A user in Tokyo gets assets from a Tokyo edge node rather than a US-East origin — reducing latency from 200ms to 5ms.",
    "easy",
    ["cdn", "edge", "latency"]
  ),
  q(
    "5-4-q10",
    "5-4",
    "multiple-choice",
    "In cloud system design, what is the tradeoff of using serverless functions vs always-on containers?",
    [
      "Serverless is always cheaper",
      "Serverless has no cold starts; containers always do",
      "Serverless eliminates server management and scales to zero but has cold starts and limited execution time; containers are persistent but require capacity planning",
      "They are equivalent in all scenarios",
    ],
    2,
    "Serverless (Lambda, Cloud Functions) scales to zero — no idle cost, no server management. But cold starts add latency on first invocation. Containers (ECS, Cloud Run) are always warm but you pay even when idle. Choose based on traffic patterns.",
    "medium",
    ["serverless", "containers", "cost"]
  ),
];
