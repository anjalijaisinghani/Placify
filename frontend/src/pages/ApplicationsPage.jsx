import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { getMyApplications, getAllApplications, updateApplicationStatus } from '../api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../hooks/useToast';

const STEPS = [
  { key: 'APPLIED', label: 'Applied' },
  { key: 'IN_REVIEW', label: 'Under Review' },
  { key: 'SHORTLISTED', label: 'Shortlisted' },
  { key: 'INTERVIEW', label: 'Interview' },
];
const STEP_INDEX = { APPLIED: 0, IN_REVIEW: 1, SHORTLISTED: 2, INTERVIEW: 3 };
const STATUS_LABELS = { APPLIED: 'Applied', IN_REVIEW: 'Under Review', SHORTLISTED: 'Shortlisted', INTERVIEW: 'Interview', SELECTED: 'Selected', REJECTED: 'Rejected' };
const ALL_STATUSES = ['APPLIED', 'IN_REVIEW', 'SHORTLISTED', 'INTERVIEW', 'SELECTED', 'REJECTED'];

const CheckIcon = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="2 6 5 9 10 3"/>
  </svg>
);
const CrossIcon = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
    <line x1="3" y1="3" x2="9" y2="9"/><line x1="9" y1="3" x2="3" y2="9"/>
  </svg>
);
const StarIcon = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
    <path d="M6 1l1.4 2.9L11 4.4l-2.5 2.4.6 3.4L6 8.8l-3.1 1.4.6-3.4L1 4.4l3.6-.5z"/>
  </svg>
);

function statusTone(s) {
  if (s === 'SELECTED' || s === 'SHORTLISTED') return 'success';
  if (s === 'REJECTED') return 'danger';
  return 'warning';
}

function Timeline({ status, updatedAt }) {
  const activeIdx = STEP_INDEX[status] ?? -1;
  const isRejected = status === 'REJECTED';
  const isSelected = status === 'SELECTED';

  const nodes = [];
  STEPS.forEach((step, i) => {
    let cls;
    if (isSelected) cls = 'done';
    else if (isRejected) cls = i === 0 ? 'done' : 'pending';
    else if (i < activeIdx) cls = 'done';
    else if (i === activeIdx) cls = 'active';
    else cls = 'pending';

    nodes.push(
      <div key={step.key} className={`tl-step ${cls}`}>
        <div className="tl-node">{cls === 'done' ? <CheckIcon /> : i + 1}</div>
        <span className="tl-label">{step.label}</span>
      </div>
    );
    if (i < STEPS.length - 1) {
      nodes.push(<div key={`c${i}`} className={`tl-connector${cls === 'done' ? ' done' : ''}`} />);
    }
  });

  const outcomeCls = isSelected ? 'outcome-success' : isRejected ? 'outcome-danger' : 'outcome-pending';
  const outcomeLabel = isSelected ? 'Offered' : isRejected ? 'Rejected' : 'Decision';
  const outcomeIcon = isSelected ? <StarIcon /> : isRejected ? <CrossIcon /> : '?';
  const connectorCls = isSelected ? 'done' : '';

  return (
    <>
      <div className="app-timeline">
        {nodes}
        <div className={`tl-connector${connectorCls ? ' ' + connectorCls : ''}`} />
        <div className={`tl-step ${outcomeCls}`}>
          <div className="tl-node">{outcomeIcon}</div>
          <span className="tl-label">{outcomeLabel}</span>
        </div>
      </div>
      {updatedAt && <p className="tl-updated">Last updated {new Date(updatedAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>}
    </>
  );
}

export default function ApplicationsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const isManager = user?.role === 'ADMIN' || user?.role === 'RECRUITER';

  useEffect(() => {
    const fetch = isManager ? getAllApplications : getMyApplications;
    fetch().then((r) => setApps(r.data.data || []))
      .catch((err) => toast('error', err.message))
      .finally(() => setLoading(false));
  }, [isManager]);

  const handleStatusChange = async (appId, newStatus) => {
    try {
      const r = await updateApplicationStatus(appId, newStatus);
      setApps((prev) => prev.map((a) => a.id === appId ? r.data.data : a));
      toast('success', `Status updated to ${STATUS_LABELS[newStatus]}.`);
    } catch (err) {
      toast('error', err.message);
    }
  };

  const filtered = filter === 'ALL' ? apps : apps.filter((a) => a.status === filter);

  return (
    <Layout title="Applications">
      {/* Filter bar */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {['ALL', ...ALL_STATUSES].map((s) => (
          <button key={s} className={`tab-btn${filter === s ? ' active' : ''}`} onClick={() => setFilter(s)}>
            {s === 'ALL' ? 'All' : STATUS_LABELS[s]}
          </button>
        ))}
      </div>

      {loading ? <p style={{ color: 'var(--muted-light)' }}>Loading…</p> : filtered.length === 0 ? (
        <div className="empty-state">No applications found.</div>
      ) : isManager ? (
        /* Manager table */
        <section className="panel">
          <div className="pipeline-wrap">
            <table className="pipeline-table">
              <thead>
                <tr><th>Student</th><th>Email</th><th>Branch</th><th>CGPA</th><th>Job</th><th>Company</th><th>Status</th><th>Applied</th></tr>
              </thead>
              <tbody>
                {filtered.map((app) => (
                  <tr key={app.id}>
                    <td>{app.studentName}</td>
                    <td>{app.studentEmail}</td>
                    <td>{app.studentBranch || '—'}</td>
                    <td>{app.studentCgpa ?? '—'}</td>
                    <td>{app.jobTitle}</td>
                    <td>{app.companyName}</td>
                    <td>
                      <select value={app.status} onChange={(e) => handleStatusChange(app.id, e.target.value)}>
                        {ALL_STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                      </select>
                    </td>
                    <td>{app.createdAt ? new Date(app.createdAt).toLocaleDateString('en-IN') : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : (
        /* Student timeline cards */
        <div className="cards-grid">
          {filtered.map((app) => (
            <article key={app.id} className="appcard">
              <div className="appcard-top">
                <div>
                  <div className="appcard-title">{app.jobTitle}</div>
                  <div className="appcard-company">{app.companyName}</div>
                </div>
                <span className={`status-pill ${statusTone(app.status)}`}>{STATUS_LABELS[app.status]}</span>
              </div>
              <Timeline status={app.status} updatedAt={app.updatedAt} />
              <div className="appcard-date">Applied {app.createdAt ? new Date(app.createdAt).toLocaleDateString('en-IN') : '—'}</div>
            </article>
          ))}
        </div>
      )}
    </Layout>
  );
}
