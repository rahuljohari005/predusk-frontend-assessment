import { tasksReducer } from "./taskSlice";
import {
  selectAllTasks,
  selectCompletedTaskCount,
  selectFilteredTasks,
  selectHighPriorityTasks,
  selectPendingTaskCount,
  selectSelectedTask,
  selectSortedTasks,
  selectTaskCount,
  selectTaskEntities,
  selectTaskIds,
  selectTasksState,
  selectVisibleTasks,
} from "./taskSelectors";
import type { RootState } from "@/app/store";
import {
  DEFAULT_TASK_FILTERS,
  SortField,
  SortOrder,
  TaskPriority,
  TaskStatus,
  TaskType,
  type Task,
} from "@/app/types";

const buildTask = (overrides: Partial<Task> = {}): Task => ({
  id: "task-1",
  title: "Alpha task",
  description: "A sample task",
  type: TaskType.Text,
  status: TaskStatus.Todo,
  priority: TaskPriority.Medium,
  assignee: { id: "assignee-1", name: "Ada", email: "ada@example.com" },
  annotationCount: 3,
  tags: [{ id: "tag-1", name: "urgent" }],
  dueDate: "2024-06-20T00:00:00.000Z",
  meta: {},
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-02-01T00:00:00.000Z",
  ...overrides,
});

const buildState = (): RootState => {
  const initial = tasksReducer(undefined, { type: "unknown" });
  const withTasks = tasksReducer(initial, {
    type: "tasks/upsertTasks",
    payload: [
      buildTask({ id: "task-1", status: TaskStatus.Todo, priority: TaskPriority.Medium }),
      buildTask({ id: "task-2", title: "Beta task", status: TaskStatus.Done, priority: TaskPriority.High, assignee: { id: "assignee-2", name: "Lin", email: "lin@example.com" }, tags: [{ id: "tag-2", name: "backend" }] }),
      buildTask({ id: "task-3", title: "Gamma task", status: TaskStatus.InProgress, priority: TaskPriority.Urgent, dueDate: null, assignee: null, tags: [] }),
    ],
  });

  return { tasks: withTasks } as RootState;
};

describe("task selectors", () => {
  it("returns normalized task collections and counts", () => {
    const state = buildState();

    expect(selectTasksState(state)).toBe(state.tasks);
    expect(selectAllTasks(state)).toHaveLength(3);
    expect(selectTaskIds(state)).toEqual(["task-1", "task-2", "task-3"]);
    expect(selectTaskEntities(state)).toHaveProperty("task-2");
    expect(selectTaskCount(state)).toBe(3);
    expect(selectCompletedTaskCount(state)).toBe(1);
    expect(selectPendingTaskCount(state)).toBe(2);
  });

  it("filters and sorts tasks based on current state", () => {
    const state = buildState();
    const filteredState = {
      ...state,
      tasks: {
        ...state.tasks,
        filters: {
          ...DEFAULT_TASK_FILTERS,
          statuses: [TaskStatus.Todo, TaskStatus.InProgress],
        },
      },
    } as RootState;

    const filtered = selectFilteredTasks(filteredState);

    expect(filtered).toHaveLength(2);
    expect(filtered.map((task) => task.id)).toEqual(["task-1", "task-3"]);

    const sorted = selectSortedTasks({
      ...filteredState,
      tasks: {
        ...filteredState.tasks,
        sort: { field: SortField.Title, order: SortOrder.Asc },
      },
    } as RootState);

    expect(sorted.map((task) => task.title)).toEqual(["Alpha task", "Gamma task"]);
  });

  it("handles edge cases for selection and visibility", () => {
    const state = buildState();
    const noSelectionState = {
      ...state,
      tasks: {
        ...state.tasks,
        selectedTaskId: null,
      },
    } as RootState;

    expect(selectSelectedTask(noSelectionState)).toBeUndefined();

    const selectedState = {
      ...state,
      tasks: {
        ...state.tasks,
        selectedTaskId: "task-2",
      },
    } as RootState;

    expect(selectSelectedTask(selectedState)?.id).toBe("task-2");
    expect(selectVisibleTasks(state)).toEqual(selectSortedTasks(state));
  });

  it("applies high priority filtering and respects empty filters", () => {
    const state = buildState();
    const emptyFiltersState = {
      ...state,
      tasks: {
        ...state.tasks,
        filters: DEFAULT_TASK_FILTERS,
      },
    } as RootState;

    expect(selectHighPriorityTasks(emptyFiltersState)).toHaveLength(2);

    const filteredState = {
      ...state,
      tasks: {
        ...state.tasks,
        filters: {
          ...DEFAULT_TASK_FILTERS,
          search: "beta",
          statuses: [TaskStatus.Done],
          assigneeIds: ["assignee-2"],
          tagIds: ["tag-2"],
        },
      },
    } as RootState;

    expect(selectFilteredTasks(filteredState)).toHaveLength(1);
  });
});
