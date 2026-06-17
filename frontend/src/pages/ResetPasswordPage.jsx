import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { resetPassword } from '../api';
import { useToast } from '../hooks/useToast';

export default function ResetPasswordPage() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState({ newPassword: '', confirm: '' });
  const [busy, setBusy] = useState(false);
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) navigate('/login', { replace: true });
  }, [token, navigate]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.newPassword !== form.confirm) {
      toast('error', 'Passwords do not match');
      return;
    }
    setBusy(true);
    try {
      await resetPassword({ token, newPassword: form.newPassword });
      toast('success', 'Password reset! Sign in with your new password.');
      navigate('/login', { replace: true });
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
      </header>
      <div className="auth-wrap">
        <div className="auth-card">
          <div className="auth-card-header">
            <h1 className="auth-title">Set new password</h1>
            <p className="auth-subtitle">Choose a strong password — at least 8 characters.</p>
          </div>
          <form className="form-stack" onSubmit={handleSubmit}>
            <label className="field">
              <span>New password</span>
              <input type="password" value={form.newPassword} onChange={set('newPassword')} placeholder="Min 8 characters" required autoFocus minLength={8} />
            </label>
            <label className="field">
              <span>Confirm password</span>
              <input type="password" value={form.confirm} onChange={set('confirm')} placeholder="Repeat password" required minLength={8} />
            </label>
            <button className="button primary button--full" type="submit" disabled={busy}>
              {busy ? 'Resetting…' : 'Reset Password'}
            </button>
          </form>
          <p className="auth-alt-link"><Link to="/login">Back to Sign In</Link></p>
        </div>
      </div>
    </div>
  );
}
