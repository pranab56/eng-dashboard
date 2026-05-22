import { baseApi } from "../../utils/apiBaseQuery";


export const teamApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createTeam: builder.mutation({
      query: (data) => ({
        url: "/team",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["team"]
    }),

    updateTeam: builder.mutation({
      query: ({ id, data }) => ({
        url: `/team/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["team"]
    }),

    getAllTeam: builder.query({
      query: (pageNumber) => ({
        url: `/team?page=${pageNumber}`,
        method: "GET",
      }),
      providesTags: ["team"]
    }),

    getSingleTeam: builder.query({
      query: (id) => ({
        url: `/team/${id}`,
        method: "GET",
      }),
      providesTags: ["team"]
    }),


    deleteTeam: builder.mutation({
      query: (id) => ({
        url: `/team/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["team"]
    }),


  }),
});

// Export hooks
export const {
  useCreateTeamMutation,
  useUpdateTeamMutation,
  useGetAllTeamQuery,
  useGetSingleTeamQuery,
  useDeleteTeamMutation,
} = teamApi;
