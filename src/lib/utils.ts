import { store } from "@/store";
import axios from "axios";
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_HOST}/api`, // Adjust this to your API's base URL
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add Authorization header from Redux before each request
api.interceptors.request.use(
  (config) => {
    const token = store.getState().auth?.token; // <- get from authSlice
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);