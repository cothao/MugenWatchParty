"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const API_URL = "https://iw949nm61f.execute-api.us-east-1.amazonaws.com/dev";

export default function CreateUserPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState({ loading: false, error: null, message: null });
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, error: null, message: null });

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "createUser",
          username,
          password,
        }),
      });

      const data = await res.json();
      console.log("Create user response:", data);

      if (!res.ok) {
        throw new Error(data?.message || `HTTP ${res.status}`);
      }

      if (typeof window !== "undefined") {
        window.localStorage.setItem(
          "user",
          JSON.stringify({ username })
        );
      }

      setStatus({ loading: false, error: null, message: "Account created successfully. Redirecting..." });
      router.push("/"); // redirect to main page as logged in
    } catch (err) {
      setStatus({ loading: false, error: err.message || "Account creation failed.", message: null });
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md p-6 rounded-lg shadow-md bg-card">
        <h1 className="text-2xl font-semibold mb-4">Create Account</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-1" htmlFor="username">
              Username
            </label>
            <input
              id="username"
              type="text"
              className="w-full px-3 py-2 border rounded-md bg-background"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoComplete="username"
            />
          </div>
          <div>
            <label className="block text-sm mb-1" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              className="w-full px-3 py-2 border rounded-md bg-background"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
          </div>
          <button
            type="submit"
            disabled={status.loading}
            className="w-full py-2 rounded-md bg-primary text-primary-foreground disabled:opacity-50"
          >
            {status.loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        {status.error && (
          <p className="mt-3 text-sm text-red-500">
            {status.error}
          </p>
        )}
        {status.message && (
          <p className="mt-3 text-sm text-green-500">
            {status.message}
          </p>
        )}

        <p className="mt-4 text-sm text-muted-foreground">
          Already have an account?{" "}
          <a href="/login" className="text-primary underline">
            Login
          </a>
        </p>
      </div>
    </main>
  );
}
