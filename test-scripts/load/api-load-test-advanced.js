const axios = require('axios');
const { SelfHealingAPI } = require('../self-healing/SelfHealingAPI');

class AdvancedLoadTester {
  constructor(baseURL) {
    this.baseURL = baseURL;
    this.api = new SelfHealingAPI(baseURL);
    this.results = {
      timestamp: new Date().toISOString(),
      endpoints: {},
      summary: {}
    };
  }

  async runLoadTest(endpoint, config) {
    const { concurrent = 100, duration = 60000, payload } = config;
    console.log(`\n💪 Load testing ${endpoint} with ${concurrent} concurrent users...`);
    
    const endpointResults = {
      total: 0,
      success: 0,
      failed: 0,
      responseTimes: [],
      errors: {},
      throughput: []
    };

    const startTime = Date.now();
    const endTime = startTime + duration;
    let secondCounter = 0;
    let requestsThisSecond = 0;

    while (Date.now() < endTime) {
      const promises = [];
      
      // Launch concurrent requests
      for (let i = 0; i < concurrent; i++) {
        promises.push(this.makeRequest(endpoint, payload, endpointResults));
      }
      
      await Promise.all(promises);
      
      // Track throughput per second
      requestsThisSecond += concurrent;
      if (Date.now() - startTime > (secondCounter + 1) * 1000) {
        endpointResults.throughput.push(requestsThisSecond);
        requestsThisSecond = 0;
        secondCounter++;
      }
    }

    // Calculate statistics
    this.calculateStats(endpoint, endpointResults);
    this.results.endpoints[endpoint] = endpointResults;
    
    return endpointResults;
  }

  async makeRequest(endpoint, payload, results) {
    const start = Date.now();
    
    try {
      const response = await this.api.testEndpoint({
        method: 'POST',
        url: endpoint,
        data: payload,
        timeout: 10000
      });
      
      const duration = Date.now() - start;
      results.responseTimes.push(duration);
      results.success++;
      results.total++;
      
      return { success: true, duration };
      
    } catch (error) {
      const errorType = error.response?.status || 'network_error';
      results.errors[errorType] = (results.errors[errorType] || 0) + 1;
      results.failed++;
      results.total++;
      
      return { success: false, error: errorType };
    }
  }

  calculateStats(endpoint, results) {
    const times = results.responseTimes.sort((a, b) => a - b);
    
    if (times.length > 0) {
      results.stats = {
        min: times[0] + 'ms',
        max: times[times.length - 1] + 'ms',
        avg: (times.reduce((a, b) => a + b, 0) / times.length).toFixed(2) + 'ms',
        p50: times[Math.floor(times.length * 0.5)] + 'ms',
        p95: times[Math.floor(times.length * 0.95)] + 'ms',
        p99: times[Math.floor(times.length * 0.99)] + 'ms'
      };
      
      results.successRate = ((results.success / results.total) * 100).toFixed(2) + '%';
      results.avgThroughput = (results.throughput.reduce((a, b) => a + b, 0) / results.throughput.length).toFixed(2) + ' req/s';
      results.peakThroughput = Math.max(...results.throughput) + ' req/s';
    }
  }

  async runComprehensiveLoadTest() {
    console.log('🚀 Starting Comprehensive API Load Testing\n');
    
    const testScenarios = [
      {
        endpoint: '/saveBirthApplication',
        config: {
          concurrent: 100,
          duration: 60000,
          payload: {
            applicantName: 'Load Test User',
            childName: 'Test Child',
            email: 'loadtest@example.com',
            phoneNo: 9876543210,
            zone: 1,
            userMobileNumber: 9876543210,
            // ... other required fields
          }
        }
      },
      {
        endpoint: '/saveNewWaterConnection',
        config: {
          concurrent: 50,
          duration: 30000,
          payload: {
            applicantName: 'Water Load Test',
            email: 'waterload@example.com',
            phoneNo: 9876543211,
            zone: 2,
            purposeOfConnection: 'Domestic',
            userMobileNumber: 9876543211
          }
        }
      },
      {
        endpoint: '/initiatePayment',
        config: {
          concurrent: 200,
          duration: 45000,
          payload: {
            applicationNumber: 'LOAD/TEST/2025/12345',
            amount: 500,
            email: 'payment@example.com',
            phone: '9876543212'
          }
        }
      }
    ];

    // Run load tests
    for (const scenario of testScenarios) {
      await this.runLoadTest(scenario.endpoint, scenario.config);
      await new Promise(resolve => setTimeout(resolve, 5000)); // Cool down between tests
    }

    // Generate summary
    this.generateSummary();
    
    // Save results
    const timestamp = new Date().toISOString().replace(/:/g, '-');
    const fs = require('fs');
    fs.writeFileSync(
      `test-results/load-test-${timestamp}.json`,
      JSON.stringify(this.results, null, 2)
    );
    
    return this.results;
  }

  generateSummary() {
    let totalRequests = 0;
    let totalSuccess = 0;
    let totalFailed = 0;
    
    Object.values(this.results.endpoints).forEach(endpoint => {
      totalRequests += endpoint.total;
      totalSuccess += endpoint.success;
      totalFailed += endpoint.failed;
    });
    
    this.results.summary = {
      totalRequests,
      totalSuccess,
      totalFailed,
      overallSuccessRate: ((totalSuccess / totalRequests) * 100).toFixed(2) + '%',
      apiHealingApplied: this.api.getHealingStats()
    };
    
    console.log('\n📊 Load Test Summary:');
    console.log('════════════════════');
    console.log(`Total Requests: ${totalRequests}`);
    console.log(`Successful: ${totalSuccess}`);
    console.log(`Failed: ${totalFailed}`);
    console.log(`Success Rate: ${this.results.summary.overallSuccessRate}`);
    
    Object.entries(this.results.endpoints).forEach(([endpoint, data]) => {
      console.log(`\n${endpoint}:`);
      console.log(`  Requests: ${data.total}`);
      console.log(`  Success Rate: ${data.successRate}`);
      console.log(`  Avg Response: ${data.stats?.avg || 'N/A'}`);
      console.log(`  P95 Response: ${data.stats?.p95 || 'N/A'}`);
      console.log(`  Throughput: ${data.avgThroughput}`);
    });
  }
}

// Execute load tests
if (require.main === module) {
  const tester = new AdvancedLoadTester('https://nagpur.egovmars.in/RTSservices');
  tester.runComprehensiveLoadTest().catch(console.error);
}

module.exports = { AdvancedLoadTester };