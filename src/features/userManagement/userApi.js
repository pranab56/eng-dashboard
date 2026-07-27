import { baseApi } from "../../utils/apiBaseQuery";


export const userApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({

    getUser: builder.query({
      query: (params) => {
        let pageNumber = 1;
        let searchValue = "";
        let role = "";

        if (typeof params === "object" && params !== null) {
          pageNumber = params.pageNumber || 1;
          searchValue = params.searchValue || "";
          role = params.role || "";
        } else if (params) {
          pageNumber = params;
        }

        let url = `/user-management?page=${pageNumber}`;
        if (searchValue) {
          url += `&searchTerm=${encodeURIComponent(searchValue)}`;
        }
        if (role && role !== "ALL") {
          url += `&role=${encodeURIComponent(role)}`;
        }
        return {
          url,
          method: "GET",
        };
      },
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

    updateUserStatus: builder.mutation({
      query: ({ id, data }) => ({
        
        url: `/user/${id}/approve-status`,
        method: "PATCH",
        body: data,
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
  useUpdateUserStatusMutation,
} = userApi;
