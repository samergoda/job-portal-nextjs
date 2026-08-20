import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-6">
      <div className="text-center">
        <p className="text-xs font-semibold uppercase tracking-wider text-primary">404</p>
        <h1 className="mt-2 text-2xl font-bold text-foreground">Page not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">The page you are looking for does not exist.</p>
        <Link href="/" className="mt-5 inline-block">
          <Button>Go home</Button>
        </Link>
      </div>
    </div>
  );
}
