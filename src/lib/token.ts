"use client";

type TokenListener = (token: string | null) => void;

let _token: string | null = null;
const KEY = "access_token";
const listeners = new Set<TokenListener>();

/** Initialize from localStorage lazily */
function readFromStorage(): string | null {
    try {
        return localStorage.getItem(KEY);
    } catch {
        return null;
    }
}

export function getToken(): string | null {
    if (_token !== null) return _token;
    _token = readFromStorage();
    return _token;
}

export function setToken(token: string) {
    _token = token;
    try {
        localStorage.setItem(KEY, token);
    } catch { }
    listeners.forEach((cb) => cb(_token));
}

export function clearToken() {
    _token = null;
    try {
        localStorage.removeItem(KEY);
    } catch { }
    listeners.forEach((cb) => cb(_token));
}

/** Cross-tab sync */
if (typeof window !== "undefined") {
    window.addEventListener("storage", (e) => {
        if (e.key === KEY) {
            _token = e.newValue;
            listeners.forEach((cb) => cb(_token));
        }
    });
}

/** Subscribe to token changes (login/logout), returns unsubscribe */
export function subscribeToken(fn: TokenListener) {
    listeners.add(fn);
    return () => listeners.delete(fn);
}
