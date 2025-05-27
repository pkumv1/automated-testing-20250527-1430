const { test, expect } = require('@playwright/test');
const { SelfHealingAPI } = require('../self-healing/SelfHealingAPI');

test.describe('Payment API Tests', () => {
  let api;
  const baseURL = 'https://nagpur.egovmars.in/RTSservices';

  test.beforeAll(async () => {
    api = new SelfHealingAPI(baseURL);
  });

  test('POST /initiatePayment', async () => {
    const payload = {
      applicationNumber: 'RTS/HD/2025/12345',
      amount: 500,
      email: 'payment@example.com',
      phone: '9876543216',
      name: 'Test Payer',
      serviceType: 'BIRTH_CERTIFICATE'
    };

    const response = await api.testEndpoint({
      method: 'POST',
      url: '/initiatePayment',
      data: payload
    });

    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('paymentUrl');
    expect(response.data).toHaveProperty('transactionId');
  });

  test('POST /easebuzzWebhook - Payment success', async () => {
    const webhookPayload = {
      status: 'success',
      txnid: 'TXN' + Date.now(),
      amount: '500.00',
      email: 'payment@example.com',
      phone: '9876543216',
      firstname: 'Test',
      productinfo: 'RTS/HD/2025/12345',
      hash: 'dummy_hash_for_test'
    };

    const response = await api.testEndpoint({
      method: 'POST',
      url: '/easebuzzWebhook',
      data: webhookPayload
    });

    expect(response.status).toBe(200);
  });
});