import { baseApi } from "../../utils/apiBaseQuery";

export const bookAScoutApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    createBookAScout: builder.mutation({
      query: (data) => ({
        url: "/book-a-scout",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["bookAScout", { type: "bookAScout", id: "LIST" }],
    }),

    updateBookAScout: builder.mutation({
      query: ({ id, data }) => ({
        url: `/book-a-scout/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        "bookAScout",
        { type: "bookAScout", id: "LIST" },
        { type: "bookAScout", id },
      ],
    }),

    getAllBookAScout: builder.query({
      query: ({
        pageNumber = 1,
        limit = 10,
        searchValue = "",
        status = "",
        isFeatured = "",
      } = {}) => {
        let url = "/book-a-scout";
        const params = [];
        if (pageNumber) params.push(`page=${pageNumber}`);
        if (limit) params.push(`limit=${limit}`);
        if (searchValue) params.push(`searchTerm=${encodeURIComponent(searchValue)}`);
        if (status && status !== "all") params.push(`status=${encodeURIComponent(status)}`);
        if (isFeatured && isFeatured !== "all") {
          params.push(`isFeatured=${encodeURIComponent(isFeatured)}`);
        }

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
                type: "bookAScout",
                id: item._id || item.id,
              })),
              { type: "bookAScout", id: "LIST" },
              "bookAScout",
            ]
          : [{ type: "bookAScout", id: "LIST" }, "bookAScout"],
    }),

    getSingleBookAScout: builder.query({
      query: (id) => ({
        url: `/book-a-scout/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => ["bookAScout", { type: "bookAScout", id }],
    }),

    deleteBookAScout: builder.mutation({
      query: (id) => ({
        url: `/book-a-scout/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        "bookAScout",
        { type: "bookAScout", id: "LIST" },
        { type: "bookAScout", id },
      ],
    }),

    toggleBookAScoutStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/book-a-scout/${id}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: (result, error, { id }) => [
        "bookAScout",
        { type: "bookAScout", id: "LIST" },
        { type: "bookAScout", id },
      ],
    }),

    toggleBookAScoutFeatured: builder.mutation({
      query: (id) => ({
        url: `/book-a-scout/${id}/feature`,
        method: "PATCH",
      }),
      invalidatesTags: (result, error, id) => [
        "bookAScout",
        { type: "bookAScout", id: "LIST" },
        { type: "bookAScout", id },
      ],
    }),
  }),
});

export const {
  useCreateBookAScoutMutation,
  useUpdateBookAScoutMutation,
  useGetAllBookAScoutQuery,
  useGetSingleBookAScoutQuery,
  useDeleteBookAScoutMutation,
  useToggleBookAScoutStatusMutation,
  useToggleBookAScoutFeaturedMutation,
} = bookAScoutApi;
