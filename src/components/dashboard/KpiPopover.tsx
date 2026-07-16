
interface KpiPopoverProps {
  cardId: string;
  onClose: () => void;
}

interface MetricBreakdown {
  label: string;
  value: string | number;
  trend?: string;
  isPositive?: boolean;
}

export const KpiPopover = ({ cardId, onClose }: KpiPopoverProps) => {
  // Return different dynamic info based on which card is clicked
  const getCardDetails = (): {
    title: string;
    icon: string;
    desc: string;
    stats: MetricBreakdown[];
    chartColor: string;
    miniChartData: number[];
    contractors: { name: string; value: string; status: string }[];
  } => {
    switch (cardId) {
      case 'total-workers':
        return {
          title: 'Total Workforce Breakdown',
          icon: 'bi-people-fill',
          desc: 'Real-time shift and contractor workforce metrics.',
          stats: [
            { label: 'General Shift', value: '1,420', trend: 'Day Shift', isPositive: true },
            { label: 'Night Shift', value: '1,260', trend: 'Night Shift', isPositive: true },
            { label: 'Attendance Rate', value: '94.2%', trend: '+1.5% vs yesterday', isPositive: true },
            { label: 'Registered Total', value: '2,850', trend: 'Total enrolled', isPositive: true },
          ],
          chartColor: '#2563eb',
          miniChartData: [60, 65, 70, 75, 82, 88, 94],
          contractors: [
            { name: 'L&T Infrastructure', value: '1,200 Present', status: 'Optimal' },
            { name: 'Vijay Projects Ltd', value: '850 Present', status: 'Optimal' },
            { name: 'Hindustan Heavy Co', value: '630 Present', status: 'Understaffed' },
          ],
        };
      case 'safety-compliance':
        return {
          title: 'Safety Compliance Details',
          icon: 'bi-shield-fill-check',
          desc: 'AI violations detected vs resolved status.',
          stats: [
            { label: 'Helmet Compliance', value: '95.6%', trend: '+0.5%', isPositive: true },
            { label: 'Vest Compliance', value: '92.1%', trend: '+1.2%', isPositive: true },
            { label: 'Restricted Zones', value: '0 violations', trend: 'Clean record', isPositive: true },
            { label: 'Unresolved Alerts', value: '2 items', trend: '-4 unresolved', isPositive: true },
          ],
          chartColor: '#16a34a',
          miniChartData: [85, 87, 86, 89, 90, 90, 91.2],
          contractors: [
            { name: 'L&T Infrastructure', value: '96% Score', status: 'Excellent' },
            { name: 'Vijay Projects Ltd', value: '88% Score', status: 'Warning' },
            { name: 'Hindustan Heavy Co', value: '90% Score', status: 'Good' },
          ],
        };
      case 'overall-progress':
        return {
          title: 'Overall Construction Progress',
          icon: 'bi-bar-chart-fill',
          desc: 'Monthly cumulative target vs actual variance.',
          stats: [
            { label: 'Target Month-End', value: '35.0%', trend: 'Goal', isPositive: true },
            { label: 'Current Progress', value: '33.7%', trend: 'Actual', isPositive: false },
            { label: 'Variance', value: '-1.3%', trend: 'Lagging', isPositive: false },
            { label: 'Forecast End-Date', value: 'Dec 2026', trend: 'On Schedule', isPositive: true },
          ],
          chartColor: '#0f766e',
          miniChartData: [5, 12, 18, 22, 28, 31, 33.7],
          contractors: [
            { name: 'Chennai Expressway', value: '35% Completed', status: 'On track' },
            { name: 'Mumbai Ring Road', value: '22% Completed', status: 'Delayed' },
            { name: 'Hyderabad Metro', value: '15% Completed', status: 'Delayed' },
          ],
        };
      case 'live-cameras':
        return {
          title: 'Live Camera Streams',
          icon: 'bi-camera-video-fill',
          desc: 'Active camera counts, stream statuses and offline logs.',
          stats: [
            { label: 'Active Streams', value: '14 online', trend: 'All running', isPositive: true },
            { label: 'Offline / Warning', value: '1 maintenance', trend: 'CAM-108', isPositive: false },
            { label: 'Streaming Latency', value: '120ms avg', trend: 'Optimal bandwidth', isPositive: true },
            { label: 'Total Cameras', value: '15 units', trend: 'Across 3 sites', isPositive: true },
          ],
          chartColor: '#2563eb',
          miniChartData: [15, 15, 14, 14, 15, 15, 14],
          contractors: [
            { name: 'Site A - KM 0-15', value: '8 Online, 0 Offline', status: 'Online' },
            { name: 'Site B - KM 15-30', value: '6 Online, 0 Offline', status: 'Online' },
            { name: 'Site C - KM 30-45', value: '0 Online, 1 Offline', status: 'Offline' },
          ],
        };
      case 'vehicles':
        return {
          title: 'Active Fleet Logistics',
          icon: 'bi-truck',
          desc: 'GPS tracked dumpers, transit mixers, and excavators.',
          stats: [
            { label: 'Transit Mixers', value: '18 active', trend: '90% utilization', isPositive: true },
            { label: 'Excavators', value: '12 active', trend: '100% capacity', isPositive: true },
            { label: 'Speed Limit Violations', value: '0 alerts', trend: 'Clean log', isPositive: true },
            { label: 'Dumpers/Tippers', value: '24 units', trend: 'Moving materials', isPositive: true },
          ],
          chartColor: '#d97706',
          miniChartData: [35, 40, 48, 52, 50, 53, 54],
          contractors: [
            { name: 'Expressway Route', value: '32 Vehicles Active', status: 'High activity' },
            { name: 'Kanchipuram Yard', value: '14 Vehicles Active', status: 'Moderate' },
            { name: 'Panvel Yard', value: '8 Vehicles Active', status: 'Low activity' },
          ],
        };
      case 'equipment':
        return {
          title: 'Heavy Machinery Status',
          icon: 'bi-gear-wide-connected',
          desc: 'Operational efficiency and fuel sensor data.',
          stats: [
            { label: 'Active Cranes', value: '4 operational', trend: '100% active', isPositive: true },
            { label: 'Piling Rigs', value: '3 operational', trend: 'Ongoing foundation', isPositive: true },
            { label: 'Idle Equipment', value: '1 unit', trend: 'Generators', isPositive: false },
            { label: 'Health Index', value: '96%', trend: 'Avg uptime', isPositive: true },
          ],
          chartColor: '#0f766e',
          miniChartData: [92, 94, 95, 96, 95, 96, 96],
          contractors: [
            { name: 'L&T Piling Rig #1', value: 'Running - 94% Eff', status: 'Optimal' },
            { name: 'Gantry Crane B2', value: 'Running - 98% Eff', status: 'Optimal' },
            { name: 'Concrete Batch Plant', value: 'Maintenance - Idle', status: 'Idle' },
          ],
        };
      case 'ai-alerts':
        return {
          title: 'AI Alerts Summary',
          icon: 'bi-robot',
          desc: 'AI threat detections grouped by severity.',
          stats: [
            { label: 'Critical Severity', value: '1 unresolved', trend: 'Action needed', isPositive: false },
            { label: 'High Severity', value: '3 items', trend: 'PPE violation', isPositive: false },
            { label: 'Medium Severity', value: '8 items', trend: 'Restricted zones', isPositive: true },
            { label: 'Low Severity', value: '2 items', trend: 'Mask alerts', isPositive: true },
          ],
          chartColor: '#dc2626',
          miniChartData: [22, 19, 18, 15, 17, 16, 14],
          contractors: [
            { name: 'Helmet Violation', value: '6 alerts today', status: 'High' },
            { name: 'Restricted Zone', value: '4 alerts today', status: 'Medium' },
            { name: 'Wrong-way Vehicle', value: '1 alert today', status: 'Low' },
          ],
        };
      case 'quality-inspections':
        return {
          title: 'Quality Check Logs',
          icon: 'bi-clipboard-check-fill',
          desc: 'Material tests, cube strength, and compaction ratings.',
          stats: [
            { label: 'Cylinder Strengths', value: '12 passed', trend: 'M40 grade checks', isPositive: true },
            { label: 'Compaction Audits', value: '98.5% score', trend: 'Passed density test', isPositive: true },
            { label: 'Material Approvals', value: '4 items approved', trend: 'Steel shipments', isPositive: true },
            { label: 'Pending Inspection', value: '1 request', trend: 'Structural inspection', isPositive: false },
          ],
          chartColor: '#0f766e',
          miniChartData: [92, 94, 96, 95, 98, 97, 98.5],
          contractors: [
            { name: 'Concrete Cube Test', value: 'Passed - 42.5 N/mm2', status: 'Approved' },
            { name: 'Soil Proctor Audit', value: 'Passed - 99.2%', status: 'Approved' },
            { name: 'Subgrade Check', value: 'Pending - Pier 4', status: 'Pending' },
          ],
        };
      case 'daily-productivity':
        return {
          title: 'Daily Productivity Metrics',
          icon: 'bi-lightning-fill',
          desc: 'Quantity laydown, earthwork volumes, and paving outputs.',
          stats: [
            { label: 'Subgrade Compacted', value: '12,500 m3', trend: 'Target met', isPositive: true },
            { label: 'Concrete Laid', value: '450 m3', trend: 'Bridge piers', isPositive: true },
            { label: 'WMM Laydown', value: '1.2 km', trend: '+200m ahead', isPositive: true },
            { label: 'Daily Output Score', value: '96.2%', trend: 'Target achieved', isPositive: true },
          ],
          chartColor: '#d97706',
          miniChartData: [85, 90, 88, 92, 94, 95, 96.2],
          contractors: [
            { name: 'Paving team A', value: '450m BC Completed', status: 'Optimal' },
            { name: 'Earthwork team B', value: '3,200m3 Soil Moved', status: 'Optimal' },
            { name: 'Piling team C', value: '1 Rig completed', status: 'Optimal' },
          ],
        };
      case 'project-cost':
        return {
          title: 'Budget & Expenditure Details',
          icon: 'bi-currency-rupee',
          desc: 'Monthly billing cycle, cash outflows, and project margins.',
          stats: [
            { label: 'Approved Budget', value: '₹1,050 Cr', trend: 'Total allocation', isPositive: true },
            { label: 'Billed Work', value: '₹342 Cr', trend: '32.5% spent', isPositive: true },
            { label: 'Outstanding Claims', value: '₹12.5 Cr', trend: 'Vendor invoices', isPositive: false },
            { label: 'Under/Over Run', value: '-0.8% variance', trend: 'Under budget', isPositive: true },
          ],
          chartColor: '#16a34a',
          miniChartData: [200, 240, 280, 310, 325, 335, 342],
          contractors: [
            { name: 'Expressway Contract', value: '₹220 Cr Claimed', status: 'Approved' },
            { name: 'Elevated Corridor Contract', value: '₹95 Cr Claimed', status: 'Approved' },
            { name: 'Logistics and Fleet Contract', value: '₹27 Cr Claimed', status: 'Audit' },
          ],
        };
      case 'schedule-delay':
        return {
          title: 'Schedule Variance Audit',
          icon: 'bi-clock-history',
          desc: 'Critical path tasks and baseline schedule deviations.',
          stats: [
            { label: 'Days Behind Schedule', value: '4 days', trend: 'Recoverable', isPositive: false },
            { label: 'Critical Path Tasks', value: '8 items', trend: 'Pier launching', isPositive: false },
            { label: 'Schedule Performance', value: '0.96 SPI', trend: 'Target is 1.0', isPositive: false },
            { label: 'Recovery Strategy', value: 'Double shift', trend: 'Approved', isPositive: true },
          ],
          chartColor: '#dc2626',
          miniChartData: [0, 1, 2, 4, 3, 5, 4],
          contractors: [
            { name: 'Piling Foundations', value: '0 Days Delay', status: 'Completed' },
            { name: 'Pier Structure Launching', value: '4 Days Delay', status: 'Warning' },
            { name: 'Deck Casting Slab', value: '0 Days Delay', status: 'On Track' },
          ],
        };
      case 'ppe-compliance':
        return {
          title: 'PPE Compliance Analysis',
          icon: 'bi-person-check-fill',
          desc: 'AI compliance checks on helmet, safety vests, protective boots, and gloves.',
          stats: [
            { label: 'Helmet Compliance', value: '94.0%', trend: 'Optimal', isPositive: true },
            { label: 'Safety Vest Compliance', value: '89.0%', trend: 'Good', isPositive: true },
            { label: 'Safety Boots Compliance', value: '82.0%', trend: 'Moderate', isPositive: true },
            { label: 'Safety Gloves Compliance', value: '71.0%', trend: 'Needs focus', isPositive: false },
          ],
          chartColor: '#16a34a',
          miniChartData: [88, 89, 90, 89, 91, 91, 91.2],
          contractors: [
            { name: 'L&T Infrastructure', value: '94% Rate', status: 'Excellent' },
            { name: 'Vijay Projects Ltd', value: '89% Rate', status: 'Approved' },
            { name: 'Hindustan Heavy Co', value: '85% Rate', status: 'Approved' },
          ],
        };
      case 'active-incidents':
        return {
          title: 'Active Safety Incidents Log',
          icon: 'bi-exclamation-triangle-fill',
          desc: 'Active incident tickets, unresolved safety observations, and AI alert reviews.',
          stats: [
            { label: 'Open Incidents', value: '2 items', trend: 'Under review', isPositive: false },
            { label: 'AI Observations', value: '3 items', trend: 'Live feed', isPositive: false },
            { label: 'Under Investigation', value: '1 item', trend: 'Active review', isPositive: false },
            { label: 'Injury Free Days', value: '180+ days', trend: 'Safe work environment', isPositive: true },
          ],
          chartColor: '#d97706',
          miniChartData: [3, 2, 2, 1, 3, 2, 2],
          contractors: [
            { name: 'Site A - Scaffolding Fall', value: 'Open Incident', status: 'Warning' },
            { name: 'Site B - Excavator Issue', value: 'Investigating', status: 'Warning' },
            { name: 'Site E - Crane Swing Near Miss', value: 'Resolved Ticket', status: 'Approved' },
          ],
        };
      case 'ai-health':
      default:
        return {
          title: 'AI Inspection Engine Health',
          icon: 'bi-cpu-fill',
          desc: 'Server compute load, edge processing logs, and camera status.',
          stats: [
            { label: 'Inference Latency', value: '45ms avg', trend: 'Optimal speed', isPositive: true },
            { label: 'Edge Nodes Online', value: '3 active', trend: 'No faults', isPositive: true },
            { label: 'Stream Service status', value: 'Healthy', trend: 'Uptime 99.99%', isPositive: true },
            { label: 'Accuracy Rating', value: '98.8%', trend: 'F1-Score benchmark', isPositive: true },
          ],
          chartColor: '#16a34a',
          miniChartData: [97.5, 98.1, 98.4, 98.2, 98.6, 98.7, 98.8],
          contractors: [
            { name: 'Edge Node 01 (Chennai)', value: 'Compute Load: 45%', status: 'Healthy' },
            { name: 'Edge Node 02 (Walaja)', value: 'Compute Load: 38%', status: 'Healthy' },
            { name: 'Cloud Inference Server', value: 'Compute Load: 12%', status: 'Healthy' },
          ],
        };
    }
  };

  const details = getCardDetails();

  return (
    <div
      className="position-fixed d-flex align-items-center justify-content-center"
      style={{ top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(15, 23, 42, 0.45)', backdropFilter: 'blur(4px)', zIndex: 1090 }}
      onClick={onClose}
    >
      <div
        className="card shadow-lg p-0"
        style={{ width: '1000px', maxWidth: '95vw', border: '1px solid var(--admin-border)', background: 'var(--admin-surface)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="card-header bg-light d-flex align-items-center justify-content-between p-3 border-bottom">
          <div className="d-flex align-items-center gap-2">
            <span className="badge bg-primary-subtle text-primary border p-1.5 rounded">
              <i className={`bi ${details.icon} fs-5`} />
            </span>
            <div>
              <h3 className="h6 mb-0 fw-bold">{details.title}</h3>
              {/* <small className="text-muted">KPI Executive Analysis</small> */}
            </div>
          </div>
          <button className="btn-close" onClick={onClose} aria-label="Close" />
        </div>

        {/* Content Body */}
        <div className="card-body p-3">
          <p className="text-muted small mb-3">{details.desc}</p>

          <div className="row g-3">
            {/* Left Column: KPI Grid breakdown */}
            <div className="col-12 col-md-6 border-end">
              <div className="small fw-bold text-muted text-uppercase mb-2" style={{ letterSpacing: '0.5px' }}>
                Key Metric Performance
              </div>
              <div className="row g-2 mb-3">
                {details.stats.map((st, i) => (
                  <div key={i} className="col-6">
                    <div className="p-2 border rounded bg-light-subtle">
                      <div className="small text-muted">{st.label}</div>
                      <div className="fw-bold my-0.5">{st.value}</div>
                      {st.trend && (
                        <div
                          className={`small fw-semibold d-flex align-items-center gap-1 ${st.isPositive ? 'text-success' : 'text-danger'
                            }`}
                        >
                          <i className={`bi ${st.isPositive ? 'bi-caret-up-fill' : 'bi-caret-down-fill'}`} />
                          {st.trend}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: List of active sub-components/contractors */}
            <div className="col-12 col-md-6">
              <div className="small fw-bold text-muted text-uppercase mb-2" style={{ letterSpacing: '0.5px' }}>
                Station / Contractor Breakdown
              </div>
              <div className="d-grid gap-1.5">
                {details.contractors.map((c, i) => (
                  <div
                    key={i}
                    className="d-flex align-items-center justify-content-between p-2 rounded border bg-light-subtle"
                  >
                    <span className="fw-semibold text-body text-truncate" style={{ maxWidth: '140px' }}>{c.name}</span>
                    <div className="d-flex align-items-center gap-2">
                      <span className="text-muted">{c.value}</span>
                      <span
                        className={`badge ${c.status === 'Optimal' || c.status === 'Excellent' || c.status === 'Approved' || c.status === 'Online' || c.status === 'Healthy'
                          ? 'bg-success-subtle text-success border border-success-subtle'
                          : 'bg-warning-subtle text-warning border border-warning-subtle'
                          }`}
                      >
                        {c.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="card-footer bg-light p-2.5 d-flex gap-2 justify-content-end border-top">
          <button className="btn btn-xs btn-outline-secondary py-1 px-2.5" onClick={onClose}>
            Dismiss
          </button>
          <button
            className="btn btn-xs btn-primary py-1 px-2.5 d-flex align-items-center gap-1"
            onClick={() => {
              alert(`Downloading Detailed KPI Report for ${details.title}`);
              onClose();
            }}
          >
            <i className="bi bi-file-earmark-pdf" />
            Download PDF
          </button>
        </div>
      </div>
    </div>
  );
};
