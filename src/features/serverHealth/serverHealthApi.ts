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

export const serverHealthApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getServerHealth: builder.query<ServerHealthResponse, void>({
      query: () => ({
        url: "/server-health",
        method: "GET",
      }),
      providesTags: ["serverHealth"],
    }),
  }),
});

export const {
  useGetServerHealthQuery,
} = serverHealthApi;
