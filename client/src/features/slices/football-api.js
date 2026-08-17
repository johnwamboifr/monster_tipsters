import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    if (import.meta.env.DEV) {
      console.debug(`[API][request] ${config.method?.toUpperCase() || "GET"} ${config.url}`, {
        params: config.params,
        headers: config.headers,
      });
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => {
    if (import.meta.env.DEV) {
      const contentType = response.headers?.["content-type"] || response.headers?.["Content-Type"] || "";
      console.debug(`[API][response] ${response.config?.method?.toUpperCase() || "GET"} ${response.config?.url}`, {
        status: response.status,
        contentType,
        body: response.data,
      });
    }

    return response;
  },
  (error) => {
    if (import.meta.env.DEV) {
      const requestUrl = error.config?.url || "unknown";
      const requestMethod = error.config?.method?.toUpperCase() || "GET";
      const status = error.response?.status;
      const responseBody = error.response?.data;
      const contentType = error.response?.headers?.["content-type"] || error.response?.headers?.["Content-Type"] || "";

      console.error(`[API] ${requestMethod} ${requestUrl} failed`, {
        status,
        contentType,
        responseBody,
      });
    }

    return Promise.reject(error);
  }
);

export default api;