"use client";

import type { ReactElement } from "react";

import { TaskStatus, TaskType } from "@/app/types";

interface FilterBarProps {
  status: TaskStatus | "all";
  type: TaskType | "all";
  onStatusChange: (value: TaskStatus | "all") => void;
  onTypeChange: (value: TaskType | "all") => void;
}

export function FilterBar({
  status,
  type,
  onStatusChange,
  onTypeChange,
}: FilterBarProps): ReactElement {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      <label className="text-sm font-medium text-zinc-700">
        <span className="mb-1 block">Status</span>
        <select
          value={status}
          onChange={(event) =>
            onStatusChange(event.target.value as TaskStatus | "all")
          }
          className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm"
        >
          <option value="all">All statuses</option>
          {Object.values(TaskStatus).map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
      </label>

      <label className="text-sm font-medium text-zinc-700">
        <span className="mb-1 block">Type</span>
        <select
          value={type}
          onChange={(event) =>
            onTypeChange(event.target.value as TaskType | "all")
          }
          className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm"
        >
          <option value="all">All types</option>
          {Object.values(TaskType).map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
