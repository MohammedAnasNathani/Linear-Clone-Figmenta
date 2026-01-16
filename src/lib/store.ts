import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Issue, Project, Status, Priority, Filter, User, Workspace } from "./types";

interface AppState {
    // Current selections
    currentWorkspace: Workspace | null;
    currentProject: Project | null;
    currentView: "board" | "list";
    sidebarView: "all" | "inbox" | "my-issues" | "ai";
    selectedIssue: Issue | null;

    // Data
    issues: Issue[];
    projects: Project[];
    workspaces: Workspace[];
    users: User[];

    // UI State
    sidebarCollapsed: boolean;
    commandPaletteOpen: boolean;
    createIssueOpen: boolean;
    aiPanelOpen: boolean;
    filter: Filter;
    searchQuery: string;

    // Actions
    setCurrentWorkspace: (workspace: Workspace | null) => void;
    setCurrentProject: (project: Project | null) => void;
    setCurrentView: (view: "board" | "list") => void;
    setSidebarView: (view: "all" | "inbox" | "my-issues" | "ai") => void;
    setSelectedIssue: (issue: Issue | null) => void;

    setIssues: (issues: Issue[]) => void;
    addIssue: (issue: Issue) => void;
    updateIssue: (id: string, updates: Partial<Issue>) => void;
    deleteIssue: (id: string) => void;
    moveIssue: (id: string, status: Status) => void;
    reorderIssues: (issues: Issue[]) => void;

    setProjects: (projects: Project[]) => void;
    addProject: (project: Project) => void;
    updateProject: (id: string, updates: Partial<Project>) => void;

    setWorkspaces: (workspaces: Workspace[]) => void;
    setUsers: (users: User[]) => void;

    toggleSidebar: () => void;
    setCommandPaletteOpen: (open: boolean) => void;
    setCreateIssueOpen: (open: boolean) => void;
    setAiPanelOpen: (open: boolean) => void;
    setFilter: (filter: Filter) => void;
    setSearchQuery: (query: string) => void;
    clearFilters: () => void;
}

export const useAppStore = create<AppState>()(
    persist(
        (set, get) => ({
            // Initial state
            currentWorkspace: null,
            currentProject: null,
            currentView: "board",
            sidebarView: "all",
            selectedIssue: null,

            issues: [],
            projects: [],
            workspaces: [],
            users: [],

            sidebarCollapsed: false,
            commandPaletteOpen: false,
            createIssueOpen: false,
            aiPanelOpen: false,
            filter: {},
            searchQuery: "",

            // Actions
            setCurrentWorkspace: (workspace) => set({ currentWorkspace: workspace }),
            setCurrentProject: (project) => set({ currentProject: project }),
            setCurrentView: (view) => set({ currentView: view }),
            setSidebarView: (view) => set({ sidebarView: view }),
            setSelectedIssue: (issue) => set({ selectedIssue: issue }),

            setIssues: (issues) => set({ issues }),
            addIssue: (issue) => set((state) => ({ issues: [issue, ...state.issues] })),
            updateIssue: (id, updates) => set((state) => ({
                issues: state.issues.map((issue) =>
                    issue.id === id ? { ...issue, ...updates, updated_at: new Date().toISOString() } : issue
                ),
                selectedIssue: state.selectedIssue?.id === id
                    ? { ...state.selectedIssue, ...updates, updated_at: new Date().toISOString() }
                    : state.selectedIssue
            })),
            deleteIssue: (id) => set((state) => ({
                issues: state.issues.filter((issue) => issue.id !== id),
                selectedIssue: state.selectedIssue?.id === id ? null : state.selectedIssue
            })),
            moveIssue: (id, status) => set((state) => ({
                issues: state.issues.map((issue) =>
                    issue.id === id ? { ...issue, status, updated_at: new Date().toISOString() } : issue
                )
            })),
            reorderIssues: (issues) => set({ issues }),

            setProjects: (projects) => set({ projects }),
            addProject: (project) => set((state) => ({ projects: [...state.projects, project] })),
            updateProject: (id, updates) => set((state) => ({
                projects: state.projects.map((project) =>
                    project.id === id ? { ...project, ...updates } : project
                )
            })),

            setWorkspaces: (workspaces) => set({ workspaces }),
            setUsers: (users) => set({ users }),

            toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
            setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
            setCreateIssueOpen: (open) => set({ createIssueOpen: open }),
            setAiPanelOpen: (open) => set({ aiPanelOpen: open }),
            setFilter: (filter) => set({ filter }),
            setSearchQuery: (query) => set({ searchQuery: query }),
            clearFilters: () => set({ filter: {}, searchQuery: "" }),
        }),
        {
            name: "linear-clone-storage",
            partialize: (state) => ({
                currentView: state.currentView,
                sidebarCollapsed: state.sidebarCollapsed,
            }),
        }
    )
);

// Selectors
export const useFilteredIssues = () => {
    const { issues, filter, searchQuery, currentProject } = useAppStore();

    return issues.filter((issue) => {
        // Project filter
        if (currentProject && issue.project_id !== currentProject.id) return false;

        // Search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            if (!issue.title.toLowerCase().includes(query) &&
                !issue.identifier.toLowerCase().includes(query) &&
                !issue.description?.toLowerCase().includes(query)) {
                return false;
            }
        }

        // Status filter
        if (filter.status?.length && !filter.status.includes(issue.status)) return false;

        // Priority filter
        if (filter.priority?.length && !filter.priority.includes(issue.priority)) return false;

        // Labels filter
        if (filter.labels?.length && !filter.labels.some(l => issue.labels.includes(l))) return false;

        // Assignee filter
        if (filter.assignee?.length && (!issue.assignee_id || !filter.assignee.includes(issue.assignee_id))) return false;

        return true;
    });
};

export const useIssuesByStatus = () => {
    const filteredIssues = useFilteredIssues();

    return {
        backlog: filteredIssues.filter(i => i.status === "backlog"),
        todo: filteredIssues.filter(i => i.status === "todo"),
        "in-progress": filteredIssues.filter(i => i.status === "in-progress"),
        "in-review": filteredIssues.filter(i => i.status === "in-review"),
        done: filteredIssues.filter(i => i.status === "done"),
        cancelled: filteredIssues.filter(i => i.status === "cancelled"),
    };
};
