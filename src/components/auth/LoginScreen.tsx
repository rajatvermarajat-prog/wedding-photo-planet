'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { ArrowRight, Camera, Eye, EyeOff, Heart, LockKeyhole, Moon, ShieldCheck, Sun, Users, X } from 'lucide-react';
import { TeamMember } from '@/types';

interface LoginScreenProps {
  team: TeamMember[];
  onLogin: (user: TeamMember | typeof OWNER_USER) => void;
  onAddTeamMember?: (member: TeamMember) => void;
  onClose?: () => void;
}

export const OWNER_USER = { id: 'owner-rajat', name: 'Rajat Verma', role: 'Owner', email: 'admin@gmail.com' };
const normalise = (value: string) => value.trim().toLowerCase();

export const LoginScreen: React.FC<LoginScreenProps> = ({ team, onLogin, onClose }) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isDark, setIsDark] = useState(false);
  const [message, setMessage] = useState<{ type: 'error' | 'info'; text: string } | null>(null);
  const accounts = useMemo(() => [OWNER_USER, ...team], [team]);

  useEffect(() => {
    const remembered = window.localStorage.getItem('wpp-remembered-account');
    if (remembered) setIdentifier(remembered);
    setIsDark(window.localStorage.getItem('wpp-login-theme') === 'dark');
  }, []);

  const selectTheme = (dark: boolean) => {
    setIsDark(dark);
    window.localStorage.setItem('wpp-login-theme', dark ? 'dark' : 'light');
  };

  const handleLogin = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);

    // Read from the submitted form itself as well as React state. Password
    // managers and browser autofill can populate a field without firing onChange.
    const formData = new FormData(event.currentTarget);
    const submittedIdentifier = String(formData.get('identifier') ?? identifier).trim();
    const submittedPassword = String(formData.get('password') ?? password).trim();

    if (!submittedIdentifier || !submittedPassword) {
      setMessage({ type: 'error', text: 'Please enter your email/username and password.' });
      return;
    }
    setIdentifier(submittedIdentifier);
    setPassword(submittedPassword);
    const entered = normalise(submittedIdentifier);

    // Owner authentication is explicit and independent from mutable team data.
    // This guarantees that the admin account always remains available.
    if (entered === OWNER_USER.email && (submittedPassword === '1234' || submittedPassword === '0000')) {
      if (rememberMe) window.localStorage.setItem('wpp-remembered-account', OWNER_USER.email);
      else window.localStorage.removeItem('wpp-remembered-account');
      onLogin(OWNER_USER);
      return;
    }

    const account = accounts.find((item) => {
      const name = normalise(item.name);
      return entered === normalise(item.email || '') || entered === name || entered === name.replace(/\s+/g, '');
    });
    if (!account) {
      setMessage({ type: 'error', text: 'Account not found. Use the owner email shown below.' });
      return;
    }
    if (submittedPassword !== '1234' && submittedPassword !== '0000') {
      setMessage({ type: 'error', text: 'Incorrect password. Demo password is 1234.' });
      return;
    }
    if (rememberMe) window.localStorage.setItem('wpp-remembered-account', submittedIdentifier);
    else window.localStorage.removeItem('wpp-remembered-account');
    onLogin(account);
  };

  const handleGoogleLogin = () => {
    setMessage({ type: 'info', text: 'Google sign-in will be available after backend authentication is connected.' });
  };

  return (
    <main className={`wpp-login ${isDark ? 'is-dark' : ''}`}>
      <div className="wpp-login-frame">
        <section className="wpp-login-story" aria-label="Wedding Photo Planet introduction">
          <div className="wpp-brand-lockup"><Camera /><div><strong>Wedding<br />Photo Planet</strong><span>Capturing memories, creating stories</span></div></div>
          <div className="wpp-story-copy">
            <p>Welcome Back to</p><h1>Wedding Photo Planet <em>CRM</em></h1>
            <div className="wpp-heart-rule"><span /><Heart /><span /></div>
            <h2>Manage your clients, projects, shoots &amp; memories<br />all in one beautiful place.</h2>
          </div>
          <blockquote><span>“</span>Behind every successful wedding is a team that<br />plans perfectly and captures beautifully.<div><i /><Heart /><i /></div></blockquote>
        </section>

        <section className="wpp-login-side">
          {onClose && <button type="button" className="wpp-login-close" onClick={onClose} aria-label="Close login"><X /></button>}
          <div className="wpp-theme-toggle" aria-label="Choose appearance">
            <button type="button" className={!isDark ? 'active' : ''} onClick={() => selectTheme(false)} aria-pressed={!isDark}><Sun /> Light</button>
            <button type="button" className={isDark ? 'active' : ''} onClick={() => selectTheme(true)} aria-pressed={isDark}><Moon /> Dark</button>
          </div>

          <div className="wpp-login-card">
            <div className="wpp-floral-corner" aria-hidden="true"><span>✿</span><span>❀</span><span>✿</span></div>
            <div className="wpp-secure-note"><span><ShieldCheck /></span><div><strong>Secure Access Portal</strong><small>Your data is protected with enterprise grade security</small></div></div>
            <header><h2>Login to Your Account</h2><p>Enter your credentials to continue to your dashboard</p></header>

            <form onSubmit={handleLogin} noValidate>
              <label htmlFor="login-identifier">Email or Username</label>
              <div className="wpp-login-field"><Users /><input id="login-identifier" name="identifier" type="text" value={identifier} onInput={(e) => { setIdentifier(e.currentTarget.value); setMessage(null); }} onChange={(e) => { setIdentifier(e.target.value); setMessage(null); }} placeholder="Enter your email or username" autoComplete="username" autoCapitalize="none" spellCheck={false} aria-invalid={message?.type === 'error'} required /></div>
              <label htmlFor="login-password">Password</label>
              <div className="wpp-login-field"><LockKeyhole /><input id="login-password" name="password" type={showPassword ? 'text' : 'password'} value={password} onInput={(e) => { setPassword(e.currentTarget.value); setMessage(null); }} onChange={(e) => { setPassword(e.target.value); setMessage(null); }} placeholder="Enter your password" autoComplete="current-password" aria-invalid={message?.type === 'error'} required /><button type="button" className="wpp-password-toggle" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff /> : <Eye />}</button></div>
              <div className="wpp-login-options">
                <label className="wpp-checkbox"><input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} /><span /> Remember me</label>
                <button type="button" onClick={() => setMessage({ type: 'info', text: 'Demo access: use password 1234 or contact the studio owner.' })}>Forgot Password?</button>
              </div>
              {message && <div className={`wpp-login-message ${message.type}`} role="alert">{message.text}</div>}
              <button type="submit" className="wpp-primary-login"><span>Login to Dashboard</span><i><ArrowRight /></i></button>
              <div className="wpp-or"><span />OR<span /></div>
              <button type="button" className="wpp-google-login" onClick={handleGoogleLogin}><b>G</b> Continue with Google</button>
              <p className="wpp-demo-hint">Demo: <strong>{OWNER_USER.email}</strong> · Password: <strong>1234</strong></p>
            </form>

            <div className="wpp-login-benefits">
              <div><span><Camera /></span><strong>All in One Place</strong><small>Manage everything seamlessly</small></div>
              <div><span><Users /></span><strong>Team Collaboration</strong><small>Work together efficiently</small></div>
              <div><span><ShieldCheck /></span><strong>Secure &amp; Reliable</strong><small>Your data is always protected</small></div>
            </div>
          </div>
        </section>
      </div>
      <footer>Wedding Photo Planet CRM © 2026 <span>·</span> <Heart /> Made with passion</footer>
    </main>
  );
};
