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
        const page = params?.page || 1;
        const limit = params?.limit || 10;
        return {
          url: `/league?page=${page}&limit=${limit}`,
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
