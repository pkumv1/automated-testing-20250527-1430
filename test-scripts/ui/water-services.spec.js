const { test, expect } = require('@playwright/test');
const { SelfHealingTest } = require('../self-healing/SelfHealingTest');

test.describe('Water Services - Critical Path', () => {
  let selfHeal;

  test.beforeEach(async ({ page }) => {
    selfHeal = new SelfHealingTest(page);
    await page.goto('https://nagpur.egovmars.in/RTSservices/');
  });

  test('New water connection application', async ({ page }) => {
    const waterLink = await selfHeal.findElement({
      text: 'Water Services',
      contains: 'Water',
      css: 'a[href*="water"]',
      xpath: '//a[contains(text(), "Water")]'
    });
    await waterLink.click();

    const newConnectionLink = await selfHeal.findElement({
      text: 'New Connection',
      contains: 'New',
      css: 'a[href*="newwater"]'
    });
    await newConnectionLink.click();

    // Fill application form
    const nameField = await selfHeal.findElement({
      id: 'applicantName',
      name: 'applicantName',
      label: 'Applicant Name',
      nearText: 'Name'
    });
    await nameField.fill('Test Water User');

    const addressField = await selfHeal.findElement({
      id: 'address',
      name: 'address',
      label: 'Address',
      css: 'textarea[name="address"]'
    });
    await addressField.fill('123 Test Street, Nagpur');

    const purposeSelect = await selfHeal.findElement({
      id: 'connectionPurpose',
      name: 'purpose',
      label: 'Purpose',
      css: 'select[name*="purpose"]'
    });
    await purposeSelect.selectOption('Domestic');

    const submitBtn = await selfHeal.findElement({
      text: 'Submit Application',
      css: 'button[type="submit"]',
      contains: 'Submit'
    });
    await submitBtn.click();

    await expect(page).toHaveURL(/success|confirmation/);
  });

  test('Water disconnection request', async ({ page }) => {
    const waterLink = await selfHeal.findElement({
      text: 'Water Services',
      contains: 'Water',
      css: 'a[href*="water"]'
    });
    await waterLink.click();

    const disconnectionLink = await selfHeal.findElement({
      text: 'Disconnection',
      contains: 'Disconnect',
      css: 'a[href*="disconnect"]'
    });
    await disconnectionLink.click();

    const connectionNoField = await selfHeal.findElement({
      id: 'connectionNumber',
      name: 'connectionNo',
      placeholder: 'Connection Number',
      nearText: 'Connection'
    });
    await connectionNoField.fill('WC/2025/12345');

    const reasonField = await selfHeal.findElement({
      id: 'reason',
      name: 'reason',
      label: 'Reason',
      css: 'textarea[name="reason"]'
    });
    await reasonField.fill('Property sale');

    const submitBtn = await selfHeal.findElement({
      text: 'Submit Request',
      css: 'button[type="submit"]',
      contains: 'Submit'
    });
    await submitBtn.click();

    console.log('Healing Metrics:', selfHeal.getHealingMetrics());
  });
});