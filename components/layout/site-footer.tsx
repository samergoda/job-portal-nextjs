import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-muted">
      <div className="mx-auto grid max-w-7xl gap-8 px-6 py-12 md:grid-cols-3">
        <div>
          <h3 className="text-lg font-bold text-foreground">JobPortal</h3>
          <p className="mt-3 max-w-sm text-sm text-muted-foreground">
            Connect with top talent and leading employers to build the next chapter of your career.
          </p>
        </div>

        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Explore</h4>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link href="/jobs" className="text-foreground/80 transition-colors hover:text-foreground">Browse jobs</Link></li>
            <li><Link href="/companies" className="text-foreground/80 transition-colors hover:text-foreground">Companies</Link></li>
            <li><Link href="/contact" className="text-foreground/80 transition-colors hover:text-foreground">Contact</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Account</h4>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link href="/login" className="text-foreground/80 transition-colors hover:text-foreground">Employer login</Link></li>
            <li><Link href="/login" className="text-foreground/80 transition-colors hover:text-foreground">Candidate login</Link></li>
            <li><Link href="/contact" className="text-foreground/80 transition-colors hover:text-foreground">Support</Link></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border px-6 py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} JobPortal. All rights reserved.
      </div>
    </footer>
  );
}
