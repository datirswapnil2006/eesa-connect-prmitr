import { useState, useCallback, useRef } from "react";

interface PaginationResult<T> {
  /** Currently loaded items (accumulated across pages) */
  items: T[];
  /** Whether a fetch is currently in progress */
  loading: boolean;
  /** Whether there are more items to load */
  hasMore: boolean;
  /** Total count of items (if available from the API) */
  totalCount: number | null;
  /** Load the next page of items */
  loadMore: () => Promise<void>;
  /** Reset to initial state and reload first page */
  reset: () => Promise<void>;
  /** Whether the initial load has completed */
  initialLoadDone: boolean;
}

type FetchFn<T> = (
  page: number,
  pageSize: number
) => Promise<{ data: T[]; count: number | null }>;

/**
 * Reusable pagination hook for "Load More" style pagination.
 *
 * Usage:
 * ```tsx
 * const fetchPage = async (page, pageSize) => {
 *   const from = page * pageSize;
 *   const to = from + pageSize - 1;
 *   const { data, count } = await supabase.from("table").select("*", { count: "exact" }).range(from, to);
 *   return { data: data || [], count };
 * };
 *
 * const { items, loading, hasMore, loadMore, reset } = usePagination(fetchPage, 12);
 * ```
 */
export function usePagination<T>(
  fetchFn: FetchFn<T>,
  pageSize: number = 12
): PaginationResult<T> {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState<number | null>(null);
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  const pageRef = useRef(0);

  const loadMore = useCallback(async () => {
    if (loading) return;

    try {
      setLoading(true);
      const { data, count } = await fetchFn(pageRef.current, pageSize);

      if (count !== null && count !== undefined) {
        setTotalCount(count);
      }

      setItems((prev) => [...prev, ...data]);

      // If we got fewer items than pageSize, there are no more
      if (data.length < pageSize) {
        setHasMore(false);
      } else if (count !== null && count !== undefined) {
        // Check if we've loaded everything based on count
        const totalLoaded =
          pageRef.current * pageSize + data.length;
        setHasMore(totalLoaded < count);
      }

      pageRef.current += 1;
    } catch (err) {
      console.error("Pagination fetch error:", err);
      setHasMore(false);
    } finally {
      setLoading(false);
      setInitialLoadDone(true);
    }
  }, [fetchFn, pageSize, loading]);

  const reset = useCallback(async () => {
    pageRef.current = 0;
    setItems([]);
    setHasMore(true);
    setTotalCount(null);
    setInitialLoadDone(false);

    try {
      setLoading(true);
      const { data, count } = await fetchFn(0, pageSize);

      if (count !== null && count !== undefined) {
        setTotalCount(count);
      }

      setItems(data);

      if (data.length < pageSize) {
        setHasMore(false);
      } else if (count !== null && count !== undefined) {
        setHasMore(data.length < count);
      }

      pageRef.current = 1;
    } catch (err) {
      console.error("Pagination reset error:", err);
      setHasMore(false);
    } finally {
      setLoading(false);
      setInitialLoadDone(true);
    }
  }, [fetchFn, pageSize]);

  return { items, loading, hasMore, totalCount, loadMore, reset, initialLoadDone };
}

export default usePagination;
