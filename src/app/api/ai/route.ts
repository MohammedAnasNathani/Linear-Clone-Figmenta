import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

// Initialize Gemini with server-side API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { action, title, description, existingTitles } = body;

        console.log(`[AI API] Action: ${action}`);

        let prompt = "";

        switch (action) {
            case "suggestLabels":
                prompt = `Based on this task title and description, suggest 2-3 relevant labels from this list: [bug, feature, improvement, documentation, design, urgent, low-priority, backend, frontend, mobile, api, security, performance].

Title: ${title}
Description: ${description}

Return only a JSON array of label strings, nothing else. Example: ["bug", "urgent"]`;
                break;

            case "suggestPriority":
                prompt = `Based on this task, suggest a priority level: urgent, high, medium, low, or no-priority.

Title: ${title}
Description: ${description}

Return only one word from the options above.`;
                break;

            case "breakdown":
                prompt = `Break down this task into smaller, actionable subtasks (maximum 5):

Title: ${title}
Description: ${description}

Return only a JSON array of task title strings. Example: ["Set up database schema", "Create API endpoints"]`;
                break;

            case "improveDescription":
                prompt = `Improve this task description to be clearer and more actionable. Keep it concise but comprehensive.

Title: ${title}
Current description: ${description || "No description provided"}

Return only the improved description text, nothing else.`;
                break;

            case "detectDuplicates":
                if (!existingTitles || existingTitles.length === 0) {
                    return NextResponse.json({ success: true, data: [] });
                }
                prompt = `Compare this new task against existing tasks and find duplicates (exact or semantic matches).

New task: "${title}"

Existing tasks:
${existingTitles.map((t: string, i: number) => `${i + 1}. "${t}"`).join("\n")}

Return a JSON array of duplicate titles. If none, return [].`;
                break;

            default:
                return NextResponse.json({ error: "Invalid action" }, { status: 400 });
        }

        const response = await model.generateContent(prompt);
        const text = response.response.text();
        const cleaned = text.replace(/```json\n?/g, "").replace(/\n?```/g, "").trim();

        console.log(`[AI API] Response length: ${text.length}`);

        // Handle different response types
        if (action === "suggestPriority" || action === "improveDescription") {
            return NextResponse.json({ success: true, data: cleaned });
        }

        try {
            const parsed = JSON.parse(cleaned);
            return NextResponse.json({ success: true, data: parsed });
        } catch {
            return NextResponse.json({ success: true, data: cleaned });
        }

    } catch (error: any) {
        console.error("[AI API] Error:", error);
        return NextResponse.json({
            success: false,
            error: error.message || "AI generation failed"
        }, { status: 500 });
    }
}
