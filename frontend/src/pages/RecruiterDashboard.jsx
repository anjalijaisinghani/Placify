import { useState, useEffect, useCallback, useRef } from 'react';import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import {
  getCompanies,
  getJobs,
  getAllApplications,
  createCompany,
  createJob,
  updateJob,
  deleteJob,
  toggleJobActive,
  getApplicationsByJob,
  updateApplicationStatus,
  getAdminStats,
  getPendingRecruiters,
  approveRecruiter,
  rejectRecruiter
} from '../api';
import { useToast } from '../hooks/useToast';

const STATUS_LABELS = { APPLIED: 'Applied', IN_REVIEW: 'Under Review', SHORTLISTED: 'Shortlisted', INTERVIEW: 'Interview', SELECTED: 'Selected', REJECTED: 'Rejected' };
const ALL_STATUSES = ['APPLIED', 'IN_REVIEW', 'SHORTLISTED', 'INTERVIEW', 'SELECTED', 'REJECTED'];

function today30() { const d = new Date(); d.setDate(d.getDate() + 30); return d.toISOString().split('T')[0]; }

const emptyJobForm = () => ({ id: '', title: '', companyId: '', location: '', salaryPackage: '', applicationDeadline: today30(), eligibility: '', description: '', minCgpa: '' });

