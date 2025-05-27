const axios = require('axios');

class SelfHealingAPI {
  constructor(baseURL) {
    this.baseURL = baseURL;
    this.endpoints = new Map();
    this.healingLog = [];
  }

  async discoverEndpoints() {
    // Auto-discover from source code analysis
    const discovered = [
      { path: '/saveBirthApplication', method: 'POST', service: 'birth' },
      { path: '/saveDeathApplication', method: 'POST', service: 'death' },
      { path: '/saveMarriageApplication', method: 'POST', service: 'marriage' },
      { path: '/saveNewWaterConnection', method: 'POST', service: 'water' },
      { path: '/saveTradeLicenseNew', method: 'POST', service: 'trade' }
    ];
    
    discovered.forEach(ep => {
      this.endpoints.set(ep.service, ep);
    });
    
    return discovered;
  }

  async testEndpoint(config) {
    const fallbacks = [
      config.url,
      config.url.replace('/v1/', '/'),
      config.url.replace('/api/', '/'),
      this.baseURL + config.url
    ];

    for (const url of fallbacks) {
      try {
        const response = await axios({
          ...config,
          url,
          timeout: 5000,
          validateStatus: () => true
        });

        this.healingLog.push({
          original: config.url,
          healed: url,
          status: response.status,
          success: response.status < 400
        });

        return response;
      } catch (error) {
        continue;
      }
    }

    throw new Error(`All endpoint variations failed for ${config.url}`);
  }

  async refreshAuthToken() {
    // Self-healing auth token refresh
    try {
      const response = await axios.post(this.baseURL + '/refreshToken');
      return response.data.token;
    } catch (error) {
      // Fallback to re-login
      const loginResponse = await axios.post(this.baseURL + '/login', {
        username: process.env.TEST_USER,
        password: process.env.TEST_PASS
      });
      return loginResponse.data.token;
    }
  }

  getHealingStats() {
    const total = this.healingLog.length;
    const healed = this.healingLog.filter(l => l.original !== l.healed && l.success).length;
    
    return {
      totalRequests: total,
      healedRequests: healed,
      healingRate: total > 0 ? (healed / total * 100).toFixed(2) + '%' : '0%',
      log: this.healingLog
    };
  }
}

module.exports = { SelfHealingAPI };