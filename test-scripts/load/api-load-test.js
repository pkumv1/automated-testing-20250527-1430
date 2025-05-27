const { test } = require('@playwright/test');
const { SelfHealingAPI } = require('../self-healing/SelfHealingAPI');

test.describe('API Load Testing', () => {
  test('Concurrent API requests - Birth Certificate', async () => {
    const api = new SelfHealingAPI('https://nagpur.egovmars.in/RTSservices');
    const concurrent = 100;
    const duration = 60000; // 1 minute
    
    const results = {
      total: 0,
      success: 0,
      failed: 0,
      responseTimes: []
    };

    const makeRequest = async () => {
      const start = Date.now();
      try {
        const response = await api.testEndpoint({
          method: 'POST',
          url: '/getRTSRegistrationform/1'
        });
        
        results.success++;
        results.responseTimes.push(Date.now() - start);
      } catch (error) {
        results.failed++;
      }
      results.total++;
    };

    // Run concurrent requests for duration
    const endTime = Date.now() + duration;
    const promises = [];
    
    while (Date.now() < endTime) {
      for (let i = 0; i < concurrent; i++) {
        promises.push(makeRequest());
      }
      await Promise.all(promises);
      promises.length = 0;
    }

    // Calculate metrics
    const avgResponseTime = results.responseTimes.reduce((a, b) => a + b, 0) / results.responseTimes.length;
    const p95ResponseTime = results.responseTimes.sort((a, b) => a - b)[Math.floor(results.responseTimes.length * 0.95)];
    
    console.log('Load Test Results:', {
      total: results.total,
      success: results.success,
      failed: results.failed,
      successRate: (results.success / results.total * 100).toFixed(2) + '%',
      avgResponseTime: avgResponseTime.toFixed(2) + 'ms',
      p95ResponseTime: p95ResponseTime + 'ms'
    });

    // Assert performance baselines
    expect(avgResponseTime).toBeLessThan(500);
    expect(p95ResponseTime).toBeLessThan(1000);
    expect(results.success / results.total).toBeGreaterThan(0.95);
  });
});