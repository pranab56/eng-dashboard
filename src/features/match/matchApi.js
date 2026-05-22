import { baseApi } from "../../utils/apiBaseQuery";


export const matchApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({

    createMatch: builder.mutation({
      query: (data) => ({
        url: "/match",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["match"]
    }),

    updateMatch: builder.mutation({
      query: ({ id, data }) => ({
        url: `/match/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["match"]
    }),

    getAllMatch: builder.query({
      query: (pageNumber) => ({
        url: `/match?page=${pageNumber}`,
        method: "GET",
      }),
      providesTags: ["match"]
    }),

    getSingleMatch: builder.query({
      query: (id) => ({
        url: `/match/${id}`,
        method: "GET",
      }),
      providesTags: ["match"]
    }),


    deleteMatch: builder.mutation({
      query: (id) => ({
        url: `/match/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["match"]
    }),


  }),
});

// Export hooks
export const {
  useCreateMatchMutation,
  useUpdateMatchMutation,
  useGetAllMatchQuery,
  useGetSingleMatchQuery,
  useDeleteMatchMutation,
} = matchApi;
