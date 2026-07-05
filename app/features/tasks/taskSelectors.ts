import { createSelector } from "@reduxjs/toolkit";

import type { RootState } from "@/app/store";
import {
  SortField,
  SortOrder,
  Task,
  TaskPriority,
  TaskStatus,
} from "@/app/types";

import { tasksAdapter, type TasksState } from "./taskSlice";

const taskAdapterSelectors = tasksAdapter.getSelectors((state: TasksState) => state);

export const selectTasksState = createSelector(
  [(state: RootState) => state.tasks],
  (tasksState: TasksState): TasksState => tasksState,
);

export const selectAllTasks = createSelector(
  [selectTasksState],
  (tasksState: TasksState): Task[] => taskAdapterSelectors.selectAll(tasksState),
);

export const selectTaskEntities = createSelector(
  [selectTasksState],
  (tasksState: TasksState): Record<string, Task> =>
    taskAdapterSelectors.selectEntities(tasksState),
);

export const selectTaskIds = createSelector(
  [selectTasksState],
  (tasksState: TasksState): string[] => taskAdapterSelectors.selectIds(tasksState),
);

export const selectSelectedTask = createSelector(
  [selectTasksState, selectTaskEntities],
  (tasksState: TasksState, taskEntities: Record<string, Task>): Task | undefined => {
    if (!tasksState.selectedTaskId) {
      return undefined;
    }

    return taskEntities[tasksState.selectedTaskId];
  },
);

export const selectFilteredTasks = createSelector(
  [selectAllTasks, selectTasksState],
  (tasks: Task[], tasksState: TasksState): Task[] => {
    const { filters } = tasksState;
    const searchQuery = filters.search.trim().toLowerCase();

    return tasks.filter((task) => {
      const matchesSearch =
        searchQuery.length === 0 ||
        [task.title, task.description ?? "", task.assignee?.name ?? ""]
          .join(" ")
          .toLowerCase()
          .includes(searchQuery);

      const matchesStatuses =
        filters.statuses.length === 0 || filters.statuses.includes(task.status);

      const matchesPriorities =
        filters.priorities.length === 0 ||
        filters.priorities.includes(task.priority);

      const matchesAssignee =
        filters.assigneeIds.length === 0 ||
        (task.assignee !== null && filters.assigneeIds.includes(task.assignee.id));

      const matchesTags =
        filters.tagIds.length === 0 ||
        task.tags.some((tag) => filters.tagIds.includes(tag.id));

      const matchesDueBefore =
        filters.dueBefore === null ||
        (task.dueDate !== null && task.dueDate <= filters.dueBefore);

      const matchesDueAfter =
        filters.dueAfter === null ||
        (task.dueDate !== null && task.dueDate >= filters.dueAfter);

      return (
        matchesSearch &&
        matchesStatuses &&
        matchesPriorities &&
        matchesAssignee &&
        matchesTags &&
        matchesDueBefore &&
        matchesDueAfter
      );
    });
  },
);

export const selectSortedTasks = createSelector(
  [selectFilteredTasks, selectTasksState],
  (tasks: Task[], tasksState: TasksState): Task[] => {
    const sortedTasks = [...tasks];

    sortedTasks.sort((left, right) => {
      let comparison = 0;

      switch (tasksState.sort.field) {
        case SortField.Title:
          comparison = left.title.localeCompare(right.title);
          break;

        case SortField.Status:
          comparison = left.status.localeCompare(right.status);
          break;

        case SortField.Priority:
          comparison = left.priority.localeCompare(right.priority);
          break;

        case SortField.DueDate:
          comparison = (left.dueDate ?? "").localeCompare(right.dueDate ?? "");
          break;

        case SortField.CreatedAt:
          comparison = left.createdAt.localeCompare(right.createdAt);
          break;

        case SortField.UpdatedAt:
        default:
          comparison = left.updatedAt.localeCompare(right.updatedAt);
          break;
      }

      return tasksState.sort.order === SortOrder.Desc ? -comparison : comparison;
    });

    return sortedTasks;
  },
);

export const selectVisibleTasks = createSelector(
  [selectSortedTasks],
  (tasks: Task[]): Task[] => tasks,
);

export const selectTaskCount = createSelector(
  [selectAllTasks],
  (tasks: Task[]): number => tasks.length,
);

export const selectCompletedTaskCount = createSelector(
  [selectAllTasks],
  (tasks: Task[]): number =>
    tasks.filter((task) => task.status === TaskStatus.Done).length,
);

export const selectPendingTaskCount = createSelector(
  [selectAllTasks],
  (tasks: Task[]): number =>
    tasks.filter(
      (task) =>
        task.status !== TaskStatus.Done && task.status !== TaskStatus.Cancelled,
    ).length,
);

export const selectHighPriorityTasks = createSelector(
  [selectVisibleTasks],
  (tasks: Task[]): Task[] =>
    tasks.filter(
      (task) =>
        task.priority === TaskPriority.High ||
        task.priority === TaskPriority.Urgent,
    ),
);
