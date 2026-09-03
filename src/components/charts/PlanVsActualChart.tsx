// ============================================================================
// PlanVsActualChart — cumulative progress with variance + target context
// ----------------------------------------------------------------------------
// - Planned (dashed) vs Actual (solid) lines with hover tooltips
// - Shaded variance band between the two lines (green = ahead, red = behind)
// - Dashed target reference line (default 100%)
// - Legend, end-point value labels, and a summary footer (actual / planned /
//   variance / status) so the chart reads without guesswork.
// ============================================================================

export interface DataPoint {
  month: string;
  planned: number;
  actual: number;
}

interface PlanVsActualChartProps {
  data: DataPoint[];
  /** Reference target line value (e.g. 100%). Defaults to 100. */
  target?: number;
  className?: string;
}

const W = 560;
const H = 230;
const PAD = { top: 16, right: 56, bottom: 32, left: 44 };

const toPath = (points: [number, number][]): string =>
  points.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ');

export type PlanVsActualStatus = 'ahead' | 'behind' | 'on-track' | 'no-data';

export const getPlanVsActualSummary = (data: DataPoint[]): {
  actual: number;
  planned: number;
  variance: number;
  status: PlanVsActualStatus;
} => {
  if (data.length === 0) return { actual: 0, planned: 0, variance: 0, status: 'no-data' as const };
  const last = data[data.length - 1];
  const variance = Math.round((last.actual - last.planned) * 10) / 10;
  const status = variance > 1 ? 'ahead' : variance < -1 ? 'behind' : 'on-track';
  return { actual: last.actual, planned: last.planned, variance, status };
};

const STATUS_META = {
  ahead: { label: 'Ahead of plan', badge: 'bg-success-subtle text-success border border-success-subtle' },
  behind: { label: 'Behind plan', badge: 'bg-danger-subtle text-danger border border-danger-subtle' },
  'on-track': { label: 'On track', badge: 'bg-primary-subtle text-primary border border-primary-subtle' },
  'no-data': { label: 'No data', badge: 'bg-light text-muted border' },
} as const;

