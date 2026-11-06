'use client';

import React, { useState } from 'react';
import { X, ArrowLeft, Mail, Shield, CheckCircle } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
}

export function AuthModal({
  isOpen,
  onClose,
  title = 'Sign up below to unlock the full potential of Perplexity',
  subtitle,
}: AuthModalProps) {
  const [email, setEmail] = useState('');
  const [isSSOMode, setIsSSOMode] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const validateEmail = (val: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (errorMessage) setErrorMessage('');
  };

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEmail(email)) {
      setErrorMessage('Please enter a valid email address');
      return;
    }
    setErrorMessage('');
    setIsSuccess(true);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
      data-testid="login-modal"
    >
      <div className="relative w-full max-w-md rounded-2xl bg-card border border-border shadow-2xl p-6 sm:p-8 space-y-5 animate-in zoom-in-95 duration-150">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-muted hover:text-foreground hover:bg-subtle transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Back Button if SSO Mode */}
        {isSSOMode && (
          <button
            onClick={() => setIsSSOMode(false)}
            className="inline-flex items-center gap-1.5 text-xs text-secondary hover:text-foreground mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </button>
        )}

        {/* Header */}
        <div className="space-y-1">
          <h2 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight leading-snug">
            {title}
          </h2>
          {subtitle && <p className="text-xs text-secondary">{subtitle}</p>}
        </div>

        {isSuccess ? (
          <div className="py-6 text-center space-y-2">
            <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto" />
            <h3 className="text-base font-semibold text-foreground">Magic Link Sent!</h3>
            <p className="text-xs text-secondary">
              We sent a temporary sign-in link to <span className="font-semibold">{email}</span>. Click
              the link in your inbox to sign in.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {!isSSOMode ? (
              <>
                {/* Social Login Buttons */}
                <button
                  type="button"
                  onClick={() => alert('OAuth Google Sign-In')}
                  className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl border border-border bg-card hover:bg-soft text-foreground text-sm font-medium transition-colors shadow-2xs"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Continue with Google</span>
                </button>

                <button
                  type="button"
                  onClick={() => alert('OAuth Apple Sign-In')}
                  className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl border border-border bg-card hover:bg-soft text-foreground text-sm font-medium transition-colors shadow-2xs"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.42c.62-.77 1.05-1.84.93-2.92-.93.04-2.02.63-2.67 1.4-.58.68-.99 1.76-.85 2.81 1.03.08 2.05-.53 2.59-1.29z" />
                  </svg>
                  <span>Continue with Apple</span>
                </button>

                <div className="relative py-2">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-[10px] uppercase font-bold text-muted">
                    <span className="bg-card px-2">or</span>
                  </div>
                </div>

                {/* Email Form with Direct Client-side Validation */}
                <form onSubmit={handleContinue} className="space-y-2">
                  {errorMessage && (
                    <p className="text-xs text-red-500 font-medium px-1 animate-in fade-in">
                      {errorMessage}
                    </p>
                  )}

                  <input
                    type="email"
                    value={email}
                    onChange={handleEmailChange}
                    placeholder="Enter your email"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-subtle text-foreground text-sm placeholder:text-muted focus:outline-none focus:border-accent transition-colors"
                  />

                  <button
                    type="submit"
                    disabled={!email.trim()}
                    className="w-full py-2.5 px-4 rounded-xl bg-accent hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium transition-all shadow-xs"
                  >
                    Continue with email
                  </button>
                </form>

                {/* Single Sign-On */}
                <button
                  type="button"
                  onClick={() => {
                    setIsSSOMode(true);
                    setErrorMessage('');
                  }}
                  className="w-full py-2 text-xs font-medium text-secondary hover:text-foreground text-center"
                >
                  Single sign-on (SSO)
                </button>
              </>
            ) : (
              /* SSO Form */
              <form onSubmit={handleContinue} className="space-y-3">
                <input
                  type="email"
                  value={email}
                  onChange={handleEmailChange}
                  placeholder="Enter your work email"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-subtle text-foreground text-sm placeholder:text-muted focus:outline-none focus:border-accent transition-colors"
                />

                <button
                  type="submit"
                  disabled={!email.trim()}
                  className="w-full py-2.5 px-4 rounded-xl bg-accent hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium transition-all shadow-xs"
                >
                  Continue with SSO
                </button>
              </form>
            )}

            {/* Legal Disclaimer */}
            <p className="text-[11px] text-muted text-center pt-2 leading-relaxed">
              By continuing, you agree to the{' '}
              <a href="#" className="underline hover:text-foreground">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#" className="underline hover:text-foreground">
                Privacy Notice
              </a>
              .
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
