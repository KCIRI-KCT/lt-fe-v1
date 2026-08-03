import { Outlet } from 'react-router-dom';
import { useApp } from '../../hooks/useApp';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

export const Layout = () => {
  const { sidebar } = useApp();

  const sidebarClasses = [
    'admin-shell',
    sidebar.mini ? 'sidebar-mini' : '',
    sidebar.open ? 'sidebar-open' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={sidebarClasses}>
      <Sidebar />
      <div className="admin-main">
        <Navbar />
        <main className="dashboard-content">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  );
};