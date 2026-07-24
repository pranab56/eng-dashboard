import { baseApi } from "../../utils/apiBaseQuery";


export const playerApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllPlayer: builder.query({
      query: ({ pageNumber }) => ({
        url: `/player?page=${pageNumber}`,
        method: "GET",
      }),
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
      invalidatesTags: ["player"]
    }),


  }),
});

// Export hooks
export const {
  useGetAllPlayerQuery,
  useCreatePlayerEconomyMutation,
  useGetPlayerEconomyQuery,
  useUpdateEngCoinBudgetMutation,
} = playerApi;
