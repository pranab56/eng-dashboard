import { baseApi } from "../../utils/apiBaseQuery";


export const refereeApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getReferee: builder.query({
      query: () => ({
        url: "/user-management/referees",
        method: "GET",
      }),
      providesTags: ["referee"]
    }),
  }),
});

export const {
  useGetRefereeQuery,
} = refereeApi;
