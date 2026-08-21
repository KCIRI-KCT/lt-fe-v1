import { useState, useEffect } from 'react';
import { useApp } from '../../hooks/useApp';
import { projectService } from '../../services/projectService';
import { siteService } from '../../services/siteService';
import type { ReportHistoryItem, ReportFileFormat, Project, Site, ChainageData } from '../../types';

const REPORT_TYPES = [
  'All Report',
  'Weekly Progress Summary',
  'Highway Construction Progress',
  'Structural Work Log',
  'Equipment & Machinery Utilization',
  'Workforce Attendance Log',
  'Quality Inspection & Cube Tests',
  'Financial Burn & Budget Variance',
];

const SAFETY_REPORT_TYPES = [
  'Daily Safety & AI Incident Summary',
  'PPE Compliance & Violation Log',
  'Intrusion & Hazard Detection Log',
  'Audit & Corrective Action Report',
];

interface GenerateReportModalProps {
  show: boolean;
  onClose: () => void;
  onGenerate: (report: ReportHistoryItem) => void;
}

export const GenerateReportModal = ({ show, onClose, onGenerate }: GenerateReportModalProps) => {
  const { user } = useApp();
  const role = user.role;
  const [project, setProject] = useState('');
  const [site, setSite] = useState('');
  const [chainage, setChainage] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [fileFormat, setFileFormat] = useState<ReportFileFormat>('PDF');
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [prevShow, setPrevShow] = useState(show);

  const [projectsList, setProjectsList] = useState<Project[]>([]);
  const [sitesList, setSitesList] = useState<Site[]>([]);
  const [chainagesList, setChainagesList] = useState<ChainageData[]>([]);

  useEffect(() => {
    projectService.getProjects()
      .then((data) => setProjectsList(data))
      .catch(() => null);
    siteService.getSites()
      .then((data) => setSitesList(data))
      .catch(() => null);
    siteService.getChainages()
      .then((data) => setChainagesList(data as unknown as ChainageData[]))
      .catch(() => null);
  }, []);

  // Reset form when modal opens (adjusted during render to avoid cascading renders in useEffect)
  if (show !== prevShow) {
    setPrevShow(show);
    if (show) {
      setProject('');
      setSite('');
      setChainage('');
      setSelectedTypes([]);
      setFileFormat('PDF');
      setIsGenerating(false);
      setProgress(0);
    }
  }

  const isProjectManager = role === 'project_manager' || role === 'admin';
  const isSafetyRole = role === 'safety_officer' || role === 'safety_manager';

  const handleTypeToggle = (type: string) => {
    if (type === 'All Report') {
      if (selectedTypes.includes('All Report')) {
        setSelectedTypes([]);
      } else {
        setSelectedTypes([...REPORT_TYPES]);
      }
      return;
    }
    const newTypes = selectedTypes.includes(type)
      ? selectedTypes.filter((t) => t !== type)
      : [...selectedTypes, type];
    // Remove "All Report" if individual types are toggled
    const filtered = newTypes.filter((t) => t !== 'All Report');
    setSelectedTypes(filtered);
  };

  const handleGenerate = () => {
    setIsGenerating(true);
    setProgress(0);

    // Simulate generation with progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + 20;
        if (next >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            const newReport: ReportHistoryItem = {
              id: Date.now(),
              reportName: selectedTypes.length > 0
                ? `${selectedTypes[0]} - ${site || 'All Sites'}`
                : `Report - ${site || 'All Sites'}`,
              reportType: selectedTypes.length > 0 ? selectedTypes[0] : 'General Report',
              project: project || 'All Projects',
              site: site || 'All Sites',
              chainage: chainage || 'All Chainages',
              generatedBy: String(role).replace(/_/g, ' '),
              generatedDate: new Date().toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              }),
              status: 'Ready',
              format: fileFormat,
            };
            setIsGenerating(false);
            onGenerate(newReport);
            onClose();
          }, 500);
          return 100;
        }
        return next;
      });
    }, 400);
  };

  if (!show) return null;

  return (
    <div className="modal-backdrop-custom" onClick={onClose}>
      <div
        className="modal-dialog-custom"
        onClick={(e) => e.stopPropagation()}
        style={{
          animation: 'modalSlideIn 0.3s ease-out',
        }}
      >
        <div className="modal-content-custom">
          {/* Header */}
          <div className="d-flex align-items-center justify-content-between p-3 border-bottom">
            <h5 className="mb-0 fw-bold">
              <i className="bi bi-file-earmark-plus me-2" />
              Generate Report
            </h5>
            <button className="btn btn-sm btn-outline-secondary border-0" onClick={onClose}>
              <i className="bi bi-x-lg" />
            </button>
          </div>

          {/* Body */}
          <div className="p-3" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
            {/* Project Manager: Project dropdown */}
            {isProjectManager && (
              <div className="mb-3">
                <label className="form-label fw-semibold small text-uppercase text-muted">Project</label>
                <select
                  className="form-select"
                  value={project}
                  onChange={(e) => setProject(e.target.value)}
                >
                  <option value="">Select Project</option>
                  {projectsList.map((p) => (
                    <option key={p.id} value={p.name}>{p.name}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Site dropdown (all roles except PM has it as first field) */}
            <div className="mb-3">
              <label className="form-label fw-semibold small text-uppercase text-muted">Site</label>
              <select
                className="form-select"
                value={site}
                onChange={(e) => setSite(e.target.value)}
              >
                <option value="">Select Site</option>
                {sitesList
                  .filter((s) => !project || s.projectName === project)
                  .map((s) => (
                    <option key={s.id} value={s.name}>{s.name}</option>
                  ))}
              </select>
            </div>

            {/* Chainage dropdown */}
            <div className="mb-3">
              <label className="form-label fw-semibold small text-uppercase text-muted">Chainage</label>
              <select
                className="form-select"
                value={chainage}
                onChange={(e) => setChainage(e.target.value)}
              >
                <option value="">Select Chainage</option>
                {chainagesList
                  .filter((c) => !site || c.site === site)
                  .map((c) => (
                    <option key={c.id} value={c.name || c.id}>{c.name || c.id}</option>
                  ))}
              </select>
            </div>

            {/* Report Type - Checkboxes for PM and Site roles, Dropdown for Safety roles */}
            <div className="mb-3">
              <label className="form-label fw-semibold small text-uppercase text-muted">Report Type</label>
              {isSafetyRole ? (
                <select
                  className="form-select"
                  value={selectedTypes[0] || ''}
                  onChange={(e) => setSelectedTypes(e.target.value ? [e.target.value] : [])}
                >
                  <option value="">Select Report Type</option>
                  {SAFETY_REPORT_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              ) : (
                <div className="d-flex flex-column gap-2 mt-1">
                  {REPORT_TYPES.map((type) => (
                    <label
                      key={type}
                      className="d-flex align-items-center gap-2 p-2 rounded border report-type-checkbox"
                      style={{
                        cursor: 'pointer',
                        background: selectedTypes.includes(type) ? 'var(--admin-primary)' : 'var(--admin-surface-soft)',
                        color: selectedTypes.includes(type) ? '#fff' : 'var(--admin-text)',
                        borderColor: selectedTypes.includes(type) ? 'var(--admin-primary)' : 'var(--admin-border)',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <input
                        type="checkbox"
                        className="form-check-input"
                        checked={selectedTypes.includes(type)}
                        onChange={() => handleTypeToggle(type)}
                        style={{ margin: 0 }}
                      />
                      <span className="small fw-semibold">{type}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* File Format */}
            <div className="mb-3">
              <label className="form-label fw-semibold small text-uppercase text-muted">File Format</label>
              <select
                className="form-select"
                value={fileFormat}
                onChange={(e) => setFileFormat(e.target.value as ReportFileFormat)}
              >
                <option value="PDF">PDF</option>
                <option value="CSV">CSV</option>
              </select>
            </div>

            {/* Progress bar */}
            {isGenerating && (
              <div className="mb-3">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <span className="small fw-semibold text-muted">Generating...</span>
                  <span className="small fw-semibold text-muted">{progress}%</span>
                </div>
                <div className="progress" style={{ height: '8px', borderRadius: '4px' }}>
                  <div
                    className="progress-bar progress-bar-striped progress-bar-animated"
                    role="progressbar"
                    style={{ width: `${progress}%`, background: 'var(--admin-primary)' }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="d-flex justify-content-end gap-2 p-3 border-top">
            <button className="btn btn-outline-secondary" onClick={onClose} disabled={isGenerating}>
              Cancel
            </button>
            <button
              className="btn btn-primary"
              onClick={handleGenerate}
              disabled={isGenerating || !site || selectedTypes.length === 0}
            >
              {isGenerating ? (
                <>
                  <span className="spinner-border spinner-border-sm me-1" role="status" />
                  Generating...
                </>
              ) : (
                <>
                  <i className="bi bi-file-earmark-plus me-1" />
                  Generate Report
                </>
              )}
            </button>
          </div>
        </div>

        {/* Inline styles for modal */}
        <style>{`
          @keyframes modalSlideIn {
            from {
              opacity: 0;
              transform: translateY(-20px) scale(0.95);
            }
            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }
          .modal-backdrop-custom {
            position: fixed;
            inset: 0;
            z-index: 1055;
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(15, 23, 42, 0.6);
            backdrop-filter: blur(4px);
            padding: 1rem;
          }
          .modal-dialog-custom {
            width: 100%;
            max-width: 520px;
            max-height: 90vh;
            background: #fff;
            border-radius: 12px;
            box-shadow: 0 25px 60px rgba(15, 23, 42, 0.25);
            overflow: hidden;
          }
          .modal-content-custom {
            display: flex;
            flex-direction: column;
          }
          .report-type-checkbox:hover {
            transform: translateX(2px);
          }
          .report-type-checkbox input[type="checkbox"] {
            width: 18px;
            height: 18px;
            cursor: pointer;
          }
        `}</style>
      </div>
    </div>
  );
};