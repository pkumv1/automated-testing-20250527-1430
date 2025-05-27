const { test, expect } = require('@playwright/test');
const { SelfHealingTest } = require('../self-healing/SelfHealingTest');
const { NetworkInterceptor } = require('../network-intercept');
const { PerformanceMonitor } = require('../performance-monitor');

test.describe('Comprehensive E2E Flow', () => {
  let selfHeal, networkMonitor, perfMonitor;

  test('Complete citizen journey - Birth to Payment', async ({ page }) => {
    selfHeal = new SelfHealingTest(page);
    networkMonitor = new NetworkInterceptor(page);
    perfMonitor = new PerformanceMonitor(page);

    // Start monitoring
    await page.goto('https://nagpur.egovmars.in/RTSservices/');
    
    // Measure homepage load
    await perfMonitor.measureAction('homepage_load', async () => {
      await page.waitForLoadState('networkidle');
    });

    // Navigate to birth certificate
    await perfMonitor.measureAction('navigate_birth_cert', async () => {
      const birthLink = await selfHeal.findElement({
        text: 'Birth Certificate',
        css: 'a[href*="birth"]'
      });
      await birthLink.click();
    });

    // Fill application form
    await perfMonitor.measureAction('fill_form', async () => {
      const fields = [
        { selector: { id: 'applicantName' }, value: 'Test User' },
        { selector: { id: 'childName' }, value: 'Test Child' },
        { selector: { id: 'email' }, value: 'test@example.com' },
        { selector: { id: 'phoneNo' }, value: '9876543210' },
        { selector: { id: 'dateOfBirth' }, value: '2025-01-01' }
      ];

      for (const field of fields) {
        const element = await selfHeal.findElement(field.selector);
        await element.fill(field.value);
      }
    });

    // Submit and capture network
    let applicationNumber;
    await perfMonitor.measureAction('submit_application', async () => {
      const submitBtn = await selfHeal.findElement({
        text: 'Submit',
        css: 'button[type="submit"]'
      });
      
      // Intercept response to get application number
      await networkMonitor.interceptAndModify('**/saveBirthApplication', async (body) => {
        applicationNumber = body.result;
        return body;
      });
      
      await submitBtn.click();
      await page.waitForLoadState('networkidle');
    });

    // Proceed to payment
    await perfMonitor.measureAction('payment_flow', async () => {
      const paymentLink = await selfHeal.findElement({
        text: 'Make Payment',
        css: 'a[href*="payment"]'
      });
      await paymentLink.click();
      
      await page.waitForURL(/payment/);
    });

    // Generate comprehensive report
    const report = {
      journey: 'Birth Certificate Application',
      applicationNumber,
      healing: selfHeal.getHealingMetrics(),
      network: networkMonitor.getMetrics(),
      performance: perfMonitor.getPerformanceReport(),
      timestamp: new Date().toISOString()
    };

    console.log('Comprehensive Flow Report:', JSON.stringify(report, null, 2));
    
    // Assertions
    expect(report.healing.healingRate).toBeDefined();
    expect(report.network.successfulCalls).toBeGreaterThan(0);
    expect(parseFloat(report.performance.summary.avgPageLoadTime)).toBeLessThan(3000);
  });
});