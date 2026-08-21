import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectService } from '../services/projectService';
import type { Project } from '../types';

export const ProjectEditPage = () => {
  const navigate = useNavigate();
  const [selectedProjId, setSelectedProjId] = useState<string>('');
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    projectService.getProjects()
      .then((data) => setProjects(data))
      .catch(() => null);
  }, []);

  return (
    <div className="container-fluid px-3 px-lg-4 py-4">
      <div className="page-heading">
        <div className="page-heading-copy">
          <span className="page-icon"><i className="bi bi-building" aria-hidden="true" /></span>
          <div>
            <p className="eyebrow mb-1">Project Management</p>
            <h1 className="h3 mb-1">Update Project</h1>
            <p className="text-muted mb-0">Select a project to update details.</p>
          </div>
        </div>
      </div>

      <div className="panel mt-3">
        <div className="mb-4 col-md-6">
          <label htmlFor="projectSelect" className="form-label fw-bold">Select Project to Update</label>
          <select
            id="projectSelect"
            className="form-select"
            value={selectedProjId}
            onChange={(e) => {
              const val = e.target.value;
              setSelectedProjId(val);
              if (val) {
                navigate(`/projects/${val}`);
              }
            }}
          >
            <option value="">-- Choose Project --</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.code})
              </option>
            ))}
          </select>
        </div>

        <div className="text-center py-5 text-muted border-top">
          <i className="bi bi-folder2-open fs-1 mb-3 d-block" />
          <p className="mb-0">Please select a project from the dropdown above to start editing.</p>
        </div>
      </div>
    </div>
  );
};
