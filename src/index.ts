import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { McpAgent } from "agents/mcp";

interface AppEnv extends Env {
	STUDY_NAVIGATOR_API_URL: string;
	STUDY_NAVIGATOR_API_TOKEN: string;
}

interface Section {
	id: string;
	name: string;
	courseId: string;
	startsOn: string;
	endsOn: string;
}

interface SectionsResponse {
	sections: Section[];
}

export class MyMCP extends McpAgent {
	server = new McpServer({
		name: "Study Navigator",
		version: "1.0.0",
	});

	async init() {
		this.server.registerTool(
			"list_sections",
			{ description: "List all course sections for the authenticated user" },
			async () => {
				const env = this.env as AppEnv;
				const response = await fetch(`${env.STUDY_NAVIGATOR_API_URL}/api/sections`, {
					headers: {
						Authorization: `Bearer ${env.STUDY_NAVIGATOR_API_TOKEN}`,
					},
				});

				if (!response.ok) {
					return {
						content: [
							{
								type: "text",
								text: `Error fetching sections: ${response.status} ${response.statusText}`,
							},
						],
					};
				}

				const data = (await response.json()) as SectionsResponse;

				if (data.sections.length === 0) {
					return { content: [{ type: "text", text: "No sections found." }] };
				}

				const text = data.sections
					.map(s => `- ${s.name} (id: ${s.id})\n  Course: ${s.courseId}\n  ${s.startsOn} → ${s.endsOn}`)
					.join("\n");

				return { content: [{ type: "text", text: text }] };
			},
		);
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
