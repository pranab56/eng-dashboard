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

    getNotifications: builder.query({
      query: (page) => ({
        url: `/push-notification?page=${page}`,
        method: "GET",
      }),
      providesTags: ["notification"]
    }),

  }),
});

// Export hooks
export const {
  useCreateNotificationMutation,
  useGetNotificationsQuery,
} = notificationApi;
