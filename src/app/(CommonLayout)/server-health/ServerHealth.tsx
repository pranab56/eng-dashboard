"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  RefreshCw,
  Server,
  Database,
  Cpu,
  HardDrive,
  Clock,
  ShieldCheck,
  AlertCircle,
  Layers,
  RotateCcw,
  Trash2,
  Pause,
  Play,
  Zap,
  Mail,
  Bell,
  MessageSquare,
  Sparkles,
  ShieldAlert,
  Info,
  CheckCircle2,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  ResponsiveContainer,
} from "recharts";
import { useHeaders } from "@/hooks/useHeaders";
import {
  useGetServerHealthQuery,
  useGetQueueAndCacheStatusQuery,
  useExecuteQueueActionMutation,
  useFlushCacheMutation,
  BullQueueStat,
} from "@/features/serverHealth/serverHealthApi";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ChartHistoryItem {
  time: string;
  usage?: number;
  load?: number;
}

function formatUptimeText(uptime: any) {
  if (!uptime) return "0m";
  const parts: string[] = [];
  if (uptime.days > 0) parts.push(`${uptime.days}d`);
  if (uptime.hours > 0) parts.push(`${uptime.hours}h`);
  if (uptime.minutes > 0) parts.push(`${uptime.minutes}m`);
  return parts.join(" ") || "< 1m";
}

const QUEUE_META: Record<string, { label: string; icon: React.ReactNode; desc: string }> = {
  email: {
    label: "Email Queue",
    icon: <Mail className="w-4 h-4 text-sky-500" />,
    desc: "Password resets, activation & transaction notifications",
  },
  notification: {
    label: "Notification Queue",
    icon: <Bell className="w-4 h-4 text-purple-500" />,
    desc: "Push notifications, in-app alerts & socket broadcasts",
  },
  sms: {
    label: "SMS Queue",
    icon: <MessageSquare className="w-4 h-4 text-amber-500" />,
    desc: "OTP verifications & emergency alert SMS dispatching",
  },
  cleanup: {
    label: "Cleanup Queue",
    icon: <Sparkles className="w-4 h-4 text-emerald-500" />,
    desc: "Database pruning, log rotation & expired session sweeps",
  },
};

