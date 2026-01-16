"use client";

import { useAppStore, useFilteredIssues } from "@/lib/store";
import { STATUS_CONFIG, PRIORITY_CONFIG } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  Filter,
  LayoutGrid,
  List,
  Plus,
  Sparkles,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function Header() {
  const {
    currentProject,
    currentView,
    setCurrentView,
    setCreateIssueOpen,
    setCommandPaletteOpen,
    searchQuery,
    setSearchQuery,
    sidebarView,
    setAiPanelOpen,
    filter,
    setFilter,
    clearFilters,
  } = useAppStore();
  
  const filteredIssues = useFilteredIssues();

  const getTitle = () => {
    if (currentProject) return currentProject.name;
    switch (sidebarView) {
      case "inbox": return "Inbox";
      case "my-issues": return "My Issues";
      case "ai": return "AI Assistant";
      default: return "All Issues";
    }
  };

  const handleStatusFilter = (status: string) => {
    const currentStatuses = filter.status || [];
    const newStatuses = currentStatuses.includes(status as any)
      ? currentStatuses.filter(s => s !== status)
      : [...currentStatuses, status as any];
    setFilter({ ...filter, status: newStatuses.length > 0 ? newStatuses : undefined });
  };

  const handlePriorityFilter = (priority: string) => {
    const currentPriorities = filter.priority || [];
    const newPriorities = currentPriorities.includes(priority as any)
      ? currentPriorities.filter(p => p !== priority)
      : [...currentPriorities, priority as any];
    setFilter({ ...filter, priority: newPriorities.length > 0 ? newPriorities : undefined });
  };

  const hasActiveFilters = (filter.status?.length || 0) > 0 || 
                           (filter.priority?.length || 0) > 0 ||
                           (filter.labels?.length || 0) > 0;

  return (
    <header className="h-14 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-sm flex items-center justify-between px-4 sticky top-0 z-10">
      {/* Left Section */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          {currentProject ? (
            <>
              <span className="text-lg">{currentProject.icon}</span>
              <h1 className="text-lg font-semibold text-zinc-100">
                {currentProject.name}
              </h1>
            </>
          ) : (
            <h1 className="text-lg font-semibold text-zinc-100">{getTitle()}</h1>
          )}
          <span className="text-sm text-zinc-500 ml-2">
            {filteredIssues.length} issues
          </span>
        </div>
      </div>

      {/* Center Section - Search */}
      <div className="flex-1 max-w-md mx-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <Input
            placeholder="Search issues... (⌘K)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setCommandPaletteOpen(true)}
            className="pl-9 bg-zinc-900 border-zinc-800 text-zinc-300 placeholder:text-zinc-500 focus:border-violet-500/50 focus:ring-violet-500/20"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 w-6 h-6 text-zinc-500 hover:text-zinc-300"
              onClick={() => setSearchQuery("")}
            >
              <X className="w-3 h-3" />
            </Button>
          )}
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2">
        {/* View Toggle */}
        <div className="flex items-center bg-zinc-900 rounded-lg p-1 border border-zinc-800">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setCurrentView("board");
              toast.success("Switched to Board view");
            }}
            className={cn(
              "px-3 h-7 text-zinc-400 hover:text-zinc-100 transition-all",
              currentView === "board" && "bg-zinc-800 text-zinc-100"
            )}
          >
            <LayoutGrid className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setCurrentView("list");
              toast.success("Switched to List view");
            }}
            className={cn(
              "px-3 h-7 text-zinc-400 hover:text-zinc-100 transition-all",
              currentView === "list" && "bg-zinc-800 text-zinc-100"
            )}
          >
            <List className="w-4 h-4" />
          </Button>
        </div>

        {/* Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100",
                hasActiveFilters && "border-violet-500/50 bg-violet-500/10 text-violet-400"
              )}
            >
              <Filter className="w-4 h-4 mr-2" />
              Filter
              {hasActiveFilters && (
                <Badge variant="secondary" className="ml-2 bg-violet-500/20 text-violet-300 text-[10px] px-1">
                  {(filter.status?.length || 0) + (filter.priority?.length || 0)}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-zinc-900 border-zinc-800">
            <DropdownMenuLabel className="text-zinc-400 text-xs">Status</DropdownMenuLabel>
            {Object.entries(STATUS_CONFIG).map(([status, config]) => (
              <DropdownMenuCheckboxItem
                key={status}
                checked={filter.status?.includes(status as any) || false}
                onCheckedChange={() => handleStatusFilter(status)}
                className="text-zinc-300 focus:bg-zinc-800 focus:text-zinc-100"
              >
                <span className={cn("w-2 h-2 rounded-full mr-2", config.bgColor.replace("/20", ""))} />
                {config.label}
              </DropdownMenuCheckboxItem>
            ))}
            <DropdownMenuSeparator className="bg-zinc-800" />
            <DropdownMenuLabel className="text-zinc-400 text-xs">Priority</DropdownMenuLabel>
            {Object.entries(PRIORITY_CONFIG).map(([priority, config]) => (
              <DropdownMenuCheckboxItem
                key={priority}
                checked={filter.priority?.includes(priority as any) || false}
                onCheckedChange={() => handlePriorityFilter(priority)}
                className="text-zinc-300 focus:bg-zinc-800 focus:text-zinc-100"
              >
                {config.label}
              </DropdownMenuCheckboxItem>
            ))}
            <DropdownMenuSeparator className="bg-zinc-800" />
            <DropdownMenuItem 
              className="text-zinc-300 focus:bg-zinc-800 focus:text-zinc-100"
              onClick={() => {
                clearFilters();
                toast.success("Filters cleared");
              }}
            >
              <X className="w-4 h-4 mr-2" />
              Clear Filters
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* AI Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setAiPanelOpen(true);
            toast.success("AI Assistant opened");
          }}
          className="border-violet-500/30 bg-violet-500/10 text-violet-400 hover:bg-violet-500/20 hover:text-violet-300"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          AI
        </Button>

        {/* Create Issue */}
        <Button
          size="sm"
          onClick={() => setCreateIssueOpen(true)}
          className="bg-violet-600 hover:bg-violet-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Issue
        </Button>
      </div>
    </header>
  );
}
