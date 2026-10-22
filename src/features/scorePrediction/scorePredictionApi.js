import { baseApi } from "../../utils/apiBaseQuery";

export const scorePredictionApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createPredictionRound: builder.mutation({
      query: (data) => ({
        url: "/score-prediction",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["scorePrediction"],
    }),

    updatePredictionRound: builder.mutation({
      query: ({ id, data }) => ({
        url: `/score-prediction/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["scorePrediction"],
    }),

    getAllPredictionRounds: builder.query({
      query: ({
        page = 1,
        limit = 10,
        searchTerm = "",
        status = "",
      } = {}) => {
        let url = "/score-prediction";
        const params = [];
        if (page) params.push(`page=${page}`);
        if (limit) params.push(`limit=${limit}`);
        if (searchTerm) params.push(`searchTerm=${encodeURIComponent(searchTerm)}`);
        if (status && status !== "all") params.push(`status=${encodeURIComponent(status)}`);

        if (params.length > 0) {
          url += `?${params.join("&")}`;
        }
        return {
          url,
          method: "GET",
        };
      },
      providesTags: ["scorePrediction"],
    }),

    getSinglePredictionRound: builder.query({
      query: (id) => ({
        url: `/score-prediction/${id}`,
        method: "GET",
      }),
      providesTags: ["scorePrediction"],
    }),

    deletePredictionRound: builder.mutation({
      query: (id) => ({
        url: `/score-prediction/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["scorePrediction"],
    }),

    settlePredictionRound: builder.mutation({
      query: (id) => ({
        url: `/score-prediction/${id}/settle`,
        method: "POST",
      }),
      invalidatesTags: ["scorePrediction"],
    }),

    getPredictionLeaderboard: builder.query({
      query: ({ id, limit = 25 }) => ({
        url: `/score-prediction/${id}/leaderboard?limit=${limit}`,
        method: "GET",
      }),
      providesTags: ["scorePrediction"],
    }),
  }),
});

export const {
  useCreatePredictionRoundMutation,
  useUpdatePredictionRoundMutation,
  useGetAllPredictionRoundsQuery,
  useGetSinglePredictionRoundQuery,
  useDeletePredictionRoundMutation,
  useSettlePredictionRoundMutation,
  useGetPredictionLeaderboardQuery,
} = scorePredictionApi;
