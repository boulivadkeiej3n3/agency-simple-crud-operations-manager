"use client";

import { Plus, Search, SlidersHorizontal, ListTodo } from "lucide-react";

export default function Dashboard() {
  return (
    <main className="min-h-[calc(100vh-80px)] bg-[#08090d] text-white">
      <div className="mx-auto flex w-full max-w-7xl flex-col px-4 py-6 sm:px-6 sm:py-8 lg:px-8">

        {/* Dashboard Header */}
        <div className="mb-6 flex flex-col gap-5 sm:mb-8 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.25em] text-amber-400/70">
              <ListTodo className="h-4 w-4" />
              Task Management
            </div>

            <h1 className="text-2xl font-semibold tracking-tight text-zinc-100 sm:text-3xl lg:text-4xl">
              Dashboard
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-zinc-500 sm:text-base">
              Manage, monitor, and organize your tasks from one place.
            </p>
          </div>

          {/* Add Task Button */}
          <button
            type="button"
            className="group flex w-full items-center justify-center gap-2 rounded-xl border border-amber-400/30 bg-gradient-to-r from-amber-500 to-yellow-600 px-5 py-3 text-sm font-semibold text-black shadow-lg shadow-amber-950/30 transition-all duration-200 hover:from-amber-400 hover:to-yellow-500 hover:shadow-amber-500/10 active:scale-[0.98] sm:w-auto"
          >
            <Plus className="h-4 w-4 transition-transform duration-200 group-hover:rotate-90" />
            Add Task
          </button>
        </div>

        {/* Toolbar */}
        <div className="mb-4 flex flex-col gap-3 sm:mb-5 md:flex-row">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-600" />

            <input
              type="text"
              placeholder="Search tasks..."
              className="h-12 w-full rounded-xl border border-white/[0.07] bg-white/[0.025] pl-11 pr-4 text-sm text-zinc-200 outline-none transition-all placeholder:text-zinc-600 focus:border-amber-400/30 focus:bg-white/[0.04] focus:ring-1 focus:ring-amber-400/10"
            />
          </div>

          {/* Filter */}
          <button
            type="button"
            className="flex h-12 items-center justify-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.025] px-5 text-sm font-medium text-zinc-400 transition-all hover:border-amber-400/20 hover:bg-amber-400/[0.04] hover:text-amber-300"
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span>Filter</span>
          </button>
        </div>

        {/* Task List Container */}
        <section className="overflow-hidden rounded-2xl border border-white/[0.07] bg-gradient-to-b from-white/[0.035] to-white/[0.015] shadow-2xl shadow-black/20">

          {/* List Header */}
          <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-4 sm:px-5 lg:px-6">
            <div>
              <h2 className="text-sm font-semibold text-zinc-200 sm:text-base">
                Tasks
              </h2>

              <p className="mt-1 text-xs text-zinc-600">
                Your current task list
              </p>
            </div>

            <span className="rounded-full border border-amber-400/10 bg-amber-400/5 px-3 py-1 text-xs font-medium text-amber-400/70">
              0 Tasks
            </span>
          </div>

          {/* Scrollable Task Area */}
          <div
            className="
              h-[55vh]
              min-h-[320px]
              max-h-[700px]
              overflow-y-auto
              overscroll-contain
              p-3
              sm:h-[60vh]
              sm:p-4
              lg:h-[65vh]
            "
          >
            {/* Task Components will be rendered here later */}

            <div className="flex h-full min-h-[280px] items-center justify-center">
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-400/10 bg-amber-400/[0.04]">
                  <ListTodo className="h-6 w-6 text-amber-400/50" />
                </div>

                <h3 className="text-sm font-medium text-zinc-400">
                  No tasks yet
                </h3>

                <p className="mt-1 text-xs text-zinc-600">
                  Your Task Components will appear here.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

