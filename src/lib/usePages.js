"use client";

import { useEffect, useState } from "react";
import { fetchPages } from "./pages";

export function usePages() {
  const [pages, setPages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchPages().then((result) => {
      if (!cancelled) {
        setPages(result);
        setIsLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return { pages, isLoading };
}
