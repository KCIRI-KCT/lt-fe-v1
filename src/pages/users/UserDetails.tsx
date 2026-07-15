import { useParams, Link } from 'react-router-dom';
import { MOCK_USERS } from '../../services/mockData';
import { ROLE_LABELS, ROLE_COLORS } from '../../constants';

export const UserDetails = () => {
  const { id } = useParams();
  const user = MOCK_USERS.find((u) => u.id === id);

  if (!user) {
    return (
      <div className="container-fluid px-3 px-lg-4 py-4">
        <div className="panel blank-panel">
          <div className="blank-state">
            <i className="bi bi-person-x fs-1 text-muted mb-3 d-block" />
            <h4 className="fw-bold mb-2">User Not Found</h4>
            <Link className="btn btn-primary btn-sm" to="/users">Back to Users</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid px-3 px-lg-4 py-4">
      <div className="page-heading">
        <div className="page-heading-copy">
          <span className="page-icon"><i className="bi bi-person-badge" aria-hidden="true" /></span>
          <div>
            <p className="eyebrow mb-1">User Profile</p>
            <h1 className="h3 mb-1">{user.name}</h1>
            <p className="text-muted mb-0">{user.email}</p>
          </div>
        </div>
        <div className="heading-actions">
          <Link className="btn btn-outline-secondary btn-sm" to="/users">Back</Link>
          <button className="btn btn-primary btn-sm"><i className="bi bi-pencil" /> Edit</button>
        </div>
      </div>

      <div className="row g-3 mt-1">
        <div className="col-12">
          <div className="panel">
            <div className="panel-header">
              <div>
                <h2 className="h5 mb-1 section-title"><i className="bi bi-person-badge" /><span>User Information</span></h2>
              </div>
            </div>
            <div className="row g-3">
              <div className="col-6 col-md-3">
                <div className="mini-card p-3">
                  <span className="small text-muted">Name</span>
                  <strong className="d-block">{user.name}</strong>
                </div>
              </div>
              <div className="col-6 col-md-3">
                <div className="mini-card p-3">
                  <span className="small text-muted">Email</span>
                  <strong className="d-block">{user.email}</strong>
                </div>
              </div>
              <div className="col-6 col-md-3">
                <div className="mini-card p-3">
                  <span className="small text-muted">Role</span>
                  <strong className="d-block"><span className={`badge ${ROLE_COLORS[user.role]}`}>{ROLE_LABELS[user.role]}</span></strong>
                </div>
              </div>
              <div className="col-6 col-md-3">
                <div className="mini-card p-3">
                  <span className="small text-muted">Department</span>
                  <strong className="d-block">{user.department || 'N/A'}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-xl-8">
          <div className="panel">
            <div className="panel-header">
              <div>
                <h2 className="h5 mb-1 section-title"><i className="bi bi-shield-check" /><span>Permissions</span></h2>
                <p className="text-muted mb-0">Role-based access control for this user.</p>
              </div>
            </div>
            <div className="d-flex flex-wrap gap-2">
              <span className="badge text-bg-primary">View Projects</span>
              <span className="badge text-bg-primary">View Sites</span>
              <span className="badge text-bg-primary">View Workforce</span>
              <span className="badge text-bg-primary">Send Messages</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};