import { baseApi } from "../../utils/apiBaseQuery";

export const pushNotificationApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        createPushNotification: builder.mutation({
            query: (data) => ({
                url: "/push-notification/send",
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["pushNotification"]
        }),

        getAllPushNotification: builder.query({
            query: (params) => {
                let queryString = "";
                if (typeof params === "object" && params !== null) {
                    const searchParams = new URLSearchParams();
                    if (params.page) searchParams.append("page", params.page);
                    if (params.limit) searchParams.append("limit", params.limit);
                    if (params.status && params.status !== "ALL") searchParams.append("status", params.status);
                    if (params.searchTerm) searchParams.append("searchTerm", params.searchTerm);
                    queryString = `?${searchParams.toString()}`;
                } else if (params) {
                    queryString = `?page=${params}`;
                } else {
                    queryString = "?page=1";
                }
                return {
                    url: `/push-notification${queryString}`,
                    method: "GET",
                };
            },
            providesTags: ["pushNotification"]
        }),

        cancelScheduledPushNotification: builder.mutation({
            query: (id) => ({
                url: `/push-notification/cancel/${id}`,
                method: "PATCH",
            }),
            invalidatesTags: ["pushNotification"]
        }),

        sendScheduledNowPushNotification: builder.mutation({
            query: (id) => ({
                url: `/push-notification/send-now/${id}`,
                method: "POST",
            }),
            invalidatesTags: ["pushNotification"]
        }),

        deletePushNotification: builder.mutation({
            query: (id) => ({
                url: `/push-notification/delete/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["pushNotification"]
        }),

        deleteAllPushNotification: builder.mutation({
            query: () => ({
                url: "/push-notification/clear-all",
                method: "DELETE",
            }),
            invalidatesTags: ["pushNotification"]
        }),

        // 🔔 Dynamic Match Reminder Endpoints
        getMatchReminderSettings: builder.query({
            query: () => ({
                url: "/push-notification/match-reminders/settings",
                method: "GET",
            }),
            providesTags: ["matchReminder"]
        }),

        updateMatchReminderSettings: builder.mutation({
            query: (data) => ({
                url: "/push-notification/match-reminders/settings",
                method: "PATCH",
                body: data,
            }),
            invalidatesTags: ["matchReminder"]
        }),

        getUpcomingMatchesPreview: builder.query({
            query: (params) => {
                let queryString = "";
                if (params) {
                    const searchParams = new URLSearchParams();
                    if (params.page) searchParams.append("page", params.page);
                    if (params.limit) searchParams.append("limit", params.limit);
                    if (params.status) searchParams.append("status", params.status);
                    queryString = `?${searchParams.toString()}`;
                }
                return {
                    url: `/push-notification/match-reminders/upcoming${queryString}`,
                    method: "GET",
                };
            },
            providesTags: ["matchReminder"]
        }),

        triggerMatchRemindersNow: builder.mutation({
            query: () => ({
                url: "/push-notification/match-reminders/trigger-now",
                method: "POST",
            }),
            invalidatesTags: ["matchReminder"]
        }),

        sendSingleMatchReminderNow: builder.mutation({
            query: (matchId) => ({
                url: `/push-notification/match-reminders/send-single/${matchId}`,
                method: "POST",
            }),
            invalidatesTags: ["matchReminder"]
        }),
    }),
});

// Export hooks
export const {
    useCreatePushNotificationMutation,
    useGetAllPushNotificationQuery,
    useCancelScheduledPushNotificationMutation,
    useSendScheduledNowPushNotificationMutation,
    useDeletePushNotificationMutation,
    useDeleteAllPushNotificationMutation,
    useGetMatchReminderSettingsQuery,
    useUpdateMatchReminderSettingsMutation,
    useGetUpcomingMatchesPreviewQuery,
    useTriggerMatchRemindersNowMutation,
    useSendSingleMatchReminderNowMutation,
} = pushNotificationApi;
