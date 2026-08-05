import { baseApi } from "../../utils/apiBaseQuery";

export const managerTeamApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({

    assignTeamManager: builder.mutation({
      query: (data) => ({
        url: "/manager-team",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["manager-team", "team"]
    }),

    bulkAssignTeams: builder.mutation({
      query: (data) => ({
        url: "/manager-team/assign",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["manager-team", "team"]
    }),

    removeTeamManager: builder.mutation({
      query: (teamId) => ({
        url: `/manager-team/team/${teamId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["manager-team", "team"]
    }),

    getAllManagerTeam: builder.query({
      query: () => ({
        url: "/user-management/managers",
        method: "GET",
      }),
      providesTags: ["manager-team"]
    }),

    getManagerTeamsForAdmin: builder.query({
      query: (managerId) => ({
        url: `/manager-team/manager/${managerId}`,
        method: "GET",
      }),
      providesTags: ["manager-team"]
    }),

  }),
});

// Export hooks
export const {
  useAssignTeamManagerMutation,
  useBulkAssignTeamsMutation,
  useRemoveTeamManagerMutation,
  useGetAllManagerTeamQuery,
  useGetManagerTeamsForAdminQuery,
} = managerTeamApi;
