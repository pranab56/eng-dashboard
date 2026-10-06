import { baseApi } from "../../utils/apiBaseQuery";

export interface LoadAverage {
  '1min': number;
  '5min': number;
  '15min': number;
}

export interface MemoryBytes {
  bytes: number;
  GB: number;
  MB: number;
}

export interface ServerMemory {
  totalMemory: MemoryBytes;
  freeMemory: MemoryBytes;
  usedMemory: MemoryBytes;
  usedMemoryPercentage: number;
}

export interface ServerUptime {
  days: number;
  hours: number;
  minutes: number;
}

export interface ServerHealthData {
  status?: 'healthy' | 'moderate' | 'critical';
  database?: {
    status: 'connected' | 'disconnected';
    readyState: number;
  };
  cpuCores: number;
  loadAverage: LoadAverage;
  memory: ServerMemory;
  uptime: ServerUptime;
  timestamp: string;
}

export interface ServerHealthResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: ServerHealthData;
}

export interface RedisInfo {
  connected: boolean;
  pingMs: number;
  usedMemoryHuman: string;
  usedMemoryBytes: number;
  totalKeys: number;
  appCacheKeys: number;
  bullKeys: number;
  uptimeSeconds: number;
  version: string;
}

export interface BullQueueStat {
  name: string;
  waiting: number;
  active: number;
  completed: number;
  failed: number;
  delayed: number;
  paused: boolean;
  total: number;
}

export interface QueueAndCacheData {
  redis: RedisInfo;
  queues: BullQueueStat[];
  timestamp: string;
}

export interface QueueAndCacheResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: QueueAndCacheData;
}

export interface QueueActionResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: {
    queueName: string;
    action: string;
    results: Record<string, any>;
    message: string;
  };
}

export interface FlushCacheResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: {
    type: 'cache-only' | 'all';
    deletedCount?: number;
    totalScanned?: number;
    message: string;
  };
}

export const serverHealthApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getServerHealth: builder.query<ServerHealthResponse, void>({
      query: () => ({
        url: "/server-health",
        method: "GET",
      }),
      providesTags: ["serverHealth"],
    }),
    getQueueAndCacheStatus: builder.query<QueueAndCacheResponse, void>({
      query: () => ({
        url: "/server-health/queue-and-cache",
        method: "GET",
      }),
      providesTags: ["QueueAndCache"],
    }),
    executeQueueAction: builder.mutation<
      QueueActionResponse,
      { queueName: string; action: 'retry-failed' | 'clean-completed' | 'clean-failed' | 'pause' | 'resume' }
    >({
      query: (body) => ({
        url: "/server-health/queue-action",
        method: "POST",
        body,
      }),
      invalidatesTags: ["QueueAndCache"],
    }),
    flushCache: builder.mutation<FlushCacheResponse, { type: 'cache-only' | 'all' }>({
      query: (body) => ({
        url: "/server-health/flush-cache",
        method: "POST",
        body,
      }),
      invalidatesTags: ["QueueAndCache"],
    }),
  }),
});

export const {
  useGetServerHealthQuery,
  useGetQueueAndCacheStatusQuery,
  useExecuteQueueActionMutation,
  useFlushCacheMutation,
} = serverHealthApi;
