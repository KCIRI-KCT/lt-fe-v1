import { useNavigate } from 'react-router-dom';
import { MOCK_CHAINAGES } from '../../services/mockData';
import { MobileModal } from '../../components/common/MobileModal';

interface StationDetailModalProps {
  stationId: string;
  onClose: () => void;
}

export const StationDetailModal = ({ stationId, onClose }: StationDetailModalProps) => {
  const navigate = useNavigate();
  const station = MOCK_CHAINAGES.find((ch) => ch.id === stationId) || MOCK_CHAINAGES[0];

  return (
    <MobileModal
      onClose={onClose}
      title={`${station.name} Station Details`}
      subtitle="Live Operations & Analytics Console"
      icon={<i className="bi bi-pin-angle-fill fs-3" />}
      footer={
        <>
          <button
            className="btn btn-outline-secondary py-2 px-3 fw-semibold rounded-3"
            style={{ fontSize: '14.5px' }}
            onClick={onClose}
          >
            Close
          </button>
          <button
            className="btn btn-outline-primary py-2 px-3 fw-semibold rounded-3 d-flex align-items-center gap-1.5"
            style={{ fontSize: '14.5px' }}
            onClick={() => {
              navigate('/reports');
              onClose();
            }}
          >
            <i className="bi bi-file-earmark-bar-graph" />
            Generate Report
          </button>
          <button
            className="btn btn-primary py-2 px-3 fw-semibold rounded-3 d-flex align-items-center gap-1.5"
            style={{ fontSize: '14.5px' }}
            onClick={() => {
              navigate('/cameras');
              onClose();
            }}
          >
            <i className="bi bi-camera-video" />
            Open Camera
          </button>
        </>
      }
    >
      <div className="row g-4">
        {/* Left Block: Operational Context with Icons */}
        <div className="col-12 col-md-6 border-end pr-md-4 mb-3 mb-md-0">
          <span className="small fw-bold text-muted text-uppercase d-block mb-3" style={{ fontSize: '12px', letterSpacing: '0.8px' }}>
            Operational Context
          </span>

          <div className="d-flex flex-column gap-3" style={{ fontSize: '15px' }}>
            <div className="d-flex align-items-center gap-3">
              <div className="rounded-circle bg-light d-flex align-items-center justify-content-center" style={{ width: 36, height: 36, minWidth: 36 }}>
                <i className="bi bi-folder2-open text-primary" style={{ fontSize: '18px' }} />
              </div>
              <div>
                <div className="text-muted" style={{ fontSize: '12px', fontWeight: 500 }}>Project Name</div>
                <div className="fw-semibold text-dark">{station.project}</div>
              </div>
            </div>

            <div className="d-flex align-items-center gap-3">
              <div className="rounded-circle bg-light d-flex align-items-center justify-content-center" style={{ width: 36, height: 36, minWidth: 36 }}>
                <i className="bi bi-geo-alt text-danger" style={{ fontSize: '18px' }} />
              </div>
              <div>
                <div className="text-muted" style={{ fontSize: '12px', fontWeight: 500 }}>Site Segment</div>
                <div className="fw-semibold text-dark">{station.site}</div>
              </div>
            </div>

            <div className="d-flex align-items-center gap-3">
              <div className="rounded-circle bg-light d-flex align-items-center justify-content-center" style={{ width: 36, height: 36, minWidth: 36 }}>
                <i className="bi bi-person-badge text-success" style={{ fontSize: '18px' }} />
              </div>
              <div>
                <div className="text-muted" style={{ fontSize: '12px', fontWeight: 500 }}>Supervisor</div>
                <div className="fw-semibold text-dark">{station.supervisor}</div>
              </div>
            </div>

            <div className="d-flex align-items-center gap-3">
              <div className="rounded-circle bg-light d-flex align-items-center justify-content-center" style={{ width: 36, height: 36, minWidth: 36 }}>
                <i className="bi bi-person-gear text-info" style={{ fontSize: '18px' }} />
              </div>
              <div>
                <div className="text-muted" style={{ fontSize: '12px', fontWeight: 500 }}>Engineer-In-Charge</div>
                <div className="fw-semibold text-dark">{station.engineer}</div>
              </div>
            </div>

            <div className="d-flex align-items-center gap-3">
              <div className="rounded-circle bg-light d-flex align-items-center justify-content-center" style={{ width: 36, height: 36, minWidth: 36 }}>
                <i className="bi bi-compass text-secondary" style={{ fontSize: '18px' }} />
              </div>
              <div>
                <div className="text-muted" style={{ fontSize: '12px', fontWeight: 500 }}>GPS Coordinates</div>
                <div className="fw-semibold text-dark font-monospace" style={{ fontSize: '13.5px' }}>
                  {station.lat.toFixed(5)}, {station.lng.toFixed(5)}
                </div>
              </div>
            </div>

            <div className="d-flex align-items-center gap-3">
              <div className="rounded-circle bg-light d-flex align-items-center justify-content-center" style={{ width: 36, height: 36, minWidth: 36 }}>
                <i className="bi bi-clock-history text-warning" style={{ fontSize: '18px' }} />
              </div>
              <div>
                <div className="text-muted" style={{ fontSize: '12px', fontWeight: 500 }}>Last Sensor Log</div>
                <div className="fw-semibold text-dark">{station.lastUpdate}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Block: Live Analytics Grid & Progress */}
        <div className="col-12 col-md-6 pl-md-4">
          <span className="small fw-bold text-muted text-uppercase d-block mb-3" style={{ fontSize: '12px', letterSpacing: '0.8px' }}>
            Live Analytics & Progress
          </span>

          {/* Stat Boxes */}
          <div className="row g-2 mb-4" style={{ fontSize: '13.5px' }}>
            <div className="col-6">
              <div className="p-3 border-0 rounded-3 text-center" style={{ background: '#f0fdf4', border: '1px solid #dcfce7' }}>
                <div className="text-success fw-semibold mb-1" style={{ fontSize: '12px' }}>Overall Progress</div>
                <div className="fw-bold fs-3 text-success">{station.progress}%</div>
              </div>
            </div>
            <div className="col-6">
              <div className="p-3 border-0 rounded-3 text-center" style={{ background: '#eff6ff', border: '1px solid #dbeafe' }}>
                <div className="text-primary fw-semibold mb-1" style={{ fontSize: '12px' }}>Safety Score</div>
                <div className="fw-bold fs-3 text-primary">{station.safetyScore}%</div>
              </div>
            </div>
            <div className="col-6">
              <div className="p-3 border-0 rounded-3 text-center" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                <div className="text-muted fw-semibold mb-1" style={{ fontSize: '12px' }}>Active Workers</div>
                <div className="fw-bold fs-3 text-dark">{station.workers}</div>
              </div>
            </div>
            <div
              className="p-3 border-0 rounded-3 text-center"
              style={{
                background: station.aiAlerts > 5 ? '#fef2f2' : '#f0fdf4',
                border: `1px solid ${station.aiAlerts > 5 ? '#fee2e2' : '#dcfce7'}`
              }}
            >
              <div
                className="fw-semibold mb-1"
                style={{ fontSize: '12px', color: station.aiAlerts > 5 ? '#dc2626' : '#16a34a' }}
              >
                Active AI Alerts
              </div>
              <div
                className="fw-bold fs-3"
                style={{ color: station.aiAlerts > 5 ? '#dc2626' : '#16a34a' }}
              >
                {station.aiAlerts}
              </div>
            </div>
          </div>

          {/* Progress Detail Breakdowns */}
          <div className="mt-3" style={{ fontSize: '14.5px' }}>
            <div className="d-flex align-items-center justify-content-between mb-1">
              <span className="fw-medium text-secondary">Highway Progress:</span>
              <strong className="text-dark">{station.highwayProgress}%</strong>
            </div>
            <div className="progress mb-3 rounded-pill" style={{ height: '10px' }}>
              <div className="progress-bar bg-success rounded-pill" style={{ width: `${station.highwayProgress}%` }} />
            </div>

            <div className="d-flex align-items-center justify-content-between mb-1">
              <span className="fw-medium text-secondary">Structural Progress:</span>
              <strong className="text-dark">{station.structuralProgress}%</strong>
            </div>
            <div className="progress rounded-pill" style={{ height: '10px' }}>
              <div className="progress-bar bg-primary rounded-pill" style={{ width: `${station.structuralProgress}%` }} />
            </div>
          </div>
        </div>
      </div>
    </MobileModal>
  );
};