import { type ReactNode } from 'react';
import { DEFAULT_PAGE_SIZE, PAGE_SIZE_OPTIONS } from '../../constants';

export interface Column<T> {
  key: string;
  header: string;
  sortable?: boolean;
  render?: (item: T) => ReactNode;
  className?: string;
  headerClassName?: string;
  width?: string;
}

interface ReusableDataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string;
  isLoading?: boolean;
  emptyMessage?: string;
  page?: number;
  pageSize?: number;
  total?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  onSort?: (key: string, order: 'asc' | 'desc') => void;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  searchQuery?: string;
  onSearch?: (query: string) => void;
  searchPlaceholder?: string;
  actions?: ReactNode;
  showPagination?: boolean;
  rowClassName?: (item: T) => string;
}

export function ReusableDataTable<T>({
  columns,
  data,
  keyExtractor,
  isLoading = false,
  emptyMessage = 'No data found',
  page = 1,
  pageSize = DEFAULT_PAGE_SIZE,
  total,
  onPageChange,
  onPageSizeChange,
  onSort,
  sortBy,
  sortOrder,
  searchQuery,
  onSearch,
  searchPlaceholder = 'Search...',
  actions,
  showPagination = true,
  rowClassName,
}: ReusableDataTableProps<T>) {
  const totalPages = total ? Math.ceil(total / pageSize) : 1;

  return (
    <section className="panel">
      <div className="panel-header">
        <div className="d-flex flex-wrap align-items-center gap-2">
          {onSearch && (
            <input
              className="form-control form-control-sm table-search"
              type="search"
              placeholder={searchPlaceholder}
              value={searchQuery || ''}
              onChange={(e) => onSearch(e.target.value)}
              aria-label={searchPlaceholder}
            />
          )}
        </div>
        {actions && <div className="d-flex flex-wrap gap-2">{actions}</div>}
      </div>

      <div className="table-responsive">
        <table className="table align-middle mb-0">
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  scope="col"
                  className={col.headerClassName}
                  style={{ width: col.width, cursor: col.sortable ? 'pointer' : undefined }}
                  onClick={() => {
                    if (col.sortable && onSort) {
                      const newOrder = sortBy === col.key && sortOrder === 'asc' ? 'desc' : 'asc';
                      onSort(col.key, newOrder);
                    }
                  }}
                >
                  <span className="d-flex align-items-center gap-1">
                    {col.header}
                    {col.sortable && sortBy === col.key && (
                      <i className={`bi bi-arrow-${sortOrder === 'asc' ? 'up' : 'down'} small`} />
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={columns.length} className="text-center py-5">
                  <div className="spinner-border spinner-border-sm text-primary me-2" role="status" />
                  <span className="text-muted">Loading data...</span>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="text-center text-muted py-5">
                  <i className="bi bi-inbox fs-3 d-block mb-2" />
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((item) => (
                <tr key={keyExtractor(item)} className={rowClassName?.(item)}>
                  {columns.map((col) => (
                    <td key={col.key} className={col.className}>
                      {col.render ? col.render(item) : String((item as Record<string, unknown>)[col.key] ?? '')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showPagination && total && onPageChange && (
        <div className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-3 mt-3">
          <div className="d-flex align-items-center gap-2">
            <small className="text-muted">
              Showing {((page - 1) * pageSize) + 1} to {Math.min(page * pageSize, total)} of {total}
            </small>
            {onPageSizeChange && (
              <select
                className="form-select form-select-sm"
                style={{ width: 'auto' }}
                value={pageSize}
                onChange={(e) => onPageSizeChange(Number(e.target.value))}
              >
                {PAGE_SIZE_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s} / page</option>
                ))}
              </select>
            )}
          </div>
          <nav aria-label="Table pagination">
            <ul className="pagination pagination-sm mb-0">
              <li className={`page-item ${page <= 1 ? 'disabled' : ''}`}>
                <button className="page-link" onClick={() => onPageChange(page - 1)} disabled={page <= 1}>Previous</button>
              </li>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <li key={p} className={`page-item ${p === page ? 'active' : ''}`}>
                  <button className="page-link" onClick={() => onPageChange(p)}>{p}</button>
                </li>
              ))}
              <li className={`page-item ${page >= totalPages ? 'disabled' : ''}`}>
                <button className="page-link" onClick={() => onPageChange(page + 1)} disabled={page >= totalPages}>Next</button>
              </li>
            </ul>
          </nav>
        </div>
      )}
    </section>
  );
}

// ============================================================================
// FilterableTable - Adds column-based filtering
// ============================================================================

interface FilterConfig {
  key: string;
  label: string;
  type: 'text' | 'select' | 'date';
  options?: { label: string; value: string }[];
}

interface FilterableTableProps<T> extends ReusableDataTableProps<T> {
  filters: FilterConfig[];
  filterValues: Record<string, string>;
  onFilterChange: (key: string, value: string) => void;
  onClearFilters: () => void;
}

export function FilterableTable<T>({
  filters,
  filterValues,
  onFilterChange,
  onClearFilters,
  ...tableProps
}: FilterableTableProps<T>) {
  const hasActiveFilters = Object.values(filterValues).some((v) => v !== '');

  return (
    <div>
      {filters.length > 0 && (
        <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
          {filters.map((filter) => (
            <div key={filter.key} className="d-flex align-items-center gap-1">
              <label className="form-label small fw-bold mb-0 text-nowrap">{filter.label}:</label>
              {filter.type === 'select' ? (
                <select
                  className="form-select form-select-sm"
                  style={{ width: 'auto' }}
                  value={filterValues[filter.key] || ''}
                  onChange={(e) => onFilterChange(filter.key, e.target.value)}
                >
                  <option value="">All</option>
                  {filter.options?.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              ) : (
                <input
                  type={filter.type === 'date' ? 'date' : 'text'}
                  className="form-control form-control-sm"
                  style={{ width: filter.type === 'date' ? 'auto' : '160px' }}
                  placeholder={`Filter by ${filter.label}`}
                  value={filterValues[filter.key] || ''}
                  onChange={(e) => onFilterChange(filter.key, e.target.value)}
                />
              )}
            </div>
          ))}
          {hasActiveFilters && (
            <button className="btn btn-sm btn-outline-secondary" onClick={onClearFilters}>
              <i className="bi bi-x-circle me-1" />Clear Filters
            </button>
          )}
        </div>
      )}
      <ReusableDataTable {...tableProps} />
    </div>
  );
}