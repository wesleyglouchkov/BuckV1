"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useScrollToTop } from "@/hooks/use-scroll-to-top";

interface PaginationProps {
    currentPage: number;
    totalItems: number;
    itemsPerPage: number;
    onPageChange: (page: number) => void;
}

export default function Pagination({
    currentPage,
    totalItems,
    itemsPerPage,
    onPageChange
}: PaginationProps) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    // Automatically scroll to top when page changes
    useScrollToTop(currentPage);

    if (totalPages <= 1) return null;

    // Generate page numbers to show
    const getPageNumbers = () => {
        const pages = [];
        const roomsToShow = 2; // Show 2 pages before and after current

        for (let i = 1; i <= totalPages; i++) {
            if (
                i === 1 ||
                i === totalPages ||
                (i >= currentPage - roomsToShow && i <= currentPage + roomsToShow)
            ) {
                pages.push(i);
            } else if (
                i === currentPage - roomsToShow - 1 ||
                i === currentPage + roomsToShow + 1
            ) {
                pages.push("...");
            }
        }
        return [...new Set(pages)];
    };

    return (
        <div className="flex items-center justify-center gap-2 mt-12 pb-8">
            <Button
                variant="outline"
                size="icon"
                onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="square-edges"
            >
                <ChevronLeft className="w-4 h-4" />
            </Button>

            <div className="flex items-center gap-1">
                {getPageNumbers().map((page, index) => (
                    page === "..." ? (
                        <span key={`dots-${index}`} className="px-2 text-muted-foreground">...</span>
                    ) : (
                        <Button
                            key={`page-${page}`}
                            variant={currentPage === page ? "default" : "outline"}
                            size="sm"
                            onClick={() => onPageChange(page as number)}
                            className={`min-w-[36px] square-edges ${currentPage === page ? "bg-primary text-primary-foreground" : ""}`}
                        >
                            {page}
                        </Button>
                    )
                ))}
            </div>

            <Button
                variant="outline"
                size="icon"
                onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="square-edges"
            >
                <ChevronRight className="w-4 h-4" />
            </Button>
        </div>
    );
}
