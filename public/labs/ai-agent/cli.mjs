import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";
import { Agent, AnthropicProvider, DemoProvider, ToolRegistry } from "./agent.mjs";
import { registerLabTools } from "./tools.mjs";
const live = process.argv.includes("--live");
const registry = new ToolRegistry();
registerLabTools(registry);
const provider = live
  ? new AnthropicProvider({
      apiKey: process.env.ANTHROPIC_API_KEY,
      model: process.env.ANTHROPIC_MODEL,
    })
  : new DemoProvider();
const agent = new Agent({
  provider,
  registry,
  onEvent: (event) => console.error(`[${event.type}] ${event.name}`),
});
const rl = createInterface({ input: stdin, output: stdout });
console.log(
  live
    ? "Live provider mode (provider usage may cost money)."
    : "Offline demo fixture: every prompt computes 2 + 3; no model is called."
);
try {
  while (true) {
    const input = await rl.question("> ");
    if (input === "/quit") break;
    if (input === "/reset") {
      agent.reset();
      continue;
    }
    try {
      console.log(await agent.run(input));
    } catch (error) {
      console.error(error.message);
    }
  }
} catch (error) {
  if (error.code !== "ERR_USE_AFTER_CLOSE") console.error(error.message);
} finally {
  rl.close();
}
