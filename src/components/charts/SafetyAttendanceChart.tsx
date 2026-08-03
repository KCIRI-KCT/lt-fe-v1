interface DataPoint {
  month: string;
  safety: number;
  attendance: number;
}

interface SafetyAttendanceChartProps {
  data: DataPoint[];
  className?: string;
}

const W = 440;
const H = 180;
const PAD = { top: 16, right: 16, bottom: 32, left: 36 };

const toPath = (points: [number, number][]): string =>
  points.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x},${y}`).join(' ');

const SAFETY_COLOR = '#16a34a';
const ATTEND_COLOR = '#d97706';

export const SafetyAttendanceChart = ({ data, className = '' }: SafetyAttendanceChartProps) => {
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;

  const xScale = (i: number) => PAD.left + (i / (data.length - 1)) * innerW;
  const yScale = (v: number) => PAD.top + innerH - ((v - 70) / 30) * innerH; // range 70‑100

  const safetyPts: [number, number][] = data.map((d, i) => [xScale(i), yScale(d.safety)]);
  const attendPts: [number, number][] = data.map((d, i) => [xScale(i), yScale(d.attendance)]);

  return (
    <div className={`panel ${className}`}>
      <div className="panel-header">
        <div>
          <h2 className="h5 mb-1 section-title">
            <i className="bi bi-activity" aria-hidden="true" />
            <span>Safety &amp; Attendance Trends</span>
          </h2>
          <p className="text-muted mb-0">Monthly safety score vs attendance rate (%)</p>
        </div>
        <div className="d-flex align-items-center gap-3 small">
          <span className="d-flex align-items-center gap-1">
            <span style={{ width: 16, height: 3, background: SAFETY_COLOR, display: 'inline-block', borderRadius: 2 }} />
            Safety
          </span>
          <span className="d-flex align-items-center gap-1">
            <span style={{ width: 16, height: 3, background: ATTEND_COLOR, display: 'inline-block', borderRadius: 2 }} />
            Attendance
          </span>
        </div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', overflow: 'visible' }} aria-label="Safety and attendance trends">
        {/* Y grid */}
        {[70, 80, 90, 100].map((tick) => {
          const y = yScale(tick);
          return (
            <g key={tick}>
              <line x1={PAD.left} x2={W - PAD.right} y1={y} y2={y} stroke="currentColor" strokeOpacity={0.08} strokeWidth={1} />
              <text x={PAD.left - 6} y={y + 4} textAnchor="end" fontSize={9} fill="currentColor" opacity={0.45}>
                {tick}
              </text>
            </g>
          );
        })}

        {/* X labels */}
        {data.map((d, i) => (
          <text key={d.month} x={xScale(i)} y={H - 6} textAnchor="middle" fontSize={9} fill="currentColor" opacity={0.5}>
            {d.month}
          </text>
        ))}

        {/* Attendance area */}
        <path
          d={`${toPath(attendPts)} L${xScale(data.length - 1)},${yScale(70)} L${xScale(0)},${yScale(70)} Z`}
          fill={ATTEND_COLOR}
          fillOpacity={0.08}
        />

        {/* Safety area */}
        <path
          d={`${toPath(safetyPts)} L${xScale(data.length - 1)},${yScale(70)} L${xScale(0)},${yScale(70)} Z`}
          fill={SAFETY_COLOR}
          fillOpacity={0.1}
        />

        {/* Lines */}
        <path d={toPath(attendPts)} fill="none" stroke={ATTEND_COLOR} strokeWidth={2} strokeDasharray="5 3" />
        <path d={toPath(safetyPts)} fill="none" stroke={SAFETY_COLOR} strokeWidth={2.5} />

        {/* Dots — safety */}
        {safetyPts.map(([x, y], i) => (
          <g key={`s${i}`}>
            <circle cx={x} cy={y} r={3.5} fill={SAFETY_COLOR} />
            <title>{`${data[i].month} — Safety: ${data[i].safety}%`}</title>
          </g>
        ))}

        {/* Dots — attendance */}
        {attendPts.map(([x, y], i) => (
          <g key={`a${i}`}>
            <circle cx={x} cy={y} r={3} fill={ATTEND_COLOR} />
            <title>{`${data[i].month} — Attendance: ${data[i].attendance}%`}</title>
          </g>
        ))}
      </svg>
    </div>
  );
};
