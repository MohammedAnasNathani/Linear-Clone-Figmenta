// Issue/Task Types
export type Priority = "urgent" | "high" | "medium" | "low" | "no-priority";
export type Status = "backlog" | "todo" | "in-progress" | "in-review" | "done" | "cancelled";

export interface Issue {
    id: string;
    identifier: string; // e.g., "LIN-123"
    title: string;
    description: string | null;
    status: Status;
    priority: Priority;
    labels: string[];
    assignee_id: string | null;
    assignee?: User | null;
    project_id: string | null;
    project?: Project | null;
    workspace_id: string;
    created_by: string;
    created_at: string;
    updated_at: string;
    due_date: string | null;
    estimate: number | null; // story points
    parent_id: string | null; // for subtasks
    order: number;
}

export interface Project {
    id: string;
    name: string;
    description: string | null;
    icon: string | null;
    color: string;
    workspace_id: string;
    lead_id: string | null;
    status: "planned" | "in-progress" | "paused" | "completed" | "cancelled";
    start_date: string | null;
    target_date: string | null;
    created_at: string;
    updated_at: string;
}

export interface Workspace {
    id: string;
    name: string;
    slug: string;
    icon: string | null;
    created_at: string;
}

export interface User {
    id: string;
    email: string;
    name: string | null;
    avatar_url: string | null;
    role?: "owner" | "admin" | "member";
    created_at: string;
}

export interface WorkspaceMember {
    id: string;
    workspace_id: string;
    user_id: string;
    role: "owner" | "admin" | "member";
    user?: User;
}

// View Types
export type ViewType = "board" | "list" | "calendar";

export interface Filter {
    status?: Status[];
    priority?: Priority[];
    labels?: string[];
    assignee?: string[];
    project?: string[];
}

// Status configuration with colors
export const STATUS_CONFIG: Record<Status, { label: string; color: string; bgColor: string }> = {
    backlog: { label: "Backlog", color: "text-zinc-400", bgColor: "bg-zinc-500/20" },
    todo: { label: "Todo", color: "text-zinc-300", bgColor: "bg-zinc-400/20" },
    "in-progress": { label: "In Progress", color: "text-yellow-400", bgColor: "bg-yellow-500/20" },
    "in-review": { label: "In Review", color: "text-blue-400", bgColor: "bg-blue-500/20" },
    done: { label: "Done", color: "text-green-400", bgColor: "bg-green-500/20" },
    cancelled: { label: "Cancelled", color: "text-red-400", bgColor: "bg-red-500/20" },
};

export const PRIORITY_CONFIG: Record<Priority, { label: string; color: string; icon: string }> = {
    urgent: { label: "Urgent", color: "text-red-500", icon: "🔴" },
    high: { label: "High", color: "text-orange-500", icon: "🟠" },
    medium: { label: "Medium", color: "text-yellow-500", icon: "🟡" },
    low: { label: "Low", color: "text-blue-500", icon: "🔵" },
    "no-priority": { label: "No Priority", color: "text-zinc-500", icon: "⚪" },
};

export const LABEL_COLORS: Record<string, string> = {
    bug: "bg-red-500/20 text-red-400 border-red-500/30",
    feature: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    improvement: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    documentation: "bg-green-500/20 text-green-400 border-green-500/30",
    design: "bg-pink-500/20 text-pink-400 border-pink-500/30",
    urgent: "bg-red-500/20 text-red-400 border-red-500/30",
    "low-priority": "bg-zinc-500/20 text-zinc-400 border-zinc-500/30",
    backend: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    frontend: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
    mobile: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
    api: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    security: "bg-rose-500/20 text-rose-400 border-rose-500/30",
    performance: "bg-lime-500/20 text-lime-400 border-lime-500/30",
};
