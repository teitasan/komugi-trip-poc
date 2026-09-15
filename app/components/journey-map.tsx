"use client";
import { useEffect, useRef, useState } from "react";
import type { RouteSegment, StoredMode } from "@/lib/travel-data";
export type MapPoint = [number, number];
const routeColors: Record<StoredMode, string> = {
  walk: "#d87d4c",
  train: "#4d86c5",
  bicycle: "#67a66f",
};
let leafletLoading: Promise<void> | undefined;
function loadLeaflet() {
  if ((window as any).L) return Promise.resolve();
  if (!leafletLoading) {
    leafletLoading = new Promise<void>((resolve, reject) => {
      const css = document.createElement("link");
      css.rel = "stylesheet";
      css.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(css);
      const script = document.createElement("script");
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.onload = () => resolve();
      script.onerror = () => {
        leafletLoading = undefined;
        reject(new Error("地図を読み込めません"));
      };
      document.head.appendChild(script);
    });
  }
  return leafletLoading;
}
export default function JourneyMap({
  position = [33.5897, 130.4207],
  traveledSegments = [],
  route = [],
  moving = false,
  bubble,
}: {
  position?: MapPoint;
  traveledSegments?: RouteSegment[];
  route?: RouteSegment[];
  moving?: boolean;
  bubble?: string;
}) {
  const el = useRef<HTMLDivElement>(null),
    instance = useRef<any>(null),
    layers = useRef<any[]>([]),
    lastRoute = useRef("");
  const [ready, setReady] = useState(false),
    [error, setError] = useState(false);
  useEffect(() => {
    let disposed = false;
    void loadLeaflet()
      .then(() => {
        if (disposed || !el.current) return;
        const L = (window as any).L;
        const map = L.map(el.current, {
          zoomControl: false,
          scrollWheelZoom: false,
        }).setView([33.6, 130.38], 12);
        L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          maxZoom: 18,
        }).addTo(map);
        L.control
          .zoom({
            position: "topright",
            zoomInTitle: "地図を拡大",
            zoomOutTitle: "地図を縮小",
          })
          .addTo(map);
        instance.current = map;
        setReady(true);
      })
      .catch(() => {
        if (!disposed) setError(true);
      });
    return () => {
      disposed = true;
      instance.current?.remove();
      instance.current = null;
    };
  }, []);
  useEffect(() => {
    if (!ready || !instance.current) return;
    const L = (window as any).L,
      map = instance.current;
    layers.current.forEach((l) => l.remove());
    layers.current = [];
    const drawSegments = (segments: RouteSegment[], planned = false) => {
      for (const segment of segments) {
        if (segment.points.length < 2) continue;
        const line = L.polyline(segment.points, {
          color: routeColors[segment.mode],
          weight: planned ? 4 : 5,
          opacity: planned ? 0.9 : 0.95,
          ...(planned ? { dashArray: "6,10" } : {}),
          lineCap: "round",
          lineJoin: "round",
        }).addTo(map);
        layers.current.push(line);
      }
    };
    drawSegments(traveledSegments);
    drawSegments(route, true);
    const destinationSegment = route.at(-1),
      destination = destinationSegment?.points.at(-1);
    if (destination && destinationSegment) {
      layers.current.push(
        L.circleMarker(destination, {
          radius: 7,
          color: "white",
          weight: 3,
          fillColor: routeColors[destinationSegment.mode],
          fillOpacity: 1,
        }).addTo(map),
      );
    }
    const traveledPoints = traveledSegments.flatMap((segment) => segment.points),
      routePoints = route.flatMap((segment) => segment.points),
      key = JSON.stringify([traveledSegments, route]);
    if (key !== lastRoute.current) {
      lastRoute.current = key;
      const boundsPoints = [...traveledPoints, ...routePoints, position];
      if (boundsPoints.length > 1)
        map.fitBounds(L.latLngBounds(boundsPoints), {
          paddingTopLeft: [70, 95],
          paddingBottomRight: [70, 120],
          maxZoom: 13,
        });
      else map.setView(position, 12);
    }
    const icon = L.divIcon({
      className: "komugi-pin",
      html: '<img src="/images/komugi.png" alt="こむぎ" />',
      iconSize: [65, 65],
      iconAnchor: [32, 50],
    });
    const marker = L.marker(position, { icon })
      .addTo(map)
      .bindTooltip(
        bubble ??
          (moving
            ? "のんびり、向かっているよ。"
            : "ここから、どこへ行こうかな。"),
        {
          permanent: true,
          direction: "top",
          offset: [0, -45],
          className: "map-bubble",
        },
      );
    layers.current.push(marker);
  }, [
    ready,
    JSON.stringify(position),
    JSON.stringify(traveledSegments),
    JSON.stringify(route),
    moving,
    bubble,
  ]);
  return (
    <>
      <div
        ref={el}
        className="map-canvas"
        aria-label="福岡の旅の地図"
        role="region"
      />
      {error && (
        <div className="map-error">
          地図を読み込めませんでした。
          <br />
          通信環境をご確認ください。旅はそのまま進みます。
        </div>
      )}
    </>
  );
}
