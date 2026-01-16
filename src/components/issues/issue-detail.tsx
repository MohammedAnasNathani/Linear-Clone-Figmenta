"use client";

import { useAppStore } from "@/lib/store";
import {
  Sheet,
  SheetContent,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  STATUS_CONFIG,
  PRIORITY_CONFIG,
  LABEL_COLORS,
  Status,
  Priority,
} from "@/lib/types";
import {
  X,
  Trash2,
  Copy,
  ExternalLink,
  Sparkles,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { suggestTaskLabels, suggestPriority, improveDescription, breakdownTask } from "@/lib/ai";
import { toast } from "sonner";

export function IssueDetail() {
  const { selectedIssue, setSelectedIssue, updateIssue, deleteIssue, users } = useAppStore();
  const [isAILoading, setIsAILoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<{
    labels?: string[];
    priority?: string;
    improvedDescription?: string;
    subtasks?: string[];
  }>({});

  const handleClose = () => {
    setSelectedIssue(null);
    setAiSuggestions({});
  };

  const handleDelete = () => {
    if (selectedIssue) {
      deleteIssue(selectedIssue.id);
      toast.success("Issue deleted");
    }
  };

  const handleStatusChange = (status: Status) => {
    if (selectedIssue) updateIssue(selectedIssue.id, { status });
  };

  const handlePriorityChange = (priority: Priority) => {
    if (selectedIssue) updateIssue(selectedIssue.id, { priority });
  };

  const handleAssigneeChange = (assigneeId: string) => {
    if (selectedIssue) updateIssue(selectedIssue.id, { assignee_id: assigneeId === "unassigned" ? null : assigneeId });
  };

  const handleAISuggest = async () => {
    if (!selectedIssue) return;
    
    setIsAILoading(true);
    try {
      const [labels, priority, improvedDescription] = await Promise.all([
        suggestTaskLabels(selectedIssue.title, selectedIssue.description || ""),
        suggestPriority(selectedIssue.title, selectedIssue.description || ""),
        improveDescription(selectedIssue.title, selectedIssue.description || ""),
      ]);
      setAiSuggestions({ labels, priority, improvedDescription });
      toast.success("AI suggestions ready!");
    } catch (error) {
      toast.error("Failed to get AI suggestions");
    } finally {
      setIsAILoading(false);
    }
  };

  const applyLabel = (label: string) => {
    if (selectedIssue && !selectedIssue.labels.includes(label)) {
      updateIssue(selectedIssue.id, { labels: [...selectedIssue.labels, label] });
      toast.success(`Added label: ${label}`);
    }
  };

  const applyImprovedDescription = () => {
    if (selectedIssue && aiSuggestions.improvedDescription) {
      updateIssue(selectedIssue.id, { description: aiSuggestions.improvedDescription });
      toast.success("Description updated");
    }
  };

  const handleBreakdown = async () => {
    if (!selectedIssue) return;
    setIsAILoading(true);
    try {
      const subtasks = await breakdownTask(selectedIssue.title, selectedIssue.description || "");
      setAiSuggestions((prev) => ({ ...prev, subtasks }));
      toast.success("Subtasks generated!");
    } catch (error) {
      toast.error("Failed to break down task");
    } finally {
      setIsAILoading(false);
    }
  };

  return (
    <Sheet open={!!selectedIssue} onOpenChange={(open) => !open && handleClose()}>
      <SheetContent className="w-[600px] sm:max-w-[600px] bg-[#0A0A0C] border-l border-white/10 p-0 overflow-hidden shadow-2xl shadow-black/50">
        {selectedIssue && (
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono font-medium text-zinc-500 tracking-wider">{selectedIssue.identifier}</span>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="w-8 h-8 text-zinc-500 hover:text-zinc-200 transition-colors">
                  <Copy className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="w-8 h-8 text-zinc-500 hover:text-zinc-200 transition-colors">
                  <ExternalLink className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={handleDelete} className="w-8 h-8 text-zinc-500 hover:text-red-400 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={handleClose} className="w-8 h-8 text-zinc-500 hover:text-zinc-200 transition-colors">
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-8 py-6 space-y-8">
              {/* Title */}
              <Input
                value={selectedIssue.title}
                onChange={(e) => updateIssue(selectedIssue.id, { title: e.target.value })}
                className="text-2xl font-semibold bg-transparent border-none p-0 h-auto focus-visible:ring-0 text-white placeholder:text-zinc-600 tracking-tight"
                placeholder="Issue Title"
              />

              {/* Properties Grid */}
              <div className="grid grid-cols-2 gap-x-8 gap-y-6 p-5 rounded-xl border border-white/5 bg-white/[0.02]">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">Status</label>
                  <Select value={selectedIssue.status} onValueChange={handleStatusChange}>
                    <SelectTrigger className="bg-transparent border-white/5 hover:bg-white/5 text-zinc-300 h-9 text-xs transition-colors">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#18181b] border-white/10">
                      {Object.entries(STATUS_CONFIG).map(([status, config]) => (
                        <SelectItem key={status} value={status} className="text-zinc-300 focus:bg-white/5 text-xs">
                          <div className="flex items-center gap-2">
                            <div className={cn("w-2 h-2 rounded-full", config.bgColor.replace("/20", ""))} />
                            {config.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">Priority</label>
                  <Select value={selectedIssue.priority} onValueChange={handlePriorityChange}>
                    <SelectTrigger className="bg-transparent border-white/5 hover:bg-white/5 text-zinc-300 h-9 text-xs transition-colors">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#18181b] border-white/10">
                      {Object.entries(PRIORITY_CONFIG).map(([priority, config]) => (
                        <SelectItem key={priority} value={priority} className="text-zinc-300 focus:bg-white/5 text-xs">
                          <div className="flex items-center gap-2">
                            {config.icon} {config.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">Assignee</label>
                  <Select value={selectedIssue.assignee_id || "unassigned"} onValueChange={handleAssigneeChange}>
                    <SelectTrigger className="bg-transparent border-white/5 hover:bg-white/5 text-zinc-300 h-9 text-xs transition-colors">
                      <SelectValue placeholder="Unassigned" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#18181b] border-white/10">
                      <SelectItem value="unassigned" className="text-zinc-300 focus:bg-white/5 text-xs">Unassigned</SelectItem>
                      {users.map((user) => (
                        <SelectItem key={user.id} value={user.id} className="text-zinc-300 focus:bg-white/5 text-xs">
                          <div className="flex items-center gap-2">
                            <Avatar className="w-4 h-4">
                              <AvatarFallback className="text-[8px] bg-indigo-500 text-white">
                                {user.name?.slice(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            {user.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">Estimate</label>
                  <Input
                    type="number"
                    value={selectedIssue.estimate || ""}
                    onChange={(e) => updateIssue(selectedIssue.id, { estimate: parseInt(e.target.value) || null })}
                    placeholder="Points"
                    className="bg-transparent border-white/5 hover:bg-white/5 text-zinc-300 h-9 text-xs"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">Description</label>
                <Textarea
                  value={selectedIssue.description || ""}
                  onChange={(e) => updateIssue(selectedIssue.id, { description: e.target.value })}
                  placeholder="Add a detailed description..."
                  className="min-h-[150px] bg-transparent border-white/5 focus-visible:ring-1 focus-visible:ring-white/10 text-zinc-300 resize-none text-sm leading-relaxed"
                />
              </div>

              {/* Labels with AI */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">Labels</label>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleAISuggest}
                    className="h-6 text-[10px] text-violet-400 hover:text-violet-300 hover:bg-violet-500/10 px-2"
                    disabled={isAILoading}
                  >
                    {isAILoading ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Sparkles className="w-3 h-3 mr-1" />}
                    Auto-Label
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedIssue.labels.map((label) => (
                    <Badge
                      key={label}
                      className={cn(
                        "text-[10px] px-2 py-0.5 border cursor-pointer hover:opacity-80 transition-opacity font-medium",
                        LABEL_COLORS[label] || "bg-zinc-800 text-zinc-400 border-zinc-700"
                      )}
                      onClick={() => {
                        const newLabels = selectedIssue.labels.filter((l) => l !== label);
                        updateIssue(selectedIssue.id, { labels: newLabels });
                      }}
                    >
                      {label}
                    </Badge>
                  ))}
                  <Button variant="outline" size="sm" className="h-5 text-[10px] border-white/10 bg-transparent text-zinc-500 hover:text-zinc-300 hover:border-white/20">
                    + Add
                  </Button>
                </div>
              </div>

              {/* AI Suggestions Panel */}
              {((aiSuggestions.labels && aiSuggestions.labels.length > 0) || aiSuggestions.improvedDescription || (aiSuggestions.subtasks && aiSuggestions.subtasks.length > 0)) && (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 rounded-xl border border-violet-500/20 bg-violet-500/5 p-4 space-y-4">
                  <div className="flex items-center gap-2 text-violet-400">
                    <Sparkles className="w-4 h-4" />
                    <span className="text-xs font-medium">AI Suggestions</span>
                  </div>
                  
                  {aiSuggestions.labels && aiSuggestions.labels.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-[10px] text-zinc-500 uppercase">Tags</p>
                      <div className="flex flex-wrap gap-1">
                        {aiSuggestions.labels.map((label) => (
                          <Badge
                            key={label}
                            variant="outline"
                            className="text-[10px] border-violet-500/30 text-violet-300 cursor-pointer hover:bg-violet-500/20"
                            onClick={() => applyLabel(label)}
                          >
                            + {label}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {aiSuggestions.improvedDescription && (
                    <div className="space-y-2">
                      <p className="text-[10px] text-zinc-500 uppercase">Polished Description</p>
                      <div className="p-3 bg-violet-500/10 rounded-lg border border-violet-500/10">
                        <p className="text-xs text-zinc-300">{aiSuggestions.improvedDescription}</p>
                      </div>
                      <Button size="sm" onClick={applyImprovedDescription} className="w-full bg-violet-600 hover:bg-violet-700 text-white text-xs h-7">
                        Replace Description
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* Subtasks actions */}
              <div className="pt-4 border-t border-white/5">
                <Button
                  variant="outline"
                  onClick={handleBreakdown}
                  disabled={isAILoading}
                  className="w-full border-white/10 bg-white/5 hover:bg-white/10 text-zinc-300 justify-start"
                >
                  <span className="mr-2">⚡️</span> Breakdown into Subtasks
                </Button>
                {aiSuggestions.subtasks && aiSuggestions.subtasks.length > 0 && (
                  <div className="mt-4 space-y-2 pl-2 border-l border-white/10">
                    {aiSuggestions.subtasks.map((task, i) => (
                      <div key={i} className="flex items-center gap-3 text-sm text-zinc-400">
                        <div className="w-4 h-4 rounded-sm border border-zinc-700 flex items-center justify-center text-[9px]">{i+1}</div>
                        {task}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
