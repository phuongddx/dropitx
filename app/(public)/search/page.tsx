"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { SearchBar } from "@/components/search-bar";
import { SearchResults } from "@/components/search-results";
import type { SearchResult } from "@/types/share";
import { getApiUrl } from "@/lib/api-client";

export default function SearchPage() {
  const searchParams = useSearchParams();
  const queryParam = searchParams.get("q") ?? "";
  const trimmedParam = queryParam.trim();

  const [query, setQuery] = useState(trimmedParam);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Sync query from URL search params (primitive dependency)
  useEffect(() => {
    setQuery(trimmedParam);
  }, [trimmedParam]);

  const performSearch = useCallback(async (term: string) => {
    if (term.length < 2) {
      setResults([]);
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(
        getApiUrl(`/api/search?q=${encodeURIComponent(term)}`),
        { signal: controller.signal },
      );
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setError(body?.error ?? "Search failed");
        setResults([]);
        return;
      }
      const data = await res.json();
      setResults(data.results ?? []);
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      setError("Network error. Please try again.");
      setResults([]);
    } finally {
      if (abortRef.current === controller) setIsLoading(false);
    }
  }, []);

  // Re-search when query changes
  useEffect(() => {
    if (query.length === 0) {
      setResults([]);
      setIsLoading(false);
      return;
    }
    performSearch(query);
  }, [query, performSearch]);

  // Cleanup on unmount
  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  return (
    <div className="mx-auto w-full max-w-[1120px] flex-1 px-6 py-8">
      <h1 className="text-[22px] font-bold tracking-tight">Search</h1>

      <div className="mt-4">
        <SearchBar initialValue={query} />
      </div>

      {error && (
        <p className="mt-4 text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      <div className="mt-6">
        <SearchResults results={results} isLoading={isLoading} />
      </div>
    </div>
  );
}
