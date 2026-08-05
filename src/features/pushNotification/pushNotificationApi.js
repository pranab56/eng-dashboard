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
            query: (page) => ({
                url: page ? `/push-notification?page=${page}` : "/push-notification?page=1",
                method: "GET",
            }),
            providesTags: ["pushNotification"]
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

    }),
});

// Export hooks
export const {
    useCreatePushNotificationMutation,
    useGetAllPushNotificationQuery,
    useDeletePushNotificationMutation,
    useDeleteAllPushNotificationMutation,
} = pushNotificationApi;
