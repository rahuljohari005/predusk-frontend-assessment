import axios, {
  AxiosHeaders,
  type AxiosError,
  type AxiosInstance,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";

import type { ApiError, ApiErrorDetail } from "@/app/types";
import { ApiErrorCode } from "@/app/types";

const DEFAULT_TIMEOUT_MS = 10_000;
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? process.env.API_BASE_URL ?? "";

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null;
};

const getErrorDetails = (payload: unknown): readonly ApiErrorDetail[] => {
  if (!isRecord(payload) || !Array.isArray(payload.details)) {
    return [];
  }

  return payload.details.flatMap((detail) => {
    if (!isRecord(detail)) {
      return [];
    }

    const field = detail.field;
    const message = detail.message;

    if (typeof field === "string" && typeof message === "string") {
      return [{ field, message }];
    }

    return [];
  });
};

const getErrorMessage = (payload: unknown, fallback: string): string => {
  if (isRecord(payload) && typeof payload.message === "string") {
    return payload.message;
  }

  return fallback;
};

const getRequestId = (payload: unknown): string | null => {
  if (isRecord(payload) && typeof payload.requestId === "string") {
    return payload.requestId;
  }

  return null;
};

const getErrorCode = (status: number, code?: string): ApiErrorCode => {
  switch (status) {
    case 400:
      return ApiErrorCode.BadRequest;

    case 401:
      return ApiErrorCode.Unauthorized;

    case 403:
      return ApiErrorCode.Forbidden;

    case 404:
      return ApiErrorCode.NotFound;

    case 409:
      return ApiErrorCode.Conflict;

    case 422:
      return ApiErrorCode.ValidationError;

    case 429:
      return ApiErrorCode.RateLimited;

    default:
      if (code === "ERR_NETWORK" || status === 0) {
        return ApiErrorCode.NetworkError;
      }

      return ApiErrorCode.Unknown;
  }
};

export const toApiError = (error: unknown): ApiError => {
  if (axios.isAxiosError(error)) {
    const typedError = error as AxiosError<unknown>;
    const payload = typedError.response?.data;
    const status = typedError.response?.status ?? 0;

    return {
      code: getErrorCode(status, typedError.code),
      message: getErrorMessage(payload, typedError.message || "Request failed"),
      status,
      details: getErrorDetails(payload),
      requestId: getRequestId(payload),
    };
  }

  if (error instanceof Error) {
    return {
      code: ApiErrorCode.Unknown,
      message: error.message,
      status: 500,
      details: [],
      requestId: null,
    };
  }

  return {
    code: ApiErrorCode.Unknown,
    message: "Unexpected request failure",
    status: 500,
    details: [],
    requestId: null,
  };
};

export const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: DEFAULT_TIMEOUT_MS,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const nextConfig = config;
    const headers = new AxiosHeaders(nextConfig.headers);
    headers.set("Accept", "application/json");
    nextConfig.headers = headers;

    return nextConfig;
  },
  (error: AxiosError) => Promise.reject(toApiError(error)),
);

apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => Promise.reject(toApiError(error)),
);

export default apiClient;
