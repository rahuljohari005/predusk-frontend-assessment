import type {
  Assignee,
  PaginatedTasks,
  PaginationParams,
  Tag,
  Task,
  TaskFilters,
  TaskSort,
} from "./task";
import { SummaryStatus, TaskPriority, TaskStatus } from "./task";

/** Known API error codes for typed error handling. */
export enum ApiErrorCode {
  BadRequest = "bad_request",
  Unauthorized = "unauthorized",
  Forbidden = "forbidden",
  NotFound = "not_found",
  Conflict = "conflict",
  ValidationError = "validation_error",
  RateLimited = "rate_limited",
  InternalError = "internal_error",
  NetworkError = "network_error",
  Unknown = "unknown",
}

export interface ApiErrorDetail {
  field: string;
  message: string;
}

/** Standard API error envelope. */
export interface ApiError {
  code: ApiErrorCode;
  message: string;
  status: number;
  details: readonly ApiErrorDetail[];
  requestId: string | null;
}

/** Fields required to create a task via the REST API. */
export interface CreateTaskRequest {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  assigneeId?: string | null;
  tagIds?: readonly string[];
  dueDate?: string | null;
}

/**
 * Partial update payload for PATCH requests.
 * Only supplied fields are applied on the server.
 */
export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  assigneeId?: string | null;
  tagIds?: readonly string[];
  dueDate?: string | null;
}

/** Query parameters for GET /tasks list endpoint. */
export interface TaskListQueryParams extends PaginationParams {
  search?: string;
  statuses?: readonly TaskStatus[];
  priorities?: readonly TaskPriority[];
  assigneeIds?: readonly string[];
  tagIds?: readonly string[];
  dueBefore?: string;
  dueAfter?: string;
  sortField?: TaskSort["field"];
  sortOrder?: TaskSort["order"];
}

/** Single-task API response wrapper. */
export interface TaskResponse {
  data: Task;
}

/** Paginated task list API response wrapper. */
export interface TaskListResponse {
  data: PaginatedTasks;
}

/** Tag list API response wrapper. */
export interface TagListResponse {
  data: readonly Tag[];
}

/** Assignee list API response wrapper. */
export interface AssigneeListResponse {
  data: readonly Assignee[];
}

/** Empty success response for DELETE operations. */
export interface DeleteTaskResponse {
  data: {
    id: string;
    deleted: true;
  };
}

/** Builds REST query params from domain filter, sort, and pagination state. */
export interface TaskQueryState {
  filters: TaskFilters;
  sort: TaskSort;
  pagination: PaginationParams;
}

// ---------------------------------------------------------------------------
// WebSocket
// ---------------------------------------------------------------------------

export enum WebSocketConnectionState {
  Idle = "idle",
  Connecting = "connecting",
  Connected = "connected",
  Reconnecting = "reconnecting",
  Disconnected = "disconnected",
  Failed = "failed",
}

export enum WebSocketEventType {
  TaskCreated = "task.created",
  TaskUpdated = "task.updated",
  TaskDeleted = "task.deleted",
  SyncRequired = "sync.required",
  Ping = "ping",
  Pong = "pong",
  Error = "error",
}

export interface WebSocketEventBase {
  readonly type: WebSocketEventType;
  readonly timestamp: string;
  readonly eventId: string;
}

export interface TaskCreatedWebSocketEvent extends WebSocketEventBase {
  type: WebSocketEventType.TaskCreated;
  payload: {
    task: Task;
  };
}

export interface TaskUpdatedWebSocketEvent extends WebSocketEventBase {
  type: WebSocketEventType.TaskUpdated;
  payload: {
    task: Task;
    changedFields: readonly (keyof Task)[];
  };
}

export interface TaskDeletedWebSocketEvent extends WebSocketEventBase {
  type: WebSocketEventType.TaskDeleted;
  payload: {
    id: string;
  };
}

export interface SyncRequiredWebSocketEvent extends WebSocketEventBase {
  type: WebSocketEventType.SyncRequired;
  payload: {
    reason: string;
    since: string | null;
  };
}

export interface PingWebSocketEvent extends WebSocketEventBase {
  type: WebSocketEventType.Ping;
  payload: Record<string, never>;
}

