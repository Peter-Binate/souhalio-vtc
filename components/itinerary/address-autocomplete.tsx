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
        className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
      >
        {label}
      </label>
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
        className="min-h-11 w-full rounded-lg border border-zinc-300 px-4 py-2 text-base text-zinc-900 outline-none focus:border-zinc-900 focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-zinc-100 dark:focus-visible:ring-zinc-100 dark:focus-visible:ring-offset-zinc-950"
      />
      {showListbox && (
        <ul
          id={listboxId}
          role="listbox"
          className="absolute z-10 mt-1 max-h-64 w-full overflow-auto rounded-lg border border-zinc-200 bg-white shadow-lg dark:border-zinc-700 dark:bg-zinc-900"
        >
          {suggestions.map((feature) => (
            <li key={`${feature.center[0]},${feature.center[1]}`} role="option" aria-selected={false}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => selectSuggestion(feature)}
                className="min-h-11 w-full px-4 py-2 text-left text-sm text-zinc-900 hover:bg-zinc-100 dark:text-zinc-50 dark:hover:bg-zinc-800"
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
