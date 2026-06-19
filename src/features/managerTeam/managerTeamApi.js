import { baseApi } from "../../utils/apiBaseQuery";


export const managerTeamApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({

    assignTeamManager: builder.mutation({
      query: (data) => ({
        url: "/manager-team",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["manager-team"]
    }),

    getAllManagerTeam: builder.query({
      query: () => ({
        url: "/user-management/managers",
        method: "GET",
      }),
      providesTags: ["manager-team"]
    }),

  }),
});

// Export hooks
export const {
  useAssignTeamManagerMutation,
  useGetAllManagerTeamQuery,
} = managerTeamApi;
