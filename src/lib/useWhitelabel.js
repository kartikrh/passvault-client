"use client";

import { useEffect, useState } from "react";
import { fetchWhitelabel } from "./whitelabel";

export function useWhitelabel() {
  const [whitelabel, setWhitelabel] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchWhitelabel().then((result) => {
      if (!cancelled) {
        setWhitelabel(result);
        setIsLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return { whitelabel, isLoading };
}
