"use client";

import type { ReactElement } from "react";

import { SortField, SortOrder } from "@/app/types";

interface SortDropdownProps {
  field: SortField;
  order: SortOrder;
  onFieldChange: (value: SortField) => void;
  onOrderChange: (value: SortOrder) => void;
}

export function SortDropdown({
  field,
  order,
  onFieldChange,
  onOrderChange,
}: SortDropdownProps): ReactElement {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <label className="text-sm font-medium text-zinc-700">
        <span className="mb-1 block">Sort by</span>
        <select
          value={field}
          onChange={(event) => onFieldChange(event.target.value as SortField)}
          className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm"
        >
          {Object.values(SortField).map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
      </label>

      <label className="text-sm font-medium text-zinc-700">
        <span className="mb-1 block">Order</span>
        <select
          value={order}
          onChange={(event) => onOrderChange(event.target.value as SortOrder)}
          className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm"
        >
          <option value={SortOrder.Asc}>Ascending</option>
          <option value={SortOrder.Desc}>Descending</option>
        </select>
      </label>
    </div>
  );
}
