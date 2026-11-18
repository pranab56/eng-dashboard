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
          if (params.isLiveMarket !== undefined && params.isLiveMarket !== "") {
            searchParams.append("isLiveMarket", params.isLiveMarket);
          }
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

    getLiveMarketPlayers: builder.query({
      query: (params) => {
        const searchParams = new URLSearchParams();
        if (params?.page) searchParams.append("page", params.page);
        if (params?.limit) searchParams.append("limit", params.limit);
        if (params?.searchTerm) searchParams.append("searchTerm", params.searchTerm);
        if (params?.position) searchParams.append("position", params.position);
        const queryString = searchParams.toString();
        return {
          url: `/live-transfer/players${queryString ? `?${queryString}` : ""}`,
          method: "GET",
        };
      },
      providesTags: ["transfer", "liveTransferMarket"],
    }),

    aproveTransfer: builder.mutation({
      query: ({ id }) => ({
        url: `/transfers/${id}/approve`,
        method: "PATCH",
      }),
      invalidatesTags: ["transfer", "liveTransferMarket"],
    }),

    rejectTransfer: builder.mutation({
      query: ({ id }) => ({
        url: `/transfers/${id}/reject`,
        method: "PATCH",
      }),
      invalidatesTags: ["transfer", "liveTransferMarket"],
    }),
  }),
});

// Export hooks
export const {
  useGetAllTransferQuery,
  useGetTransferOverviewQuery,
  useGetLiveMarketPlayersQuery,
  useAproveTransferMutation,
  useRejectTransferMutation,
} = transferApi;
