"use client";
import { useEffect, useRef, useState } from "react";
export type MapPoint = [number, number];
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
  traveledRoute = [],
  route = [],
  moving = false,
  bubble,
}: {
  position?: MapPoint;
  traveledRoute?: MapPoint[];
  route?: MapPoint[];
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
    if (traveledRoute.length > 1) {
      const line = L.polyline(traveledRoute, {
        color: "#d87d4c",
        weight: 5,
        opacity: 0.95,
        lineCap: "round",
        lineJoin: "round",
      }).addTo(map);
      layers.current.push(line);
    }
    if (route.length > 1) {
      const line = L.polyline(route, {
        color: "#819eaa",
        weight: 4,
        opacity: 0.9,
        dashArray: "6,10",
        lineCap: "round",
        lineJoin: "round",
      }).addTo(map);
      layers.current.push(line);
      layers.current.push(
        L.circleMarker(route[route.length - 1], {
          radius: 7,
          color: "white",
          weight: 3,
          fillColor: "#819eaa",
          fillOpacity: 1,
        }).addTo(map),
      );
    }
    const key = JSON.stringify([traveledRoute, route]);
    if (key !== lastRoute.current) {
      lastRoute.current = key;
      const boundsPoints = [...traveledRoute, ...route, position];
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
    JSON.stringify(traveledRoute),
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
