"use client";

import type { ReactElement } from "react";

interface ErrorStateProps {
  message: string;
}

export function ErrorState({ message }: ErrorStateProps): ReactElement {
  return (
    <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center text-sm text-red-700 shadow-sm">
      {message}
    </div>
  );
}
