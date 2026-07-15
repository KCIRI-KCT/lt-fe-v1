// ============================================================================
// Centralized API Client
// ============================================================================

import { config } from '../config';
import type { APIResponse, TableFilters } from '../types';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface RequestOptions {
  method?: HttpMethod;
  body?: unknown;
  params?: Record<string, string>;
  headers?: Record<string, string>;
  signal?: AbortSignal;
}

class ApiClient {
  private baseUrl: string;
  private tokenKey: string;

  constructor() {
    this.baseUrl = config.apiBaseUrl;
    this.tokenKey = config.auth.tokenKey;
  }

  private getToken(): string | null {
    try {
      return localStorage.getItem(this.tokenKey);
    } catch {
      return null;
    }
  }

  private async request<T>(endpoint: string, options: RequestOptions = {}): Promise<APIResponse<T>> {
    const { method = 'GET', body, params, headers = {}, signal } = options;

    const url = new URL(`${this.baseUrl}${endpoint}`, window.location.origin);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value) url.searchParams.set(key, value);
      });
    }

    const token = this.getToken();
    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...headers,
    };

    if (token) {
      requestHeaders['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url.toString(), {
        method,
        headers: requestHeaders,
        body: body ? JSON.stringify(body) : undefined,
        signal,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new ApiError(
          errorData?.message || `HTTP ${response.status}: ${response.statusText}`,
          response.status,
          errorData
        );
      }

      const data = await response.json();
      return data as APIResponse<T>;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(
        error instanceof Error ? error.message : 'Network error',
        0
      );
    }
  }

  async get<T>(endpoint: string, options?: RequestOptions): Promise<APIResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  async post<T>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<APIResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'POST', body });
  }

  async put<T>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<APIResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'PUT', body });
  }

  async patch<T>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<APIResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'PATCH', body });
  }

  async delete<T>(endpoint: string, options?: RequestOptions): Promise<APIResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }

  // Helper to build query params from filters
  buildFilterParams(filters: Partial<TableFilters>): Record<string, string> {
    const params: Record<string, string> = {};
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params[key] = String(value);
      }
    });
    return params;
  }
}

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

export const apiClient = new ApiClient();