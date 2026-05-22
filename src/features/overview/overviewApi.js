import { baseApi } from "../../utils/apiBaseQuery";


export const overviewApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getOverview: builder.query({
      query: () => ({
        url: "/overview",
        method: "GET",
      }),
      providesTags: ["overview"]
    }),

  }),
});

// Export hooks
export const {
  useGetOverviewQuery,
} = overviewApi;
