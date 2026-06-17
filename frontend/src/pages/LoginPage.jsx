import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login as loginApi } from '../api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../hooks/useToast';
import { useSearchParams } from 'react-router-dom';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [form, setForm] = useState({ email: '', password: '' });
  const [busy, setBusy] = useState(false);

  const [searchParams] = useSearchParams();
  const verified = searchParams.get('verified');
  const tokenError = searchParams.get('error');

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await loginApi(form);
      const { token, user } = res.data.data;
      login(token, user);
      const dest = user.role === 'STUDENT' ? '/student-dashboard' : '/recruiter-dashboard';
      navigate(dest, { replace: true });
    } catch (err) {
      toast('error', err.message);
    } finally {
      setBusy(false);
    }
  };


  return (
    <div className="auth-body">
      <header className="auth-topbar">
        <Link to="/" className="auth-topbar-brand">
          <img src="/images/Logo.png" alt="Placify" />
          <span>Placify</span>
        </Link>
        <Link to="/register" className="auth-topbar-link">Create account</Link>
      </header>
      <div className="auth-wrap">
        <div className="auth-card">
          <div className="auth-card-header">
            <h1 className="auth-title">Welcome back</h1>
            <p className="auth-subtitle">Sign in to your Placify account</p>
          </div>

          {verified && (
            <div className="alert alert--success">
              Email verified! You can now sign in.
            </div>
          )}
          {tokenError && (
            <div className="alert alert--error">
              Verification link is invalid or expired. Please register again.
            </div>
          )}

          <form className="form-stack" onSubmit={handleSubmit}>
            <label className="field">
              <span>Email address</span>
              <input type="email" value={form.email} onChange={set('email')} placeholder="you@college.edu" required autoFocus />
            </label>
            <label className="field">
              <span>Password</span>
              <input type="password" value={form.password} onChange={set('password')} placeholder="Your password" required />
            </label>
            <button className="button primary button--full" type="submit" disabled={busy}>
              {busy ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
          <p className="auth-alt-link"><Link to="/forgot-password">Forgot password?</Link></p>
          <p className="auth-alt-link">Don't have an account? <Link to="/register">Create one free</Link></p>
        </div>
      </div>
    </div>
  );
}
