import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiClient, ApiError } from '../api/apiClient';

describe('apiClient Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
    localStorage.clear();
  });

  it('should build filter query parameters cleanly', () => {
    const params = apiClient.buildFilterParams({
      search: 'Kochi',
      siteId: '10',
      status: 'active',
      page: 1,
      emptyField: '',
      undefinedField: undefined,
    });

    expect(params).toEqual({
      search: 'Kochi',
      siteId: '10',
      status: 'active',
      page: '1',
    });
  });

  it('should instantiate ApiError correctly', () => {
    const err = new ApiError('Not found', 404, { detail: 'Missing resource' });
    expect(err.message).toBe('Not found');
    expect(err.status).toBe(404);
    expect(err.data).toEqual({ detail: 'Missing resource' });
  });

  it('should execute fetch GET via apiClient.get', async () => {
    const mockResponse = { success: true, data: { items: [1, 2] } };
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const res = await apiClient.get('/test-endpoint', { params: { search: 'test' } });
    expect(globalThis.fetch).toHaveBeenCalled();
    expect(res).toEqual(mockResponse);
  });

  it('should execute fetch POST, PUT, PATCH, DELETE via apiClient', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    });

    const postRes = await apiClient.post('/create', { name: 'Item' });
    const putRes = await apiClient.put('/update/1', { name: 'Item' });
    const patchRes = await apiClient.patch('/patch/1', { name: 'Item' });
    const delRes = await apiClient.delete('/delete/1');

    expect(postRes.success).toBe(true);
    expect(putRes.success).toBe(true);
    expect(patchRes.success).toBe(true);
    expect(delRes.success).toBe(true);
  });

  it('should throw ApiError when fetch response is not ok', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 400,
      statusText: 'Bad Request',
      json: async () => ({ message: 'Validation failed' }),
    });

    await expect(apiClient.get('/error')).rejects.toThrow('Validation failed');
  });
});
