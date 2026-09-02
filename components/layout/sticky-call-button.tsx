import { BUSINESS, telHref } from "@/lib/constants";

export function StickyCallButton() {
  return (
    <a
      href={telHref(BUSINESS.phone)}
      aria-label={`Appeler maintenant — ${BUSINESS.phone}`}
      className="fixed right-6 bottom-[calc(1.5rem+env(safe-area-inset-bottom))] z-50 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-primary shadow-lg transition-transform hover:scale-105 md:hidden"
    >
      <span aria-hidden="true" className="material-symbols-outlined text-3xl!">
        call
      </span>
    </a>
  );
}