export default function RecruiterDashboard() {
  const { user } = useAuth();

  if (
    user?.role === 'RECRUITER' &&
    user?.verificationStatus === 'PENDING'
  ) {
    return (
      <Layout title="Recruiter Verification">
        <div className="panel">
          <h2>Account Under Review</h2>
          <p>
            Your recruiter account is currently pending admin approval.
          </p>
          <p>
            You cannot post jobs until your account is approved.
          </p>
        </div>
      </Layout>
    );
  }

  if (
    user?.role === 'RECRUITER' &&
    user?.verificationStatus === 'REJECTED'
  ) {
    return (
      <Layout title="Recruiter Verification">
        <div className="panel">
          <h2>Account Rejected</h2>
          <p>
            Your recruiter account was rejected by the administrator.
          </p>
          <p>
            Please contact support for further information.
          </p>
        </div>
      </Layout>
    );
  }

  const { toast, confirm } = useToast();
  const pipelineRef = useRef(null);
  const [state, setState] = useState({ companies: [], jobs: [], applications: [] });
  const [adminStats, setAdminStats] = useState(null);
  const [pendingRecruiters, setPendingRecruiters] = useState([]);
  const [jobForm, setJobForm] = useState(emptyJobForm());
  const [companyForm, setCompanyForm] = useState({ name: '', description: '' });
  const [pipeline, setPipeline] = useState(null);
  const [busyJob, setBusyJob] = useState(false);
  const [busyCo, setBusyCo] = useState(false);
  const jobFormRef = useRef(null);



  const load = useCallback(async () => {
    try {
      const [cr, jr, ar] = await Promise.all([getCompanies(), getJobs(), getAllApplications()]);
      setState({ companies: cr.data.data || [], jobs: jr.data.data || [], applications: ar.data.data || [] });
    } catch (err) { toast('error', err.message); }
  }, []);


useEffect(() => {
  if (pipeline && pipelineRef.current) {
    pipelineRef.current.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  }
}, [pipeline]);

  useEffect(() => {
    if (user?.role === 'ADMIN') {

      getAdminStats()
        .then((r) => setAdminStats(r.data.data))
        .catch(() => {});

      getPendingRecruiters()
        .then((r) => setPendingRecruiters(r.data.data || []))
        .catch(() => {});
    }
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const setJF = (k) => (e) => setJobForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSaveJob = async (e) => {
    e.preventDefault();
    if (!jobForm.companyId) { toast('error', 'Select a company first.'); return; }
    setBusyJob(true);
    try {
      const body = { title: jobForm.title, description: jobForm.description, companyId: Number(jobForm.companyId), eligibility: jobForm.eligibility, location: jobForm.location || null, salaryPackage: jobForm.salaryPackage || null, applicationDeadline: jobForm.applicationDeadline || null, minCgpa: jobForm.minCgpa !== '' ? Number(jobForm.minCgpa) : null };
      if (jobForm.id) await updateJob(jobForm.id, body); else await createJob(body);
      toast('success', jobForm.id ? 'Job updated.' : 'Job posted.');
      setJobForm(emptyJobForm());
      await load();
    } catch (err) { toast('error', err.message); }
    finally { setBusyJob(false); }
  };

  const handleSaveCompany = async (e) => {
    e.preventDefault();
    if (user.role !== 'ADMIN') { toast('error', 'Only admins can add companies.'); return; }
    setBusyCo(true);
    try {
      await createCompany(companyForm);
      toast('success', 'Company added.');
      setCompanyForm({ name: '', description: '' });
      await load();
    } catch (err) { toast('error', err.message); }
    finally { setBusyCo(false); }
  };

  const handleToggle = async (jobId) => {
    try {
      const r = await toggleJobActive(jobId);
      setState((s) => ({ ...s, jobs: s.jobs.map((j) => j.id === jobId ? r.data.data : j) }));
      toast('success', r.data.data.active ? 'Job activated.' : 'Job deactivated.');
    } catch (err) { toast('error', err.message); }
  };

  const handleDelete = async (jobId) => {
    const res = await confirm('Delete this job?', 'This cannot be undone.');
    if (!res.isConfirmed) return;
    try {
      await deleteJob(jobId);
      toast('success', 'Job deleted.');
      if (pipeline?.jobId === jobId) setPipeline(null);
      await load();
    } catch (err) { toast('error', err.message); }
  };

 const openPipeline = async (job) => {
   setPipeline({
     jobId: job.id,
     jobTitle: job.title,
     apps: []
   });



   try {
     const r = await getApplicationsByJob(job.id);

     setPipeline({
       jobId: job.id,
       jobTitle: job.title,
       apps: r.data.data || []
     });
   } catch (err) {
     toast('error', err.message);
   }
 };

  const handleStatusChange = async (appId, newStatus) => {
    try {
      const r = await updateApplicationStatus(appId, newStatus);
      setPipeline((p) => p ? { ...p, apps: p.apps.map((a) => a.id === appId ? r.data.data : a) } : p);
      toast('success', `Status → ${STATUS_LABELS[newStatus]}`);
    } catch (err) { toast('error', err.message); }
  };

  const handleApproveRecruiter = async (id) => {
    try {
      await approveRecruiter(id);

      setPendingRecruiters((prev) =>
        prev.filter((r) => r.id !== id)
      );

      toast('success', 'Recruiter approved');
    } catch (err) {
      toast('error', err.message);
    }
  };

  const handleRejectRecruiter = async (id) => {
    try {
      await rejectRecruiter(id);

      setPendingRecruiters((prev) =>
        prev.filter((r) => r.id !== id)
      );

      toast('success', 'Recruiter rejected');
    } catch (err) {
      toast('error', err.message);
    }
  };

  const exportCsv = () => {
    if (!pipeline?.apps?.length) { toast('warning', 'No applicants to export.'); return; }
    const header = ['Name', 'Email', 'Branch', 'CGPA', 'Status', 'Applied At'];
    const rows = pipeline.apps.map((a) => [a.studentName, a.studentEmail || '', a.studentBranch || '', a.studentCgpa ?? '', a.studentResume || '', STATUS_LABELS[a.status], a.createdAt ? new Date(a.createdAt).toLocaleDateString('en-IN') : '']);
    const csv = [header, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `${pipeline.jobTitle}.csv`; a.click();
    URL.revokeObjectURL(url);
    toast('success', 'CSV exported.');
  };

 const editJob = (job) => {
   setJobForm({
     id: job.id,
     title: job.title,
     companyId: String(job.companyId),
     location: job.location || '',
     salaryPackage: job.salaryPackage || '',
     applicationDeadline: job.applicationDeadline || '',
     eligibility: job.eligibility,
     description: job.description,
     minCgpa: job.minCgpa ?? ''
   });

   setTimeout(() => {
     jobFormRef.current?.scrollIntoView({
       behavior: 'smooth',
       block: 'start'
     });
   }, 100);
 };

  const shortlisted = state.applications.filter((a) => a.status === 'SHORTLISTED' || a.status === 'SELECTED').length;

  return (
    <Layout title={user?.role === 'ADMIN' ? 'Admin Workspace' : 'Recruiter Dashboard'}>
      {/* Stats */}
      <div className="scards-row">
        {[
          { label: 'Companies', value: state.companies.length, color: 'cyan' },
          { label: 'Active Jobs', value: state.jobs.filter((j) => j.active).length, color: 'indigo' },
          { label: 'Applications', value: state.applications.length, color: 'warning' },
          { label: 'Shortlisted', value: shortlisted, color: 'success' },
        ].map((s) => <div key={s.label} className="scard"><div className={`scard-icon ${s.color}`} /><div className="scard-value">{s.value}</div><div className="scard-label">{s.label}</div></div>)}
      </div>

      {/* Admin analytics */}
      {user?.role === 'ADMIN' && adminStats && (
        <section className="panel">
          <div className="panel-header"><div><span className="eyebrow">Analytics</span><h2>Platform overview</h2></div></div>
          <div className="scards-row" style={{ marginBottom: 20 }}>
            {[
              { label: 'Students', value: adminStats.totalStudents, color: 'cyan' },
              { label: 'Total Jobs', value: adminStats.totalJobs, color: 'indigo' },
              { label: 'Active Jobs', value: adminStats.activeJobs, color: 'indigo' },
              { label: 'Applications', value: adminStats.totalApplications, color: 'warning' },
              { label: 'Placements', value: adminStats.totalPlacements, color: 'success' },
              { label: 'Placement Rate', value: `${adminStats.placementRate}%`, color: 'success' },
            ].map((s) => <div key={s.label} className="scard"><div className={`scard-icon ${s.color}`} /><div className="scard-value">{s.value}</div><div className="scard-label">{s.label}</div></div>)}
          </div>
          {adminStats.topCompanies?.length > 0 && (
            <>
              <p style={{ color: 'var(--muted-light)', fontSize: '0.78rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Top companies by placements</p>
              <div className="pipeline-wrap">
                <table className="pipeline-table">
                  <thead><tr><th>Company</th><th>Placements</th></tr></thead>
                  <tbody>
                    {adminStats.topCompanies.map((c, i) => (
                      <tr key={i}><td>{c.companyName}</td><td>{c.placements}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </section>
      )}

    {/* Recruiter approvals */}
    {user?.role === 'ADMIN' && (
<section className="panel" ref={pipelineRef}>
    <div className="panel-header">
          <div>
            <span className="eyebrow">Recruiter Verification</span>
            <h2>Pending Recruiter Requests</h2>
          </div>
        </div>

        {pendingRecruiters.length === 0 ? (
          <div className="empty-state">
            No pending recruiter approvals.
          </div>
        ) : (
          <div className="pipeline-wrap">
            <table className="pipeline-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Company</th>
                  <th>Position</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {pendingRecruiters.map((recruiter) => (
                  <tr key={recruiter.id}>
                    <td>{recruiter.name}</td>

                    <td>{recruiter.email}</td>

                    <td>
                      {recruiter.company || '—'}
                    </td>

                    <td>
                      {recruiter.position || '—'}
                    </td>

                    <td>
                      <span className="status-pill warning">
                        {recruiter.verificationStatus}
                      </span>
                    </td>

                    <td>
                      <div className="inline-actions">
                        <button
                          className="button secondary sm"
                          onClick={() =>
                            handleApproveRecruiter(recruiter.id)
                          }
                        >
                          ✓ Approve
                        </button>

                        <button
                          className="button danger sm"
                          onClick={() =>
                            handleRejectRecruiter(recruiter.id)
                          }
                        >
                          ✕ Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>

            </table>
          </div>
        )}
      </section>
    )}
      <section className="content-grid">
        {/* Companies */}
        <section className="panel">
          <div className="panel-header"><div><span className="eyebrow">Companies</span><h2>Company directory</h2></div></div>
          {user?.role === 'ADMIN' && (
            <form className="form-stack" onSubmit={handleSaveCompany}>
              <label className="field"><span>Name</span><input type="text" value={companyForm.name} onChange={(e) => setCompanyForm((f) => ({ ...f, name: e.target.value }))} placeholder="TechNova Pvt Ltd" required /></label>
              <label className="field"><span>Description</span><textarea value={companyForm.description} onChange={(e) => setCompanyForm((f) => ({ ...f, description: e.target.value }))} placeholder="Company profile…" /></label>
              <button className="button primary" type="submit" disabled={busyCo}>{busyCo ? 'Saving…' : 'Add Company'}</button>
            </form>
          )}
          {user?.role !== 'ADMIN' && <p className="helper-text">Only admins can add companies.</p>}
          <div className="companies-list" style={{ marginTop: 16 }}>
            {state.companies.map((c) => (
              <div key={c.id} className="co-card">
                <div className="co-card-logo">{c.name.charAt(0)}</div>
                <div className="co-card-info"><div className="co-card-name">{c.name}</div><div className="co-card-desc">{c.description?.slice(0, 80)}</div></div>
              </div>
            ))}
          </div>
        </section>

        {/* Post job */}
<section className="panel" ref={jobFormRef}>
    <div className="panel-header">
        <div>
            <span className="eyebrow">Post Job</span><h2>{jobForm.id ? 'Edit job' : 'Create a hiring opportunity'}</h2></div></div>
          <form className="form-stack" onSubmit={handleSaveJob}>
            <div className="form-grid">
              <label className="field"><span>Title</span><input type="text" value={jobForm.title} onChange={setJF('title')} placeholder="Java Backend Developer" required /></label>
              <label className="field"><span>Company</span>
                <select value={jobForm.companyId} onChange={setJF('companyId')} required>
                  <option value="">Select company</option>
                  {state.companies.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </label>
            </div>
            <div className="form-grid-3">
              <label className="field"><span>Location</span><input type="text" value={jobForm.location} onChange={setJF('location')} placeholder="Bengaluru / Remote" /></label>
              <label className="field"><span>Package</span><input type="text" value={jobForm.salaryPackage} onChange={setJF('salaryPackage')} placeholder="8–12 LPA" /></label>
              <label className="field"><span>Deadline</span><input type="date" value={jobForm.applicationDeadline} onChange={setJF('applicationDeadline')} /></label>
              <label className="field"><span>Min CGPA</span><input type="number" value={jobForm.minCgpa} onChange={setJF('minCgpa')} placeholder="e.g. 7.0" min="0" max="10" step="0.1" /></label>
            </div>
            <label className="field"><span>Eligibility</span><input type="text" value={jobForm.eligibility} onChange={setJF('eligibility')} placeholder="B.Tech CSE, 7.0 CGPA+" required /></label>
            <label className="field"><span>Description</span><textarea value={jobForm.description} onChange={setJF('description')} placeholder="Role summary…" required /></label>
            <div className="inline-actions">
              <button className="button primary" type="submit" disabled={busyJob}>{busyJob ? '…' : jobForm.id ? 'Update Job' : 'Post Job'}</button>
              {jobForm.id && <button className="button ghost" type="button" onClick={() => setJobForm(emptyJobForm())}>Cancel</button>}
            </div>
          </form>
        </section>
      </section>

      {/* Job listings */}
      <section className="panel">
        <div className="section-row"><div><p className="section-row-label">Your Postings</p><h2>Current job listings</h2></div></div>
        {state.jobs.length === 0 ? <div className="empty-state">No jobs posted yet.</div> : (
          <div className="cards-grid">
            {state.jobs.map((job) => (
              <article key={job.id} className="rjcard">
                <div className="rjcard-head">
                  <div className="chip-row">
                    <span className={`status-pill ${job.active ? 'success' : 'warning'}`}>{job.active ? 'Active' : 'Inactive'}</span>
                    <span className="micro-pill">{job.companyName}</span>
                  </div>
                  <div className="rjcard-title">{job.title}</div>
                  <div className="rjcard-desc">{job.description?.slice(0, 100)}…</div>
                </div>
                <div className="rjcard-meta">
                  <div className="rjcard-meta-item"><span className="rjcard-meta-label">Location</span><span className="rjcard-meta-value">{job.location || '—'}</span></div>
                  <div className="rjcard-meta-item"><span className="rjcard-meta-label">Package</span><span className="rjcard-meta-value">{job.salaryPackage || '—'}</span></div>
                  <div className="rjcard-meta-item"><span className="rjcard-meta-label">Deadline</span><span className="rjcard-meta-value">{job.applicationDeadline || '—'}</span></div>
                </div>
                <div className="rjcard-actions">
                  <button className="button secondary sm" onClick={() => editJob(job)}>Edit</button>
                  <button className={`button ${job.active ? 'ghost' : 'secondary'} sm`} onClick={() => handleToggle(job.id)}>{job.active ? 'Deactivate' : 'Activate'}</button>
                  <button className="button ghost sm" onClick={() => openPipeline(job)}>Applicants</button>
                  <button className="button danger sm" onClick={() => handleDelete(job.id)}>Delete</button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Pipeline */}
     {pipeline && (
       <section className="panel" ref={pipelineRef}>
          <div className="section-row">
            <div><p className="section-row-label">Pipeline</p><h2>Applicants — {pipeline.jobTitle}</h2></div>
            <div className="inline-actions">
              <button className="button secondary sm" onClick={exportCsv}>Export CSV</button>
              <button className="button ghost sm" onClick={() => setPipeline(null)}>Close</button>
            </div>
          </div>
          {!pipeline.apps.length ? <div className="empty-state">No applications for this job yet.</div> : (
            <div className="pipeline-wrap">
              <table className="pipeline-table">
                <thead><tr><th>Student</th><th>Email</th><th>Branch</th><th>CGPA</th><th>Resume</th><th>Status</th><th>Applied</th></tr></thead>
                <tbody>
                  {pipeline.apps.map((app) => (
                    <tr key={app.id}>
                      <td><div className="pl-student"><div className="pl-avatar">{app.studentName?.split(' ').slice(0,2).map((w)=>w[0]).join('')}</div><div><div className="pl-name">{app.studentName}</div></div></div></td>
                      <td>{app.studentEmail || '—'}</td>
                      <td>{app.studentBranch || '—'}</td>
                      <td>{app.studentCgpa ?? '—'}</td>
                      <td>
                        {app.studentResume
                          ? <a href={app.studentResume} target="_blank" rel="noopener noreferrer" className="resume-link">View PDF</a>
                          : <span style={{color:'var(--muted-light)'}}>—</span>}
                      </td>
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
          )}
        </section>
      )}
    </Layout>
  );
}