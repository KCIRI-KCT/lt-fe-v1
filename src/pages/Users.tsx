import { useState, useEffect } from 'react';
import { FilterableTable, type Column } from '../components/tables/ReusableDataTable';
import { employeeService } from '../services/employeeService';
import type { UserProfile } from '../types';
import { ROLE_LABELS, ROLE_COLORS, ROLE_OPTIONS } from '../constants';

const columns: Column<UserProfile>[] = [
  { key: 'name', header: 'User', sortable: true, render: (u) => (
    <div className="d-flex align-items-center gap-2">
      <img className="avatar-img avatar-sm" src={u.avatar} alt={u.name} />
      <span className="fw-semibold">{u.name}</span>
    </div>
  )},
  { key: 'email', header: 'Email ID', sortable: true },
  { key: 'employeeId', header: 'Employee ID', sortable: true, render: (u) => u.employeeId || 'N/A' },
  { key: 'role', header: 'Role', sortable: true, render: (u) => <span className={`badge ${ROLE_COLORS[u.role] || 'text-bg-secondary'}`}>{ROLE_LABELS[u.role]}</span> },
  { key: 'joiningDate', header: 'Joining Date', sortable: true, render: (u) => u.joiningDate || u.joinedAt || 'N/A' },
  { key: 'address', header: 'Address', sortable: true, render: (u) => u.address || u.location || 'N/A' },
];

export const Users = () => {
  const [usersList, setUsersList] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<string>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [filterValues, setFilterValues] = useState<Record<string, string>>({
    role: '',
    location: '',
    startDate: '',
    endDate: '',
  });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  useEffect(() => {
    let isMounted = true;
    employeeService.getEmployees()
      .then((data) => {
        if (isMounted) setUsersList(data);
      })
      .catch(() => {
        if (isMounted) setUsersList([]);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => { isMounted = false; };
  }, []);

  const handleFilterChange = (key: string, value: string) => {
    setFilterValues((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const handleClearFilters = () => {
    setFilterValues({
      role: '',
      location: '',
      startDate: '',
      endDate: '',
    });
    setPage(1);
  };

  const handleSort = (key: string, order: 'asc' | 'desc') => {
    setSortBy(key);
    setSortOrder(order);
  };

  const filters = [
    {
      key: 'role',
      label: 'Role',
      type: 'select' as const,
      options: ROLE_OPTIONS,
    },
    {
      key: 'location',
      label: 'Location',
      type: 'text' as const,
    },
    {
      key: 'startDate',
      label: 'Joining From',
      type: 'date' as const,
    },
    {
      key: 'endDate',
      label: 'Joining To',
      type: 'date' as const,
    },
  ];

  const filtered = usersList.filter((u) => {
    const matchesSearch = !search ||
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.employeeId && u.employeeId.toLowerCase().includes(search.toLowerCase())) ||
      (u.address && u.address.toLowerCase().includes(search.toLowerCase()));

    const matchesRole = !filterValues.role || u.role === filterValues.role;

    const userLocation = (u.address || u.location || '').toLowerCase();
    const matchesLocation = !filterValues.location || userLocation.includes(filterValues.location.toLowerCase());

    const userJoiningStr = u.joiningDate || u.joinedAt;
    let matchesDate = true;
    if (userJoiningStr) {
      const userDate = new Date(userJoiningStr);
      if (filterValues.startDate) {
        const start = new Date(filterValues.startDate);
        if (userDate < start) matchesDate = false;
      }
      if (filterValues.endDate) {
        const end = new Date(filterValues.endDate);
        end.setHours(23, 59, 59, 999);
        if (userDate > end) matchesDate = false;
      }
    } else if (filterValues.startDate || filterValues.endDate) {
      matchesDate = false;
    }

    return matchesSearch && matchesRole && matchesLocation && matchesDate;
  });

  const sorted = [...filtered].sort((a, b) => {
    let valA = a[sortBy as keyof UserProfile] || '';
    let valB = b[sortBy as keyof UserProfile] || '';

    if (typeof valA === 'string') valA = valA.toLowerCase();
    if (typeof valB === 'string') valB = valB.toLowerCase();

    if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
    if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const sliced = sorted.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="container-fluid px-3 px-lg-4 py-4">
      <div className="page-heading">
        <div className="page-heading-copy">
          <span className="page-icon"><i className="bi bi-people" aria-hidden="true" /></span>
          <div>
            <p className="eyebrow mb-1">Management</p>
            <h1 className="h3 mb-0">User Management</h1>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading users...</span>
          </div>
        </div>
      ) : (
        <FilterableTable
          columns={columns}
          data={sliced}
          keyExtractor={(u) => u.id}
          searchQuery={search}
          onSearch={(q) => { setSearch(q); setPage(1); }}
          searchPlaceholder="Search by name, email, employee id..."
          total={sorted.length}
          filters={filters}
          filterValues={filterValues}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSort={handleSort}
          page={page}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          showPagination={true}
        />
      )}
    </div>
  );
};