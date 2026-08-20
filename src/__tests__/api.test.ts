import { describe, it, expect } from 'vitest';
import api, { getAccessToken, getRefreshToken, setTokens, clearSessionStorage } from '../services/api';

describe('src/services/api.ts Helper Methods & Interceptors', () => {
  it('should get and set access and refresh tokens in sessionStorage', () => {
    sessionStorage.clear();
    expect(getAccessToken()).toBeNull();
    expect(getRefreshToken()).toBeNull();

    setTokens('test_acc_token', 'test_ref_token');
    expect(getAccessToken()).toBe('test_acc_token');
    expect(getRefreshToken()).toBe('test_ref_token');

    clearSessionStorage();
    expect(getAccessToken()).toBeNull();
    expect(getRefreshToken()).toBeNull();
  });

  it('should have base configuration configured correctly on Axios instance', () => {
    expect(api.defaults.headers['Content-Type']).toBe('application/json');
    expect(api.defaults.timeout).toBe(30000);
  });
});
