import { baseApi } from "../../utils/apiBaseQuery";

export const transferApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getAllTransfer: builder.query({
      query: (params) => {
        if (typeof params === "object" && params !== null) {
          const searchParams = new URLSearchParams();
          if (params.page) searchParams.append("page", params.page);
          if (params.limit) searchParams.append("limit", params.limit);
          if (params.status) searchParams.append("status", params.status);
          if (params.searchTerm) searchParams.append("searchTerm", params.searchTerm);
          const queryString = searchParams.toString();
          return {
            url: `/transfers${queryString ? `?${queryString}` : ""}`,
            method: "GET",
          };
        }
        return {
          url: `/transfers?page=${params || 1}`,
          method: "GET",
        };
      },
      providesTags: ["transfer"],
    }),

    getTransferOverview: builder.query({
      query: () => ({
        url: "/transfers/overview",
        method: "GET",
      }),
      providesTags: ["transfer"],
    }),

    aproveTransfer: builder.mutation({
      query: ({ id }) => ({
        url: `/transfers/${id}/approve`,
        method: "PATCH",
      }),
      invalidatesTags: ["transfer"],
    }),

    rejectTransfer: builder.mutation({
      query: ({ id }) => ({
        url: `/transfers/${id}/reject`,
        method: "PATCH",
      }),
      invalidatesTags: ["transfer"],
    }),
  }),
});

// Export hooks
export const {
  useGetAllTransferQuery,
  useGetTransferOverviewQuery,
  useAproveTransferMutation,
  useRejectTransferMutation,
} = transferApi;
