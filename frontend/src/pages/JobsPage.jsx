import { useState, useEffect, useRef } from 'react';
import Layout from '../components/Layout';
import { getJobs, getCompanies, getSavedJobIds, saveJob, unsaveJob, createApplication } from '../api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../hooks/useToast';

const BookmarkIcon = ({ filled }) => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 2h10a1 1 0 0 1 1 1v11l-6-3.5L2 14V3a1 1 0 0 1 1-1z"/>
  </svg>
);

export default function JobsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [jobs, setJobs] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [savedIds, setSavedIds] = useState(new Set());
  const [filters, setFilters] = useState({ keyword: '', location: '', companyId: '', active: '' });
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);
  const debounceRef = useRef(null);

  useEffect(() => {
    Promise.all([
      getCompanies(),
      user?.role === 'STUDENT' ? getSavedJobIds() : Promise.resolve(null),
    ]).then(([cr, sr]) => {
      setCompanies(cr.data.data || []);
      if (sr) setSavedIds(new Set(sr.data.data || []));
    }).catch((err) => toast('error', err.message));
  }, [user]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setLoading(true);
      const params = {};
      if (filters.keyword) params.keyword = filters.keyword;
      if (filters.location) params.location = filters.location;
      if (filters.companyId) params.companyId = filters.companyId;
      if (filters.active !== '') params.active = filters.active;

      getJobs(params)
        .then((r) => setJobs(r.data.data || []))
        .catch((err) => toast('error', err.message))
        .finally(() => setLoading(false));
    }, 400);

    return () => clearTimeout(debounceRef.current);
  }, [filters]);

  const displayed = activeTab === 'saved' ? jobs.filter((j) => savedIds.has(j.id)) : jobs;

  const toggleBookmark = async (jobId) => {
    const isSaved = savedIds.has(jobId);
    setSavedIds((prev) => { const next = new Set(prev); isSaved ? next.delete(jobId) : next.add(jobId); return next; });
    try {
      isSaved ? await unsaveJob(jobId) : await saveJob(jobId);
    } catch (err) {
      setSavedIds((prev) => { const next = new Set(prev); isSaved ? next.add(jobId) : next.delete(jobId); return next; });
      toast('error', err.message);
    }
  };

  const applyToJob = async (jobId) => {
    try {
      await createApplication({ jobId });
      toast('success', 'Application submitted!');
    } catch (err) {
      toast('error', err.message);
    }
  };

  return (
    <Layout title="Jobs">
      <div className="page-main">
        {/* Filters */}
        <section className="panel">
          <div className="form-grid" style={{ marginBottom: 0 }}>
            <label className="field"><span>Keyword search</span><input type="text" value={filters.keyword} onChange={(e) => setFilters((f) => ({ ...f, keyword: e.target.value }))} placeholder="Title, company, skills, location…" /></label>
            <label className="field"><span>Location</span><input type="text" value={filters.location} onChange={(e) => setFilters((f) => ({ ...f, location: e.target.value }))} placeholder="e.g. Bangalore" /></label>
            <label className="field">
              <span>Company</span>
              <select value={filters.companyId} onChange={(e) => setFilters((f) => ({ ...f, companyId: e.target.value }))}>
                <option value="">All companies</option>
                {companies.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </label>
            <label className="field">
              <span>Status</span>
              <select value={filters.active} onChange={(e) => setFilters((f) => ({ ...f, active: e.target.value }))}>
                <option value="">All</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </label>
          </div>
        </section>

        {/* Tabs (students only) */}
        {user?.role === 'STUDENT' && (
          <div className="tab-row">
            <button className={`tab-btn${activeTab === 'all' ? ' active' : ''}`} onClick={() => setActiveTab('all')}>All Jobs</button>
            <button className={`tab-btn${activeTab === 'saved' ? ' active' : ''}`} onClick={() => setActiveTab('saved')}>Saved Jobs</button>
          </div>
        )}

        {/* Cards */}
        {loading ? <p style={{ padding: 16, color: 'var(--muted-light)' }}>Loading jobs…</p> : displayed.length === 0 ? (
          <div className="empty-state">No jobs found.</div>
        ) : (
          <div className="cards-grid">
            {displayed.map((job) => (
              <article key={job.id} className="card">
                <div className="card-head-row">
                  <div className="card-head">
                    <div className="chip-row">
                      <span className={`status-pill ${job.active ? 'success' : 'warning'}`}>{job.active ? 'Active' : 'Inactive'}</span>
                      <span className="micro-pill">{job.companyName}</span>
                    </div>
                    <h3>{job.title}</h3>
                    <p className="card-summary">{job.description?.slice(0, 150)}</p>
                  </div>
                  {user?.role === 'STUDENT' && (
                    <button className={`bookmark-btn${savedIds.has(job.id) ? ' saved' : ''}`} onClick={() => toggleBookmark(job.id)} title={savedIds.has(job.id) ? 'Remove bookmark' : 'Save job'}>
                      <BookmarkIcon filled={savedIds.has(job.id)} />
                    </button>
                  )}
                </div>
                <div className="detail-grid">
                  <div className="detail-item"><span>Eligibility</span><strong>{job.eligibility}</strong></div>
                  <div className="detail-item"><span>Min CGPA</span><strong>{job.minCgpa != null ? job.minCgpa : '—'}</strong></div>
                  <div className="detail-item"><span>Deadline</span><strong>{job.applicationDeadline || '—'}</strong></div>
                  <div className="detail-item"><span>Location</span><strong>{job.location || 'Remote'}</strong></div>
                  <div className="detail-item"><span>Package</span><strong>{job.salaryPackage || 'Confidential'}</strong></div>
                </div>
                <div className="panel-actions">
                  {!job.active
                    ? <button className="button ghost" type="button" disabled>Closed</button>
                    : user?.role === 'STUDENT'
                      ? <button className="button primary" onClick={() => applyToJob(job.id)}>Apply for Job</button>
                      : null
                  }
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
