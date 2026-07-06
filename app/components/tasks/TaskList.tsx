"use client";

import type { ReactElement } from "react";

import type { Task } from "@/app/types";

interface TaskListProps {
  tasks: readonly Task[];
  selectedTaskId: string | null;
  onSelectTask: (taskId: string) => void;
}

export function TaskList({
  tasks,
  selectedTaskId,
  onSelectTask,
}: TaskListProps): ReactElement {
  return (
    <div className="space-y-3">
      {tasks.map((task) => (
        <button
          key={task.id}
          type="button"
          onClick={() => onSelectTask(task.id)}
          className={`w-full rounded-xl border p-4 text-left transition ${
            selectedTaskId === task.id
              ? "border-sky-500 bg-sky-50 shadow-sm"
              : "border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50"
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-zinc-900">
                {task.title}
              </p>
              <p className="mt-1 text-sm text-zinc-500">{task.status}</p>
            </div>
            <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-700">
              {task.priority}
            </span>
          </div>
        </button>
      ))}
    </div>
  );
}
