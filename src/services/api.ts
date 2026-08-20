// ============================================================================
// Centralized Axios API Client
// ============================================================================

import axios, { type AxiosRequestConfig, type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { config } from '../config';

// Ensure base URL ends with trailing slash or clean join
const baseURL = config.apiBaseUrl.endsWith('/') ? config.apiBaseUrl : `${config.apiBaseUrl}/`;

export const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Helper for Session Storage Token management
export const getAccessToken = (): string | null => sessionStorage.getItem('access_token');
export const getRefreshToken = (): string | null => sessionStorage.getItem('refresh_token');
export const setTokens = (accessToken: string, refreshToken?: string) => {
  sessionStorage.setItem('access_token', accessToken);
  if (refreshToken) {
    sessionStorage.setItem('refresh_token', refreshToken);
  }
};
export const clearSessionStorage = () => {
  sessionStorage.removeItem('access_token');
  sessionStorage.removeItem('refresh_token');
  sessionStorage.removeItem('user');
  sessionStorage.removeItem('role_id');
};

// Request Interceptor: Attach JWT Bearer Token from sessionStorage
api.interceptors.request.use(
  (reqConfig: InternalAxiosRequestConfig) => {
    const token = getAccessToken();
    if (token && reqConfig.headers) {
      reqConfig.headers.Authorization = `Bearer ${token}`;
    }
    return reqConfig;
  },
  (error: AxiosError) => Promise.reject(error)
);

// Response Interceptor: Handle API Response Unwrapping & 401 Refresh Logic
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: AxiosError | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
    const requestUrl = originalRequest?.url || '';

    // Standardize error message from LT AMS Backend Envelope format
    const responseData = error.response?.data as Record<string, unknown> | undefined;
    if (responseData) {
      if (responseData.errors && typeof responseData.errors === 'object') {
        const errorEntries = Object.entries(responseData.errors as Record<string, string[]>);
        const formattedMsg = errorEntries
          .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
          .join(' | ');
        if (formattedMsg) {
          error.message = formattedMsg;
        }
      } else if (typeof responseData.message === 'string') {
        error.message = responseData.message;
      } else if (typeof responseData.detail === 'string') {
        error.message = responseData.detail;
      }
    }

    // Skip refresh token logic for authentication endpoints
    const isAuthEndpoint = requestUrl.includes('auth/login') ||
                           requestUrl.includes('auth/register') ||
                           requestUrl.includes('auth/token/refresh');

    // If 401 Unauthorized and not an auth endpoint, attempt silent token refresh
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry && !isAuthEndpoint) {
      const refreshToken = getRefreshToken();
      if (refreshToken) {
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${token}`;
              }
              return api(originalRequest);
            })
            .catch((err) => Promise.reject(err));
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const { data } = await axios.post(`${baseURL}auth/token/refresh/`, {
            refresh: refreshToken,
          });

          const newAccessToken = data?.access || data?.data?.access;
          if (newAccessToken) {
            sessionStorage.setItem('access_token', newAccessToken);
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            }
            processQueue(null, newAccessToken);
            return api(originalRequest);
          }
        } catch (refreshErr) {
          processQueue(refreshErr as AxiosError, null);
          clearSessionStorage();
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
        } finally {
          isRefreshing = false;
        }
      } else {
        clearSessionStorage();
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;

