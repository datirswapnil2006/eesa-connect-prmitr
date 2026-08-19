import React from "react";
import { Loader2, ChevronDown } from "lucide-react";

interface LoadMoreButtonProps {
  onClick: () => void;
  loading: boolean;
  hasMore: boolean;
  loadedCount: number;
  totalCount: number | null;
  /** Optional label override */
  label?: string;
}

/**
 * Styled "Load More" button with loading state and count display.
 * Automatically hides when there are no more items to load.
 */
export const LoadMoreButton: React.FC<LoadMoreButtonProps> = ({
  onClick,
  loading,
  hasMore,
  loadedCount,
  totalCount,
  label = "Load More",
}) => {
  if (!hasMore && !loading) return null;

  return (
    <div className="flex flex-col items-center gap-2 pt-6 pb-2">
      {totalCount !== null && totalCount > 0 && (
        <p className="text-xs text-slate-500 font-medium">
          Showing {loadedCount} of {totalCount}
        </p>
      )}

      <button
        type="button"
        onClick={onClick}
        disabled={loading}
        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary/10 text-primary text-sm font-semibold hover:bg-primary/20 disabled:opacity-60 disabled:cursor-not-allowed transition-all border border-primary/20 hover:border-primary/30"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Loading...
          </>
        ) : (
          <>
            <ChevronDown className="w-4 h-4" />
            {label}
          </>
        )}
      </button>
    </div>
  );
};

export default LoadMoreButton;
