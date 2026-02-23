'use client';

import { useEffect, useRef, useCallback } from 'react';
import { isKakaoMapsLoaded } from '@/lib/kakao';
import type {
  KakaoMapInstance,
  KakaoPolyline,
  KakaoCustomOverlay,
} from '@/lib/kakao';

interface RoutePoint {
  lat: number;
  lng: number;
  label: string;
  type: 'origin' | 'destination';
}

interface CommuteRouteMapProps {
  /** Apartment location */
  origin: { lat: number; lng: number; label: string };
  /** Job destinations */
  destinations: Array<{
    lat: number;
    lng: number;
    label: string;
    timeMinutes: number | null;
    /** 1=subway, 2=bus, 3=walk */
    primaryTransitType?: number;
  }>;
  className?: string;
}

const ROUTE_COLORS: Record<number, string> = {
  1: '#3B82F6', // subway - blue
  2: '#22C55E', // bus - green
  3: '#9CA3AF', // walk - gray
};

const DEFAULT_ROUTE_COLOR = '#0891B2'; // brand teal

function createMarkerHtml(point: RoutePoint, time?: number | null): string {
  const isOrigin = point.type === 'origin';
  const bg = isOrigin ? '#0891B2' : '#F97316';
  const timeText = time !== null && time !== undefined ? `${time}분` : '';

  return `
    <div style="
      display: flex; flex-direction: column; align-items: center;
      transform: translate(-50%, -100%);
    ">
      <div style="
        background: ${bg}; color: white; padding: 4px 8px;
        border-radius: 8px; font-size: 12px; font-weight: 600;
        white-space: nowrap; box-shadow: 0 2px 6px rgba(0,0,0,0.15);
      ">
        ${point.label}${timeText ? ` · ${timeText}` : ''}
      </div>
      <div style="
        width: 12px; height: 12px; background: ${bg};
        border: 2px solid white; border-radius: 50%;
        margin-top: -2px; box-shadow: 0 1px 3px rgba(0,0,0,0.2);
      "></div>
    </div>
  `;
}

export function CommuteRouteMap({
  origin,
  destinations,
  className,
}: CommuteRouteMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<KakaoMapInstance | null>(null);
  const polylinesRef = useRef<KakaoPolyline[]>([]);
  const overlaysRef = useRef<KakaoCustomOverlay[]>([]);

  const cleanup = useCallback(() => {
    for (const pl of polylinesRef.current) pl.setMap(null);
    for (const ov of overlaysRef.current) ov.setMap(null);
    polylinesRef.current = [];
    overlaysRef.current = [];
  }, []);

  useEffect(() => {
    if (!containerRef.current || !isKakaoMapsLoaded()) return;

    const kakao = window.kakao!.maps;

    kakao.load(() => {
      if (!containerRef.current) return;

      // Collect all points for bounds
      const allPoints: RoutePoint[] = [
        { ...origin, type: 'origin' as const },
        ...destinations.map((d) => ({ lat: d.lat, lng: d.lng, label: d.label, type: 'destination' as const })),
      ];

      if (allPoints.length === 0) return;

      // Calculate center
      const centerLat = allPoints.reduce((s, p) => s + p.lat, 0) / allPoints.length;
      const centerLng = allPoints.reduce((s, p) => s + p.lng, 0) / allPoints.length;

      const center = new kakao.LatLng(centerLat, centerLng);
      const map = new kakao.Map(containerRef.current, {
        center,
        level: 8,
      });
      mapRef.current = map;

      cleanup();

      // Fit bounds
      const bounds = new kakao.LatLngBounds();
      for (const pt of allPoints) {
        bounds.extend(new kakao.LatLng(pt.lat, pt.lng));
      }
      (map as unknown as { setBounds: (b: unknown) => void }).setBounds(bounds);

      // Draw origin marker
      const originOverlay = new kakao.CustomOverlay({
        position: new kakao.LatLng(origin.lat, origin.lng),
        content: createMarkerHtml(
          { ...origin, type: 'origin' },
        ),
        yAnchor: 1,
      });
      originOverlay.setMap(map);
      overlaysRef.current.push(originOverlay);

      // Draw destination markers and polylines
      for (const dest of destinations) {
        const color = dest.primaryTransitType
          ? ROUTE_COLORS[dest.primaryTransitType] ?? DEFAULT_ROUTE_COLOR
          : DEFAULT_ROUTE_COLOR;

        // Polyline
        const path = [
          new kakao.LatLng(origin.lat, origin.lng),
          new kakao.LatLng(dest.lat, dest.lng),
        ];

        const polyline = new kakao.Polyline({
          map,
          path,
          strokeWeight: 3,
          strokeColor: color,
          strokeOpacity: 0.7,
          strokeStyle: 'shortdash',
        });
        polylinesRef.current.push(polyline);

        // Destination overlay
        const destOverlay = new kakao.CustomOverlay({
          position: new kakao.LatLng(dest.lat, dest.lng),
          content: createMarkerHtml(
            { lat: dest.lat, lng: dest.lng, label: dest.label, type: 'destination' },
            dest.timeMinutes,
          ),
          yAnchor: 1,
        });
        destOverlay.setMap(map);
        overlaysRef.current.push(destOverlay);
      }
    });

    return cleanup;
  }, [origin, destinations, cleanup]);

  if (!isKakaoMapsLoaded()) {
    return (
      <div className={`flex items-center justify-center rounded-[var(--radius-s7-lg)] bg-[var(--color-surface-elevated)] text-[length:var(--text-caption)] text-[var(--color-on-surface-muted)] ${className ?? ''}`}>
        지도를 불러올 수 없습니다
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`rounded-[var(--radius-s7-lg)] ${className ?? ''}`}
      style={{ minHeight: 280 }}
    />
  );
}
