import { baseApi } from "../../utils/apiBaseQuery";


export const tableApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllTable: builder.query({
      query: () => ({
        url: `/point-table`,
        method: "GET",
      }),
      providesTags: ["table"]
    }),
  }),
});

// Export hooks
export const {
  useGetAllTableQuery
} = tableApi;
