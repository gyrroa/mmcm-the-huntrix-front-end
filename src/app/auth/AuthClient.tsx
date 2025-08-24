'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Image from 'next/image';

/** ---------- Shared ---------- */

function LeftVisual() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="w-full lg:w-auto max-w-[720px] text-center lg:text-left lg:mr-[-50px] isolate lg:mb-0 mb-[-20px]"
    >
      <h1 className="absolute font-bold text-[44px] lg:text-[77px] leading-[110%] -z-20 ">
        <span className="block w-fit bg-[linear-gradient(113deg,#002353_75.43%,rgba(255,255,255,0)_97.88%)] bg-clip-text text-transparent [-webkit-text-fill-color:transparent]">
          WELCOME
        </span>
        <span className="block w-fit bg-[linear-gradient(113deg,#002353_80.43%,rgba(255,255,255,0)_97.88%)] bg-clip-text text-transparent [-webkit-text-fill-color:transparent]">
          BACK!
        </span>
      </h1>
      <div className="flex justify-end mx-auto lg:mx-0">
        <Image
          src="/login/welcome.png"
          alt="Welcome"
          width={700}
          height={700}
          priority
          sizes="(max-width: 1024px) 100vw, 700px"
          className="w-[90%] h-auto mt-[30px] lg:mt-[57px]"
        />
      </div>
      <p className="text-[#004899] sm:text-[20px] mt-4 mr-[75px] text-end whitespace-nowrap lg:block hidden">
        Sign in to continue exploring properties, managing<br />favorites, and tracking your deals
      </p>
    </motion.div>
  );
}

/** ---------- Login ---------- */

type LoginFormState = {
  email: string;
  password: string;
  remember: boolean;
};

type LoginErrors = Partial<Record<keyof LoginFormState, string>>;

