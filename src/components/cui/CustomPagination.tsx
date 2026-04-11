"use client";

import { useSearchParams, useRouter } from "next/navigation";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import { Suspense } from "react";

const MAX_PAGE_WINDOW = 4;

function MyPaginationSuspense({
  TOTAL_PAGES = 5,
  qryName = "page",
}: {
  TOTAL_PAGES?: number;
  qryName?: string;
}) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const currentPage = parseInt(searchParams.get(qryName) || "1");

  // ✅ Proper sliding window
  const startPage = Math.max(
    1,
    currentPage - Math.floor(MAX_PAGE_WINDOW / 2)
  );
  const endPage = Math.min(
    TOTAL_PAGES,
    startPage + MAX_PAGE_WINDOW - 1
  );

  const pageNumbers = [];
  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(qryName, newPage.toString());
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="flex items-center justify-between">
      <p className=" text-gray-500 font-semibold">
        Showing <span className="text-gray-800">{startPage}</span>-<span className="text-gray-800">{endPage}</span> of <span className="text-gray-800">{TOTAL_PAGES}</span> entries
      </p>

      <Pagination>
        <PaginationContent>

          {/* ✅ Previous (1 step) */}
          <PaginationItem>
            <PaginationPrevious
              aria-disabled={currentPage === 1}
              onClick={() =>
                currentPage > 1 &&
                handlePageChange(currentPage - 1)
              }
            />
          </PaginationItem>

          {/* ✅ First page + ellipsis */}
          {startPage > 1 && (
            <>
              <PaginationItem>
                <PaginationLink onClick={() => handlePageChange(1)}>
                  1
                </PaginationLink>
              </PaginationItem>
              {startPage > 2 && (
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              )}
            </>
          )}

          {/* ✅ Page window */}
          {pageNumbers.map((page) => (
            <PaginationItem key={page}>
              <PaginationLink
                isActive={currentPage === page}
                onClick={() => handlePageChange(page)}
              >
                {page}
              </PaginationLink>
            </PaginationItem>
          ))}

          {/* ✅ Last page + ellipsis */}
          {endPage < TOTAL_PAGES && (
            <>
              {endPage < TOTAL_PAGES - 1 && (
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              )}
              <PaginationItem>
                <PaginationLink
                  onClick={() => handlePageChange(TOTAL_PAGES)}
                >
                  {TOTAL_PAGES}
                </PaginationLink>
              </PaginationItem>
            </>
          )}

          {/* ✅ Next (1 step) */}
          <PaginationItem>
            <PaginationNext
              aria-disabled={currentPage === TOTAL_PAGES}
              onClick={() =>
                currentPage < TOTAL_PAGES &&
                handlePageChange(currentPage + 1)
              }
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}

export default function CustomPagination({
  TOTAL_PAGES,
  qryName = "page",
}: {
  TOTAL_PAGES?: number;
  qryName?: string;
}) {
  return (
    <Suspense fallback={<div>Loading Pagination...</div>}>
      <MyPaginationSuspense
        TOTAL_PAGES={TOTAL_PAGES}
        qryName={qryName}
      />
    </Suspense>
  );
}