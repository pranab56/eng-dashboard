"use client";

import React from "react";
import { AlertCircle, Database, RefreshCw } from "lucide-react";
import CreateButton from "@/components/buttons/CreateButton";

export interface ApiStateWrapperProps {
  isLoading: boolean;
  isError: boolean;
  isEmpty: boolean;
  error?: any;
  onRetry?: () => void;
  loadingSkeleton?: React.ReactNode;
  emptyTitle?: string;
  emptyDescription?: string;
  children: React.ReactNode;
}

export const ApiStateWrapper: React.FC<ApiStateWrapperProps> = ({
  isLoading,
  isError,
  isEmpty,
  error,
  onRetry,
  loadingSkeleton,
  emptyTitle = "No data found",
  emptyDescription = "There are no records to display at this time.",
  children,
}) => {
  // 1. Loading State
  if (isLoading) {
    return (
      loadingSkeleton || (
        <div className="w-full space-y-3 p-6 animate-pulse bg-white rounded-xl border border-slate-200/60">
          <div className="h-6 bg-slate-100 rounded-md w-1/3" />
          <div className="h-24 bg-slate-50 rounded-lg w-full" />
          <div className="h-6 bg-slate-100 rounded-md w-1/4" />
        </div>
      )
    );
  }

  // 2. Error State
  if (isError) {
    const errorMessage =
      error?.data?.message || error?.message || "Failed to load data from server.";

    return (
      <div className="w-full flex flex-col items-center justify-center p-8 bg-red-50/50 border border-red-200/80 rounded-xl text-center">
        <div className="h-12 w-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-3">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h3 className="text-base font-bold text-slate-900 mb-1">Something went wrong</h3>
        <p className="text-xs text-slate-600 max-w-md mb-4">{errorMessage}</p>
        {onRetry && (
          <CreateButton
            text="Retry Loading"
            onClick={onRetry}
            className="bg-red-600 hover:bg-red-700 text-white shadow-xs"
          />
        )}
      </div>
    );
  }

  // 3. Empty State
  if (isEmpty) {
    return (
      <div className="w-full flex flex-col items-center justify-center p-12 bg-white border border-slate-200/70 rounded-xl text-center shadow-xs">
        <div className="h-14 w-14 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mb-3 border border-slate-200/60">
          <Database className="h-7 w-7" />
        </div>
        <h3 className="text-base font-bold text-slate-900 mb-1">{emptyTitle}</h3>
        <p className="text-xs text-slate-500 max-w-sm mb-4">{emptyDescription}</p>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Refresh</span>
          </button>
        )}
      </div>
    );
  }

  // 4. Success State
  return <>{children}</>;
};
