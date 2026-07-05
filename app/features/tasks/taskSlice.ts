import {
  createEntityAdapter,
  createSlice,
  type EntityState,
  type PayloadAction,
} from "@reduxjs/toolkit";

import type {
  PaginationMeta,
  Task,
  TaskFilters,
  TaskSort,
} from "@/app/types";

import {
  DEFAULT_TASK_FILTERS,
  DEFAULT_TASK_SORT,
} from "@/app/types";

/**
 * Entity adapter keeps tasks normalized.
 */
export const tasksAdapter = createEntityAdapter<Task>({
  selectId: (task) => task.id,

  sortComparer: (a, b) =>
    new Date(b.updatedAt).getTime() -
    new Date(a.updatedAt).getTime(),
});

export interface TasksState extends EntityState<Task, string> {
  loading: boolean;

  error: string | null;

  initialized: boolean;

  selectedTaskId: string | null;

  filters: TaskFilters;

  sort: TaskSort;

  pagination: PaginationMeta | null;

  isCacheHydrated: boolean;

  isStale: boolean;
}

const initialState: TasksState = tasksAdapter.getInitialState({
  loading: false,

  error: null,

  initialized: false,

  selectedTaskId: null,

  filters: DEFAULT_TASK_FILTERS,

  sort: DEFAULT_TASK_SORT,

  pagination: null,

  isCacheHydrated: false,

  isStale: false,
});
export const tasksSlice = createSlice({
  name: "tasks",

  initialState,

  reducers: {
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },

    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },

    setInitialized(state, action: PayloadAction<boolean>) {
      state.initialized = action.payload;
    },

    setSelectedTask(state, action: PayloadAction<string | null>) {
      state.selectedTaskId = action.payload;
    },

    setFilters(state, action: PayloadAction<TaskFilters>) {
      state.filters = action.payload;
    },

    setSort(state, action: PayloadAction<TaskSort>) {
      state.sort = action.payload;
    },

    setPagination(state, action: PayloadAction<PaginationMeta | null>) {
      state.pagination = action.payload;
    },

    setCacheHydrated(state, action: PayloadAction<boolean>) {
      state.isCacheHydrated = action.payload;
    },

    setStale(state, action: PayloadAction<boolean>) {
      state.isStale = action.payload;
    },

    upsertTask: tasksAdapter.upsertOne,

    upsertTasks: tasksAdapter.upsertMany,

    removeTask: tasksAdapter.removeOne,

    removeAllTasks: tasksAdapter.removeAll,
  },

  extraReducers: () => {},
});
export const {
  setLoading,
  setError,
  setInitialized,
  setSelectedTask,
  setFilters,
  setSort,
  setPagination,
  setCacheHydrated,
  setStale,
  upsertTask,
  upsertTasks,
  removeTask,
  removeAllTasks,
} = tasksSlice.actions;

export const tasksReducer = tasksSlice.reducer;