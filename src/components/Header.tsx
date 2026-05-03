import Link from "next/link";
import { Compass } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

export function Header() {
  return (
    <header className="sticky top-0 z-30 w-full border-b border-border/60 glass">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          className="group flex items-center gap-2.5 font-semibold tracking-tight"
        >
          <span className="relative inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-indigo-600 text-white shadow-sm shadow-sky-500/30 transition-transform group-hover:scale-105">
            <Compass className="h-5 w-5" strokeWidth={2.25} />
          </span>
          <span className="text-base sm:text-lg">
            Pack<span className="text-gradient-brand">Planner</span>
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="hidden text-xs font-medium text-muted-foreground transition-colors hover:text-foreground sm:inline"
          >
            GitHub
          </a>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
