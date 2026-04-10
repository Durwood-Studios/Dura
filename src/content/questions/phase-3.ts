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
    phaseId: "3",
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

export const PHASE_3_QUESTIONS: AssessmentQuestion[] = [
  // ── Module 3-1: Complexity and Big O ─────────────────────────────────────
  q(
    "3-1-q1",
    "3-1",
    "multiple-choice",
    "What does O(1) mean?",
    [
      "The algorithm runs in one second",
      "The algorithm uses one byte of memory",
      "The algorithm's runtime is constant regardless of input size",
      "The algorithm has one loop",
    ],
    2,
    "O(1) means constant time — the number of operations does not grow with input size. Accessing an array by index is O(1).",
    "easy",
    ["big-o", "time-complexity"]
  ),
  q(
    "3-1-q2",
    "3-1",
    "multiple-choice",
    "A function has two nested loops, each iterating n times. What is its time complexity?",
    ["O(n)", "O(2n)", "O(n²)", "O(log n)"],
    2,
    "Two nested loops each running n times produce n × n = n² operations — O(n²) quadratic complexity.",
    "easy",
    ["big-o", "nested-loops"]
  ),
  q(
    "3-1-q3",
    "3-1",
    "multiple-choice",
    "Binary search on a sorted array of n elements runs in:",
    ["O(n)", "O(n²)", "O(log n)", "O(1)"],
    2,
    "Binary search halves the search space each step. Halving n repeatedly until 1 takes log₂(n) steps — O(log n).",
    "easy",
    ["big-o", "binary-search"]
  ),
  q(
    "3-1-q4",
    "3-1",
    "true-false",
    "True or false: O(2n) and O(n) are the same complexity class.",
    ["True", "False"],
    0,
    "Constants are dropped in Big O notation. O(2n) simplifies to O(n) — the growth rate is linear in both cases.",
    "easy",
    ["big-o", "constants"]
  ),
  q(
    "3-1-q5",
    "3-1",
    "multiple-choice",
    "Which describes worst-case complexity?",
    [
      "The runtime on the best possible input",
      "The average runtime across all inputs",
      "An upper bound on runtime — the most work the algorithm can ever do",
      "The runtime on a random input",
    ],
    2,
    "Worst case gives a guaranteed upper bound. For linear search, the worst case is when the target is last or absent — O(n).",
    "medium",
    ["worst-case", "big-o"]
  ),
  q(
    "3-1-q6",
    "3-1",
    "multiple-choice",
    "A recursive function calls itself twice per call, with input size halving each time. What is the time complexity?",
    ["O(n)", "O(n log n)", "O(n²)", "O(2^n)"],
    0,
    "Each level processes all n elements total (two halves). There are log n levels. Total work: n × log n = O(n log n). This is merge sort's complexity.",
    "medium",
    ["recursion", "time-complexity", "merge-sort"]
  ),
  q(
    "3-1-q7",
    "3-1",
    "multiple-choice",
    "What is amortized O(1) append to a dynamic array?",
    [
      "Every single append takes O(1)",
      "On average across many appends, each append costs O(1) — even though occasional resizes cost O(n)",
      "Only the first append is O(1)",
      "Appending requires O(1) memory",
    ],
    1,
    "Dynamic arrays double in size when full. Resizes are rare — the total cost of n appends is O(n), so each is amortized O(1).",
    "medium",
    ["amortized", "dynamic-array"]
  ),
  q(
    "3-1-q8",
    "3-1",
    "multiple-choice",
    "Which function grows fastest as n → ∞?",
    ["O(n log n)", "O(n²)", "O(2^n)", "O(n³)"],
    2,
    "Exponential O(2^n) dominates all polynomial functions. 2^n overtakes n³ around n=10 and grows without bound far faster.",
    "hard",
    ["big-o", "growth-rate"]
  ),
  q(
    "3-1-q9",
    "3-1",
    "multiple-choice",
    "An algorithm uses a stack that can hold at most n elements. What is its space complexity?",
    ["O(1)", "O(log n)", "O(n)", "O(n²)"],
    2,
    "Space complexity counts extra memory used proportional to input. A stack of up to n items is O(n) auxiliary space.",
    "medium",
    ["space-complexity", "stack"]
  ),
  q(
    "3-1-q10",
    "3-1",
    "multiple-choice",
    "What is the time complexity of looking up a key in a hash map?",
    ["O(log n)", "O(n)", "O(1) average", "O(n²)"],
    2,
    "Hash maps provide O(1) average lookup. Hash collisions can degrade this to O(n) in the worst case, but a good hash function keeps collisions rare.",
    "hard",
    ["hash-map", "time-complexity"]
  ),

  // ── Module 3-2: Arrays and Strings ──────────────────────────────────────
  q(
    "3-2-q1",
    "3-2",
    "multiple-choice",
    "Why is random access to an array element O(1)?",
    [
      "Arrays are always small",
      "Elements are stored at contiguous memory addresses, so the address = base + index × element_size",
      "The OS caches array accesses",
      "Arrays use a linked structure under the hood",
    ],
    1,
    "Contiguous storage means any element's address is a single arithmetic calculation — no traversal needed.",
    "easy",
    ["array", "memory", "time-complexity"]
  ),
  q(
    "3-2-q2",
    "3-2",
    "multiple-choice",
    "The two-pointer technique is most efficient when:",
    [
      "The array is unsorted",
      "You need to track two positions simultaneously — often to avoid O(n²) brute force",
      "The array contains only unique values",
      "You need to find all permutations",
    ],
    1,
    "Two pointers avoid a nested loop. By moving two indices intelligently (inward, outward, or at different speeds), many O(n²) problems become O(n).",
    "easy",
    ["two-pointer", "array"]
  ),
  q(
    "3-2-q3",
    "3-2",
    "true-false",
    "True or false: JavaScript strings are mutable — you can change a character in place.",
    ["True", "False"],
    1,
    "JavaScript strings are immutable. Operations like replace() and slice() return new strings; the original is unchanged.",
    "easy",
    ["string", "immutability"]
  ),
  q(
    "3-2-q4",
    "3-2",
    "multiple-choice",
    "The sliding window technique is best suited for:",
    [
      "Finding a specific element in a sorted array",
      "Problems involving contiguous subarrays or substrings — sum, count, or match within a window",
      "Sorting an array in place",
      "Finding the minimum spanning tree",
    ],
    1,
    "Sliding window maintains a window of elements and slides it across the array — avoiding redundant recalculation. Common for 'longest/smallest subarray with property X'.",
    "medium",
    ["sliding-window", "array"]
  ),
  q(
    "3-2-q5",
    "3-2",
    "multiple-choice",
    "Binary search requires that the input array is:",
    ["Filled with unique values", "Sorted", "Stored in a hash map", "Of even length"],
    1,
    "Binary search exploits sorted order to eliminate half the remaining elements each step. On unsorted data, it gives incorrect results.",
    "easy",
    ["binary-search", "sorted"]
  ),
  q(
    "3-2-q6",
    "3-2",
    "multiple-choice",
    "What is the time complexity of merge sort?",
    ["O(n)", "O(n log n)", "O(n²)", "O(log n)"],
    1,
    "Merge sort divides the array into halves (log n levels) and merges each level in O(n) total work — giving O(n log n).",
    "medium",
    ["merge-sort", "sorting", "time-complexity"]
  ),
  q(
    "3-2-q7",
    "3-2",
    "multiple-choice",
    "What is the average-case time complexity of quick sort?",
    ["O(n)", "O(n log n)", "O(n²)", "O(log n)"],
    1,
    "Quick sort's average case is O(n log n). Worst case (sorted array with bad pivot) is O(n²), which is why randomized pivot selection matters.",
    "medium",
    ["quick-sort", "sorting", "time-complexity"]
  ),
  q(
    "3-2-q8",
    "3-2",
    "multiple-choice",
    "Array.sort() in JavaScript uses which comparison by default?",
    [
      "Numeric comparison",
      "Lexicographic (string) comparison",
      "By array index",
      "By insertion order",
    ],
    1,
    "JavaScript's sort() converts elements to strings and sorts lexicographically by default. [10, 9, 2].sort() gives [10, 2, 9]. Always pass a comparator for numeric sort.",
    "medium",
    ["sorting", "javascript", "array"]
  ),
  q(
    "3-2-q9",
    "3-2",
    "multiple-choice",
    "To check if a string is a palindrome in O(n) time and O(1) space, you would:",
    [
      "Reverse the string and compare",
      "Use two pointers starting at each end and move inward",
      "Sort the characters and compare",
      "Use a hash map to count character frequencies",
    ],
    1,
    "Two pointers compare characters from both ends toward the center. No extra string allocation needed — O(1) space, O(n) time.",
    "hard",
    ["two-pointer", "string", "palindrome"]
  ),
  q(
    "3-2-q10",
    "3-2",
    "multiple-choice",
    "Inserting an element at the beginning of an array is O(n) because:",
    [
      "The array must be resized",
      "Every existing element must shift one position to the right",
      "The array must be sorted after insertion",
      "The first element requires a hash lookup",
    ],
    1,
    "Arrays store elements contiguously. Inserting at index 0 requires shifting all n existing elements — O(n) time.",
    "hard",
    ["array", "insertion", "time-complexity"]
  ),

  // ── Module 3-3: Linked Lists, Stacks, and Queues ─────────────────────────
  q(
    "3-3-q1",
    "3-3",
    "multiple-choice",
    "What advantage does a linked list have over an array for insertions at the head?",
    [
      "Linked lists use less memory",
      "Head insertion is O(1) — just update the head pointer, no shifting",
      "Linked lists support random access",
      "Linked lists are faster to sort",
    ],
    1,
    "Inserting at an array's start requires shifting all elements. Linked lists just update one pointer — O(1).",
    "easy",
    ["linked-list", "time-complexity"]
  ),
  q(
    "3-3-q2",
    "3-3",
    "true-false",
    "True or false: a singly linked list supports O(1) access to any element by index.",
    ["True", "False"],
    1,
    "Linked lists have no random access. To reach index k, you must traverse from the head through k nodes — O(k) time.",
    "easy",
    ["linked-list", "time-complexity"]
  ),
  q(
    "3-3-q3",
    "3-3",
    "multiple-choice",
    "Which data structure best implements a call stack (function invocation tracking)?",
    ["Queue", "Stack", "Linked list", "Hash map"],
    1,
    "The call stack is literally a stack — LIFO. When a function is called, its frame is pushed. When it returns, the frame is popped.",
    "easy",
    ["stack", "call-stack"]
  ),
  q(
    "3-3-q4",
    "3-3",
    "multiple-choice",
    "A queue is used for BFS because:",
    [
      "It keeps elements sorted",
      "It processes nodes in FIFO order — neighbors at the current level before moving deeper",
      "It provides O(1) random access",
      "It uses less memory than a stack",
    ],
    1,
    "BFS explores level by level. A queue's FIFO order ensures you process all nodes at depth d before any at depth d+1.",
    "medium",
    ["queue", "bfs", "fifo"]
  ),
  q(
    "3-3-q5",
    "3-3",
    "multiple-choice",
    "Floyd's cycle-detection algorithm (fast/slow pointers) detects a cycle in a linked list in:",
    ["O(n²)", "O(n log n)", "O(n) time and O(1) space", "O(1) time"],
    2,
    "Two pointers at different speeds will meet inside the cycle if one exists — O(n) time with no extra data structures, so O(1) space.",
    "medium",
    ["linked-list", "cycle-detection", "two-pointer"]
  ),
  q(
    "3-3-q6",
    "3-3",
    "multiple-choice",
    "What problem does a monotonic stack solve efficiently?",
    [
      "Reversing a string",
      "Finding the next greater element for each element in an array",
      "Balancing a binary tree",
      "Sorting a linked list",
    ],
    1,
    "A monotonic stack tracks elements in sorted order as you scan. When a larger element arrives, pop smaller elements to find their 'next greater' — O(n) total.",
    "medium",
    ["stack", "monotonic-stack", "pattern"]
  ),
  q(
    "3-3-q7",
    "3-3",
    "multiple-choice",
    "What is the time complexity of pushing and popping from a stack implemented with an array?",
    ["O(log n)", "O(n)", "O(1) amortized", "O(n²)"],
    2,
    "Array-backed stacks operate at the end — push and pop are O(1). The occasional resize is amortized over many operations.",
    "medium",
    ["stack", "time-complexity", "amortized"]
  ),
  q(
    "3-3-q8",
    "3-3",
    "multiple-choice",
    "A doubly linked list is preferred over singly linked for:",
    [
      "Faster search",
      "O(1) deletion of a node when you have a direct pointer to it",
      "Smaller memory footprint",
      "Better cache performance",
    ],
    1,
    "With a singly linked list, deleting a node requires finding its predecessor — O(n). A doubly linked node knows both neighbors, so deletion is O(1).",
    "hard",
    ["linked-list", "doubly-linked", "time-complexity"]
  ),
  q(
    "3-3-q9",
    "3-3",
    "multiple-choice",
    "How can you implement a queue using two stacks?",
    [
      "It cannot be done",
      "Push to stack1; to dequeue, if stack2 is empty move all of stack1 into stack2 then pop stack2",
      "Push and pop alternate between the two stacks",
      "Merge the stacks before each operation",
    ],
    1,
    "Amortized O(1) per operation. Each element is pushed once and transferred at most once. Stack2 is refilled lazily only when empty.",
    "hard",
    ["queue", "stack", "amortized"]
  ),
  q(
    "3-3-q10",
    "3-3",
    "multiple-choice",
    "What is a priority queue and what is its typical underlying data structure?",
    [
      "A queue sorted alphabetically, backed by an array",
      "A queue where each element has a priority and the highest-priority element is always dequeued first, typically backed by a heap",
      "A linked list with sorted insertion",
      "A stack with two queues",
    ],
    1,
    "A heap gives O(log n) insert and O(log n) extract-min/max, making it the standard backing structure for priority queues.",
    "hard",
    ["priority-queue", "heap"]
  ),

  // ── Module 3-4: Trees and Graphs ─────────────────────────────────────────
  q(
    "3-4-q1",
    "3-4",
    "multiple-choice",
    "What is the height of a balanced binary tree with n nodes?",
    ["O(n)", "O(n²)", "O(log n)", "O(1)"],
    2,
    "A balanced binary tree has at most log₂(n) levels. Each level doubles the number of nodes.",
    "easy",
    ["binary-tree", "height", "balanced"]
  ),
  q(
    "3-4-q2",
    "3-4",
    "multiple-choice",
    "Inorder traversal of a BST visits nodes in:",
    ["Random order", "Level-by-level order", "Ascending sorted order", "Reverse sorted order"],
    2,
    "BST property: left subtree < root < right subtree. Inorder (left → root → right) visits them smallest to largest.",
    "easy",
    ["bst", "inorder", "traversal"]
  ),
  q(
    "3-4-q3",
    "3-4",
    "multiple-choice",
    "BFS uses a ___ while DFS uses a ___.",
    ["Stack, Queue", "Queue, Stack", "Array, Set", "Set, Map"],
    1,
    "BFS explores level by level using a FIFO queue. DFS explores depth-first using a stack (or the call stack via recursion).",
    "easy",
    ["bfs", "dfs", "traversal"]
  ),
  q(
    "3-4-q4",
    "3-4",
    "true-false",
    "True or false: every tree is also a graph.",
    ["True", "False"],
    0,
    "A tree is a connected, acyclic undirected graph. All trees are graphs; not all graphs are trees.",
    "easy",
    ["tree", "graph"]
  ),
  q(
    "3-4-q5",
    "3-4",
    "multiple-choice",
    "What makes a graph a DAG (Directed Acyclic Graph)?",
    [
      "All edges are undirected",
      "All nodes have the same degree",
      "It has directed edges and no cycles",
      "It has exactly n-1 edges",
    ],
    2,
    "DAG: directed (edges have direction) + acyclic (no path leads back to its starting node). Used in build systems, task scheduling, and dependency graphs.",
    "medium",
    ["graph", "dag"]
  ),
  q(
    "3-4-q6",
    "3-4",
    "multiple-choice",
    "Dijkstra's algorithm finds shortest paths in a weighted graph. It requires:",
    [
      "The graph to be a tree",
      "All edge weights to be non-negative",
      "The graph to be undirected",
      "Exactly one path between any two nodes",
    ],
    1,
    "Dijkstra's greedy approach breaks if negative edges exist (a later path could retroactively become shorter). Use Bellman-Ford for negative weights.",
    "medium",
    ["dijkstra", "shortest-path", "graph"]
  ),
  q(
    "3-4-q7",
    "3-4",
    "multiple-choice",
    "Deleting a node with two children from a BST involves:",
    [
      "Replacing it with null",
      "Finding its inorder successor (smallest in the right subtree) and replacing its value",
      "Rebalancing the entire tree",
      "Moving both children to the root",
    ],
    1,
    "The inorder successor is the smallest node in the right subtree. Replacing the deleted node's value with the successor's, then deleting the successor, maintains BST order.",
    "hard",
    ["bst", "deletion"]
  ),
  q(
    "3-4-q8",
    "3-4",
    "multiple-choice",
    "What is the time complexity of BFS on a graph with V vertices and E edges?",
    ["O(V)", "O(E)", "O(V + E)", "O(V × E)"],
    2,
    "BFS visits each vertex once and processes each edge once. Total work is proportional to vertices plus edges — O(V + E).",
    "hard",
    ["bfs", "time-complexity", "graph"]
  ),
  q(
    "3-4-q9",
    "3-4",
    "multiple-choice",
    "Why do AVL and red-black trees maintain balance?",
    [
      "To reduce memory usage",
      "To guarantee O(log n) worst-case operations — an unbalanced BST degrades to O(n)",
      "To simplify implementation",
      "To support parallel access",
    ],
    1,
    "An unbalanced BST (e.g., inserting sorted data) becomes a linked list — O(n) search. Balanced trees guarantee O(log n) by keeping height bounded.",
    "hard",
    ["bst", "balanced-tree", "avl"]
  ),
  q(
    "3-4-q10",
    "3-4",
    "multiple-choice",
    "Level-order tree traversal is equivalent to:",
    ["DFS with a stack", "BFS with a queue", "Inorder traversal", "Postorder traversal"],
    1,
    "Level-order visits nodes level by level, left to right — exactly what BFS with a queue produces.",
    "medium",
    ["bfs", "level-order", "traversal"]
  ),

  // ── Module 3-5: Hash Maps and Advanced Patterns ──────────────────────────
  q(
    "3-5-q1",
    "3-5",
    "multiple-choice",
    "Two-Sum: given an array and a target, find two indices whose values sum to target. The optimal solution uses:",
    [
      "Two nested loops — O(n²)",
      "Sorting — O(n log n)",
      "A hash map to track seen values — O(n)",
      "Binary search — O(log n)",
    ],
    2,
    "Store each value in a map as you iterate. For each element, check if (target - element) is in the map. One pass — O(n).",
    "easy",
    ["hash-map", "two-sum", "pattern"]
  ),
  q(
    "3-5-q2",
    "3-5",
    "multiple-choice",
    "What is a hash collision and how does separate chaining handle it?",
    [
      "Two keys produce the same hash; chaining stores colliding entries in a linked list at that bucket",
      "Two values are equal; chaining links duplicate values together",
      "The hash table is full; chaining creates overflow pages",
      "The hash function fails; chaining retries with a different function",
    ],
    0,
    "Different keys can hash to the same bucket. Separate chaining stores multiple entries per bucket as a list. Load factor and a good hash function keep chains short.",
    "medium",
    ["hash-map", "collision", "hash-function"]
  ),
  q(
    "3-5-q3",
    "3-5",
    "multiple-choice",
    "Memoization improves recursive algorithms by:",
    [
      "Running the recursion in parallel",
      "Caching results of subproblems so they are computed only once",
      "Converting recursion to iteration",
      "Reducing the base case count",
    ],
    1,
    "Memoization trades space for time. Fibonacci without memoization is O(2^n); with memoization it is O(n) — each subproblem computed once.",
    "easy",
    ["memoization", "dynamic-programming", "recursion"]
  ),
  q(
    "3-5-q4",
    "3-5",
    "multiple-choice",
    "What two properties must a problem have for dynamic programming to apply?",
    [
      "Greedy choice and monotonicity",
      "Overlapping subproblems and optimal substructure",
      "Sorted input and unique values",
      "Linear recursion and constant base case",
    ],
    1,
    "Overlapping subproblems: the same sub-computation recurs. Optimal substructure: optimal solution uses optimal solutions to subproblems.",
    "medium",
    ["dynamic-programming", "overlapping-subproblems", "optimal-substructure"]
  ),
  q(
    "3-5-q5",
    "3-5",
    "multiple-choice",
    "Top-down DP and bottom-up DP differ in that:",
    [
      "Top-down is always faster",
      "Top-down uses recursion + memoization; bottom-up fills a table iteratively from base cases",
      "Bottom-up requires more memory",
      "Top-down can only solve tree problems",
    ],
    1,
    "Both achieve the same result. Top-down is often easier to implement (natural recursion + cache). Bottom-up avoids recursion overhead and can optimize space.",
    "medium",
    ["dynamic-programming", "memoization"]
  ),
  q(
    "3-5-q6",
    "3-5",
    "multiple-choice",
    "The greedy algorithm for the coin change problem (minimum coins for amount) works correctly when:",
    [
      "The coin denominations are sorted",
      "The coin set has a 'canonical' property — each coin is divisible by the next smaller",
      "There are fewer than 10 denominations",
      "The amount is even",
    ],
    1,
    "Greedy (always take the largest coin) works for US coins {1,5,10,25} because of their divisibility structure. It fails for arbitrary coin sets — DP is needed.",
    "hard",
    ["greedy", "coin-change"]
  ),
  q(
    "3-5-q7",
    "3-5",
    "multiple-choice",
    "Backtracking differs from brute force in that:",
    [
      "Backtracking is always faster",
      "Backtracking prunes branches early when a partial solution already violates constraints",
      "Backtracking uses dynamic programming internally",
      "Backtracking works only on sorted inputs",
    ],
    1,
    "Backtracking explores the solution space but abandons (backtracks from) a path as soon as it is known to be invalid — avoiding exhaustive enumeration.",
    "medium",
    ["backtracking", "pruning"]
  ),
  q(
    "3-5-q8",
    "3-5",
    "multiple-choice",
    "Frequency counting with a hash map detects anagrams because:",
    [
      "Anagrams have the same length",
      "Two strings are anagrams iff their character frequency maps are identical",
      "Hash maps sort characters automatically",
      "Anagrams always start with the same letter",
    ],
    1,
    "Count character occurrences in each string. If the maps match, the strings are anagrams. O(n) time, O(1) space (26 letters fixed).",
    "easy",
    ["hash-map", "frequency-counting", "anagram"]
  ),
  q(
    "3-5-q9",
    "3-5",
    "multiple-choice",
    "The time complexity of computing Fibonacci(n) using bottom-up DP is:",
    ["O(2^n)", "O(n²)", "O(n)", "O(log n)"],
    2,
    "Bottom-up DP computes each Fibonacci number exactly once from F(0) up to F(n). n steps, O(1) work each — O(n) total.",
    "easy",
    ["dynamic-programming", "fibonacci"]
  ),
  q(
    "3-5-q10",
    "3-5",
    "multiple-choice",
    "In a coding interview, you have a working O(n²) solution. The next optimization goal is usually:",
    [
      "Reducing it to O(1)",
      "Reducing it to O(n log n) or O(n) using sorting, two pointers, or a hash map",
      "Rewriting it in a faster language",
      "Adding more base cases",
    ],
    1,
    "The most common interview optimization path is O(n²) brute force → O(n log n) sort/binary search → O(n) hash map or two pointers.",
    "hard",
    ["optimization", "interview", "big-o"]
  ),
];
