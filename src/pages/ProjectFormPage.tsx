// ============================================================================
// Project Form Page — Custom form to manage Projects & Nested Sites/Chainage
// ============================================================================

import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { projectService } from '../services/projectService';
import { employeeService } from '../services/employeeService';
import type { Project, NestedSite, ProjectRoleAssignment, UserProfile, State, City } from '../types';

const DEFAULT_STATES: State[] = [
  { id: 'tn', name: 'Tamil Nadu', countryId: 'in' },
  { id: 'ka', name: 'Karnataka', countryId: 'in' },
  { id: 'mh', name: 'Maharashtra', countryId: 'in' },
  { id: 'dl', name: 'Delhi', countryId: 'in' },
  { id: 'tg', name: 'Telangana', countryId: 'in' },
];

const DEFAULT_CITIES: City[] = [
  { id: 'chennai', name: 'Chennai', stateId: 'tn' },
  { id: 'coimbatore', name: 'Coimbatore', stateId: 'tn' },
  { id: 'bangalore', name: 'Bengaluru', stateId: 'ka' },
  { id: 'mumbai', name: 'Mumbai', stateId: 'mh' },
  { id: 'pune', name: 'Pune', stateId: 'mh' },
  { id: 'delhi', name: 'New Delhi', stateId: 'dl' },
  { id: 'hyderabad', name: 'Hyderabad', stateId: 'tg' },
];

interface RoleAssignment {
  userId: string;
  siteId: string;
}

