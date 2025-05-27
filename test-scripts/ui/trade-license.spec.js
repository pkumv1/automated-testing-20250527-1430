const { test, expect } = require('@playwright/test');
const { SelfHealingTest } = require('../self-healing/SelfHealingTest');

test.describe('Trade License - Critical Path', () => {
  let selfHeal;

  test.beforeEach(async ({ page }) => {
    selfHeal = new SelfHealingTest(page);
    await page.goto('https://nagpur.egovmars.in/RTSservices/');
  });

  test('New trade license application', async ({ page }) => {
    const tradeLink = await selfHeal.findElement({
      text: 'Trade License',
      contains: 'Trade',
      css: 'a[href*="trade"]',
      xpath: '//a[contains(@href, "trade")]'
    });
    await tradeLink.click();

    const newLicenseLink = await selfHeal.findElement({
      text: 'New License',
      contains: 'New',
      css: 'a[href*="newtrade"]'
    });
    await newLicenseLink.click();

    // Business details
    const businessNameField = await selfHeal.findElement({
      id: 'businessName',
      name: 'businessName',
      label: 'Business Name',
      nearText: 'Business Name'
    });
    await businessNameField.fill('Test Business Pvt Ltd');

    const tradeTypeSelect = await selfHeal.findElement({
      id: 'tradeType',
      name: 'tradeType',
      label: 'Trade Type',
      css: 'select[name="tradeType"]'
    });
    await tradeTypeSelect.selectOption('Retail');

    // Owner details
    const ownerNameField = await selfHeal.findElement({
      id: 'ownerName',
      name: 'ownerName',
      label: 'Owner Name',
      nearText: 'Owner'
    });
    await ownerNameField.fill('Test Owner');

    const gstField = await selfHeal.findElement({
      id: 'gstNumber',
      name: 'gstNo',
      placeholder: 'GST Number',
      css: 'input[name*="gst"]'
    });
    await gstField.fill('29ABCDE1234F1Z5');

    const submitBtn = await selfHeal.findElement({
      text: 'Submit Application',
      css: 'button[type="submit"]',
      class: 'btn-primary',
      contains: 'Submit'
    });
    await submitBtn.click();

    await expect(page.locator('.success-message')).toBeVisible();
  });
});