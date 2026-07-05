/** Lifecycle states for a task. */
export enum TaskStatus {
  Todo = "todo",
  InProgress = "in_progress",
  Done = "done",
  Cancelled = "cancelled",
}

/** Relative importance of a task. */
export enum TaskPriority {
  Low = "low",
  Medium = "medium",
  High = "high",
  Urgent = "urgent",
}

/** Fields supported for client-side and server-side sorting. */
export enum SortField {
  Title = "title",
  Status = "status",
  Priority = "priority",
  DueDate = "dueDate",
  CreatedAt = "createdAt",
  UpdatedAt = "updatedAt",
}

export enum SortOrder {
  Asc = "asc",
  Desc = "desc",
}

/** State of an AI-generated summary for a task. */
export enum SummaryStatus {
  Idle = "idle",
  Streaming = "streaming",
  Complete = "complete",
  Error = "error",
}

export interface Assignee {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly avatarUrl?: string;
}

export interface Tag {
  readonly id: string;
  readonly name: string;
  readonly color?: string;
}

/** Core task entity used across UI, store, cache, and real-time sync. */
export interface Task {
  readonly id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee: Assignee | null;
  tags: readonly Tag[];
  dueDate: string | null;
  readonly createdAt: string;
  updatedAt: string;
}

/** AI summary content associated with a single task. */
export interface TaskAiSummary {
  readonly taskId: string;
  content: string;
  status: SummaryStatus;
  generatedAt: string | null;
  errorMessage: string | null;
}

/** Client-side filter criteria applied to a task collection. */
export interface TaskFilters {
  search: string;
  statuses: readonly TaskStatus[];
  priorities: readonly TaskPriority[];
  assigneeIds: readonly string[];
  tagIds: readonly string[];
  dueBefore: string | null;
  dueAfter: string | null;
}

/** Sort configuration for task lists. */
export interface TaskSort {
  field: SortField;
  order: SortOrder;
}

/** Pagination input for list queries. */
export interface PaginationParams {
  page: number;
  pageSize: number;
}

/** Pagination metadata returned with list results. */
export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/** Paginated task list result. */
export interface PaginatedTasks {
  items: readonly Task[];
  meta: PaginationMeta;
}

/**
 * Normalized task collection shape.
 * Supports O(1) lookups and stable list ordering for Redux and IndexedDB layers.
 */
export interface NormalizedTaskCollection {
  entities: Readonly<Record<string, Task>>;
  ids: readonly string[];
}

/** Default empty filter state for initialization. */
export const DEFAULT_TASK_FILTERS: TaskFilters = {
  search: "",
  statuses: [],
  priorities: [],
  assigneeIds: [],
  tagIds: [],
  dueBefore: null,
  dueAfter: null,
};

/** Default sort: most recently updated first. */
export const DEFAULT_TASK_SORT: TaskSort = {
  field: SortField.UpdatedAt,
  order: SortOrder.Desc,
};

/** Default pagination for task list requests. */
export const DEFAULT_PAGINATION_PARAMS: PaginationParams = {
  page: 1,
  pageSize: 20,
};
