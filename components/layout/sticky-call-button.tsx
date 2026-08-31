import { BUSINESS, telHref } from "@/lib/constants";

export function StickyCallButton() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-zinc-800 bg-zinc-900 pb-[env(safe-area-inset-bottom)] sm:hidden">
      <a
        href={telHref(BUSINESS.phone)}
        className="flex min-h-14 w-full items-center justify-center gap-2 text-base font-semibold text-white"
      >
        📞 Appeler maintenant — {BUSINESS.phone}
      </a>
    </div>
  );
}
