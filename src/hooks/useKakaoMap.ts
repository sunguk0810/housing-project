"use client";

import { useRef, useCallback, useState, useEffect } from "react";
import { isKakaoMapsLoaded, type KakaoMapInstance, type KakaoCustomOverlay } from "@/lib/kakao";

interface UseKakaoMapOptions {
  center: { lat: number; lng: number };
  level?: number;
}

interface MarkerData {
  id: number;
  lat: number;
  lng: number;
  content: string;
  onClick?: () => void;
}

export function useKakaoMap(containerRef: React.RefObject<HTMLDivElement | null>, options: UseKakaoMapOptions) {
  const mapRef = useRef<KakaoMapInstance | null>(null);
  const overlaysRef = useRef<Map<number, KakaoCustomOverlay>>(new Map());
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    if (!isKakaoMapsLoaded()) {
      setError("Kakao Maps SDK not loaded"); // eslint-disable-line react-hooks/set-state-in-effect -- external SDK check on mount
      return;
    }

    try {
      window.kakao!.maps.load(() => {
        if (!containerRef.current) return;
        const center = new window.kakao!.maps.LatLng(options.center.lat, options.center.lng);
        const map = new window.kakao!.maps.Map(containerRef.current, {
          center,
          level: options.level ?? 7,
        });
        mapRef.current = map;
        setIsReady(true);
      });
    } catch {
      setError("Failed to initialize Kakao Maps");
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const addMarkers = useCallback((markers: MarkerData[]) => {
    if (!mapRef.current || !isKakaoMapsLoaded()) return;

    // Clear existing overlays
    overlaysRef.current.forEach((overlay) => overlay.setMap(null));
    overlaysRef.current.clear();

    markers.forEach((marker) => {
      const position = new window.kakao!.maps.LatLng(marker.lat, marker.lng);
      const el = document.createElement("div");
      el.innerHTML = marker.content;
      if (marker.onClick) {
        el.addEventListener("click", marker.onClick);
      }

      const overlay = new window.kakao!.maps.CustomOverlay({
        position,
        content: el,
        yAnchor: 1,
      });
      overlay.setMap(mapRef.current);
      overlaysRef.current.set(marker.id, overlay);
    });
  }, []);

  const selectMarker = useCallback((id: number) => {
    if (!mapRef.current) return;
    const overlay = overlaysRef.current.get(id);
    if (overlay) {
      const position = overlay.getPosition();
      mapRef.current.setCenter(position);
    }
  }, []);

  const previewRef = useRef<KakaoCustomOverlay | null>(null);

  const showOverlay = useCallback((id: number, content: string) => {
    if (!mapRef.current || !isKakaoMapsLoaded()) return;
    // Remove existing preview
    if (previewRef.current) {
      previewRef.current.setMap(null);
    }
    const markerOverlay = overlaysRef.current.get(id);
    if (!markerOverlay) return;

    const position = markerOverlay.getPosition();
    const el = document.createElement("div");
    el.innerHTML = content;

    const overlay = new window.kakao!.maps.CustomOverlay({
      position,
      content: el,
      yAnchor: 1.5,
    });
    overlay.setMap(mapRef.current);
    previewRef.current = overlay;
  }, []);

  const hideOverlay = useCallback(() => {
    if (previewRef.current) {
      previewRef.current.setMap(null);
      previewRef.current = null;
    }
  }, []);

  const relayout = useCallback(() => {
    if (mapRef.current) mapRef.current.relayout();
  }, []);

  const onBoundsChange = useCallback((callback: () => void) => {
    if (!mapRef.current || !isKakaoMapsLoaded()) return;
    window.kakao!.maps.event.addListener(mapRef.current, "idle", callback);
  }, []);

  return { map: mapRef, isReady, error, addMarkers, selectMarker, showOverlay, hideOverlay, relayout, onBoundsChange };
}
