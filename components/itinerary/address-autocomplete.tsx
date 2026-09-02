"use client";

import { useEffect, useId, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { geocode } from "@/lib/maptiler";
import type { GeocodeFeature, Coord } from "@/schemas/itinerary";

export type AddressValue = { label: string; coord: Coord };

type AddressAutocompleteProps = {
  label: string;
  placeholder?: string;
  value: AddressValue | null;
  onChange: (value: AddressValue | null) => void;
  /** Icône Material Symbols affichée à gauche du champ (purement visuel). */
  icon?: string;
};

// Débounce la saisie (pas le fetch) : le fetch reste dans useQuery, câblé sur la valeur débouncée.
function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);
  return debounced;
}

export function AddressAutocomplete({
  label,
  placeholder,
  value,
  onChange,
  icon,
}: AddressAutocompleteProps) {
  const inputId = useId();
  const listboxId = useId();
  const [query, setQuery] = useState(value?.label ?? "");
  const [isOpen, setIsOpen] = useState(false);
  const debouncedQuery = useDebouncedValue(query, 300);

  // Ne pas refetch après une sélection : le texte affiché correspond déjà à la valeur résolue.
  const isResolved = value !== null && value.label === query;

  const { data: suggestions = [] } = useQuery({
    queryKey: ["geocode", debouncedQuery],
    queryFn: () => geocode(debouncedQuery),
    enabled: debouncedQuery.trim().length >= 3 && !isResolved,
  });

  function selectSuggestion(feature: GeocodeFeature) {
    setQuery(feature.place_name);
    setIsOpen(false);
    onChange({ label: feature.place_name, coord: feature.center });
  }

  const showListbox = isOpen && suggestions.length > 0;

  return (
    <div className="relative w-full">
      <label
        htmlFor={inputId}
        className="mb-1 block text-xs font-semibold tracking-widest text-muted uppercase dark:text-zinc-300"
      >
        {label}
      </label>
      <div className="relative">
        {icon && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-lg text-muted"
          >
            <span className="material-symbols-outlined text-lg!">{icon}</span>
          </span>
        )}
        <input
          id={inputId}
          type="text"
          role="combobox"
          aria-expanded={showListbox}
          aria-controls={listboxId}
          aria-autocomplete="list"
          autoComplete="off"
          placeholder={placeholder}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
            if (value) onChange(null);
          }}
          onFocus={() => setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 150)}
          onKeyDown={(e) => {
            if (e.key === "Escape") setIsOpen(false);
            if (e.key === "Enter" && suggestions.length > 0) {
              e.preventDefault();
              selectSuggestion(suggestions[0]);
            }
          }}
          className={`min-h-10 sm:min-h-11 w-full rounded-standard border border-border-input bg-surface px-4 py-2.5 text-sm sm:text-base text-foreground outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-zinc-100 ${icon ? "pl-10" : ""}`}
        />
      </div>
      {showListbox && (
        <ul
          id={listboxId}
          role="listbox"
          className="absolute z-10 mt-1 max-h-64 w-full overflow-auto rounded-standard border border-border bg-surface ambient-shadow dark:border-zinc-700 dark:bg-zinc-900"
        >
          {suggestions.map((feature) => (
            <li key={`${feature.center[0]},${feature.center[1]}`} role="option" aria-selected={false}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => selectSuggestion(feature)}
                className="min-h-11 w-full px-4 py-2 text-left text-sm text-foreground hover:bg-surface-low dark:text-zinc-50 dark:hover:bg-zinc-800"
              >
                {feature.place_name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
