// auth/hooks.ts
"use client";

import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { login, registerUser, getCurrentUser, verifyCurrentUser } from "./api";
import type { RegisterBody, User } from "./types";
import { setTokens, clearTokens, getToken } from "@/lib/token";
import { ApiError } from "@/lib/http";

export function useRegister() {
    return useMutation({
        mutationKey: ['register'],
        mutationFn: (data: RegisterBody) => registerUser(data),
    });
}

export function useLogin() {
    return useMutation({
        mutationKey: ['login'],
        mutationFn: (data: { email: string; password: string }) => login(data),
        onSuccess: (res) => setTokens(res.access_token, res.refresh_token),
    });
}

export function useMe(opts?: { redirectOn401?: boolean }) {
    const { redirectOn401 = true } = opts ?? {};
    const router = useRouter();
    const hasToken = !!getToken();

    const query = useQuery<User, ApiError>({
        queryKey: ["me", hasToken],
        queryFn: () => getCurrentUser(),
        enabled: hasToken, // don't run until we have a token
        staleTime: 60_000,
        retry: (failureCount, error) =>
            !(error.status === 401 || error.status === 403) && failureCount < 2,
    });

    useEffect(() => {
        if (!redirectOn401) return;
        if (query.error && (query.error.status === 401 || query.error.status === 403)) {
            clearTokens();
            router.replace("/auth?login");
        }
    }, [query.error, redirectOn401, router]);

    return query;
}

export function useVerifyUser() {
    const qc = useQueryClient();
    const router = useRouter();

    return useMutation<User, ApiError>({
        mutationKey: ['verify-me'],
        mutationFn: () => verifyCurrentUser(),
        onSuccess: (user) => {
            // Update the cached /me instantly so UI flips to "Verified"
            qc.setQueryData<User>(['me', true], user);
            // (optional) also invalidate any "me" variants just in case
            qc.invalidateQueries({
                predicate: (q) => Array.isArray(q.queryKey) && q.queryKey[0] === 'me',
            });
        },
        onError: (err) => {
            if (err.status === 401 || err.status === 403) {
                clearTokens();
                router.replace('/auth?login');
            }
        },
    });
}