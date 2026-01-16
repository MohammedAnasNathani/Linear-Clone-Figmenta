"use client";

import { useEffect, useState, useCallback } from "react";
import { useAppStore } from "@/lib/store";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Plus,
  Search,
  LayoutGrid,
  List,
  Settings,
  Home,
  FolderKanban,
  Sparkles,
  Moon,
  Sun,
} from "lucide-react";
import { STATUS_CONFIG, PRIORITY_CONFIG } from "@/lib/types";
import { cn } from "@/lib/utils";

export function CommandPalette() {
  const {
    commandPaletteOpen,
    setCommandPaletteOpen,
    setCreateIssueOpen,
    setCurrentView,
    setCurrentProject,
    currentView,
    projects,
    issues,
    setSelectedIssue,
    searchQuery,
    setSearchQuery,
    setAiPanelOpen,
  } = useAppStore();

  const [search, setSearch] = useState("");

  // Keyboard shortcut to open
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setCommandPaletteOpen(!commandPaletteOpen);
      }
      // Quick issue create
      if (e.key === "c" && !e.metaKey && !e.ctrlKey && !e.altKey) {
        const target = e.target as HTMLElement;
        if (target.tagName !== "INPUT" && target.tagName !== "TEXTAREA") {
          e.preventDefault();
          setCreateIssueOpen(true);
        }
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [commandPaletteOpen, setCommandPaletteOpen, setCreateIssueOpen]);

  const handleSelect = useCallback((callback: () => void) => {
    setCommandPaletteOpen(false);
    callback();
  }, [setCommandPaletteOpen]);

  const filteredIssues = issues.filter((issue) =>
    issue.title.toLowerCase().includes(search.toLowerCase()) ||
    issue.identifier.toLowerCase().includes(search.toLowerCase())
  ).slice(0, 5);

  return (
    <CommandDialog open={commandPaletteOpen} onOpenChange={setCommandPaletteOpen}>
      <CommandInput
        placeholder="Type a command or search..."
        value={search}
        onValueChange={setSearch}
        className="border-none focus:ring-0"
      />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        {/* Quick Actions */}
        <CommandGroup heading="Actions">
          <CommandItem
            onSelect={() => handleSelect(() => setCreateIssueOpen(true))}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4 text-zinc-400" />
            <span>Create new issue</span>
            <kbd className="ml-auto text-xs bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-400">C</kbd>
          </CommandItem>
          <CommandItem
            onSelect={() => handleSelect(() => setSearchQuery(search))}
            className="flex items-center gap-2"
          >
            <Search className="w-4 h-4 text-zinc-400" />
            <span>Search issues</span>
          </CommandItem>
          <CommandItem
            onSelect={() => handleSelect(() => setAiPanelOpen(true))}
            className="flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-violet-400" />
            <span>AI Assistant</span>
            <kbd className="ml-auto text-xs bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-400">I</kbd>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        {/* Views */}
        <CommandGroup heading="Views">
          <CommandItem
            onSelect={() => handleSelect(() => setCurrentView("board"))}
            className="flex items-center gap-2"
          >
            <LayoutGrid className={cn("w-4 h-4", currentView === "board" ? "text-violet-400" : "text-zinc-400")} />
            <span>Board view</span>
            {currentView === "board" && <span className="ml-auto text-xs text-violet-400">Active</span>}
          </CommandItem>
          <CommandItem
            onSelect={() => handleSelect(() => setCurrentView("list"))}
            className="flex items-center gap-2"
          >
            <List className={cn("w-4 h-4", currentView === "list" ? "text-violet-400" : "text-zinc-400")} />
            <span>List view</span>
            {currentView === "list" && <span className="ml-auto text-xs text-violet-400">Active</span>}
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        {/* Projects */}
        <CommandGroup heading="Projects">
          <CommandItem
            onSelect={() => handleSelect(() => setCurrentProject(null))}
            className="flex items-center gap-2"
          >
            <Home className="w-4 h-4 text-zinc-400" />
            <span>All Issues</span>
          </CommandItem>
          {projects.map((project) => (
            <CommandItem
              key={project.id}
              onSelect={() => handleSelect(() => setCurrentProject(project))}
              className="flex items-center gap-2"
            >
              <span className="text-sm">{project.icon || "📁"}</span>
              <span>{project.name}</span>
            </CommandItem>
          ))}
        </CommandGroup>

        {/* Search Results */}
        {search && filteredIssues.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Issues">
              {filteredIssues.map((issue) => (
                <CommandItem
                  key={issue.id}
                  onSelect={() => handleSelect(() => setSelectedIssue(issue))}
                  className="flex items-center gap-2"
                >
                  <span className="text-xs font-mono text-zinc-500">{issue.identifier}</span>
                  <span className="truncate">{issue.title}</span>
                  <span className={cn("ml-auto text-xs", STATUS_CONFIG[issue.status].color)}>
                    {STATUS_CONFIG[issue.status].label}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        <CommandSeparator />

        {/* Settings */}
        <CommandGroup heading="Settings">
          <CommandItem 
            onSelect={() => handleSelect(() => {
              // Settings would open a settings modal in a full implementation
              const toast = document.createElement('div');
              toast.textContent = 'Settings panel';
            })}
            className="flex items-center gap-2"
          >
            <Settings className="w-4 h-4 text-zinc-400" />
            <span>Settings</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
