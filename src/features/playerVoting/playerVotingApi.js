import { baseApi } from "../../utils/apiBaseQuery";

export const playerVotingApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createPlayerVoting: builder.mutation({
      query: (data) => ({
        url: "/player-voting",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["playerVoting"],
    }),

    updatePlayerVoting: builder.mutation({
      query: ({ id, data }) => ({
        url: `/player-voting/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["playerVoting"],
    }),

    getAllPlayerVoting: builder.query({
      query: ({
        pageNumber = 1,
        limit = 10,
        searchValue = "",
        status = "",
        votingType = "",
        league = "",
        ageGroup = "",
      } = {}) => {
        let url = "/player-voting";
        const params = [];
        if (pageNumber) params.push(`page=${pageNumber}`);
        if (limit) params.push(`limit=${limit}`);
        if (searchValue) params.push(`searchValue=${encodeURIComponent(searchValue)}`);
        if (status && status !== "all") params.push(`status=${encodeURIComponent(status)}`);
        if (votingType && votingType !== "all") params.push(`votingType=${encodeURIComponent(votingType)}`);
        if (league && league !== "all") params.push(`league=${encodeURIComponent(league)}`);
        if (ageGroup && ageGroup !== "all") params.push(`ageGroup=${encodeURIComponent(ageGroup)}`);

        if (params.length > 0) {
          url += `?${params.join("&")}`;
        }
        return {
          url,
          method: "GET",
        };
      },
      providesTags: ["playerVoting"],
    }),

    getSinglePlayerVoting: builder.query({
      query: (id) => ({
        url: `/player-voting/${id}`,
        method: "GET",
      }),
      providesTags: ["playerVoting"],
    }),

    deletePlayerVoting: builder.mutation({
      query: (id) => ({
        url: `/player-voting/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["playerVoting"],
    }),

    togglePlayerVotingStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/player-voting/${id}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["playerVoting"],
    }),

    getVotingLeaderboard: builder.query({
      query: (id) => ({
        url: `/player-voting/${id}/results`,
        method: "GET",
      }),
      providesTags: ["playerVoting"],
    }),

    getPastWinners: builder.query({
      query: ({ type = "", leagueId = "", ageGroup = "" } = {}) => {
        let url = "/player-voting/winners";
        const params = [];
        if (type && type !== "all") params.push(`type=${encodeURIComponent(type)}`);
        if (leagueId && leagueId !== "all") params.push(`leagueId=${encodeURIComponent(leagueId)}`);
        if (ageGroup && ageGroup !== "all") params.push(`ageGroup=${encodeURIComponent(ageGroup)}`);
        if (params.length > 0) {
          url += `?${params.join("&")}`;
        }
        return {
          url,
          method: "GET",
        };
      },
      providesTags: ["playerVoting"],
    }),
  }),
});

export const {
  useCreatePlayerVotingMutation,
  useUpdatePlayerVotingMutation,
  useGetAllPlayerVotingQuery,
  useGetSinglePlayerVotingQuery,
  useDeletePlayerVotingMutation,
  useTogglePlayerVotingStatusMutation,
  useGetVotingLeaderboardQuery,
  useGetPastWinnersQuery,
} = playerVotingApi;
