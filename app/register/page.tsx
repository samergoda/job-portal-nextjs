"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth-context";

type UserType = "jobSeeker" | "employer";

type FormData = {
  name: string;
  email: string;
  mobileNumber: string;
  password: string;
  confirmPassword: string;
  userType: UserType;
  company: string;
};

type FormErrors = Partial<Record<keyof FormData | "general", string>>;

export default function RegisterPage() {
  const router = useRouter();
  const { register, isLoading } = useAuth();

  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    mobileNumber: "",
    password: "",
    confirmPassword: "",
    userType: "jobSeeker",
    company: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleUserTypeChange = (type: UserType) => {
    setFormData((prev) => ({ ...prev, userType: type, company: "" }));
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (formData.name.trim().length < 5) {
      newErrors.name = "Name must be at least 5 characters";
    } else if (formData.name.trim().length > 30) {
      newErrors.name = "Name must not exceed 30 characters";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.mobileNumber.trim()) {
      newErrors.mobileNumber = "Mobile number is required";
    } else if (!/^\d{10}$/.test(formData.mobileNumber.trim())) {
      newErrors.mobileNumber = "Mobile number must be exactly 10 digits";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    } else if (formData.password.length > 20) {
      newErrors.password = "Password must not exceed 20 characters";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (formData.userType === "employer" && !formData.company.trim()) {
      newErrors.company = "Company name is required for employers";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!validate()) return;

    const result = await register(formData);

    if (result.success) {
      router.push("/login");
    } else {
      setErrors({ general: result.error || "Registration failed" });
    }
  };

  return (
    <div className="mx-auto max-w-md px-6 py-10 md:py-16">
      <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wider text-primary">Get started</p>
        <h1 className="mt-2 text-2xl font-bold text-card-foreground">Create an account</h1>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {/* User Type Selection */}
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">I am a</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleUserTypeChange("jobSeeker")}
                className={`rounded-lg border-2 px-3 py-2.5 text-sm font-medium transition-colors ${
                  formData.userType === "jobSeeker"
                    ? "border-primary bg-accent text-primary"
                    : "border-border text-muted-foreground hover:border-primary/40"
                }`}
              >
                Job Seeker
              </button>
              <button
                type="button"
                onClick={() => handleUserTypeChange("employer")}
                className={`rounded-lg border-2 px-3 py-2.5 text-sm font-medium transition-colors ${
                  formData.userType === "employer"
                    ? "border-primary bg-accent text-primary"
                    : "border-border text-muted-foreground hover:border-primary/40"
                }`}
              >
                Employer
              </button>
            </div>
          </div>

          {/* Full Name */}
          <FormField label="Full Name" error={errors.name}>
            <Input
              name="name"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={handleChange}
              className={errors.name ? "border-red-300 dark:border-red-700" : ""}
            />
          </FormField>

          {/* Email */}
          <FormField label="Email" error={errors.email}>
            <Input
              name="email"
              type="email"
              placeholder="name@example.com"
              value={formData.email}
              onChange={handleChange}
              className={errors.email ? "border-red-300 dark:border-red-700" : ""}
            />
          </FormField>

          {/* Mobile Number */}
          <FormField label="Mobile Number" error={errors.mobileNumber}>
            <Input
              name="mobileNumber"
              type="tel"
              placeholder="Enter 10-digit mobile number"
              value={formData.mobileNumber}
              onChange={handleChange}
              className={errors.mobileNumber ? "border-red-300 dark:border-red-700" : ""}
            />
          </FormField>

          {/* Company (only for employer) */}
          {formData.userType === "employer" && (
            <FormField label="Company Name" error={errors.company}>
              <Input
                name="company"
                placeholder="Your company name"
                value={formData.company}
                onChange={handleChange}
                className={errors.company ? "border-red-300 dark:border-red-700" : ""}
              />
            </FormField>
          )}

          {/* Password */}
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Password" error={errors.password}>
              <Input
                name="password"
                type="password"
                placeholder="Min 8 characters"
                value={formData.password}
                onChange={handleChange}
                className={errors.password ? "border-red-300 dark:border-red-700" : ""}
              />
            </FormField>

            <FormField label="Confirm Password" error={errors.confirmPassword}>
              <Input
                name="confirmPassword"
                type="password"
                placeholder="Re-enter password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={errors.confirmPassword ? "border-red-300 dark:border-red-700" : ""}
              />
            </FormField>
          </div>

          {/* General Error */}
          {errors.general && (
            <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400">
              {errors.general}
            </p>
          )}

          <Button className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Creating account...
              </>
            ) : (
              "Create account"
            )}
          </Button>
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
