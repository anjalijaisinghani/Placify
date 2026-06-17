                                                                                                                                                                                                                                                                                                                                                                                        import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV_ICONS = {
  dashboard: <svg className="nav-icon" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="1" width="6.5" height="6.5" rx="1.5"/><rect x="10.5" y="1" width="6.5" height="6.5" rx="1.5"/><rect x="10.5" y="10.5" width="6.5" height="6.5" rx="1.5"/><rect x="1" y="10.5" width="6.5" height="6.5" rx="1.5"/></svg>,
  jobs: <svg className="nav-icon" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="1.5" y="6" width="15" height="10" rx="1.5"/><path d="M6 6V4.5A1.5 1.5 0 0 1 7.5 3h3A1.5 1.5 0 0 1 12 4.5V6"/><line x1="1.5" y1="10" x2="16.5" y2="10"/></svg>,
  applications: <svg className="nav-icon" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M3.5 2h11A1.5 1.5 0 0 1 16 3.5v11A1.5 1.5 0 0 1 14.5 16h-11A1.5 1.5 0 0 1 2 14.5v-11A1.5 1.5 0 0 1 3.5 2z"/><line x1="5.5" y1="7" x2="12.5" y2="7"/><line x1="5.5" y1="10" x2="12.5" y2="10"/><line x1="5.5" y1="13" x2="9" y2="13"/></svg>,
  profile: <svg className="nav-icon" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="6" r="3"/><path d="M2 16c0-3.314 3.134-6 7-6s7 2.686 7 6"/></svg>,
};

export default function Sidebar({ isOpen, onClose }) {
  const { user } = useAuth();

  const dashboardPath = user?.role === 'STUDENT' ? '/student-dashboard' : '/recruiter-dashboard';
  const profilePath = user?.role === 'STUDENT' ? '/profile' : '/recruiter-profile';
  const sectionLabel = user?.role === 'STUDENT' ? 'Student Menu' : 'Recruiter Menu';

const links = user ? [
  {
    key: 'dashboard',
    to: dashboardPath,
    label:
      user.role === 'STUDENT'
        ? 'Dashboard'
        : `${user.role === 'ADMIN' ? 'Admin' : 'Recruiter'} Dashboard`
  },

  { key: 'jobs', to: '/jobs', label: 'Jobs' },

  ...(user.role !== 'RECRUITER'
    ? [{ key: 'applications', to: '/applications', label: 'Applications' }]
    : []),

  { key: 'profile', to: profilePath, label: 'My Profile' },
] : [];

  return (
    <>
      <div className={`sidebar-overlay${isOpen ? ' open' : ''}`} onClick={onClose} />
      <aside className={`sidebar${isOpen ? ' open' : ''}`}>
        <div className="sidebar-brand">
          <img className="brand-logo" src="/images/Logo.png" alt="Placify" />
          <div className="brand-copy">
            <strong>Placify</strong>
            <small>Campus Placement OS</small>
          </div>
        </div>
        <p className="sidebar-section-label">{sectionLabel}</p>
        <nav>
          {links.map((link) => (
            <NavLink
              key={link.key}
              to={link.to}
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
              onClick={onClose}
            >
              {NAV_ICONS[link.key]}
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <p className="sidebar-version">Placify &bull; v1.0</p>
        </div>
      </aside>
    </>
  );
}
