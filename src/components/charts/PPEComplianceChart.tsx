import type { PPECompliance } from '../../types';

interface PPEComplianceChartProps {
  data: PPECompliance;
  className?: string;
}

const PPE_COLORS: Record<string, string> = {
  helmet: '#2563eb',
  vest: '#d97706',
  mask: '#0891b2',
  boots: '#0f766e',
  gloves: '#dc2626',
};

export const PPEComplianceChart = ({ data, className = '' }: PPEComplianceChartProps) => {
  const items = Object.entries(data) as [string, number][];

  return (
    <div className={`panel ${className}`}>
      <div className="panel-header">
        <div>
          <h2 className="h5 mb-1 section-title">
            <i className="bi bi-person-check" aria-hidden="true" />
            <span>PPE Compliance</span>
          </h2>
          <p className="text-muted mb-0">Personal protective equipment compliance rate</p>
        </div>
      </div>
      <div className="d-grid gap-3">
        {items.map(([key, value]) => (
          <div key={key}>
            <div className="d-flex justify-content-between mb-1">
              <small className="fw-bold text-capitalize">{key}</small>
              <small className="fw-bold" style={{ color: PPE_COLORS[key] || '#2563eb' }}>{value}%</small>
            </div>
            <div className="progress" style={{ height: '10px' }}>
              <div
                className="progress-bar"
                style={{
                  width: `${value}%`,
                  background: `linear-gradient(90deg, ${PPE_COLORS[key] || '#2563eb'}, ${PPE_COLORS[key] || '#2563eb'}88)`,
                }}
                role="progressbar"
                aria-valuenow={value}
                aria-valuemin={0}
                aria-valuemax={100}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};