"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { suggestTaskLabels, suggestPriority, breakdownTask, detectDuplicates } from "@/lib/ai";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Sparkles,
  Loader2,
  Tags,
  AlertTriangle,
  ListTree,
  Copy,
  Wand2,
  MessageSquare,
  Lightbulb,
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

type AIMode = "suggest" | "breakdown" | "duplicates" | "chat";

export function AiPanel() {
  const { aiPanelOpen, setAiPanelOpen, issues, addIssue } = useAppStore();
  const [mode, setMode] = useState<AIMode>("suggest");
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  // Results
  const [suggestedLabels, setSuggestedLabels] = useState<string[]>([]);
  const [suggestedPriority, setSuggestedPriority] = useState<string>("");
  const [subtasks, setSubtasks] = useState<string[]>([]);
  const [duplicates, setDuplicates] = useState<string[]>([]);
  const [chatResponse, setChatResponse] = useState("");

  const handleSuggest = async () => {
    if (!input.trim()) {
      toast.error("Please enter a task description");
      return;
    }
    
    setIsLoading(true);
    try {
      const [labels, priority] = await Promise.all([
        suggestTaskLabels(input, input),
        suggestPriority(input, input),
      ]);
      setSuggestedLabels(labels);
      setSuggestedPriority(priority);
      toast.success("AI suggestions ready!");
    } catch (error) {
      toast.error("Failed to get suggestions");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBreakdown = async () => {
    if (!input.trim()) {
      toast.error("Please enter a task to break down");
      return;
    }
    
    setIsLoading(true);
    try {
      const tasks = await breakdownTask(input, input);
      setSubtasks(tasks);
      toast.success("Task breakdown complete!");
    } catch (error) {
      toast.error("Failed to break down task");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDuplicateCheck = async () => {
    if (!input.trim()) {
      toast.error("Please enter a task title to check");
      return;
    }
    
    setIsLoading(true);
    try {
      const existingTitles = issues.map(i => i.title);
      const dups = await detectDuplicates(input, existingTitles);
      setDuplicates(dups);
      if (dups.length === 0) {
        toast.success("No duplicates found!");
      } else {
        toast.warning(`Found ${dups.length} potential duplicate(s)`);
      }
    } catch (error) {
      toast.error("Failed to check for duplicates");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChat = async () => {
    if (!input.trim()) {
      toast.error("Please enter a question");
      return;
    }
    
    setIsLoading(true);
    try {
      // Simulate AI chat response
      setChatResponse(`Here are some suggestions based on "${input}":\n\n• Consider breaking this down into smaller tasks\n• You might want to assign a priority level\n• Check if similar tasks exist in your backlog\n\nWant me to help with any of these?`);
      toast.success("AI response ready!");
    } catch (error) {
      toast.error("Failed to get response");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = () => {
    switch (mode) {
      case "suggest": handleSuggest(); break;
      case "breakdown": handleBreakdown(); break;
      case "duplicates": handleDuplicateCheck(); break;
      case "chat": handleChat(); break;
    }
  };

  const createSubtaskIssues = () => {
    subtasks.forEach((task, index) => {
      addIssue({
        id: `issue-${Date.now()}-${index}`,
        identifier: `LIN-${Math.floor(Math.random() * 1000)}`,
        title: task,
        description: `Subtask of: ${input}`,
        status: "backlog",
        priority: "medium",
        labels: suggestedLabels.slice(0, 2),
        project_id: null,
        assignee_id: null,
        parent_id: null,
        workspace_id: "ws-1",
        created_by: "user-1",
        due_date: null,
        estimate: null,
        order: index + 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    });
    toast.success(`Created ${subtasks.length} subtask issues!`);
    setSubtasks([]);
  };

  return (
    <Sheet open={aiPanelOpen} onOpenChange={setAiPanelOpen}>
      <SheetContent className="w-[400px] sm:w-[500px] bg-zinc-950 border-zinc-800 p-0">
        <SheetHeader className="p-4 border-b border-zinc-800">
          <SheetTitle className="flex items-center gap-2 text-zinc-100">
            <Sparkles className="w-5 h-5 text-violet-400" />
            AI Assistant
          </SheetTitle>
          <SheetDescription className="text-zinc-400">
            Get AI-powered help managing your tasks
          </SheetDescription>
        </SheetHeader>

        {/* Mode Selection */}
        <div className="p-4 border-b border-zinc-800">
          <div className="flex gap-2">
            {[
              { id: "suggest", label: "Suggest", icon: Tags },
              { id: "breakdown", label: "Breakdown", icon: ListTree },
              { id: "duplicates", label: "Duplicates", icon: AlertTriangle },
              { id: "chat", label: "Chat", icon: MessageSquare },
            ].map(({ id, label, icon: Icon }) => (
              <Button
                key={id}
                variant="ghost"
                size="sm"
                onClick={() => setMode(id as AIMode)}
                className={cn(
                  "flex-1 text-xs",
                  mode === id
                    ? "bg-violet-500/20 text-violet-400"
                    : "text-zinc-400 hover:text-zinc-100"
                )}
              >
                <Icon className="w-3 h-3 mr-1" />
                {label}
              </Button>
            ))}
          </div>
        </div>

        <ScrollArea className="h-[calc(100vh-200px)]">
          <div className="p-4 space-y-4">
            {/* Input */}
            <div className="space-y-2">
              <label className="text-sm text-zinc-400">
                {mode === "suggest" && "Task Description"}
                {mode === "breakdown" && "Complex Task to Break Down"}
                {mode === "duplicates" && "Task Title to Check"}
                {mode === "chat" && "Ask AI anything..."}
              </label>
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  mode === "suggest" ? "Describe the task you want to create..."
                  : mode === "breakdown" ? "Enter a complex task to break into subtasks..."
                  : mode === "duplicates" ? "Enter a task title to check for similar issues..."
                  : "What would you like help with?"
                }
                className="min-h-[100px] bg-zinc-900 border-zinc-800 text-zinc-100 placeholder:text-zinc-500"
              />
            </div>

            {/* Action Button */}
            <Button
              onClick={handleAction}
              disabled={isLoading || !input.trim()}
              className="w-full bg-violet-600 hover:bg-violet-700 text-white"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Wand2 className="w-4 h-4 mr-2" />
              )}
              {isLoading ? "Processing..." : "Generate"}
            </Button>

            <Separator className="bg-zinc-800" />

            {/* Results */}
            <AnimatePresence mode="wait">
              {/* Suggest Results */}
              {mode === "suggest" && (suggestedLabels.length > 0 || suggestedPriority) && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  {suggestedLabels.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm text-zinc-400 flex items-center gap-2">
                        <Tags className="w-4 h-4" />
                        Suggested Labels
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {suggestedLabels.map((label) => (
                          <Badge
                            key={label}
                            variant="outline"
                            className="bg-violet-500/10 text-violet-300 border-violet-500/30 cursor-pointer hover:bg-violet-500/20"
                            onClick={() => {
                              navigator.clipboard.writeText(label);
                              toast.success(`Copied: ${label}`);
                            }}
                          >
                            {label}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {suggestedPriority && (
                    <div className="space-y-2">
                      <p className="text-sm text-zinc-400">Suggested Priority</p>
                      <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/30">
                        {suggestedPriority}
                      </Badge>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Breakdown Results */}
              {mode === "breakdown" && subtasks.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-2"
                >
                  <p className="text-sm text-zinc-400 flex items-center gap-2">
                    <ListTree className="w-4 h-4" />
                    Suggested Subtasks
                  </p>
                  <div className="space-y-2">
                    {subtasks.map((task, i) => (
                      <div
                        key={i}
                        className="p-2 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-zinc-300"
                      >
                        {i + 1}. {task}
                      </div>
                    ))}
                  </div>
                  <Button
                    onClick={createSubtaskIssues}
                    variant="outline"
                    className="w-full border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Create All as Issues
                  </Button>
                </motion.div>
              )}

              {/* Duplicates Results */}
              {mode === "duplicates" && duplicates.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-2"
                >
                  <p className="text-sm text-amber-400 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    Potential Duplicates Found
                  </p>
                  <div className="space-y-2">
                    {duplicates.map((dup, i) => (
                      <div
                        key={i}
                        className="p-2 bg-amber-500/10 border border-amber-500/30 rounded-lg text-sm text-amber-200"
                      >
                        {dup}
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {mode === "duplicates" && duplicates.length === 0 && input && !isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-4 text-green-400"
                >
                  ✓ No duplicates found! Safe to create.
                </motion.div>
              )}

              {/* Chat Results */}
              {mode === "chat" && chatResponse && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-2"
                >
                  <p className="text-sm text-zinc-400 flex items-center gap-2">
                    <Lightbulb className="w-4 h-4" />
                    AI Response
                  </p>
                  <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-zinc-300 whitespace-pre-wrap">
                    {chatResponse}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
