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
        <div className="flex justify-center items-center gap-4 mt-8 mb-6">
            {/* Previous Button */}
            <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-large transition-all duration-300 ${
                    currentPage === 1
                        ? 'text-gray-600 bg-black/20 cursor-not-allowed border border-gray-800'
                        : 'text-gray-300 bg-black/40 border border-[#e3ec58]/20 hover:text-[#e3ec58] hover:bg-[#e3ec58]/10 hover:border-[#e3ec58]/60 hover:shadow-[0_0_10px_rgba(227,236,88,0.2)]'
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
                            <span className="px-2 py-2 text-gray-500 text-sm">...</span>
                        ) : (
                            <button
                                onClick={() => goToPage(page as number)}
                                className={`min-w-[40px] px-3 py-2 text-sm font-semibold rounded-large transition-all duration-300 ${
                                    page === currentPage
                                        ? 'bg-gradient-to-r from-[#9d9d39]/30 to-[#e3ec58]/30 text-[#e3ec58] border border-[#e3ec58]/80 shadow-[0_0_12px_rgba(227,236,88,0.4)]'
                                        : 'text-gray-300 bg-black/40 border border-[#e3ec58]/20 hover:text-[#e3ec58] hover:bg-[#e3ec58]/10 hover:border-[#e3ec58]/60 hover:shadow-[0_0_10px_rgba(227,236,88,0.2)]'
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
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-large transition-all duration-300 ${
                    (currentPage === totalPages || totalPages === 0)
                        ? 'text-gray-600 bg-black/20 cursor-not-allowed border border-gray-800'
                        : 'text-gray-300 bg-black/40 border border-[#e3ec58]/20 hover:text-[#e3ec58] hover:bg-[#e3ec58]/10 hover:border-[#e3ec58]/60 hover:shadow-[0_0_10px_rgba(227,236,88,0.2)]'
                }`}
            >
                Next
                <ChevronRight size={16} />
            </button>
        </div>
    )
}