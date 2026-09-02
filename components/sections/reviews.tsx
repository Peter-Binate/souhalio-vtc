import { BUSINESS, REVIEWS, telHref } from "@/lib/constants";

export function Reviews() {
  return (
    <section
      aria-labelledby="reviews-heading"
      className="bg-surface py-12 md:py-[80px] dark:bg-zinc-950"
    >
      <div className="mx-auto max-w-[1280px] px-6">
        <h2
          id="reviews-heading"
          className="font-headline text-2xl font-semibold text-primary md:text-3xl dark:text-zinc-50"
        >
          Ils ont choisi la sérénité
        </h2>

        <p
          role="note"
          className="mt-4 max-w-2xl rounded-standard border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-200"
        >
          ⚠️ Avis fictifs — à remplacer par de vrais avis (Google, clients réguliers) avant mise
          en ligne.
        </p>

        <ul className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          {REVIEWS.map((review) => (
            <li
              key={review.author}
              className="hover-lift rounded-card border border-border bg-surface p-6 ambient-shadow dark:border-zinc-800 dark:bg-zinc-900"
            >
              <span aria-hidden="true" className="material-symbols-outlined text-accent">
                format_quote
              </span>
              <p className="mt-2 text-sm text-foreground dark:text-zinc-300">
                « {review.text} »
              </p>
              <p className="mt-3 text-sm font-semibold text-primary dark:text-zinc-50">
                {review.author}
              </p>
            </li>
          ))}
        </ul>

        <p className="mt-4 text-sm text-muted dark:text-zinc-400">
          Lien vers l&apos;ensemble de nos avis Google (à ajouter dès que la fiche Google
          Business Profile sera disponible).
        </p>

        <div className="mt-6">
          <a
            href={telHref(BUSINESS.phone)}
            className="inline-flex min-h-11 items-center gap-2 rounded-standard bg-primary px-6 text-xs font-semibold tracking-widest text-white uppercase transition-colors hover:bg-deep-midnight dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            <span aria-hidden="true" className="material-symbols-outlined text-base!">
              call
            </span>
            Rejoignez des clients sereins — {BUSINESS.phone}
          </a>
        </div>
      </div>
    </section>
  );
}
