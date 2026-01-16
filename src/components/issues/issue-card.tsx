"use client";

import { Issue, STATUS_CONFIG, PRIORITY_CONFIG, LABEL_COLORS } from "@/lib/types";
import { useAppStore } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { motion } from "framer-motion";
import { MessageSquare, Paperclip, CalendarDays } from "lucide-react";

interface IssueCardProps {
  issue: Issue;
  isDragging?: boolean;
}

export function IssueCard({ issue, isDragging }: IssueCardProps) {
  const { setSelectedIssue, users } = useAppStore();
  const assignee = users.find((u) => u.id === issue.assignee_id);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({
    id: issue.id,
    data: { issue },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const priorityConfig = PRIORITY_CONFIG[issue.priority];

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      transition={{ duration: 0.15 }}
    >
      <Card
        onClick={() => setSelectedIssue(issue)}
        className={cn(
          "p-3 bg-zinc-900/80 border-zinc-800 hover:border-zinc-700 cursor-pointer transition-all group",
          "hover:bg-zinc-900 hover:shadow-lg hover:shadow-black/20",
          (isDragging || isSortableDragging) && "opacity-50 rotate-2 shadow-2xl"
        )}
      >
        {/* Header - Identifier & Priority */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-mono text-zinc-500 group-hover:text-zinc-400 transition-colors">
            {issue.identifier}
          </span>
          <div className="flex items-center gap-1.5">
            <span className="text-xs" title={priorityConfig.label}>
              {priorityConfig.icon}
            </span>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-sm font-medium text-zinc-200 mb-2 line-clamp-2 group-hover:text-white transition-colors">
          {issue.title}
        </h3>

        {/* Labels */}
        {issue.labels.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {issue.labels.slice(0, 3).map((label) => (
              <Badge
                key={label}
                variant="outline"
                className={cn(
                  "text-[10px] px-1.5 py-0 h-5 border",
                  LABEL_COLORS[label] || "bg-zinc-500/20 text-zinc-400 border-zinc-500/30"
                )}
              >
                {label}
              </Badge>
            ))}
            {issue.labels.length > 3 && (
              <Badge
                variant="outline"
                className="text-[10px] px-1.5 py-0 h-5 bg-zinc-500/20 text-zinc-400 border-zinc-500/30"
              >
                +{issue.labels.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-zinc-800/50">
          <div className="flex items-center gap-3 text-zinc-500">
            {issue.estimate && (
              <span className="text-xs flex items-center gap-1">
                <span className="w-4 h-4 rounded bg-zinc-800 flex items-center justify-center text-[10px]">
                  {issue.estimate}
                </span>
              </span>
            )}
            {issue.due_date && (
              <span className="text-xs flex items-center gap-1">
                <CalendarDays className="w-3 h-3" />
              </span>
            )}
          </div>
          
          {assignee && (
            <Avatar className="w-5 h-5">
              <AvatarFallback className="text-[10px] bg-gradient-to-br from-violet-500 to-purple-600 text-white">
                {assignee.name?.slice(0, 2).toUpperCase() || "??"}
              </AvatarFallback>
            </Avatar>
          )}
        </div>
      </Card>
    </motion.div>
  );
}
