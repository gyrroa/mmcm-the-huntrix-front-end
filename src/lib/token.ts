// lib/token.ts
"use client";

type TokenListener = (token: string | null) => void;

let _accessToken: string | null = null;
let _refreshToken: string | null = null;

const ACCESS_KEY = "access_token";
const REFRESH_KEY = "refresh_token";

const listeners = new Set<TokenListener>();

function readFromStorage(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function getToken(): string | null {
  if (_accessToken !== null) return _accessToken;
  _accessToken = readFromStorage(ACCESS_KEY);
  return _accessToken;
}

export function getRefreshToken(): string | null {
  if (_refreshToken !== null) return _refreshToken;
  _refreshToken = readFromStorage(REFRESH_KEY);
  return _refreshToken;
}

export function setTokens(access: string, refresh: string) {
  _accessToken = access;
  _refreshToken = refresh;
  try {
    localStorage.setItem(ACCESS_KEY, access);
    localStorage.setItem(REFRESH_KEY, refresh);
  } catch {}
  listeners.forEach((cb) => cb(_accessToken));
}

export function clearTokens() {
  _accessToken = null;
  _refreshToken = null;
  try {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
  } catch {}
  listeners.forEach((cb) => cb(_accessToken));
}

// sync across tabs
if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key === ACCESS_KEY) {
      _accessToken = e.newValue;
      listeners.forEach((cb) => cb(_accessToken));
    }
    if (e.key === REFRESH_KEY) {
      _refreshToken = e.newValue;
    }
  });
}

export function subscribeToken(fn: TokenListener) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
