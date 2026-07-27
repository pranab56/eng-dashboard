import { baseApi } from "../../utils/apiBaseQuery";

export const orderApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getAllOrder: builder.query({
            query: ({ pageNumber, searchValue } = {}) => {
                let url = "/reward-order";
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
            providesTags: ["order"]
        }),
        acceptOrder: builder.mutation({
            query: (id) => ({
                url: `/reward-order/${id}/approve`,
                method: "PATCH",
            }),
            invalidatesTags: ["order"]
        }),
        rejectOrder: builder.mutation({
            query: (id) => ({
                url: `/reward-order/${id}/reject`,
                method: "PATCH",
            }),
            invalidatesTags: ["order"]
        }),
    }),
});

// Export hooks
export const {
    useAcceptOrderMutation,
    useRejectOrderMutation,
    useGetAllOrderQuery
} = orderApi;
