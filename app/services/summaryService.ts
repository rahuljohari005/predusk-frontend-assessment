import type {
  SummaryStreamEvent,
  SummaryStreamRequest,
  TaskSummaryResponse,
} from "@/app/types";

import apiClient from "./apiClient";

const SUMMARY_BASE_PATH = "/tasks";

const parseSseEvent = (chunk: string): SummaryStreamEvent | null => {
  const trimmed = chunk.trim();

  if (!trimmed) {
    return null;
  }

  const dataPrefix = "data:";
  const payloadText = trimmed.startsWith(dataPrefix)
    ? trimmed.slice(dataPrefix.length).trim()
    : trimmed;

  try {
    const payload = JSON.parse(payloadText) as Partial<SummaryStreamEvent>;

    if (!payload.type) {
      return null;
    }

    return payload as SummaryStreamEvent;
  } catch {
    return null;
  }
};

export const streamTaskSummary = async (
  taskId: string,
  signal?: AbortSignal,
): Promise<AsyncIterable<SummaryStreamEvent>> => {
  const response = await apiClient.get<ReadableStream<Uint8Array>>(
    `${SUMMARY_BASE_PATH}/${taskId}/summary/stream`,
    {
      responseType: "stream",
      signal,
    },
  );

  const reader = response.data.getReader();

  const iterator: AsyncIterable<SummaryStreamEvent> = {
    async *[Symbol.asyncIterator](): AsyncIterator<SummaryStreamEvent> {
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        if (signal?.aborted) {
          break;
        }

        const { done, value } = await reader.read();

        if (done) {
          break;
        }

        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split(/\r?\n/);
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          const event = parseSseEvent(line);

          if (event) {
            yield event;
          }
        }
      }

      const tail = buffer.trim();

      if (tail) {
        const event = parseSseEvent(tail);

        if (event) {
          yield event;
        }
      }
    },
  };

  return iterator;
};

export const getTaskSummary = async (
  taskId: string,
): Promise<TaskSummaryResponse> => {
  const response = await apiClient.get<TaskSummaryResponse>(
    `${SUMMARY_BASE_PATH}/${taskId}/summary`,
  );

  return response.data;
};

export const regenerateTaskSummary = async (
  taskId: string,
): Promise<TaskSummaryResponse> => {
  const payload: SummaryStreamRequest = {
    taskId,
    regenerate: true,
  };

  const response = await apiClient.post<TaskSummaryResponse>(
    `${SUMMARY_BASE_PATH}/${taskId}/summary`,
    payload,
  );

  return response.data;
};
