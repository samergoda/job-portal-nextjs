import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";

export default function RegisterPage() {
  return (
    <div className="mx-auto max-w-sm px-6 py-10 md:py-16">
      <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wider text-primary">Get started</p>
        <h1 className="mt-2 text-2xl font-bold text-card-foreground">Create an account</h1>

        <form className="mt-6 space-y-4">
          <FormField label="Full name">
            <Input placeholder="Jane Doe" />
          </FormField>

          <FormField label="Email">
            <Input type="email" placeholder="name@example.com" />
          </FormField>

          <FormField label="Password">
            <Input type="password" placeholder="••••••••" />
          </FormField>

          <Button className="w-full">Create account</Button>
        </form>

        <p className="mt-5 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
