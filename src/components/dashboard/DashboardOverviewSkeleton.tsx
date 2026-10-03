import { Skeleton } from "@/components/ui/skeleton";

export function DashboardOverviewSkeleton() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 w-full animate-fade-in">
      {/* Executive Header Banner Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200/80">
        <div className="space-y-2">
          <Skeleton className="h-5 w-60 bg-slate-200" />
          <Skeleton className="h-3.5 w-80 sm:w-96 bg-slate-200/70" />
        </div>
        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <Skeleton className="h-7 w-32 bg-slate-200/80 rounded-md" />
          <Skeleton className="h-7 w-28 bg-slate-200/80 rounded-md" />
        </div>
      </div>

      {/* 10 Structured Metric Cards Skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3.5 sm:gap-4">
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            className="bg-white border border-slate-200/90 rounded-lg p-4 shadow-2xs flex flex-col justify-between h-[120px]"
          >
            <div className="flex items-start justify-between gap-2 mb-3">
              <Skeleton className="h-3 w-20 bg-slate-200" />
              <Skeleton className="w-7 h-7 rounded-md bg-slate-100 border border-slate-200/60" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-7 w-16 bg-slate-200" />
              <div className="pt-1 border-t border-slate-100">
                <Skeleton className="h-3.5 w-14 bg-slate-100 rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Analytics Charts Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. User Role Distribution (Donut Skeleton) */}
        <div className="bg-white rounded-lg border border-slate-200 p-5 sm:p-6 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-40 bg-slate-200" />
                <Skeleton className="h-3 w-56 bg-slate-200/70" />
              </div>
              <Skeleton className="h-6 w-24 bg-slate-100 rounded" />
            </div>

            <div className="w-full h-[260px] flex items-center justify-center">
              <div className="relative w-44 h-44 rounded-full border-[14px] border-slate-100 flex flex-col items-center justify-center animate-pulse">
                <Skeleton className="w-8 h-3 bg-slate-200 mb-1" />
                <Skeleton className="w-14 h-5 bg-slate-200" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-4 mt-2 border-t border-slate-100">
            {Array.from({ length: 5 }).map((_, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2 rounded-md bg-slate-50 border border-slate-200/70"
              >
                <div className="flex items-center gap-2">
                  <Skeleton className="w-2.5 h-2.5 rounded-full bg-slate-200" />
                  <Skeleton className="w-14 h-3 bg-slate-200" />
                </div>
                <Skeleton className="w-8 h-3 bg-slate-200" />
              </div>
            ))}
          </div>
        </div>

        {/* 2. League Summary (Bar Chart Skeleton) */}
        <div className="bg-white rounded-lg border border-slate-200 p-5 sm:p-6 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-36 bg-slate-200" />
                <Skeleton className="h-3 w-52 bg-slate-200/70" />
              </div>
              <Skeleton className="h-6 w-24 bg-slate-100 rounded" />
            </div>

            <div className="w-full h-[260px] flex items-end justify-around pb-6 px-6 gap-6">
              <div className="w-12 h-36 bg-slate-100 rounded-t border border-slate-200/60 animate-pulse" />
              <div className="w-12 h-52 bg-slate-200/70 rounded-t border border-slate-200/60 animate-pulse" />
              <div className="w-12 h-24 bg-slate-100 rounded-t border border-slate-200/60 animate-pulse" />
              <div className="w-12 h-44 bg-slate-200/70 rounded-t border border-slate-200/60 animate-pulse" />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-4 mt-2 border-t border-slate-100">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div
                key={idx}
                className="p-2 rounded-md bg-slate-50 border border-slate-200/70 flex flex-col justify-between h-14"
              >
                <Skeleton className="w-12 h-2.5 bg-slate-200 mb-1" />
                <Skeleton className="w-8 h-4 bg-slate-200" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
