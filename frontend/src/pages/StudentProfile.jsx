import { useState, useEffect, useRef } from 'react';
import Layout from '../components/Layout';
import { getMyStudentProfile, updateMyStudentProfile, uploadResume } from '../api';
import { useToast } from '../hooks/useToast';

function initials(name = '') { return name.split(' ').slice(0, 2).map((w) => w[0]).join(''); }

export default function StudentProfile() {
  const { toast } = useToast();
  const [profile, setProfile] = useState(null);
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({ branch: '', skills: '', cgpa: '' });
  const [baseline, setBaseline] = useState(null);
  const [busy, setBusy] = useState(false);
  const [resumeFile, setResumeFile] = useState(null);
  const fileRef = useRef();

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem('placify_user') || 'null');
    setUser(u);
    getMyStudentProfile().then((r) => {
      const p = r.data.data;
      setProfile(p);
      const f = { branch: p.branch || '', skills: p.skills || '', cgpa: p.cgpa != null ? String(p.cgpa) : '' };
      setForm(f);
      setBaseline(f);
    }).catch((err) => toast('error', err.message));
  }, []);

  const hasChanges = () => {
    if (!baseline) return false;
    if (resumeFile) return true;
    return form.branch !== baseline.branch || form.skills !== baseline.skills || form.cgpa !== baseline.cgpa;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      let updatedProfile = profile;
      if (resumeFile) {
        const fd = new FormData();
        fd.append('file', resumeFile);
        const r = await uploadResume(fd);
        updatedProfile = r.data.data;
        setResumeFile(null);
        if (fileRef.current) fileRef.current.value = '';
      }
      const r = await updateMyStudentProfile({
        branch: form.branch,
        skills: form.skills,
        resume: updatedProfile?.resume || '',
        cgpa: form.cgpa ? parseFloat(form.cgpa) : null,
      });
      setProfile(r.data.data);
      const newBaseline = { branch: form.branch, skills: form.skills, cgpa: form.cgpa };
      setBaseline(newBaseline);
      toast('success', 'Profile updated successfully.');
    } catch (err) {
      toast('error', err.message);
    } finally {
      setBusy(false);
    }
  };

  const skillTags = (profile?.skills || '').split(',').map((s) => s.trim()).filter(Boolean);

  return (
    <Layout title="My Profile">
      <div className="content-grid">
        <section className="panel">
          <div className="panel-header"><div><span className="eyebrow">Profile Snapshot</span><h2>Your profile</h2></div></div>
          {profile && (
            <div>
              <div className="profile-avatar-row">
                <div className="profile-avatar">{initials(user?.name)}</div>
                <div>
                  <div className="profile-card-name">{user?.name}</div>
                  <div className="profile-card-sub">{user?.email}</div>
                </div>
              </div>
              <div className="profile-meta-row">
                <div className="profile-meta-item"><span className="profile-meta-label">Branch</span><span className="profile-meta-value">{profile.branch || 'Not set'}</span></div>
                <div className="profile-meta-item"><span className="profile-meta-label">CGPA</span><span className="profile-meta-value">{profile.cgpa != null ? profile.cgpa : 'Not set'}</span></div>
                <div className="profile-meta-item">
                  <span className="profile-meta-label">Resume</span>
                  <span className="profile-meta-value">{profile.resume ? <a href={`/resumes/${profile.resume.split('/').pop()}`} target="_blank" rel="noopener">View Resume →</a> : 'Not uploaded'}</span>
                </div>
                <div className="profile-meta-item">
                  <span className="profile-meta-label">Skills</span>
                  {skillTags.length ? <div className="skill-tags">{skillTags.map((s) => <span key={s} className="skill-tag">{s}</span>)}</div> : <span className="profile-meta-value">No skills added</span>}
                </div>
              </div>
            </div>
          )}
        </section>

        <section className="panel">
          <div className="panel-header"><div><span className="eyebrow">Update Profile</span><h2>Edit details</h2></div></div>
          <form className="form-stack" onSubmit={handleSave}>
            <label className="field"><span>Branch / Department</span><input type="text" value={form.branch} onChange={(e) => setForm((f) => ({ ...f, branch: e.target.value }))} placeholder="Computer Science Engineering" /></label>
            <label className="field"><span>Skills <small>(comma-separated)</small></span><textarea rows={3} value={form.skills} onChange={(e) => setForm((f) => ({ ...f, skills: e.target.value }))} placeholder="Java, Spring Boot, MySQL" /></label>
            <label className="field"><span>CGPA <small>(0 – 10)</small></span><input type="number" min="0" max="10" step="0.01" value={form.cgpa} onChange={(e) => setForm((f) => ({ ...f, cgpa: e.target.value }))} placeholder="8.5" /></label>
            <div className="field">
              <span>Resume <small>(PDF · max 2 MB)</small></span>
              <label className={`resume-upload-zone${resumeFile ? ' has-file' : ''}`} onClick={() => fileRef.current?.click()}>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12V4"/><path d="M5 8l4-4 4 4"/><path d="M2 14h14"/></svg>
                <span>{resumeFile ? resumeFile.name : 'Click to choose PDF'}</span>
                <input ref={fileRef} type="file" accept=".pdf" className="resume-file-hidden" onChange={(e) => {
                  const f = e.target.files[0];
                  if (!f) return;
                  if (f.type !== 'application/pdf') { toast('error', 'Only PDF files allowed.'); return; }
                  if (f.size > 2 * 1024 * 1024) { toast('error', 'Max 2 MB allowed.'); return; }
                  setResumeFile(f);
                }} />
              </label>
              {profile?.resume && !resumeFile && <p className="resume-current-hint">Current: <a href={`/resumes/${profile.resume.split('/').pop()}`} target="_blank" rel="noopener">{profile.resume.split('/').pop()}</a></p>}
            </div>
            <button className="button primary" type="submit" disabled={busy || !hasChanges()}>
              {busy ? 'Saving…' : 'Save Changes'}
            </button>
          </form>
        </section>
      </div>
    </Layout>
  );
}
