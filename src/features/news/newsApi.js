import { baseApi } from "../../utils/apiBaseQuery";


export const newsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({

    createNews: builder.mutation({
      query: (data) => ({
        url: "/news",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["news"]
    }),

    updateNews: builder.mutation({
      query: ({ id, data }) => ({
        url: `/news/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["news"]
    }),

    getAllNews: builder.query({
      query: (pageNumber) => ({
        url: `/news?page=${pageNumber}`,
        method: "GET",
      }),
      providesTags: ["news"]
    }),

    getSingleNews: builder.query({
      query: (id) => ({
        url: `/news/${id}`,
        method: "GET",
      }),
      providesTags: ["news"]
    }),


    deleteNews: builder.mutation({
      query: (id) => ({
        url: `/news/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["news"]
    }),


  }),
});

// Export hooks
export const {
  useCreateNewsMutation,
  useUpdateNewsMutation,
  useGetAllNewsQuery,
  useGetSingleNewsQuery,
  useDeleteNewsMutation,
} = newsApi;
