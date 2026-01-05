"use client";

import { useState } from "react";

const API_URL = "https://iw949nm61f.execute-api.us-east-1.amazonaws.com/dev";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState({ loading: false, error: null, message: null });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, error: null, message: null });

    try {
      // GET all accounts, no query params
      const res = await fetch(API_URL, { method: "GET" });
      const proxy = await res.json();
      console.log("Login response (proxy):", proxy);

      // Lambda proxy shape: { statusCode, headers, body: "[{...}]" }
      const body = proxy?.body ? JSON.parse(proxy.body) : proxy;
      console.log("Parsed accounts body:", body);

      const accounts = Array.isArray(body) ? body : [];

      const matchedUser = accounts.find(
        (u) =>
          (u.username === username || u.Username === username) &&
          (u.password === password || u.Password === password)
      );

      if (!res.ok || proxy.statusCode !== 200 || !matchedUser) {
        setStatus({
          loading: false,
          error: "Invalid username or password.",
          message: null,
        });
        return;
      }

      if (typeof window !== "undefined") {
        window.localStorage.setItem(
          "user",
          JSON.stringify({
            username: matchedUser.username || matchedUser.Username || username,
          })
        );
      }

      setStatus({
        loading: false,
        error: null,
        message: "Logged in successfully. Redirecting...",
      });

      // Hard refresh to avoid duplicate stream instances
      if (typeof window !== "undefined") {
        window.location.href = "/";
      }
    } catch (err) {
      setStatus({
        loading: false,
        error: err.message || "Login failed.",
        message: null,
      });
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md p-6 rounded-lg shadow-md bg-card">
        <h1 className="text-2xl font-semibold mb-4">Login</h1>
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
              autoComplete="current-password"
            />
          </div>
          <button
            type="submit"
            disabled={status.loading}
            className="w-full py-2 rounded-md bg-primary text-primary-foreground disabled:opacity-50"
          >
            {status.loading ? "Logging in..." : "Login"}
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
          Need an account?{" "}
          <a href="/create-user" className="text-primary underline">
            Create one
          </a>
        </p>
      </div>
    </main>
  );
}
