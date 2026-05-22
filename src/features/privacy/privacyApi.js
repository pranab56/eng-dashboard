import { baseApi } from "../../utils/apiBaseQuery";


export const privacyApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({

    createPrivacy: builder.mutation({
      query: (data) => ({
        url: "/privacy-policy",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["privacy"]
    }),

    getPrivacy: builder.query({
      query: () => ({
        url: "/privacy-policy",
        method: "GET",
      }),
      providesTags: ["privacy"]
    }),

  }),
});

// Export hooks
export const {
  useCreatePrivacyMutation,
  useGetPrivacyQuery,
} = privacyApi;
