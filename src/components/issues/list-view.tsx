"use client";

import { useFilteredIssues, useAppStore } from "@/lib/store";
import { Issue, STATUS_CONFIG, PRIORITY_CONFIG, LABEL_COLORS } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns";

export function ListView() {
  const issues = useFilteredIssues();
  const { setSelectedIssue, users } = useAppStore();

  return (
    <div className="p-4">
      {/* Header Row */}
      <div className="grid grid-cols-12 gap-4 px-4 py-2 text-xs font-medium text-zinc-500 uppercase tracking-wider border-b border-zinc-800">
        <div className="col-span-1">Priority</div>
        <div className="col-span-1">ID</div>
        <div className="col-span-5">Title</div>
        <div className="col-span-2">Status</div>
        <div className="col-span-2">Labels</div>
        <div className="col-span-1">Assignee</div>
      </div>

      {/* Issues */}
      <div className="divide-y divide-zinc-800/50">
        <AnimatePresence mode="popLayout">
          {issues.map((issue) => (
            <ListRow
              key={issue.id}
              issue={issue}
              onClick={() => setSelectedIssue(issue)}
              assignee={users.find((u) => u.id === issue.assignee_id)}
            />
          ))}
        </AnimatePresence>
      </div>

      {issues.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16 text-zinc-600"
        >
          <p className="text-lg">No issues found</p>
          <p className="text-sm mt-1">Create a new issue to get started</p>
        </motion.div>
      )}
    </div>
  );
}

interface ListRowProps {
  issue: Issue;
  onClick: () => void;
  assignee?: { id: string; name: string | null; avatar_url: string | null };
}

function ListRow({ issue, onClick, assignee }: ListRowProps) {
  const statusConfig = STATUS_CONFIG[issue.status];
  const priorityConfig = PRIORITY_CONFIG[issue.priority];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      whileHover={{ backgroundColor: "rgba(39, 39, 42, 0.5)" }}
      onClick={onClick}
      className="grid grid-cols-12 gap-4 px-4 py-3 cursor-pointer transition-colors items-center group"
    >
      {/* Priority */}
      <div className="col-span-1">
        <span title={priorityConfig.label}>{priorityConfig.icon}</span>
      </div>

      {/* ID */}
      <div className="col-span-1">
        <span className="text-xs font-mono text-zinc-500 group-hover:text-zinc-400">
          {issue.identifier}
        </span>
      </div>

      {/* Title */}
      <div className="col-span-5">
        <p className="text-sm text-zinc-200 group-hover:text-white truncate">
          {issue.title}
        </p>
      </div>

      {/* Status */}
      <div className="col-span-2">
        <Badge
          variant="outline"
          className={cn(
            "text-xs border",
            statusConfig.bgColor,
            statusConfig.color,
            "border-current/30"
          )}
        >
          {statusConfig.label}
        </Badge>
      </div>

      {/* Labels */}
      <div className="col-span-2 flex gap-1 overflow-hidden">
        {issue.labels.slice(0, 2).map((label) => (
          <Badge
            key={label}
            variant="outline"
            className={cn(
              "text-[10px] px-1.5 py-0 h-5 border shrink-0",
              LABEL_COLORS[label] || "bg-zinc-500/20 text-zinc-400 border-zinc-500/30"
            )}
          >
            {label}
          </Badge>
        ))}
        {issue.labels.length > 2 && (
          <span className="text-[10px] text-zinc-500">+{issue.labels.length - 2}</span>
        )}
      </div>

      {/* Assignee */}
      <div className="col-span-1">
        {assignee ? (
          <Avatar className="w-6 h-6">
            <AvatarFallback className="text-[10px] bg-gradient-to-br from-violet-500 to-purple-600 text-white">
              {assignee.name?.slice(0, 2).toUpperCase() || "??"}
            </AvatarFallback>
          </Avatar>
        ) : (
          <div className="w-6 h-6 rounded-full border border-dashed border-zinc-700" />
        )}
      </div>
    </motion.div>
  );
}
