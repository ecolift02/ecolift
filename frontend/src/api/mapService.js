import api from "./axiosConfig";
import polyline from "@mapbox/polyline";

export const searchLocation = async (query) => {
  const res = await api.get("/maps/search", {
    params: { q: query },
  });
  return res.data;
};

export const getRoute = async (from, to) => {
  const res = await api.post("/maps/route", {
    start: { lat: Number(from.lat), lon: Number(from.lon) },
    end: { lat: Number(to.lat), lon: Number(to.lon) },
  });

  const routeData = res.data;
  const encodedPolyline = routeData?.polyline ?? "";

  return {
    polyline: encodedPolyline,
    distanceKm: routeData?.distanceKm ?? 0,
    coordinates: encodedPolyline
      ? polyline.decode(encodedPolyline).map(([lat, lon]) => [lat, lon])
      : [],
  };
};
