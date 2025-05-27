const { test, expect } = require('@playwright/test');
const { SelfHealingTest } = require('../self-healing/SelfHealingTest');

test.describe('Payment Flow - Critical Path', () => {
  let selfHeal;

  test.beforeEach(async ({ page }) => {
    selfHeal = new SelfHealingTest(page);
  });

  test('Payment gateway integration', async ({ page }) => {
    await page.goto('https://nagpur.egovmars.in/RTSservices/payment/initiate');

    const amountField = await selfHeal.findElement({
      id: 'paymentAmount',
      name: 'amount',
      label: 'Amount',
      css: 'input[type="number"]',
      nearText: 'Amount'
    });
    await amountField.fill('500');

    const applicationNoField = await selfHeal.findElement({
      id: 'applicationNumber',
      name: 'appNo',
      placeholder: 'Application Number',
      nearText: 'Application'
    });
    await applicationNoField.fill('RTS/HD/2025/12345');

    const emailField = await selfHeal.findElement({
      id: 'email',
      name: 'email',
      type: 'email',
      css: 'input[type="email"]'
    });
    await emailField.fill('test@example.com');

    const phoneField = await selfHeal.findElement({
      id: 'phone',
      name: 'phone',
      type: 'tel',
      css: 'input[type="tel"]',
      nearText: 'Phone'
    });
    await phoneField.fill('9876543210');

    const proceedBtn = await selfHeal.findElement({
      text: 'Proceed to Pay',
      css: 'button[type="submit"]',
      contains: 'Proceed',
      class: 'payment-btn'
    });
    await proceedBtn.click();

    // Should redirect to payment gateway
    await expect(page).toHaveURL(/easebuzz|payment/);
    
    console.log('Payment Flow Healing:', selfHeal.getHealingMetrics());
  });
});