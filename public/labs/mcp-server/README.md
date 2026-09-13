# MCP document server lab

A complete read-only stdio server with two public fixture documents. Node 22+ required. Download this directory, then:

```sh
npm install
npm test
npm start
```

`npm start` waits for an MCP client on stdin; it is not an HTTP website. Configure your MCP client to launch `node /absolute/path/server.mjs`. The client starts and owns one server process. Keep stdout exclusively for protocol messages; diagnostics belong on stderr.

The test launches a separate server process through the official SDK client, negotiates capabilities, discovers a tool and URI template, searches, reads a dynamic resource, requests a prompt, and checks invalid/oversized input and missing IDs. No API keys, cloud service, model, or network are needed after dependency installation. The test uses real JSON-RPC transport rather than calling handlers directly.

This fixture deliberately has no filesystem access, writes, external fetches, authentication, or HTTP endpoint. Read-only annotations are advisory metadata, not authorization. Extending it with private documents requires an explicit authorization design; adding HTTP requires the SDK's Streamable HTTP session lifecycle, Origin validation, authentication, and per-client state. Do not place this stdio process behind an ad hoc POST handler.

SDK 1.30.0 and Zod 4.3.6 were installed and exercised for this lab. See the [official TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk/tree/v1.x) and [MCP architecture](https://modelcontextprotocol.io/docs/learn/architecture).
