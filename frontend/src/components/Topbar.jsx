import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getNotifications, getUnreadCount, markAllRead } from '../api';

function initials(name = '') {
  return name.split(' ').slice(0, 2).map((w) => w[0]).join('');
}

function formatTime(dt) {
  if (!dt) return '';
  return new Date(dt).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}

export default function Topbar({ title, onMenuClick }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [unread, setUnread] = useState(0);
  const [notifs, setNotifs] = useState([]);
  const [dropOpen, setDropOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    if (!user) return;
    const poll = async () => {
      try { const r = await getUnreadCount(); setUnread(Number(r.data.data) || 0); } catch {}
    };
    poll();
    const id = setInterval(poll, 30000);
    return () => clearInterval(id);
  }, [user]);

  useEffect(() => {
    const handler = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setDropOpen(false); };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);

  const openDrop = async () => {
    setDropOpen((v) => !v);
    if (!dropOpen) {
      try {
        const r = await getNotifications();
        setNotifs(r.data.data || []);
        await markAllRead();
        setUnread(0);
      } catch {}
    }
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <header className="topbar">
      <button className="topbar-toggle" onClick={onMenuClick} aria-label="Toggle sidebar">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <rect y="2" width="16" height="1.5" rx="1" fill="currentColor"/>
          <rect y="7.25" width="16" height="1.5" rx="1" fill="currentColor"/>
          <rect y="12.5" width="16" height="1.5" rx="1" fill="currentColor"/>
        </svg>
      </button>
      <span className="topbar-title">{title}</span>
      <div className="topbar-right">
        {user && (
          <div className="notif-wrap" ref={wrapRef}>
            <button className="topbar-notify" onClick={openDrop} aria-label="Notifications">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                <path d="M8 1.5a4.5 4.5 0 0 1 4.5 4.5c0 2.5.8 3.8 1.5 4.5H2c.7-.7 1.5-2 1.5-4.5A4.5 4.5 0 0 1 8 1.5z"/>
                <path d="M6.5 13.5a1.5 1.5 0 0 0 3 0"/>
              </svg>
              {unread > 0 && <span className="topbar-notify-dot" style={{ display: 'flex' }}>{unread > 9 ? '9+' : unread}</span>}
            </button>
            {dropOpen && (
              <div className="notif-dropdown open">
                <div className="notif-dropdown-header"><strong>Notifications</strong></div>
                {notifs.length === 0 ? (
                  <div className="notif-empty">You're all caught up.</div>
                ) : (
                  <div className="notif-list">
                    {notifs.map((n) => (
                      <div key={n.id} className={`notif-item ${n.read ? 'read' : 'unread'}`}>
                        <span className="notif-dot" />
                        <div className="notif-body">
                          <p className="notif-msg">{n.message}</p>
                          <p className="notif-time">{formatTime(n.createdAt)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        {user && (
          <div className="topbar-user">
            <div className="topbar-avatar">{initials(user.name)}</div>
            <div className="topbar-user-info">
              <span className="topbar-user-name">{user.name}</span>
              <span className="topbar-user-role">{user.role}</span>
            </div>
          </div>
        )}
        {user
          ? <button className="button ghost sm" onClick={handleLogout}>Logout</button>
          : <button className="button ghost sm" onClick={() => navigate('/login')}>Sign In</button>
        }
      </div>
    </header>
  );
}
