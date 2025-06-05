'use client'
import { useSearchParams, useRouter } from "next/navigation"
import { ChevronLeft, ChevronRight } from "lucide-react"

export const Pagination = ({ currentPage, totalPages }: {
  currentPage: number,
  totalPages: number
}) => {
    const router = useRouter();
    const searchParams = useSearchParams()
    
    const goToPage = (page: number) => {
        const params = new URLSearchParams(searchParams.toString())
        params.set('page', page.toString())
        router.push(`?${params.toString()}`)
    }

    console.log({currentPage, totalPages})

    // Generate page numbers to display
    const getPageNumbers = () => {
        const pages = [];
        const showEllipsis = totalPages > 7;
        
        if (!showEllipsis) {
            // Show all pages if total is 7 or less
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            // Complex logic for ellipsis
            if (currentPage <= 4) {
                // Show first 5 pages, then ellipsis, then last page
                for (let i = 1; i <= 5; i++) {
                    pages.push(i);
                }
                pages.push('...');
                pages.push(totalPages);
            } else if (currentPage >= totalPages - 3) {
                // Show first page, ellipsis, then last 5 pages
                pages.push(1);
                pages.push('...');
                for (let i = totalPages - 4; i <= totalPages; i++) {
                    pages.push(i);
                }
            } else {
                // Show first page, ellipsis, current page area, ellipsis, last page
                pages.push(1);
                pages.push('...');
                for (let i = currentPage - 1; i <= currentPage + 1; i++) {
                    pages.push(i);
                }
                pages.push('...');
                pages.push(totalPages);
            }
        }
        
        return pages;
    }

    const pageNumbers = getPageNumbers();

    return (
        <div className="flex justify-center items-center gap-4 mt-6 mb-4">
            {/* Previous Button */}
            <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    currentPage === 1
                        ? 'text-gray-500 cursor-not-allowed'
                        : 'text-gray-300 hover:text-dark-golden hover:bg-[#484848] hover:bg-opacity-25 hover:rounded-large'
                }`}
            >
                <ChevronLeft size={16} />
                Prev
            </button>

            {/* Page Numbers */}
            <div className="flex items-center gap-2">
                {pageNumbers.map((page, index) => (
                    <div key={index}>
                        {page === '...' ? (
                            <span className="px- py-2 text-gray-300 text-sm">...</span>
                        ) : (
                            <button
                                onClick={() => goToPage(page as number)}
                                className={`min-w-[40px] px-3 py-2 text-medium font-medium rounded-large transition-colors ${
                                    page === currentPage
                                        ? 'bg-[#484848] text-dark-golden border border-white'
                                        : 'text-gray-300 hover:text-dark-golden hover:bg-[#484848] hover:bg-opacity-25 hover:rounded-large'
                                }`}
                            >
                                {page}
                            </button>
                        )}
                    </div>
                ))}
            </div>

            {/* Next Button */}
            <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    (currentPage === totalPages || totalPages === 0)
                        ? 'text-gray-500 cursor-not-allowed'
                        : 'text-gray-300 hover:text-dark-golden hover:bg-[#484848] hover:bg-opacity-25 hover:rounded-large'
                }`}
            >
                Next
                <ChevronRight size={16} />
            </button>
        </div>
    )
}