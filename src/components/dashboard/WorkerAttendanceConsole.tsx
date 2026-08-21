import React, { useState, useMemo } from 'react';
import { MOCK_CHAINAGES } from '../../services/mockData';
import { Users, ShieldCheck, TrendingUp, TrendingDown, Clock, CheckCircle2, AlertTriangle, FileSpreadsheet, RotateCcw } from 'lucide-react';

interface WorkerAttendanceConsoleProps {
  selectedProject: string;
  selectedSite: string;
  selectedChainage: string;
  userRole?: string;
}

interface WorkerRecord {
  id: string;
  name: string;
  employeeId: string;
  designation: string;
  checkIn: string;
  checkOut: string;
  hoursWorked: number;
  status: 'present' | 'absent' | 'late' | 'leave';
  shift: 'General' | 'Night';
  ppeStatus: 'Passed' | 'Failed' | 'N/A';
}

const GENERIC_ROLES = [
  'Heavy Equipment Operator',
  'Welder',
  'Surveyor',
  'Concrete Mixer Operator',
  'Electrician',
  'Mason',
  'Helper',
  'Steel Fixer',
  'Bar Bender',
  'Rigging Foreman',
  'Safety Marshal'
];

const GENERIC_NAMES = [
  'Mohan Raj', 'Kumar Velu', 'Ravi Krishnan', 'Selvi Ammal', 'Venkatesh Rao',
  'Lakshmi Narayanan', 'Ganesh Pandian', 'Divya Bharathi', 'Muruganantham', 'Anitha Rani',
  'Rajesh Patel', 'Srinivas Rao', 'Karan Singh', 'Arjun Mehta', 'Vijay Kumar',
  'Sanjay Dutt', 'Aditya Sharma', 'Rahul Dravid', 'Sunil Gavaskar', 'Sachin Tendulkar',
  'Harbhajan Singh', 'Kapil Dev', 'Zaheer Khan', 'Anil Kumble', 'Mahendra Dhoni'
];

