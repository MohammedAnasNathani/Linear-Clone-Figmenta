"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Status, Priority, STATUS_CONFIG, PRIORITY_CONFIG, LABEL_COLORS } from "@/lib/types";
import { generateIssueId, generateIssueIdentifier } from "@/lib/mock-data";
import { suggestTaskLabels, suggestPriority, detectDuplicates } from "@/lib/ai";
import { Sparkles, Loader2, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const AVAILABLE_LABELS = [
  "bug", "feature", "improvement", "documentation", "design",
  "urgent", "low-priority", "backend", "frontend", "mobile", "api", "security", "performance"
];

export function CreateIssueDialog() {
  const { createIssueOpen, setCreateIssueOpen, addIssue, currentProject, issues } = useAppStore();
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<Status>("backlog");
  const [priority, setPriority] = useState<Priority>("medium");
  const [labels, setLabels] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [duplicateWarning, setDuplicateWarning] = useState<string[]>([]);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setStatus("backlog");
    setPriority("medium");
    setLabels([]);
    setDuplicateWarning([]);
  };

  const handleClose = () => {
    setCreateIssueOpen(false);
    resetForm();
  };

  const handleCreate = () => {
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }

    const newIssue = {
      id: generateIssueId(),
      identifier: generateIssueIdentifier(),
      title: title.trim(),
      description: description.trim() || null,
      status,
      priority,
      labels,
      assignee_id: null,
      project_id: currentProject?.id || null,
      workspace_id: "ws-1",
      created_by: "user-1",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      due_date: null,
      estimate: null,
      parent_id: null,
      order: issues.length + 1,
    };

    addIssue(newIssue);
    toast.success(`Created ${newIssue.identifier}`);
    handleClose();
  };

  const handleAISuggest = async () => {
    if (!title.trim()) {
      toast.error("Enter a title first");
      return;
    }

    setIsLoading(true);
    try {
      const [suggestedLabels, suggestedPriority, duplicates] = await Promise.all([
        suggestTaskLabels(title, description),
        suggestPriority(title, description),
        detectDuplicates(title, issues.map(i => i.title)),
      ]);

      if (suggestedLabels.length > 0) {
        setLabels(prev => [...new Set([...prev, ...suggestedLabels])]);
      }
      
      if (suggestedPriority) {
        setPriority(suggestedPriority as Priority);
      }

      if (duplicates.length > 0) {
        setDuplicateWarning(duplicates);
      }

      toast.success("AI suggestions applied!");
    } catch (error) {
      toast.error("Failed to get AI suggestions");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleLabel = (label: string) => {
    setLabels(prev => 
      prev.includes(label) 
        ? prev.filter(l => l !== label)
        : [...prev, label]
    );
  };

  return (
    <Dialog open={createIssueOpen} onOpenChange={setCreateIssueOpen}>
      <DialogContent className="sm:max-w-[550px] bg-zinc-950 border-zinc-800 p-0">
        <DialogHeader className="p-4 border-b border-zinc-800">
          <DialogTitle className="text-zinc-100 flex items-center gap-2">
            Create Issue
            {currentProject && (
              <Badge variant="outline" className="text-xs text-zinc-400 border-zinc-700">
                {currentProject.icon} {currentProject.name}
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="p-4 space-y-4">
          {/* Duplicate Warning */}
          {duplicateWarning.length > 0 && (
            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="text-amber-500 font-medium">Possible duplicates detected:</p>
                <ul className="text-amber-400/80 mt-1">
                  {duplicateWarning.map((dup, i) => (
                    <li key={i} className="text-xs">• {dup}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Title */}
          <div>
            <Input
              placeholder="Issue title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-lg bg-zinc-900 border-zinc-800 text-zinc-100 placeholder:text-zinc-500"
              autoFocus
            />
          </div>

          {/* Description */}
          <Textarea
            placeholder="Add description..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="min-h-[80px] bg-zinc-900 border-zinc-800 text-zinc-300 resize-none placeholder:text-zinc-500"
          />

          {/* Properties Row */}
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-xs text-zinc-500 mb-1 block">Status</label>
              <Select value={status} onValueChange={(v) => setStatus(v as Status)}>
                <SelectTrigger className="bg-zinc-900 border-zinc-800 text-zinc-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-800">
                  {Object.entries(STATUS_CONFIG).slice(0, 4).map(([s, config]) => (
                    <SelectItem key={s} value={s} className="text-zinc-300 focus:bg-zinc-800">
                      <div className="flex items-center gap-2">
                        <div className={cn("w-2 h-2 rounded-full", config.bgColor.replace("/20", ""))} />
                        {config.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1">
              <label className="text-xs text-zinc-500 mb-1 block">Priority</label>
              <Select value={priority} onValueChange={(v) => setPriority(v as Priority)}>
                <SelectTrigger className="bg-zinc-900 border-zinc-800 text-zinc-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-800">
                  {Object.entries(PRIORITY_CONFIG).map(([p, config]) => (
                    <SelectItem key={p} value={p} className="text-zinc-300 focus:bg-zinc-800">
                      <div className="flex items-center gap-2">
                        {config.icon} {config.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Labels */}
          <div>
            <label className="text-xs text-zinc-500 mb-2 block">Labels</label>
            <div className="flex flex-wrap gap-1.5">
              {AVAILABLE_LABELS.map((label) => (
                <Badge
                  key={label}
                  variant="outline"
                  onClick={() => toggleLabel(label)}
                  className={cn(
                    "text-xs border cursor-pointer transition-all",
                    labels.includes(label)
                      ? LABEL_COLORS[label] || "bg-zinc-500/20 text-zinc-400 border-zinc-500/30"
                      : "bg-transparent text-zinc-500 border-zinc-700 hover:border-zinc-600"
                  )}
                >
                  {label}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-800 flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handleAISuggest}
            disabled={isLoading}
            className="border-violet-500/30 bg-violet-500/10 text-violet-400 hover:bg-violet-500/20"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4 mr-2" />
            )}
            AI Suggest
          </Button>

          <div className="flex gap-2">
            <Button variant="ghost" onClick={handleClose} className="text-zinc-400 hover:text-zinc-100">
              Cancel
            </Button>
            <Button onClick={handleCreate} className="bg-violet-600 hover:bg-violet-700 text-white">
              Create Issue
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
