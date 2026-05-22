import { baseApi } from "../../utils/apiBaseQuery";


export const rewordApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createReword: builder.mutation({
      query: (data) => ({
        url: "/reward-products",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["reword"]
    }),

    updateReword: builder.mutation({
      query: ({ id, data }) => ({
        url: `/reward-products/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["reword"]
    }),

    getAllReword: builder.query({
      query: (pageNumber) => ({
        url: `/reward-products?page=${pageNumber}`,
        method: "GET",
      }),
      providesTags: ["reword"]
    }),

    getSingleReword: builder.query({
      query: (id) => ({
        url: `/reward-products/${id}`,
        method: "GET",
      }),
      providesTags: ["reword"]
    }),


    deleteReword: builder.mutation({
      query: (id) => ({
        url: `/reward-products/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["reword"]
    }),


  }),
});

// Export hooks
export const {
  useCreateRewordMutation,
  useUpdateRewordMutation,
  useGetAllRewordQuery,
  useGetSingleRewordQuery,
  useDeleteRewordMutation,
} = rewordApi;