export const ProjectFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id && id !== 'add';

  const today = new Date().toISOString().split('T')[0];
  const defaultEndDate = new Date(new Date().setFullYear(new Date().getFullYear() + 2)).toISOString().split('T')[0];

  // Project Info States
  const [projectData, setProjectData] = useState<Project | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [cityId, setCityId] = useState('');
  const [stateId, setStateId] = useState('');
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(defaultEndDate);
  const [usersList, setUsersList] = useState<UserProfile[]>([]);

  // User Assignments States
  const [managers, setManagers] = useState<RoleAssignment[]>([{ userId: '', siteId: '' }]);
  const [supervisors, setSupervisors] = useState<RoleAssignment[]>([{ userId: '', siteId: '' }]);
  const [engineers, setEngineers] = useState<RoleAssignment[]>([{ userId: '', siteId: '' }]);
  const [safetyOfficers, setSafetyOfficers] = useState<RoleAssignment[]>([{ userId: '', siteId: '' }]);
  const [safetyEngineers, setSafetyEngineers] = useState<RoleAssignment[]>([{ userId: '', siteId: '' }]);

  // Nested Sites States
  const [sites, setSites] = useState<NestedSite[]>([]);

  // New Site Input States
  const [newSiteName, setNewSiteName] = useState('');
  const [newSiteNumber, setNewSiteNumber] = useState('');
  const [newChainageName, setNewChainageName] = useState('');
  const [newChainageKm, setNewChainageKm] = useState('');

  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    employeeService.getEmployees()
      .then((users) => setUsersList(users))
      .catch(() => null);

    if (isEdit && id) {
      projectService.getProject(id)
        .then((proj) => {
          if (proj) {
            setProjectData(proj);
            setName(proj.name || '');
            setDescription(proj.description || '');
            setCityId(proj.cityId || '');
            const cObj = DEFAULT_CITIES.find(c => c.id === proj.cityId);
            if (cObj) setStateId(cObj.stateId);
            setStartDate(proj.startDate || today);
            setEndDate(proj.endDate || defaultEndDate);
            if (proj.sites) setSites(proj.sites);

            if (proj.roleAssignments && proj.roleAssignments.length > 0) {
              const mgrs = proj.roleAssignments.filter(ra => ra.role === 'project_manager').map(ra => ({ userId: ra.userId, siteId: ra.siteId }));
              if (mgrs.length > 0) setManagers(mgrs);

              const sups = proj.roleAssignments.filter(ra => ra.role === 'site_supervisor').map(ra => ({ userId: ra.userId, siteId: ra.siteId }));
              if (sups.length > 0) setSupervisors(sups);

              const engs = proj.roleAssignments.filter(ra => ra.role === 'site_engineer').map(ra => ({ userId: ra.userId, siteId: ra.siteId }));
              if (engs.length > 0) setEngineers(engs);

              const sOffs = proj.roleAssignments.filter(ra => ra.role === 'safety_officer').map(ra => ({ userId: ra.userId, siteId: ra.siteId }));
              if (sOffs.length > 0) setSafetyOfficers(sOffs);

              const sEngs = proj.roleAssignments.filter(ra => ra.role === 'safety_engineer').map(ra => ({ userId: ra.userId, siteId: ra.siteId }));
              if (sEngs.length > 0) setSafetyEngineers(sEngs);
            }
          }
        })
        .catch(() => null);
    }
  }, [isEdit, id, today, defaultEndDate]);

  // Handle State Change -> Reset City
  const handleStateChange = (selectedStateId: string) => {
    setStateId(selectedStateId);
    setCityId(''); // Reset selected city
  };

  // Filter cities by state
  const filteredCities = DEFAULT_CITIES.filter((c) => c.stateId === stateId);

  // Add Site to List
  const handleAddSite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSiteName.trim() || !newSiteNumber.trim() || !newChainageName.trim() || !newChainageKm.trim()) {
      setErrorMsg('Please fill in all site and chainage fields.');
      return;
    }

    const km = Number(newChainageKm);
    if (isNaN(km) || km <= 0) {
      setErrorMsg('Chainage Kilometers must be a valid positive number.');
      return;
    }

    const newSite: NestedSite = {
      id: Date.now().toString(),
      siteName: newSiteName.trim(),
      siteNumber: newSiteNumber.trim(),
      chainageName: newChainageName.trim(),
      chainageKm: km
    };

    setSites((prev) => [...prev, newSite]);
    setNewSiteName('');
    setNewSiteNumber('');
    setNewChainageName('');
    setNewChainageKm('');
    setErrorMsg('');
  };

  // Remove Site from List
  const handleRemoveSite = (siteIdToRemove: string) => {
    setSites((prev) => prev.filter((s) => s.id !== siteIdToRemove));
  };

  // Save Project
  const handleSaveProject = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !cityId || !stateId || !startDate) {
      setErrorMsg('Please complete all project details.');
      return;
    }

    if (sites.length === 0) {
      setErrorMsg('You must add at least one site with chainage details before saving.');
      return;
    }

    // Check if any role assignment is incomplete
    const isAnyAssignmentIncomplete = (arr: RoleAssignment[]) => {
      return arr.some(item => !item.userId || !item.siteId);
    };

    if (
      isAnyAssignmentIncomplete(managers) ||
      isAnyAssignmentIncomplete(supervisors) ||
      isAnyAssignmentIncomplete(engineers) ||
      isAnyAssignmentIncomplete(safetyOfficers) ||
      isAnyAssignmentIncomplete(safetyEngineers)
    ) {
      setErrorMsg('Please complete all role assignments and site allocations.');
      return;
    }

    const selectedState = DEFAULT_STATES.find((s) => s.id === stateId);
    const selectedCity = DEFAULT_CITIES.find((c) => c.id === cityId);

    // Build the project role assignments list
    const roleAssignments: ProjectRoleAssignment[] = [];
    const addAssignments = (arr: RoleAssignment[], role: ProjectRoleAssignment['role']) => {
      arr.forEach(item => {
        const u = usersList.find(user => user.id === item.userId);
        const s = sites.find(site => site.id === item.siteId);
        if (u && s) {
          roleAssignments.push({
            role,
            userId: item.userId,
            userName: u.name,
            siteId: item.siteId,
            siteName: s.siteName
          });
        }
      });
    };

    addAssignments(managers, 'project_manager');
    addAssignments(supervisors, 'site_supervisor');
    addAssignments(engineers, 'site_engineer');
    addAssignments(safetyOfficers, 'safety_officer');
    addAssignments(safetyEngineers, 'safety_engineer');

    const firstManager = roleAssignments.find(ra => ra.role === 'project_manager');
    const firstSupervisor = roleAssignments.find(ra => ra.role === 'site_supervisor');
    const firstEngineer = roleAssignments.find(ra => ra.role === 'site_engineer');

    const projPayload: Partial<Project> = {
      id: isEdit && projectData ? projectData.id : undefined,
      name: name.trim(),
      code: projectData?.code || `PRJ-${Date.now().toString().slice(-4)}`,
      description: description.trim(),
      cityId,
      cityName: selectedCity?.name || '',
      stateName: selectedState?.name || '',
      startDate,
      endDate,
      status: projectData?.status || 'active',
      budget: projectData?.budget || 10000000,
      progress: projectData?.progress || 0,
      managerId: firstManager?.userId || '',
      managerName: firstManager?.userName || '',
      supervisorId: firstSupervisor?.userId || '',
      supervisorName: firstSupervisor?.userName || '',
      engineerId: firstEngineer?.userId || '',
      engineerName: firstEngineer?.userName || '',
      siteCount: sites.length,
      workerCount: projectData?.workerCount || 150,
      sites: sites,
      roleAssignments
    };

    if (isEdit && projectData) {
      projectService.updateProject(projectData.id, projPayload as Project).then(() => navigate('/projects')).catch(() => navigate('/projects'));
    } else {
      projectService.createProject(projPayload as Project).then(() => navigate('/projects')).catch(() => navigate('/projects'));
    }
  };

  const renderRoleSection = (
    label: string,
    assignments: RoleAssignment[],
    setAssignments: React.Dispatch<React.SetStateAction<RoleAssignment[]>>,
    userFilterRole: string,
    isRequired = false
  ) => {
    const users = usersList.filter((u) => {
      if (userFilterRole === 'safety_engineer') {
        return u.role === 'safety_manager' || u.role === 'site_engineer';
      }
      return u.role === userFilterRole;
    });

    const handleAdd = () => {
      setAssignments((prev) => [...prev, { userId: '', siteId: '' }]);
    };

    const handleRemove = (index: number) => {
      setAssignments((prev) => prev.filter((_, idx) => idx !== index));
    };

    const handleChange = (index: number, field: 'userId' | 'siteId', value: string) => {
      setAssignments((prev) => {
        const copy = [...prev];
        copy[index] = { ...copy[index], [field]: value };
        return copy;
      });
    };

    return (
      <div className="mb-4 pb-3 border-bottom">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <label className="form-label small fw-bold mb-0">
            {label} {isRequired ? '*' : ''}
          </label>
          {!isCompleted && (
            <button
              type="button"
              className="btn btn-sm btn-outline-primary py-0 px-2 d-flex align-items-center gap-1"
              style={{ fontSize: '0.75rem' }}
              onClick={handleAdd}
            >
              <i className="bi bi-plus-lg" />
            </button>
          )}
        </div>
        <div className="d-grid gap-2">
          {assignments.map((assignment, index) => (
            <div key={index} className="d-flex align-items-center gap-2">
              <div className="flex-grow-1">
                <select
                  className="form-select form-select-sm"
                  value={assignment.userId}
                  onChange={(e) => handleChange(index, 'userId', e.target.value)}
                  required={isRequired}
                  disabled={isCompleted}
                >
                  <option value="">Select Personnel</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex-grow-1">
                <select
                  className="form-select form-select-sm"
                  value={assignment.siteId}
                  onChange={(e) => handleChange(index, 'siteId', e.target.value)}
                  required={isRequired}
                  disabled={sites.length === 0 || isCompleted}
                >
                  <option value="">Select Allocated Site</option>
                  {sites.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.siteName} ({s.siteNumber})
                    </option>
                  ))}
                </select>
              </div>
              {assignments.length > 1 && !isCompleted && (
                <button
                  type="button"
                  className="btn btn-sm btn-outline-danger"
                  onClick={() => handleRemove(index)}
                >
                  <i className="bi bi-dash-lg" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Helper to calculate weeks
  const getWeeksCount = (startStr: string, endStr: string) => {
    if (!startStr || !endStr) return { finished: 0, remaining: 0 };
    const todayDate = new Date();
    const start = new Date(startStr);
    const end = new Date(endStr);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return { finished: 0, remaining: 0 };

    let finished = 0;
    if (todayDate.getTime() > start.getTime()) {
      const elapsedMs = Math.min(todayDate.getTime(), end.getTime()) - start.getTime();
      finished = Math.max(0, Math.ceil(elapsedMs / (1000 * 60 * 60 * 24 * 7)));
    }
    
    let remaining = 0;
    if (todayDate.getTime() < end.getTime()) {
      const remainingMs = end.getTime() - Math.max(todayDate.getTime(), start.getTime());
      remaining = Math.max(0, Math.ceil(remainingMs / (1000 * 60 * 60 * 24 * 7)));
    }
    
    return { finished, remaining };
  };

  const { finished: finishedWeeks, remaining: remainingWeeks } = getWeeksCount(startDate, endDate);
  const isCompleted = isEdit && projectData?.status === 'completed';

  return (
    <div className="container-fluid px-3 px-lg-4 py-4">
      <div className="page-heading">
        <div className="page-heading-copy">
          <span className="page-icon"><i className="bi bi-building" aria-hidden="true" /></span>
          <div>
            <p className="eyebrow mb-1">Project Management</p>
            <h1 className="h3 mb-1">{isEdit ? 'Edit Project' : 'Create Project'}</h1>
            <p className="text-muted mb-0">Define project settings, assign role-based personnel, and add site details.</p>
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="alert alert-danger d-flex align-items-center gap-2 mt-3" role="alert">
          <i className="bi bi-exclamation-triangle-fill" />
          <div>{errorMsg}</div>
        </div>
      )}

      {isCompleted && (
        <div className="alert alert-warning d-flex align-items-center gap-2 mt-3 animate-fade-in" role="alert">
          <i className="bi bi-lock-fill" style={{ fontSize: '1.25rem' }} />
          <div>
            <strong>Project Completed:</strong> This project is marked as completed. Edits are disabled, and only viewing is permitted.
          </div>
        </div>
      )}

      <form onSubmit={handleSaveProject} className="mt-3">
        <div className="row g-3">
          {/* Main Info Panel */}
          <div className="col-12 col-xl-7">
            <div className="panel p-4">
              <h5 className="fw-bold mb-3 border-bottom pb-2">Project Information</h5>

              <div className="mb-3">
                <label className="form-label small fw-bold">Project Name *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter project name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isCompleted}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label small fw-bold">Project Description</label>
                <textarea
                  className="form-control"
                  rows={3}
                  placeholder="Describe project details, client, or deliverables"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={isCompleted}
                />
              </div>

              <div className="row g-3 mb-3">
                <div className="col-6">
                  <label className="form-label small fw-bold">State *</label>
                  <select
                    className="form-select"
                    value={stateId}
                    onChange={(e) => handleStateChange(e.target.value)}
                    disabled={isCompleted}
                    required
                  >
                    <option value="">Select State</option>
                    {DEFAULT_STATES.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div className="col-6">
                  <label className="form-label small fw-bold">City *</label>
                  <select
                    className="form-select"
                    value={cityId}
                    onChange={(e) => setCityId(e.target.value)}
                    disabled={!stateId || isCompleted}
                    required
                  >
                    <option value="">Select City</option>
                    {filteredCities.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="row g-3 mb-3">
                <div className="col-6">
                  <label className="form-label small fw-bold">Start Date *</label>
                  <input
                    type="date"
                    className="form-control"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    disabled={isCompleted}
                    required
                  />
                </div>
                <div className="col-6">
                  <label className="form-label small fw-bold">End Date *</label>
                  <input
                    type="date"
                    className="form-control"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    disabled={isCompleted}
                    required
                  />
                </div>
              </div>

              {startDate && endDate && (
                <div className="p-3 bg-light rounded border small d-flex gap-4 align-items-center mb-3">
                  <div>
                    <span className="text-muted">Finished Weeks:</span>{' '}
                    <strong className="text-success" style={{ fontSize: '1rem' }}>{finishedWeeks}</strong>
                  </div>
                  <div className="vr" style={{ height: '20px' }}></div>
                  <div>
                    <span className="text-muted">Remaining Weeks:</span>{' '}
                    <strong className="text-primary" style={{ fontSize: '1rem' }}>{remainingWeeks}</strong>
                  </div>
                </div>
              )}
            </div>

            {/* Assignments Panel */}
            <div className="panel p-4 mt-3">
              <h5 className="fw-bold mb-3 border-bottom pb-2">Role Assignments</h5>
              <div className="row g-3">
                <div className="col-12 col-md-6 col-xxl-4">
                  {renderRoleSection('Project Manager', managers, setManagers, 'project_manager', true)}
                </div>
                <div className="col-12 col-md-6 col-xxl-4">
                  {renderRoleSection('Site Supervisor', supervisors, setSupervisors, 'site_supervisor', true)}
                </div>
                <div className="col-12 col-md-6 col-xxl-4">
                  {renderRoleSection('Site Engineer', engineers, setEngineers, 'site_engineer', true)}
                </div>
                <div className="col-12 col-md-6 col-xxl-4">
                  {renderRoleSection('Safety Officer', safetyOfficers, setSafetyOfficers, 'safety_officer', true)}
                </div>
                <div className="col-12 col-md-6 col-xxl-4">
                  {renderRoleSection('Safety Engineer', safetyEngineers, setSafetyEngineers, 'safety_engineer', true)}
                </div>
              </div>
            </div>

          </div>

          {/* Sites Creation Panel */}
          <div className="col-12 col-xl-5">
            <div className="panel p-4 h-100 d-flex flex-column">
              <h5 className="fw-bold mb-3 border-bottom pb-2">Sites & Chainage List *</h5>

              {/* Added Sites Scroll Container */}
              <div className="flex-grow-1 mb-3 overflow-auto" style={{ maxHeight: '240px', minHeight: '150px' }}>
                {sites.length === 0 ? (
                  <div className="text-center py-4 text-muted bg-light rounded border border-dashed">
                    <i className="bi bi-geo-alt fs-2 d-block mb-1" />
                    <small>No sites added yet. Add at least one site below.</small>
                  </div>
                ) : (
                  <div className="d-grid gap-2">
                    {sites.map((s) => (
                      <div key={s.id} className="p-2 border rounded bg-light d-flex justify-content-between align-items-center">
                        <div>
                          <p className="fw-semibold small mb-0">{s.siteName} ({s.siteNumber})</p>
                          <small className="text-muted">{s.chainageName} - CH 0+{s.chainageKm}</small>
                        </div>
                        {!isCompleted && (
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger border-0"
                            onClick={() => handleRemoveSite(s.id)}
                          >
                            <i className="bi bi-trash" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Add Site Inline Form */}
              {!isCompleted && (
                <div className="p-3 border rounded bg-light">
                  <h6 className="fw-bold mb-2 small text-uppercase text-secondary">Add New Site & Chainage</h6>

                  <div className="mb-2">
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="Site Name (e.g., Valluvarkottam Segment)"
                      value={newSiteName}
                      onChange={(e) => setNewSiteName(e.target.value)}
                    />
                  </div>
                  <div className="row g-2 mb-2">
                    <div className="col-6">
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="Site Number (e.g., S-101)"
                        value={newSiteNumber}
                        onChange={(e) => setNewSiteNumber(e.target.value)}
                      />
                    </div>
                    <div className="col-6">
                      <input
                        type="number"
                        step="0.01"
                        className="form-control form-control-sm"
                        placeholder="Chainage KM (e.g., 12.5)"
                        value={newChainageKm}
                        onChange={(e) => setNewChainageKm(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="mb-2">
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="Chainage Name (e.g., Chennai North Line)"
                      value={newChainageName}
                      onChange={(e) => setNewChainageName(e.target.value)}
                    />
                  </div>

                  <button
                    type="button"
                    className="btn btn-secondary btn-sm w-100"
                    onClick={handleAddSite}
                  >
                    <i className="bi bi-plus-lg me-1" /> Add Site & Chainage
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="mt-3 d-flex gap-2">
          {!isCompleted ? (
            <>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={sites.length === 0}
              >
                {isEdit ? 'Update Project' : 'Save Project'}
              </button>
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => navigate('/projects')}
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => navigate('/projects')}
            >
              <i className="bi bi-arrow-left me-1" /> Back to Projects List
            </button>
          )}
          {sites.length === 0 && !isCompleted && (
            <span className="text-danger small align-self-center ms-2">
              * Add site details first to enable saving.
            </span>
          )}
        </div>
      </form>
    </div>
  );
};