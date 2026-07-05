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

/** Supported task types after normalization. */
export enum TaskType {
  Image = "image",
  Audio = "audio",
  Text = "text",
  Unknown = "unknown",
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

/** Core task entity used across UI, Redux, cache and real-time updates. */
export interface Task {
  readonly id: string;

  title: string;
  description?: string;

  type: TaskType;

  status: TaskStatus;
  priority: TaskPriority;

  assignee: Assignee | null;

  annotationCount: number;

  tags: readonly Tag[];

  dueDate: string | null;

  meta: Record<string, unknown>;

  readonly createdAt: string;
  updatedAt: string;
}

/** AI summary associated with a task. */
export interface TaskAiSummary {
  readonly taskId: string;
  content: string;
  status: SummaryStatus;
  generatedAt: string | null;
  errorMessage: string | null;
}

/** Client-side filter criteria. */
export interface TaskFilters {
  search: string;
  statuses: readonly TaskStatus[];
  priorities: readonly TaskPriority[];
  assigneeIds: readonly string[];
  tagIds: readonly string[];
  dueBefore: string | null;
  dueAfter: string | null;
}

/** Sort configuration. */
export interface TaskSort {
  field: SortField;
  order: SortOrder;
}

/** Pagination request. */
export interface PaginationParams {
  page: number;
  pageSize: number;
}

/** Pagination metadata. */
export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/** Paginated task collection. */
export interface PaginatedTasks {
  items: readonly Task[];
  meta: PaginationMeta;
}

/**
 * Normalized Redux/IndexedDB collection.
 */
export interface NormalizedTaskCollection {
  entities: Readonly<Record<string, Task>>;
  ids: readonly string[];
}

/** Default filters. */
export const DEFAULT_TASK_FILTERS: TaskFilters = {
  search: "",
  statuses: [],
  priorities: [],
  assigneeIds: [],
  tagIds: [],
  dueBefore: null,
  dueAfter: null,
};

/** Default sorting. */
export const DEFAULT_TASK_SORT: TaskSort = {
  field: SortField.UpdatedAt,
  order: SortOrder.Desc,
};

/** Default pagination. */
export const DEFAULT_PAGINATION_PARAMS: PaginationParams = {
  page: 1,
  pageSize: 20,
};