import { baseApi } from "../../utils/apiBaseQuery";

export const matchApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    createMatch: builder.mutation({
      query: (data) => ({
        url: "/match",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["match"],
    }),

    updateMatch: builder.mutation({
      query: ({ id, data }) => ({
        url: `/match/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["match"],
    }),

    getAllMatch: builder.query({
      query: (params) => {
        let url = "/match";
        if (typeof params === "object" && params !== null) {
          const queryParts = [];
          Object.keys(params).forEach((key) => {
            if (params[key] !== undefined && params[key] !== null && params[key] !== "") {
              queryParts.push(`${key}=${encodeURIComponent(params[key])}`);
            }
          });
          if (queryParts.length > 0) {
            url += `?${queryParts.join("&")}`;
          }
        } else if (params) {
          url += `?page=${params}`;
        }
        return {
          url,
          method: "GET",
        };
      },
      providesTags: ["match"],
    }),

    getMatchOverview: builder.query({
      query: () => ({
        url: "/match/overview",
        method: "GET",
      }),
      providesTags: ["match"],
    }),

    getSingleMatch: builder.query({
      query: (id) => ({
        url: `/match/${id}`,
        method: "GET",
      }),
      providesTags: ["match"],
    }),

    deleteMatch: builder.mutation({
      query: (id) => ({
        url: `/match/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["match"],
    }),

    modifyScore: builder.mutation({
      query: ({ id, data }) => ({
        url: `/match/${id}/modify-score`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["match"],
    }),

    getMatchScheduleDates: builder.query({
      query: (params) => {
        let url = "/match/schedule-dates";
        if (typeof params === "object" && params !== null) {
          const queryParts = [];
          Object.keys(params).forEach((key) => {
            if (
              params[key] !== undefined &&
              params[key] !== null &&
              params[key] !== "" &&
              params[key] !== "ALL"
            ) {
              queryParts.push(key + "=" + encodeURIComponent(params[key]));
            }
          });
          if (queryParts.length > 0) {
            url += "?" + queryParts.join("&");
          }
        }
        return {
          url,
          method: "GET",
        };
      },
      providesTags: ["match"],
    }),

    getMatchFeedbackSetting: builder.query({
      query: () => ({
        url: "/match/feedback-setting",
        method: "GET",
      }),
      providesTags: ["matchSetting"],
    }),

    updateMatchFeedbackSetting: builder.mutation({
      query: (data) => ({
        url: "/match/feedback-setting",
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["matchSetting"],
    }),

    getMatchCleanSheets: builder.query({
      query: (id) => ({
        url: `/match/${id}/clean-sheets`,
        method: "GET",
      }),
      providesTags: ["match"],
    }),

    awardCleanSheet: builder.mutation({
      query: ({ matchId, data }) => ({
        url: `/match/${matchId}/clean-sheets`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["match", "player"],
    }),

    revokeCleanSheet: builder.mutation({
      query: ({ matchId, playerId, data }) => ({
        url: `/match/${matchId}/clean-sheets/${playerId}`,
        method: "DELETE",
        body: data,
      }),
      invalidatesTags: ["match", "player"],
    }),

    updateMatchStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/match/${id}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["match"],
    }),

    getMatchEvents: builder.query({
      query: (matchId) => ({
        url: `/match-result/match/${matchId}`,
        method: "GET",
      }),
      providesTags: ["matchResult", "match"],
    }),

    createMatchEvent: builder.mutation({
      query: (data) => ({
        url: "/match-result",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["matchResult", "match", "player"],
    }),

    updateMatchEvent: builder.mutation({
      query: ({ id, data }) => ({
        url: `/match-result/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["matchResult", "match", "player"],
    }),

    deleteMatchEvent: builder.mutation({
      query: (id) => ({
        url: `/match-result/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["matchResult", "match", "player"],
    }),
  }),
});

// Export hooks
export const {
  useCreateMatchMutation,
  useUpdateMatchMutation,
  useGetAllMatchQuery,
  useGetMatchOverviewQuery,
  useGetSingleMatchQuery,
  useDeleteMatchMutation,
  useModifyScoreMutation,
  useUpdateMatchStatusMutation,
  useGetMatchScheduleDatesQuery,
  useGetMatchFeedbackSettingQuery,
  useUpdateMatchFeedbackSettingMutation,
  useGetMatchCleanSheetsQuery,
  useAwardCleanSheetMutation,
  useRevokeCleanSheetMutation,
  useGetMatchEventsQuery,
  useCreateMatchEventMutation,
  useUpdateMatchEventMutation,
  useDeleteMatchEventMutation,
} = matchApi;
