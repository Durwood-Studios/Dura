import test from "node:test";
import assert from "node:assert/strict";
import { Agent, AnthropicProvider, DemoProvider, ToolRegistry } from "./agent.mjs";
import { registerLabTools } from "./tools.mjs";
function registry() {
  const value = new ToolRegistry();
  registerLabTools(value);
  return value;
}
test("offline demo executes a real validated tool and returns its result", async () => {
  const agent = new Agent({ provider: new DemoProvider(), registry: registry() });
  assert.match(await agent.run("demo"), /"data":5/);
});
test("provider request preserves paired tool blocks and Anthropic definitions", async () => {
  let requests = [];
  const provider = new AnthropicProvider({
    apiKey: "test-only",
    model: "fixture-only",
    fetcher: async (url, options) => {
      requests.push(JSON.parse(options.body));
      return Response.json({
        content:
          requests.length === 1
            ? [
                {
                  type: "tool_use",
                  id: "one",
                  name: "calculate",
                  input: { left: 4, operator: "*", right: 5 },
                },
              ]
            : [{ type: "text", text: "20" }],
      });
    },
  });
  assert.equal(await new Agent({ provider, registry: registry() }).run("multiply"), "20");
  assert.equal(requests[0].tools[0].input_schema.type, "object");
  assert.equal(requests[0].tools[0].function, undefined);
  assert.equal(requests[1].messages.at(-2).content[0].id, "one");
  assert.equal(requests[1].messages.at(-1).content[0].tool_use_id, "one");
  assert.match(requests[1].messages.at(-1).content[0].content, /20/);
});
test("tool inputs, paths, divide-by-zero and provider errors remain explicit", async () => {
  const tools = registry();
  for (const [name, input] of [
    ["missing", {}],
    ["calculate", { left: 1, operator: "/", right: 0 }],
    ["calculate", { left: "1", operator: "+", right: 2 }],
    ["read_document", { path: "../secret" }],
  ])
    assert.equal((await tools.execute(name, input)).success, false);
  assert.match(
    (await tools.execute("read_document", { path: "welcome.txt" })).data,
    /public fixture/
  );
  const provider = new AnthropicProvider({
    apiKey: "test",
    model: "test",
    fetcher: async () => new Response(null, { status: 429 }),
  });
  await assert.rejects(new Agent({ provider, registry: tools }).run("request"), /HTTP 429/);
});
test("infinite tool loop is bounded and concurrent requests are refused", async () => {
  const looping = {
    complete: async () => [
      {
        type: "tool_use",
        id: "loop",
        name: "calculate",
        input: { left: 1, operator: "+", right: 1 },
      },
    ],
  };
  await assert.rejects(
    new Agent({ provider: looping, registry: registry(), maxTurns: 2 }).run("loop"),
    /Maximum/
  );
  let release;
  const gate = new Promise((resolve) => (release = resolve));
  const agent = new Agent({
    provider: {
      complete: async () => {
        await gate;
        return [{ type: "text", text: "done" }];
      },
    },
    registry: registry(),
  });
  const first = agent.run("first");
  await assert.rejects(agent.run("second"), /Wait/);
  release();
  assert.equal(await first, "done");
});
