import { baseApi } from "../../utils/apiBaseQuery";


export const packageApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createPackage: builder.mutation({
      query: (data) => ({
        url: "/package",
        method: "POST",
        body: data
      }),
      invalidatesTags: ["package"]
    }),

    updatePackage: builder.mutation({
      query: ({ id, data }) => ({
        url: `/package/${id}`,
        method: "PATCH",
        body: data
      }),
      invalidatesTags: ["package"]
    }),

    getAllPackage: builder.query({
      query: ({ userType, status }) => ({
        url: `/package/all?userType=${userType}&status=${status}`,
        method: "GET",
      }),
      providesTags: ["package"]
    }),

    togglePackageStatus: builder.mutation({
      query: ({ id }) => ({
        url: `/package/toggle/${id}`,
        method: "PATCH",
      }),
      invalidatesTags: ["package"]
    }),
  }),
});

// Export hooks
export const {
  useCreatePackageMutation,
  useUpdatePackageMutation,
  useGetAllPackageQuery,
  useTogglePackageStatusMutation
} = packageApi;
