import { baseApi } from "../../utils/apiBaseQuery";

export const promotionalZoneApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    createPromotion: builder.mutation({
      query: (data) => ({
        url: "/promotional-zone",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [
        "promotionalZone",
        { type: "promotionalZone", id: "LIST" },
      ],
    }),

    updatePromotion: builder.mutation({
      query: ({ id, data }) => ({
        url: `/promotional-zone/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        "promotionalZone",
        { type: "promotionalZone", id: "LIST" },
        { type: "promotionalZone", id },
      ],
    }),

    getAllPromotions: builder.query({
      query: ({
        pageNumber = 1,
        limit = 10,
        searchValue = "",
        type = "",
        status = "",
        city = "",
        isFeatured = "",
      } = {}) => {
        let url = "/promotional-zone/admin/all";
        const params = [];
        if (pageNumber) params.push(`page=${pageNumber}`);
        if (limit) params.push(`limit=${limit}`);
        if (searchValue) params.push(`searchTerm=${encodeURIComponent(searchValue)}`);
        if (type && type !== "all") params.push(`type=${encodeURIComponent(type)}`);
        if (status && status !== "all") params.push(`status=${encodeURIComponent(status)}`);
        if (city && city !== "all") params.push(`city=${encodeURIComponent(city)}`);
        if (isFeatured !== "" && isFeatured !== "all") params.push(`isFeatured=${isFeatured}`);

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
                type: "promotionalZone",
                id: item._id || item.id,
              })),
              { type: "promotionalZone", id: "LIST" },
              "promotionalZone",
            ]
          : [{ type: "promotionalZone", id: "LIST" }, "promotionalZone"],
    }),

    getSinglePromotion: builder.query({
      query: (id) => ({
        url: `/promotional-zone/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [
        "promotionalZone",
        { type: "promotionalZone", id },
      ],
    }),

    deletePromotion: builder.mutation({
      query: (id) => ({
        url: `/promotional-zone/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        "promotionalZone",
        { type: "promotionalZone", id: "LIST" },
        { type: "promotionalZone", id },
      ],
    }),

    updatePromotionStatus: builder.mutation({
      query: ({ id, status, rejectionReason }) => ({
        url: `/promotional-zone/${id}/status`,
        method: "PATCH",
        body: { status, rejectionReason },
      }),
      invalidatesTags: (result, error, { id }) => [
        "promotionalZone",
        { type: "promotionalZone", id: "LIST" },
        { type: "promotionalZone", id },
      ],
    }),

    toggleFeaturePromotion: builder.mutation({
      query: (id) => ({
        url: `/promotional-zone/${id}/feature`,
        method: "PATCH",
      }),
      invalidatesTags: (result, error, id) => [
        "promotionalZone",
        { type: "promotionalZone", id: "LIST" },
        { type: "promotionalZone", id },
      ],
    }),

    getPromotionInquiries: builder.query({
      query: ({ id, page = 1, limit = 20 } = {}) => ({
        url: `/promotional-zone/${id}/inquiries?page=${page}&limit=${limit}`,
        method: "GET",
      }),
      providesTags: ["promotionalZone"],
    }),

    updateInquiryStatus: builder.mutation({
      query: ({ inquiryId, status }) => ({
        url: `/promotional-zone/inquiries/${inquiryId}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["promotionalZone"],
    }),
  }),
});

export const {
  useCreatePromotionMutation,
  useUpdatePromotionMutation,
  useGetAllPromotionsQuery,
  useGetSinglePromotionQuery,
  useDeletePromotionMutation,
  useUpdatePromotionStatusMutation,
  useToggleFeaturePromotionMutation,
  useGetPromotionInquiriesQuery,
  useUpdateInquiryStatusMutation,
} = promotionalZoneApi;
