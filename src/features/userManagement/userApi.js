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

    getUserAnalytics: builder.query({
      query: () => ({
        url: `/user-management/analytics`,
        method: "GET",
      }),
      providesTags: ["user"]
    }),

    updateUserProfileByAdmin: builder.mutation({
      query: ({ id, data }) => ({
        url: `/user-management/update-profile/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["user"]
    }),

    getAllParents: builder.query({
      query: (params) => {
        let pageNumber = 1;
        let searchValue = "";

        if (typeof params === "object" && params !== null) {
          pageNumber = params.pageNumber || params.page || 1;
          searchValue = params.searchValue || params.searchTerm || "";
        } else if (params) {
          pageNumber = params;
        }

        let url = `/user-management/parents?page=${pageNumber}`;
        if (searchValue) {
          url += `&searchTerm=${encodeURIComponent(searchValue)}`;
        }
        return {
          url,
          method: "GET",
        };
      },
      providesTags: ["user", "parent"]
    }),

    getIncompleteUsers: builder.query({
      query: (params) => {
        let pageNumber = 1;
        let searchValue = "";

        if (typeof params === "object" && params !== null) {
          pageNumber = params.pageNumber || params.page || 1;
          searchValue = params.searchValue || params.searchTerm || "";
        } else if (params) {
          pageNumber = params;
        }

        let url = `/user-management/incomplete?page=${pageNumber}`;
        if (searchValue) {
          url += `&searchTerm=${encodeURIComponent(searchValue)}`;
        }
        return {
          url,
          method: "GET",
        };
      },
      providesTags: ["user"]
    }),

    assignTeamToUser: builder.mutation({
      query: ({ id, data }) => ({
        url: `/user-management/assign-team/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["user", "player"]
    }),

  }),
});

// Export hooks
export const {
  useGetUserQuery,
  useGetAllParentsQuery,
  useGetIncompleteUsersQuery,
  useAssignTeamToUserMutation,
  useUpdateStatusMutation,
  useDeleteUserMutation,
  useUpdateUserStatusMutation,
  useGetUserAnalyticsQuery,
  useUpdateUserProfileByAdminMutation,
} = userApi;