export const WorkerAttendanceConsole: React.FC<WorkerAttendanceConsoleProps> = ({
  selectedProject,
  selectedSite,
  selectedChainage,
  userRole = 'site_engineer',
}) => {
  const [activeTab, setActiveTab] = useState<'day' | 'week' | 'month' | 'year'>('day');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // 1. Compute Active Context and Counts
  const contextStats = useMemo(() => {
    // Filter chainages matching active dropdown filters
    const matchedChainages = MOCK_CHAINAGES.filter((ch) => {
      if (selectedProject && ch.project !== selectedProject) return false;
      if (selectedSite && ch.site !== selectedSite) return false;
      if (selectedChainage && ch.id !== selectedChainage) return false;
      return true;
    });

    const totalWorkers = matchedChainages.reduce((sum, ch) => sum + ch.workers, 0) || 280;

    // Deterministic attendance rate based on filters
    let seed = 0.942; // default
    if (selectedChainage) {
      // Create a pseudo-random seed from the chainage ID string
      const charSum = selectedChainage.split('').reduce((sum, c) => sum + c.charCodeAt(0), 0);
      seed = 0.90 + (charSum % 8) / 100; // 90% - 97%
    } else if (selectedSite) {
      const charSum = selectedSite.split('').reduce((sum, c) => sum + c.charCodeAt(0), 0);
      seed = 0.91 + (charSum % 7) / 100; // 91% - 97%
    } else if (selectedProject) {
      const charSum = selectedProject.split('').reduce((sum, c) => sum + c.charCodeAt(0), 0);
      seed = 0.92 + (charSum % 5) / 100; // 92% - 96%
    }

    const present = Math.round(totalWorkers * seed);
    const absent = Math.max(0, totalWorkers - present);
    const attendanceRate = totalWorkers > 0 ? (present / totalWorkers) * 100 : 0;

    // Shift breakdown
    const generalShift = Math.round(present * 0.65);
    const nightShift = present - generalShift;

    // Overtime
    const avgHours = 8.5 + (seed * 10 - 9) * 0.5; // around 8.5 to 9.0 hrs
    const totalHours = Math.round(present * avgHours);
    const overtimeHours = Math.max(0, totalHours - present * 8);

    // Wage and Budget for Project Manager
    const dailyWagePerWorker = 950; // INR
    const totalWageCost = present * dailyWagePerWorker;
    const budgetedWages = totalWorkers * dailyWagePerWorker * 0.95; // 95% target
    const variance = budgetedWages - totalWageCost;

    return {
      totalWorkers,
      present,
      absent,
      attendanceRate,
      generalShift,
      nightShift,
      avgHours,
      overtimeHours,
      totalWageCost,
      variance,
    };
  }, [selectedProject, selectedSite, selectedChainage]);

  // 2. Generate Deterministic Workers List for Daywise table
  const workerList = useMemo(() => {
    const list: WorkerRecord[] = [];
    const countToGenerate = Math.min(100, Math.max(10, Math.round(contextStats.totalWorkers * 0.1))); // generate 10% of total workers up to 100 max

    // Seed generation based on current selections
    const selectionKey = `${selectedProject}-${selectedSite}-${selectedChainage}`;
<<<<<<< HEAD
    const seed = selectionKey.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
=======
    let seed = selectionKey.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
>>>>>>> MS-ltfe-report

    for (let i = 0; i < countToGenerate; i++) {
      const nameIdx = (seed + i * 3) % GENERIC_NAMES.length;
      const roleIdx = (seed + i * 7) % GENERIC_ROLES.length;
      const name = GENERIC_NAMES[nameIdx];
      const designation = GENERIC_ROLES[roleIdx];
      const employeeId = `LT-${1000 + (seed % 1000) + i}`;

      // Status
      const statusSeed = (seed + i * 11) % 100;
      let status: 'present' | 'absent' | 'late' | 'leave' = 'present';
      if (statusSeed < 4) status = 'absent';
      else if (statusSeed < 8) status = 'leave';
      else if (statusSeed < 15) status = 'late';

      const shift = (seed + i * 17) % 2 === 0 ? 'General' : 'Night';
      const checkInHour = shift === 'General' ? 7 + (seed % 2) : 19 + (seed % 2);
      const checkInMin = (seed + i * 13) % 60;
      const checkIn = status === 'present' || status === 'late'
        ? `${checkInHour}:${checkInMin < 10 ? '0' : ''}${checkInMin} ${checkInHour < 12 || checkInHour >= 24 ? 'AM' : 'PM'}`
        : '--';

      const checkOutHour = shift === 'General' ? 16 + (seed % 3) : 4 + (seed % 3);
      const checkOutMin = (seed + i * 19) % 60;
      const checkOut = status === 'present'
        ? `${checkOutHour > 12 ? checkOutHour - 12 : checkOutHour}:${checkOutMin < 10 ? '0' : ''}${checkOutMin} ${checkOutHour < 12 || checkOutHour >= 24 ? 'AM' : 'PM'}`
        : '--';

      const hoursWorked = status === 'present' ? 8 + (seed % 3) : status === 'late' ? 6 + (seed % 2) : 0;
      const ppeSeed = (seed + i * 23) % 100;
      const ppeStatus = status === 'present' || status === 'late'
        ? (ppeSeed < 6 ? 'Failed' as const : 'Passed' as const)
        : 'N/A' as const;

      list.push({
        id: `w-${i}`,
        name,
        employeeId,
        designation,
        checkIn,
        checkOut,
        hoursWorked,
        status,
        shift,
        ppeStatus,
      });
    }

    return list;
  }, [selectedProject, selectedSite, selectedChainage, contextStats.totalWorkers]);

  // Filtered workers list
  const filteredWorkers = useMemo(() => {
    return workerList.filter((w) => {
      const matchesSearch = w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.designation.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || w.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [workerList, searchQuery, statusFilter]);

  // 3. Trends data for charts based on tabs
  const trendData = useMemo(() => {
    // We deterministically shift baseline values using a hash from project, site, and chainage
    const key = `${selectedProject}-${selectedSite}-${selectedChainage}`;
    const hash = key.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 6;

    if (activeTab === 'week') {
      const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      const base = [94.2, 95.0, 93.6, 95.8, 94.1, 92.5, 38.0];
      return weekdays.map((day, idx) => {
        let val = base[idx];
        if (idx < 6) val = Math.min(100, Math.max(82, val + (hash - 3) * 0.8));
        return { label: day, rate: val, count: Math.round(contextStats.totalWorkers * (val / 100)) };
      });
    }

    if (activeTab === 'month') {
      const weeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5'];
      const base = [93.1, 94.5, 95.2, 92.8, 94.0];
      return weeks.map((wk, idx) => {
        const val = Math.min(100, Math.max(85, base[idx] + (hash - 2) * 0.6));
        return { label: wk, rate: val, count: Math.round(contextStats.totalWorkers * (val / 100)) };
      });
    }

    if (activeTab === 'year') {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const base = [92.0, 93.5, 94.1, 94.8, 92.2, 91.0, 93.0, 94.2, 94.9, 93.8, 94.5, 95.2];
      return months.map((m, idx) => {
        const val = Math.min(100, Math.max(88, base[idx] + (hash - 3) * 0.5));
        return { label: m, rate: val, count: Math.round(contextStats.totalWorkers * (val / 100)) };
      });
    }

    return [];
  }, [activeTab, selectedProject, selectedSite, selectedChainage, contextStats.totalWorkers]);

  // Max value in trends for scaling chart
  const maxTrendVal = useMemo(() => {
    if (trendData.length === 0) return 100;
    return Math.max(...trendData.map((t) => t.rate));
  }, [trendData]);

  // 4. Role-based view titles & layouts
  const isSE = userRole === 'site_engineer';

  const handleReset = () => {
    setSearchQuery('');
    setStatusFilter('all');
  };

  return (
    <div className="col-12 col-lg-6">
      <div className="card border-0 shadow-sm p-3 bg-white h-100 d-flex flex-column" style={{ minHeight: '420px', borderRadius: '12px' }}>
        {/* Header */}
        <div className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between mb-3 border-bottom pb-2 gap-2">
          <div className="d-flex align-items-center gap-2">
            <Users className="text-primary" size={20} />
            <div>
              <h3 className="h6 mb-0 fw-bold">Worker Attendance Console</h3>
              <small className="text-muted" style={{ fontSize: '11px' }}>
                {selectedChainage ? `Chainage: ${selectedChainage}` : selectedSite ? `Site: ${selectedSite}` : selectedProject ? `Project: ${selectedProject}` : 'Enterprise Wide'}
              </small>
            </div>
          </div>
          {/* Day / Week / Month / Year Tabs */}
          <div className="btn-group shadow-xs rounded bg-light p-0.5" style={{ padding: '2px' }}>
            {(['day', 'week', 'month', 'year'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                className={`btn btn-xs py-1 px-2 border-0 rounded capitalize ${activeTab === tab ? 'btn-primary shadow-sm' : 'btn-link text-secondary'}`}
                style={{ fontSize: '10.5px', textTransform: 'capitalize' }}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="row g-2 mb-3">
          {/* Attendance Rate */}
          <div className="col-6 col-sm-3">
            <div className="p-2 border rounded bg-light-subtle h-100">
              <div className="text-muted small" style={{ fontSize: '10.5px' }}>Attendance Rate</div>
              <div className="h5 fw-bold my-1 text-primary">{contextStats.attendanceRate.toFixed(1)}%</div>
              <span className={`small fw-semibold d-flex align-items-center gap-1.5 ${contextStats.attendanceRate >= 94 ? 'text-success' : 'text-warning'}`} style={{ fontSize: '10px' }}>
                {contextStats.attendanceRate >= 94 ? <CheckCircle2 size={12} /> : <AlertTriangle size={12} />}
                {contextStats.attendanceRate >= 94 ? 'Optimal' : 'Attention'}
              </span>
            </div>
          </div>
          {/* Present */}
          <div className="col-6 col-sm-3">
            <div className="p-2 border rounded bg-light-subtle h-100">
              <div className="text-muted small" style={{ fontSize: '10.5px' }}>Active Present</div>
              <div className="h5 fw-bold my-1 text-success">{contextStats.present} <span className="text-muted small" style={{ fontSize: '11px' }}>/ {contextStats.totalWorkers}</span></div>
              <span className="text-muted small" style={{ fontSize: '10px' }}>Workers checked in</span>
            </div>
          </div>
          {/* Absent */}
          <div className="col-6 col-sm-3">
            <div className="p-2 border rounded bg-light-subtle h-100">
              <div className="text-muted small" style={{ fontSize: '10.5px' }}>Absent / Leave</div>
              <div className="h5 fw-bold my-1 text-danger">{contextStats.absent}</div>
              <span className="text-muted small" style={{ fontSize: '10px' }}>Not active today</span>
            </div>
          </div>
          {/* Overtime card */}
          <div className="col-6 col-sm-3">
            <div className="p-2 border rounded bg-light-subtle h-100">
              <div className="text-muted small" style={{ fontSize: '10.5px' }}>Overtime Recorded</div>
              <div className="h5 fw-bold my-1 text-warning">+{contextStats.overtimeHours} hrs</div>
              <span className="text-muted small" style={{ fontSize: '10px' }}>Avg shift: {contextStats.avgHours.toFixed(1)} hrs</span>
            </div>
          </div>
        </div>

        {/* Tab Contents */}
        <div className="flex-grow-1 d-flex flex-column justify-content-start overflow-hidden">
          {activeTab === 'day' ? (
            <div className="d-flex flex-column flex-grow-1 overflow-hidden">
              {/* Daywise Details Bar */}
              <div className="d-flex flex-wrap gap-2 justify-content-between align-items-center mb-2">
                <div className="d-flex gap-2 align-items-center">
                  <span className="badge bg-primary-subtle text-primary border px-2 py-1">
                    General Shift: {contextStats.generalShift}
                  </span>
                  <span className="badge bg-dark-subtle text-dark border px-2 py-1">
                    Night Shift: {contextStats.nightShift}
                  </span>
                </div>
                <div className="d-flex align-items-center gap-1.5 col-12 col-sm-auto">
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="Search worker..."
                    style={{ fontSize: '11px', height: '26px', maxWidth: '140px' }}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <select
                    className="form-select form-select-sm"
                    style={{ fontSize: '11px', height: '26px', width: '90px' }}
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="all">All</option>
                    <option value="present">Present</option>
                    <option value="late">Late</option>
                    <option value="absent">Absent</option>
                    <option value="leave">Leave</option>
                  </select>
                  <div className="d-flex align-items-center gap-1.5 col-12 col-sm-auto">
                    <button className="btn btn-outline-primary btn-sm d-flex align-items-center gap-1" onClick={handleReset} style={{ fontSize: '11px', height: '26px' }}>
                      <RotateCcw size={12} />
                      Reset
                    </button>
                  </div>
                </div>

              </div>

              {/* Workers Table */}
              <div className="table-responsive flex-grow-1 pe-1 border rounded bg-light-subtle" style={{ maxHeight: '210px', overflowY: 'auto' }}>
                <table className="table table-sm table-hover align-middle mb-0" style={{ fontSize: '11.5px' }}>
                  <thead className="sticky-top" style={{ zIndex: 10 }}>
                    <tr>
                      <th className="py-1.5 ps-2" style={{ position: 'sticky', top: 0, zIndex: 10, backgroundColor: 'var(--admin-surface-soft)' }}>Worker / ID</th>
                      <th className="py-1.5" style={{ position: 'sticky', top: 0, zIndex: 10, backgroundColor: 'var(--admin-surface-soft)' }}>Role</th>
                      <th className="py-1.5 text-center" style={{ position: 'sticky', top: 0, zIndex: 10, backgroundColor: 'var(--admin-surface-soft)' }}>Shift</th>
                      <th className="py-1.5 text-center" style={{ position: 'sticky', top: 0, zIndex: 10, backgroundColor: 'var(--admin-surface-soft)' }}>Check-In/Out</th>
                      <th className="py-1.5 text-center" style={{ position: 'sticky', top: 0, zIndex: 10, backgroundColor: 'var(--admin-surface-soft)' }}>Hours</th>
                      <th className="py-1.5 text-end pe-2" style={{ position: 'sticky', top: 0, zIndex: 10, backgroundColor: 'var(--admin-surface-soft)' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredWorkers.length > 0 ? (
                      filteredWorkers.map((w) => (
                        <tr key={w.id}>
                          <td className="py-1.5 ps-2">
                            <div className="fw-semibold text-dark">{w.name}</div>
                            <small className="text-muted font-monospace">{w.employeeId}</small>
                          </td>
                          <td className="py-1.5 text-muted">{w.designation}</td>
                          <td className="py-1.5 text-center">
                            <span className={`badge ${w.shift === 'General' ? 'text-primary' : 'text-warning'} bg-light border-0 p-0`}>
                              {w.shift}
                            </span>
                          </td>
                          <td className="py-1.5 text-center text-muted">
                            <div>{w.checkIn}</div>
                            <small style={{ fontSize: '9px' }}>{w.checkOut}</small>
                          </td>
                          <td className="py-1.5 text-center font-monospace fw-semibold">{w.hoursWorked > 0 ? `${w.hoursWorked}h` : '-'}</td>
                          <td className="py-1.5 text-end pe-2">
                            <span
                              className={`badge ${w.status === 'present'
                                ? 'bg-success-subtle text-success border border-success-subtle'
                                : w.status === 'late'
                                  ? 'bg-warning-subtle text-warning border border-warning-subtle'
                                  : 'bg-danger-subtle text-danger border border-danger-subtle'
                                } px-1.5 py-0.5`}
                              style={{ fontSize: '9.5px' }}
                            >
                              {w.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="text-center py-4 text-muted">
                          No workers match search filter.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            // Weekly / Monthly / Yearly Chart View
            <div className="d-flex flex-column flex-grow-1 overflow-hidden justify-content-between">
              {/* Custom SVG/CSS Bar Chart for Trends */}
              <div className="my-2 border rounded p-3 bg-light-subtle d-flex flex-column justify-content-between" style={{ minHeight: '170px' }}>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="small fw-semibold text-secondary">Workforce Attendance Trend (% Present)</span>
                  <span className="badge bg-primary text-white font-monospace">Avg: {contextStats.attendanceRate.toFixed(1)}%</span>
                </div>

                {/* Bars Row */}
                <div className="d-flex align-items-end justify-content-around h-100 pt-3" style={{ height: '120px' }}>
                  {trendData.map((t, idx) => {
                    const heightPercent = Math.max(10, Math.min(100, (t.rate / maxTrendVal) * 100));
                    return (
                      <div key={idx} className="d-flex flex-column align-items-center flex-grow-1" style={{ maxWidth: '45px' }}>
                        {/* Tooltip on hover */}
                        <div className="position-relative w-100 d-flex justify-content-center trend-bar-container">
                          <span className="badge bg-dark text-white position-absolute px-1" style={{ fontSize: '9px', top: '-24px', opacity: 0, transition: 'opacity 0.15s ease', zIndex: 10 }}>
                            {t.rate.toFixed(1)}%
                          </span>
                          <div
                            className="bg-primary rounded-top cursor-pointer w-75 hover-opacity-75"
                            style={{
                              height: `${heightPercent}px`,
                              backgroundColor: t.rate >= 94 ? '#2563eb' : t.rate >= 90 ? '#d97706' : '#dc2626',
                              transition: 'height 0.3s ease',
                              opacity: 0.85
                            }}
                            title={`${t.label}: ${t.rate.toFixed(1)}% (${t.count} workers)`}
                          />
                        </div>
                        <span className="text-muted mt-1.5" style={{ fontSize: '10px', fontWeight: 600 }}>{t.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Summary table for non-daily trends */}
              <div className="d-flex gap-2 justify-content-between p-2.5 rounded border bg-light-subtle small mt-1" style={{ fontSize: '11px' }}>
                <div className="d-flex align-items-center gap-1.5">
                  <TrendingUp size={12} className="text-success" />
                  <span><strong>Peak:</strong> {maxTrendVal.toFixed(1)}%</span>
                </div>
                <div className="d-flex align-items-center gap-1.5">
                  <TrendingDown size={12} className="text-danger" />
                  <span><strong>Lowest:</strong> {Math.min(...trendData.map(t => t.rate)).toFixed(1)}%</span>
                </div>
                <div className="d-flex align-items-center gap-1.5">
                  <Clock size={12} className="text-secondary" />
                  <span><strong>Scope:</strong> {activeTab === 'week' ? 'Last 7 Days' : activeTab === 'month' ? '5 Weeks' : '12 Months'}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Role Specific Details Section (Box Footer area inside Card) */}
        <div className="border-top mt-3 pt-2">
          {isSE ? (
            <div className="d-flex flex-wrap gap-2 justify-content-between align-items-center">
              <div className="text-muted d-flex align-items-center gap-1.5" style={{ fontSize: '11px' }}>
                <CheckCircle2 size={12} className="text-success" />
                <span>Toolbox Safety Induction Talk: <strong className="text-dark">Completed (100% Attended)</strong></span>
              </div>
              <button
                className="btn btn-xs btn-outline-primary py-0.5 px-2 d-flex align-items-center gap-1"
                style={{ fontSize: '10px' }}
                onClick={() => alert('Exporting Roster / Shift report...')}
              >
                <FileSpreadsheet size={12} /> Export Roster
              </button>
            </div>
          ) : (
            // Safety Manager / Supervisor / Project Manager View
            <div className="d-flex align-items-center justify-content-between bg-warning-subtle rounded p-2 border border-warning-subtle border-dashed">
              <div className="d-flex align-items-center gap-2">
                <ShieldCheck className="text-warning" size={20} />
                <div>
                  <div className="fw-bold text-dark" style={{ fontSize: '12px' }}>PPE & Safety Roster Checks</div>
                  <div className="text-muted" style={{ fontSize: '10.5px' }}>AI integration checking for boots, helmet, vest</div>
                </div>
              </div>
              <div className="text-end">
                <span className="badge bg-warning text-dark font-monospace" style={{ fontSize: '10.5px' }}>98.2% Pass</span>
                <div className="text-muted" style={{ fontSize: '9.5px' }}>Active verification</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Styled custom tooltip style */}
      <style>{`
        .trend-bar-container:hover span {
          opacity: 1 !important;
          top: -28px !important;
        }
      `}</style>
    </div>
  );
};
