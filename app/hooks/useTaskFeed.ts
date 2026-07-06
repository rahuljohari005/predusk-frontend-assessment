import { useEffect, useRef } from "react";

import { WS_CONFIG } from "@/app/lib/constants";
import {
  removeTask,
  setError,
  setStale,
  upsertTask,
} from "@/app/features/tasks/taskSlice";
import { useAppDispatch } from "@/app/store";
import type {
  ErrorWebSocketEvent,
  PingWebSocketEvent,
  PongWebSocketEvent,
  SyncRequiredWebSocketEvent,
  TaskCreatedWebSocketEvent,
  TaskDeletedWebSocketEvent,
  TaskUpdatedWebSocketEvent,
  WebSocketEvent,
} from "@/app/types";
import { WebSocketEventType } from "@/app/types";

const INITIAL_RETRY_DELAY_MS = 1000;
const MAX_RETRY_DELAY_MS = 8000;

const getRetryDelay = (attempt: number): number => {
  return Math.min(INITIAL_RETRY_DELAY_MS * 2 ** attempt, MAX_RETRY_DELAY_MS);
};

const isWebSocketEvent = (value: unknown): value is WebSocketEvent => {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as Partial<WebSocketEvent>;

  return typeof candidate.type === "string";
};

const isTaskCreatedEvent = (
  event: WebSocketEvent,
): event is TaskCreatedWebSocketEvent => event.type === WebSocketEventType.TaskCreated;

const isTaskUpdatedEvent = (
  event: WebSocketEvent,
): event is TaskUpdatedWebSocketEvent => event.type === WebSocketEventType.TaskUpdated;

const isTaskDeletedEvent = (
  event: WebSocketEvent,
): event is TaskDeletedWebSocketEvent => event.type === WebSocketEventType.TaskDeleted;

const isSyncRequiredEvent = (
  event: WebSocketEvent,
): event is SyncRequiredWebSocketEvent => event.type === WebSocketEventType.SyncRequired;

const isPingEvent = (event: WebSocketEvent): event is PingWebSocketEvent =>
  event.type === WebSocketEventType.Ping;

const isPongEvent = (event: WebSocketEvent): event is PongWebSocketEvent =>
  event.type === WebSocketEventType.Pong;

const isErrorEvent = (event: WebSocketEvent): event is ErrorWebSocketEvent =>
  event.type === WebSocketEventType.Error;

export const useTaskFeed = (): void => {
  const dispatch = useAppDispatch();
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectAttemptRef = useRef<number>(0);
  const isUnmountedRef = useRef<boolean>(false);

  useEffect(() => {
    const connect = (): void => {
      if (isUnmountedRef.current) {
        return;
      }

      const currentSocket = socketRef.current;
      if (
        currentSocket &&
        (currentSocket.readyState === WebSocket.OPEN ||
          currentSocket.readyState === WebSocket.CONNECTING)
      ) {
        return;
      }

      const socket = new WebSocket(WS_CONFIG.URL);
      socketRef.current = socket;

      socket.addEventListener("open", () => {
        reconnectAttemptRef.current = 0;
        const subscribeMessage = JSON.stringify({
          action: "subscribe",
          channels: ["tasks"],
        });
        socket.send(subscribeMessage);
      });

      socket.addEventListener("message", (event: MessageEvent<string>) => {
        try {
          const payload = JSON.parse(event.data) as unknown;

          if (!isWebSocketEvent(payload)) {
            return;
          }

          if (isTaskCreatedEvent(payload)) {
            dispatch(upsertTask(payload.payload.task));
            return;
          }

          if (isTaskUpdatedEvent(payload)) {
            dispatch(upsertTask(payload.payload.task));
            return;
          }

          if (isTaskDeletedEvent(payload)) {
            dispatch(removeTask(payload.payload.id));
            return;
          }

          if (isSyncRequiredEvent(payload)) {
            dispatch(setStale(true));
            return;
          }

          if (isPingEvent(payload)) {
            socket.send(JSON.stringify({ action: "pong", eventId: payload.eventId }));
            return;
          }

          if (isPongEvent(payload)) {
            return;
          }

          if (isErrorEvent(payload)) {
            dispatch(setError(payload.payload.message));
          }
        } catch {
          dispatch(setError("Unable to parse task feed message"));
        }
      });

      socket.addEventListener("close", () => {
        socketRef.current = null;

        if (isUnmountedRef.current) {
          return;
        }

        if (reconnectAttemptRef.current < WS_CONFIG.MAX_RECONNECT_ATTEMPTS) {
          const delay = getRetryDelay(reconnectAttemptRef.current);
          reconnectAttemptRef.current += 1;

          if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
          }

          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, delay);
        }
      });

      socket.addEventListener("error", () => {
        dispatch(setError("Task feed connection error"));
      });
    };

    connect();

    return () => {
      isUnmountedRef.current = true;

      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }

      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
    };
  }, [dispatch]);
};
