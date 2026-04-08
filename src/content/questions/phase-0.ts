import type { AssessmentQuestion } from "@/types/assessment";

/**
 * Phase 0 question bank — 40 questions across 4 modules (10 each).
 * Difficulty spread per module: 4 easy, 4 medium, 2 hard.
 * Every question tests a concept from a specific Phase 0 lesson.
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
    phaseId: "0",
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

export const PHASE_0_QUESTIONS: AssessmentQuestion[] = [
  // ── Module 0-1: How Computers Think ──────────────────────────────────────
  q(
    "0-1-q1",
    "0-1",
    "multiple-choice",
    "How many distinct values can a single byte represent?",
    ["8", "16", "128", "256"],
    3,
    "8 bits, each with 2 states, gives 2^8 = 256.",
    "easy",
    ["binary", "byte"]
  ),
  q(
    "0-1-q2",
    "0-1",
    "multiple-choice",
    "What is the binary representation of the decimal number 6?",
    ["011", "100", "110", "101"],
    2,
    "6 = 4 + 2 + 0, so the bits in the 4s, 2s, 1s columns are 1, 1, 0.",
    "easy",
    ["binary"]
  ),
  q(
    "0-1-q3",
    "0-1",
    "true-false",
    "True or false: a single bit can hold exactly one of two values.",
    ["True", "False"],
    0,
    "A bit is by definition a binary digit — 0 or 1.",
    "easy",
    ["bit"]
  ),
  q(
    "0-1-q4",
    "0-1",
    "multiple-choice",
    "Which of the following is closest in size to one binary kilobyte?",
    ["1,000 bytes", "1,024 bytes", "1,048,576 bytes", "100 bytes"],
    1,
    "1 KB (binary) = 2^10 = 1024 bytes.",
    "easy",
    ["binary", "byte"]
  ),
  q(
    "0-1-q5",
    "0-1",
    "multiple-choice",
    "Which kind of memory loses its contents when power is cut?",
    ["SSD", "Hard drive", "RAM", "Flash memory"],
    2,
    "RAM is volatile. Storage media (SSD, HDD, flash) are persistent.",
    "medium",
    ["ram", "memory"]
  ),
  q(
    "0-1-q6",
    "0-1",
    "multiple-select",
    "Which of the following are persistent (non-volatile) storage? Select all that apply.",
    ["RAM", "SSD", "Hard drive", "CPU registers"],
    [1, 2],
    "SSDs and hard drives keep data without power. RAM and registers do not.",
    "medium",
    ["memory", "storage"]
  ),
  q(
    "0-1-q7",
    "0-1",
    "multiple-choice",
    "What three steps does a CPU repeat over and over?",
    [
      "Read, write, store",
      "Fetch, decode, execute",
      "Open, modify, close",
      "Plan, execute, verify",
    ],
    1,
    "The classic instruction cycle: fetch the instruction, decode it, execute it.",
    "medium",
    ["cpu"]
  ),
  q(
    "0-1-q8",
    "0-1",
    "code-output",
    "What does this JavaScript print?\n```js\nconsole.log((10).toString(2));\n```",
    ["10", "1010", "0010", "20"],
    1,
    "(10).toString(2) converts 10 to base 2, which is 1010.",
    "medium",
    ["binary"]
  ),
  q(
    "0-1-q9",
    "0-1",
    "multiple-choice",
    "Why can two CPUs running at the same clock speed have very different real-world performance?",
    [
      "Clock speed is a marketing lie",
      "One has a different operating system",
      "Modern CPUs do varying amounts of work per cycle and run instructions in parallel",
      "Faster clocks always run cooler",
    ],
    2,
    "Pipelining, superscalar execution, and IPC differences make raw GHz a poor predictor.",
    "hard",
    ["cpu", "performance"]
  ),
  q(
    "0-1-q10",
    "0-1",
    "code-output",
    "What does this print?\n```js\nconsole.log('A'.charCodeAt(0));\n```",
    ["10", "32", "65", "97"],
    2,
    "Capital A is 65 in ASCII. Lowercase a is 97.",
    "hard",
    ["ascii", "binary"]
  ),

  // ── Module 0-2: Your First Terminal ──────────────────────────────────────
  q(
    "0-2-q1",
    "0-2",
    "multiple-choice",
    "Which command prints the path of your current directory?",
    ["ls", "cd", "pwd", "where"],
    2,
    "pwd = print working directory.",
    "easy",
    ["terminal", "shell"]
  ),
  q(
    "0-2-q2",
    "0-2",
    "multiple-choice",
    "What does `..` represent in a shell path?",
    ["The home directory", "The current directory", "The parent directory", "The root directory"],
    2,
    "Two dots is shorthand for one level up.",
    "easy",
    ["terminal", "path"]
  ),
  q(
    "0-2-q3",
    "0-2",
    "true-false",
    "True or false: `mkdir -p notes/2026/april` will create all three directories at once.",
    ["True", "False"],
    0,
    "The -p flag creates any missing parent directories.",
    "easy",
    ["terminal", "shell"]
  ),
  q(
    "0-2-q4",
    "0-2",
    "multiple-choice",
    "Which command lists the files in the current directory?",
    ["pwd", "ls", "cat", "echo"],
    1,
    "ls lists directory contents.",
    "easy",
    ["terminal"]
  ),
  q(
    "0-2-q5",
    "0-2",
    "multiple-choice",
    "What does the redirect operator `>` do at the end of a command?",
    [
      "Pipes the output to another command",
      "Overwrites the output into a file",
      "Appends the output to a file",
      "Comments out the rest of the line",
    ],
    1,
    "Single > overwrites. Double >> appends.",
    "medium",
    ["terminal", "shell"]
  ),
  q(
    "0-2-q6",
    "0-2",
    "multiple-choice",
    "What does the pipe character `|` do?",
    [
      "Runs two commands at the same time",
      "Sends the output of the left command as input to the right",
      "Comments out the rest of the line",
      "Redirects output to a file",
    ],
    1,
    "Pipes chain commands by feeding stdout into stdin.",
    "medium",
    ["terminal", "pipe"]
  ),
  q(
    "0-2-q7",
    "0-2",
    "multiple-select",
    "Which of the following are popular Unix shells? Select all that apply.",
    ["bash", "zsh", "DNS", "PowerShell"],
    [0, 1, 3],
    "bash, zsh, and PowerShell are all command shells. DNS is a name resolution system.",
    "medium",
    ["shell"]
  ),
  q(
    "0-2-q8",
    "0-2",
    "multiple-choice",
    "What does `grep -r 'TODO' src/` do?",
    [
      "Removes all TODOs from src/",
      "Recursively searches src/ for lines containing TODO",
      "Renames files containing TODO",
      "Lists files modified today",
    ],
    1,
    "grep searches for the pattern; -r recurses into subdirectories.",
    "medium",
    ["grep", "terminal"]
  ),
  q(
    "0-2-q9",
    "0-2",
    "true-false",
    "True or false: `cd -` returns you to the directory you were in before your last `cd`.",
    ["True", "False"],
    0,
    "Yes — cd - jumps back to the previous working directory.",
    "hard",
    ["shell"]
  ),
  q(
    "0-2-q10",
    "0-2",
    "multiple-choice",
    "What's the difference between a terminal and a shell?",
    [
      "They are the same thing",
      "The terminal is the window; the shell is the program that interprets your commands",
      "The shell is the window; the terminal interprets commands",
      "Only the shell can run on Linux",
    ],
    1,
    "The terminal emulator displays text and forwards keystrokes; the shell parses and runs commands.",
    "hard",
    ["terminal", "shell"]
  ),

  // ── Module 0-3: How the Internet Works ───────────────────────────────────
  q(
    "0-3-q1",
    "0-3",
    "multiple-choice",
    "What does DNS do?",
    [
      "Encrypts your traffic",
      "Translates domain names into IP addresses",
      "Compresses web pages",
      "Blocks ads",
    ],
    1,
    "DNS maps human-friendly names to numeric IP addresses.",
    "easy",
    ["dns", "networking"]
  ),
  q(
    "0-3-q2",
    "0-3",
    "multiple-choice",
    "What does an HTTP status of 404 mean?",
    ["Server error", "Not found", "Forbidden", "Successful"],
    1,
    "4xx codes are client errors. 404 specifically means the resource doesn't exist.",
    "easy",
    ["http"]
  ),
  q(
    "0-3-q3",
    "0-3",
    "multiple-choice",
    "Which side of the client-server model initiates the conversation?",
    ["The server", "The client", "Whichever has more power", "They take turns"],
    1,
    "Servers wait. Clients ask first.",
    "easy",
    ["client", "server"]
  ),
  q(
    "0-3-q4",
    "0-3",
    "true-false",
    "True or false: a single computer can act as both a client and a server, depending on context.",
    ["True", "False"],
    0,
    "Roles are situational. A web server might also act as a client when calling another API.",
    "easy",
    ["client", "server"]
  ),
  q(
    "0-3-q5",
    "0-3",
    "multiple-choice",
    "What does TCP guarantee that UDP does not?",
    ["Encryption", "Faster delivery", "In-order, reliable delivery", "Smaller packets"],
    2,
    "TCP retries lost packets and delivers them in order. UDP does not.",
    "medium",
    ["tcp", "udp"]
  ),
  q(
    "0-3-q6",
    "0-3",
    "multiple-choice",
    "Why does video streaming buffer ahead?",
    [
      "To compress the video",
      "To survive brief network slowdowns",
      "To check for viruses",
      "To track viewer behavior",
    ],
    1,
    "A few seconds of pre-downloaded packets keeps playback smooth when the network slows.",
    "medium",
    ["networking", "tcp"]
  ),
  q(
    "0-3-q7",
    "0-3",
    "multiple-choice",
    "Which HTTP method is used to fetch a resource without changing it?",
    ["GET", "POST", "PUT", "DELETE"],
    0,
    "GET is read-only by convention.",
    "medium",
    ["http", "rest"]
  ),
  q(
    "0-3-q8",
    "0-3",
    "multiple-select",
    "Which parts of a URL are sent to the server? Select all that apply.",
    ["Scheme", "Host", "Path", "Fragment (#section)"],
    [0, 1, 2],
    "The fragment after # is browser-only — the server never sees it.",
    "medium",
    ["url", "http"]
  ),
  q(
    "0-3-q9",
    "0-3",
    "multiple-choice",
    "Which protocol is most appropriate for a real-time video call where dropping a packet matters less than staying in sync?",
    ["TCP", "UDP", "FTP", "HTTP"],
    1,
    "UDP trades reliability for speed — the right tradeoff for live calls.",
    "hard",
    ["udp", "tcp"]
  ),
  q(
    "0-3-q10",
    "0-3",
    "multiple-choice",
    "What is JSON, in plain terms?",
    [
      "A programming language",
      "A text-based format for representing structured data",
      "A type of database",
      "A web framework",
    ],
    1,
    "JSON is a lightweight data interchange format supported by every modern language.",
    "hard",
    ["json", "api"]
  ),

  // ── Module 0-4: Your Dev Environment ─────────────────────────────────────
  q(
    "0-4-q1",
    "0-4",
    "multiple-choice",
    "Which tool is used to track changes to source code over time?",
    ["VS Code", "Git", "ESLint", "Prettier"],
    1,
    "Git is the dominant version control system.",
    "easy",
    ["git"]
  ),
  q(
    "0-4-q2",
    "0-4",
    "multiple-choice",
    "What does `git init` do?",
    [
      "Creates a new file",
      "Turns the current directory into a Git repository",
      "Downloads code from the internet",
      "Resets your working directory",
    ],
    1,
    "init creates the .git directory that turns the current folder into a repo.",
    "easy",
    ["git"]
  ),
  q(
    "0-4-q3",
    "0-4",
    "true-false",
    "True or false: `git push` uploads your local commits to the remote repository.",
    ["True", "False"],
    0,
    "Yes — push sends local commits up to the remote.",
    "easy",
    ["git"]
  ),
  q(
    "0-4-q4",
    "0-4",
    "multiple-choice",
    "Which extension formats your code automatically when you save?",
    ["GitLens", "Prettier", "ESLint", "Material Icons"],
    1,
    "Prettier is the dominant auto-formatter for web code.",
    "easy",
    ["editor"]
  ),
  q(
    "0-4-q5",
    "0-4",
    "multiple-choice",
    "Why does Git separate `add` from `commit`?",
    [
      "For security reasons",
      "Because it's faster",
      "So you can group related changes into separate commits",
      "Because of legacy code",
    ],
    2,
    "Staging lets you craft commits intentionally rather than capturing everything at once.",
    "medium",
    ["git"]
  ),
  q(
    "0-4-q6",
    "0-4",
    "multiple-choice",
    "What is a merge conflict?",
    [
      "When two commits have the same message",
      "When Git can't automatically combine two sets of changes to the same file",
      "When the remote is offline",
      "When you forget to pull",
    ],
    1,
    "Merge conflicts happen when two branches change the same lines and Git asks you to choose.",
    "medium",
    ["git"]
  ),
  q(
    "0-4-q7",
    "0-4",
    "multiple-choice",
    "What is the correct order of the basic developer loop?",
    [
      "Push → write → commit → test → deploy",
      "Write → test → commit → push → deploy",
      "Commit → write → push → test → deploy",
      "Test → write → deploy → commit → push",
    ],
    1,
    "Write the code, verify it works, snapshot it, share it, ship it.",
    "medium",
    ["workflow"]
  ),
  q(
    "0-4-q8",
    "0-4",
    "multiple-select",
    "Which of these are commonly recommended VS Code extensions? Select all that apply.",
    ["Prettier", "ESLint", "GitLens", "Microsoft Word"],
    [0, 1, 2],
    "Prettier, ESLint, and GitLens are core day-one installs. Word is unrelated.",
    "medium",
    ["editor"]
  ),
  q(
    "0-4-q9",
    "0-4",
    "multiple-choice",
    "What does Continuous Integration typically automate?",
    [
      "Writing the code",
      "Running tests and (often) deployment when you push",
      "Designing the user interface",
      "Choosing what to build",
    ],
    1,
    "CI runs tests automatically on every push, catching problems before they reach users.",
    "hard",
    ["ci", "workflow"]
  ),
  q(
    "0-4-q10",
    "0-4",
    "true-false",
    "True or false: rebasing creates new commits with new SHAs but copies the same diffs.",
    ["True", "False"],
    0,
    "Rebasing rewrites history — the diffs are preserved but the commit hashes change.",
    "hard",
    ["git"]
  ),
];