export interface PongWebSocketEvent extends WebSocketEventBase {
  type: WebSocketEventType.Pong;
  payload: Record<string, never>;
}

export interface ErrorWebSocketEvent extends WebSocketEventBase {
  type: WebSocketEventType.Error;
  payload: {
    code: string;
    message: string;
  };
}

/** Discriminated union of all inbound WebSocket messages. */
export type WebSocketEvent =
  | TaskCreatedWebSocketEvent
  | TaskUpdatedWebSocketEvent
  | TaskDeletedWebSocketEvent
  | SyncRequiredWebSocketEvent
  | PingWebSocketEvent
  | PongWebSocketEvent
  | ErrorWebSocketEvent;

/** Outbound WebSocket subscription message. */
export interface WebSocketSubscribeMessage {
  action: "subscribe";
  channels: readonly string[];
}

/** Outbound WebSocket heartbeat reply. */
export interface WebSocketPongMessage {
  action: "pong";
  eventId: string;
}

export type WebSocketOutboundMessage =
  | WebSocketSubscribeMessage
  | WebSocketPongMessage;

// ---------------------------------------------------------------------------
// SSE — AI task summary streaming
// ---------------------------------------------------------------------------

export enum SummaryStreamEventType {
  Start = "start",
  Chunk = "chunk",
  Done = "done",
  Error = "error",
}

export interface SummaryStreamStartEvent {
  type: SummaryStreamEventType.Start;
  taskId: string;
  requestId: string;
  timestamp: string;
}

export interface SummaryStreamChunkEvent {
  type: SummaryStreamEventType.Chunk;
  taskId: string;
  requestId: string;
  content: string;
  index: number;
  timestamp: string;
}

export interface SummaryStreamDoneEvent {
  type: SummaryStreamEventType.Done;
  taskId: string;
  requestId: string;
  summary: string;
  generatedAt: string;
  timestamp: string;
}

export interface SummaryStreamErrorEvent {
  type: SummaryStreamEventType.Error;
  taskId: string;
  requestId: string;
  code: ApiErrorCode;
  message: string;
  timestamp: string;
}

/** Discriminated union of SSE events for AI summary generation. */
export type SummaryStreamEvent =
  | SummaryStreamStartEvent
  | SummaryStreamChunkEvent
  | SummaryStreamDoneEvent
  | SummaryStreamErrorEvent;

/** Request body for initiating an AI summary stream. */
export interface SummaryStreamRequest {
  taskId: string;
  regenerate?: boolean;
}

/** Persisted summary record shape returned by REST (non-streaming fallback). */
export interface TaskSummaryResponse {
  data: {
    taskId: string;
    summary: string;
    status: SummaryStatus;
    generatedAt: string | null;
  };
}

// ---------------------------------------------------------------------------
// IndexedDB cache
// ---------------------------------------------------------------------------

/** Current cache schema version — increment on breaking shape changes. */
export const TASK_CACHE_SCHEMA_VERSION = 1;

export enum CacheSyncStatus {
  Idle = "idle",
  Hydrating = "hydrating",
  Persisting = "persisting",
  Stale = "stale",
  Error = "error",
}

/** Metadata tracked alongside cached task data. */
export interface TaskCacheMetadata {
  schemaVersion: number;
  lastSyncedAt: string | null;
  lastHydratedAt: string | null;
  lastPersistedAt: string | null;
  syncStatus: CacheSyncStatus;
  etag: string | null;
}

/** Full persisted task cache entry stored in IndexedDB via localforage. */
export interface TaskCacheRecord {
  metadata: TaskCacheMetadata;
  entities: Readonly<Record<string, Task>>;
  ids: readonly string[];
}

/** Partial cache update after a single task mutation. */
export interface TaskCachePatch {
  task: Task;
  updatedAt: string;
}

/** Cache eviction marker for deleted tasks. */
export interface TaskCacheDeletion {
  id: string;
  deletedAt: string;
}

/** IndexedDB store keys used by the cache layer. */
export enum TaskCacheStoreKey {
  Tasks = "tasks",
  Metadata = "metadata",
  Summaries = "summaries",
}

/** Cached AI summary entry for offline reads. */
export interface CachedTaskSummary {
  taskId: string;
  content: string;
  status: SummaryStatus;
  generatedAt: string | null;
  persistedAt: string;
}
