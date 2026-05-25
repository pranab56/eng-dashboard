import { baseApi } from "../../utils/apiBaseQuery";


export const eventApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({

    createEvent: builder.mutation({
      query: (data) => ({
        url: "/event",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["event"]
    }),

    updateEvent: builder.mutation({
      query: ({ id, data }) => ({
        url: `/event/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["event"]
    }),

    getAllEvent: builder.query({
      query: (pageNumber) => ({
        url: `/event?page=${pageNumber}`,
        method: "GET",
      }),
      providesTags: ["event"]
    }),

    getSingleEvent: builder.query({
      query: (id) => ({
        url: `/event/${id}`,
        method: "GET",
      }),
      providesTags: ["event"]
    }),


    deleteEvent: builder.mutation({
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
  useCreateEventMutation,
  useUpdateEventMutation,
  useGetAllEventQuery,
  useGetSingleEventQuery,
  useDeleteEventMutation,
} = eventApi;
