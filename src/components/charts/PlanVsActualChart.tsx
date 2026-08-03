interface DataPoint {
  month: string;
  planned: number;
  actual: number;
}

interface PlanVsActualChartProps {
  data: DataPoint[];
  className?: string;
}

const W = 480;
const H = 180;
const PAD = { top: 10, right: 10, bottom: 25, left: 32 };

const toPath = (points: [number, number][]): string =>
  points.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x},${y}`).join(' ');

export const PlanVsActualChart = ({ data, className = '' }: PlanVsActualChartProps) => {
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;
  const maxVal = Math.max(...data.flatMap((d) => [d.planned, d.actual]), 1);

  const xScale = (i: number) => PAD.left + (i / (data.length - 1)) * innerW;
  const yScale = (v: number) => PAD.top + innerH - (v / maxVal) * innerH;

  const plannedPts: [number, number][] = data.map((d, i) => [xScale(i), yScale(d.planned)]);
  const actualPts: [number, number][] = data.map((d, i) => [xScale(i), yScale(d.actual)]);

  return (
    <div className={`w-100 h-100 d-flex flex-column justify-content-center ${className}`}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: '100%', overflow: 'visible' }} aria-label="Plan vs Actual chart">
        {/* Y grid lines */}
        {[0, 25, 50, 75, 100].map((tick) => {
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
          <text key={d.month} x={xScale(i)} y={H - 6} textAnchor="middle" fontSize={9} fill="currentColor" opacity={0.5}>
            {d.month}
          </text>
        ))}

        {/* Planned area fill */}
        <path
          d={`${toPath(plannedPts)} L${xScale(data.length - 1)},${yScale(0)} L${xScale(0)},${yScale(0)} Z`}
          fill="#6b7280"
          fillOpacity={0.05}
        />

        {/* Actual area fill */}
        <path
          d={`${toPath(actualPts)} L${xScale(data.length - 1)},${yScale(0)} L${xScale(0)},${yScale(0)} Z`}
          fill="#2563eb"
          fillOpacity={0.08}
        />

        {/* Planned line */}
        <path d={toPath(plannedPts)} fill="none" stroke="#6b7280" strokeWidth={1.5} strokeDasharray="4 3" />

        {/* Actual line */}
        <path d={toPath(actualPts)} fill="none" stroke="#2563eb" strokeWidth={2.2} />

        {/* Dots */}
        {actualPts.map(([x, y], i) => (
          <g key={i}>
            <circle cx={x} cy={y} r={3} fill="#2563eb" />
            <title>{`${data[i].month}: Actual ${data[i].actual}%, Planned ${data[i].planned}%`}</title>
          </g>
        ))}
      </svg>
    </div>
  );
};

