import { baseApi } from "../../utils/apiBaseQuery";

export const tableApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllTable: builder.query({
      query: (params) => ({
        url: `/point-table`,
        method: "GET",
        params,
      }),
      providesTags: ["table"],
    }),
    updateTableStanding: builder.mutation({
      query: (data) => ({
        url: `/point-table`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["table"],
    }),
    resetTableStanding: builder.mutation({
      query: (data) => ({
        url: `/point-table/reset`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["table"],
    }),
  }),
});

// Export hooks
export const {
  useGetAllTableQuery,
  useUpdateTableStandingMutation,
  useResetTableStandingMutation,
} = tableApi;
