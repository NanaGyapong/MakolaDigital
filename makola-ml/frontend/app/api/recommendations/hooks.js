// hooks/useRecommendations.js
"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { api } from "@/lib/auth.service";

// ── Track interaction (view, click, save, purchase) ───────────
export function useTracker(sessionId) {
  const track = useCallback(async (listingId, event, extra = {}) => {
    try {
      await api.post("/recommendations/event", {
        listingId,
        event,
        sessionId,
        ...extra,
      });
    } catch {}
  }, [sessionId]);

  // Track when listing enters viewport
  const trackView = useCallback((listingId, position) => {
    track(listingId, "view", { position });
  }, [track]);

  return { track, trackView };
}

// ── Home feed recommendations ─────────────────────────────────
export function useRecommendations({ context = "home", limit = 20, country } = {}) {
  const [recs, setRecs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [personalised, setPersonalised] = useState(false);
  const [variant, setVariant] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams({ context, limit, ...(country && { country }) });
    api.get(`/recommendations?${params}`)
      .then(r => {
        setRecs(r.data.recommendations);
        setPersonalised(r.data.personalised);
        setVariant(r.data.variant);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [context, limit, country]);

  return { recs, loading, personalised, variant };
}

// ── Similar items (listing detail page) ──────────────────────
export function useSimilarListings(listingId, limit = 12) {
  const [similar, setSimilar] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!listingId) return;
    api.get(`/recommendations/similar/${listingId}?limit=${limit}`)
      .then(r => setSimilar(r.data.recommendations))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [listingId, limit]);

  return { similar, loading };
}

// ── Trending ─────────────────────────────────────────────────
export function useTrending({ type, country, limit = 20 } = {}) {
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams({ limit, ...(type && {type}), ...(country && {country}) });
    api.get(`/recommendations/trending?${params}`)
      .then(r => setTrending(r.data.recommendations))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [type, country, limit]);

  return { trending, loading };
}

// ── Intersection Observer for auto-tracking views ─────────────
export function useViewTracking(listingId, position, onView) {
  const ref = useRef(null);
  const tracked = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || tracked.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !tracked.current) {
          tracked.current = true;
          onView?.(listingId, position);
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [listingId, position, onView]);

  return ref;
}
