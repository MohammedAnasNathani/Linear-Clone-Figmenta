"use client";

import { cn } from "@/lib/utils";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  LayoutGrid,
  Inbox,
  Search,
  Settings,
  ChevronLeft,
  ChevronRight,
  Plus,
  Home,
  CircleDot,
  Users,
  Sparkles,
  Check,
  Moon,
  Bell,
  Palette,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useState } from "react";

export function Sidebar() {
  const {
    sidebarCollapsed,
    toggleSidebar,
    currentWorkspace,
    projects,
    currentProject,
    setCurrentProject,
    setCommandPaletteOpen,
    setCreateIssueOpen,
    sidebarView,
    setSidebarView,
    setAiPanelOpen,
    users,
    addProject,
  } = useAppStore();

  // Dialog states
  const [teamDialogOpen, setTeamDialogOpen] = useState(false);
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
  const [createProjectDialogOpen, setCreateProjectDialogOpen] = useState(false);
  const [inviteMemberDialogOpen, setInviteMemberDialogOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectIcon, setNewProjectIcon] = useState("📁");
  const [inviteEmail, setInviteEmail] = useState("");

  const handleNavClick = (view: "all" | "inbox" | "my-issues" | "ai") => {
    setSidebarView(view);
    setCurrentProject(null);
    if (view === "ai") {
      setAiPanelOpen(true);
      toast.success("AI Assistant opened");
    } else if (view === "inbox") {
      toast.info("Inbox: 3 notifications");
    } else if (view === "my-issues") {
      toast.info("Showing your assigned issues");
    }
  };

  const handleCreateProject = () => {
    if (!newProjectName.trim()) {
      toast.error("Please enter a project name");
      return;
    }
    
    addProject({
      id: `project-${Date.now()}`,
      name: newProjectName,
      description: null,
      icon: newProjectIcon,
      color: "#8b5cf6",
      workspace_id: currentWorkspace?.id || "ws-1",
      lead_id: null,
      status: "in-progress",
      start_date: new Date().toISOString(),
      target_date: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
    
    toast.success(`Created project: ${newProjectName}`);
    setNewProjectName("");
    setNewProjectIcon("📁");
    setCreateProjectDialogOpen(false);
  };

  const projectIcons = ["📁", "🚀", "💡", "🎯", "⚡", "🔧", "📦", "🎨", "📱", "🌐"];

  return (
    <>
      <motion.aside
        initial={false}
        animate={{ width: sidebarCollapsed ? 60 : 240 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        className="h-screen bg-zinc-950 border-r border-zinc-800 flex flex-col"
      >
        {/* Workspace Header */}
        <div className="p-3 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
            {currentWorkspace?.icon || "F"}
          </div>
          <AnimatePresence>
            {!sidebarCollapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="flex-1 overflow-hidden"
              >
                <h2 className="text-sm font-semibold text-white truncate">
                  {currentWorkspace?.name || "Figmenta"}
                </h2>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <Separator className="bg-zinc-800" />

        {/* Quick Actions */}
        <div className="p-2 space-y-1">
          <SidebarButton
            icon={<Search className="w-4 h-4" />}
            label="Search"
            collapsed={sidebarCollapsed}
            shortcut="⌘K"
            onClick={() => setCommandPaletteOpen(true)}
          />
          <SidebarButton
            icon={<Plus className="w-4 h-4" />}
            label="New Issue"
            collapsed={sidebarCollapsed}
            shortcut="C"
            onClick={() => setCreateIssueOpen(true)}
          />
        </div>

        <Separator className="bg-zinc-800" />

        {/* Main Navigation */}
        <div className="p-2 space-y-1">
          <SidebarButton
            icon={<Home className="w-4 h-4" />}
            label="All Issues"
            collapsed={sidebarCollapsed}
            active={sidebarView === "all" && !currentProject}
            onClick={() => handleNavClick("all")}
          />
          <SidebarButton
            icon={<Inbox className="w-4 h-4" />}
            label="Inbox"
            collapsed={sidebarCollapsed}
            badge={3}
            active={sidebarView === "inbox"}
            onClick={() => handleNavClick("inbox")}
          />
          <SidebarButton
            icon={<CircleDot className="w-4 h-4" />}
            label="My Issues"
            collapsed={sidebarCollapsed}
            active={sidebarView === "my-issues"}
            onClick={() => handleNavClick("my-issues")}
          />
          <SidebarButton
            icon={<Sparkles className="w-4 h-4" />}
            label="AI Assistant"
            collapsed={sidebarCollapsed}
            className="text-purple-400 hover:text-purple-300"
            active={sidebarView === "ai"}
            onClick={() => handleNavClick("ai")}
          />
        </div>

        <Separator className="bg-zinc-800" />

        {/* Projects */}
        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="px-3 py-2 flex items-center justify-between">
            <AnimatePresence>
              {!sidebarCollapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-xs font-medium text-zinc-500 uppercase tracking-wider"
                >
                  Projects
                </motion.span>
              )}
            </AnimatePresence>
            {!sidebarCollapsed && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="w-5 h-5 text-zinc-500 hover:text-zinc-300"
                onClick={() => setCreateProjectDialogOpen(true)}
              >
                <Plus className="w-3 h-3" />
              </Button>
            )}
          </div>
          <ScrollArea className="flex-1 px-2">
            <div className="space-y-1 pb-2">
              {projects.map((project) => (
                <SidebarButton
                  key={project.id}
                  icon={<span className="text-sm">{project.icon || "📁"}</span>}
                  label={project.name}
                  collapsed={sidebarCollapsed}
                  active={currentProject?.id === project.id}
                  onClick={() => {
                    setCurrentProject(project);
                    setSidebarView("all");
                    toast.success(`Switched to ${project.name}`);
                  }}
                />
              ))}
            </div>
          </ScrollArea>
        </div>

        <Separator className="bg-zinc-800" />

        {/* Footer */}
        <div className="p-2 space-y-1">
          <SidebarButton
            icon={<Users className="w-4 h-4" />}
            label="Team"
            collapsed={sidebarCollapsed}
            onClick={() => setTeamDialogOpen(true)}
          />
          <SidebarButton
            icon={<Settings className="w-4 h-4" />}
            label="Settings"
            collapsed={sidebarCollapsed}
            onClick={() => setSettingsDialogOpen(true)}
          />
        </div>

        {/* Collapse Button */}
        <div className="p-2 border-t border-zinc-800">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSidebar}
            className={cn(
              "w-full text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800",
              sidebarCollapsed && "justify-center px-2"
            )}
          >
            {sidebarCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <>
                <ChevronLeft className="w-4 h-4 mr-2" />
                <span>Collapse</span>
              </>
            )}
          </Button>
        </div>
      </motion.aside>

      {/* Team Dialog */}
      <Dialog open={teamDialogOpen} onOpenChange={setTeamDialogOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-zinc-100 flex items-center gap-2">
              <Users className="w-5 h-5 text-violet-400" />
              Team Members
            </DialogTitle>
            <DialogDescription>
              View and manage your team members
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-4">
            {users.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-gradient-to-br from-violet-500 to-purple-600 text-white text-xs">
                      {user.name?.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium text-zinc-200">{user.name}</p>
                    <p className="text-xs text-zinc-500">{user.email}</p>
                  </div>
                </div>
                <span className="text-xs text-zinc-500 bg-zinc-800 px-2 py-1 rounded">
                  {user.role}
                </span>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTeamDialogOpen(false)} className="border-zinc-700">
              Close
            </Button>
            <Button className="bg-violet-600 hover:bg-violet-700" onClick={() => {
              setTeamDialogOpen(false);
              setInviteMemberDialogOpen(true);
            }}>
              Invite Member
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={settingsDialogOpen} onOpenChange={setSettingsDialogOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-zinc-100 flex items-center gap-2">
              <Settings className="w-5 h-5 text-violet-400" />
              Settings
            </DialogTitle>
            <DialogDescription>
              Configure your workspace preferences
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg">
              <div className="flex items-center gap-3">
                <Moon className="w-5 h-5 text-zinc-400" />
                <div>
                  <p className="text-sm font-medium text-zinc-200">Dark Mode</p>
                  <p className="text-xs text-zinc-500">Use dark theme</p>
                </div>
              </div>
              <Check className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-zinc-400" />
                <div>
                  <p className="text-sm font-medium text-zinc-200">Notifications</p>
                  <p className="text-xs text-zinc-500">Enable desktop notifications</p>
                </div>
              </div>
              <Check className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg">
              <div className="flex items-center gap-3">
                <Palette className="w-5 h-5 text-zinc-400" />
                <div>
                  <p className="text-sm font-medium text-zinc-200">Accent Color</p>
                  <p className="text-xs text-zinc-500">Violet (default)</p>
                </div>
              </div>
              <div className="w-5 h-5 rounded-full bg-violet-500" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSettingsDialogOpen(false)} className="border-zinc-700">
              Close
            </Button>
            <Button className="bg-violet-600 hover:bg-violet-700" onClick={() => {
              toast.success("Settings saved!");
              setSettingsDialogOpen(false);
            }}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Project Dialog */}
      <Dialog open={createProjectDialogOpen} onOpenChange={setCreateProjectDialogOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-zinc-100 flex items-center gap-2">
              <Plus className="w-5 h-5 text-violet-400" />
              Create New Project
            </DialogTitle>
            <DialogDescription>
              Add a new project to organize your issues
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-zinc-300">Project Name</Label>
              <Input 
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                placeholder="Enter project name..."
                className="bg-zinc-800 border-zinc-700 text-zinc-100"
                onKeyDown={(e) => e.key === "Enter" && handleCreateProject()}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-300">Icon</Label>
              <div className="flex flex-wrap gap-2">
                {projectIcons.map((icon) => (
                  <button
                    key={icon}
                    onClick={() => setNewProjectIcon(icon)}
                    className={cn(
                      "w-10 h-10 rounded-lg text-xl flex items-center justify-center transition-all",
                      newProjectIcon === icon 
                        ? "bg-violet-500/20 ring-2 ring-violet-500" 
                        : "bg-zinc-800 hover:bg-zinc-700"
                    )}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateProjectDialogOpen(false)} className="border-zinc-700">
              Cancel
            </Button>
            <Button className="bg-violet-600 hover:bg-violet-700" onClick={handleCreateProject}>
              Create Project
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Invite Member Dialog */}
      <Dialog open={inviteMemberDialogOpen} onOpenChange={setInviteMemberDialogOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-zinc-100 flex items-center gap-2">
              <Users className="w-5 h-5 text-violet-400" />
              Invite Team Member
            </DialogTitle>
            <DialogDescription>
              Send an invitation to join your workspace
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-zinc-300">Email Address</Label>
              <Input 
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="colleague@company.com"
                className="bg-zinc-800 border-zinc-700 text-zinc-100"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && inviteEmail.includes("@")) {
                    toast.success(`Invitation sent to ${inviteEmail}`);
                    setInviteEmail("");
                    setInviteMemberDialogOpen(false);
                  }
                }}
              />
            </div>
            <div className="bg-zinc-800/50 rounded-lg p-3">
              <p className="text-xs text-zinc-400">
                The invited member will receive an email with a link to join your workspace. They&apos;ll have access to all projects and issues.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setInviteMemberDialogOpen(false)} className="border-zinc-700">
              Cancel
            </Button>
            <Button 
              className="bg-violet-600 hover:bg-violet-700" 
              onClick={() => {
                if (!inviteEmail.includes("@")) {
                  toast.error("Please enter a valid email address");
                  return;
                }
                toast.success(`Invitation sent to ${inviteEmail}`);
                setInviteEmail("");
                setInviteMemberDialogOpen(false);
              }}
            >
              Send Invite
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

interface SidebarButtonProps {
  icon: React.ReactNode;
  label: string;
  collapsed?: boolean;
  active?: boolean;
  shortcut?: string;
  badge?: number;
  className?: string;
  onClick?: () => void;
}

function SidebarButton({
  icon,
  label,
  collapsed,
  active,
  shortcut,
  badge,
  className,
  onClick,
}: SidebarButtonProps) {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      className={cn(
        "w-full justify-start text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/80 transition-all",
        active && "bg-violet-500/10 text-violet-400 hover:bg-violet-500/20 hover:text-violet-300",
        collapsed && "justify-center px-2",
        className
      )}
    >
      <span className="shrink-0">{icon}</span>
      <AnimatePresence>
        {!collapsed && (
          <motion.span
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: "auto" }}
            exit={{ opacity: 0, width: 0 }}
            className="ml-2 flex-1 text-left truncate text-sm"
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>
      {!collapsed && shortcut && (
        <span className="ml-auto text-xs text-zinc-600 font-mono">{shortcut}</span>
      )}
      {!collapsed && badge !== undefined && badge > 0 && (
        <span className="ml-auto text-xs bg-violet-500/20 text-violet-400 px-1.5 py-0.5 rounded-full">
          {badge}
        </span>
      )}
    </Button>
  );
}
