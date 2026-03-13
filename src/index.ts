import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { McpAgent } from "agents/mcp";
import type { AppEnv } from "./env";
import { registerSectionTools } from "./tools/sections";
import { registerSectionPrompts } from "./prompts/sections";

export class MyMCP extends McpAgent {
  server = new McpServer({
    name: "Study Navigator",
    version: "1.0.0",
  });

  async init() {
    const env = this.env as AppEnv;
    registerSectionTools(this.server, env);
    registerSectionPrompts(this.server);
  }
}

export default {
  fetch(request: Request, env: Env, ctx: ExecutionContext) {
    const url = new URL(request.url);

    if (url.pathname === "/mcp") {
      return MyMCP.serve("/mcp").fetch(request, env, ctx);
    }

    return new Response("Not found", { status: 404 });
  },
};
