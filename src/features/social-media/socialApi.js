import { baseApi } from "../../utils/apiBaseQuery";

export const socialApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        createSocialMedia: builder.mutation({
            query: (data) => ({
                url: "/social-media",
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["social-media"]
        }),

        updateSocialMedia: builder.mutation({
            query: ({ data, id }) => ({
                url: `/social-media/${id}`,
                method: "PATCH",
                body: data,
            }),
            invalidatesTags: ["social-media"]
        }),

        getAllSocialMedia: builder.query({
            query: ({ pageNumber, searchValue } = {}) => {
                let url = "/social-media";
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
            providesTags: ["social-media"]
        }),

        deleteSocialMedia: builder.mutation({
            query: (id) => ({
                url: `/social-media/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["social-media"]
        }),
    }),
});

export const {
    useCreateSocialMediaMutation,
    useUpdateSocialMediaMutation,
    useGetAllSocialMediaQuery,
    useDeleteSocialMediaMutation,
} = socialApi;

