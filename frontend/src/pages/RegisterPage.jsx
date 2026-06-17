import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register as registerApi, verifyOtp } from '../api';
import { useToast } from '../hooks/useToast';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { toast } = useToast();

const [form, setForm] = useState({
  name: '',
  email: '',
  password: '',
  role: 'STUDENT',

  company: '',
  companyWebsite: '',
  position: '',
  phoneNumber: ''
});
const [busy, setBusy] = useState(false);

  const [step, setStep] = useState('register'); // 'register' | 'otp'
  const [otp, setOtp] = useState('');
  const [registeredEmail, setRegisteredEmail] = useState('');

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  // Step 1 — Register
  const handleRegister = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await registerApi(form);
      setRegisteredEmail(form.email);
      setStep('otp');
      toast('success', 'Account created! Check your email for the 6-digit code.');
    } catch (err) {
      toast('error', err.message);
    } finally {
      setBusy(false);
    }
  };

  // Step 2 — Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await verifyOtp({ email: registeredEmail, otp });
      toast('success', 'Email verified! You can now sign in.');
      navigate('/login');
    } catch (err) {
      toast('error', err.message);
    } finally {
      setBusy(false);
    }
  };

  // ── OTP Screen ──────────────────────────────────────────────────────
  if (step === 'otp') {
    return (
      <div className="auth-body">
        <header className="auth-topbar">
          <Link to="/" className="auth-topbar-brand">
            <img src="/images/Logo.png" alt="Placify" />
            <span>Placify</span>
          </Link>
          <Link to="/login" className="auth-topbar-link">Sign in</Link>
        </header>
        <div className="auth-wrap">
          <div className="auth-card">
            <div className="auth-card-header">
              <h1 className="auth-title">Verify your email</h1>
              <p className="auth-subtitle">
                We sent a 6-digit code to <strong>{registeredEmail}</strong>.
                Check your inbox (and spam folder).
              </p>
            </div>
            <form className="form-stack" onSubmit={handleVerifyOtp}>
              <label className="field">
                <span>Verification code</span>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  required
                  autoFocus
                  style={{
                    letterSpacing: '0.4em',
                    fontSize: '1.6rem',
                    textAlign: 'center',
                    fontWeight: '700',
                  }}
                />
              </label>
              <button
                className="button primary button--full"
                type="submit"
                disabled={busy || otp.length !== 6}
              >
                {busy ? 'Verifying…' : 'Verify Email'}
              </button>
            </form>
            <p className="auth-alt-link">
              Wrong email?{' '}
              <span
                style={{ cursor: 'pointer', color: 'var(--accent)' }}
                onClick={() => { setStep('register'); setOtp(''); }}
              >
                Start over
              </span>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ── Register Screen ─────────────────────────────────────────────────
  return (
    <div className="auth-body">
      <header className="auth-topbar">
        <Link to="/" className="auth-topbar-brand">
          <img src="/images/Logo.png" alt="Placify" />
          <span>Placify</span>
        </Link>
        <Link to="/login" className="auth-topbar-link">Sign in</Link>
      </header>
      <div className="auth-wrap auth-wrap--wide">
        <div className="auth-card">
          <div className="auth-card-header">
            <h1 className="auth-title">Create account</h1>
            <p className="auth-subtitle">Join Placify and start your placement journey</p>
          </div>
          <form className="form-stack" onSubmit={handleRegister}>
            <label className="field">
              <span>Full name</span>
              <input
                type="text"
                value={form.name}
                onChange={set('name')}
                placeholder="Aman Kumar"
                required
                autoFocus
              />
            </label>
            <label className="field">
              <span>Email address</span>
              <input
                type="email"
                value={form.email}
                onChange={set('email')}
                placeholder="you@college.edu"
                required
              />
            </label>
            <label className="field">
              <span>Password</span>
              <input
                type="password"
                value={form.password}
                onChange={set('password')}
                placeholder="Minimum 8 characters"
                required
              />
            </label>
            <label className="field">
              <span>I am a</span>
              <select value={form.role} onChange={set('role')}>
                <option value="STUDENT">Student</option>
                <option value="RECRUITER">Recruiter</option>
              </select>
            </label>

            {form.role === 'RECRUITER' && (
              <>
                <label className="field">
                  <span>Company Name</span>
                  <input
                    type="text"
                    value={form.company}
                    onChange={set('company')}
                    placeholder="Google"
                    required
                  />
                </label>

                <label className="field">
                  <span>Position / Designation</span>
                  <input
                    type="text"
                    value={form.position}
                    onChange={set('position')}
                    placeholder="HR Manager"
                    required
                  />
                </label>

                <label className="field">
                  <span>Company Website</span>
                  <input
                    type="text"
                    value={form.companyWebsite}
                    onChange={set('companyWebsite')}
                    placeholder="https://company.com"
                  />
                </label>

                <label className="field">
                  <span>Phone Number</span>
                  <input
                    type="text"
                    value={form.phoneNumber}
                    onChange={set('phoneNumber')}
                    placeholder="+91 9876543210"
                  />
                </label>
              </>
            )}
            <button
              className="button primary button--full"
              type="submit"
              disabled={busy}
            >
              {busy ? 'Creating account…' : 'Create Account'}
            </button>
          </form>
          <p className="auth-alt-link">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}