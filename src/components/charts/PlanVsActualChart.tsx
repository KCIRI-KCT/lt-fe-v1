// ============================================================================
// PlanVsActualChart — cumulative progress with Primavera P6 API task calculation
// ----------------------------------------------------------------------------
// - Planned (dashed) vs Actual (solid) lines with hover tooltips & data point values
// - Primavera P6 API Live Sync & Daily Task completion calculations
// - Value callouts on graph points for clear value visibility
// - Action buttons with high visibility (Primavera Sync, Value Toggle, Daily Breakdown)
// - Handles missing/NaN values gracefully with '-' fallback
// ============================================================================

import { useState, useEffect } from 'react';
import { safeFormatPercent, safeFormatNumber, safeValue } from '../../utils/formatUtils';
import { primaveraService, type PrimaveraDailyProgress } from '../../services/primaveraService';

export interface DataPoint {
  month: string;
  planned: number;
  actual: number;
}

interface PlanVsActualChartProps {
  data?: DataPoint[];
  /** Reference target line value (e.g. 100%). Defaults to 100. */
  target?: number;
  className?: string;
  projectId?: string;
}

const W = 560;
const H = 230;
const PAD = { top: 24, right: 60, bottom: 32, left: 44 };

const toPath = (points: [number, number][]): string =>
  points.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ');

export type PlanVsActualStatus = 'ahead' | 'behind' | 'on-track' | 'no-data';

// eslint-disable-next-line react-refresh/only-export-components
export const getPlanVsActualSummary = (data: DataPoint[]): {
  actual: number;
  planned: number;
  variance: number;
  status: PlanVsActualStatus;
} => {
  if (!data || data.length === 0) return { actual: 0, planned: 0, variance: 0, status: 'no-data' as const };
  const last = data[data.length - 1];
  const actVal = isNaN(last.actual) ? 0 : last.actual;
  const planVal = isNaN(last.planned) ? 0 : last.planned;
  const variance = Math.round((actVal - planVal) * 10) / 10;
  const status = variance > 1 ? 'ahead' : variance < -1 ? 'behind' : 'on-track';
  return { actual: actVal, planned: planVal, variance, status };
};

const STATUS_META = {
  ahead: { label: 'Ahead of plan', badge: 'bg-success-subtle text-success border border-success-subtle' },
  behind: { label: 'Behind plan', badge: 'bg-danger-subtle text-danger border border-danger-subtle' },
  'on-track': { label: 'On track', badge: 'bg-primary-subtle text-primary border border-primary-subtle' },
  'no-data': { label: 'No data', badge: 'bg-light text-muted border' },
} as const;

