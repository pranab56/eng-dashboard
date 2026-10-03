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

        getTournamentClaimOverview: builder.query({
            query: () => ({
                url: `/tournament-claim/overview`,
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
    overrideExisting: true,
});

// Export hooks
export const {
    useGetAllTournamentClaimQuery,
    useGetTournamentClaimOverviewQuery,
    useUpdateTournamentClaimStatusMutation,
} = tournamentClaimApi;
