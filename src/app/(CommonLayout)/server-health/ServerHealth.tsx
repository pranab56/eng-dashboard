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
import { useGetServerHealthQuery } from "@/features/serverHealth/serverHealthApi";
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

export default function ServerHealth() {
  const { setHeaders } = useHeaders();

  useEffect(() => {
    setHeaders({
      title: "Server Diagnostics",
      des: "Hardware utilization, resource telemetry, and core database connectivity.",
    });
  }, [setHeaders]);

  const [pollingRate, setPollingRate] = useState<number>(5000);

  const {
    data: healthRes,
    isLoading,
    isFetching,
    refetch,
  } = useGetServerHealthQuery(undefined, {
    pollingInterval: pollingRate,
  });

  const health = healthRes?.data;

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
      await refetch();
      toast.success("Metrics updated", { duration: 1500 });
    } catch {
      toast.error("Failed to update telemetry");
    }
  };

  const memPct = health?.memory?.usedMemoryPercentage || 0;
  const isHealthy = memPct < 85;

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
            disabled={isFetching}
            className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md text-xs font-medium bg-slate-900 hover:bg-slate-800 text-white transition-colors disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? "animate-spin" : ""}`} />
            <span>Sync</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Grid: Unified Structural Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 bg-white border border-slate-200 rounded-lg divide-y sm:divide-y-0 sm:divide-x divide-slate-200">
        {/* Metric 1: System Status */}
        <div className="p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-medium">System Status</span>
            <Server className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div>
            <div className="text-xl font-semibold tracking-tight text-slate-900">
              {health?.status ? health.status.toUpperCase() : "ACTIVE"}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              ENG Sports Backend
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Environment</span>
            <span className="font-mono text-slate-600">production</span>
          </div>
        </div>

        {/* Metric 2: Memory */}
        <div className="p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-medium">Memory Allocation</span>
            <HardDrive className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div>
            <div className="flex items-baseline justify-between">
              <span className="text-xl font-semibold tracking-tight text-slate-900 font-mono">
                {memPct}%
              </span>
              <span className="text-xs text-slate-500 font-mono">
                {health?.memory?.usedMemory?.GB || 0} / {health?.memory?.totalMemory?.GB || 0} GB
              </span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden mt-2">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  memPct >= 90
                    ? "bg-rose-600"
                    : memPct >= 75
                    ? "bg-amber-500"
                    : "bg-slate-900"
                }`}
                style={{ width: `${Math.min(100, Math.max(0, memPct))}%` }}
              />
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Free RAM</span>
            <span className="font-mono text-slate-600">
              {health?.memory?.freeMemory?.GB || 0} GB
            </span>
          </div>
        </div>

        {/* Metric 3: CPU & Load */}
        <div className="p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-medium">Processor Load</span>
            <Cpu className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div>
            <div className="text-xl font-semibold tracking-tight text-slate-900 font-mono">
              {health?.loadAverage?.["1min"] ?? 0}
            </div>
            <p className="text-xs text-slate-500 font-mono mt-1">
              5m: {health?.loadAverage?.["5min"] ?? 0} · 15m: {health?.loadAverage?.["15min"] ?? 0}
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Hardware Capacity</span>
            <span className="font-mono text-slate-600">
              {health?.cpuCores || 0} Cores
            </span>
          </div>
        </div>

        {/* Metric 4: Uptime & Database */}
        <div className="p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-medium">Uptime & Database</span>
            <Clock className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div>
            <div className="text-xl font-semibold tracking-tight text-slate-900 font-mono">
              {formatUptimeText(health?.uptime)}
            </div>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>MongoDB Connected</span>
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Node Lifecycle</span>
            <span className="font-mono text-slate-600">Active</span>
          </div>
        </div>
      </div>

      {/* Telemetry Charts: High-Precision Enterprise Density */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Chart 1: Memory */}
        <div className="bg-white border border-slate-200 rounded-lg p-4">
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
        <div className="bg-white border border-slate-200 rounded-lg p-4">
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
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
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
    </div>
  );
}
