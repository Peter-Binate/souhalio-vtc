import { BUSINESS, telHref } from "@/lib/constants";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/95 backdrop-blur supports-backdrop-blur:bg-white/80 dark:border-zinc-800 dark:bg-zinc-950/95">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <span className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          {BUSINESS.name}
        </span>
        <a
          href={telHref(BUSINESS.phone)}
          className="hidden min-h-11 items-center rounded-full bg-zinc-900 px-5 text-sm font-medium text-white transition-colors hover:bg-zinc-700 sm:inline-flex dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          Appeler : {BUSINESS.phone}
        </a>
      </div>
    </header>
  );
}
