import { useState } from 'react';
import { Link } from 'react-router-dom';
import { forgotPassword } from '../api';
import { useToast } from '../hooks/useToast';

export default function ForgotPasswordPage() {
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await forgotPassword({ email });
      setSent(true);
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
        <Link to="/login" className="auth-topbar-link">Back to login</Link>
      </header>
      <div className="auth-wrap">
        <div className="auth-card">
          {sent ? (
            <>
              <div className="auth-card-header">
                <h1 className="auth-title">Check your email</h1>
                <p className="auth-subtitle">If <strong>{email}</strong> is registered, a reset link has been sent. Check your inbox.</p>
              </div>
              <p className="auth-alt-link"><Link to="/login">Back to Sign In</Link></p>
            </>
          ) : (
            <>
              <div className="auth-card-header">
                <h1 className="auth-title">Forgot password</h1>
                <p className="auth-subtitle">Enter your email and we'll send a reset link.</p>
              </div>
              <form className="form-stack" onSubmit={handleSubmit}>
                <label className="field">
                  <span>Email address</span>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@college.edu" required autoFocus />
                </label>
                <button className="button primary button--full" type="submit" disabled={busy}>
                  {busy ? 'Sending…' : 'Send Reset Link'}
                </button>
              </form>
              <p className="auth-alt-link"><Link to="/login">Back to Sign In</Link></p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
