"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import { Suspense, useTransition } from "react";
import { cn } from "@/lib/utils";

const MAX_PAGE_WINDOW = 4;

function MyPaginationSuspense({
  TOTAL_PAGES = 1,
  qryName = "page",
  className,
  showPageInfo = false,
}: {
  TOTAL_PAGES?: number;
  qryName?: string;
  className?: string;
  showPageInfo?: boolean;
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [, startTransition] = useTransition();

  const safeTotalPages = Math.max(1, TOTAL_PAGES || 1);
  const rawPage = parseInt(searchParams.get(qryName) || "1", 10);
  const currentPage = Math.min(
    safeTotalPages,
    Math.max(1, Number.isNaN(rawPage) ? 1 : rawPage)
  );

  // Proper sliding window for pages
  const startPage = Math.max(
    1,
    currentPage - Math.floor(MAX_PAGE_WINDOW / 2)
  );
  const endPage = Math.min(
    safeTotalPages,
    startPage + MAX_PAGE_WINDOW - 1
  );

  // Recalculate startPage if endPage is near the end
  const adjustedStartPage = Math.max(1, endPage - MAX_PAGE_WINDOW + 1);

  const pageNumbers: number[] = [];
  for (let i = adjustedStartPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  const handlePageChange = (newPage: number) => {
    if (newPage === currentPage || newPage < 1 || newPage > safeTotalPages) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set(qryName, newPage.toString());
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
    const mainEl = document.querySelector("main");
    if (mainEl) {
      mainEl.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div
      className={cn(
        "flex items-center gap-2 sm:gap-3",
        showPageInfo ? "justify-between w-full flex-wrap" : "justify-end",
        className
      )}
    >
      {showPageInfo && (
        <span className="text-xs text-slate-500 font-medium select-none">
          Page <strong className="font-semibold text-slate-800 dark:text-slate-200">{currentPage}</strong> of{" "}
          <strong className="font-semibold text-slate-800 dark:text-slate-200">{safeTotalPages}</strong>
        </span>
      )}

      <Pagination className="w-auto mx-0">
        <PaginationContent className="flex items-center gap-1 sm:gap-1.5">
          {/* Previous Button */}
          <PaginationItem>
            <PaginationPrevious
              isActive={currentPage <= 1}
              aria-disabled={currentPage <= 1}
              className={
                currentPage <= 1
                  ? "pointer-events-none opacity-40 cursor-not-allowed"
                  : "cursor-pointer"
              }
              onClick={(e) => {
                e.preventDefault();
                if (currentPage > 1) handlePageChange(currentPage - 1);
              }}
            />
          </PaginationItem>

          {/* First page + ellipsis if needed */}
          {adjustedStartPage > 1 && (
            <>
              <PaginationItem>
                <PaginationLink
                  isActive={currentPage === 1}
                  className="cursor-pointer"
                  onClick={(e) => {
                    e.preventDefault();
                    handlePageChange(1);
                  }}
                >
                  1
                </PaginationLink>
              </PaginationItem>
              {adjustedStartPage > 2 && (
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              )}
            </>
          )}

          {/* Sliding page window */}
          {pageNumbers.map((page) => (
            <PaginationItem key={page}>
              <PaginationLink
                isActive={currentPage === page}
                className={currentPage === page ? "cursor-default pointer-events-none" : "cursor-pointer"}
                onClick={(e) => {
                  e.preventDefault();
                  handlePageChange(page);
                }}
              >
                {page}
              </PaginationLink>
            </PaginationItem>
          ))}

          {/* Last page + ellipsis if needed */}
          {endPage < safeTotalPages && (
            <>
              {endPage < safeTotalPages - 1 && (
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              )}
              <PaginationItem>
                <PaginationLink
                  isActive={currentPage === safeTotalPages}
                  className="cursor-pointer"
                  onClick={(e) => {
                    e.preventDefault();
                    handlePageChange(safeTotalPages);
                  }}
                >
                  {safeTotalPages}
                </PaginationLink>
              </PaginationItem>
            </>
          )}

          {/* Next Button */}
          <PaginationItem>
            <PaginationNext
              isActive={currentPage >= safeTotalPages}
              aria-disabled={currentPage >= safeTotalPages}
              className={
                currentPage >= safeTotalPages
                  ? "pointer-events-none opacity-40 cursor-not-allowed"
                  : "cursor-pointer"
              }
              onClick={(e) => {
                e.preventDefault();
                if (currentPage < safeTotalPages) handlePageChange(currentPage + 1);
              }}
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
  className,
  showPageInfo,
}: {
  TOTAL_PAGES?: number;
  qryName?: string;
  className?: string;
  showPageInfo?: boolean;
}) {
  return (
    <Suspense fallback={<div className="h-8" />}>
      <MyPaginationSuspense
        TOTAL_PAGES={TOTAL_PAGES}
        qryName={qryName}
        className={className}
        showPageInfo={showPageInfo}
      />
    </Suspense>
  );
}
