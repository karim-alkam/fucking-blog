"use client"

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems?: number;
  pageSize?: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  // Generate page numbers
  const getPageNumbers = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
        range.push(i);
      }
    }

    let l;
    for (const i of range) {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push('...');
        }
      }
      rangeWithDots.push(i);
      l = i;
    }
    return rangeWithDots;
  };

  return (
    <div className="flex justify-center items-center space-x-3 font-sans mt-16">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-5 py-2 text-sm border border-brass/30 text-starlight/80 disabled:opacity-20 disabled:cursor-not-allowed hover:bg-brass/10 hover:border-brass hover:text-brass transition-all duration-300 rounded-sm uppercase tracking-widest"
      >
        Previous
      </button>

      <div className="flex space-x-1.5 md:space-x-2">
        {getPageNumbers().map((page, index) => (
          <button
            key={index}
            onClick={() => typeof page === 'number' ? onPageChange(page) : null}
            disabled={page === '...'}
            className={`w-10 h-10 flex items-center justify-center text-sm border transition-all duration-300 rounded-sm ${page === currentPage
              ? 'border-brass bg-brass/20 text-brass font-medium shadow-[0_0_15px_rgba(197,168,105,0.2)]'
              : page === '...'
                ? 'border-transparent text-starlight/40 cursor-default'
                : 'border-brass/20 text-starlight/60 hover:text-brass hover:border-brass/60'
              }`}
          >
            {page}
          </button>
        ))}
      </div>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-5 py-2 text-sm border border-brass/30 text-starlight/80 disabled:opacity-20 disabled:cursor-not-allowed hover:bg-brass/10 hover:border-brass hover:text-brass transition-all duration-300 rounded-sm uppercase tracking-widest"
      >
        Next
      </button>
    </div>
  );
}