"use client";

import type { ReactElement } from "react";

interface EmptyStateProps {
  message: string;
}

export function EmptyState({ message }: EmptyStateProps): ReactElement {
  return (
    <div className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 p-8 text-center text-sm text-zinc-600 shadow-sm">
      {message}
    </div>
  );
}