export const PlanVsActualChart = ({ data: initialData, target = 100, className = '', projectId }: PlanVsActualChartProps) => {
  const [chartData, setChartData] = useState<DataPoint[]>(initialData && initialData.length > 0 ? initialData : []);
  const [showValues, setShowValues] = useState<boolean>(true);
  const [syncing, setSyncing] = useState<boolean>(false);
  const [syncMsg, setSyncMsg] = useState<string>('');
  const [dailyMetrics, setDailyMetrics] = useState<PrimaveraDailyProgress | null>(null);

  // Sync initialData prop changes
  useEffect(() => {
    if (initialData && initialData.length > 0) {
      Promise.resolve().then(() => setChartData(initialData));
    }
  }, [initialData]);

  // Fetch Primavera P6 series & daily task calculations on mount
  useEffect(() => {
    let isMounted = true;
    if (!initialData || initialData.length === 0) {
      primaveraService.getPlanVsActualSeries(projectId).then((pts) => {
        if (isMounted) setChartData(pts);
      });
    }

    primaveraService.fetchTasks(projectId).then((tasks) => {
      if (isMounted) {
        const metrics = primaveraService.calculateDailyProgress(tasks);
        setDailyMetrics(metrics);
      }
    });

    return () => { isMounted = false; };
  }, [initialData, projectId]);

  // Handle Primavera P6 API Sync
  const handleSyncPrimavera = async () => {
    setSyncing(true);
    setSyncMsg('');
    try {
      const res = await primaveraService.syncPrimaveraAPI(projectId);
      const updatedSeries = await primaveraService.getPlanVsActualSeries(projectId);
      const updatedTasks = await primaveraService.fetchTasks(projectId);
      const updatedDaily = primaveraService.calculateDailyProgress(updatedTasks);

      setChartData(updatedSeries);
      setDailyMetrics(updatedDaily);
      setSyncMsg(`${res.message} (${res.timestamp})`);
    } catch {
      setSyncMsg('Failed to sync with Primavera P6 API.');
    } finally {
      setSyncing(false);
    }
  };

  const activeData = chartData.length > 0 ? chartData : [];

  if (activeData.length === 0) {
    return (
      <div className={`w-100 d-flex flex-column align-items-center justify-content-center py-5 text-muted small ${className}`}>
        <i className="bi bi-graph-up fs-2 mb-2 text-primary opacity-50" />
        <span>No progress data available for this period.</span>
        <button
          className="btn btn-sm btn-outline-primary mt-3 d-flex align-items-center gap-1"
          onClick={handleSyncPrimavera}
          disabled={syncing}
        >
          <i className="bi bi-arrow-repeat" /> Fetch from Primavera P6 API
        </button>
      </div>
    );
  }

  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;
  const maxVal = Math.max(
    ...activeData.flatMap((d) => [isNaN(d.planned) ? 0 : d.planned, isNaN(d.actual) ? 0 : d.actual]),
    target,
    1
  );

  const xScale = (i: number) => PAD.left + (activeData.length === 1 ? innerW / 2 : (i / (activeData.length - 1)) * innerW);
  const yScale = (v: number) => PAD.top + innerH - (Math.max(0, isNaN(v) ? 0 : v) / maxVal) * innerH;

  const plannedPts: [number, number][] = activeData.map((d, i) => [xScale(i), yScale(d.planned)]);
  const actualPts: [number, number][] = activeData.map((d, i) => [xScale(i), yScale(d.actual)]);

  // Variance band: planned path forward + actual path reversed.
  const variancePath = `${toPath(plannedPts)} ${actualPts
    .slice()
    .reverse()
    .map(([x, y]) => `L${x.toFixed(1)},${y.toFixed(1)}`)
    .join(' ')} Z`;

  const summary = getPlanVsActualSummary(activeData);
  const statusMeta = STATUS_META[summary.status];
  const behind = summary.variance < 0;
  const targetY = yScale(Math.min(target, maxVal));

  const lastActual: [number, number] = actualPts[actualPts.length - 1];
  const lastPlanned: [number, number] = plannedPts[plannedPts.length - 1];

  return (
    <div className={`w-100 d-flex flex-column p-2 ${className}`}>
      {/* Primavera P6 Daily Task Calculation Banner */}
      {dailyMetrics && (
        <div className="p-2 mb-3 bg-light rounded border d-flex flex-wrap align-items-center justify-content-between gap-2" style={{ fontSize: '0.8rem' }}>
          <div className="d-flex align-items-center gap-2">
            <span className="badge bg-primary text-white d-flex align-items-center gap-1 py-1 px-2">
              <i className="bi bi-box-seam-fill" /> Primavera P6 Live Tasks
            </span>
            <span>
              Today Done: <strong className="text-success">{safeFormatNumber(dailyMetrics.tasksCompletedToday, 0)}</strong> / <strong className="text-dark">{safeFormatNumber(dailyMetrics.totalTasksScheduledToday, 0)} Tasks</strong>
            </span>
            <span className="text-muted">•</span>
            <span>
              Daily Rate: <strong className="text-primary">{safeFormatPercent(dailyMetrics.dailyActualPct)}</strong>
            </span>
          </div>

          <div className="d-flex align-items-center gap-2">
            <button
              type="button"
              className="btn btn-xs btn-outline-secondary d-flex align-items-center gap-1 py-1 px-2 fw-semibold"
              style={{ fontSize: '0.725rem' }}
              onClick={() => setShowValues((prev) => !prev)}
              title="Toggle graph numerical value labels"
            >
              <i className={`bi ${showValues ? 'bi-eye-slash-fill' : 'bi-eye-fill'}`} />
              {showValues ? 'Hide Graph Values' : 'Show Graph Values'}
            </button>
            <button
              type="button"
              className="btn btn-xs btn-primary d-flex align-items-center gap-1 py-1 px-2 fw-semibold shadow-sm"
              style={{ fontSize: '0.725rem' }}
              onClick={handleSyncPrimavera}
              disabled={syncing}
              title="Sync latest actuals from Primavera P6 API"
            >
              {syncing ? (
                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
              ) : (
                <i className="bi bi-arrow-repeat" />
              )}
              Sync Primavera P6
            </button>
          </div>
        </div>
      )}

      {syncMsg && (
        <div className="alert alert-info py-1 px-2 small mb-2 d-flex align-items-center justify-content-between" style={{ fontSize: '0.75rem' }}>
          <span><i className="bi bi-check-circle-fill me-1" /> {syncMsg}</span>
          <button className="btn-close btn-close-xs" onClick={() => setSyncMsg('')} />
        </div>
      )}

      {/* Legend Header */}
      <div className="d-flex flex-wrap align-items-center justify-content-between px-1 pb-2" style={{ fontSize: '11px' }}>
        <div className="d-flex align-items-center gap-3">
          <span className="d-flex align-items-center gap-1 text-dark fw-semibold">
            <span className="d-inline-block rounded" style={{ width: '18px', height: '3px', background: '#2563eb' }} />
            Actual Curve
          </span>
          <span className="d-flex align-items-center gap-1 text-muted">
            <span
              className="d-inline-block rounded"
              style={{ width: '18px', height: '0px', borderTop: '2px dashed #6b7280' }}
            />
            Planned Target
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

        <span className={`badge ${statusMeta.badge}`} style={{ fontSize: '10px' }}>
          {statusMeta.label}
        </span>
      </div>

      {/* SVG Chart */}
      <svg
        viewBox={`0 0 ${W} ${H}`}
        style={{ width: '100%', height: 'auto', maxHeight: '250px', overflow: 'visible' }}
        role="img"
        aria-label={`Plan versus Actual chart. Actual ${safeFormatPercent(summary.actual)}, Planned ${safeFormatPercent(summary.planned)}, variance ${safeFormatPercent(summary.variance)}.`}
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
        {activeData.map((d, i) => (
          <text key={`${d.month}-${i}`} x={xScale(i)} y={H - 8} textAnchor="middle" fontSize={9} fill="currentColor" opacity={0.65} fontWeight={500}>
            {safeValue(d.month)}
          </text>
        ))}

        {/* Variance band */}
        <path d={variancePath} fill={behind ? '#dc2626' : '#16a34a'} fillOpacity={0.12} />

        {/* Actual area fill */}
        <path
          d={`${toPath(actualPts)} L${xScale(activeData.length - 1)},${yScale(0)} L${xScale(0)},${yScale(0)} Z`}
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
        <path d={toPath(actualPts)} fill="none" stroke="#2563eb" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />

        {/* Value Callouts and Dots */}
        {activeData.map((d, i) => {
          const [ax, ay] = actualPts[i];
          const [px, py] = plannedPts[i];
          const actValStr = safeFormatPercent(d.actual);
          const planValStr = safeFormatPercent(d.planned);
          const varianceVal = Math.round(((isNaN(d.actual) ? 0 : d.actual) - (isNaN(d.planned) ? 0 : d.planned)) * 10) / 10;

          return (
            <g key={i}>
              <circle cx={ax} cy={ay} r={12} fill="transparent">
                <title>{`${d.month}: Actual ${actValStr} • Planned ${planValStr} • Variance ${varianceVal > 0 ? '+' : ''}${varianceVal}%`}</title>
              </circle>
              <circle cx={px} cy={py} r={2.5} fill="#fff" stroke="#6b7280" strokeWidth={1.5} />
              <circle cx={ax} cy={ay} r={3.5} fill="#2563eb" stroke="#fff" strokeWidth={1.5} />

              {/* Explicit Value Label Callout Bubble on Points */}
              {showValues && (
                <g>
                  {/* Actual Value Bubble */}
                  <rect
                    x={ax - 16}
                    y={ay - 22}
                    width={32}
                    height={14}
                    rx={3}
                    fill="#2563eb"
                    fillOpacity={0.9}
                  />
                  <text
                    x={ax}
                    y={ay - 12}
                    textAnchor="middle"
                    fontSize={8.5}
                    fontWeight={700}
                    fill="#ffffff"
                  >
                    {safeFormatNumber(d.actual, 0)}%
                  </text>
                </g>
              )}
            </g>
          );
        })}

        {/* End-point value labels */}
        <text x={lastActual[0] + 6} y={lastActual[1] + 3.5} fontSize={10} fontWeight={700} fill="#2563eb">
          {safeFormatPercent(activeData[activeData.length - 1].actual)}
        </text>
        <text x={lastPlanned[0] + 6} y={lastPlanned[1] + 3.5} fontSize={10} fontWeight={600} fill="#6b7280">
          {safeFormatPercent(activeData[activeData.length - 1].planned)}
        </text>
      </svg>

      {/* Summary Footer */}
      <div className="d-flex flex-wrap align-items-center gap-3 px-2 pt-2 mt-1 border-top" style={{ fontSize: '11.5px' }}>
        <span className="text-muted">
          Primavera Actual: <strong className="text-primary font-monospace">{safeFormatPercent(summary.actual)}</strong>
        </span>
        <span className="text-muted">•</span>
        <span className="text-muted">
          Planned Baseline: <strong className="text-dark font-monospace">{safeFormatPercent(summary.planned)}</strong>
        </span>
        <span className="text-muted">•</span>
        <span className="text-muted">
          Variance:{' '}
          <strong className={`font-monospace ${behind ? 'text-danger' : 'text-success'}`}>
            {summary.variance > 0 ? '+' : ''}{safeFormatPercent(summary.variance)}
          </strong>
        </span>
      </div>
    </div>
  );
};

export default PlanVsActualChart;
