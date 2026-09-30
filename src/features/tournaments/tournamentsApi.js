import { baseApi } from "../../utils/apiBaseQuery";

export const tournamentsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllTournaments: builder.query({
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

        let url = `/tournament?page=${page}&limit=${limit}`;
        if (searchValue) {
          url += `&searchTerm=${encodeURIComponent(searchValue)}`;
        }
        if (status && status !== "ALL" && status !== "all") {
          url += `&status=${encodeURIComponent(status)}`;
        }
        return {
          url,
          method: "GET",
        };
      },
      providesTags: ["tournaments"],
    }),

    getTournamentAnalytics: builder.query({
      query: () => ({
        url: "/tournament/analytics",
        method: "GET",
      }),
      providesTags: ["tournaments"],
    }),

    singleGetTournaments: builder.query({
      query: (id) => ({
        url: `/tournament/${id}`,
        method: "GET",
      }),
      providesTags: ["tournaments"],
    }),

    createTourNaments: builder.mutation({
      query: (body) => ({
        url: `/tournament`,
        method: "POST",
        body: body,
      }),
      invalidatesTags: ["tournaments"],
    }),

    updateTourNaments: builder.mutation({
      query: ({ id, body }) => ({
        url: `/tournament/${id}`,
        method: "PATCH",
        body: body,
      }),
      invalidatesTags: ["tournaments"],
    }),

    deleteTourNaments: builder.mutation({
      query: (id) => ({
        url: `/tournament/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["tournaments"],
    }),

    getTournamentQrCode: builder.query({
      query: (id) => ({
        url: `/tournament/${id}/qr-code`,
        method: "GET",
      }),
      providesTags: ["tournaments"],
    }),
  }),
});

// Export hooks
export const {
  useGetAllTournamentsQuery,
  useGetTournamentAnalyticsQuery,
  useSingleGetTournamentsQuery,
  useCreateTourNamentsMutation,
  useUpdateTourNamentsMutation,
  useDeleteTourNamentsMutation,
  useGetTournamentQrCodeQuery,
} = tournamentsApi;
