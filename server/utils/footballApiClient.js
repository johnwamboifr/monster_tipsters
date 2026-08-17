import { footballApiClient } from "../config/football-api.js";
import { footballApiConfig } from "../config/football-api.js";

export const requestFootballApi = async (endpoint, params = {}, method = "get") => {
  try {
    const config = method === "get" ? { params } : {};
    const response = await footballApiClient[method](endpoint, config);
    return response?.data ?? {};
  } catch (error) {
    const message = error?.response?.data?.message || error?.message || "Football API request failed.";
    const statusCode = error?.response?.status || 500;
    const requestError = new Error(message);
    requestError.statusCode = statusCode;
    throw requestError;
  }
};

export const withRetry = async (requestFn, attempts = footballApiConfig.retryAttempts) => {
  let lastError;

  for (let attempt = 0; attempt <= attempts; attempt += 1) {
    try {
      return await requestFn();
    } catch (error) {
      lastError = error;

      if (attempt >= attempts) {
        break;
      }

      await new Promise((resolve) => setTimeout(resolve, 250 * (attempt + 1)));
    }
  }

  throw lastError;
};
