import axios from "axios";

const getBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (envUrl && envUrl.trim() !== "") {
    let url = envUrl.trim().replace(/\/$/, "");
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      url = `https://${url}`;
    }
    const hostPart = url.replace(/^https?:\/\//, "");
    if (!hostPart.includes(".") && !hostPart.includes("localhost")) {
      url = `${url}.onrender.com`;
    }
    return url;
  }
  if (typeof window !== "undefined" && window.location.hostname.includes("onrender.com")) {
    return "https://ai-image-studio-backend-oyzz.onrender.com";
  }
  return "http://127.0.0.1:8000";
};

const API = axios.create({
  baseURL: getBaseUrl(),
});

export const generateImage = async (data) => {
  const response = await API.post("/generate", data);
  return response.data;
};

export const getHistory = async () => {
  const response = await API.get("/history");
  return response.data;
};