"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, User, Paperclip, Camera, FileText, Eye, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/ui/form-field";
import { useAuth } from "@/lib/auth-context";
import { toast } from "@/lib/hooks/use-toast";
import {
  getProfile,
  updateProfile,
  getProfilePictureUrl,
  getResumeUrl,
  toDataUrl,
} from "@/lib/services/profile-service";

const EXPERIENCE_LEVELS = [
  "Entry Level",
  "Mid Level",
  "Senior Level",
  "Lead Level",
];

type ProfileForm = {
  name: string;
  email: string;
  phone: string;
  title: string;
  location: string;
  bio: string;
  experience: string;
  portfolio: string;
  profileImage: string | null;
  resume: string | null;
  resumeDataUrl: string | null;
};

const emptyForm: ProfileForm = {
  name: "", email: "", phone: "", title: "", location: "",
  bio: "", experience: "", portfolio: "", profileImage: null, resume: null, resumeDataUrl: null,
};

const selectClass =
  "h-9 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:border-primary";

function computeCompleteness(f: ProfileForm): number {
  const has = (v: unknown) => v !== null && v !== undefined && v !== "";
  let score = 0;
  if (has(f.name)) score += 10;
  if (has(f.email)) score += 10;
  if (has(f.phone)) score += 10;
  if (has(f.title)) score += 10;
  if (has(f.location)) score += 10;
  if (has(f.bio)) score += 10;
  if (has(f.experience)) score += 10;
  if (has(f.profileImage)) score += 10;
  if (has(f.resume)) score += 20;
  return Math.min(100, score);
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, isJobSeeker, isLoading: authLoading } = useAuth();

  const [form, setForm] = useState<ProfileForm>(emptyForm);
  const [profilePictureFile, setProfilePictureFile] = useState<File | null>(null);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [activeTab, setActiveTab] = useState<"basic" | "files">("basic");
  const [saving, setSaving] = useState(false);

  const loadProfile = useCallback(async () => {
    try {
      const data = await getProfile();

      // The backend returns picture/resume as base64 (byte[]) inside the profile JSON.
      // Build a data URL directly — no separate binary request needed.
      let profileImageUrl = toDataUrl(data?.profilePicture, data?.profilePictureType, "image/jpeg");
      // Fallback to the dedicated blob endpoint if only the name is present.
      if (!profileImageUrl && data?.profilePictureName) {
        profileImageUrl = await getProfilePictureUrl();
      }

      const resumeDataUrl = toDataUrl(data?.resume, data?.resumeType, "application/pdf");

      setForm({
        name: user?.name || "",
        email: (user?.email as string) || "",
        phone: (user?.mobileNumber as string) || (user?.phone as string) || "",
        title: data?.jobTitle || "",
        location: data?.location || "",
        bio: data?.professionalBio || "",
        experience: data?.experienceLevel || "",
        portfolio: data?.portfolioWebsite || "",
        profileImage: profileImageUrl,
        resume: data?.resumeName || resumeDataUrl ? "Uploaded" : null,
        resumeDataUrl,
      });
    } catch {
      setForm((prev) => ({
        ...prev,
        name: user?.name || "",
        email: (user?.email as string) || "",
        phone: (user?.mobileNumber as string) || (user?.phone as string) || "",
      }));
    }
  }, [user]);

  useEffect(() => {
    if (authLoading) return;
    if (!isJobSeeker) {
      router.replace("/");
      return;
    }
    if (user) loadProfile();
  }, [authLoading, isJobSeeker, user, router, loadProfile]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>, field: "profileImage" | "resume") => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (field === "profileImage" && !file.type.startsWith("image/")) {
      toast({ title: "Please upload a valid image file", variant: "destructive" });
      return;
    }
    if (field === "resume" && file.type !== "application/pdf") {
      toast({ title: "Please upload a PDF file for resume", variant: "destructive" });
      return;
    }

    if (field === "profileImage") setProfilePictureFile(file);
    else setResumeFile(file);

    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      if (field === "resume") {
        setForm((prev) => ({ ...prev, resume: "Uploaded", resumeDataUrl: dataUrl }));
      } else {
        setForm((prev) => ({ ...prev, profileImage: dataUrl }));
      }
    };
    reader.readAsDataURL(file);
  };

  const validate = (): boolean => {
    const required: (keyof ProfileForm)[] = ["name", "email", "phone", "title", "location", "bio", "experience"];
    const missing = required.filter((f) => !form[f]);
    if (missing.length > 0) {
      toast({ title: `Please fill in: ${missing.join(", ")}`, variant: "destructive" });
      return false;
    }
    if (!form.resume) {
      toast({ title: "Please upload your resume", variant: "destructive" });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    try {
      const result = await updateProfile(
        {
          jobTitle: form.title,
          location: form.location,
          experienceLevel: form.experience,
          professionalBio: form.bio,
          portfolioWebsite: form.portfolio || null,
        },
        profilePictureFile,
        resumeFile
      );

      // Prefer the base64 the backend echoes back; keep current preview otherwise.
      const updatedImage =
        toDataUrl(result?.profilePicture, result?.profilePictureType, "image/jpeg") || form.profileImage;
      const updatedResumeDataUrl =
        toDataUrl(result?.resume, result?.resumeType, "application/pdf") || form.resumeDataUrl;

      setForm((prev) => ({
        ...prev,
        profileImage: updatedImage,
        resume: result?.resumeName || prev.resume ? "Uploaded" : prev.resume,
        resumeDataUrl: updatedResumeDataUrl,
      }));
      setProfilePictureFile(null);
      setResumeFile(null);

      toast({ title: "Profile updated successfully!", variant: "success" });
    } catch {
      toast({ title: "An error occurred while updating profile", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const viewResume = async () => {
    // Prefer the base64 data URL from the profile; fall back to the blob endpoint.
    if (form.resumeDataUrl) {
      const win = window.open();
      if (win) {
        win.document.write(
          `<iframe src="${form.resumeDataUrl}" style="width:100%;height:100%;border:0" title="Resume"></iframe>`
        );
      }
      return;
    }
    const url = await getResumeUrl();
    if (url) window.open(url, "_blank");
    else toast({ title: "Resume not found", variant: "destructive" });
  };

  const completeness = computeCompleteness(form);

  if (authLoading) {
    return (
      <div className="mx-auto flex max-w-3xl items-center justify-center px-6 py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-10 md:py-14">
      {/* Header + completeness */}
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">My Profile</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Complete your profile to start applying for jobs
        </p>

        <div className="mx-auto mt-6 max-w-md">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="font-medium text-foreground">Profile Completeness</span>
            <span className="font-semibold text-primary">{completeness}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${completeness}%` }} />
          </div>
          {completeness < 100 && (
            <p className="mt-2 text-sm text-orange-600 dark:text-orange-400">
              Complete your profile to apply for jobs
            </p>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 overflow-hidden rounded-lg border border-border bg-card shadow-sm">
        {/* Tabs */}
        <div className="flex border-b border-border">
          {([
            { id: "basic", label: "Basic Info", icon: <User className="h-4 w-4" /> },
            { id: "files", label: "Files", icon: <Paperclip className="h-4 w-4" /> },
          ] as const).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-1 items-center justify-center gap-2 px-6 py-3.5 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "border-b-2 border-primary bg-accent/40 text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6 md:p-8">
          {activeTab === "basic" && (
            <div className="space-y-6">
              {/* Avatar */}
              <div className="flex flex-col items-center">
                <div className="relative">
                  <div className="h-28 w-28 overflow-hidden rounded-full border-4 border-card shadow">
                    {form.profileImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={form.profileImage} alt="Profile" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-primary text-4xl font-bold text-primary-foreground">
                        {form.name?.charAt(0).toUpperCase() || "?"}
                      </div>
                    )}
                  </div>
                  <label className="absolute bottom-0 right-0 cursor-pointer rounded-full bg-primary p-2 text-primary-foreground transition-colors hover:opacity-90">
                    <Camera className="h-4 w-4" />
                    <input type="file" accept="image/*" onChange={(e) => handleFile(e, "profileImage")} className="hidden" />
                  </label>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <FormField label="Full Name">
                  <Input name="name" value={form.name} onChange={handleChange} required />
                </FormField>
                <FormField label="Email">
                  <Input name="email" type="email" value={form.email} onChange={handleChange} required />
                </FormField>
                <FormField label="Phone">
                  <Input name="phone" type="tel" value={form.phone} onChange={handleChange} required />
                </FormField>
                <FormField label="Job Title">
                  <Input name="title" value={form.title} onChange={handleChange} placeholder="e.g. Software Developer" required />
                </FormField>
                <FormField label="Location">
                  <Input name="location" value={form.location} onChange={handleChange} placeholder="e.g. San Francisco, CA" required />
                </FormField>
                <FormField label="Experience Level">
                  <select name="experience" value={form.experience} onChange={handleChange} className={selectClass} required>
                    <option value="">Select experience level</option>
                    {EXPERIENCE_LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
                  </select>
                </FormField>
              </div>

              <FormField label="Professional Bio">
                <Textarea
                  name="bio"
                  rows={4}
                  value={form.bio}
                  onChange={handleChange}
                  placeholder="Tell us about yourself, your experience, and what you're passionate about..."
                  required
                />
              </FormField>

              <FormField label="Portfolio / Website">
                <Input name="portfolio" type="url" value={form.portfolio} onChange={handleChange} placeholder="https://yourportfolio.com" />
              </FormField>
            </div>
          )}

          {activeTab === "files" && (
            <div className="space-y-8">
              {/* Resume */}
              <div>
                <h3 className="text-base font-semibold text-foreground">Resume *</h3>
                <div className="mt-3 rounded-lg border-2 border-dashed border-border p-8 text-center">
                  {form.resume ? (
                    <div className="space-y-4">
                      <FileText className="mx-auto h-10 w-10 text-green-600 dark:text-green-400" />
                      <p className="text-sm font-medium text-foreground">Resume uploaded</p>
                      <div className="flex justify-center gap-3">
                        <Button type="button" size="sm" onClick={viewResume}>
                          <Eye className="h-4 w-4" /> View Resume
                        </Button>
                        <label className="cursor-pointer">
                          <span className="inline-flex h-8 items-center gap-1.5 rounded-md border border-border px-3 text-sm font-medium text-foreground transition-colors hover:bg-muted">
                            <Upload className="h-4 w-4" /> Upload New
                          </span>
                          <input type="file" accept=".pdf" onChange={(e) => handleFile(e, "resume")} className="hidden" />
                        </label>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <Upload className="mx-auto h-10 w-10 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">Upload your resume (PDF only)</p>
                      <label className="cursor-pointer">
                        <span className="inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90">
                          Choose Resume File
                        </span>
                        <input type="file" accept=".pdf" onChange={(e) => handleFile(e, "resume")} className="hidden" />
                      </label>
                    </div>
                  )}
                </div>
              </div>

              {/* Profile picture */}
              <div>
                <h3 className="text-base font-semibold text-foreground">Profile Picture</h3>
                <div className="mt-3 rounded-lg border-2 border-dashed border-border p-8 text-center">
                  {form.profileImage ? (
                    <div className="space-y-4">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={form.profileImage} alt="Profile preview" className="mx-auto h-28 w-28 rounded-full border-4 border-card object-cover shadow" />
                      <label className="cursor-pointer">
                        <span className="inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90">
                          Change Picture
                        </span>
                        <input type="file" accept="image/*" onChange={(e) => handleFile(e, "profileImage")} className="hidden" />
                      </label>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                        <User className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <p className="text-sm text-muted-foreground">Upload a professional profile picture</p>
                      <label className="cursor-pointer">
                        <span className="inline-flex h-9 items-center rounded-md border border-border px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted">
                          Choose Image
                        </span>
                        <input type="file" accept="image/*" onChange={(e) => handleFile(e, "profileImage")} className="hidden" />
                      </label>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Save */}
          <div className="mt-8 flex justify-end border-t border-border pt-6">
            <Button type="submit" disabled={saving}>
              {saving ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</>
              ) : (
                "Save Profile"
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
