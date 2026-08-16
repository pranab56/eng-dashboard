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


  }),
});

// Export hooks
export const {
  useCreateTeamMutation,
  useUpdateTeamMutation,
  useGetAllTeamQuery,
  useGetSingleTeamQuery,
  useDeleteTeamMutation,
  useUpdateBudgetAndEconomayMutation,
  useGetBudgetAndEconomayQuery,
  useUpdateTeamCoinBudgetMutation,
} = teamApi;
