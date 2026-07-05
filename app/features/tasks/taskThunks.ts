import { createAsyncThunk } from "@reduxjs/toolkit";

import type { RootState } from "@/app/store";
import type {
  ApiError,
  CreateTaskRequest,
  DeleteTaskResponse,
  TaskListQueryParams,
  TaskListResponse,
  TaskResponse,
  UpdateTaskRequest,
} from "@/app/types";

import { taskService, handleTaskServiceError } from "@/app/services/taskService";
import {
  removeTask,
  setError,
  setInitialized,
  setLoading,
  setPagination,
  setSelectedTask,
  upsertTask,
  upsertTasks,
} from "./taskSlice";

interface UpdateTaskArgs {
  id: string;
  updates: UpdateTaskRequest;
}

interface DeleteTaskArgs {
  id: string;
}

interface TaskThunkApiConfig {
  state: RootState;
  rejectValue: ApiError;
}

export const fetchTasks = createAsyncThunk<
  TaskListResponse,
  TaskListQueryParams | undefined,
  TaskThunkApiConfig
>("tasks/fetchTasks", async (query, { dispatch, rejectWithValue }) => {
  try {
    dispatch(setLoading(true));
    dispatch(setError(null));

    const response = await taskService.fetchTasks(query);

    dispatch(upsertTasks(response.data.items));
    dispatch(setPagination(response.data.meta));
    dispatch(setInitialized(true));

    return response;
  } catch (error) {
    const apiError = handleTaskServiceError(error);
    dispatch(setError(apiError.message));

    return rejectWithValue(apiError);
  } finally {
    dispatch(setLoading(false));
  }
});

export const createTask = createAsyncThunk<
  TaskResponse,
  CreateTaskRequest,
  TaskThunkApiConfig
>("tasks/createTask", async (payload, { dispatch, rejectWithValue }) => {
  try {
    dispatch(setLoading(true));
    dispatch(setError(null));

    const response = await taskService.createTask(payload);

    dispatch(upsertTask(response.data));

    return response;
  } catch (error) {
    const apiError = handleTaskServiceError(error);
    dispatch(setError(apiError.message));

    return rejectWithValue(apiError);
  } finally {
    dispatch(setLoading(false));
  }
});

export const updateTask = createAsyncThunk<
  TaskResponse,
  UpdateTaskArgs,
  TaskThunkApiConfig
>("tasks/updateTask", async ({ id, updates }, { dispatch, rejectWithValue }) => {
  try {
    dispatch(setLoading(true));
    dispatch(setError(null));

    const response = await taskService.updateTask(id, updates);

    dispatch(upsertTask(response.data));

    return response;
  } catch (error) {
    const apiError = handleTaskServiceError(error);
    dispatch(setError(apiError.message));

    return rejectWithValue(apiError);
  } finally {
    dispatch(setLoading(false));
  }
});

export const deleteTask = createAsyncThunk<
  DeleteTaskResponse,
  DeleteTaskArgs,
  TaskThunkApiConfig
>("tasks/deleteTask", async ({ id }, { dispatch, rejectWithValue }) => {
  try {
    dispatch(setLoading(true));
    dispatch(setError(null));

    const response = await taskService.deleteTask(id);

    dispatch(removeTask(id));

    if (response.data.deleted) {
      dispatch(setSelectedTask(null));
    }

    return response;
  } catch (error) {
    const apiError = handleTaskServiceError(error);
    dispatch(setError(apiError.message));

    return rejectWithValue(apiError);
  } finally {
    dispatch(setLoading(false));
  }
});
