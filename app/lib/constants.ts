/**
 * Global application constants.
 * Centralized configuration used across services, store and UI.
 */

// -----------------------------
// API
// -----------------------------

export const API_CONFIG = {
  BASE_URL:
    process.env.NEXT_PUBLIC_API_BASE_URL ??
    "https://api.example.com",

  TIMEOUT: 15000,

  DEFAULT_HEADERS: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
} as const;

// -----------------------------
// WebSocket
// -----------------------------

export const WS_CONFIG = {
  URL:
    process.env.NEXT_PUBLIC_WS_URL ??
    "wss://api.example.com/ws",

  RECONNECT_INTERVAL: 3000,

  MAX_RECONNECT_ATTEMPTS: 5,
} as const;

// -----------------------------
// AI Summary
// -----------------------------

export const SUMMARY_CONFIG = {
  STREAM_ENDPOINT: "/tasks/summary/stream",
} as const;

// -----------------------------
// Pagination
// -----------------------------

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_PAGE_SIZE: 20,
} as const;

// -----------------------------
// Cache
// -----------------------------

export const CACHE_KEYS = {
  TASKS: "tasks",
  TASK_METADATA: "task_metadata",
  TASK_SUMMARIES: "task_summaries",
} as const;

// -----------------------------
// IndexedDB
// -----------------------------

export const DATABASE = {
  NAME: "predusk-task-manager",
  VERSION: 1,
} as const;