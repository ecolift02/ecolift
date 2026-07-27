import { useEffect, useState } from "react";
import {
  MapContainer,
  Marker,
  Polyline,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { getRoute } from "../../api/mapService";

const DEFAULT_CENTER = [20.5937, 78.9629];
const DEFAULT_ZOOM = 4;

function getInitialView() {
  if (typeof window === "undefined") {
    return { center: DEFAULT_CENTER, zoom: DEFAULT_ZOOM };
  }

  return { center: DEFAULT_CENTER, zoom: DEFAULT_ZOOM };
}

function createIcon(color) {
  // A classic location pin SVG using your provided color
  const pinSVG = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" stroke="white" stroke-width="2" style="width: 36px; height: 36px; filter: drop-shadow(0px 4px 4px rgba(0,0,0,0.25));">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
      <circle cx="12" cy="10" r="3" fill="white" stroke="none"></circle>
    </svg>
  `;

  return L.divIcon({
    className: "bg-transparent", // Clears default Leaflet styling
    html: pinSVG,
    iconSize: [36, 36],
    iconAnchor: [18, 36], // Points the exact bottom tip of the pin to the location
    popupAnchor: [0, -36], // Opens the popup exactly above the pin
  });
}

function FitBounds({ from, to }) {
  const map = useMap();

  useEffect(() => {
    if (!from?.lat || !from?.lon || !to?.lat || !to?.lon) {
      return;
    }

    const bounds = [
      [Number(from.lat), Number(from.lon)],
      [Number(to.lat), Number(to.lon)],
    ];

    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 13 });
  }, [from, to, map]);

  return null;
}

function SetView({ center, zoom }) {
  const map = useMap();

  useEffect(() => {
    if (!center) return;

    map.setView(center, zoom, { animate: true });
  }, [center, zoom, map]);

  return null;
}

export default function ViewMap({ from, to }) {
  const [routeCoords, setRouteCoords] = useState([]);
  const [routeStatus, setRouteStatus] = useState(
    "Pick two places to see the route",
  );
  const [initialView, setInitialView] = useState(getInitialView);

  useEffect(() => {
    if (typeof navigator !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => {
          console.log(
            "User's current location:",
            coords.latitude,
            coords.longitude,
          );
          setInitialView({
            center: [coords.latitude, coords.longitude],
            zoom: 12,
          });
        },
        () => {
          setInitialView(getInitialView());
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 },
      );
    }
  }, []);

  useEffect(() => {
    let active = true;

    async function loadRoute() {
      if (!from?.lat || !from?.lon || !to?.lat || !to?.lon) {
        setRouteCoords([]);
        setRouteStatus(
          from || to
            ? "Select both locations to build a route"
            : "Pick two places to see the route",
        );
        return;
      }

      try {
        const coords = await getRoute(from, to);
        if (active) {
          setRouteCoords(coords);
          setRouteStatus("Route loaded");
        }
      } catch (error) {
        console.error(error);
        if (active) {
          setRouteCoords([
            [Number(from.lat), Number(from.lon)],
            [Number(to.lat), Number(to.lon)],
          ]);
          setRouteStatus("Using the fallback path for this route");
        }
      }
    }

    loadRoute();

    return () => {
      active = false;
    };
  }, [from, to]);
  console.log(
    "ViewMap Rendered with from:",
    from,
    "to:",
    to,
    "routeCoords:",
    routeCoords,
  );
  return (
    <div className="relative h-130 w-full z-10">
      <div className="absolute left-4 top-4 z-10 rounded-2xl border border-slate-700 bg-slate-900/90 px-3 py-2 text-sm text-slate-200 shadow-lg backdrop-blur">
        {routeStatus}
      </div>

      <MapContainer
        center={initialView.center}
        zoom={initialView.zoom}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom
      >
        <SetView center={initialView.center} zoom={initialView.zoom} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {from?.lat && from?.lon && (
          <Marker
            position={[Number(from.lat), Number(from.lon)]}
            icon={createIcon("#2563eb")}
          >
            <Popup>{from.display_name || "From"}</Popup>
          </Marker>
        )}

        {to?.lat && to?.lon && (
          <Marker
            position={[Number(to.lat), Number(to.lon)]}
            icon={createIcon("#dc2626")}
          >
            <Popup>{to.display_name || "To"}</Popup>
          </Marker>
        )}

        {routeCoords.length > 1 && (
          <Polyline
            positions={routeCoords}
            pathOptions={{ color: "#2563eb", weight: 6, opacity: 0.95 }}
          />
        )}

        <FitBounds from={from} to={to} />
      </MapContainer>
    </div>
  );
}
