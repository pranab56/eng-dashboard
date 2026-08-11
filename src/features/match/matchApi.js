import { baseApi } from "../../utils/apiBaseQuery";


export const matchApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({

    createMatch: builder.mutation({
      query: (data) => ({
        url: "/match",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["match"]
    }),

    updateMatch: builder.mutation({
      query: ({ id, data }) => ({
        url: `/match/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["match"]
    }),

    getAllMatch: builder.query({
      query: (params) => {
        let url = "/match";
        if (typeof params === "object" && params !== null) {
          const queryParts = [];
          Object.keys(params).forEach((key) => {
            if (params[key] !== undefined && params[key] !== null && params[key] !== "") {
              queryParts.push(`${key}=${encodeURIComponent(params[key])}`);
            }
          });
          if (queryParts.length > 0) {
            url += `?${queryParts.join("&")}`;
          }
        } else if (params) {
          url += `?page=${params}`;
        }
        return {
          url,
          method: "GET",
        };
      },
      providesTags: ["match"],
    }),

    getSingleMatch: builder.query({
      query: (id) => ({
        url: `/match/${id}`,
        method: "GET",
      }),
      providesTags: ["match"]
    }),


    deleteMatch: builder.mutation({
      query: (id) => ({
        url: `/match/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["match"]
    }),

    modifyScore: builder.mutation({
      query: ({ id, data }) => ({
        url: `/match/${id}/modify-score`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["match"]
    }),

  }),
});

// Export hooks
export const {
  useCreateMatchMutation,
  useUpdateMatchMutation,
  useGetAllMatchQuery,
  useGetSingleMatchQuery,
  useDeleteMatchMutation,
  useModifyScoreMutation,
} = matchApi;