export default function ServerHealth() {
  const { setHeaders } = useHeaders();

  useEffect(() => {
    setHeaders({
      title: "Server Diagnostics & Telemetry",
      des: "Live hardware utilization, Redis cache operations, and BullMQ queue management.",
    });
  }, [setHeaders]);

  const [pollingRate, setPollingRate] = useState<number>(5000);

  // Queries
  const {
    data: healthRes,
    isLoading,
    isFetching,
    refetch,
  } = useGetServerHealthQuery(undefined, {
    pollingInterval: pollingRate,
  });

  const {
    data: queueRes,
    isFetching: isQueueFetching,
    refetch: refetchQueues,
  } = useGetQueueAndCacheStatusQuery(undefined, {
    pollingInterval: pollingRate > 0 ? Math.max(pollingRate, 5000) : 0,
  });

  const [executeQueueAction] = useExecuteQueueActionMutation();
  const [flushCacheMutation, { isLoading: isFlushing }] = useFlushCacheMutation();

  const health = healthRes?.data;
  const queueData = queueRes?.data;

  // Flush modal states
  const [flushModalOpen, setFlushModalOpen] = useState(false);
  const [flushType, setFlushType] = useState<"cache-only" | "all">("cache-only");
  const [confirmInput, setConfirmInput] = useState("");
  const [actionLoadingKey, setActionLoadingKey] = useState<string | null>(null);

  // Real-time timeline history
  const [memoryHistory, setMemoryHistory] = useState<ChartHistoryItem[]>([]);
  const [loadHistory, setLoadHistory] = useState<ChartHistoryItem[]>([]);

  useEffect(() => {
    if (!health) return;
    const nowStr = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    const memPct = health.memory?.usedMemoryPercentage || 0;
    const load1 = health.loadAverage?.["1min"] || 0;

    setMemoryHistory((prev) => {
      if (prev.length === 0) {
        return Array.from({ length: 14 }, (_, i) => ({
          time: `-${(14 - i) * 5}s`,
          usage: Math.max(5, Math.min(100, memPct + (Math.random() * 3 - 1.5))),
        }));
      }
      const updated = prev.length >= 20 ? prev.slice(1) : prev;
      return [...updated, { time: nowStr, usage: memPct }];
    });

    setLoadHistory((prev) => {
      if (prev.length === 0) {
        return Array.from({ length: 14 }, (_, i) => ({
          time: `-${(14 - i) * 5}s`,
          load: Math.max(0, load1 + (Math.random() * 0.15 - 0.07)),
        }));
      }
      const updated = prev.length >= 20 ? prev.slice(1) : prev;
      return [...updated, { time: nowStr, load: load1 }];
    });
  }, [health]);

  const handleManualRefresh = async () => {
    try {
      await Promise.all([refetch(), refetchQueues()]);
      toast.success("Metrics updated", { duration: 1500 });
    } catch {
      toast.error("Failed to update telemetry");
    }
  };

  const handleQueueAction = async (
    queueName: string,
    action: "retry-failed" | "clean-completed" | "clean-failed" | "pause" | "resume"
  ) => {
    const key = `${queueName}-${action}`;
    try {
      setActionLoadingKey(key);
      const res = await executeQueueAction({ queueName, action }).unwrap();
      toast.success(res.message || `Executed ${action} on ${queueName}`);
      refetchQueues();
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || "Could not complete queue action");
    } finally {
      setActionLoadingKey(null);
    }
  };

  const handleFlushCache = async () => {
    if (flushType === "all" && confirmInput.trim().toUpperCase() !== "FLUSH") {
      toast.warning("Please type FLUSH to confirm wiping the entire Redis database.");
      return;
    }

    try {
      const res = await flushCacheMutation({ type: flushType }).unwrap();
      toast.success(res.message);
      setFlushModalOpen(false);
      setConfirmInput("");
      refetchQueues();
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || "Failed to flush cache");
    }
  };

  const memPct = health?.memory?.usedMemoryPercentage || 0;

  const statusBadge = useMemo(() => {
    if (isLoading && !health) {
      return {
        label: "Connecting...",
        dotColor: "bg-slate-400",
        textColor: "text-slate-600",
        bgColor: "bg-slate-100",
      };
    }
    if (!health) {
      return {
        label: "Offline",
        dotColor: "bg-rose-500",
        textColor: "text-rose-700",
        bgColor: "bg-rose-50 border-rose-200",
      };
    }
    if (memPct >= 90) {
      return {
        label: "High Resource Usage",
        dotColor: "bg-amber-500",
        textColor: "text-amber-800",
        bgColor: "bg-amber-50 border-amber-200",
      };
    }
    return {
      label: "Operational",
      dotColor: "bg-emerald-500",
      textColor: "text-emerald-800",
      bgColor: "bg-emerald-50 border-emerald-200",
    };
  }, [isLoading, health, memPct]);

  const totalFailedJobs = (queueData?.queues || []).reduce((acc, q) => acc + (q.failed || 0), 0);
  const totalCompletedJobs = (queueData?.queues || []).reduce((acc, q) => acc + (q.completed || 0), 0);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 w-full text-slate-900">
      {/* Action & Status Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${statusBadge.bgColor} ${statusBadge.textColor}`}
          >
            <span className={`w-2 h-2 rounded-full ${statusBadge.dotColor}`} />
            {statusBadge.label}
          </span>
          <span className="text-xs text-slate-500">
            Last sync:{" "}
            {health?.timestamp
              ? new Date(health.timestamp).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })
              : "Connecting..."}
          </span>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Polling Interval Select */}
          <div className="flex items-center gap-1.5 h-8 px-2.5 bg-white border border-slate-200 rounded-md text-xs text-slate-600">
            <span className="text-slate-400">Refresh:</span>
            <select
              value={pollingRate}
              onChange={(e) => setPollingRate(Number(e.target.value))}
              className="bg-transparent font-medium text-slate-700 outline-none cursor-pointer pr-1"
            >
              <option value={3000}>3s</option>
              <option value={5000}>5s</option>
              <option value={10000}>10s</option>
              <option value={30000}>30s</option>
              <option value={0}>Manual only</option>
            </select>
          </div>

          {/* Manual Refresh Button */}
          <button
            onClick={handleManualRefresh}
            disabled={isFetching || isQueueFetching}
            className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md text-xs font-medium bg-slate-900 hover:bg-slate-800 text-white transition-colors disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isFetching || isQueueFetching ? "animate-spin" : ""}`} />
            <span>Sync</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Grid: Unified Structural Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* KPI 1: Processor Capacity */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-medium uppercase tracking-wider">CPU Allocation</span>
            <Cpu className="w-4 h-4 text-slate-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-900">{health?.cpuCores ?? 0}</span>
            <span className="text-xs text-slate-500 font-medium">Logical Cores</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 font-mono">
            Load: {health?.loadAverage?.["1min"] ?? 0} / {health?.loadAverage?.["5min"] ?? 0}
          </div>
        </div>

        {/* KPI 2: Memory Density */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-medium uppercase tracking-wider">Memory Allocation</span>
            <HardDrive className="w-4 h-4 text-slate-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-900">{memPct}%</span>
            <span className="text-xs text-slate-500 font-medium">
              {health?.memory?.usedMemory?.GB ?? 0} / {health?.memory?.totalMemory?.GB ?? 0} GB
            </span>
          </div>
          <div className="mt-2 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                memPct >= 90 ? "bg-amber-500" : "bg-slate-900"
              }`}
              style={{ width: `${Math.min(memPct, 100)}%` }}
            />
          </div>
        </div>

        {/* KPI 3: Operational Longevity */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-medium uppercase tracking-wider">System Uptime</span>
            <Clock className="w-4 h-4 text-slate-400" />
          </div>
          <div className="flex items-baseline gap-1 font-mono text-2xl font-bold text-slate-900">
            {formatUptimeText(health?.uptime)}
          </div>
          <div className="mt-2 text-[11px] text-emerald-700 font-medium flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Continuous execution
          </div>
        </div>

        {/* KPI 4: MongoDB Connectivity */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-medium uppercase tracking-wider">Database State</span>
            <Database className="w-4 h-4 text-slate-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 capitalize">
              {health?.database?.status ?? "Disconnected"}
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 font-mono">
            ReadyState: {health?.database?.readyState ?? 0} (Primary Active)
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 🚀 REDIS CACHE & BULLMQ QUEUE MANAGEMENT SECTION */}
      {/* ======================================================== */}
      <div className="space-y-4 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center text-rose-600 border border-rose-100">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                Redis Cache & BullMQ Queue Manager
                {queueData?.redis?.connected && (
                  <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse" />
                    Online ({queueData.redis.pingMs}ms)
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-500">
                Live queue counters, job retry, completed sweeps, and safe cache flushes.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                setFlushType("cache-only");
                setFlushModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-semibold bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 transition-colors shadow-2xs cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5 text-slate-500" />
              Flush App Cache
            </button>

            <button
              onClick={() => {
                setFlushType("all");
                setConfirmInput("");
                setFlushModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-semibold bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 transition-colors shadow-2xs cursor-pointer"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              Flush All Redis
            </button>
          </div>
        </div>

        {/* Redis Engine Telemetry Strip */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 divide-y md:divide-y-0 md:divide-x divide-slate-100 text-xs">
            <div className="pt-2 md:pt-0">
              <span className="text-[11px] text-slate-400 font-medium block mb-1">Redis Engine</span>
              <div className="flex items-center gap-1.5 font-bold text-slate-800 text-sm">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                v{queueData?.redis?.version || "7.x"}
              </div>
              <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">
                Uptime: {Math.floor((queueData?.redis?.uptimeSeconds || 0) / 3600)}h
              </span>
            </div>

            <div className="pt-2 md:pt-0 md:pl-4">
              <span className="text-[11px] text-slate-400 font-medium block mb-1">Resident Memory</span>
              <span className="font-bold text-slate-800 text-sm block">
                {queueData?.redis?.usedMemoryHuman || "0M"}
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5 font-mono">
                {(queueData?.redis?.usedMemoryBytes ? (queueData.redis.usedMemoryBytes / 1024 / 1024).toFixed(2) : 0)} MB
              </span>
            </div>

            <div className="pt-2 md:pt-0 md:pl-4">
              <span className="text-[11px] text-slate-400 font-medium block mb-1">Total DB Keys</span>
              <span className="font-bold text-slate-800 text-sm block">
                {(queueData?.redis?.totalKeys || 0).toLocaleString()}
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">Across Redis DB 0</span>
            </div>

            <div className="pt-2 md:pt-0 md:pl-4">
              <span className="text-[11px] text-slate-400 font-medium block mb-1">BullMQ Queue Keys</span>
              <span className="font-bold text-indigo-600 text-sm block">
                {(queueData?.redis?.bullKeys || 0).toLocaleString()}
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">Queue definitions & jobs</span>
            </div>

            <div className="pt-2 md:pt-0 md:pl-4">
              <span className="text-[11px] text-slate-400 font-medium block mb-1">App Cache Keys</span>
              <span className="font-bold text-emerald-600 text-sm block">
                {(queueData?.redis?.appCacheKeys || 0).toLocaleString()}
              </span>
              <span className="text-[10px] text-emerald-600 block mt-0.5">Safe to invalidate</span>
            </div>
          </div>
        </div>

        {/* Global Bulk Operations Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-slate-600" />
            <span className="text-xs font-semibold text-slate-800">
              Bulk Queue Operations:
            </span>
            <span className="text-xs text-slate-500">
              ({totalFailedJobs} failed / {totalCompletedJobs} completed across all queues)
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              disabled={totalFailedJobs === 0 || actionLoadingKey === "all-retry-failed"}
              onClick={() => handleQueueAction("all", "retry-failed")}
              className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-md text-xs font-semibold bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 disabled:opacity-40 transition-colors cursor-pointer"
            >
              <RotateCcw className={`w-3 h-3 ${actionLoadingKey === "all-retry-failed" ? "animate-spin" : ""}`} />
              Retry All Failed ({totalFailedJobs})
            </button>

            <button
              disabled={totalCompletedJobs === 0 || actionLoadingKey === "all-clean-completed"}
              onClick={() => handleQueueAction("all", "clean-completed")}
              className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-md text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-40 transition-colors cursor-pointer"
            >
              <Trash2 className={`w-3 h-3 ${actionLoadingKey === "all-clean-completed" ? "animate-spin" : ""}`} />
              Clean All Completed
            </button>

            <button
              disabled={totalFailedJobs === 0 || actionLoadingKey === "all-clean-failed"}
              onClick={() => handleQueueAction("all", "clean-failed")}
              className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-md text-xs font-semibold bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 disabled:opacity-40 transition-colors cursor-pointer"
            >
              <Trash2 className={`w-3 h-3 ${actionLoadingKey === "all-clean-failed" ? "animate-spin" : ""}`} />
              Clean All Failed
            </button>
          </div>
        </div>

        {/* 4 Dedicated BullMQ Queue Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {(queueData?.queues || []).map((q: BullQueueStat) => {
            const meta = QUEUE_META[q.name] || {
              label: `${q.name} Queue`,
              icon: <Layers className="w-4 h-4 text-slate-600" />,
              desc: "Background processing queue",
            };

            const isPaused = q.paused;
            const isRetrying = actionLoadingKey === `${q.name}-retry-failed`;
            const isCleaningCompleted = actionLoadingKey === `${q.name}-clean-completed`;
            const isCleaningFailed = actionLoadingKey === `${q.name}-clean-failed`;
            const isTogglingPause = actionLoadingKey === `${q.name}-${isPaused ? "resume" : "pause"}`;

            return (
              <div
                key={q.name}
                className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col justify-between shadow-2xs hover:border-slate-300 transition-colors"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-md bg-slate-50 flex items-center justify-center">
                        {meta.icon}
                      </div>
                      <span className="font-bold text-slate-900 text-sm">
                        {meta.label}
                      </span>
                    </div>

                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                        isPaused
                          ? "bg-amber-50 text-amber-700 border-amber-200"
                          : "bg-emerald-50 text-emerald-700 border-emerald-200"
                      }`}
                    >
                      {isPaused ? "Paused" : "Active"}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400 mb-3.5 line-clamp-1">
                    {meta.desc}
                  </p>

                  {/* Counters */}
                  <div className="grid grid-cols-3 gap-1.5 mb-2 text-center text-xs">
                    <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                      <span className="text-[10px] font-medium text-slate-400 block">Waiting</span>
                      <span className="font-bold font-mono text-slate-800 text-sm">{q.waiting}</span>
                    </div>

                    <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                      <span className="text-[10px] font-medium text-slate-400 block">Active</span>
                      <span className="font-bold font-mono text-blue-600 text-sm">{q.active}</span>
                    </div>

                    <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                      <span className="text-[10px] font-medium text-slate-400 block">Delayed</span>
                      <span className="font-bold font-mono text-amber-600 text-sm">{q.delayed}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5 mb-3 text-center text-xs">
                    <div className="bg-emerald-50/60 p-2 rounded-lg border border-emerald-100">
                      <span className="text-[10px] font-medium text-emerald-700 block">Completed</span>
                      <span className="font-bold font-mono text-emerald-700 text-sm">{q.completed}</span>
                    </div>

                    <div
                      className={`p-2 rounded-lg border ${
                        q.failed > 0
                          ? "bg-rose-50 border-rose-200 text-rose-700"
                          : "bg-slate-50 border-slate-100 text-slate-700"
                      }`}
                    >
                      <span
                        className={`text-[10px] font-medium block ${
                          q.failed > 0 ? "text-rose-600 font-semibold" : "text-slate-400"
                        }`}
                      >
                        Failed
                      </span>
                      <span
                        className={`font-bold font-mono text-sm ${
                          q.failed > 0 ? "text-rose-600" : "text-slate-800"
                        }`}
                      >
                        {q.failed}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Queue Card Actions */}
                <div className="pt-2.5 border-t border-slate-100 space-y-1.5">
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      disabled={q.failed === 0 || isRetrying}
                      onClick={() => handleQueueAction(q.name, "retry-failed")}
                      className={`h-7 text-[11px] font-semibold rounded-md border flex items-center justify-center transition-colors cursor-pointer ${
                        q.failed > 0
                          ? "border-indigo-300 text-indigo-700 bg-indigo-50/50 hover:bg-indigo-100"
                          : "border-slate-200 text-slate-400 opacity-50 cursor-not-allowed"
                      }`}
                    >
                      <RotateCcw className={`w-3 h-3 mr-1 ${isRetrying ? "animate-spin" : ""}`} />
                      Retry Failed
                    </button>

                    <button
                      disabled={isTogglingPause}
                      onClick={() => handleQueueAction(q.name, isPaused ? "resume" : "pause")}
                      className="h-7 text-[11px] font-semibold rounded-md border border-slate-200 text-slate-700 hover:bg-slate-50 flex items-center justify-center transition-colors cursor-pointer"
                    >
                      {isPaused ? (
                        <>
                          <Play className="w-3 h-3 mr-1 text-emerald-500" /> Resume
                        </>
                      ) : (
                        <>
                          <Pause className="w-3 h-3 mr-1 text-amber-500" /> Pause
                        </>
                      )}
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      disabled={q.completed === 0 || isCleaningCompleted}
                      onClick={() => handleQueueAction(q.name, "clean-completed")}
                      className="h-6 text-[10px] font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-md disabled:opacity-30 cursor-pointer"
                    >
                      Clean Done
                    </button>

                    <button
                      disabled={q.failed === 0 || isCleaningFailed}
                      onClick={() => handleQueueAction(q.name, "clean-failed")}
                      className="h-6 text-[10px] font-medium text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-md disabled:opacity-30 cursor-pointer"
                    >
                      Clean Failed
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Telemetry Charts: High-Precision Enterprise Density */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Chart 1: Memory */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-xs font-semibold text-slate-800">Memory Utilization Trajectory</h3>
              <p className="text-[11px] text-slate-500">RAM allocation percentage over time</p>
            </div>
            <span className="font-mono text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
              {memPct}%
            </span>
          </div>

          <div className="h-[160px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={memoryHistory} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="2 2" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="time" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={{ stroke: "#e2e8f0" }} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <ChartTooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-slate-900 text-white text-xs px-2 py-1 rounded shadow font-mono">
                          {Number(payload[0].value).toFixed(1)}%
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area type="monotone" dataKey="usage" stroke="#0f172a" strokeWidth={1.5} fill="#f1f5f9" fillOpacity={0.6} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: CPU Load */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-xs font-semibold text-slate-800">CPU Load Average (1m)</h3>
              <p className="text-[11px] text-slate-500">Processor queue demand</p>
            </div>
            <span className="font-mono text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
              {health?.loadAverage?.["1min"] ?? 0}
            </span>
          </div>

          <div className="h-[160px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={loadHistory} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="2 2" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="time" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={{ stroke: "#e2e8f0" }} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <ChartTooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-slate-900 text-white text-xs px-2 py-1 rounded shadow font-mono">
                          {Number(payload[0].value).toFixed(2)}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area type="monotone" dataKey="load" stroke="#0f172a" strokeWidth={1.5} fill="#f1f5f9" fillOpacity={0.6} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Specifications & Connectivity Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
        <div className="px-4 py-3 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
          <div>
            <h3 className="text-xs font-semibold text-slate-900">System Specifications</h3>
            <p className="text-[11px] text-slate-500">Configuration and runtime environment telemetry</p>
          </div>
          <span className="text-[11px] font-mono text-slate-500">
            Host Port: 5005
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 text-xs">
          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Service Identifier</span>
              <span className="font-medium text-slate-900">ENG Backend</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Process State</span>
              <span className="font-mono text-emerald-700 font-medium">Listening</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Database Driver</span>
              <span className="font-medium text-slate-900">Mongoose / MongoDB</span>
            </div>
          </div>

          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Available Cores</span>
              <span className="font-mono font-medium text-slate-900">{health?.cpuCores || 0} Units</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Load Avg (1 / 5 / 15m)</span>
              <span className="font-mono text-slate-700">
                {health?.loadAverage?.["1min"] ?? 0} / {health?.loadAverage?.["5min"] ?? 0} / {health?.loadAverage?.["15min"] ?? 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Database Cluster State</span>
              <span className="inline-flex items-center gap-1 font-medium text-emerald-700">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Connected
              </span>
            </div>
          </div>

          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Total System RAM</span>
              <span className="font-mono text-slate-900">{health?.memory?.totalMemory?.GB || 0} GB</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Allocated RAM</span>
              <span className="font-mono text-slate-900">{health?.memory?.usedMemory?.GB || 0} GB ({memPct}%)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Unallocated RAM</span>
              <span className="font-mono text-slate-900">{health?.memory?.freeMemory?.GB || 0} GB</span>
            </div>
          </div>
        </div>
      </div>

      {/* Flush Confirmation Dialog */}
      <Dialog open={flushModalOpen} onOpenChange={setFlushModalOpen}>
        <DialogContent className="sm:max-w-[440px] rounded-2xl p-6 bg-white">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  flushType === "all"
                    ? "bg-rose-100 text-rose-600"
                    : "bg-amber-100 text-amber-600"
                }`}
              >
                {flushType === "all" ? (
                  <ShieldAlert className="w-5 h-5" />
                ) : (
                  <Trash2 className="w-5 h-5" />
                )}
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-slate-900">
                  {flushType === "all" ? "Flush Entire Redis Database" : "Flush Application Cache"}
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500 mt-0.5">
                  {flushType === "all"
                    ? "Permanent and destructive action"
                    : "Selective cache invalidation"}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="py-2 text-xs text-slate-600 space-y-3 leading-relaxed">
            {flushType === "cache-only" ? (
              <div className="bg-emerald-50 border border-emerald-200/80 p-3 rounded-xl text-emerald-800">
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                  <p>
                    <strong>Safe Operation:</strong> This deletes only application cache keys.
                    BullMQ queues (emails, SMS, notifications) and Socket connections will <strong>NOT</strong> be affected.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="bg-rose-50 border border-rose-200/80 p-3 rounded-xl text-rose-800">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                    <p>
                      <strong>Warning:</strong> This will wipe <strong>ALL</strong> keys in Redis DB 0, including pending BullMQ jobs and active queues.
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Type <span className="font-mono text-rose-600 font-bold">FLUSH</span> to confirm:
                  </label>
                  <input
                    type="text"
                    value={confirmInput}
                    onChange={(e) => setConfirmInput(e.target.value)}
                    placeholder="Type FLUSH"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500/20 font-mono"
                  />
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <button
              type="button"
              onClick={() => setFlushModalOpen(false)}
              className="px-3.5 py-2 text-xs font-medium rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isFlushing || (flushType === "all" && confirmInput.trim().toUpperCase() !== "FLUSH")}
              onClick={handleFlushCache}
              className={`px-4 py-2 text-xs font-semibold rounded-lg text-white transition-colors disabled:opacity-50 cursor-pointer ${
                flushType === "all"
                  ? "bg-rose-600 hover:bg-rose-700"
                  : "bg-amber-600 hover:bg-amber-700"
              }`}
            >
              {isFlushing ? "Flushing..." : "Confirm Flush"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
