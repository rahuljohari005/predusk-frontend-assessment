"use client";

import { useEffect, useMemo, useState, type ReactElement } from "react";

import { useTaskFeed } from "@/app/hooks/useTaskFeed";
import {
  selectAllTasks,
  selectSelectedTask,
  selectSortedTasks,
  selectTasksState,
} from "@/app/features/tasks/taskSelectors";
import {
  setFilters,
  setSelectedTask,
  setSort,
} from "@/app/features/tasks/taskSlice";
import { fetchTasks } from "@/app/features/tasks/taskThunks";
import { useAppDispatch, useAppSelector } from "@/app/store";
import { SortField, SortOrder, TaskStatus, TaskType } from "@/app/types";

import { EmptyState } from "./EmptyState";
import { ErrorState } from "./ErrorState";
import { FilterBar } from "./FilterBar";
import { LoadingState } from "./LoadingState";
import { Pagination } from "./Pagination";
import { SearchBar } from "./SearchBar";
import { SortDropdown } from "./SortDropdown";
import { TaskDetails } from "./TaskDetails";
import { TaskList } from "./TaskList";

export function TaskConsole(): ReactElement {
  useTaskFeed();

  const dispatch = useAppDispatch();
  const tasksState = useAppSelector(selectTasksState);
  const tasks = useAppSelector(selectAllTasks);
  const visibleTasks = useAppSelector(selectSortedTasks);
  const selectedTask = useAppSelector(selectSelectedTask);

  const [page, setPage] = useState(1);
  const pageSize = 4;

  useEffect(() => {
    void dispatch(fetchTasks());
  }, [dispatch]);

  const pagedTasks = useMemo(() => {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    return visibleTasks.slice(start, end);
  }, [page, visibleTasks]);

  const totalPages = Math.max(1, Math.ceil(visibleTasks.length / pageSize));

  useEffect(() => {
    if (page > totalPages) {
      window.requestAnimationFrame(() => setPage(totalPages));
    }
  }, [page, totalPages]);

  const handleSelectTask = (taskId: string): void => {
    dispatch(setSelectedTask(taskId));
  };

  const handleSearch = (value: string): void => {
    dispatch(
      setFilters({
        ...tasksState.filters,
        search: value,
      }),
    );
  };

  const handleStatusChange = (value: TaskStatus | "all"): void => {
    dispatch(
      setFilters({
        ...tasksState.filters,
        statuses: value === "all" ? [] : [value],
      }),
    );
  };

  const handleTypeChange = (value: TaskType | "all"): void => {
    dispatch(
      setFilters({
        ...tasksState.filters,
        priorities: [],
      }),
    );

    void value;
  };

  const handleSortFieldChange = (field: SortField): void => {
    dispatch(setSort({ ...tasksState.sort, field }));
  };

  const handleSortOrderChange = (order: SortOrder): void => {
    dispatch(setSort({ ...tasksState.sort, order }));
  };

  const renderContent = (): ReactElement => {
    if (tasksState.loading) {
      return <LoadingState />;
    }

    if (tasksState.error) {
      return <ErrorState message={tasksState.error} />;
    }

    if (tasks.length === 0) {
      return <EmptyState message="No tasks available yet." />;
    }

    if (visibleTasks.length === 0) {
      return <EmptyState message="No tasks match the current filters." />;
    }

    return (
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-4">
          <TaskList
            tasks={pagedTasks}
            selectedTaskId={tasksState.selectedTaskId}
            onSelectTask={handleSelectTask}
          />
          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>
        <TaskDetails task={selectedTask ?? null} />
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-zinc-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="rounded-3xl bg-zinc-950 px-6 py-8 text-white shadow-sm sm:px-8">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-zinc-400">
            Task Console
          </p>
          <h1 className="mt-3 text-3xl font-semibold">
            Manage tasks and monitor updates
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-zinc-300">
            Filter, sort, and review your task feed with live updates from the
            task stream.
          </p>
        </header>

        <section className="grid gap-4 rounded-3xl border border-zinc-200 bg-white p-4 shadow-sm md:grid-cols-[1.3fr_0.7fr] md:p-6">
          <SearchBar
            value={tasksState.filters.search}
            onChange={handleSearch}
          />
          <SortDropdown
            field={tasksState.sort.field}
            order={tasksState.sort.order}
            onFieldChange={handleSortFieldChange}
            onOrderChange={handleSortOrderChange}
          />
        </section>

        <section className="rounded-3xl border border-zinc-200 bg-white p-4 shadow-sm md:p-6">
          <FilterBar
            status={
              tasksState.filters.statuses.length > 0
                ? tasksState.filters.statuses[0]
                : "all"
            }
            type={"all"}
            onStatusChange={handleStatusChange}
            onTypeChange={handleTypeChange}
          />
        </section>

        {renderContent()}
      </div>
    </div>
  );
}
