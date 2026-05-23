import { baseApi } from "../../utils/apiBaseQuery";


export const transferApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({

    getAllTransfer: builder.query({
      query: (pageNumber) => ({
        url: `/transfers?page=${pageNumber}`,
        method: "GET",
      }),
      providesTags: ["transfer"]
    }),

    aproveTransfer: builder.mutation({
      query: ({ id }) => ({
        url: `/transfers/${id}/approve`,
        method: "PATCH",
      }),
      invalidatesTags: ["transfer"]
    }),

    rejectTransfer: builder.mutation({
      query: ({ id }) => ({
        url: `/transfers/${id}/reject`,
        method: "PATCH",
      }),
      invalidatesTags: ["transfer"]
    }),

  }),
});

// Export hooks
export const {
  useGetAllTransferQuery,
  useAproveTransferMutation,
  useRejectTransferMutation,
} = transferApi;
