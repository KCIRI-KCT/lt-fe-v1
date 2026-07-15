interface AttendanceChartProps {
  title?: string;
  present?: number;
  absent?: number;
  late?: number;
  halfDay?: number;
  onLeave?: number;
  className?: string;
}

export const AttendanceChart = ({
  title = 'Attendance Summary',
  present = 0,
  absent = 0,
  late = 0,
  halfDay = 0,
  onLeave = 0,
  className = '',
}: AttendanceChartProps) => {
  const total = present + absent + late + halfDay + onLeave;
  const safe = (val: number) => (total === 0 ? 0 : val);

  return (
    <div className={`panel ${className}`}>
      <div className="panel-header">
        <div>
          <h2 className="h5 mb-1 section-title">
            <i className="bi bi-clipboard-check" aria-hidden="true" />
            <span>{title}</span>
          </h2>
          <p className="text-muted mb-0">Daily workforce attendance breakdown</p>
        </div>
      </div>

      {total === 0 ? (
        <div className="text-center py-4 text-muted">No attendance data available</div>
      ) : (
        <div className="d-grid gap-3">
          <div className="d-flex justify-content-between align-items-center">
            <span>Present</span>
            <span className="fw-bold text-success">{present} ({((safe(present) / total) * 100).toFixed(1)}%)</span>
          </div>
          <div className="d-flex justify-content-between align-items-center">
            <span>Absent</span>
            <span className="fw-bold text-danger">{absent} ({((safe(absent) / total) * 100).toFixed(1)}%)</span>
          </div>
          <div className="d-flex justify-content-between align-items-center">
            <span>Late</span>
            <span className="fw-bold text-warning">{late} ({((safe(late) / total) * 100).toFixed(1)}%)</span>
          </div>
          <div className="d-flex justify-content-between align-items-center">
            <span>Half Day</span>
            <span className="fw-bold text-info">{halfDay} ({((safe(halfDay) / total) * 100).toFixed(1)}%)</span>
          </div>
          <div className="d-flex justify-content-between align-items-center">
            <span>On Leave</span>
            <span className="fw-bold text-secondary">{onLeave} ({((safe(onLeave) / total) * 100).toFixed(1)}%)</span>
          </div>
          <hr />
          <div className="d-flex justify-content-between fw-bold">
            <span>Total Workers</span>
            <span>{total}</span>
          </div>
        </div>
      )}
    </div>
  );
};