export const PlanVsActualChart = ({ data, target = 100, className = '' }: PlanVsActualChartProps) => {
  if (data.length === 0) {
    return (
      <div className={`w-100 d-flex align-items-center justify-content-center py-5 text-muted small ${className}`}>
        <i className="bi bi-graph-up me-2" />
        No progress data available for this period.
      </div>
    );
  }

  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;
  const maxVal = Math.max(...data.flatMap((d) => [d.planned, d.actual]), target, 1);

  const xScale = (i: number) => PAD.left + (data.length === 1 ? innerW / 2 : (i / (data.length - 1)) * innerW);
  const yScale = (v: number) => PAD.top + innerH - (Math.max(0, v) / maxVal) * innerH;

  const plannedPts: [number, number][] = data.map((d, i) => [xScale(i), yScale(d.planned)]);
  const actualPts: [number, number][] = data.map((d, i) => [xScale(i), yScale(d.actual)]);

  // Variance band: planned path forward + actual path reversed.
  const variancePath = `${toPath(plannedPts)} ${actualPts
    .slice()
    .reverse()
    .map(([x, y]) => `L${x.toFixed(1)},${y.toFixed(1)}`)
    .join(' ')} Z`;

  const summary = getPlanVsActualSummary(data);
  const statusMeta = STATUS_META[summary.status];
  const behind = summary.variance < 0;
  const targetY = yScale(Math.min(target, maxVal));

  const lastActual: [number, number] = actualPts[actualPts.length - 1];
  const lastPlanned: [number, number] = plannedPts[plannedPts.length - 1];

  return (
    <div className={`w-100 d-flex flex-column p-2 ${className}`}>
      {/* Legend */}
      <div className="d-flex flex-wrap align-items-center gap-3 px-1 pb-2" style={{ fontSize: '11px' }}>
        <span className="d-flex align-items-center gap-1 text-muted">
          <span className="d-inline-block rounded" style={{ width: '18px', height: '3px', background: '#2563eb' }} />
          Actual
        </span>
        <span className="d-flex align-items-center gap-1 text-muted">
          <span
            className="d-inline-block rounded"
            style={{ width: '18px', height: '0px', borderTop: '2px dashed #6b7280' }}
          />
          Planned
        </span>
        <span className="d-flex align-items-center gap-1 text-muted">
          <span
            className="d-inline-block rounded"
            style={{ width: '14px', height: '10px', background: behind ? 'rgba(220,38,38,0.15)' : 'rgba(22,163,74,0.15)', border: `1px solid ${behind ? '#dc2626' : '#16a34a'}` }}
          />
          Variance
        </span>
        <span className="d-flex align-items-center gap-1 text-muted">
          <span
            className="d-inline-block rounded"
            style={{ width: '18px', height: '0px', borderTop: '2px dotted #0f172a' }}
          />
          Target {target}%
        </span>
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        style={{ width: '100%', height: 'auto', maxHeight: '240px', overflow: 'visible' }}
        role="img"
        aria-label={`Plan versus Actual chart. Actual ${summary.actual} percent, Planned ${summary.planned} percent, variance ${summary.variance} percent.`}
      >
        {/* Y grid lines */}
        {[0, 25, 50, 75, 100].map((tick) => {
          if (tick > maxVal) return null;
          const y = yScale((tick / 100) * maxVal);
          return (
            <g key={tick}>
              <line x1={PAD.left} x2={W - PAD.right} y1={y} y2={y} stroke="currentColor" strokeOpacity={0.08} strokeWidth={1} />
              <text x={PAD.left - 8} y={y + 3.5} textAnchor="end" fontSize={9} fill="currentColor" opacity={0.45}>
                {tick}%
              </text>
            </g>
          );
        })}

        {/* X labels */}
        {data.map((d, i) => (
          <text key={`${d.month}-${i}`} x={xScale(i)} y={H - 8} textAnchor="middle" fontSize={9} fill="currentColor" opacity={0.55}>
            {d.month}
          </text>
        ))}

        {/* Variance band */}
        <path d={variancePath} fill={behind ? '#dc2626' : '#16a34a'} fillOpacity={0.12} />

        {/* Actual area fill */}
        <path
          d={`${toPath(actualPts)} L${xScale(data.length - 1)},${yScale(0)} L${xScale(0)},${yScale(0)} Z`}
          fill="#2563eb"
          fillOpacity={0.07}
        />

        {/* Target reference line */}
        <line x1={PAD.left} x2={W - PAD.right} y1={targetY} y2={targetY} stroke="#0f172a" strokeWidth={1.2} strokeDasharray="2 3" strokeOpacity={0.6} />
        <text x={W - PAD.right + 4} y={targetY + 3.5} fontSize={9} fontWeight={700} fill="#0f172a" opacity={0.7}>
          {target}%
        </text>

        {/* Planned line */}
        <path d={toPath(plannedPts)} fill="none" stroke="#6b7280" strokeWidth={1.5} strokeDasharray="5 3" />

        {/* Actual line */}
        <path d={toPath(actualPts)} fill="none" stroke="#2563eb" strokeWidth={2.4} strokeLinejoin="round" strokeLinecap="round" />

        {/* Hover targets + dots */}
        {data.map((d, i) => {
          const [ax, ay] = actualPts[i];
          const [px, py] = plannedPts[i];
          return (
            <g key={i}>
              <circle cx={ax} cy={ay} r={10} fill="transparent">
                <title>{`${d.month}: Actual ${d.actual}% • Planned ${d.planned}% • Variance ${Math.round((d.actual - d.planned) * 10) / 10}%`}</title>
              </circle>
              <circle cx={px} cy={py} r={2.4} fill="#fff" stroke="#6b7280" strokeWidth={1.5} />
              <circle cx={ax} cy={ay} r={3.2} fill="#2563eb" stroke="#fff" strokeWidth={1.2} />
            </g>
          );
        })}

        {/* End-point value labels */}
        <text x={lastActual[0] + 6} y={lastActual[1] + 3.5} fontSize={10} fontWeight={700} fill="#2563eb">
          {data[data.length - 1].actual}%
        </text>
        <text x={lastPlanned[0] + 6} y={lastPlanned[1] + 3.5} fontSize={10} fontWeight={600} fill="#6b7280">
          {data[data.length - 1].planned}%
        </text>
      </svg>

      {/* Summary footer */}
      <div className="d-flex flex-wrap align-items-center gap-2 px-1 pt-2 mt-1 border-top" style={{ fontSize: '11.5px' }}>
        <span className="text-muted">
          Actual <strong className="text-primary font-monospace">{summary.actual}%</strong>
        </span>
        <span className="text-muted">•</span>
        <span className="text-muted">
          Planned <strong className="text-dark font-monospace">{summary.planned}%</strong>
        </span>
        <span className="text-muted">•</span>
        <span className="text-muted">
          Variance{' '}
          <strong className={`font-monospace ${behind ? 'text-danger' : 'text-success'}`}>
            {summary.variance > 0 ? '+' : ''}{summary.variance}%
          </strong>
        </span>
        <span className={`badge ms-auto ${statusMeta.badge}`} style={{ fontSize: '10px' }}>
          {statusMeta.label}
        </span>
      </div>
    </div>
  );
};

export default PlanVsActualChart;
