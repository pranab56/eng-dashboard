import { baseApi } from "../../utils/apiBaseQuery";

export const teamApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createTeam: builder.mutation({
      query: (data) => ({
        url: "/team",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["team"]
    }),

    updateTeam: builder.mutation({
      query: ({ id, data }) => ({
        url: `/team/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["team"]
    }),

    getAllTeam: builder.query({
      query: (params) => {
        let url = "/team";
        if (typeof params === "object" && params !== null) {
          const queryParts = [];
          Object.keys(params).forEach((key) => {
            if (params[key] !== undefined && params[key] !== null && params[key] !== "" && params[key] !== "ALL") {
              queryParts.push(`${key}=${encodeURIComponent(params[key])}`);
            }
          });
          if (queryParts.length > 0) {
            url += `?${queryParts.join("&")}`;
          }
        } else if (params) {
          url += `?page=${params}`;
        }
        return {
          url,
          method: "GET",
        };
      },
      providesTags: ["team"]
    }),

    getTeamAnalytics: builder.query({
      query: () => ({
        url: "/team/analytics",
        method: "GET",
      }),
      providesTags: ["team"]
    }),

    getSingleTeam: builder.query({
      query: (id) => ({
        url: `/team/${id}`,
        method: "GET",
      }),
      providesTags: ["team"]
    }),

    deleteTeam: builder.mutation({
      query: (id) => ({
        url: `/team/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["team"]
    }),

    updateBudgetAndEconomay: builder.mutation({
      query: ({ data }) => ({
        url: `/coin-budget/club-economy`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["team"]
    }),

    getBudgetAndEconomay: builder.query({
      query: () => ({
        url: `/coin-budget/club-economy`,
        method: "GET",
      }),
      providesTags: ["team"]
    }),

    updateTeamCoinBudget: builder.mutation({
      query: ({ id, data }) => ({
        url: `/team/${id}/economy`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["team"]
    }),

    getTeamCoinHistory: builder.query({
      query: ({ teamId, page = 1, limit = 20, category, type, search } = {}) => {
        const queryParams = new URLSearchParams();
        if (page) queryParams.append("page", page);
        if (limit) queryParams.append("limit", limit);
        if (category && category !== "ALL") queryParams.append("category", category);
        if (type && type !== "ALL") queryParams.append("type", type);
        if (search) queryParams.append("searchTerm", search);
        return {
          url: `/team-coins/history/${teamId}?${queryParams.toString()}`,
          method: "GET",
        };
      },
      providesTags: ["teamCoin"],
    }),

    adjustTeamCoins: builder.mutation({
      query: ({ teamId, data }) => ({
        url: `/team-coins/adjust/${teamId}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["team", "teamCoin"],
    }),
  }),
});

// Export hooks
export const {
  useCreateTeamMutation,
  useUpdateTeamMutation,
  useGetAllTeamQuery,
  useGetTeamAnalyticsQuery,
  useGetSingleTeamQuery,
  useDeleteTeamMutation,
  useUpdateBudgetAndEconomayMutation,
  useGetBudgetAndEconomayQuery,
  useUpdateTeamCoinBudgetMutation,
  useGetTeamCoinHistoryQuery,
  useAdjustTeamCoinsMutation,
} = teamApi;
