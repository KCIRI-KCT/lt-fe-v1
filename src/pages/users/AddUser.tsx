import { Link } from 'react-router-dom';

export const AddUser = () => (
  <div className="container-fluid px-3 px-lg-4 py-4">
    <div className="page-heading">
      <div className="page-heading-copy">
        <span className="page-icon"><i className="bi bi-person-plus" aria-hidden="true" /></span>
        <div>
          <p className="eyebrow mb-1">Users</p>
          <h1 className="h3 mb-1">Add User</h1>
          <p className="text-muted mb-0">Create a new user account with role and team assignments.</p>
        </div>
      </div>
      <div className="heading-actions">
        <Link className="btn btn-outline-secondary btn-sm" to="/users">
          <i className="bi bi-arrow-left" aria-hidden="true" /> Back to Users
        </Link>
      </div>
    </div>

    <div className="panel mt-1">
      <form className="needs-validation" noValidate>
        <div className="row g-3">
          <div className="col-12 col-md-6">
            <label htmlFor="addName" className="form-label fw-semibold">Full Name</label>
            <input type="text" className="form-control" id="addName" placeholder="Enter full name" required />
            <div className="invalid-feedback">Please enter a name.</div>
          </div>
          <div className="col-12 col-md-6">
            <label htmlFor="addEmail" className="form-label fw-semibold">Email</label>
            <input type="email" className="form-control" id="addEmail" placeholder="name@example.com" required />
            <div className="invalid-feedback">Please provide a valid email.</div>
          </div>
          <div className="col-12 col-md-6">
            <label htmlFor="addRole" className="form-label fw-semibold">Role</label>
            <select className="form-select" id="addRole" required>
              <option value="">Choose...</option>
              <option>Admin</option>
              <option>Manager</option>
              <option>Editor</option>
              <option>Viewer</option>
              <option>Analyst</option>
            </select>
            <div className="invalid-feedback">Please select a role.</div>
          </div>
          <div className="col-12 col-md-6">
            <label htmlFor="addTeam" className="form-label fw-semibold">Team</label>
            <select className="form-select" id="addTeam">
              <option>Operations</option>
              <option>Sales</option>
              <option>Content</option>
              <option>Finance</option>
              <option>Data</option>
            </select>
          </div>
        </div>
        <div className="mt-4 d-flex gap-2">
          <button className="btn btn-primary" type="submit">
            <i className="bi bi-person-plus" aria-hidden="true" /> Create User
          </button>
          <Link className="btn btn-light" to="/users">Cancel</Link>
        </div>
      </form>
    </div>
  </div>
);