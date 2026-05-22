import { baseApi } from "../../utils/apiBaseQuery";


export const userApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({

    getUser: builder.query({
      query: (pageNumber) => ({
        url: `/user-management?page=${pageNumber}`,
        method: "GET",
      }),
      providesTags: ["user"]
    }),

    updateStatus: builder.mutation({
      query: ({ id }) => ({
        url: `/user-management/toggle-verified/${id}`,
        method: "PATCH",
      }),
      invalidatesTags: ["user"]
    }),

    deleteUser: builder.mutation({
      query: ({ id }) => ({
        url: `/user-management/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["user"]
    }),

  }),
});

// Export hooks
export const {
  useGetUserQuery,
  useUpdateStatusMutation,
  useDeleteUserMutation,
} = userApi;
