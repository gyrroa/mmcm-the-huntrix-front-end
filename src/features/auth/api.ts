"use client";

import { get, postFormUrlEncoded } from "@/lib/http";
import type { RegisterBody, LoginResponse, User } from "./types";

/** /register */
export function registerUser(body: RegisterBody) {
    return postFormUrlEncoded<User>("/register", body);
}

/** /auth/token (OAuth2 password) */
export function login(args: {
    email: string;
    password: string;
    scope?: string;
    client_id?: string | null;
    client_secret?: string | null;
}) {
    const { email, password, scope, client_id, client_secret } = args;
    return postFormUrlEncoded<LoginResponse>("/auth/token", {
        grant_type: "password",
        username: email,
        password,
        scope: scope ?? "",
        client_id,
        client_secret,
    });
}

/** /users/me */
export function getCurrentUser() {
    return get<User>("/users/me", { auth: true });
}
