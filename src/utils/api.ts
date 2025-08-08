// utils/api.ts
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080/api", // Ganti sesuai domain SpringBoot mu
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
