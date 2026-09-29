import React, { useEffect, useRef, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { authenticate } from '../../services/authService.js';
import { API_BASE } from '../../services/httpClient.js';

function PasswordInput({ name, autoComplete, minLength, label }) {
  const [visible, setVisible] = useState(false);

  return (
    <label>
      {label}
      <span className="password-input">
        <input
          name={name}
          type={visible ? 'text' : 'password'}
          required
          minLength={minLength}
          maxLength="128"
          autoComplete={autoComplete}
        />
        <button
          type="button"
          className="password-toggle"
          aria-label={visible ? 'Hide password' : 'Show password'}
          aria-pressed={visible}
          title={visible ? 'Hide password' : 'Show password'}
          onClick={() => setVisible((current) => !current)}
        >
          {visible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </span>
    </label>
  );
}

export function AuthForm({ mode, setMode, onAuthenticated }) {
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    [notice, setNotice] = useState('');
  const [emailToken] = useState(
    () => new URLSearchParams(window.location.search).get('token') || ''
  );
  const lock = useRef(false);
  const labels = {
    login: 'Sign in',
    register: 'Create account',
    forgot: 'Send recovery email',
    reset: 'Reset password',
    verify: 'Verify email',
    resend: 'Resend verification',
    password: 'Change password',
  };
  function changeMode(nextMode) {
    setError('');
    setNotice('');
    setMode(nextMode);
  }
  useEffect(() => {
    if (!emailToken || !['reset', 'verify'].includes(mode)) return;
    const url = new URL(window.location.href);
    url.searchParams.delete('token');
    window.history.replaceState(null, '', url.pathname + url.search + url.hash);
  }, [emailToken, mode]);
  async function submit(e) {
    e.preventDefault();
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setError('');
    setNotice('');
    const fields = Object.fromEntries(new FormData(e.currentTarget));
    try {
      const result = await authenticate(mode, fields);
      if (mode === 'login' || mode === 'verify') await onAuthenticated(result);
      else
        setNotice(
          ['register', 'resend', 'forgot'].includes(mode)
            ? 'Request accepted. Check your email for the next step.'
            : 'Your request was completed successfully.'
        );
    } catch (e) {
      setError(e.message);
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  return (
    <form onSubmit={submit} key={mode}>
      {API_BASE.startsWith('http:') && (
        <p className="notice">
          The supplied server uses HTTP. Use a test password only until the backend enables HTTPS.
        </p>
      )}
      {mode === 'register' && (
        <label>
          Display name
          <input name="name" required maxLength="100" autoComplete="name" />
        </label>
      )}
      {['login', 'register', 'forgot', 'resend'].includes(mode) && (
        <label>
          Email address
          <input name="email" type="email" required maxLength="254" autoComplete="email" />
        </label>
      )}
      {['reset', 'verify'].includes(mode) && (
        <input name="token" type="hidden" value={emailToken} />
      )}
      {['reset', 'verify'].includes(mode) && !emailToken && (
        <p className="notice" role="status">
          Open the secure link from your email to continue.
        </p>
      )}
      {mode === 'password' && (
        <PasswordInput
          name="currentPassword"
          label="Current password"
          autoComplete="current-password"
        />
      )}
      {['login', 'register', 'reset', 'password'].includes(mode) && (
        <PasswordInput
          name="password"
          label={mode === 'login' ? 'Password' : 'New password (at least 12 characters)'}
          minLength={mode === 'login' ? 1 : 12}
          autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
        />
      )}
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      {notice && (
        <p className="notice" role="status">
          {notice}
        </p>
      )}
      <button
        className="primary full"
        disabled={busy || (['reset', 'verify'].includes(mode) && !emailToken)}
      >
        {busy && mode === 'verify' ? 'Verifying your email…' : busy ? 'Please wait…' : labels[mode]}
      </button>
      {mode !== 'password' && (
        <div className="auth-footer">
          {mode === 'login' ? (
            <>
              <button type="button" disabled={busy} onClick={() => changeMode('forgot')}>
                Forgot password?
              </button>
              <p>
                New to Fan Hub Plus?{' '}
                <button type="button" disabled={busy} onClick={() => changeMode('register')}>
                  Create an account
                </button>
              </p>
            </>
          ) : (
            <p>
              Already have an account?{' '}
              <button type="button" disabled={busy} onClick={() => changeMode('login')}>
                Back to sign in
              </button>
            </p>
          )}
          {['login', 'register', 'resend', 'verify'].includes(mode) && (
            <details className="auth-help">
              <summary>Email verification help</summary>
              <p>Use the secure link in your verification email.</p>
              <div>
                {mode !== 'resend' && (
                  <button type="button" disabled={busy} onClick={() => changeMode('resend')}>
                    Resend email
                  </button>
                )}
              </div>
            </details>
          )}
        </div>
      )}
    </form>
  );
}
