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

    frontEndVideo: builder.query({
      query: (params) => {
        const fileName = params?.fileName || "";
        const contentType = params?.contentType || "";
        return {
          url: `/video/presigned-url?fileName=${encodeURIComponent(fileName)}&contentType=${encodeURIComponent(contentType)}`,
          method: "GET",
        };
      },
      providesTags: ["video"]
    }),

    updateVideoFile: builder.mutation({
      query: ({ data, url, contentType }) => ({
        url: `${url}`,
        method: "PUT",
        headers: contentType ? { "Content-Type": contentType } : {},
        body: data,
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
  useFrontEndVideoQuery,
  useLazyFrontEndVideoQuery,
  useUpdateVideoFileMutation,
} = engApi;
