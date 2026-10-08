import { baseApi } from "../../utils/apiBaseQuery";

export const leagueApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createLeague: builder.mutation({
      query: (data) => ({
        url: "/league",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["league"],
    }),

    updateLeague: builder.mutation({
      query: ({ id, data }) => ({
        url: `/league/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["league"],
    }),

    getAllLeague: builder.query({
      query: (params) => {
        let page = 1;
        let limit = 10;
        let searchValue = "";
        let status = "";
        let ageGroup = "";
        if (typeof params === "object" && params !== null) {
          page = params.page || params.pageNumber || 1;
          limit = params.limit || 10;
          searchValue = params.searchValue || params.searchTerm || "";
          status = params.status || "";
          ageGroup = params.ageGroup || "";
        } else if (params) {
          page = params;
        }

        let url = `/league?page=${page}&limit=${limit}`;
        if (searchValue) {
          url += `&searchTerm=${encodeURIComponent(searchValue)}`;
        }
        if (status && status !== "all") {
          url += `&status=${encodeURIComponent(status)}`;
        }
        if (ageGroup && ageGroup !== "all" && ageGroup !== "ALL") {
          url += `&ageGroup=${encodeURIComponent(ageGroup)}`;
        }
        return {
          url,
          method: "GET",
        };
      },
      providesTags: ["league"],
    }),

    getLeagueAnalytics: builder.query({
      query: (params) => {
        let url = "/league/analytics";
        let ageGroup = "";
        if (typeof params === "object" && params !== null) {
          ageGroup = params.ageGroup || "";
        } else if (typeof params === "string") {
          ageGroup = params;
        }
        if (ageGroup && ageGroup !== "all" && ageGroup !== "ALL") {
          url += `?ageGroup=${encodeURIComponent(ageGroup)}`;
        }
        return {
          url,
          method: "GET",
        };
      },
      providesTags: ["league"],
    }),
    getLeagueAgeGroups: builder.query({
      query: () => ({
        url: "/league/age-groups",
        method: "GET",
      }),
      providesTags: ["league"],
    }),

    getSingleLeague: builder.query({
      query: (id) => ({
        url: `/league/${id}`,
        method: "GET",
      }),
      providesTags: ["league"],
    }),

    deleteLeague: builder.mutation({
      query: (id) => ({
        url: `/league/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["league"],
    }),
  }),
});

// Export hooks
export const {
  useCreateLeagueMutation,
  useUpdateLeagueMutation,
  useGetAllLeagueQuery,
  useGetLeagueAnalyticsQuery,
  useGetLeagueAgeGroupsQuery,
  useGetSingleLeagueQuery,
  useDeleteLeagueMutation,
} = leagueApi;
