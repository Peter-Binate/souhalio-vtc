import { BUSINESS, REVIEWS, telHref } from "@/lib/constants";

export function Reviews() {
  return (
    <section
      aria-labelledby="reviews-heading"
      className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16"
    >
      <h2
        id="reviews-heading"
        className="text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl dark:text-zinc-50"
      >
        Ils ont choisi la sérénité
      </h2>

      <p
        role="note"
        className="mt-4 max-w-2xl rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-200"
      >
        ⚠️ Avis fictifs — à remplacer par de vrais avis (Google, clients réguliers) avant mise en
        ligne.
      </p>

      <ul className="mt-6 grid gap-4 sm:grid-cols-2">
        {REVIEWS.map((review) => (
          <li
            key={review.author}
            className="rounded-lg border border-zinc-200 p-4 text-sm text-zinc-700 dark:border-zinc-800 dark:text-zinc-300"
          >
            <p>« {review.text} »</p>
            <p className="mt-2 font-medium text-zinc-900 dark:text-zinc-50">{review.author}</p>
          </li>
        ))}
      </ul>

      <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400">
        Lien vers l&apos;ensemble de nos avis Google (à ajouter dès que la fiche Google Business
        Profile sera disponible).
      </p>

      <a
        href={telHref(BUSINESS.phone)}
        className="mt-6 inline-flex min-h-11 items-center justify-center rounded-full bg-zinc-900 px-6 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
      >
        Rejoignez des clients sereins — 📞 {BUSINESS.phone}
      </a>
    </section>
  );
}
