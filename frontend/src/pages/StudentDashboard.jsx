import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { getMyStudentProfile, getMyApplications, getJobs } from '../api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../hooks/useToast';

function initials(name = '') { return name.split(' ').slice(0, 2).map((w) => w[0]).join(''); }

const STATUS_LABELS = { APPLIED: 'Applied', IN_REVIEW: 'Under Review', SHORTLISTED: 'Shortlisted', INTERVIEW: 'Interview', SELECTED: 'Selected', REJECTED: 'Rejected' };
function statusTone(s) {
  if (s === 'SELECTED' || s === 'SHORTLISTED') return 'success';
  if (s === 'REJECTED') return 'danger';
  return 'warning';
}

export default function StudentDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState(null);
  const [apps, setApps] = useState([]);
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    Promise.all([getMyStudentProfile(), getMyApplications(), getJobs()])
      .then(([pr, ar, jr]) => {
        setProfile(pr.data.data);
        setApps(ar.data.data || []);
        setJobs(jr.data.data || []);
      }).catch((err) => toast('error', err.message));
  }, []);

  const activeJobs = jobs.filter((j) => j.active).length;
  const selected = apps.filter((a) => a.status === 'SELECTED').length;

  return (
    <Layout title="Student Dashboard">
      {/* Welcome banner */}
      <section className="db-welcome">
        <div className="db-welcome-inner">
          <div className="db-welcome-text">
            <span className="db-welcome-eyebrow">Student Workspace</span>
            <h1 className="db-welcome-title">Your placement journey starts here.</h1>
            <p className="db-welcome-sub">Browse opportunities, track applications, and land your dream role.</p>
            <div className="db-welcome-actions">
              <Link className="button primary" to="/jobs">Browse Jobs</Link>
              <Link className="button ghost" to="/applications">My Applications</Link>
            </div>
          </div>
          <div className="db-welcome-right">
            <div className="db-snap-item">
              <div className="db-snap-icon indigo">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"><circle cx="8" cy="5" r="3"/><path d="M2 15c0-3.314 2.686-6 6-6s6 2.686 6 6"/></svg>
              </div>
              <div className="db-snap-text"><div className="db-snap-label">Name</div><div className="db-snap-value">{user?.name}</div></div>
            </div>
            <div className="db-snap-item">
              <div className="db-snap-icon cyan">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"><rect x="1.5" y="4" width="13" height="10" rx="1.5"/><path d="M5.5 4V3A1.5 1.5 0 0 1 7 1.5h2A1.5 1.5 0 0 1 10.5 3v1"/><line x1="1.5" y1="8" x2="14.5" y2="8"/></svg>
              </div>
              <div className="db-snap-text"><div className="db-snap-label">Branch</div><div className="db-snap-value">{profile?.branch || 'Not set'}</div></div>
            </div>
            <div className="db-snap-item">
              <div className="db-snap-icon success">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"><circle cx="8" cy="8" r="6"/><path d="M5 8l2 2 4-4"/></svg>
              </div>
              <div className="db-snap-text"><div className="db-snap-label">CGPA</div><div className="db-snap-value">{profile?.cgpa ?? 'Not set'}</div></div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <div className="scards-row">
        {[
          { label: 'Active Jobs', value: activeJobs, color: 'cyan' },
          { label: 'Applied', value: apps.length, color: 'indigo' },
          { label: 'Shortlisted', value: apps.filter((a) => a.status === 'SHORTLISTED').length, color: 'warning' },
          { label: 'Selected', value: selected, color: 'success' },
        ].map((s) => (
          <div key={s.label} className="scard">
            <div className={`scard-icon ${s.color}`} />
            <div className="scard-value">{s.value}</div>
            <div className="scard-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Recent applications */}
      <section className="panel">
        <div className="section-row">
          <div><p className="section-row-label">Recent Activity</p><h2>Your applications</h2></div>
          <Link className="button secondary sm" to="/applications">View All</Link>
        </div>
        {apps.length === 0 ? (
          <div className="empty-state">You haven't applied to any jobs yet. <Link to="/jobs">Browse jobs →</Link></div>
        ) : (
          <div className="cards-grid">
            {apps.slice(0, 6).map((app) => (
              <article key={app.id} className="appcard">
                <div className="appcard-top">
                  <div>
                    <div className="appcard-title">{app.jobTitle}</div>
                    <div className="appcard-company">{app.companyName}</div>
                  </div>
                  <span className={`status-pill ${statusTone(app.status)}`}>{STATUS_LABELS[app.status]}</span>
                </div>
                <div className="appcard-date">Applied {app.createdAt ? new Date(app.createdAt).toLocaleDateString('en-IN') : '—'}</div>
              </article>
            ))}
          </div>
        )}
      </section>
    </Layout>
  );
}
