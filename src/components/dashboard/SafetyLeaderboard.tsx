// ============================================================================
// SafetyLeaderboard — ranked safety list (real API data only)
// ----------------------------------------------------------------------------
// Renders a ranked list of sites / chainages / projects by safety score.
// No medals, no fabricated root-cause details, no filler copy. Scores come
// from the backend (Site.safetyScore / ChainageData.safetyScore); entries
// without a score are excluded and an empty state is shown instead.
// ============================================================================

export interface LeaderboardEntry {
  id: string;
  name: string;
  score: number;
}

interface SafetyLeaderboardProps {
  title: string;
  items: LeaderboardEntry[];
  loading?: boolean;
  emptyMessage?: string;
  maxHeight?: number;
}

const scoreColor = (score: number): string =>
  score >= 90 ? '#16a34a' : score >= 75 ? '#d97706' : '#dc2626';

export const SafetyLeaderboard = ({
  title,
  items,
  loading = false,
  emptyMessage = 'No safety records match the active filters.',
  maxHeight = 320,
}: SafetyLeaderboardProps) => {
  const ranked = [...items]
    .filter((item) => Number.isFinite(item.score))
    .sort((a, b) => b.score - a.score);

  return (
    <div className="card border-0 shadow-sm p-3 p-md-4 bg-white h-100 d-flex flex-column" style={{ minHeight: '380px' }}>
      <div className="d-flex align-items-center gap-2 mb-3 border-bottom pb-3">
        <i className="bi bi-shield-check text-success fs-5" />
        <h3 className="h6 mb-0 fw-bold">{title}</h3>
      </div>

      {loading ? (
        <div className="d-grid gap-2 flex-grow-1" aria-busy="true" aria-label="Loading safety leaderboard">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="placeholder-glow">
              <span className="placeholder col-8" />
            </div>
          ))}
        </div>
      ) : ranked.length === 0 ? (
        <div className="flex-grow-1 d-flex flex-column align-items-center justify-content-center text-center py-4">
          <i className="bi bi-shield text-muted fs-4 mb-2" />
          <p className="text-muted small mb-0">{emptyMessage}</p>
        </div>
      ) : (
        <div className="d-flex flex-column gap-2 overflow-auto pe-1" style={{ maxHeight: `${maxHeight}px` }}>
          {ranked.map((item, idx) => {
            const color = scoreColor(item.score);
            return (
              <div
                key={item.id}
                className="d-flex align-items-center gap-3 p-2 px-3 rounded border bg-light-subtle"
              >
                <span className="fw-bold text-muted" style={{ width: '24px', fontSize: '13px' }}>
                  {idx + 1}
                </span>
                <div className="flex-grow-1 min-width-0">
                  <div className="d-flex align-items-center justify-content-between gap-2 mb-1">
                    <span className="fw-semibold text-truncate" style={{ fontSize: '13px' }}>
                      {item.name}
                    </span>
                    <span className="fw-bold font-monospace" style={{ color, fontSize: '13px' }}>
                      {Math.round(item.score)}%
                    </span>
                  </div>
                  <div className="progress" style={{ height: '5px' }}>
                    <div
                      className="progress-bar"
                      role="progressbar"
                      aria-valuenow={Math.round(item.score)}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label={`${item.name} safety score`}
                      style={{ width: `${Math.max(0, Math.min(100, item.score))}%`, backgroundColor: color }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SafetyLeaderboard;
