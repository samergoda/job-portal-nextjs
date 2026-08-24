"use client";

import Link from "next/link";
import type { Route } from "next";
import {
  Moon, Sun, Menu, X, LogOut, User, ChevronDown,
  FileText, Heart, Briefcase, Plus, Building2, Users, Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/lib/theme-context";
import { useAuth } from "@/lib/auth-context";
import { useEffect, useRef, useState } from "react";

const navItems: Array<{ href: Route; label: string }> = [
  { href: "/", label: "Home" },
  { href: "/jobs", label: "Jobs" },
  { href: "/companies", label: "Companies" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader() {
  const { theme, toggleTheme } = useTheme();
  const { user, isAuthenticated, isEmployer, isJobSeeker, isAdmin, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    setUserMenuOpen(false);
    setMobileMenuOpen(false);
    logout();
  };

  const roleBadge = isAdmin
    ? { label: "Admin", classes: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" }
    : isEmployer
      ? { label: "Employer", classes: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" }
      : { label: "Job Seeker", classes: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" };

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
        <Link href="/" className="text-xl font-bold tracking-tight text-foreground">
          JobPortal
        </Link>

        <nav aria-label="Main navigation" className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            onClick={toggleTheme}
            className="text-muted-foreground hover:text-foreground"
          >
            {theme === "dark" ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
          </Button>

          {/* Desktop auth area */}
          <div className="hidden items-center gap-2 md:flex">
            {isAuthenticated ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 rounded-lg border border-border bg-accent/50 px-3 py-1.5 text-sm transition-colors hover:bg-accent"
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                    {user?.name?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-foreground leading-tight">
                      {user?.name || "User"}
                    </p>
                    <p className="text-xs text-muted-foreground leading-tight">
                      {isEmployer ? (user?.company as string) || "" : (user?.title as string) || user?.email || ""}
                    </p>
                  </div>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-60 rounded-lg border border-border bg-card shadow-lg">
                    {/* User info */}
                    <div className="border-b border-border px-4 py-3">
                      <p className="text-sm font-medium text-foreground">{user?.name}</p>
                      <p className="text-xs text-muted-foreground">{user?.email as string}</p>
                      <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${roleBadge.classes}`}>
                        {roleBadge.label}
                      </span>
                    </div>

                    {/* Job Seeker menu */}
                    {isJobSeeker && (
                      <div className="border-b border-border py-1">
                        <DropdownLink href="/profile" icon={<User className="h-4 w-4" />} label="My Profile" onClose={() => setUserMenuOpen(false)} />
                        <DropdownLink href="/applied-jobs" icon={<FileText className="h-4 w-4" />} label="Applied Jobs" onClose={() => setUserMenuOpen(false)} />
                        <DropdownLink href="/saved-jobs" icon={<Heart className="h-4 w-4" />} label="Saved Jobs" onClose={() => setUserMenuOpen(false)} />
                      </div>
                    )}

                    {/* Employer menu */}
                    {isEmployer && (
                      <div className="border-b border-border py-1">
                        <DropdownLink href="/employer/post-job" icon={<Plus className="h-4 w-4" />} label="Post New Job" onClose={() => setUserMenuOpen(false)} />
                        <DropdownLink href="/employer/jobs" icon={<Briefcase className="h-4 w-4" />} label="My Job Postings" onClose={() => setUserMenuOpen(false)} />
                      </div>
                    )}

                    {/* Admin menu */}
                    {isAdmin && (
                      <div className="border-b border-border py-1">
                        <DropdownLink href="/admin/companies" icon={<Building2 className="h-4 w-4" />} label="Company Management" onClose={() => setUserMenuOpen(false)} />
                        <DropdownLink href="/admin/employers" icon={<Users className="h-4 w-4" />} label="Employer Management" onClose={() => setUserMenuOpen(false)} />
                        <DropdownLink href="/admin/contact-messages" icon={<Mail className="h-4 w-4" />} label="Contact Messages" onClose={() => setUserMenuOpen(false)} />
                      </div>
                    )}

                    {/* Logout */}
                    <div className="py-1">
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 px-4 py-2 text-sm text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">Sign in</Button>
                </Link>
                <Link href="/register">
                  <Button size="sm">Get started</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label="Toggle menu"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="border-t border-border bg-card px-6 py-4 md:hidden">
          <nav className="flex flex-col gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}

            <div className="mt-3 flex flex-col gap-1 border-t border-border pt-3">
              {isAuthenticated ? (
                <>
                  {/* User info */}
                  <div className="flex items-center gap-2 px-3 py-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                      {user?.name?.charAt(0).toUpperCase() || "U"}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{user?.name}</p>
                      <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${roleBadge.classes}`}>
                        {roleBadge.label}
                      </span>
                    </div>
                  </div>

                  {/* Job Seeker links */}
                  {isJobSeeker && (
                    <>
                      <MobileLink href="/profile" label="My Profile" onClose={() => setMobileMenuOpen(false)} />
                      <MobileLink href="/applied-jobs" label="Applied Jobs" onClose={() => setMobileMenuOpen(false)} />
                      <MobileLink href="/saved-jobs" label="Saved Jobs" onClose={() => setMobileMenuOpen(false)} />
                    </>
                  )}

                  {/* Employer links */}
                  {isEmployer && (
                    <>
                      <MobileLink href="/employer/post-job" label="Post New Job" onClose={() => setMobileMenuOpen(false)} />
                      <MobileLink href="/employer/jobs" label="My Job Postings" onClose={() => setMobileMenuOpen(false)} />
                    </>
                  )}

                  {/* Admin links */}
                  {isAdmin && (
                    <>
                      <MobileLink href="/admin/companies" label="Company Management" onClose={() => setMobileMenuOpen(false)} />
                      <MobileLink href="/admin/employers" label="Employer Management" onClose={() => setMobileMenuOpen(false)} />
                      <MobileLink href="/admin/contact-messages" label="Contact Messages" onClose={() => setMobileMenuOpen(false)} />
                    </>
                  )}

                  <button
                    onClick={handleLogout}
                    className="mt-2 flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="ghost" size="sm" className="w-full justify-start">Sign in</Button>
                  </Link>
                  <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                    <Button size="sm" className="w-full">Get started</Button>
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

function DropdownLink({ href, icon, label, onClose }: { href: string; icon: React.ReactNode; label: string; onClose: () => void }) {
  return (
    <Link
      href={href as Route}
      onClick={onClose}
      className="flex items-center gap-3 px-4 py-2 text-sm text-foreground transition-colors hover:bg-muted"
    >
      <span className="text-muted-foreground">{icon}</span>
      {label}
    </Link>
  );
}

function MobileLink({ href, label, onClose }: { href: string; label: string; onClose: () => void }) {
  return (
    <Link
      href={href as Route}
      onClick={onClose}
      className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
    >
      {label}
    </Link>
  );
}
