"use client";

import type { ReactElement } from "react";

import type { Task } from "@/app/types";

interface TaskCardProps {
  task: Task;
  isSelected: boolean;
  onSelect: () => void;
}

export function TaskCard({
  task,
  isSelected,
  onSelect,
}: TaskCardProps): ReactElement {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full rounded-2xl border p-4 text-left shadow-sm transition ${
        isSelected
          ? "border-sky-500 bg-sky-50"
          : "border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-zinc-900">{task.title}</p>
          <p className="mt-1 text-sm text-zinc-500">{task.type}</p>
        </div>
        <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-700">
          {task.priority}
        </span>
      </div>
      <div className="mt-3 flex items-center justify-between text-xs text-zinc-500">
        <span>{task.status}</span>
        <span>{new Date(task.updatedAt).toLocaleDateString()}</span>
      </div>
    </button>
  );
}
