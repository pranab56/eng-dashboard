import { baseApi } from "../../utils/apiBaseQuery";


export const playerApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllPlayer: builder.query({
      query: ({ pageNumber }) => ({
        url: `/player?page=${pageNumber}`,
        method: "GET",
      }),
      providesTags: ["player"]
    }),
  }),
});

// Export hooks
export const {
  useGetAllPlayerQuery,
} = playerApi;
