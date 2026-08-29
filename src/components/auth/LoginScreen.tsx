'use client';

import React, { useEffect, useState } from 'react';
import { Heart, X } from 'lucide-react';
import { ApiError } from '@/lib/api/client';
import { LoginInput } from '@/lib/api/auth';
import { LoginHero } from './LoginHero';
import { LoginFormCard } from './LoginFormCard';
import { LoginToast } from './LoginToast';

interface LoginScreenProps {
  onLogin: (input: LoginInput) => Promise<void>;
  onAddTeamMember?: unknown;
  onClose?: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, onClose }) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isDark, setIsDark] = useState(false);
  const [message, setMessage] = useState<{ type: 'error' | 'info'; text: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const remembered = window.localStorage.getItem('wpp-remembered-account');
    if (remembered) setIdentifier(remembered);
    setIsDark(window.localStorage.getItem('wpp-login-theme') === 'dark');
  }, []);

  const selectTheme = (dark: boolean) => {
    setIsDark(dark);
    window.localStorage.setItem('wpp-login-theme', dark ? 'dark' : 'light');
  };

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);
    const formData = new FormData(event.currentTarget);
    const submittedIdentifier = String(formData.get('identifier') ?? identifier).trim();
    const submittedPassword = String(formData.get('password') ?? password).trim();

    if (!submittedIdentifier || !submittedPassword) {
      setMessage({ type: 'error', text: 'Please enter your email/username and password.' });
      return;
    }

    setIdentifier(submittedIdentifier);
    setPassword('');
    if (rememberMe) window.localStorage.setItem('wpp-remembered-account', submittedIdentifier);
    else window.localStorage.removeItem('wpp-remembered-account');
    setIsSubmitting(true);
    try {
      await onLogin({ email: submittedIdentifier, password: submittedPassword });
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof ApiError ? error.message : 'Unable to sign in. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="fixed inset-0 z-60 min-h-dvh overflow-x-hidden overflow-y-auto bg-[#2d101e] bg-[radial-gradient(circle_at_12%_10%,#6f2841_0,transparent_29%),radial-gradient(circle_at_85%_90%,#5d2038_0,transparent_26%)] text-[#38242c] lg:h-dvh lg:overflow-hidden lg:px-[3vw] lg:pb-2 lg:pt-4">
      <div className="mx-auto grid min-h-dvh w-full overflow-hidden bg-[#f4e8e2] shadow-[0_35px_100px_rgba(12,2,8,.48)] lg:h-[calc(100dvh-54px)] lg:min-h-0 lg:max-w-360 lg:grid-cols-[46%_54%] lg:rounded-[30px] lg:border lg:border-[rgba(255,226,210,.6)] xl:grid-cols-[48%_52%]">
        <LoginHero />
        <LoginFormCard
          identifier={identifier} password={password} rememberMe={rememberMe}
          showPassword={showPassword} isDark={isDark} message={message}
          onIdentifierChange={(value) => { setIdentifier(value); setMessage(null); }}
          onPasswordChange={(value) => { setPassword(value); setMessage(null); }}
          onRememberChange={(value) => {
            setRememberMe(value);
            setMessage({ type: 'info', text: value ? 'Remember me enabled' : 'Remember me disabled' });
          }}
          onPasswordVisibility={() => setShowPassword((value) => !value)}
          onThemeChange={selectTheme}
          onForgotPassword={() => setMessage({ type: 'info', text: 'Please contact your administrator to reset your password.' })}
          onGoogleLogin={() => setMessage({ type: 'info', text: 'Google sign-in is not configured for this CRM.' })}
          onSubmit={handleLogin}
          isSubmitting={isSubmitting}
        />
        {onClose && <button type="button" onClick={onClose} aria-label="Close login" className="fixed right-4 top-4 z-70 rounded-full p-2 text-[#7d5c66] hover:bg-white/40"><X className="size-5" /></button>}
      </div>
      <footer className="hidden h-9 items-center justify-center gap-2.5 pt-2 text-xs font-extrabold uppercase tracking-[.12em] text-[#d9bdc4] lg:flex">
        Wedding Photo Planet CRM © 2026 <span>·</span> <Heart className="size-3 fill-[#d56686] text-[#d56686]" /> Made with passion
      </footer>
      <LoginToast message={message} onDismiss={() => setMessage(null)} />
    </main>
  );
};
