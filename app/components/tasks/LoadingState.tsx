"use client";

import type { ReactElement } from "react";

export function LoadingState(): ReactElement {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-8 text-center text-sm text-zinc-600 shadow-sm">
      Loading tasks…
    </div>
  );
}
