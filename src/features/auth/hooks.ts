"use client";

import { useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { login, registerUser, getCurrentUser } from "./api";
import type { RegisterBody, User } from "./types";
import { setToken, clearToken, getToken } from "@/lib/token";
import { ApiError } from "@/lib/http";

export function useRegister() {
    return useMutation({
        mutationFn: (data: RegisterBody) => registerUser(data),
    });
}

export function useLogin() {
    return useMutation({
        mutationFn: (data: { email: string; password: string }) => login(data),
        onSuccess: (res) => setToken(res.access_token),
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
            clearToken();
            router.replace("/auth?login");
        }
    }, [query.error, redirectOn401, router]);

    return query;
}
