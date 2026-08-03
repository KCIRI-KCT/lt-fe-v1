import { type MetricCardData } from '../../types';

interface MetricCardProps {
  card: MetricCardData;
  className?: string;
}

export const MetricCard = ({ card, className = '' }: MetricCardProps) => {
  const { label, value, icon, variant, meta } = card;
  const metaClass = meta.positive === false ? 'text-danger' : 'text-success';

  return (
    <article className={`metric-card metric-${variant} ${className}`}>
      <div className="metric-top">
        <span className="metric-label">{label}</span>
        <span className="metric-icon">
          <i className={icon} aria-hidden="true" />
        </span>
      </div>
      <div className="metric-value">{value}</div>
      <div className="metric-meta">
        <span className={metaClass}>{meta.value}</span>
        <span>{meta.text}</span>
      </div>
    </article>
  );
};