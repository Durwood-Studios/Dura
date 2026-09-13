# Bounded AI agent lab

Node 22+. Download `package.json`, `agent.mjs`, `tools.mjs`, `cli.mjs`, `agent.test.mjs` and `fixtures/welcome.txt` preserving the directory structure.

```sh
npm install
npm test
npm start
```

Default mode is a deterministic offline protocol fixture, not a language model: every prompt requests the real calculator tool to compute 2 + 3. `/reset` clears conversation memory; `/quit` exits. Tool-call/result events are progress messages, not model reasoning or token streaming.

Optional live mode:

```sh
# Set ANTHROPIC_API_KEY and ANTHROPIC_MODEL in your local environment.
node cli.mjs --live
```

The model must be available to your account. Live mode requires network access and can incur provider charges. No live provider call was made in the local tests. The adapter's request/response contract is tested with explicit fixtures against the documented Messages tool-use format.

The registry validates JSON arguments with Zod. The agent processes tool calls serially, preserves tool-use IDs and result blocks, limits turns, refuses concurrent conversation mutation, surfaces provider failures and resets incomplete local conversation state on failure. It does not automatically retry tools because arbitrary side effects may not be safe to repeat. Memory is an in-process bounded conversation, not persistent or automatically summarized memory.

Only two tools are enabled: finite two-number arithmetic and reading one public fixture from a checked directory. No model-directed shell execution, arbitrary file reads or web search is registered. Those extensions need explicit authorization, output bounds and isolation before use. The older tutorial's subprocess timeout was not a sandbox; this runnable core avoids presenting it as one.

Tests cover the actual offline tool loop, provider request envelopes, paired IDs, invalid inputs, path rejection, missing tools, provider failure, maximum turns and concurrent requests. References: [Anthropic tool lifecycle](https://platform.claude.com/docs/en/agents-and-tools/tool-use/handle-tool-calls), [Zod JSON Schema](https://zod.dev/json-schema).
