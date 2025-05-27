const { test } = require('@playwright/test');

class ChaosEngineer {
  constructor(page) {
    this.page = page;
    this.chaosLog = [];
  }

  async injectNetworkLatency(ms = 1000) {
    await this.page.route('**/*', async route => {
      await new Promise(resolve => setTimeout(resolve, ms));
      await route.continue();
    });
    
    this.chaosLog.push({
      type: 'network_latency',
      value: ms + 'ms',
      timestamp: new Date().toISOString()
    });
  }

  async simulateNetworkFailure(urlPattern, errorCode = 'failed') {
    await this.page.route(urlPattern, route => {
      route.abort(errorCode);
    });
    
    this.chaosLog.push({
      type: 'network_failure',
      pattern: urlPattern,
      error: errorCode,
      timestamp: new Date().toISOString()
    });
  }

  async throttleCPU(factor = 4) {
    const client = await this.page.context().newCDPSession(this.page);
    await client.send('Emulation.setCPUThrottlingRate', { rate: factor });
    
    this.chaosLog.push({
      type: 'cpu_throttle',
      factor,
      timestamp: new Date().toISOString()
    });
  }

  async simulateSlowNetwork(downloadThroughput = 50 * 1024, uploadThroughput = 20 * 1024) {
    const client = await this.page.context().newCDPSession(this.page);
    await client.send('Network.emulateNetworkConditions', {
      offline: false,
      downloadThroughput,
      uploadThroughput,
      latency: 200
    });
    
    this.chaosLog.push({
      type: 'slow_network',
      download: downloadThroughput / 1024 + 'KB/s',
      upload: uploadThroughput / 1024 + 'KB/s',
      timestamp: new Date().toISOString()
    });
  }

  async injectRandomErrors(probability = 0.1) {
    await this.page.route('**/*', async route => {
      if (Math.random() < probability) {
        const errors = [500, 502, 503, 504];
        const randomError = errors[Math.floor(Math.random() * errors.length)];
        
        await route.fulfill({
          status: randomError,
          body: JSON.stringify({ error: 'Chaos injection' })
        });
        
        this.chaosLog.push({
          type: 'random_error',
          url: route.request().url(),
          status: randomError,
          timestamp: new Date().toISOString()
        });
      } else {
        await route.continue();
      }
    });
  }

  async testAPIResilience(apiEndpoint, normalPayload) {
    const scenarios = [
      { name: 'Normal', payload: normalPayload },
      { name: 'Empty payload', payload: {} },
      { name: 'Null values', payload: Object.keys(normalPayload).reduce((acc, key) => ({ ...acc, [key]: null }), {}) },
      { name: 'Extra fields', payload: { ...normalPayload, extraField1: 'test', extraField2: 123 } },
      { name: 'Wrong types', payload: Object.keys(normalPayload).reduce((acc, key) => ({ ...acc, [key]: typeof normalPayload[key] === 'string' ? 123 : 'string' }), {}) },
      { name: 'Large payload', payload: { ...normalPayload, largeField: 'x'.repeat(10000) } }
    ];

    const results = [];
    
    for (const scenario of scenarios) {
      try {
        const response = await this.page.request.post(apiEndpoint, {
          data: scenario.payload,
          timeout: 5000
        });
        
        results.push({
          scenario: scenario.name,
          status: response.status(),
          success: response.status() < 500
        });
      } catch (error) {
        results.push({
          scenario: scenario.name,
          error: error.message,
          success: false
        });
      }
    }
    
    this.chaosLog.push({
      type: 'api_resilience_test',
      endpoint: apiEndpoint,
      results,
      timestamp: new Date().toISOString()
    });
    
    return results;
  }

  getChaosReport() {
    return {
      totalTests: this.chaosLog.length,
      testTypes: this.chaosLog.reduce((acc, log) => {
        acc[log.type] = (acc[log.type] || 0) + 1;
        return acc;
      }, {}),
      timeline: this.chaosLog
    };
  }
}

module.exports = { ChaosEngineer };