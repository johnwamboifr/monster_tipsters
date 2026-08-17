import axios from "axios";
import dotenv from "dotenv";

dotenv.config();
  //"cb84bbbd8599425a99113f6235bb24d6",
// "3ebc50b24f3c415095a5f9702ef9bdee"

export const footballApiConfig = {
  apiBaseUrl: process.env.API_BASE_URL || process.env.FOOTBALL_API_BASE_URL || "https://api.football-data.org/v4",
  apiKey: process.env.API_KEY || process.env.FOOTBALL_API_KEY || "3ebc50b24f3c415095a5f9702ef9bdee",
  apiHost: process.env.API_HOST || "",
  timeoutMs: Number(process.env.API_TIMEOUT_MS || 12000),
  retryAttempts: Number(process.env.API_RETRY_ATTEMPTS || 2),
};

export const createFootballApiClient = () => {
  const headers = {
    "Content-Type": "application/json",
  };

  if (footballApiConfig.apiKey) {
    headers["X-Auth-Token"] = footballApiConfig.apiKey;
  }

  if (footballApiConfig.apiHost) {
    headers["x-api-host"] = footballApiConfig.apiHost;
  }

  return axios.create({
    baseURL: footballApiConfig.apiBaseUrl,
    timeout: footballApiConfig.timeoutMs,
    headers,
  });
};

export const footballApiClient = createFootballApiClient();

export const isFootballApiConfigured = () => Boolean(footballApiConfig.apiBaseUrl && footballApiConfig.apiKey);

export default footballApiClient;
