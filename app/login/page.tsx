"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth-context";

type DemoRole = "jobSeeker" | "employer" | "admin";

const DEMO_CREDENTIALS: Record<DemoRole, { email: string; password: string; label: string }> = {
  jobSeeker: { email: "john@gmail.com", password: "EazyBytes@1803", label: "Job Seeker" },
  employer: { email: "sanjana@gmail.com", password: "EazyBytes@1803", label: "Employer" },
  admin: { email: "admin@gmail.com", password: "EazyBytes@1803", label: "Admin" },
};

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showDemo, setShowDemo] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const result = await login(email, password);

    if (result.success) {
      router.push("/");
    } else {
      setError(result.error || "Login failed");
    }
  };

  const fillDemo = (role: DemoRole) => {
    const creds = DEMO_CREDENTIALS[role];
    setEmail(creds.email);
    setPassword(creds.password);
  };

  return (
    <div className="mx-auto max-w-sm px-6 py-10 md:py-16">
      <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wider text-primary">Welcome back</p>
        <h1 className="mt-2 text-2xl font-bold text-card-foreground">Sign in</h1>

        {/* Demo Credentials */}
        <div className="mt-4">
          <button
            type="button"
            onClick={() => setShowDemo(!showDemo)}
            className="w-full rounded-md border border-border bg-accent/50 px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent"
          >
            {showDemo ? "Hide" : "Show"} Demo Credentials
          </button>

          {showDemo && (
            <div className="mt-3 space-y-2">
              {(Object.entries(DEMO_CREDENTIALS) as [DemoRole, typeof DEMO_CREDENTIALS[DemoRole]][]).map(([role, creds]) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => fillDemo(role)}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-left text-sm transition-colors hover:bg-accent"
                >
                  <span className="font-medium text-primary">{creds.label}</span>
                  <span className="ml-2 text-muted-foreground">{creds.email}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <FormField label="Email">
            <Input
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </FormField>

          <FormField label="Password">
            <Input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </FormField>

          {error && (
            <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400">
              {error}
            </p>
          )}

          <Button className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign in"
            )}
          </Button>
        </form>

        <p className="mt-5 text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-medium text-primary hover:underline">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
