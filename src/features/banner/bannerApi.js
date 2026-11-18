import { baseApi } from "../../utils/apiBaseQuery";

export const bannerApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    createBanner: builder.mutation({
      query: (data) => ({
        url: "/banner",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["banner", { type: "banner", id: "LIST" }],
    }),

    updateBanner: builder.mutation({
      query: ({ id, data }) => ({
        url: `/banner/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        "banner",
        { type: "banner", id: "LIST" },
        { type: "banner", id },
      ],
    }),

    getAllBanners: builder.query({
      query: ({
        pageNumber = 1,
        limit = 10,
        searchValue = "",
        section = "",
        status = "",
      } = {}) => {
        let url = "/banner";
        const params = [];
        if (pageNumber) params.push(`page=${pageNumber}`);
        if (limit) params.push(`limit=${limit}`);
        if (searchValue) params.push(`searchTerm=${encodeURIComponent(searchValue)}`);
        if (section && section !== "all") params.push(`section=${encodeURIComponent(section)}`);
        if (status && status !== "all") params.push(`status=${encodeURIComponent(status)}`);

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
                type: "banner",
                id: item._id || item.id,
              })),
              { type: "banner", id: "LIST" },
              "banner",
            ]
          : [{ type: "banner", id: "LIST" }, "banner"],
    }),

    getSingleBanner: builder.query({
      query: (id) => ({
        url: `/banner/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [
        "banner",
        { type: "banner", id },
      ],
    }),

    deleteBanner: builder.mutation({
      query: (id) => ({
        url: `/banner/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        "banner",
        { type: "banner", id: "LIST" },
        { type: "banner", id },
      ],
    }),

    toggleBannerStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/banner/${id}/toggle-status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: (result, error, { id }) => [
        "banner",
        { type: "banner", id: "LIST" },
        { type: "banner", id },
      ],
    }),
  }),
});

export const {
  useCreateBannerMutation,
  useUpdateBannerMutation,
  useGetAllBannersQuery,
  useGetSingleBannerQuery,
  useDeleteBannerMutation,
  useToggleBannerStatusMutation,
} = bannerApi;
