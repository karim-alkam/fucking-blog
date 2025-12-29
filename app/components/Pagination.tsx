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
    <div className="flex justify-center items-center space-x-2 font-mono">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-4 py-2 text-sm border border-cyber-gray text-cyber-neon-cyan disabled:opacity-30 disabled:cursor-not-allowed hover:bg-cyber-neon-cyan/10 hover:border-cyber-neon-cyan transition-all"
      >
        &lt; PREV
      </button>

      <div className="flex space-x-1">
        {getPageNumbers().map((page, index) => (
          <button
            key={index}
            onClick={() => typeof page === 'number' ? onPageChange(page) : null}
            disabled={page === '...'}
            className={`w-10 h-10 flex items-center justify-center text-sm border transition-all ${page === currentPage
              ? 'border-cyber-neon-yellow bg-cyber-neon-yellow text-cyber-black font-bold'
              : page === '...'
                ? 'border-transparent text-gray-500 cursor-default'
                : 'border-cyber-gray text-gray-400 hover:text-cyber-neon-cyan hover:border-cyber-neon-cyan'
              }`}
          >
            {page}
          </button>
        ))}
      </div>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-4 py-2 text-sm border border-cyber-gray text-cyber-neon-cyan disabled:opacity-30 disabled:cursor-not-allowed hover:bg-cyber-neon-cyan/10 hover:border-cyber-neon-cyan transition-all"
      >
        NEXT &gt;
      </button>
    </div>
  );
}