import { baseApi } from "../../utils/apiBaseQuery";


export const leagueApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({

    createLeague: builder.mutation({
      query: (data) => ({
        url: "/league",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["league"]
    }),

    updateLeague: builder.mutation({
      query: ({ id, data }) => ({
        url: `/league/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["league"]
    }),

    getAllLeague: builder.query({
      query: (params) => {
        let page = 1;
        let limit = 10;
        let searchValue = "";
        if (typeof params === "object" && params !== null) {
          page = params.page || params.pageNumber || 1;
          limit = params.limit || 10;
          searchValue = params.searchValue || params.searchTerm || "";
        } else if (params) {
          page = params;
        }

        let url = `/league?page=${page}&limit=${limit}`;
        if (searchValue) {
          url += `&searchTerm=${encodeURIComponent(searchValue)}`;
        }
        return {
          url,
          method: "GET",
        };
      },
      providesTags: ["league"]
    }),

    getSingleLeague: builder.query({
      query: (id) => ({
        url: `/league/${id}`,
        method: "GET",
      }),
      providesTags: ["league"]
    }),


    deleteLeague: builder.mutation({
      query: (id) => ({
        url: `/league/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["league"]
    }),


  }),
});

// Export hooks
export const {
  useCreateLeagueMutation,
  useUpdateLeagueMutation,
  useGetAllLeagueQuery,
  useGetSingleLeagueQuery,
  useDeleteLeagueMutation,
} = leagueApi;
