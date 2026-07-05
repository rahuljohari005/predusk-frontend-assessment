import {
  Assignee,
  Task,
  TaskPriority,
  TaskStatus,
  TaskType,
  Tag,
} from "@/app/types";

/**
 * Raw task returned by the mock backend.
 * Values are intentionally inconsistent.
 */
export interface RawTask {
  id: unknown;
  title: unknown;
  type: unknown;
  status: unknown;
  assignee: unknown;
  annotationCount: unknown;
  updatedAt: unknown;
  meta?: unknown;
}

/**
 * Normalize backend task type.
 */
export function normalizeTaskType(type: unknown): TaskType {
  switch (String(type).toLowerCase()) {
    case "image":
      return TaskType.Image;

    case "audio":
      return TaskType.Audio;

    case "text":
      return TaskType.Text;

    default:
      return TaskType.Unknown;
  }
}

/**
 * Normalize inconsistent backend status.
 */
export function normalizeStatus(status: unknown): TaskStatus {
  switch (String(status).toLowerCase()) {
    case "todo":
      return TaskStatus.Todo;

    case "inprogress":
    case "in_progress":
      return TaskStatus.InProgress;

    case "done":
      return TaskStatus.Done;

    case "blocked":
    case "qa":
    case "cancelled":
      return TaskStatus.Cancelled;

    default:
      return TaskStatus.Todo;
  }
}

/**
 * Convert ISO / epoch timestamps.
 */
export function normalizeDate(value: unknown): string {
  if (typeof value === "number") {
    return new Date(value).toISOString();
  }

  if (typeof value === "string") {
    const parsed = Date.parse(value);

    if (!Number.isNaN(parsed)) {
      return new Date(parsed).toISOString();
    }
  }

  return new Date().toISOString();
}

/**
 * Normalize nullable assignee.
 */
export function normalizeAssignee(value: unknown): Assignee | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const assignee = value as Record<string, unknown>;

  return {
    id: String(assignee.id ?? ""),
    name: String(assignee.name ?? "Unknown"),
    email: "",
  };
}

/**
 * Normalize annotation count.
 */
export function normalizeAnnotationCount(value: unknown): number {
  const count = Number(value);

  return Number.isFinite(count) ? count : 0;
}

/**
 * Convert raw backend payload into our clean domain model.
 */
export function normalizeTask(raw: RawTask): Task {
  return {
    id: String(raw.id),

    title: String(raw.title ?? ""),
    description: "",

    type: normalizeTaskType(raw.type),

    status: normalizeStatus(raw.status),

    priority: TaskPriority.Medium,

    assignee: normalizeAssignee(raw.assignee),

    annotationCount: normalizeAnnotationCount(raw.annotationCount),

    tags: [] as readonly Tag[],

    dueDate: null,

    meta:
      raw.meta && typeof raw.meta === "object"
        ? (raw.meta as Record<string, unknown>)
        : {},

    createdAt: normalizeDate(raw.updatedAt),

    updatedAt: normalizeDate(raw.updatedAt),
  };
}