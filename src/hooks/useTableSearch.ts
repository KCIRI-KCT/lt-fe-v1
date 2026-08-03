import { useState, useCallback, useMemo } from 'react';

/**
 * Custom hook for filtering data by a search query.
 * Replaces the original DOM-based table search.
 */
export function useTableSearch<T>(data: T[], searchFields: (keyof T)[]) {
  const [query, setQuery] = useState('');

  const filteredData = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return data;
    return data.filter((item) =>
      searchFields.some((field) => {
        const val = item[field];
        return String(val ?? '').toLowerCase().includes(q);
      })
    );
  }, [data, query, searchFields]);

  const handleSearch = useCallback((value: string) => {
    setQuery(value);
  }, []);

  return { query, filteredData, handleSearch, setQuery };
}