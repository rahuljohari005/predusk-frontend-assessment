import {
  tasksReducer,
  upsertTask,
  upsertTasks,
  removeTask,
  removeAllTasks,
  setFilters,
  setSelectedTask,
  setError,
  setLoading,
  setInitialized,
  setPagination,
  setCacheHydrated,
  setStale,
  setSort,
} from "./taskSlice";

import {
  DEFAULT_TASK_FILTERS,
  TaskPriority,
  TaskStatus,
  TaskType,
  type Task,
} from "@/app/types";

const buildTask = (overrides: Partial<Task> = {}): Task => ({
  id: "task-1",
  title: "Write tests",
  description: "",
  type: TaskType.Text,
  status: TaskStatus.Todo,
  priority: TaskPriority.Medium,
  assignee: null,
  annotationCount: 0,
  tags: [],
  dueDate: null,
  meta: {},
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z",
  ...overrides,
});

describe("tasksReducer", () => {
  it("upserts, removes and clears tasks", () => {
    const initialState = tasksReducer(undefined, { type: "unknown" });

    const withTask = tasksReducer(initialState, upsertTask(buildTask()));
    expect(withTask.entities["task-1"]).toEqual(buildTask());

    const updated = tasksReducer(
      withTask,
      upsertTask(
        buildTask({
          status: TaskStatus.Done,
          updatedAt: "2024-02-01T00:00:00.000Z",
        })
      )
    );

    expect(updated.entities["task-1"]?.status).toBe(TaskStatus.Done);

    const removed = tasksReducer(updated, removeTask("task-1"));
    expect(removed.ids).toHaveLength(0);

    const cleared = tasksReducer(removed, removeAllTasks());
    expect(cleared.ids).toHaveLength(0);
  });

  it("updates non-entity flags and filters immutably", () => {
    const initialState = tasksReducer(undefined, { type: "unknown" });

    const loadingState = tasksReducer(initialState, setLoading(true));
    expect(loadingState.loading).toBe(true);

    const errorState = tasksReducer(loadingState, setError("boom"));
    expect(errorState.error).toBe("boom");

    const initializedState = tasksReducer(errorState, setInitialized(true));
    expect(initializedState.initialized).toBe(true);

    const selectedState = tasksReducer(
      initializedState,
      setSelectedTask("task-1")
    );
    expect(selectedState.selectedTaskId).toBe("task-1");

    const filtersState = tasksReducer(
      selectedState,
      setFilters({
        ...DEFAULT_TASK_FILTERS,
        statuses: [TaskStatus.Done],
        priorities: [TaskPriority.High],
      })
    );

    expect(filtersState.filters.statuses).toEqual([TaskStatus.Done]);
    expect(filtersState.filters.priorities).toEqual([TaskPriority.High]);
    expect(filtersState.filters).not.toBe(DEFAULT_TASK_FILTERS);

    const sortState = tasksReducer(
      filtersState,
      setSort({
        field: "updatedAt" as never,
        order: "desc" as never,
      })
    );

    expect(sortState.sort.field).toBe("updatedAt");

    const paginationState = tasksReducer(
      sortState,
      setPagination({
        page: 2,
        pageSize: 10,
        total: 20,
        totalPages: 2,
        hasNextPage: false,
        hasPreviousPage: true,
      })
    );

    expect(paginationState.pagination?.page).toBe(2);

    const cacheState = tasksReducer(
      paginationState,
      setCacheHydrated(true)
    );
    expect(cacheState.isCacheHydrated).toBe(true);

    const staleState = tasksReducer(cacheState, setStale(true));
    expect(staleState.isStale).toBe(true);
  });

  it("supports upserting many tasks and preserves the initial state shape", () => {
    const initialState = tasksReducer(undefined, { type: "unknown" });

    const tasks = [
      buildTask({ id: "task-1" }),
      buildTask({
        id: "task-2",
        title: "Ship feature",
      }),
    ];

    const nextState = tasksReducer(initialState, upsertTasks(tasks));

    expect(nextState.ids).toEqual(["task-1", "task-2"]);
    expect(nextState.entities["task-2"]?.title).toBe("Ship feature");
    expect(initialState.entities).toEqual({});
  });
});