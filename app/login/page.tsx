import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-sm px-6 py-10 md:py-16">
      <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wider text-primary">Welcome back</p>
        <h1 className="mt-2 text-2xl font-bold text-card-foreground">Sign in</h1>

        <form className="mt-6 space-y-4">
          <FormField label="Email">
            <Input type="email" placeholder="name@example.com" />
          </FormField>

          <FormField label="Password">
            <Input type="password" placeholder="••••••••" />
          </FormField>

          <Button className="w-full">Sign in</Button>
        </form>

        <p className="mt-5 text-center text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Link href="/register" className="font-medium text-primary hover:underline">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
