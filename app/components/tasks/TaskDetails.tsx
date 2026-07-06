"use client";

import { useMemo, type ReactElement } from "react";

import { useTaskSummaryStream } from "@/app/hooks/useTaskSummaryStream";
import type { Task } from "@/app/types";
import { SummaryStatus } from "@/app/types";

interface TaskDetailsProps {
  task: Task | null;
}

export function TaskDetails({ task }: TaskDetailsProps): ReactElement {
  const selectedTaskId = task?.id ?? null;
  const { content, status, error, isStreaming } =
    useTaskSummaryStream(selectedTaskId);

  const summaryBody = useMemo(() => {
    if (!task) {
      return "Select a task to view its details and summary.";
    }

    if (isStreaming) {
      return content || "Streaming summary…";
    }

    if (error) {
      return error;
    }

    if (status === SummaryStatus.Complete && content) {
      return content;
    }

    return task.description ?? "No additional details available.";
  }, [content, error, isStreaming, status, task]);

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-zinc-900">
        {task?.title ?? "Task details"}
      </h2>
      <p className="mt-2 text-sm text-zinc-600">
        {task
          ? `${task.status} • ${task.priority} • ${task.type}`
          : "Choose a task from the list to inspect it."}
      </p>

      {task ? (
        <div className="mt-6 space-y-4">
          <div>
            <p className="text-sm font-medium text-zinc-700">Description</p>
            <p className="mt-1 whitespace-pre-wrap text-sm text-zinc-600">
              {task.description || "No description provided."}
            </p>
          </div>

          <div>
            <p className="text-sm font-medium text-zinc-700">AI summary</p>
            <div className="mt-2 rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-sm leading-6 text-zinc-700">
              <p className="whitespace-pre-wrap">{summaryBody}</p>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
