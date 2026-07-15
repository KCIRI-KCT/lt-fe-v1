export const Forms = () => (
  <div className="container-fluid px-3 px-lg-4 py-4">
    <div className="page-heading">
      <div className="page-heading-copy">
        <span className="page-icon"><i className="bi bi-ui-checks-grid" aria-hidden="true" /></span>
        <div>
          <p className="eyebrow mb-1">Input</p>
          <h1 className="h3 mb-1">Forms</h1>
          <p className="text-muted mb-0">Form layouts, validation, and input components.</p>
        </div>
      </div>
    </div>
    <div className="row g-3 mt-1">
      <div className="col-12 col-xl-6">
        <div className="panel">
          <h2 className="h5 mb-3 section-title"><i className="bi bi-person-vcard" aria-hidden="true" /><span>Personal Info</span></h2>
          <form className="needs-validation" noValidate>
            <div className="mb-3">
              <label htmlFor="fullName" className="form-label fw-semibold">Full Name</label>
              <input type="text" className="form-control" id="fullName" placeholder="Enter your name" required />
              <div className="invalid-feedback">Please enter your name.</div>
            </div>
            <div className="mb-3">
              <label htmlFor="email" className="form-label fw-semibold">Email</label>
              <input type="email" className="form-control" id="email" placeholder="name@example.com" required />
              <div className="invalid-feedback">Please provide a valid email.</div>
            </div>
            <div className="mb-3">
              <label htmlFor="role" className="form-label fw-semibold">Role</label>
              <select className="form-select" id="role" required>
                <option value="">Choose...</option>
                <option>Admin</option>
                <option>Manager</option>
                <option>Editor</option>
                <option>Viewer</option>
              </select>
              <div className="invalid-feedback">Please select a role.</div>
            </div>
            <button className="btn btn-primary" type="submit">Save</button>
          </form>
        </div>
      </div>
      <div className="col-12 col-xl-6">
        <div className="panel">
          <h2 className="h5 mb-3 section-title"><i className="bi bi-geo-alt" aria-hidden="true" /><span>Address</span></h2>
          <form>
            <div className="mb-3">
              <label htmlFor="street" className="form-label fw-semibold">Street</label>
              <input type="text" className="form-control" id="street" placeholder="123 Main St" />
            </div>
            <div className="row g-3 mb-3">
              <div className="col-6">
                <label htmlFor="city" className="form-label fw-semibold">City</label>
                <input type="text" className="form-control" id="city" placeholder="City" />
              </div>
              <div className="col-6">
                <label htmlFor="zip" className="form-label fw-semibold">ZIP Code</label>
                <input type="text" className="form-control" id="zip" placeholder="94102" />
              </div>
            </div>
            <button className="btn btn-primary" type="submit">Update</button>
          </form>
        </div>
      </div>
    </div>
  </div>
);