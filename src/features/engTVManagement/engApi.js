import { baseApi } from "../../utils/apiBaseQuery";


export const engApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({

    createVideo: builder.mutation({
      query: (data) => ({
        url: "/video",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["video"]
    }),

    updateVideo: builder.mutation({
      query: ({ id, data }) => ({
        url: `/video/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["video"]
    }),

    getAllVideo: builder.query({
      query: (pageNumber) => ({
        url: `/video?page=${pageNumber}`,
        method: "GET",
      }),
      providesTags: ["video"]
    }),

    getSingleVideo: builder.query({
      query: (id) => ({
        url: `/video/${id}`,
        method: "GET",
      }),
      providesTags: ["video"]
    }),


    deleteVideo: builder.mutation({
      query: (id) => ({
        url: `/video/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["video"]
    }),


  }),
});

// Export hooks
export const {
  useCreateVideoMutation,
  useUpdateVideoMutation,
  useGetAllVideoQuery,
  useGetSingleVideoQuery,
  useDeleteVideoMutation,
} = engApi;
