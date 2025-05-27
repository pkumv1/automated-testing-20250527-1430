const { test, expect } = require('@playwright/test');
const { SelfHealingAPI } = require('../self-healing/SelfHealingAPI');

test.describe('Master Data API Tests', () => {
  let api;
  const baseURL = 'https://nagpur.egovmars.in/RTSservices';

  test.beforeAll(async () => {
    api = new SelfHealingAPI(baseURL);
  });

  test('GET /getBloodGroups', async () => {
    const response = await api.testEndpoint({
      method: 'GET',
      url: '/getBloodGroups'
    });

    expect(response.status).toBe(200);
    expect(Array.isArray(response.data)).toBeTruthy();
    expect(response.data).toContainEqual(
      expect.objectContaining({ value: expect.any(String) })
    );
  });

  test('GET /getTitles', async () => {
    const response = await api.testEndpoint({
      method: 'GET',
      url: '/getTitles'
    });

    expect(response.status).toBe(200);
    expect(response.data).toContainEqual(
      expect.objectContaining({ value: 'Mr' })
    );
  });

  test('GET /getZones', async () => {
    const response = await api.testEndpoint({
      method: 'GET',
      url: '/getZones'
    });

    expect(response.status).toBe(200);
    expect(Array.isArray(response.data)).toBeTruthy();
  });
});