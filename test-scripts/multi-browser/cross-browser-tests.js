const { chromium, firefox, webkit } = require('playwright');
const { SelfHealingTest } = require('../self-healing/SelfHealingTest');
const fs = require('fs');

class CrossBrowserTester {
  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      browsers: {},
      summary: {
        totalTests: 0,
        passedTests: 0,
        failedTests: 0
      }
    };
  }

  async runTestsOnBrowser(browserType, browserName) {
    console.log(`\n🌐 Testing on ${browserName}...`);
    const browser = await browserType.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();
    const selfHeal = new SelfHealingTest(page);
    
    this.results.browsers[browserName] = {
      tests: [],
      healing: {},
      performance: {}
    };

    try {
      // Test 1: Birth Certificate Form
      await this.testBirthCertificate(page, selfHeal, browserName);
      
      // Test 2: Water Services
      await this.testWaterServices(page, selfHeal, browserName);
      
      // Test 3: Payment Flow
      await this.testPaymentFlow(page, selfHeal, browserName);
      
      // Capture browser-specific metrics
      this.results.browsers[browserName].healing = selfHeal.getHealingMetrics();
      
    } catch (error) {
      console.error(`❌ Error in ${browserName}:`, error.message);
      this.results.browsers[browserName].error = error.message;
    } finally {
      await browser.close();
    }
  }

  async testBirthCertificate(page, selfHeal, browserName) {
    const testName = 'Birth Certificate Application';
    const startTime = Date.now();
    
    try {
      await page.goto('https://nagpur.egovmars.in/RTSservices/');
      
      const birthLink = await selfHeal.findElement({
        text: 'Birth Certificate',
        css: 'a[href*="birth"]',
        contains: 'Birth'
      });
      
      if (birthLink) {
        await birthLink.click();
        await page.waitForTimeout(2000);
      }
      
      const duration = Date.now() - startTime;
      this.recordTestResult(browserName, testName, true, duration);
      
    } catch (error) {
      const duration = Date.now() - startTime;
      this.recordTestResult(browserName, testName, false, duration, error.message);
    }
  }

  async testWaterServices(page, selfHeal, browserName) {
    const testName = 'Water Services Navigation';
    const startTime = Date.now();
    
    try {
      await page.goto('https://nagpur.egovmars.in/RTSservices/');
      
      const waterLink = await selfHeal.findElement({
        text: 'Water Services',
        css: 'a[href*="water"]',
        contains: 'Water'
      });
      
      if (waterLink) {
        await waterLink.click();
        await page.waitForTimeout(2000);
      }
      
      const duration = Date.now() - startTime;
      this.recordTestResult(browserName, testName, true, duration);
      
    } catch (error) {
      const duration = Date.now() - startTime;
      this.recordTestResult(browserName, testName, false, duration, error.message);
    }
  }

  async testPaymentFlow(page, selfHeal, browserName) {
    const testName = 'Payment Gateway Access';
    const startTime = Date.now();
    
    try {
      await page.goto('https://nagpur.egovmars.in/RTSservices/payment/initiate');
      await page.waitForTimeout(3000);
      
      const paymentForm = await selfHeal.findElement({
        css: 'form',
        tag: 'form',
        contains: 'payment'
      });
      
      const duration = Date.now() - startTime;
      this.recordTestResult(browserName, testName, !!paymentForm, duration);
      
    } catch (error) {
      const duration = Date.now() - startTime;
      this.recordTestResult(browserName, testName, false, duration, error.message);
    }
  }

  recordTestResult(browser, testName, passed, duration, error = null) {
    this.results.browsers[browser].tests.push({
      name: testName,
      passed,
      duration: duration + 'ms',
      error
    });
    
    this.results.summary.totalTests++;
    if (passed) {
      this.results.summary.passedTests++;
    } else {
      this.results.summary.failedTests++;
    }
  }

  async runAllBrowserTests() {
    console.log('🚀 Starting Cross-Browser Testing\n');
    
    // Test on Chromium
    await this.runTestsOnBrowser(chromium, 'Chromium');
    
    // Test on Firefox
    await this.runTestsOnBrowser(firefox, 'Firefox');
    
    // Test on WebKit
    await this.runTestsOnBrowser(webkit, 'WebKit');
    
    // Calculate summary
    this.results.summary.successRate = 
      ((this.results.summary.passedTests / this.results.summary.totalTests) * 100).toFixed(2) + '%';
    
    // Save results
    const timestamp = new Date().toISOString().replace(/:/g, '-');
    const filename = `test-results/cross-browser-${timestamp}.json`;
    fs.writeFileSync(filename, JSON.stringify(this.results, null, 2));
    
    console.log('\n📊 Cross-Browser Test Summary:');
    console.log('═══════════════════════════════');
    console.log(`Total Tests: ${this.results.summary.totalTests}`);
    console.log(`Passed: ${this.results.summary.passedTests}`);
    console.log(`Failed: ${this.results.summary.failedTests}`);
    console.log(`Success Rate: ${this.results.summary.successRate}`);
    
    Object.entries(this.results.browsers).forEach(([browser, data]) => {
      console.log(`\n${browser}:`);
      const passed = data.tests.filter(t => t.passed).length;
      console.log(`  ✓ Passed: ${passed}/${data.tests.length}`);
      if (data.healing) {
        console.log(`  🔧 Healing Rate: ${data.healing.healingRate || 'N/A'}`);
      }
    });
    
    return this.results;
  }
}

// Execute cross-browser tests
if (require.main === module) {
  const tester = new CrossBrowserTester();
  tester.runAllBrowserTests().catch(console.error);
}

module.exports = { CrossBrowserTester };