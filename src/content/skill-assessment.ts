import type { SkillQuestion } from "@/types/skill-assessment";

/** 35 placement questions across all 10 phases. */
export const SKILL_QUESTIONS: SkillQuestion[] = [
  // Phase 0-1: Digital Literacy & Programming Fundamentals (8 questions)
  {
    id: "sa-01",
    phaseLevel: 0,
    question: "What is a file extension (like .txt or .pdf) used for?",
    options: [
      "It makes the file smaller",
      "It tells the operating system what type of content the file contains",
      "It encrypts the file for security",
      "It determines who can access the file",
    ],
    correctIndex: 1,
    explanation:
      "File extensions tell the OS (and you) what kind of data is inside — .txt for text, .pdf for documents, .jpg for images.",
  },
  {
    id: "sa-02",
    phaseLevel: 0,
    question: "In a terminal, what does the command `cd ..` do?",
    options: [
      "Creates a new directory",
      "Deletes the current directory",
      "Moves up one directory level",
      "Lists all files in the current directory",
    ],
    correctIndex: 2,
    explanation:
      "`cd` changes directory. The `..` shorthand means the parent directory — so `cd ..` moves you one level up in the file system.",
  },
  {
    id: "sa-03",
    phaseLevel: 1,
    question: "What will `console.log(typeof null)` output in JavaScript?",
    options: ['"null"', '"undefined"', '"object"', '"boolean"'],
    correctIndex: 2,
    explanation:
      'This is a well-known JavaScript quirk. `typeof null` returns "object" due to a bug in the original language implementation that was never fixed for backward compatibility.',
  },
  {
    id: "sa-04",
    phaseLevel: 1,
    question: "What is the difference between `let` and `const` in JavaScript?",
    options: [
      "`let` is faster than `const`",
      "`const` can only hold numbers",
      "`let` allows reassignment; `const` does not",
      "There is no difference — they are interchangeable",
    ],
    correctIndex: 2,
    explanation:
      "`let` declares a variable that can be reassigned. `const` declares a variable that cannot be reassigned after initialization. Both are block-scoped.",
  },
  {
    id: "sa-05",
    phaseLevel: 1,
    question: "What does a function return if it has no explicit `return` statement?",
    options: ["null", "0", "undefined", "An empty string"],
    correctIndex: 2,
    explanation:
      "In JavaScript, a function without an explicit return statement returns `undefined` by default.",
  },
  {
    id: "sa-06",
    phaseLevel: 1,
    question: "What is an array?",
    options: [
      "A single value stored in memory",
      "An ordered collection of values accessed by index",
      "A function that repeats code",
      "A type of loop",
    ],
    correctIndex: 1,
    explanation:
      "An array is an ordered collection where each element is accessed by its numeric index, starting at 0.",
  },
  {
    id: "sa-07",
    phaseLevel: 0,
    question: "What does HTTP stand for?",
    options: [
      "HyperText Transfer Protocol",
      "High-speed Text Transmission Process",
      "Hyper Terminal Transfer Program",
      "Home Tool for Text Publishing",
    ],
    correctIndex: 0,
    explanation:
      "HTTP — HyperText Transfer Protocol — is the foundation of data communication on the web. It defines how messages are formatted and transmitted between browsers and servers.",
  },
  {
    id: "sa-08",
    phaseLevel: 1,
    question: "What will `[1, 2, 3].map(x => x * 2)` return?",
    options: ["[1, 2, 3]", "[2, 4, 6]", "[1, 4, 9]", "6"],
    correctIndex: 1,
    explanation:
      "`.map()` creates a new array by applying the function to each element. Each element is multiplied by 2, producing [2, 4, 6].",
  },

  // Phase 2-3: Web Dev & CS Fundamentals (8 questions)
  {
    id: "sa-09",
    phaseLevel: 2,
    question: "What is the DOM in web development?",
    options: [
      "A JavaScript framework for building UIs",
      "A tree-structured representation of an HTML document that JavaScript can manipulate",
      "A CSS layout algorithm",
      "A server-side rendering technique",
    ],
    correctIndex: 1,
    explanation:
      "The Document Object Model (DOM) is the browser's in-memory tree representation of an HTML page. JavaScript interacts with this tree to dynamically update what users see.",
  },
  {
    id: "sa-10",
    phaseLevel: 2,
    question: "In CSS, what does `display: flex` do to an element?",
    options: [
      "Makes the element invisible",
      "Makes the element a flex container that lays out its children in a row or column",
      "Makes the element fixed to the viewport",
      "Makes the element take up no space",
    ],
    correctIndex: 1,
    explanation:
      "`display: flex` turns an element into a flex container. Its children become flex items that can be arranged horizontally or vertically with powerful alignment controls.",
  },
  {
    id: "sa-11",
    phaseLevel: 2,
    question: "What is the purpose of React's `useState` hook?",
    options: [
      "To fetch data from an API",
      "To add local state to a function component",
      "To define CSS styles for a component",
      "To create a new component",
    ],
    correctIndex: 1,
    explanation:
      "`useState` lets function components hold and update state. It returns a state value and a setter function: `const [count, setCount] = useState(0)`.",
  },
  {
    id: "sa-12",
    phaseLevel: 3,
    question:
      "What is the time complexity of searching for an element in an unsorted array of n items?",
    options: ["O(1)", "O(log n)", "O(n)", "O(n²)"],
    correctIndex: 2,
    explanation:
      "In the worst case, you must check every element — a linear scan. This is O(n). A sorted array can use binary search for O(log n).",
  },
  {
    id: "sa-13",
    phaseLevel: 3,
    question: "What data structure uses LIFO (Last In, First Out) ordering?",
    options: ["Queue", "Stack", "Linked list", "Hash map"],
    correctIndex: 1,
    explanation:
      "A stack follows LIFO — the last element pushed is the first one popped. Think of a stack of plates: you take from the top.",
  },
  {
    id: "sa-14",
    phaseLevel: 3,
    question: "What is a hash map's average time complexity for lookup?",
    options: ["O(n)", "O(log n)", "O(1)", "O(n log n)"],
    correctIndex: 2,
    explanation:
      "Hash maps provide O(1) average-case lookup by computing a hash of the key to find the value directly. Collisions can degrade to O(n) in the worst case.",
  },
  {
    id: "sa-15",
    phaseLevel: 2,
    question: "What does `===` do differently from `==` in JavaScript?",
    options: [
      "`===` is faster",
      "`===` checks both value and type; `==` coerces types before comparing",
      "`===` only works with strings",
      "There is no difference",
    ],
    correctIndex: 1,
    explanation:
      '`==` performs type coercion (e.g., `"5" == 5` is true). `===` checks both value and type without coercion (e.g., `"5" === 5` is false). Always prefer `===`.',
  },
  {
    id: "sa-16",
    phaseLevel: 3,
    question: "What is recursion?",
    options: [
      "A loop that runs forever",
      "A function that calls itself with a smaller subproblem until reaching a base case",
      "A way to declare variables",
      "A method for sorting arrays",
    ],
    correctIndex: 1,
    explanation:
      "Recursion is when a function calls itself to solve smaller instances of the same problem. Every recursive function needs a base case to stop the recursion.",
  },

  // Phase 4-5: Backend & Systems (8 questions)
  {
    id: "sa-17",
    phaseLevel: 4,
    question: "What is a REST API?",
    options: [
      "A database management system",
      "An architectural style for web services that uses HTTP methods on resources identified by URLs",
      "A programming language for servers",
      "A front-end framework",
    ],
    correctIndex: 1,
    explanation:
      "REST (Representational State Transfer) uses standard HTTP methods (GET, POST, PUT, DELETE) on URL-identified resources. It's the most common API architecture for web services.",
  },
  {
    id: "sa-18",
    phaseLevel: 4,
    question: "What is the purpose of a database index?",
    options: [
      "To encrypt sensitive data",
      "To back up the database",
      "To speed up queries by allowing the database to find rows without scanning every row",
      "To limit who can access the data",
    ],
    correctIndex: 2,
    explanation:
      "An index is a data structure (usually a B-tree) that lets the database quickly locate rows matching a query condition, similar to a book's index helping you find a topic without reading every page.",
  },
  {
    id: "sa-19",
    phaseLevel: 4,
    question: "What does the `async/await` syntax do in JavaScript?",
    options: [
      "Makes code run in parallel on multiple threads",
      "Provides a synchronous-looking way to write asynchronous code that returns promises",
      "Speeds up function execution",
      "Creates a new process",
    ],
    correctIndex: 1,
    explanation:
      "`async/await` is syntactic sugar over promises. `await` pauses the function until the promise resolves, making asynchronous code read like synchronous code.",
  },
  {
    id: "sa-20",
    phaseLevel: 5,
    question: "What does a load balancer do?",
    options: [
      "Compresses files to reduce storage",
      "Distributes incoming network traffic across multiple servers",
      "Monitors server CPU temperature",
      "Encrypts data in transit",
    ],
    correctIndex: 1,
    explanation:
      "A load balancer sits between clients and servers, distributing requests so no single server is overwhelmed. This improves availability and throughput.",
  },
  {
    id: "sa-21",
    phaseLevel: 5,
    question: "What is the difference between TCP and UDP?",
    options: [
      "TCP is faster; UDP is more reliable",
      "TCP guarantees ordered delivery with error checking; UDP sends packets without guarantees but with lower latency",
      "UDP is encrypted; TCP is not",
      "They are the same protocol with different names",
    ],
    correctIndex: 1,
    explanation:
      "TCP provides reliable, ordered delivery with acknowledgment and retransmission. UDP trades reliability for speed — ideal for real-time applications like video streaming and gaming.",
  },
  {
    id: "sa-22",
    phaseLevel: 4,
    question: "What is SQL injection?",
    options: [
      "A way to speed up database queries",
      "A security vulnerability where user input is executed as SQL code",
      "A technique for joining tables",
      "A method for creating indexes",
    ],
    correctIndex: 1,
    explanation:
      "SQL injection occurs when untrusted input is concatenated into SQL queries, allowing attackers to execute arbitrary SQL. Parameterized queries prevent it.",
  },
  {
    id: "sa-23",
    phaseLevel: 5,
    question: "What is a container (e.g., Docker)?",
    options: [
      "A virtual machine that runs a full operating system",
      "A lightweight, isolated environment that packages an application with its dependencies",
      "A cloud storage service",
      "A type of database",
    ],
    correctIndex: 1,
    explanation:
      "Containers package application code with its dependencies into an isolated environment. Unlike VMs, containers share the host OS kernel, making them lightweight and fast to start.",
  },
  {
    id: "sa-24",
    phaseLevel: 5,
    question: "What is DNS and what does it do?",
    options: [
      "A programming language for network configuration",
      "A system that translates human-readable domain names into IP addresses",
      "A type of encryption protocol",
      "A firewall technology",
    ],
    correctIndex: 1,
    explanation:
      "The Domain Name System (DNS) is the internet's phone book. When you type google.com, DNS resolves it to an IP address like 142.250.80.46 so your browser knows where to connect.",
  },

  // Phase 6-7: AI/ML & Advanced Systems (6 questions)
  {
    id: "sa-25",
    phaseLevel: 6,
    question: "What is a vector embedding in the context of AI?",
    options: [
      "A type of image compression",
      "A numerical representation of data (text, images) in a high-dimensional space where similar items are close together",
      "A way to store data in a SQL database",
      "An encryption technique for AI models",
    ],
    correctIndex: 1,
    explanation:
      "Embeddings map data to numerical vectors where semantic similarity is reflected by spatial proximity. 'king' and 'queen' are close in embedding space because they share meaning.",
  },
  {
    id: "sa-26",
    phaseLevel: 6,
    question: "What is RAG (Retrieval-Augmented Generation)?",
    options: [
      "A technique for training neural networks faster",
      "A pattern that retrieves relevant documents and includes them in an LLM's prompt to ground its answers in real data",
      "A type of GPU architecture",
      "A method for compressing large language models",
    ],
    correctIndex: 1,
    explanation:
      "RAG retrieves relevant context from a knowledge base and includes it in the prompt. This grounds the LLM's responses in actual data rather than relying solely on its training.",
  },
  {
    id: "sa-27",
    phaseLevel: 6,
    question: "What is the primary risk of using an LLM without grounding techniques?",
    options: [
      "It will run too slowly",
      "It may generate plausible-sounding but factually incorrect information (hallucination)",
      "It will use too much memory",
      "It cannot process text input",
    ],
    correctIndex: 1,
    explanation:
      "LLMs generate text based on patterns, not facts. Without grounding (RAG, function calling, etc.), they can confidently produce incorrect or fabricated information — called hallucination.",
  },
  {
    id: "sa-28",
    phaseLevel: 7,
    question: "What is eventual consistency in distributed systems?",
    options: [
      "All nodes always have the same data at the same time",
      "The system eventually crashes under heavy load",
      "Given enough time without new writes, all replicas converge to the same state",
      "Data is only consistent during maintenance windows",
    ],
    correctIndex: 2,
    explanation:
      "Eventual consistency means that if no new updates are made, all replicas will eventually converge to the same value. This is a trade-off for higher availability in distributed systems (see CAP theorem).",
  },
  {
    id: "sa-29",
    phaseLevel: 7,
    question: "What is the purpose of a compiler's abstract syntax tree (AST)?",
    options: [
      "To display code in a text editor",
      "To represent the hierarchical syntactic structure of source code for analysis and transformation",
      "To compress source code files",
      "To manage memory allocation at runtime",
    ],
    correctIndex: 1,
    explanation:
      "An AST is a tree representation of the syntactic structure of code. Compilers, linters, and code formatters all parse code into ASTs to analyze and transform it.",
  },
  {
    id: "sa-30",
    phaseLevel: 7,
    question: "What problem does consensus algorithms like Raft solve?",
    options: [
      "Sorting large datasets efficiently",
      "Getting multiple servers to agree on a single value or leader even when some may fail",
      "Encrypting network communication",
      "Compressing data for transmission",
    ],
    correctIndex: 1,
    explanation:
      "Consensus algorithms ensure that distributed nodes agree on values (like who the leader is or what the latest transaction is) even when some nodes crash or have network delays.",
  },

  // Phase 8-9: Professional Practice & Leadership (5 questions)
  {
    id: "sa-31",
    phaseLevel: 8,
    question: "What are DORA metrics used to measure?",
    options: [
      "Database performance",
      "Software delivery performance: deployment frequency, lead time, change failure rate, and recovery time",
      "Employee satisfaction",
      "Server uptime percentage",
    ],
    correctIndex: 1,
    explanation:
      "DORA (DevOps Research and Assessment) metrics measure software delivery performance: how often you deploy, how fast changes reach production, how often deployments fail, and how quickly you recover.",
  },
  {
    id: "sa-32",
    phaseLevel: 8,
    question: "What is Conway's Law?",
    options: [
      "Software always takes twice as long as estimated",
      "Organizations design systems that mirror their communication structure",
      "Every bug has exactly one root cause",
      "Code complexity grows linearly with team size",
    ],
    correctIndex: 1,
    explanation:
      "Conway's Law states that the architecture of a system reflects the communication patterns of the organization that built it. Three teams building a compiler produce a three-pass compiler.",
  },
  {
    id: "sa-33",
    phaseLevel: 9,
    question: "As a CTO, when should you choose to build vs. buy a solution?",
    options: [
      "Always build — it gives you more control",
      "Always buy — it's cheaper",
      "Build when it's a core differentiator; buy when it's commodity infrastructure",
      "Let the engineering team decide without business input",
    ],
    correctIndex: 2,
    explanation:
      "Build what makes your product unique. Buy (or use SaaS) for commodity problems like auth, payments, email, monitoring. The CTO's job is to invest engineering time where it creates the most value.",
  },
  {
    id: "sa-34",
    phaseLevel: 8,
    question: "What is a tech debt register?",
    options: [
      "A list of all technologies the company uses",
      "A tracked inventory of known technical shortcuts and their business impact, used to prioritize remediation",
      "A database of developer salaries",
      "A log of all code commits",
    ],
    correctIndex: 1,
    explanation:
      "A tech debt register documents known shortcuts, their risk level, estimated remediation cost, and business impact. It makes tech debt visible and manageable instead of invisible and growing.",
  },
  {
    id: "sa-35",
    phaseLevel: 9,
    question: "What is the most important thing a CTO communicates to the board of directors?",
    options: [
      "Detailed code architecture diagrams",
      "A list of all open bugs",
      "How technology strategy enables business outcomes, in business language",
      "The team's sprint velocity",
    ],
    correctIndex: 2,
    explanation:
      "The board cares about business outcomes. The CTO's job at the board level is to translate technology decisions into business impact: how tech investments drive revenue, reduce risk, or create competitive advantage.",
  },
];
