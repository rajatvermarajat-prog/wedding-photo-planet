'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Heart, X } from 'lucide-react';
import { TeamMember } from '@/types';
import { LoginHero } from './LoginHero';
import { LoginFormCard } from './LoginFormCard';
import { OWNER_USER } from './authConstants';

interface LoginScreenProps {
  team: TeamMember[];
  onLogin: (user: TeamMember | typeof OWNER_USER) => void;
  onAddTeamMember?: (member: TeamMember) => void;
  onClose?: () => void;
}

export { OWNER_USER } from './authConstants';
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

  return (
    <main className="fixed inset-0 z-60 min-h-dvh overflow-x-hidden overflow-y-auto bg-[#2d101e] bg-[radial-gradient(circle_at_12%_10%,#6f2841_0,transparent_29%),radial-gradient(circle_at_85%_90%,#5d2038_0,transparent_26%)] text-[#38242c] lg:h-dvh lg:overflow-hidden lg:px-[3vw] lg:pb-2 lg:pt-4">
      <div className="mx-auto grid min-h-dvh w-full overflow-hidden bg-[#f4e8e2] shadow-[0_35px_100px_rgba(12,2,8,.48)] lg:h-[calc(100dvh-54px)] lg:min-h-0 lg:max-w-360 lg:grid-cols-[46%_54%] lg:rounded-[30px] lg:border lg:border-[rgba(255,226,210,.6)] xl:grid-cols-[48%_52%]">
        <LoginHero />
        <LoginFormCard
          identifier={identifier} password={password} rememberMe={rememberMe}
          showPassword={showPassword} isDark={isDark} message={message}
          onIdentifierChange={(value) => { setIdentifier(value); setMessage(null); }}
          onPasswordChange={(value) => { setPassword(value); setMessage(null); }}
          onRememberChange={setRememberMe}
          onPasswordVisibility={() => setShowPassword((value) => !value)}
          onThemeChange={selectTheme}
          onForgotPassword={() => setMessage({ type: 'info', text: 'Demo access: use password 1234 or contact the studio owner.' })}
          onGoogleLogin={() => setMessage({ type: 'info', text: 'Google sign-in will be available after backend authentication is connected.' })}
          onSubmit={handleLogin}
        />
        {onClose && <button type="button" onClick={onClose} aria-label="Close login" className="fixed right-4 top-4 z-70 rounded-full p-2 text-[#7d5c66] hover:bg-white/40"><X className="size-5" /></button>}
      </div>
      <footer className="hidden h-9 items-center justify-center gap-2.5 pt-2 text-xs font-extrabold uppercase tracking-[.12em] text-[#d9bdc4] lg:flex">
        Wedding Photo Planet CRM © 2026 <span>·</span> <Heart className="size-3 fill-[#d56686] text-[#d56686]" /> Made with passion
      </footer>
    </main>
  );
};
