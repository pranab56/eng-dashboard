import { baseApi } from "../../utils/apiBaseQuery";

export const quizApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createQuiz: builder.mutation({
      query: (data) => ({
        url: "/quiz",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["quiz"],
    }),

    updateQuiz: builder.mutation({
      query: ({ id, data }) => ({
        url: `/quiz/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["quiz"],
    }),

    getAllQuiz: builder.query({
      query: ({
        page = 1,
        limit = 10,
        searchTerm = "",
        status = "",
        category = "",
      } = {}) => {
        let url = "/quiz";
        const params = [];
        if (page) params.push(`page=${page}`);
        if (limit) params.push(`limit=${limit}`);
        if (searchTerm) params.push(`searchTerm=${encodeURIComponent(searchTerm)}`);
        if (status && status !== "all") params.push(`status=${encodeURIComponent(status)}`);
        if (category && category !== "all") params.push(`category=${encodeURIComponent(category)}`);

        if (params.length > 0) {
          url += `?${params.join("&")}`;
        }
        return {
          url,
          method: "GET",
        };
      },
      providesTags: ["quiz"],
    }),

    getSingleQuiz: builder.query({
      query: (id) => ({
        url: `/quiz/${id}`,
        method: "GET",
      }),
      providesTags: ["quiz"],
    }),

    deleteQuiz: builder.mutation({
      query: (id) => ({
        url: `/quiz/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["quiz"],
    }),

    toggleQuizStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/quiz/${id}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["quiz"],
    }),

    getQuizLeaderboard: builder.query({
      query: ({ id, limit = 20 }) => ({
        url: `/quiz/${id}/leaderboard?limit=${limit}`,
        method: "GET",
      }),
      providesTags: ["quiz"],
    }),
  }),
});

export const {
  useCreateQuizMutation,
  useUpdateQuizMutation,
  useGetAllQuizQuery,
  useGetSingleQuizQuery,
  useDeleteQuizMutation,
  useToggleQuizStatusMutation,
  useGetQuizLeaderboardQuery,
} = quizApi;
