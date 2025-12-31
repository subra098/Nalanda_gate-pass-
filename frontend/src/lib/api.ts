import axios from "axios";

const api = axios.create({
    // Use relative path by default to work with Vite proxy in development
    // This allows the phone to access the API via the same port as the frontend
    baseURL: import.meta.env.VITE_API_URL || "/api",
    headers: {
        "Content-Type": "application/json",
    },
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;
