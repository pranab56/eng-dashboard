import { baseApi } from "../../utils/apiBaseQuery";

export const refereeVotingApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createRefereeVoting: builder.mutation({
      query: (data) => ({
        url: "/referee-voting",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["refereeVoting"],
    }),

    updateRefereeVoting: builder.mutation({
      query: ({ id, data }) => ({
        url: `/referee-voting/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["refereeVoting"],
    }),

    getAllRefereeVoting: builder.query({
      query: ({
        pageNumber = 1,
        limit = 10,
        searchValue = "",
        status = "",
        votingType = "",
        league = "",
      } = {}) => {
        let url = "/referee-voting";
        const params = [];
        if (pageNumber) params.push(`page=${pageNumber}`);
        if (limit) params.push(`limit=${limit}`);
        if (searchValue) params.push(`searchValue=${encodeURIComponent(searchValue)}`);
        if (status && status !== "all") params.push(`status=${encodeURIComponent(status)}`);
        if (votingType && votingType !== "all") params.push(`votingType=${encodeURIComponent(votingType)}`);
        if (league && league !== "all") params.push(`league=${encodeURIComponent(league)}`);

        if (params.length > 0) {
          url += `?${params.join("&")}`;
        }
        return {
          url,
          method: "GET",
        };
      },
      providesTags: ["refereeVoting"],
    }),

    getSingleRefereeVoting: builder.query({
      query: (id) => ({
        url: `/referee-voting/${id}`,
        method: "GET",
      }),
      providesTags: ["refereeVoting"],
    }),

    deleteRefereeVoting: builder.mutation({
      query: (id) => ({
        url: `/referee-voting/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["refereeVoting"],
    }),

    toggleRefereeVotingStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/referee-voting/${id}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["refereeVoting"],
    }),

    getVotingLeaderboard: builder.query({
      query: (id) => ({
        url: `/referee-voting/${id}/results`,
        method: "GET",
      }),
      providesTags: ["refereeVoting"],
    }),

    getPastWinners: builder.query({
      query: ({ type = "", leagueId = "" } = {}) => {
        let url = "/referee-voting/winners";
        const params = [];
        if (type && type !== "all") params.push(`type=${encodeURIComponent(type)}`);
        if (leagueId && leagueId !== "all") params.push(`leagueId=${encodeURIComponent(leagueId)}`);
        if (params.length > 0) {
          url += `?${params.join("&")}`;
        }
        return {
          url,
          method: "GET",
        };
      },
      providesTags: ["refereeVoting"],
    }),

    getEligibleReferees: builder.query({
      query: ({ searchValue = "" } = {}) => {
        let url = "/referee-voting/eligible-referees";
        if (searchValue) {
          url += `?searchValue=${encodeURIComponent(searchValue)}`;
        }
        return {
          url,
          method: "GET",
        };
      },
      providesTags: ["refereeVoting"],
    }),
  }),
});

export const {
  useCreateRefereeVotingMutation,
  useUpdateRefereeVotingMutation,
  useGetAllRefereeVotingQuery,
  useGetSingleRefereeVotingQuery,
  useDeleteRefereeVotingMutation,
  useToggleRefereeVotingStatusMutation,
  useGetVotingLeaderboardQuery,
  useGetPastWinnersQuery,
  useGetEligibleRefereesQuery,
} = refereeVotingApi;
