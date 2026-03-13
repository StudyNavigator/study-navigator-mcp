import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { createApiClient } from "../api/client";
import type { AppEnv } from "../env";

interface Section {
	id: string;
	name: string;
	courseId: string;
	startsOn: string;
	endsOn: string;
}

interface SectionEvent {
	id: string;
	name: string;
	description: string;
	eventType: "lecture" | "assessment" | "assignment" | "quiz" | "other";
	sectionId: string;
	startsOn: string;
	startTime: string | null;
	endTime: string | null;
	topics: string[];
	sessionIds: string[];
}

const POPULATE_SECTION_PROMPT = `Help me populate my course section events. Follow these steps:

1. Call list_sections and ask me to pick one
2. Call list_section_events for the chosen section and show me what's there — note any events missing topics, times, or other details
3. Ask if I'd like to upload a syllabus or calendar file, or enter details manually
4. If I upload a file, parse it and suggest events to create or update
5. For any remaining gaps, prompt me for the specific missing details one section at a time
6. Confirm before making any changes`;

export function registerSectionTools(server: McpServer, env: AppEnv) {
	server.registerTool(
		"populate_section",
		{ description: "Guide the user through populating events for a course section" },
		async () => ({ content: [{ type: "text", text: POPULATE_SECTION_PROMPT }] }),
	);

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

	server.registerTool(
		"list_section_events",
		{
			description: "List all events for a given section",
			inputSchema: { sectionId: z.string().describe("The section ID") },
		},
		async ({ sectionId }) => {
			try {
				const data = await api<{ events: SectionEvent[] }>(`/api/sections/${sectionId}/events`);

				if (data.events.length === 0) {
					return { content: [{ type: "text", text: "No events found for this section." }] };
				}

				const text = data.events
					.map(e => {
						const time = e.startTime ? ` at ${e.startTime}${e.endTime ? ` – ${e.endTime}` : ""}` : "";
						const topics = e.topics.length > 0 ? `\n  Topics: ${e.topics.join(", ")}` : "";
						return `- ${e.name} [${e.eventType}] (id: ${e.id})\n  ${e.startsOn}${time}${topics}`;
					})
					.join("\n");

				return { content: [{ type: "text", text: text }] };
			} catch (err) {
				return { content: [{ type: "text", text: String(err) }] };
			}
		},
	);
}
