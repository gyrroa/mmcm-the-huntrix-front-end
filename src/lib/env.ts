const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

if (!BASE_URL) {
    // Optional: during local dev you can warn, not throw
    // console.warn("Missing NEXT_PUBLIC_API_URL");
}

export { BASE_URL };
