import localforage from "localforage";

import type {
  CachedTaskSummary,
  TaskCacheMetadata,
  TaskCacheRecord,
} from "@/app/types";
import {
  CACHE_KEYS,
  DATABASE,
} from "@/app/lib/constants";
import { TASK_CACHE_SCHEMA_VERSION, TaskCacheStoreKey } from "@/app/types";

const createTaskCacheMetadata = (): TaskCacheMetadata => ({
  schemaVersion: TASK_CACHE_SCHEMA_VERSION,
  lastSyncedAt: null,
  lastHydratedAt: null,
  lastPersistedAt: null,
  syncStatus: "idle" as TaskCacheMetadata["syncStatus"],
  etag: null,
});

const createTaskCacheStore = (): LocalForage => {
  return localforage.createInstance({
    name: DATABASE.NAME,
    storeName: CACHE_KEYS.TASKS,
    version: DATABASE.VERSION,
  });
};

const createSummaryStore = (): LocalForage => {
  return localforage.createInstance({
    name: DATABASE.NAME,
    storeName: CACHE_KEYS.TASK_SUMMARIES,
    version: DATABASE.VERSION,
  });
};

export const saveTasksToCache = async (
  entities: Readonly<Record<string, unknown>>,
  ids: readonly string[],
): Promise<void> => {
  const store = createTaskCacheStore();
  const record: TaskCacheRecord = {
    metadata: {
      ...createTaskCacheMetadata(),
      lastPersistedAt: new Date().toISOString(),
    },
    entities: entities as TaskCacheRecord["entities"],
    ids,
  };

  await store.setItem(TaskCacheStoreKey.Tasks, record);
};

export const loadTasksFromCache = async (): Promise<TaskCacheRecord | null> => {
  const store = createTaskCacheStore();
  const record = await store.getItem<TaskCacheRecord>(TaskCacheStoreKey.Tasks);

  return record ?? null;
};

export const clearTaskCache = async (): Promise<void> => {
  const store = createTaskCacheStore();
  await store.removeItem(TaskCacheStoreKey.Tasks);
};

export const saveSummaryToCache = async (
  summary: CachedTaskSummary,
): Promise<void> => {
  const store = createSummaryStore();
  await store.setItem(summary.taskId, summary);
};

export const loadSummaryFromCache = async (
  taskId: string,
): Promise<CachedTaskSummary | null> => {
  const store = createSummaryStore();
  const summary = await store.getItem<CachedTaskSummary>(taskId);

  return summary ?? null;
};
