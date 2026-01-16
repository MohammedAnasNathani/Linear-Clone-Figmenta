// AI helper functions that call the API route

async function callAI(action: string, data: Record<string, any>) {
  const response = await fetch("/api/ai", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, ...data }),
  });
  const result = await response.json();
  if (!result.success) {
    throw new Error(result.error || "AI generation failed");
  }
  return result.data;
}

export async function suggestTaskLabels(title: string, description: string): Promise<string[]> {
  try {
    return await callAI("suggestLabels", { title, description });
  } catch {
    return [];
  }
}

export async function suggestPriority(title: string, description: string): Promise<string> {
  try {
    const result = await callAI("suggestPriority", { title, description });
    const priority = result.toLowerCase().trim();
    if (["urgent", "high", "medium", "low", "no-priority"].includes(priority)) {
      return priority;
    }
    return "medium";
  } catch {
    return "medium";
  }
}

export async function breakdownTask(title: string, description: string): Promise<string[]> {
  try {
    return await callAI("breakdown", { title, description });
  } catch {
    return [];
  }
}

export async function improveDescription(title: string, roughDescription: string): Promise<string> {
  try {
    return await callAI("improveDescription", { title, description: roughDescription });
  } catch {
    return roughDescription;
  }
}

export async function detectDuplicates(newTitle: string, existingTitles: string[]): Promise<string[]> {
  if (existingTitles.length === 0) return [];
  try {
    return await callAI("detectDuplicates", { title: newTitle, existingTitles });
  } catch {
    return [];
  }
}

// Keep generateWithAI for backward compatibility
export async function generateWithAI(prompt: string): Promise<string> {
  const response = await fetch("/api/ai", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "improveDescription", title: "Custom", description: prompt }),
  });
  const result = await response.json();
  if (!result.success) throw new Error(result.error);
  return result.data;
}
