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
    phaseId: "4",
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

export const PHASE_4_QUESTIONS: AssessmentQuestion[] = [
  // ── Module 4-1: Node.js Fundamentals ─────────────────────────────────────
  q(
    "4-1-q1",
    "4-1",
    "multiple-choice",
    "What makes Node.js non-blocking?",
    [
      "It runs multiple threads simultaneously",
      "It offloads I/O to the OS and uses an event loop to handle callbacks when I/O completes",
      "It compiles JavaScript to native code",
      "It uses a garbage collector to free memory",
    ],
    1,
    "Node.js is single-threaded but delegates I/O (files, network) to the OS via libuv. The event loop picks up callbacks when the OS signals completion.",
    "easy",
    ["nodejs", "event-loop", "non-blocking"]
  ),
  q(
    "4-1-q2",
    "4-1",
    "multiple-choice",
    "What is the difference between require() and import in Node.js?",
    [
      "require() is async; import is sync",
      "require() is CommonJS (synchronous, dynamic); import is ESM (static, enables tree-shaking)",
      "They are identical",
      "import is only available in TypeScript",
    ],
    1,
    "CommonJS require() loads modules synchronously at runtime. ESM import is statically analyzed at parse time, enabling tree-shaking and top-level await.",
    "easy",
    ["nodejs", "modules", "esm", "commonjs"]
  ),
  q(
    "4-1-q3",
    "4-1",
    "true-false",
    "True or false: process.nextTick() callbacks run before Promise microtasks.",
    ["True", "False"],
    0,
    "process.nextTick() runs before the Promise microtask queue in Node.js's event loop. Both run before any I/O callbacks.",
    "medium",
    ["event-loop", "nextTick", "microtask"]
  ),
  q(
    "4-1-q4",
    "4-1",
    "multiple-choice",
    "Which Node.js module provides file system access?",
    ["path", "os", "fs", "net"],
    2,
    "The fs module provides both synchronous (fs.readFileSync) and asynchronous (fs.readFile, fs.promises.readFile) file system operations.",
    "easy",
    ["nodejs", "fs", "filesystem"]
  ),
  q(
    "4-1-q5",
    "4-1",
    "multiple-choice",
    "What is a Node.js stream useful for?",
    [
      "Only for HTTP responses",
      "Processing data in chunks without loading the entire dataset into memory",
      "Synchronizing multiple async operations",
      "Caching frequently accessed data",
    ],
    1,
    "Streams process data in chunks — ideal for large files, HTTP bodies, and pipelines. Avoids holding gigabytes in memory at once.",
    "medium",
    ["nodejs", "streams", "memory"]
  ),
  q(
    "4-1-q6",
    "4-1",
    "multiple-choice",
    "What does process.env contain?",
    [
      "The node_modules directory contents",
      "Environment variables set in the OS or loaded from .env",
      "The current working directory",
      "Command-line arguments",
    ],
    1,
    "process.env holds all environment variables. Libraries like dotenv load .env files into process.env at startup.",
    "easy",
    ["nodejs", "environment", "config"]
  ),
  q(
    "4-1-q7",
    "4-1",
    "multiple-choice",
    "Which event should you listen to for uncaught Promise rejections?",
    ["error", "uncaughtException", "unhandledRejection", "warning"],
    2,
    "process.on('unhandledRejection', handler) catches Promises that are rejected without a .catch() or try/catch. Node.js 15+ crashes the process by default.",
    "medium",
    ["nodejs", "error-handling", "promise"]
  ),
  q(
    "4-1-q8",
    "4-1",
    "multiple-choice",
    "What does npm ci do differently from npm install?",
    [
      "It installs packages globally",
      "It installs exactly what is in package-lock.json and fails if it doesn't match — ideal for CI",
      "It clears the npm cache before installing",
      "It skips devDependencies",
    ],
    1,
    "npm ci is deterministic and strict — used in CI pipelines to ensure the exact same dependency tree every time.",
    "medium",
    ["npm", "ci", "package-lock"]
  ),
  q(
    "4-1-q9",
    "4-1",
    "multiple-choice",
    "In a Node.js HTTP server, what does res.end() do?",
    [
      "Closes the entire server",
      "Sends the response headers",
      "Signals that the response is complete and closes the connection",
      "Redirects to another URL",
    ],
    2,
    "res.end() finalizes the response body and signals the HTTP connection that the response is complete. Without it, the client waits forever.",
    "medium",
    ["nodejs", "http", "server"]
  ),
  q(
    "4-1-q10",
    "4-1",
    "multiple-choice",
    "What is the purpose of graceful shutdown in a Node.js server?",
    [
      "To restart the server automatically on crash",
      "To finish processing in-flight requests before stopping, avoiding dropped connections",
      "To save server state to disk",
      "To reduce memory usage during idle periods",
    ],
    1,
    "Graceful shutdown listens for SIGTERM, stops accepting new connections, and waits for active requests to complete before exiting.",
    "hard",
    ["nodejs", "graceful-shutdown", "production"]
  ),

  // ── Module 4-2: REST APIs with Express ───────────────────────────────────
  q(
    "4-2-q1",
    "4-2",
    "multiple-choice",
    "Which HTTP status code indicates a successfully created resource?",
    ["200 OK", "201 Created", "204 No Content", "202 Accepted"],
    1,
    "201 Created is the correct response for a successful POST that creates a new resource. Include a Location header pointing to the new resource.",
    "easy",
    ["rest", "http", "status-codes"]
  ),
  q(
    "4-2-q2",
    "4-2",
    "multiple-choice",
    "What is middleware in Express?",
    [
      "A function that handles only 404 errors",
      "A function that receives (req, res, next) and either responds or calls next() to pass control",
      "A configuration object for Express routes",
      "A database connection pool",
    ],
    1,
    "Express middleware functions form a pipeline. Each receives req, res, and next. Call next() to continue; respond to end the chain.",
    "easy",
    ["express", "middleware"]
  ),
  q(
    "4-2-q3",
    "4-2",
    "true-false",
    "True or false: REST is a protocol that must be followed exactly.",
    ["True", "False"],
    1,
    "REST is an architectural style with constraints (stateless, uniform interface, etc.), not a strict protocol. APIs can be more or less RESTful.",
    "easy",
    ["rest", "architecture"]
  ),
  q(
    "4-2-q4",
    "4-2",
    "multiple-choice",
    "What is JWT used for in API authentication?",
    [
      "Encrypting the database",
      "Representing claims between two parties in a stateless, self-contained token",
      "Hashing user passwords",
      "Storing session data on the server",
    ],
    1,
    "A JWT contains a header, payload (claims), and signature. The server verifies the signature without storing session state — enabling stateless auth.",
    "medium",
    ["jwt", "authentication", "stateless"]
  ),
  q(
    "4-2-q5",
    "4-2",
    "multiple-choice",
    "Why should you never store plaintext passwords?",
    [
      "They take too much storage space",
      "A database breach would expose every user's password — bcrypt hashing makes them computationally infeasible to reverse",
      "Plaintext passwords are too short",
      "HTTP transmits them insecurely",
    ],
    1,
    "bcrypt applies a slow, salted hash. Even with the hash, brute-forcing the original password takes enormous computation — protecting users even after a breach.",
    "easy",
    ["bcrypt", "security", "password-hashing"]
  ),
  q(
    "4-2-q6",
    "4-2",
    "multiple-choice",
    "What is the difference between authentication and authorization?",
    [
      "They are the same thing",
      "Authentication verifies who you are; authorization decides what you're allowed to do",
      "Authentication is client-side; authorization is server-side",
      "Authentication uses tokens; authorization uses passwords",
    ],
    1,
    "AuthN: prove identity (login). AuthZ: check permissions (can this user delete this resource?). Both are needed for secure APIs.",
    "easy",
    ["authentication", "authorization", "security"]
  ),
  q(
    "4-2-q7",
    "4-2",
    "multiple-choice",
    "In Express, what does app.use(express.json()) do?",
    [
      "Sends JSON responses automatically",
      "Parses the request body as JSON and attaches it to req.body",
      "Validates that all requests are JSON",
      "Converts res.send() arguments to JSON",
    ],
    1,
    "express.json() is body-parser middleware. It reads the raw request body, parses it as JSON, and makes it available as req.body.",
    "easy",
    ["express", "middleware", "json"]
  ),
  q(
    "4-2-q8",
    "4-2",
    "multiple-choice",
    "What HTTP method should be used to partially update a resource?",
    ["PUT", "PATCH", "POST", "UPDATE"],
    1,
    "PATCH applies partial updates — only the fields provided are changed. PUT replaces the entire resource. UPDATE is not a valid HTTP method.",
    "medium",
    ["rest", "http-methods", "crud"]
  ),
  q(
    "4-2-q9",
    "4-2",
    "multiple-choice",
    "What is the purpose of input validation with Zod?",
    [
      "To generate TypeScript types from the database schema",
      "To parse and validate request data at runtime, returning typed, safe values or throwing on invalid input",
      "To document API endpoints automatically",
      "To encrypt request bodies",
    ],
    1,
    "Zod validates untrusted input (req.body, req.params) against a schema at runtime. Valid data is typed; invalid data throws a ZodError you can return as a 400.",
    "medium",
    ["zod", "validation", "express"]
  ),
  q(
    "4-2-q10",
    "4-2",
    "multiple-choice",
    "What does OpenAPI/Swagger provide?",
    [
      "A runtime validation library",
      "A machine-readable API contract that generates documentation and client SDKs",
      "A testing framework for Express routes",
      "A deployment pipeline for APIs",
    ],
    1,
    "OpenAPI describes your API's endpoints, parameters, and schemas in a standard YAML/JSON format. Tools generate interactive docs, mock servers, and typed clients from it.",
    "medium",
    ["openapi", "swagger", "documentation"]
  ),

  // ── Module 4-3: PostgreSQL ────────────────────────────────────────────────
  q(
    "4-3-q1",
    "4-3",
    "multiple-choice",
    "What does SELECT * FROM users WHERE active = true ORDER BY name LIMIT 10 do?",
    [
      "Returns all users, sorted by name",
      "Returns the first 10 active users sorted alphabetically by name",
      "Returns 10 random users",
      "Deletes inactive users",
    ],
    1,
    "WHERE filters to active users, ORDER BY sorts by name, LIMIT caps at 10 rows — a paginated, filtered query.",
    "easy",
    ["sql", "select", "query"]
  ),
  q(
    "4-3-q2",
    "4-3",
    "multiple-choice",
    "What is a foreign key?",
    [
      "A primary key that is unique across all tables",
      "A column that references the primary key of another table, enforcing referential integrity",
      "An encrypted version of a primary key",
      "A key used to sort table rows",
    ],
    1,
    "A foreign key links rows between tables. The database enforces that the referenced row must exist, preventing orphaned data.",
    "easy",
    ["sql", "foreign-key", "schema-design"]
  ),
  q(
    "4-3-q3",
    "4-3",
    "multiple-choice",
    "What is the difference between INNER JOIN and LEFT JOIN?",
    [
      "INNER JOIN is faster; LEFT JOIN is more accurate",
      "INNER JOIN returns only rows with matches in both tables; LEFT JOIN also returns unmatched rows from the left table",
      "LEFT JOIN only works with foreign keys",
      "They are identical in PostgreSQL",
    ],
    1,
    "INNER JOIN: intersection. LEFT JOIN: all left rows + matched right rows (NULLs for no match). Use LEFT JOIN when you need rows even without a match.",
    "easy",
    ["sql", "join", "left-join"]
  ),
  q(
    "4-3-q4",
    "4-3",
    "true-false",
    "True or false: database transactions guarantee that either all operations succeed or none are applied.",
    ["True", "False"],
    0,
    "This is the Atomicity guarantee in ACID. A transaction either commits fully or rolls back completely — no partial state.",
    "easy",
    ["transaction", "acid", "atomicity"]
  ),
  q(
    "4-3-q5",
    "4-3",
    "multiple-choice",
    "What does EXPLAIN ANALYZE do in PostgreSQL?",
    [
      "Documents the SQL query in human-readable form",
      "Executes the query and shows the actual execution plan with timing — revealing slow operations",
      "Validates query syntax without running it",
      "Optimizes the query automatically",
    ],
    1,
    "EXPLAIN ANALYZE executes the query and shows the full plan: sequential scans, index scans, join strategies, and actual vs estimated row counts.",
    "medium",
    ["postgresql", "performance", "explain"]
  ),
  q(
    "4-3-q6",
    "4-3",
    "multiple-choice",
    "When should you add a database index?",
    [
      "On every column by default",
      "On columns frequently used in WHERE, JOIN, or ORDER BY that have high cardinality",
      "Only on primary keys",
      "Only on VARCHAR columns",
    ],
    1,
    "Indexes speed up lookups at the cost of slower writes and extra storage. Target columns with many distinct values used in queries. Don't over-index.",
    "medium",
    ["postgresql", "index", "performance"]
  ),
  q(
    "4-3-q7",
    "4-3",
    "multiple-choice",
    "What is a CTE (Common Table Expression)?",
    [
      "A type of database index",
      "A named temporary result set defined with WITH that can be referenced in the main query",
      "A stored procedure",
      "A database view",
    ],
    1,
    "WITH cte AS (SELECT ...) SELECT * FROM cte. CTEs improve readability by naming subqueries. Recursive CTEs can traverse hierarchical data.",
    "medium",
    ["sql", "cte", "advanced-queries"]
  ),
  q(
    "4-3-q8",
    "4-3",
    "multiple-choice",
    "What does third normal form (3NF) prevent?",
    [
      "Duplicate primary keys",
      "Transitive dependencies — non-key columns should depend only on the primary key, not on other non-key columns",
      "NULL values in columns",
      "Tables with more than 100 rows",
    ],
    1,
    "3NF removes transitive dependencies. Example: storing city + zip code — city depends on zip, not the row's primary key. Move it to a zip codes table.",
    "hard",
    ["normalization", "schema-design", "3nf"]
  ),
  q(
    "4-3-q9",
    "4-3",
    "multiple-choice",
    "What is a database migration?",
    [
      "Moving a database from one server to another",
      "A versioned script that incrementally changes the schema — with up and down directions",
      "Copying data between tables",
      "Optimizing slow queries",
    ],
    1,
    "Migrations track schema changes in version-controlled files. Each migration has an up (apply) and down (rollback). Tools like Flyway, Liquibase, and Drizzle manage them.",
    "medium",
    ["migration", "schema", "versioning"]
  ),
  q(
    "4-3-q10",
    "4-3",
    "multiple-choice",
    "Which SQL isolation level prevents dirty reads but allows non-repeatable reads?",
    ["Read Uncommitted", "Read Committed", "Repeatable Read", "Serializable"],
    1,
    "Read Committed (PostgreSQL's default) prevents reading uncommitted data. Repeatable Read prevents rows changing during a transaction. Serializable prevents phantom reads.",
    "hard",
    ["transaction", "isolation-level", "acid"]
  ),

  // ── Module 4-4: Docker and Containers ────────────────────────────────────
  q(
    "4-4-q1",
    "4-4",
    "multiple-choice",
    "What problem does Docker primarily solve?",
    [
      "Making code run faster",
      "Eliminating 'works on my machine' by packaging an app with its dependencies into a portable container",
      "Providing persistent storage for databases",
      "Encrypting network traffic between services",
    ],
    1,
    "A Docker image bundles the app, runtime, libraries, and config. It runs identically on any machine with Docker — dev, CI, and prod.",
    "easy",
    ["docker", "containers", "portability"]
  ),
  q(
    "4-4-q2",
    "4-4",
    "multiple-choice",
    "What is the difference between a Docker image and a container?",
    [
      "They are the same thing",
      "An image is a read-only blueprint; a container is a running instance of that image",
      "A container is stored on disk; an image runs in memory",
      "Images are for development; containers are for production",
    ],
    1,
    "Image = class definition. Container = running instance. Many containers can run from the same image, each with its own isolated process and file system.",
    "easy",
    ["docker", "image", "container"]
  ),
  q(
    "4-4-q3",
    "4-4",
    "multiple-choice",
    "Why should a Dockerfile COPY package.json before copying source files?",
    [
      "package.json is more important than source files",
      "To exploit Docker's layer caching — npm install only re-runs when package.json changes, not on every source change",
      "Docker requires files in alphabetical order",
      "package.json must be loaded before JavaScript files",
    ],
    2,
    "Docker caches each layer. If package.json hasn't changed, the npm install layer is reused. Copying source last means only the final layer rebuilds on code changes.",
    "medium",
    ["docker", "dockerfile", "layer-caching"]
  ),
  q(
    "4-4-q4",
    "4-4",
    "multiple-choice",
    "What is Docker Compose used for?",
    [
      "Building individual Docker images",
      "Defining and running multi-container applications with a single docker-compose.yml file",
      "Deploying containers to production",
      "Scanning images for security vulnerabilities",
    ],
    1,
    "Docker Compose defines services (containers), their images/builds, networks, volumes, and environment variables in one YAML file. `docker compose up` starts the whole stack.",
    "easy",
    ["docker-compose", "multi-container"]
  ),
  q(
    "4-4-q5",
    "4-4",
    "multiple-choice",
    "What is a named volume in Docker?",
    [
      "A volume with a custom port number",
      "A Docker-managed persistent storage location that survives container restarts and removal",
      "A volume shared between the host and container",
      "A read-only file system mount",
    ],
    1,
    "Named volumes persist data beyond the container's lifecycle. Unlike bind mounts, Docker manages the storage location — ideal for databases.",
    "medium",
    ["docker", "volume", "persistence"]
  ),
  q(
    "4-4-q6",
    "4-4",
    "multiple-choice",
    "What does -p 8080:3000 mean in docker run?",
    [
      "The container uses 8080 threads and 3000 MB of memory",
      "Map host port 8080 to container port 3000 — traffic to localhost:8080 reaches the container's port 3000",
      "The container runs version 8080 build 3000",
      "Connect container 8080 to network 3000",
    ],
    1,
    "Port mapping: HOST:CONTAINER. The app inside the container listens on 3000; you access it via localhost:8080 on the host machine.",
    "easy",
    ["docker", "port-mapping", "networking"]
  ),
  q(
    "4-4-q7",
    "4-4",
    "multiple-choice",
    "What is a multi-stage Docker build?",
    [
      "A build that runs on multiple machines simultaneously",
      "A Dockerfile with multiple FROM statements — uses one stage to build, copies only artifacts to a smaller final image",
      "A build that creates multiple images at once",
      "A build pipeline defined in docker-compose.yml",
    ],
    1,
    "Multi-stage builds: use a large builder image (node:20) to compile/build, copy only the output to a slim runtime image (node:20-alpine). Reduces final image size dramatically.",
    "medium",
    ["docker", "multi-stage-build", "optimization"]
  ),
  q(
    "4-4-q8",
    "4-4",
    "true-false",
    "True or false: containers should run as root by default for maximum permissions.",
    ["True", "False"],
    1,
    "Running as root in a container is a security risk. If an attacker escapes the container, they have root on the host. Use USER in the Dockerfile to run as a non-root user.",
    "medium",
    ["docker", "security", "least-privilege"]
  ),
  q(
    "4-4-q9",
    "4-4",
    "multiple-choice",
    "How do containers on the same Docker Compose network communicate?",
    [
      "By IP address only",
      "By the service name defined in docker-compose.yml, which Docker's DNS resolves",
      "Through the host machine's localhost",
      "Using SSH between containers",
    ],
    1,
    "Docker Compose creates a default network. Containers reference each other by service name (e.g., db, redis) — Docker's internal DNS resolves these to container IPs.",
    "medium",
    ["docker-compose", "networking", "dns"]
  ),
  q(
    "4-4-q10",
    "4-4",
    "multiple-choice",
    "What should never be stored in a Docker image?",
    [
      "Application source code",
      "Secrets, API keys, and passwords — they are visible to anyone with the image",
      "npm dependencies",
      "Static assets",
    ],
    1,
    "Secrets baked into layers persist even if deleted in a later RUN step. Inject secrets at runtime via environment variables or secrets management systems.",
    "hard",
    ["docker", "security", "secrets"]
  ),

  // ── Module 4-5: Deployment and DevOps ────────────────────────────────────
  q(
    "4-5-q1",
    "4-5",
    "multiple-choice",
    "What is the key difference between PaaS and IaaS?",
    [
      "PaaS is cheaper; IaaS is faster",
      "PaaS manages the OS and runtime for you; IaaS gives you raw VMs you configure yourself",
      "IaaS is for databases; PaaS is for web apps",
      "They are the same thing with different marketing names",
    ],
    1,
    "PaaS (Vercel, Railway, Heroku): deploy code, they handle OS, runtime, scaling. IaaS (AWS EC2, GCP VM): you manage everything above the hypervisor.",
    "easy",
    ["deployment", "paas", "iaas"]
  ),
  q(
    "4-5-q2",
    "4-5",
    "multiple-choice",
    "What triggers a GitHub Actions workflow?",
    [
      "Only manual triggers from the GitHub UI",
      "Events like push, pull_request, schedule, or workflow_dispatch defined in the workflow file",
      "Any commit to any branch automatically",
      "Only merges to the main branch",
    ],
    1,
    "GitHub Actions workflows are event-driven. Common triggers: push (specific branches), pull_request, schedule (cron), workflow_dispatch (manual), repository_dispatch (API).",
    "easy",
    ["ci-cd", "github-actions", "pipeline"]
  ),
  q(
    "4-5-q3",
    "4-5",
    "multiple-choice",
    "What is the purpose of a staging environment?",
    [
      "To run development tools",
      "A production-like environment for final testing before deploying to real users",
      "To store backups of the production database",
      "A read-only mirror of production",
    ],
    1,
    "Staging mirrors production: same config, same infrastructure, real-ish data. Catch environment-specific bugs before they affect real users.",
    "easy",
    ["deployment", "staging", "environments"]
  ),
  q(
    "4-5-q4",
    "4-5",
    "multiple-choice",
    "What does structured logging mean?",
    [
      "Logs stored in a relational database",
      "Logs emitted as JSON objects with consistent fields — searchable and parseable by log aggregators",
      "Logs formatted in a human-readable table",
      "Logs written to multiple files simultaneously",
    ],
    1,
    "JSON logs like {level: 'error', message: '...', userId: '123'} are machine-parseable. Tools like Datadog, Grafana Loki, and CloudWatch can index and query them.",
    "medium",
    ["logging", "observability", "structured-logging"]
  ),
  q(
    "4-5-q5",
    "4-5",
    "multiple-choice",
    "What is a CNAME record in DNS?",
    [
      "A record that maps a domain to an IP address",
      "A record that maps one domain name to another — an alias",
      "A record that stores email routing information",
      "A record that verifies domain ownership",
    ],
    1,
    "CNAME creates an alias: www.example.com → example.com. A records map to IP addresses. CNAME chains resolve to the final A record.",
    "medium",
    ["dns", "cname", "domains"]
  ),
  q(
    "4-5-q6",
    "4-5",
    "multiple-choice",
    "What is horizontal scaling?",
    [
      "Adding more CPU and RAM to a single server",
      "Adding more server instances behind a load balancer",
      "Splitting a database into multiple schemas",
      "Increasing connection pool size",
    ],
    1,
    "Horizontal scaling (scale out): add more instances. Vertical scaling (scale up): upgrade the machine. Horizontal is more resilient — no single point of failure.",
    "easy",
    ["scaling", "horizontal-scaling", "load-balancer"]
  ),
  q(
    "4-5-q7",
    "4-5",
    "multiple-choice",
    "What is TLS/SSL used for?",
    [
      "Compressing HTTP responses",
      "Encrypting data in transit between client and server, and verifying server identity via certificates",
      "Storing secrets in environment variables",
      "Rate limiting API requests",
    ],
    1,
    "TLS encrypts the TCP connection so data can't be read in transit. The server certificate (signed by a CA) proves the server's identity. HTTPS = HTTP over TLS.",
    "medium",
    ["ssl", "tls", "https", "security"]
  ),
  q(
    "4-5-q8",
    "4-5",
    "true-false",
    "True or false: a health check endpoint should verify that the app's critical dependencies (database, cache) are reachable.",
    ["True", "False"],
    0,
    "A health check that only returns 200 is a liveness check. A readiness check verifies DB connections, cache reachability, etc. — used by orchestrators to route traffic.",
    "medium",
    ["monitoring", "health-check", "readiness"]
  ),
  q(
    "4-5-q9",
    "4-5",
    "multiple-choice",
    "What is a connection pool and why is it important?",
    [
      "A cache of HTTP responses",
      "A set of pre-established database connections reused across requests — avoids costly connection setup on every query",
      "A load balancer for database replicas",
      "A pool of worker threads for CPU-intensive tasks",
    ],
    1,
    "Opening a database connection is expensive (TCP + auth). A pool maintains N open connections and loans them to requests. Without pooling, high traffic can exhaust the DB's connection limit.",
    "hard",
    ["database", "connection-pool", "performance"]
  ),
  q(
    "4-5-q10",
    "4-5",
    "multiple-choice",
    "What is a feature flag?",
    [
      "A git branch naming convention",
      "A runtime toggle that enables or disables features without deploying new code",
      "A Docker label identifying the image version",
      "A CI/CD pipeline step that runs feature tests",
    ],
    1,
    "Feature flags decouple deployment from release. Deploy dark (flag off), enable for internal users, gradually roll out. Roll back instantly without a code deploy.",
    "medium",
    ["feature-flag", "deployment", "release"]
  ),
];
