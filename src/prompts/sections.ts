import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export function registerSectionPrompts(server: McpServer) {
  server.registerPrompt(
    "populate_section",
    { description: "Guide the user through populating events for a course section" },
    async () => ({
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `Help me populate my course section events. Follow these steps:

1. Call list_sections and ask me to pick one
2. Call list_section_events for the chosen section and show me what's there — note any events missing topics, times, or other details
3. Ask if I'd like to upload a syllabus or calendar file, or enter details manually
4. If I upload a file, parse it and suggest events to create or update
5. For any remaining gaps, prompt me for the specific missing details one section at a time
6. Confirm before making any changes`,
          },
        },
      ],
    }),
  );
}
