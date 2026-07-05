import type {
  ApiError,
  CreateTaskRequest,
  DeleteTaskResponse,
  TaskListQueryParams,
  TaskListResponse,
  TaskResponse,
  UpdateTaskRequest,
} from "@/app/types";
import {
  ApiErrorCode,
  TaskPriority,
  TaskStatus,
  TaskType,
  type Task,
} from "@/app/types";

const createTaskRecord = (
  id: string,
  title: string,
  status: TaskStatus,
  priority: TaskPriority,
  type: TaskType,
  overrides: Partial<Task> = {},
): Task => ({
  id,
  title,
  description: overrides.description ?? "",
  type,
  status,
  priority,
  assignee: overrides.assignee ?? null,
  annotationCount: overrides.annotationCount ?? 0,
  tags: overrides.tags ?? [],
  dueDate: overrides.dueDate ?? null,
  meta: overrides.meta ?? {},
  createdAt: overrides.createdAt ?? new Date().toISOString(),
  updatedAt: overrides.updatedAt ?? new Date().toISOString(),
});

let taskStore: Task[] = [
  createTaskRecord(
    "task-1",
    "Draft onboarding plan",
    TaskStatus.Todo,
    TaskPriority.High,
    TaskType.Text,
  ),
  createTaskRecord(
    "task-2",
    "Review analytics",
    TaskStatus.InProgress,
    TaskPriority.Medium,
    TaskType.Text,
  ),
];

const toApiError = (message: string, status = 500): ApiError => ({
  code: ApiErrorCode.InternalError,
  message,
  status,
  details: [],
  requestId: null,
});

const isApiError = (error: unknown): error is ApiError => {
  if (typeof error !== "object" || error === null) {
    return false;
  }

  const candidate = error as Partial<ApiError>;

  return (
    typeof candidate.code === "string" &&
    typeof candidate.message === "string" &&
    typeof candidate.status === "number" &&
    Array.isArray(candidate.details) &&
    (candidate.requestId === null || typeof candidate.requestId === "string")
  );
};

export const taskService = {
  async fetchTasks(query?: TaskListQueryParams): Promise<TaskListResponse> {
    const page = query?.page ?? 1;
    const pageSize = query?.pageSize ?? 20;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;

    const items = taskStore.slice(start, end);

    return {
      data: {
        items,
        meta: {
          page,
          pageSize,
          total: taskStore.length,
          totalPages: Math.max(1, Math.ceil(taskStore.length / pageSize)),
          hasNextPage: end < taskStore.length,
          hasPreviousPage: page > 1,
        },
      },
    };
  },

  async createTask(payload: CreateTaskRequest): Promise<TaskResponse> {
    const task: Task = createTaskRecord(
      `task-${Date.now()}`,
      payload.title,
      payload.status ?? TaskStatus.Todo,
      payload.priority ?? TaskPriority.Medium,
      TaskType.Text,
      {
        description: payload.description,
        dueDate: payload.dueDate ?? null,
      },
    );

    taskStore = [task, ...taskStore];

    return { data: task };
  },

  async updateTask(id: string, payload: UpdateTaskRequest): Promise<TaskResponse> {
    const existingTask = taskStore.find((task) => task.id === id);

    if (!existingTask) {
      throw toApiError("Task not found", 404);
    }

    const updatedTask: Task = {
      ...existingTask,
      title: payload.title ?? existingTask.title,
      description: payload.description ?? existingTask.description,
      status: payload.status ?? existingTask.status,
      priority: payload.priority ?? existingTask.priority,
      dueDate: payload.dueDate ?? existingTask.dueDate,
      updatedAt: new Date().toISOString(),
    };

    taskStore = taskStore.map((task) => (task.id === id ? updatedTask : task));

    return { data: updatedTask };
  },

  async deleteTask(id: string): Promise<DeleteTaskResponse> {
    const exists = taskStore.some((task) => task.id === id);

    if (!exists) {
      throw toApiError("Task not found", 404);
    }

    taskStore = taskStore.filter((task) => task.id !== id);

    return {
      data: {
        id,
        deleted: true,
      },
    };
  },
};

export const handleTaskServiceError = (error: unknown): ApiError => {
  if (isApiError(error)) {
    return error;
  }

  if (error instanceof Error) {
    return toApiError(error.message);
  }

  return toApiError("Unexpected task service error");
};
