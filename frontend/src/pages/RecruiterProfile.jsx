import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { getMyRecruiterProfile, updateMyRecruiterProfile } from '../api';
import { useToast } from '../hooks/useToast';

function initials(name = '') { return name.split(' ').slice(0, 2).map((w) => w[0]).join(''); }

export default function RecruiterProfile() {
  const { toast } = useToast();
  const [profile, setProfile] = useState(null);
  const [user] = useState(() => JSON.parse(localStorage.getItem('placify_user') || 'null'));
  const [form, setForm] = useState({ company: '', position: '', experienceYears: '', linkedIn: '', bio: '' });
  const [baseline, setBaseline] = useState(null);
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  useEffect(() => {
    getMyRecruiterProfile().then((r) => {
      const p = r.data.data;
      setProfile(p);
      const f = {
        company: p.company || '',
        position: p.position || '',
        experienceYears: p.experienceYears != null ? String(p.experienceYears) : '',
        linkedIn: p.linkedIn || '',
        bio: p.bio || '',
      };
      setForm(f);
      setBaseline(f);
    }).catch((err) => toast('error', err.message));
  }, []);

  const hasChanges = () => {
    if (!baseline) return false;
    return Object.keys(form).some((k) => form[k] !== baseline[k]);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const r = await updateMyRecruiterProfile({
        company: form.company || null,
        position: form.position || null,
        experienceYears: form.experienceYears ? parseInt(form.experienceYears) : null,
        linkedIn: form.linkedIn || null,
        bio: form.bio || null,
      });
      setProfile(r.data.data);
      setBaseline({ ...form });
      toast('success', 'Profile updated successfully.');
    } catch (err) {
      toast('error', err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Layout title="My Profile">
      <div className="content-grid">
        <section className="panel">
          <div className="panel-header"><div><span className="eyebrow">Profile Snapshot</span><h2>Your profile</h2></div></div>
          <div className="profile-avatar-row">
            <div className="profile-avatar">{initials(user?.name)}</div>
            <div><div className="profile-card-name">{user?.name}</div><div className="profile-card-sub">{user?.email}</div></div>
          </div>
          {profile && (
            <div className="profile-meta-row">
              <div className="profile-meta-item"><span className="profile-meta-label">Company</span><span className="profile-meta-value">{profile.company || 'Not set'}</span></div>
              <div className="profile-meta-item"><span className="profile-meta-label">Position</span><span className="profile-meta-value">{profile.position || 'Not set'}</span></div>
              <div className="profile-meta-item"><span className="profile-meta-label">Experience</span><span className="profile-meta-value">{profile.experienceYears != null ? `${profile.experienceYears} yr${profile.experienceYears !== 1 ? 's' : ''}` : 'Not set'}</span></div>
              <div className="profile-meta-item"><span className="profile-meta-label">LinkedIn</span><span className="profile-meta-value">{profile.linkedIn ? <a href={profile.linkedIn} target="_blank" rel="noopener">{profile.linkedIn}</a> : 'Not set'}</span></div>
              {profile.bio && <div className="profile-meta-item" style={{ gridColumn: '1/-1' }}><span className="profile-meta-label">Bio</span><span className="profile-meta-value">{profile.bio}</span></div>}
            </div>
          )}
        </section>

        <section className="panel">
          <div className="panel-header"><div><span className="eyebrow">Update Profile</span><h2>Edit details</h2></div></div>
          <form className="form-stack" onSubmit={handleSave}>
            <div className="form-grid">
              <label className="field"><span>Company</span><input type="text" value={form.company} onChange={set('company')} placeholder="Google, Infosys…" /></label>
              <label className="field"><span>Position / Job Title</span><input type="text" value={form.position} onChange={set('position')} placeholder="Senior HR Manager" /></label>
            </div>
            <label className="field"><span>Years of Experience</span><input type="number" min="0" max="60" value={form.experienceYears} onChange={set('experienceYears')} placeholder="5" /></label>
            <label className="field"><span>LinkedIn URL</span><input type="url" value={form.linkedIn} onChange={set('linkedIn')} placeholder="https://linkedin.com/in/yourname" /></label>
            <label className="field"><span>Bio <small>(max 500 chars)</small></span><textarea rows={4} maxLength={500} value={form.bio} onChange={set('bio')} placeholder="Short intro about yourself…" /></label>
            <button className="button primary" type="submit" disabled={busy || !hasChanges()}>
              {busy ? 'Saving…' : 'Save Changes'}
            </button>
          </form>
        </section>
      </div>
    </Layout>
  );
}
