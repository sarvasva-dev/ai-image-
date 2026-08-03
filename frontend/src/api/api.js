import axios from "axios";

const getBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (envUrl && envUrl.trim() !== "") {
    return envUrl.replace(/\/$/, "");
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