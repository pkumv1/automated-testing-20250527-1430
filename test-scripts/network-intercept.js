const { test } = require('@playwright/test');

class NetworkInterceptor {
  constructor(page) {
    this.page = page;
    this.apiCalls = [];
    this.setupInterceptors();
  }

  setupInterceptors() {
    this.page.on('request', request => {
      if (request.url().includes('/RTSservices/')) {
        this.apiCalls.push({
          url: request.url(),
          method: request.method(),
          headers: request.headers(),
          timestamp: new Date().toISOString()
        });
      }
    });

    this.page.on('response', response => {
      if (response.url().includes('/RTSservices/')) {
        const call = this.apiCalls.find(c => c.url === response.url());
        if (call) {
          call.status = response.status();
          call.duration = new Date() - new Date(call.timestamp);
        }
      }
    });
  }

  async interceptAndModify(urlPattern, handler) {
    await this.page.route(urlPattern, async route => {
      const request = route.request();
      const response = await route.fetch();
      const body = await response.json();
      
      const modifiedBody = await handler(body, request);
      
      await route.fulfill({
        status: response.status(),
        headers: response.headers(),
        body: JSON.stringify(modifiedBody)
      });
    });
  }

  getMetrics() {
    const totalCalls = this.apiCalls.length;
    const successfulCalls = this.apiCalls.filter(c => c.status && c.status < 400).length;
    const avgDuration = this.apiCalls
      .filter(c => c.duration)
      .reduce((sum, c) => sum + c.duration, 0) / totalCalls || 0;

    return {
      totalAPICalls: totalCalls,
      successfulCalls,
      failedCalls: totalCalls - successfulCalls,
      avgResponseTime: avgDuration.toFixed(2) + 'ms',
      endpointBreakdown: this.getEndpointBreakdown()
    };
  }

  getEndpointBreakdown() {
    const breakdown = {};
    this.apiCalls.forEach(call => {
      const endpoint = call.url.split('?')[0].split('/').pop();
      if (!breakdown[endpoint]) {
        breakdown[endpoint] = { count: 0, avgTime: 0, times: [] };
      }
      breakdown[endpoint].count++;
      if (call.duration) {
        breakdown[endpoint].times.push(call.duration);
      }
    });

    Object.keys(breakdown).forEach(endpoint => {
      const times = breakdown[endpoint].times;
      if (times.length > 0) {
        breakdown[endpoint].avgTime = (times.reduce((a, b) => a + b, 0) / times.length).toFixed(2) + 'ms';
      }
      delete breakdown[endpoint].times;
    });

    return breakdown;
  }
}

module.exports = { NetworkInterceptor };