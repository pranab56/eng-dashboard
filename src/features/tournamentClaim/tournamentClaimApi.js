import { baseApi } from "../../utils/apiBaseQuery";


export const tournamentClaimApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({

        getAllTournamentClaim: builder.query({
            query: (pageNumber) => ({
                url: `/tournament-claim?page=${pageNumber}`,
                method: "GET",
            }),
            providesTags: ["tournamentClaim"]
        }),



        updateTournamentClaimStatus: builder.mutation({
            query: ({ id, body }) => ({
                url: `/tournament-claim/${id}/review`,
                method: "PATCH",
                body: body
            }),
            invalidatesTags: ["tournamentClaim"]
        }),

    }),
});

// Export hooks
export const {
    useGetAllTournamentClaimQuery,
    useUpdateTournamentClaimStatusMutation,
} = tournamentClaimApi;
