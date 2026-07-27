import axios from "axios";
import api from "./axiosConfig"; // Import the configured Axios instance

// const api = axios.create({
//   baseURL:
//     import.meta.env.VITE_API_URL ||
//     "https://607e-103-241-80-134.ngrok-free.app/api",
// });

export const searchLocation = async (query) => {
  const res = await api.get("/maps/search", {
    params: { q: query },
  });

  return res.data;
};

export const getRoute = async (from, to) => {
  const res = await api.post("/maps/route", {
    start: {
      lat: Number(from.lat),
      lon: Number(from.lon),
    },
    end: {
      lat: Number(to.lat),
      lon: Number(to.lon),
    },
  });

  return res.data;
};
