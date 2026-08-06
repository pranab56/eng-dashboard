import { baseApi } from "../../utils/apiBaseQuery";

export const categoryApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        // --------------------------- Gallery Management ------------------------------
        getAllGalleryCategory: builder.query({
            query: () => ({
                url: `/gallery-category`,
                method: "GET",
            }),
            providesTags: ["gallery"],
        }),

        createGalleryCategory: builder.mutation({
            query: (data) => ({
                url: `/gallery-category`,
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["gallery"],
        }),

        createGallerySubCategory: builder.mutation({
            query: (data) => ({
                url: `/gallery-category`,
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["gallery"],
        }),

        updateGalleryCategory: builder.mutation({
            query: ({ data, id }) => ({
                url: `/gallery-category/${id}`,
                method: "PATCH",
                body: data,
            }),
            invalidatesTags: ["gallery"],
        }),

        updateGallerySubCategory: builder.mutation({
            query: ({ data, id }) => ({
                url: `/gallery-category/${id}`,
                method: "PATCH",
                body: data,
            }),
            invalidatesTags: ["gallery"],
        }),

        deleteGalleryCategory: builder.mutation({
            query: (id) => ({
                url: `/gallery-category/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["gallery"],
        }),

        deleteGallerySubCategory: builder.mutation({
            query: (id) => ({
                url: `/gallery-category/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["gallery"],
        }),

        // --------------------------- Video Management (ENG TV) ------------------------------
        getAllVideoCategory: builder.query({
            query: () => ({
                url: `/eng-tv-category`,
                method: "GET",
            }),
            providesTags: ["video"],
        }),

        createVideoCategory: builder.mutation({
            query: (data) => ({
                url: `/eng-tv-category`,
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["video"],
        }),

        createVideoSubCategory: builder.mutation({
            query: (data) => ({
                url: `/eng-tv-category`,
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["video"],
        }),

        updateVideoCategory: builder.mutation({
            query: ({ data, id }) => ({
                url: `/eng-tv-category/${id}`,
                method: "PATCH",
                body: data,
            }),
            invalidatesTags: ["video"],
        }),

        updateVideoSubCategory: builder.mutation({
            query: ({ data, id }) => ({
                url: `/eng-tv-category/${id}`,
                method: "PATCH",
                body: data,
            }),
            invalidatesTags: ["video"],
        }),

        deleteVideoCategory: builder.mutation({
            query: (id) => ({
                url: `/eng-tv-category/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["video"],
        }),

        deleteVideoSubCategory: builder.mutation({
            query: (id) => ({
                url: `/eng-tv-category/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["video"],
        }),

        rearrangeVideoCategories: builder.mutation({
            query: (data) => ({
                url: `/eng-tv-category/rearrange`,
                method: "PATCH",
                body: data,
            }),
            invalidatesTags: ["video"],
        }),

        // --------------------------- Venue Management ------------------------------
        getAllVenueCategory: builder.query({
            query: () => ({
                url: `/venue-category`,
                method: "GET",
            }),
            providesTags: ["venue"],
        }),

        createVenueCategory: builder.mutation({
            query: (data) => ({
                url: `/venue-category`,
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["venue"],
        }),

        createVenueSubCategory: builder.mutation({
            query: (data) => ({
                url: `/venue-category`,
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["venue"],
        }),

        updateVenueCategory: builder.mutation({
            query: ({ data, id }) => ({
                url: `/venue-category/${id}`,
                method: "PATCH",
                body: data,
            }),
            invalidatesTags: ["venue"],
        }),

        updateVenueSubCategory: builder.mutation({
            query: ({ data, id }) => ({
                url: `/venue-category/${id}`,
                method: "PATCH",
                body: data,
            }),
            invalidatesTags: ["venue"],
        }),

        deleteVenueCategory: builder.mutation({
            query: (id) => ({
                url: `/venue-category/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["venue"],
        }),

        deleteVenueSubCategory: builder.mutation({
            query: (id) => ({
                url: `/venue-category/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["venue"],
        }),

        // Aliases for compatibility
        createVanueCategory: builder.mutation({
            query: (data) => ({
                url: `/venue-category`,
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["venue"],
        }),
        createVanueSubCategory: builder.mutation({
            query: (data) => ({
                url: `/venue-category`,
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["venue"],
        }),
        updateVanueSubCategory: builder.mutation({
            query: ({ data, id }) => ({
                url: `/venue-category/${id}`,
                method: "PATCH",
                body: data,
            }),
            invalidatesTags: ["venue"],
        }),
        deleteVanueSubCategory: builder.mutation({
            query: (id) => ({
                url: `/venue-category/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["venue"],
        }),

        // --------------------------- Time Management (Playtime) ------------------------------
        getAllPlayTime: builder.query({
            query: () => ({
                url: `/playtime-category`,
                method: "GET",
            }),
            providesTags: ["playtime"],
        }),

        createPlayTime: builder.mutation({
            query: (data) => ({
                url: `/playtime-category`,
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["playtime"],
        }),

        updatePlayTime: builder.mutation({
            query: ({ data, id }) => ({
                url: `/playtime-category/${id}`,
                method: "PATCH",
                body: data,
            }),
            invalidatesTags: ["playtime"],
        }),

        deletePlayTime: builder.mutation({
            query: (id) => ({
                url: `/playtime-category/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["playtime"],
        }),

        // --------------------------- Age Group Management ------------------------------
        getAllAgeGroup: builder.query({
            query: () => ({
                url: `/age-group-category/admin`,
                method: "GET",
            }),
            providesTags: ["ageGroup"],
        }),

        createAgeGroup: builder.mutation({
            query: (data) => ({
                url: `/age-group-category`,
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["ageGroup"],
        }),

        createAgeGroupSubCategory: builder.mutation({
            query: (data) => ({
                url: `/age-group-category`,
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["ageGroup"],
        }),

        getAgeGroupSubCategories: builder.query({
            query: (parentId) => ({
                url: `/age-group-category/${parentId}/sub-categories`,
                method: "GET",
            }),
            providesTags: ["ageGroup"],
        }),

        updateAgeGroup: builder.mutation({
            query: ({ data, id }) => ({
                url: `/age-group-category/${id}`,
                method: "PATCH",
                body: data,
            }),
            invalidatesTags: ["ageGroup"],
        }),

        deleteAgeGroup: builder.mutation({
            query: (id) => ({
                url: `/age-group-category/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["ageGroup"],
        }),

        // --------------------- news Category ------------------------



        getAllNewsCategory: builder.query({
            query: () => ({
                url: `/news-category`,
                method: "GET",
            }),
            providesTags: ["newsCategory"],
        }),

        createNewsCategory: builder.mutation({
            query: (data) => ({
                url: `/news-category`,
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["newsCategory"],
        }),

        updateNewsCategory: builder.mutation({
            query: ({ data, id }) => ({
                url: `/news-category/${id}`,
                method: "PATCH",
                body: data,
            }),
            invalidatesTags: ["newsCategory"],
        }),

        deleteNewsCategory: builder.mutation({
            query: (id) => ({
                url: `/news-category/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["newsCategory"],
        }),

    }),
});

// Export RTK Query Hooks
export const {
    // Gallery
    useGetAllGalleryCategoryQuery,
    useCreateGalleryCategoryMutation,
    useCreateGallerySubCategoryMutation,
    useUpdateGalleryCategoryMutation,
    useUpdateGallerySubCategoryMutation,
    useDeleteGalleryCategoryMutation,
    useDeleteGallerySubCategoryMutation,

    // Video (ENG TV)
    useGetAllVideoCategoryQuery,
    useCreateVideoCategoryMutation,
    useCreateVideoSubCategoryMutation,
    useUpdateVideoCategoryMutation,
    useUpdateVideoSubCategoryMutation,
    useDeleteVideoCategoryMutation,
    useDeleteVideoSubCategoryMutation,
    useRearrangeVideoCategoriesMutation,

    // Venue
    useGetAllVenueCategoryQuery,
    useCreateVenueCategoryMutation,
    useCreateVenueSubCategoryMutation,
    useUpdateVenueCategoryMutation,
    useUpdateVenueSubCategoryMutation,
    useDeleteVenueCategoryMutation,
    useDeleteVenueSubCategoryMutation,
    useCreateVanueCategoryMutation,
    useCreateVanueSubCategoryMutation,
    useUpdateVanueSubCategoryMutation,
    useDeleteVanueSubCategoryMutation,

    // Time / Playtime
    useGetAllPlayTimeQuery,
    useCreatePlayTimeMutation,
    useUpdatePlayTimeMutation,
    useDeletePlayTimeMutation,

    // Age Group
    useGetAllAgeGroupQuery,
    useCreateAgeGroupMutation,
    useCreateAgeGroupSubCategoryMutation,
    useGetAgeGroupSubCategoriesQuery,
    useUpdateAgeGroupMutation,
    useDeleteAgeGroupMutation,

    // News
    useGetAllNewsCategoryQuery,
    useCreateNewsCategoryMutation,
    useUpdateNewsCategoryMutation,
    useDeleteNewsCategoryMutation,
} = categoryApi;

// Export galleryApi alias for backward compatibility
export const galleryApi = categoryApi;



