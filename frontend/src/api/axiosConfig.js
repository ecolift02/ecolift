import axios from "axios";

// Create a configured instance of Axios
const api = axios.create({
  baseURL: "http://localhost:8083/api", // Pointing to your Spring Boot backend
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor: Attach the JWT to every outgoing request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("jwt_token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response Interceptor: Handle 401 Unauthorized globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token is likely expired or invalid
      localStorage.removeItem("jwt_token");
      localStorage.removeItem("user_data");
      // Force a reload to clear state and kick user to login
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export default api;
