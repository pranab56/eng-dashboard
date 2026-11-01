import { baseApi } from "../../utils/apiBaseQuery";

export const appModalApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    createAppModal: builder.mutation({
      query: (data) => ({
        url: "/app-modal",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["appModal", { type: "appModal", id: "LIST" }],
    }),

    updateAppModal: builder.mutation({
      query: ({ id, data }) => ({
        url: `/app-modal/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        "appModal",
        { type: "appModal", id: "LIST" },
        { type: "appModal", id },
      ],
    }),

    getAllAppModals: builder.query({
      query: ({
        pageNumber = 1,
        limit = 10,
        searchValue = "",
        status = "",
        actionType = "",
      } = {}) => {
        let url = "/app-modal";
        const params = [];
        if (pageNumber) params.push(`page=${pageNumber}`);
        if (limit) params.push(`limit=${limit}`);
        if (searchValue) params.push(`searchTerm=${encodeURIComponent(searchValue)}`);
        if (status && status !== "all") params.push(`status=${encodeURIComponent(status)}`);
        if (actionType && actionType !== "all") params.push(`actionType=${encodeURIComponent(actionType)}`);

        if (params.length > 0) {
          url += `?${params.join("&")}`;
        }
        return {
          url,
          method: "GET",
        };
      },
      providesTags: (result) =>
        result?.data && Array.isArray(result.data)
          ? [
              ...result.data.map((item) => ({
                type: "appModal",
                id: item._id || item.id,
              })),
              { type: "appModal", id: "LIST" },
              "appModal",
            ]
          : [{ type: "appModal", id: "LIST" }, "appModal"],
    }),

    getSingleAppModal: builder.query({
      query: (id) => ({
        url: `/app-modal/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [
        "appModal",
        { type: "appModal", id },
      ],
    }),

    deleteAppModal: builder.mutation({
      query: (id) => ({
        url: `/app-modal/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        "appModal",
        { type: "appModal", id: "LIST" },
        { type: "appModal", id },
      ],
    }),

    toggleAppModalStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/app-modal/${id}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: (result, error, { id }) => [
        "appModal",
        { type: "appModal", id: "LIST" },
        { type: "appModal", id },
      ],
    }),
  }),
});

export const {
  useCreateAppModalMutation,
  useUpdateAppModalMutation,
  useGetAllAppModalsQuery,
  useGetSingleAppModalQuery,
  useDeleteAppModalMutation,
  useToggleAppModalStatusMutation,
} = appModalApi;

