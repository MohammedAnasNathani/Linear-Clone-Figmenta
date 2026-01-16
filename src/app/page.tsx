"use client";

import { useEffect } from "react";
import { useAppStore } from "@/lib/store";
import { mockWorkspace, mockUsers, mockProjects, mockIssues } from "@/lib/mock-data";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { BoardView } from "@/components/issues/board-view";
import { ListView } from "@/components/issues/list-view";
import { IssueDetail } from "@/components/issues/issue-detail";
import { CreateIssueDialog } from "@/components/issues/create-issue-dialog";
import { CommandPalette } from "@/components/command-palette";
import { AiPanel } from "@/components/ai-panel";

export default function Home() {
  const {
    setWorkspaces,
    setCurrentWorkspace,
    setUsers,
    setProjects,
    setIssues,
    currentView,
    issues,
  } = useAppStore();

  // Initialize with mock data on mount (only if empty)
  useEffect(() => {
    if (issues.length === 0) {
      setWorkspaces([mockWorkspace]);
      setCurrentWorkspace(mockWorkspace);
      setUsers(mockUsers);
      setProjects(mockProjects);
      setIssues(mockIssues);
    }
  }, [setWorkspaces, setCurrentWorkspace, setUsers, setProjects, setIssues, issues.length]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if input focused
      if (document.activeElement?.tagName === "INPUT" || 
          document.activeElement?.tagName === "TEXTAREA") {
        return;
      }

      const { setCommandPaletteOpen, setCreateIssueOpen, setCurrentView, currentView } = useAppStore.getState();

      // ⌘K or Ctrl+K - Command palette
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCommandPaletteOpen(true);
      }

      // C - Create issue
      if (e.key === "c" && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        setCreateIssueOpen(true);
      }

      // B - Board view
      if (e.key === "b" && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        setCurrentView("board");
      }

      // L - List view
      if (e.key === "l" && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        setCurrentView("list");
      }

      // I - AI Panel
      if (e.key === "i" && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        const { setAiPanelOpen } = useAppStore.getState();
        setAiPanelOpen(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="flex h-screen bg-zinc-950 overflow-hidden">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header />

        {/* Content Area */}
        <div className="flex-1 overflow-hidden">
          {currentView === "board" ? <BoardView /> : <ListView />}
        </div>
      </main>

      {/* Modals & Overlays */}
      <IssueDetail />
      <CreateIssueDialog />
      <CommandPalette />
      <AiPanel />
    </div>
  );
}
