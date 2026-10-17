import { baseApi } from "../../utils/apiBaseQuery";

export const sponsorshipApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createSponsorship: builder.mutation({
      query: (data) => ({
        url: "/sponsorship",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["sponsorship"],
    }),

    updateSponsorship: builder.mutation({
      query: ({ id, data }) => ({
        url: `/sponsorship/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["sponsorship"],
    }),

    getAllSponsorship: builder.query({
      query: ({ pageNumber = 1, limit = 10, searchValue = "", type = "", tier = "", status = "" } = {}) => {
        let url = "/sponsorship";
        const params = [];
        if (pageNumber) params.push(`page=${pageNumber}`);
        if (limit) params.push(`limit=${limit}`);
        if (searchValue) params.push(`searchTerm=${encodeURIComponent(searchValue)}`);
        if (type && type !== "all") params.push(`type=${encodeURIComponent(type)}`);
        if (tier && tier !== "all") params.push(`tier=${encodeURIComponent(tier)}`);
        if (status && status !== "all") params.push(`status=${encodeURIComponent(status)}`);

        if (params.length > 0) {
          url += `?${params.join("&")}`;
        }
        return {
          url,
          method: "GET",
        };
      },
      providesTags: ["sponsorship"],
    }),

    getSponsorshipAnalytics: builder.query({
      query: () => ({
        url: "/sponsorship/analytics",
        method: "GET",
      }),
      providesTags: ["sponsorship"],
    }),

    getSingleSponsorship: builder.query({
      query: (id) => ({
        url: `/sponsorship/${id}`,
        method: "GET",
      }),
      providesTags: ["sponsorship"],
    }),

    deleteSponsorship: builder.mutation({
      query: (id) => ({
        url: `/sponsorship/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["sponsorship"],
    }),

    toggleSponsorshipStatus: builder.mutation({
      query: (id) => ({
        url: `/sponsorship/${id}/toggle-status`,
        method: "PATCH",
      }),
      invalidatesTags: ["sponsorship"],
    }),

    reorderSponsorship: builder.mutation({
      query: (items) => ({
        url: "/sponsorship/reorder",
        method: "PATCH",
        body: { items },
      }),
      invalidatesTags: ["sponsorship"],
    }),
  }),
});

export const {
  useCreateSponsorshipMutation,
  useUpdateSponsorshipMutation,
  useGetAllSponsorshipQuery,
  useGetSponsorshipAnalyticsQuery,
  useGetSingleSponsorshipQuery,
  useDeleteSponsorshipMutation,
  useToggleSponsorshipStatusMutation,
  useReorderSponsorshipMutation,
} = sponsorshipApi;
