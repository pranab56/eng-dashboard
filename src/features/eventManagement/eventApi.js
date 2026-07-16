import { baseApi } from "../../utils/apiBaseQuery";

export const eventApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getEvent: builder.query({
      query: (page) => ({
        url: page ? `/event?page=${page}` : "/event",
        method: "GET",
      }),
      providesTags: ["event"]
    }),

    singleEvent: builder.query({
      query: (id) => ({
        url: `/event/${id}`,
        method: "GET",
      }),
      providesTags: ["event"]
    }),

    createEvent: builder.mutation({
      query: (data) => ({
        url: "/event",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["event"]
    }),

    editevent: builder.mutation({
      query: ({ id, data }) => ({
        url: `/event/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["event"]
    }),

    deleteevent: builder.mutation({
      query: (id) => ({
        url: `/event/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["event"]
    }),
  }),
});

// Export hooks
export const {
  useGetEventQuery,
  useSingleEventQuery,
  useCreateEventMutation,
  useEditeventMutation,
  useDeleteeventMutation,
} = eventApi;
