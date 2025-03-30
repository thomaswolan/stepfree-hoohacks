"use client";

import { useState } from "react";
import { signInWithEmail, signUpWithEmail } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignIn, setIsSignIn] = useState(true);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isSignIn) {
        await signInWithEmail(email, password);
      } else {
        await signUpWithEmail(email, password);
      }
      // Redirect after successful authentication
      router.push("/");
    } catch (error: any) {
      console.error("Auth error:", error.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 p-6 border rounded-lg bg-white dark:bg-gray-800 shadow-md w-full max-w-sm"
      >
        <h1 className="text-2xl font-bold text-center">
          {isSignIn ? "Sign In" : "Sign Up"}
        </h1>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border p-2 rounded focus:outline-none focus:border-blue-500"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border p-2 rounded focus:outline-none focus:border-blue-500"
        />
        <button
          type="submit"
          className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition"
        >
          {isSignIn ? "Sign In" : "Sign Up"}
        </button>
        <p
          className="cursor-pointer text-center text-blue-500"
          onClick={() => setIsSignIn((prev) => !prev)}
        >
          {isSignIn
            ? "Don't have an account? Sign Up"
            : "Already have an account? Sign In"}
        </p>
      </form>
    </div>
  );
}
