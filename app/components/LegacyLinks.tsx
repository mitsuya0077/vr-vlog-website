"use client";
import { useEffect } from "react";

// App builds and the compatibility site still link to these fragments.
export function LegacyLinks({ basePath }: { basePath: string }) {
  useEffect(() => {
    const redirect = () => {
      const destinations: Record<string, string> = { "#privacy": "/privacy/", "#contact": "/support/#contact" };
      const destination = destinations[window.location.hash];
      if (!destination) return;
      const target = new URL(`${basePath}${destination}`, window.location.origin);
      target.search = window.location.search;
      window.location.replace(target.href);
    };
    redirect();
    window.addEventListener("hashchange", redirect);
    return () => window.removeEventListener("hashchange", redirect);
  }, [basePath]);
  return null;
}
