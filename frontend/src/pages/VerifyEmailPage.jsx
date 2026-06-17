// src/pages/VerifyEmailPage.jsx
import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../api';

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('verifying'); // 'verifying' | 'success' | 'error'
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) { setStatus('error'); setMessage('No token provided.'); return; }

    api.get(`/auth/verify-email?token=${token}`)
      .then(() => setStatus('success'))
      .catch((err) => { setStatus('error'); setMessage(err.message); });
  }, []);

  return (
    <div className="auth-body">
      <div className="auth-wrap">
        <div className="auth-card">
          {status === 'verifying' && <p>Verifying your email…</p>}
          {status === 'success' && (
            <>
              <h2>Email verified!</h2>
              <p>Your account is active. <Link to="/login">Sign in</Link></p>
            </>
          )}
          {status === 'error' && (
            <>
              <h2>Verification failed</h2>
              <p>{message || 'Invalid or expired link.'}</p>
              <Link to="/login">Back to login</Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}