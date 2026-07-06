import {
  normalizeAnnotationCount,
  normalizeAssignee,
  normalizeDate,
  normalizeStatus,
  normalizeTask,
  normalizeTaskType,
  type RawTask,
} from "./normalize";
import { TaskPriority, TaskStatus, TaskType } from "@/app/types";

describe("normalizeTaskType", () => {
  it("maps known task types case-insensitively", () => {
    expect(normalizeTaskType("IMAGE")).toBe(TaskType.Image);
    expect(normalizeTaskType("audio")).toBe(TaskType.Audio);
    expect(normalizeTaskType("Text")).toBe(TaskType.Text);
  });

  it("falls back to unknown for unmatched values", () => {
    expect(normalizeTaskType(undefined)).toBe(TaskType.Unknown);
    expect(normalizeTaskType("video")).toBe(TaskType.Unknown);
  });
});

describe("normalizeStatus", () => {
  it("covers the supported aliases", () => {
    expect(normalizeStatus("todo")).toBe(TaskStatus.Todo);
    expect(normalizeStatus("inprogress")).toBe(TaskStatus.InProgress);
    expect(normalizeStatus("in_progress")).toBe(TaskStatus.InProgress);
    expect(normalizeStatus("done")).toBe(TaskStatus.Done);
    expect(normalizeStatus("blocked")).toBe(TaskStatus.Cancelled);
    expect(normalizeStatus("qa")).toBe(TaskStatus.Cancelled);
    expect(normalizeStatus("cancelled")).toBe(TaskStatus.Cancelled);
  });

  it("defaults to todo for unknown values", () => {
    expect(normalizeStatus("archived")).toBe(TaskStatus.Todo);
    expect(normalizeStatus(null)).toBe(TaskStatus.Todo);
  });
});

describe("normalizeDate", () => {
  it("normalizes numeric timestamps and strings", () => {
    const numeric = normalizeDate(0);
    const stringValue = normalizeDate("2024-01-02T03:04:05.000Z");

    expect(new Date(numeric).toISOString()).toBe("1970-01-01T00:00:00.000Z");
    expect(stringValue).toBe("2024-01-02T03:04:05.000Z");
  });

  it("falls back to the current time when the input is invalid", () => {
    const value = normalizeDate("not-a-date");

    expect(typeof value).toBe("string");
    expect(new Date(value).toString()).not.toBe("Invalid Date");
  });
});

describe("normalizeAssignee", () => {
  it("builds a normalized assignee from a partial object", () => {
    expect(normalizeAssignee({ id: 42, name: "Ada" })).toEqual({
      id: "42",
      name: "Ada",
      email: "",
    });
  });

  it("returns null for missing or invalid payloads", () => {
    expect(normalizeAssignee(null)).toBeNull();
    expect(normalizeAssignee(undefined)).toBeNull();
    expect(normalizeAssignee("not-an-object")).toBeNull();
  });
});

describe("normalizeAnnotationCount", () => {
  it("coerces numeric strings and invalid values", () => {
    expect(normalizeAnnotationCount("7")).toBe(7);
    expect(normalizeAnnotationCount("oops")).toBe(0);
    expect(normalizeAnnotationCount(undefined)).toBe(0);
  });
});

describe("normalizeTask", () => {
  it("normalizes inconsistent backend payloads into the domain model", () => {
    const rawTask: RawTask = {
      id: 17,
      title: "Ship release",
      type: "IMAGE",
      status: "inprogress",
      assignee: { id: 3, name: "Lin" },
      annotationCount: "4",
      updatedAt: "2024-05-06T07:08:09.000Z",
      meta: { source: "backend" },
    };

    expect(normalizeTask(rawTask)).toEqual({
      id: "17",
      title: "Ship release",
      description: "",
      type: TaskType.Image,
      status: TaskStatus.InProgress,
      priority: TaskPriority.Medium,
      assignee: { id: "3", name: "Lin", email: "" },
      annotationCount: 4,
      tags: [],
      dueDate: null,
      meta: { source: "backend" },
      createdAt: "2024-05-06T07:08:09.000Z",
      updatedAt: "2024-05-06T07:08:09.000Z",
    });
  });

  it("uses safe defaults when the payload is sparse", () => {
    const rawTask: RawTask = {
      id: null,
      title: null,
      type: null,
      status: null,
      assignee: null,
      annotationCount: null,
      updatedAt: null,
      meta: null,
    };

    const normalized = normalizeTask(rawTask);

    expect(normalized.id).toBe("null");
    expect(normalized.title).toBe("");
    expect(normalized.type).toBe(TaskType.Unknown);
    expect(normalized.status).toBe(TaskStatus.Todo);
    expect(normalized.assignee).toBeNull();
    expect(normalized.annotationCount).toBe(0);
    expect(normalized.meta).toEqual({});
  });
});
