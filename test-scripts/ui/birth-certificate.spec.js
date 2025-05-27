const { test, expect } = require('@playwright/test');
const { SelfHealingTest } = require('../self-healing/SelfHealingTest');

test.describe('Birth Certificate - Critical Path', () => {
  let selfHeal;

  test.beforeEach(async ({ page }) => {
    selfHeal = new SelfHealingTest(page);
    await page.goto('https://nagpur.egovmars.in/RTSservices/');
  });

  test('Submit birth certificate application', async ({ page }) => {
    // Navigate to birth certificate form with self-healing
    const birthLink = await selfHeal.findElement({
      text: 'Birth Certificate',
      contains: 'Birth',
      css: 'a[href*="birth"]',
      xpath: '//a[contains(text(), "Birth")]'
    });
    await birthLink.click();

    // Fill form with self-healing selectors
    const nameField = await selfHeal.findElement({
      id: 'applicantName',
      name: 'applicantName',
      label: 'Applicant Name',
      css: 'input[name="applicantName"]'
    });
    await nameField.fill('Test User');

    const childNameField = await selfHeal.findElement({
      id: 'childName',
      name: 'childName',
      label: 'Child Name',
      nearText: 'Child Name'
    });
    await childNameField.fill('Test Child');

    // Select place of birth
    const hospitalRadio = await selfHeal.findElement({
      id: 'placeHospital',
      css: 'input[value="Hospital"]',
      nearText: 'Hospital',
      xpath: '//input[@type="radio" and @value="Hospital"]'
    });
    await hospitalRadio.click();

    // Submit form
    const submitBtn = await selfHeal.findElement({
      text: 'Submit',
      css: 'button[type="submit"]',
      contains: 'Submit',
      class: 'btn-primary'
    });
    await submitBtn.click();

    // Verify success
    await expect(page).toHaveURL(/success|confirmation/);
    
    console.log('Healing Metrics:', selfHeal.getHealingMetrics());
  });

  test('Check application status', async ({ page }) => {
    const statusLink = await selfHeal.findElement({
      text: 'Check Status',
      contains: 'Status',
      css: 'a[href*="status"]'
    });
    await statusLink.click();

    const appNoField = await selfHeal.findElement({
      id: 'applicationNumber',
      name: 'appNo',
      placeholder: 'Application Number',
      nearText: 'Application Number'
    });
    await appNoField.fill('RTS/HD/2025/12345');

    const searchBtn = await selfHeal.findElement({
      text: 'Search',
      css: 'button[type="submit"]',
      contains: 'Search'
    });
    await searchBtn.click();

    await expect(page.locator('.status-result')).toBeVisible();
  });
});