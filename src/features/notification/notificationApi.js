import { baseApi } from "../../utils/apiBaseQuery";

export const notificationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllNotifications: builder.query({
      query: (page) => ({
        url: page ? `/notification/my?page=${page}` : "/notification/my?page=1",
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

    readAllNotification: builder.mutation({
      query: () => ({
        url: "notification/read-all",
        method: "PATCH",
      }),
      invalidatesTags: ["notification"]
    }),

    readSingleNotification: builder.mutation({
      query: (id) => ({
        url: `/notification/${id}/read`,
        method: "PATCH",
      }),
      invalidatesTags: ["notification"]
    }),

    deleteNotification: builder.mutation({
      query: () => ({
        url: "/notification/clear-all",
        method: "DELETE",
      }),
      invalidatesTags: ["notification"]
    }),

    singleDeleteNotification: builder.mutation({
      query: (id) => ({
        url: `/notification/delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["notification"]
    }),

    createNotification: builder.mutation({
      query: (data) => ({
        url: "/push-notification/send",
        method: "POST",
        body: data
      }),
      invalidatesTags: ["notification"]
    }),
  }),
});

// Export hooks
export const {
  useCreateNotificationMutation,
  useDeleteNotificationMutation,
  useGetAllNotificationsQuery,
  useNotificationUnReadCountQuery,
  useReadAllNotificationMutation,
  useReadAllNotificationMutation: useReadNotificationMutation,
  useReadSingleNotificationMutation,
  useSingleDeleteNotificationMutation,
} = notificationApi;
