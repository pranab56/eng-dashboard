import { baseApi } from "../../utils/apiBaseQuery";

export const notificationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createNotification: builder.mutation({
      query: (data) => ({
        url: "/push-notification/send",
        method: "POST",
        body: data
      }),
      invalidatesTags: ["notification"]
    }),

    getAllNotifications: builder.query({
      query: (page) => ({
        url: page ? `/notification?page=${page}` : "/notification",
        method: "GET",
      }),
      providesTags: ["notification"]
    }),

    notificationUnReadCount: builder.query({
      query: () => ({
        url: "/notification/unread-count",
        method: "GET",
      }),
      providesTags: ["notification"]
    }),

    readNotification: builder.mutation({
      query: () => ({
        url: "/notification/read-all",
        method: "PATCH",
      }),
      invalidatesTags: ["notification"]
    }),
  }),
});

// Export hooks
export const {
  useCreateNotificationMutation,
  useGetAllNotificationsQuery,
  useNotificationUnReadCountQuery,
  useReadNotificationMutation,
} = notificationApi;
