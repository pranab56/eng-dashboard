import { baseApi } from "../../utils/apiBaseQuery";


export const galleryApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({

        createGallery: builder.mutation({
            query: (data) => ({
                url: "/gallery",
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["gallery"]
        }),



        updateGallery: builder.mutation({
            query: ({ data, id }) => ({
                url: `/gallery/${id}`,
                method: "PATCH",
                body: data,
            }),
            invalidatesTags: ["gallery"]
        }),

        getAllGallery: builder.query({
            query: ({ pageNumber, searchValue } = {}) => {
                let url = "/gallery";
                const params = [];
                if (pageNumber) params.push(`page=${pageNumber}`);
                if (searchValue) params.push(`searchTerm=${encodeURIComponent(searchValue)}`);
                if (params.length > 0) {
                    url += `?${params.join("&")}`;
                }
                return {
                    url,
                    method: "GET",
                };
            },
            providesTags: ["gallery"]
        }),


        deleteGallery: builder.mutation({
            query: (id) => ({
                url: `/gallery/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["gallery"]
        }),


    }),
});

export const {
    useCreateGalleryMutation,
    useUpdateGalleryMutation,
    useGetAllGalleryQuery,
    useDeleteGalleryMutation,
} = galleryApi;