function LoginCard() {
  const [form, setForm] = useState<LoginFormState>({ email: '', password: '', remember: true });
  const [showPw, setShowPw] = useState(false);
  const [errors, setErrors] = useState<LoginErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const validate = (): boolean => {
    const e: LoginErrors = {};
    if (!form.email.trim()) e.email = 'Email is required.';
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Enter a valid email address.';
    if (!form.password) e.password = 'Password is required.';
    else if (form.password.length < 6) e.password = 'Must be at least 6 characters.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      // TODO: replace with your auth call
      console.log('Logging in with:', form);
      // router.push('/dashboard');
    } catch {
      setErrors((prev) => ({ ...prev, password: 'Invalid credentials.' }));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="w-full max-w-[520px] bg-white border border-[#D2E4FF] rounded-2xl shadow-xl p-6 sm:p-8 z-20"
    >
      <div className="mb-8 text-center">
        <h2 className="text-[28px] sm:text-[32px] lg:text-[36px] font-bold leading-[140%]">Log in</h2>
        <p className="mt-2 text-[#5C7188] text-sm sm:text-base">Log in to continue with your account.</p>
      </div>

      <div className="flex flex-col gap-3">
        <button
          type="button"
          aria-label="Continue with Google"
          className="inline-flex items-center justify-center w-full gap-3 rounded-lg border-2 border-[#D2E4FF] bg-[#F9FAFF] px-4 py-3 text-sm sm:text-base font-medium hover:bg-white focus:outline-none focus:ring-2 focus:ring-[#3871C1]/50 transition cursor-pointer"
        >
          {/* Google icon */}
          <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
            <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.8 32.2 29.3 36 24 36c-6.6 0-12-5.4-12-12S17.4 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.2 6.1 29.4 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.4-.4-3.5z" />
            <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.5 16 18.8 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.2 6.1 29.4 4 24 4 16.1 4 9.2 8.6 6.3 14.7z" />
            <path fill="#4CAF50" d="M24 44c5.2 0 10-2 13.6-5.2l-6.3-5.2C29.3 36 25 36 24 36c-5.3 0-9.8-3.8-11.3-8.9l-6.6 5.1C9.1 39.5 16 44 24 44z" />
            <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-1 3-3.6 5.5-6.7 6.6l6.3 5.2C38 37.2 44 32 44 24c0-1.2-.1-2.4-.4-3.5z" />
          </svg>
          Continue with Google
        </button>
      </div>

      <div className="relative my-6">
        <div className="h-px w-full bg-[#D2E4FF]" />
        <span className="absolute left-1/2 -translate-x-1/2 -top-3 bg-white px-3 text-xs text-[#5C7188]">or</span>
      </div>

      <form onSubmit={onSubmit} noValidate className="space-y-5">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-[#002353]">Email</label>
          <input
            id="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            className={`mt-2 w-full rounded-lg bg-[#F9FAFF] border-2 ${errors.email ? 'border-red-400' : 'border-[#D2E4FF]'} px-4 py-3 text-sm sm:text-base placeholder-[#5C7188]/70 text-[#002353] focus:outline-none focus:ring-2 ${errors.email ? 'focus:ring-red-300' : 'focus:ring-[#3871C1]/50'}`}
            placeholder="you@example.com"
          />
          {errors.email && <p className="mt-2 text-sm text-red-500">{errors.email}</p>}
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="block text-sm font-medium text-[#002353]">Password</label>
            <Link href="/forgot-password" className="text-sm text-[#3871C1] hover:underline">Forgot password?</Link>
          </div>

          <div className={`mt-2 flex items-center rounded-lg bg-[#F9FAFF] border-2 ${errors.password ? 'border-red-400' : 'border-[#D2E4FF]'} focus-within:ring-2 ${errors.password ? 'focus-within:ring-red-300' : 'focus-within:ring-[#3871C1]/50'}`}>
            <input
              id="password"
              type={showPw ? 'text' : 'password'}
              autoComplete="current-password"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              className="w-full bg-transparent px-4 py-3 text-sm sm:text-base placeholder-[#5C7188]/70 text-[#002353] focus:outline-none"
              placeholder="••••••••"
            />
            <button
              type="button"
              aria-label={showPw ? 'Hide password' : 'Show password'}
              onClick={() => setShowPw((s) => !s)}
              className="px-3 py-2 text-[#5C7188] hover:text-[#002353] focus:outline-none"
            >
              {showPw ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M3 3l18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <path d="M10.58 10.58A3 3 0 0012 15a3 3 0 002.42-4.42M9.88 5.08A10.47 10.47 0 0112 5c5 0 9.27 3.11 10.5 7.5a10.64 10.64 0 01-2.26 3.9M6.12 6.12A10.6 10.6 0 001.5 12.5a10.62 10.62 0 003.4 4.64" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M1.5 12.5C2.73 8.11 7 5 12 5s9.27 3.11 10.5 7.5C21.27 16.89 17 20 12 20S2.73 16.89 1.5 12.5z" stroke="currentColor" strokeWidth="2" />
                  <circle cx="12" cy="12.5" r="3" stroke="currentColor" strokeWidth="2" />
                </svg>
              )}
            </button>
          </div>
          {errors.password && <p className="mt-2 text-sm text-red-500">{errors.password}</p>}
        </div>

        <label className="mt-1 inline-flex items-center gap-2 select-none">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-[#D2E4FF] text-[#002353] focus:ring-[#3871C1]"
            checked={form.remember}
            onChange={(e) => setForm((f) => ({ ...f, remember: e.target.checked }))}
          />
          <span className="text-sm text-[#5C7188]">Remember me</span>
        </label>

        <button
          type="submit"
          disabled={submitting}
          className="mt-2 inline-flex w-full items-center justify-center rounded-lg bg-[#004899] text-white px-4 py-3 text-sm sm:text-base font-semibold enabled:hover:bg-[#0b3a7e] disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#3871C1]/50 transition cursor-pointer"
        >
          {submitting ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-[#5C7188]">
        Don’t have an account?{' '}
        <Link href="?register" replace className="text-[#3871C1] hover:underline">
          Create one
        </Link>
      </p>
    </motion.div>
  );
}

/** ---------- Register ---------- */

type RegisterFormState = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirm: string;
};

type RegisterErrors = Partial<Record<keyof RegisterFormState, string>>;

function RegisterCard() {
  const [form, setForm] = useState<RegisterFormState>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirm: '',
  });
  const [showPw, setShowPw] = useState(false);
  const [errors, setErrors] = useState<RegisterErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const validate = (): boolean => {
    const e: RegisterErrors = {};
    if (!form.firstName.trim()) e.firstName = 'First name is required.';
    if (!form.lastName.trim()) e.lastName = 'Last name is required.';
    if (!form.email.trim()) e.email = 'Email is required.';
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Enter a valid email address.';
    if (!form.password) e.password = 'Password is required.';
    else if (form.password.length < 6) e.password = 'Must be at least 6 characters.';
    if (form.confirm !== form.password) e.confirm = 'Passwords do not match.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      // TODO: call your register API
      console.log('Register with:', {
        ...form,
        // If your backend expects "fullName", you can also send:
        // fullName: `${form.firstName} ${form.lastName}`.trim(),
      });
      // router.push('/dashboard');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="w-full max-w-[520px] bg-white border border-[#D2E4FF] rounded-2xl shadow-xl p-6 sm:p-8 z-20"
    >
      <div className="mb-8 text-center">
        <h2 className="text-[28px] sm:text-[32px] lg:text-[36px] font-bold leading-[140%]">Create account</h2>
        <p className="mt-2 text-[#5C7188] text-sm sm:text-base">Join to save favorites and track deals.</p>
      </div>

      {/* Google signup */}
      <div className="flex flex-col gap-3">
        <button
          type="button"
          aria-label="Continue with Google"
          // onClick={() => signIn('google')} // ← hook up to your auth
          className="inline-flex items-center justify-center w-full gap-3 rounded-lg border-2 border-[#D2E4FF] bg-[#F9FAFF] px-4 py-3 text-sm sm:text-base font-medium hover:bg-white focus:outline-none focus:ring-2 focus:ring-[#3871C1]/50 transition cursor-pointer"
        >
          <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
            <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.8 32.2 29.3 36 24 36c-6.6 0-12-5.4-12-12S17.4 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.2 6.1 29.4 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.4-.4-3.5z" />
            <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.5 16 18.8 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.2 6.1 29.4 4 24 4 16.1 4 9.2 8.6 6.3 14.7z" />
            <path fill="#4CAF50" d="M24 44c5.2 0 10-2 13.6-5.2l-6.3-5.2C29.3 36 25 36 24 36c-5.3 0-9.8-3.8-11.3-8.9l-6.6 5.1C9.1 39.5 16 44 24 44z" />
            <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-1 3-3.6 5.5-6.7 6.6l6.3 5.2C38 37.2 44 32 44 24c0-1.2-.1-2.4-.4-3.5z" />
          </svg>
          Continue with Google
        </button>
      </div>

      <div className="relative my-6">
        <div className="h-px w-full bg-[#D2E4FF]" />
        <span className="absolute left-1/2 -translate-x-1/2 -top-3 bg-white px-3 text-xs text-[#5C7188]">or</span>
      </div>

      <form onSubmit={onSubmit} noValidate className="space-y-5">
        {/* First & Last name */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label htmlFor="regFirst" className="block text-sm font-medium text-[#002353]">First name</label>
            <input
              id="regFirst"
              type="text"
              autoComplete="given-name"
              value={form.firstName}
              onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
              className={`mt-2 w-full rounded-lg bg-[#F9FAFF] border-2 ${errors.firstName ? 'border-red-400' : 'border-[#D2E4FF]'} px-4 py-3 text-sm sm:text-base placeholder-[#5C7188]/70 text-[#002353] focus:outline-none focus:ring-2 ${errors.firstName ? 'focus:ring-red-300' : 'focus:ring-[#3871C1]/50'}`}
              placeholder="Jane"
            />
            {errors.firstName && <p className="mt-2 text-sm text-red-500">{errors.firstName}</p>}
          </div>

          <div>
            <label htmlFor="regLast" className="block text-sm font-medium text-[#002353]">Last name</label>
            <input
              id="regLast"
              type="text"
              autoComplete="family-name"
              value={form.lastName}
              onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
              className={`mt-2 w-full rounded-lg bg-[#F9FAFF] border-2 ${errors.lastName ? 'border-red-400' : 'border-[#D2E4FF]'} px-4 py-3 text-sm sm:text-base placeholder-[#5C7188]/70 text-[#002353] focus:outline-none focus:ring-2 ${errors.lastName ? 'focus:ring-red-300' : 'focus:ring-[#3871C1]/50'}`}
              placeholder="Doe"
            />
            {errors.lastName && <p className="mt-2 text-sm text-red-500">{errors.lastName}</p>}
          </div>
        </div>

        <div>
          <label htmlFor="regEmail" className="block text-sm font-medium text-[#002353]">Email</label>
          <input
            id="regEmail"
            type="email"
            inputMode="email"
            autoComplete="email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            className={`mt-2 w-full rounded-lg bg-[#F9FAFF] border-2 ${errors.email ? 'border-red-400' : 'border-[#D2E4FF]'} px-4 py-3 text-sm sm:text-base placeholder-[#5C7188]/70 text-[#002353] focus:outline-none focus:ring-2 ${errors.email ? 'focus:ring-red-300' : 'focus:ring-[#3871C1]/50'}`}
            placeholder="you@example.com"
          />
          {errors.email && <p className="mt-2 text-sm text-red-500">{errors.email}</p>}
        </div>

        <div>
          <label htmlFor="regPassword" className="block text-sm font-medium text-[#002353]">Password</label>
          <div className={`mt-2 flex items-center rounded-lg bg-[#F9FAFF] border-2 ${errors.password ? 'border-red-400' : 'border-[#D2E4FF]'} focus-within:ring-2 ${errors.password ? 'focus-within:ring-red-300' : 'focus-within:ring-[#3871C1]/50'}`}>
            <input
              id="regPassword"
              type={showPw ? 'text' : 'password'}
              autoComplete="new-password"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              className="w-full bg-transparent px-4 py-3 text-sm sm:text-base placeholder-[#5C7188]/70 text-[#002353] focus:outline-none"
              placeholder="••••••••"
            />
            <button
              type="button"
              aria-label={showPw ? 'Hide password' : 'Show password'}
              onClick={() => setShowPw((s) => !s)}
              className="px-3 py-2 text-[#5C7188] hover:text-[#002353] focus:outline-none"
            >
              {showPw ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M3 3l18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <path d="M10.58 10.58A3 3 0 0012 15a3 3 0 002.42-4.42M9.88 5.08A10.47 10.47 0 0112 5c5 0 9.27 3.11 10.5 7.5a10.64 10.64 0 01-2.26 3.9M6.12 6.12A10.6 10.6 0 001.5 12.5a10.62 10.62 0 003.4 4.64" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M1.5 12.5C2.73 8.11 7 5 12 5s9.27 3.11 10.5 7.5C21.27 16.89 17 20 12 20S2.73 16.89 1.5 12.5z" stroke="currentColor" strokeWidth="2" />
                  <circle cx="12" cy="12.5" r="3" stroke="currentColor" strokeWidth="2" />
                </svg>
              )}
            </button>
          </div>
          {errors.password && <p className="mt-2 text-sm text-red-500">{errors.password}</p>}
        </div>

        <div>
          <label htmlFor="confirm" className="block text-sm font-medium text-[#002353]">Confirm password</label>
          <input
            id="confirm"
            type="password"
            autoComplete="new-password"
            value={form.confirm}
            onChange={(e) => setForm((f) => ({ ...f, confirm: e.target.value }))}
            className={`mt-2 w-full rounded-lg bg-[#F9FAFF] border-2 ${errors.confirm ? 'border-red-400' : 'border-[#D2E4FF]'} px-4 py-3 text-sm sm:text-base placeholder-[#5C7188]/70 text-[#002353] focus:outline-none focus:ring-2 ${errors.confirm ? 'focus:ring-red-300' : 'focus:ring-[#3871C1]/50'}`}
            placeholder="••••••••"
          />
          {errors.confirm && <p className="mt-2 text-sm text-red-500">{errors.confirm}</p>}
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="mt-2 inline-flex w-full items-center justify-center rounded-lg bg-[#004899] text-white px-4 py-3 text-sm sm:text-base font-semibold enabled:hover:bg-[#0b3a7e] disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#3871C1]/50 transition cursor-pointer"
        >
          {submitting ? 'Creating account…' : 'Create account'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-[#5C7188]">
        Already have an account?{' '}
        <Link href="?login" replace className="text-[#3871C1] hover:underline">
          Log in
        </Link>
      </p>
    </motion.div>
  );
}


/** ---------- Page (switches by query) ---------- */

export default function AuthPage() {
  const search = useSearchParams();

  // Support both styles:
  // 1) boolean presence: /auth?register or /auth?login
  // 2) explicit value:   /auth?mode=register|login
  const modeParam = (search.get('mode') || '').toLowerCase();
  const isRegister =
    search.has('register') || modeParam === 'register' || (!search.has('login') && modeParam !== 'login' && false);

  // ^ The last clause keeps default = login. Remove "&& false" above if you want default to be register.

  return (
    <main
      className="
        min-h-screen w-full
        bg-gradient-to-b from-white to-[#D2E4FF]
        text-[#002353]
        flex flex-col lg:flex-row items-center
        justify-center lg:justify-center
        lg:gap-0
        px-4 sm:px-6 md:px-10 lg:px-[160px]
        py-12 lg:py-[100px]
        mt-0 lg:mt-[-96px]
      "
    >
      <LeftVisual />
      {isRegister ? <RegisterCard /> : <LoginCard />}
    </main>
  );
}
