import { baseApi } from "../../utils/apiBaseQuery";


export const playerApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllPlayer: builder.query({
      query: (params = {}) => {
        const queryParams = new URLSearchParams();
        if (params.pageNumber || params.page) queryParams.append("page", params.pageNumber || params.page);
        if (params.limit) queryParams.append("limit", params.limit);
        if (params.searchValue || params.searchTerm) queryParams.append("searchTerm", params.searchValue || params.searchTerm);
        if (params.role && params.role !== "ALL") queryParams.append("role", params.role);
        if (params.status && params.status !== "ALL") queryParams.append("status", params.status);
        if (params.ageGroup && params.ageGroup !== "ALL") queryParams.append("ageGroup", params.ageGroup);
        if (params.position && params.position !== "ALL") queryParams.append("position", params.position);
        if (params.selectTeam && params.selectTeam !== "ALL") queryParams.append("selectTeam", params.selectTeam);
        if (params.sort || params.sortBy) queryParams.append("sort", params.sort || params.sortBy);

        const qStr = queryParams.toString();
        return {
          url: qStr ? `/player?${qStr}` : `/player`,
          method: "GET",
        };
      },
      providesTags: ["player"]
    }),

    createPlayerEconomy: builder.mutation({
      query: (data) => ({
        url: `/coin-budget/player-economy`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["player"]
    }),

    getPlayerEconomy: builder.query({
      query: () => ({
        url: `/coin-budget/player-economy`,
        method: "GET",
      }),
      providesTags: ["player"]
    }),

    updateEngCoinBudget: builder.mutation({
      query: ({ id, data }) => ({
        url: `/user/${id}/economy`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["player", "user"]
    }),

    updatePlayer: builder.mutation({
      query: ({ id, data }) => ({
        url: `/player/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["player"]
    }),

  
    getPlayerStats: builder.query({
      query: (playerId) => ({
        url: `/playerStats/${playerId}`,
        method: "GET",
      }),
      providesTags: ["player", "statsAudit"],
    }),

    getPlayerCoinHistory: builder.query({
      query: ({ playerId, page = 1, limit = 20 }) => ({
        url: `/coins/history/${playerId}?page=${page}&limit=${limit}`,
        method: "GET",
      }),
      providesTags: ["player", "coin"],
    }),

    adjustPlayerCoins: builder.mutation({
      query: ({ playerId, data }) => ({
        url: `/coins/adjust/${playerId}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["player", "coin", "user"],
    }),

    editPlayerStats: builder.mutation({
      query: ({ playerId, data }) => ({
        url: `/stats-audit/edit/${playerId}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["player", "statsAudit"],
    }),

    getPlayerStatsAuditLogs: builder.query({
      query: (playerId) => ({
        url: `/stats-audit/audit-logs/${playerId}`,
        method: "GET",
      }),
      providesTags: ["statsAudit"],
    }),

    deletePlayer: builder.mutation({
      query: ({ id }) => ({
        url: `/player/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["player", "user"]
    }),
  }),
});

// Export hooks
export const {
  useGetAllPlayerQuery,
  useCreatePlayerEconomyMutation,
  useGetPlayerEconomyQuery,
  useUpdateEngCoinBudgetMutation,
  useUpdatePlayerMutation,
  useDeletePlayerMutation,
  useGetPlayerStatsQuery,
  useGetPlayerCoinHistoryQuery,
  useAdjustPlayerCoinsMutation,
  useEditPlayerStatsMutation,
  useGetPlayerStatsAuditLogsQuery,

} = playerApi;
