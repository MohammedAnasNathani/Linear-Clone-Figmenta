"use client";

import { useIssuesByStatus, useAppStore } from "@/lib/store";
import { Status, STATUS_CONFIG, Issue } from "@/lib/types";
import { IssueCard } from "./issue-card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  rectIntersection,
  pointerWithin,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  useDroppable,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

const VISIBLE_STATUSES: Status[] = ["backlog", "todo", "in-progress", "in-review", "done"];

export function BoardView() {
  const issuesByStatus = useIssuesByStatus();
  const { moveIssue, issues, setCreateIssueOpen } = useAppStore();
  const [activeIssue, setActiveIssue] = useState<Issue | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const issue = issues.find((i) => i.id === active.id);
    if (issue) {
      setActiveIssue(issue);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveIssue(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Find the issue being dragged
    const draggedIssue = issues.find((i) => i.id === activeId);
    if (!draggedIssue) return;

    // Check if dropped on a column
    if (VISIBLE_STATUSES.includes(overId as Status)) {
      if (draggedIssue.status !== overId) {
        moveIssue(activeId, overId as Status);
        toast.success(`Moved to ${STATUS_CONFIG[overId as Status].label}`);
      }
      return;
    }

    // Check if dropped on another issue - use that issue's column
    const overIssue = issues.find((i) => i.id === overId);
    if (overIssue && draggedIssue.status !== overIssue.status) {
      moveIssue(activeId, overIssue.status);
      toast.success(`Moved to ${STATUS_CONFIG[overIssue.status].label}`);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={pointerWithin}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 p-4 h-[calc(100vh-3.5rem)] overflow-x-auto">
        {VISIBLE_STATUSES.map((status) => (
          <BoardColumn
            key={status}
            status={status}
            issues={issuesByStatus[status]}
            onCreateIssue={() => setCreateIssueOpen(true)}
          />
        ))}
      </div>

      <DragOverlay dropAnimation={{ duration: 200, easing: "ease" }}>
        {activeIssue && <IssueCard issue={activeIssue} isDragging />}
      </DragOverlay>
    </DndContext>
  );
}

interface BoardColumnProps {
  status: Status;
  issues: Issue[];
  onCreateIssue: () => void;
}

function BoardColumn({ status, issues, onCreateIssue }: BoardColumnProps) {
  const config = STATUS_CONFIG[status];
  
  // Make the entire column a droppable target
  const { isOver, setNodeRef } = useDroppable({
    id: status,
  });

  return (
    <div 
      ref={setNodeRef}
      className={cn(
        "flex-shrink-0 w-72 flex flex-col bg-zinc-900/30 rounded-xl border transition-all duration-200",
        isOver 
          ? "border-violet-500/50 bg-violet-500/5 ring-2 ring-violet-500/20" 
          : "border-zinc-800/50"
      )}
    >
      {/* Column Header */}
      <div className="p-3 flex items-center justify-between border-b border-zinc-800/50">
        <div className="flex items-center gap-2">
          <div className={cn("w-2 h-2 rounded-full", config.bgColor.replace("/20", ""))} />
          <span className={cn("text-sm font-medium", config.color)}>{config.label}</span>
          <span className="text-xs text-zinc-500 bg-zinc-800/50 px-1.5 py-0.5 rounded">
            {issues.length}
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="w-6 h-6 text-zinc-500 hover:text-zinc-300"
          onClick={onCreateIssue}
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      {/* Column Content */}
      <SortableContext
        id={status}
        items={issues.map((i) => i.id)}
        strategy={verticalListSortingStrategy}
      >
        <ScrollArea className="flex-1 p-2">
          <div className="space-y-2 min-h-[200px]">
            <AnimatePresence mode="popLayout">
              {issues.map((issue) => (
                <IssueCard key={issue.id} issue={issue} />
              ))}
            </AnimatePresence>
            
            {issues.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={cn(
                  "text-center py-8 text-sm border-2 border-dashed rounded-lg transition-colors",
                  isOver ? "border-violet-500/30 text-violet-400" : "border-zinc-800/50 text-zinc-600"
                )}
              >
                {isOver ? "Drop here" : "No issues"}
              </motion.div>
            )}
          </div>
        </ScrollArea>
      </SortableContext>
    </div>
  );
}
