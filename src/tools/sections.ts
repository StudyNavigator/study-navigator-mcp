import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createApiClient } from "../api/client";
import type { AppEnv } from "../env";

interface Section {
	id: string;
	name: string;
	courseId: string;
	startsOn: string;
	endsOn: string;
}

export function registerSectionTools(server: McpServer, env: AppEnv) {
	const api = createApiClient(env);

	server.registerTool(
		"list_sections",
		{ description: "List all course sections for the authenticated user" },
		async () => {
			try {
				const data = await api<{ sections: Section[] }>("/api/sections");

				if (data.sections.length === 0) {
					return { content: [{ type: "text", text: "No sections found." }] };
				}

				const text = data.sections
					.map(s => `- ${s.name} (id: ${s.id})\n  Course: ${s.courseId}\n  ${s.startsOn} → ${s.endsOn}`)
					.join("\n");

				return { content: [{ type: "text", text: text }] };
			} catch (err) {
				return { content: [{ type: "text", text: String(err) }] };
			}
		},
	);
}
