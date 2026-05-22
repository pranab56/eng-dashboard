import { baseApi } from "../../utils/apiBaseQuery";


export const termsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({

    createTerms: builder.mutation({
      query: (data) => ({
        url: "/terms-and-conditions",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["terms"]
    }),

    getTerms: builder.query({
      query: () => ({
        url: "/terms-and-conditions",
        method: "GET",
      }),
      providesTags: ["terms"]
    }),

  }),
});

// Export hooks
export const {
  useCreateTermsMutation,
  useGetTermsQuery,
} = termsApi;
