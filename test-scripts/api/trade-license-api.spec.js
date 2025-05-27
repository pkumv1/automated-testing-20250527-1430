const { test, expect } = require('@playwright/test');
const { SelfHealingAPI } = require('../self-healing/SelfHealingAPI');

test.describe('Trade License API Tests', () => {
  let api;
  const baseURL = 'https://nagpur.egovmars.in/RTSservices';

  test.beforeAll(async () => {
    api = new SelfHealingAPI(baseURL);
  });

  test('POST /saveTradeLicenseNew', async () => {
    const payload = {
      businessName: 'Test Business Pvt Ltd',
      businessType: 'Retail',
      ownerName: 'Test Owner',
      ownerTitle: 'Mr',
      ownerFullName: 'Test Owner Kumar',
      businessAddress: 'Shop No 123, Market Area',
      cityName: 'Nagpur',
      pinCode: 440002,
      zone: 3,
      gstNumber: '29ABCDE1234F1Z5',
      panNumber: 'ABCDE1234F',
      email: 'business@example.com',
      phoneNo: 9876543214,
      userMobileNumber: 9876543214,
      numberOfEmployees: 5,
      businessSquareFeet: 500,
      feesApplicable: 2500,
      tradeType: 'Shop',
      ownerIdProofPdf: 'base64_pdf_content',
      businessRegistrationPdf: 'base64_pdf_content',
      rentAgreementPdf: 'base64_pdf_content'
    };

    const response = await api.testEndpoint({
      method: 'POST',
      url: '/saveTradeLicenseNew',
      data: payload
    });

    expect(response.status).toBe(200);
    expect(response.data.result).toMatch(/RTS\/TD/);
  });

  test('POST /saveTradeLicenseRenewal', async () => {
    const payload = {
      licenseNumber: 'TL/2024/54321',
      businessName: 'Test Business Pvt Ltd',
      renewalYear: '2025',
      email: 'renewal@example.com',
      phoneNo: 9876543215,
      userMobileNumber: 9876543215,
      feesApplicable: 1500,
      previousLicensePdf: 'base64_pdf_content',
      lastYearTaxReceiptPdf: 'base64_pdf_content'
    };

    const response = await api.testEndpoint({
      method: 'POST',
      url: '/saveTradeLicenseRenewal',
      data: payload
    });

    expect(response.status).toBe(200);
  });
});