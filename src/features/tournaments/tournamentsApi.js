import { baseApi } from "../../utils/apiBaseQuery";


export const tournamentsApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({

        getAllTournaments: builder.query({
            query: (pageNumber) => ({
                url: `/tournament?page=${pageNumber}`,
                method: "GET",
            }),
            providesTags: ["tournaments"]
        }),

        singleGetTournaments: builder.query({
            query: (id) => ({
                url: `/tournament/${id}`,
                method: "GET",
            }),
            providesTags: ["tournaments"]
        }),

        createTourNaments: builder.mutation({
            query: (body) => ({
                url: `/tournament`,
                method: "POST",
                body: body
            }),
            invalidatesTags: ["tournaments"]
        }),

        updateTourNaments: builder.mutation({
            query: ({ id, body }) => ({
                url: `/tournament/${id}`,
                method: "PATCH",
                body: body
            }),
            invalidatesTags: ["tournaments"]
        }),

        deleteTourNaments: builder.mutation({
            query: (id) => ({
                url: `/tournament/${id}`,
                method: "DELETE",

            }),
            invalidatesTags: ["tournaments"]
        }),
    }),
});

// Export hooks
export const {
    useGetAllTournamentsQuery,
    useSingleGetTournamentsQuery,
    useCreateTourNamentsMutation,
    useUpdateTourNamentsMutation,
    useDeleteTourNamentsMutation,
} = tournamentsApi;
