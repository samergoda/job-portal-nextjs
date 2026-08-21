"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Mail, Clock, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/ui/form-field";
import { submitContactForm } from "@/lib/services/contact-service";
import { toast } from "@/lib/hooks/use-toast";

const USER_TYPES = [
  { value: "jobseeker", label: "Job Seeker" },
  { value: "employer", label: "Employer" },
  { value: "other", label: "Other" },
];

const SUBJECT_OPTIONS = [
  "Technical Issue",
  "Account Problem",
  "Employer Onboarding",
  "Job Posting Issue",
  "Application Question",
  "Feature Request",
  "General Inquiry",
  "Other",
];

export default function ContactPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    userType: "jobseeker",
    subject: "",
    message: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    if (!formData.subject) newErrors.subject = "Please select a subject";
    if (!formData.message.trim()) {
      newErrors.message = "Message is required";
    } else if (formData.message.trim().length < 10) {
      newErrors.message = "Message must be at least 10 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      await submitContactForm(formData);
      toast({
        title: "Message sent successfully!",
        description: "Thank you for contacting us. We'll get back to you within 24-48 hours.",
        variant: "success",
      });
      setFormData({ name: "", email: "", userType: "jobseeker", subject: "", message: "" });
      setErrors({});
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to submit. Please try again.";
      toast({
        title: "Submission failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-6 py-10 md:py-14">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Get in <span className="text-primary">Touch</span>
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Have questions or need help? We're here to assist you!
        </p>
      </div>

      {/* Form */}
      <div className="mt-8 rounded-lg border border-border bg-card p-6 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name + Email */}
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Full Name" error={errors.name}>
              <Input
                name="name"
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
                className={errors.name ? "border-red-300 dark:border-red-700" : ""}
              />
            </FormField>
            <FormField label="Email Address" error={errors.email}>
              <Input
                name="email"
                type="email"
                placeholder="john@example.com"
                value={formData.email}
                onChange={handleChange}
                className={errors.email ? "border-red-300 dark:border-red-700" : ""}
              />
            </FormField>
          </div>

          {/* User Type */}
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">I am a</label>
            <div className="grid grid-cols-3 gap-2">
              {USER_TYPES.map((type) => (
                <label
                  key={type.value}
                  className={`flex cursor-pointer items-center justify-center rounded-lg border-2 px-3 py-2.5 text-sm font-medium transition-colors ${
                    formData.userType === type.value
                      ? "border-primary bg-accent text-primary"
                      : "border-border text-muted-foreground hover:border-primary/40"
                  }`}
                >
                  <input
                    type="radio"
                    name="userType"
                    value={type.value}
                    checked={formData.userType === type.value}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  {type.label}
                </label>
              ))}
            </div>
          </div>

          {/* Subject / Issue Type */}
          <FormField label="Subject" error={errors.subject}>
            <select
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              className={`flex h-9 w-full rounded-lg border bg-background px-3 py-2 text-sm text-foreground shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:border-primary ${
                errors.subject ? "border-red-300 dark:border-red-700" : "border-border"
              }`}
            >
              <option value="">Select a subject</option>
              {SUBJECT_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </FormField>

          {/* Message */}
          <FormField label="Message" error={errors.message} description={`Minimum 10 characters. Current: ${formData.message.length}`}>
            <Textarea
              name="message"
              rows={5}
              placeholder="Please describe your issue or inquiry in detail..."
              value={formData.message}
              onChange={handleChange}
              className={errors.message ? "border-red-300 dark:border-red-700" : ""}
            />
          </FormField>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => router.push("/")}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                "Send Message"
              )}
            </Button>
          </div>
        </form>
      </div>

      {/* Info cards */}
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-border bg-card p-4 text-center shadow-sm">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-accent">
            <Mail className="h-5 w-5 text-primary" />
          </div>
          <h3 className="mt-3 text-sm font-semibold text-card-foreground">Email Us</h3>
          <p className="mt-1 text-xs text-muted-foreground">support@jobportal.com</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4 text-center shadow-sm">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-accent">
            <Clock className="h-5 w-5 text-primary" />
          </div>
          <h3 className="mt-3 text-sm font-semibold text-card-foreground">Response Time</h3>
          <p className="mt-1 text-xs text-muted-foreground">Within 24-48 hours</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4 text-center shadow-sm">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-accent">
            <Phone className="h-5 w-5 text-primary" />
          </div>
          <h3 className="mt-3 text-sm font-semibold text-card-foreground">Call Us</h3>
          <p className="mt-1 text-xs text-muted-foreground">+1 (555) 123-4567</p>
        </div>
      </div>
    </div>
  );
}
