import { useEffect, useState } from "react";

import { streamTaskSummary } from "@/app/services/summaryService";
import { SummaryStatus, SummaryStreamEventType } from "@/app/types";

export interface TaskSummaryStreamState {
  content: string;
  status: SummaryStatus;
  error: string | null;
  isStreaming: boolean;
}

const sanitizeMarkdown = (markdown: string): string => {
  return markdown
    .replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, "")
    .replace(/<[^>]+>/g, "")
    .trim();
};

export const useTaskSummaryStream = (
  taskId: string | null,
): TaskSummaryStreamState => {
  const [content, setContent] = useState<string>("");
  const [status, setStatus] = useState<SummaryStatus>(SummaryStatus.Idle);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!taskId) {
      const reset = (): void => {
        setContent("");
        setStatus(SummaryStatus.Idle);
        setError(null);
      };

      reset();
      return;
    }

    const controller = new AbortController();
    let isCancelled = false;

    const runStream = async (): Promise<void> => {
      setContent("");
      setStatus(SummaryStatus.Streaming);
      setError(null);

      try {
        const events = await streamTaskSummary(taskId, controller.signal);

        for await (const event of events) {
          if (isCancelled || controller.signal.aborted) {
            break;
          }

          switch (event.type) {
            case SummaryStreamEventType.Start:
              setContent("");
              setStatus(SummaryStatus.Streaming);
              break;

            case SummaryStreamEventType.Chunk: {
              const sanitizedChunk = sanitizeMarkdown(event.content);

              if (sanitizedChunk.length > 0) {
                setContent((previous) => `${previous}${sanitizedChunk}`);
              }
              break;
            }

            case SummaryStreamEventType.Done:
              setStatus(SummaryStatus.Complete);
              break;

            case SummaryStreamEventType.Error:
              setStatus(SummaryStatus.Error);
              setError(event.message);
              break;

            default:
              break;
          }
        }
      } catch (streamError) {
        if (!isCancelled && !controller.signal.aborted) {
          const message =
            streamError instanceof Error
              ? streamError.message
              : "Unable to stream task summary";

          setStatus(SummaryStatus.Error);
          setError(message);
        }
      }
    };

    void runStream();

    return () => {
      isCancelled = true;
      controller.abort();
    };
  }, [taskId]);

  return {
    content,
    status,
    error,
    isStreaming: status === SummaryStatus.Streaming,
  };
};
