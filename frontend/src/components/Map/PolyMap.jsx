import { useEffect, useMemo, useState } from "react";
import {
  MapContainer,
  Marker,
  Polyline,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import polyline from "@mapbox/polyline";
import "leaflet/dist/leaflet.css";

function createIcon(color) {
  return L.divIcon({
    className: "",
    html: `
      <svg xmlns="http://www.w3.org/2000/svg"
           viewBox="0 0 24 24"
           fill="${color}"
           stroke="white"
           stroke-width="2"
           width="36"
           height="36">
        <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 1118 0z"/>
        <circle cx="12" cy="10" r="3" fill="white"/>
      </svg>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36],
  });
}

function FitBounds({ ride }) {
  const map = useMap();

  useEffect(() => {
    if (!ride) return;

    map.fitBounds(
      [
        [ride.startLatitude, ride.startLongitude],
        [ride.endLatitude, ride.endLongitude],
      ],
      {
        padding: [40, 40],
        maxZoom: 100,
      },
    );
  }, [ride, map]);

  return null;
}

export default function PolyMap({ ride }) {
  const decodedPolyline = useMemo(() => {
    if (!ride?.polyline) return [];

    try {
      return polyline.decode(ride.polyline);
    } catch (e) {
      console.error(e);
      return [];
    }
  }, [ride]);

  if (!ride) return null;

  return (
    <div className="relative h-full w-full">
      <MapContainer style={{ width: "100%", height: "100%" }} scrollWheelZoom>
        <TileLayer
          attribution="© OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <Marker
          position={[ride.startLatitude, ride.startLongitude]}
          icon={createIcon("#2563eb")}
        >
          <Popup>{ride.departureLocationName}</Popup>
        </Marker>

        <Marker
          position={[ride.endLatitude, ride.endLongitude]}
          icon={createIcon("#dc2626")}
        >
          <Popup>{ride.arrivalLocationName}</Popup>
        </Marker>

        {decodedPolyline.length > 0 && (
          <Polyline
            positions={decodedPolyline}
            pathOptions={{
              color: "#2563eb",
              weight: 6,
              opacity: 0.9,
            }}
          />
        )}

        <FitBounds ride={ride} />
      </MapContainer>
    </div>
  );
}
