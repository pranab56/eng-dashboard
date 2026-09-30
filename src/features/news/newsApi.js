import { baseApi } from "../../utils/apiBaseQuery";

export const newsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createNews: builder.mutation({
      query: (data) => ({
        url: "/news",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["news"],
    }),

    updateNews: builder.mutation({
      query: ({ id, data }) => ({
        url: `/news/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["news"],
    }),

    getAllNews: builder.query({
      query: (params) => {
        let page = 1;
        let limit = 10;
        let searchValue = "";
        let status = "";
        if (typeof params === "object" && params !== null) {
          page = params.page || params.pageNumber || 1;
          limit = params.limit || 10;
          searchValue = params.searchValue || params.searchTerm || "";
          status = params.status || "";
        } else if (params) {
          page = params;
        }

        let url = `/news?page=${page}&limit=${limit}`;
        if (searchValue) {
          url += `&searchTerm=${encodeURIComponent(searchValue)}`;
        }
        if (status && status !== "all") {
          url += `&status=${encodeURIComponent(status)}`;
        }
        return {
          url,
          method: "GET",
        };
      },
      providesTags: ["news"],
    }),

    getNewsAnalytics: builder.query({
      query: () => ({
        url: "/news/analytics",
        method: "GET",
      }),
      providesTags: ["news"],
    }),

    getSingleNews: builder.query({
      query: (id) => ({
        url: `/news/${id}`,
        method: "GET",
      }),
      providesTags: ["news"],
    }),

    deleteNews: builder.mutation({
      query: (id) => ({
        url: `/news/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["news"],
    }),

    rearrangeNews: builder.mutation({
      query: (data) => ({
        url: "/news/reorder",
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["news"],
    }),
  }),
});

// Export hooks
export const {
  useCreateNewsMutation,
  useUpdateNewsMutation,
  useGetAllNewsQuery,
  useGetNewsAnalyticsQuery,
  useGetSingleNewsQuery,
  useDeleteNewsMutation,
  useRearrangeNewsMutation,
} = newsApi;
