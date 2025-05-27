const { test, expect } = require('@playwright/test');
const { SelfHealingAPI } = require('../self-healing/SelfHealingAPI');

test.describe('Water Services API Tests', () => {
  let api;
  const baseURL = 'https://nagpur.egovmars.in/RTSservices';

  test.beforeAll(async () => {
    api = new SelfHealingAPI(baseURL);
  });

  test('POST /saveNewWaterConnection', async () => {
    const payload = {
      applicantName: 'Test User',
      applicantFullName: 'Test User Kumar',
      applicantAreaName: 'Test Area',
      cityName: 'Nagpur',
      applicantPinCode: 440001,
      applicantPlotNo: '456',
      applicantTitle: 'Mr',
      email: 'water@example.com',
      address: 'Water Test Address',
      phoneNo: 9876543211,
      zone: 2,
      purposeOfConnection: 'Domestic',
      proposedTapSize: '15mm',
      proposedCategory: 'Residential',
      buildingType: 'Individual House',
      noOfFloors: 2,
      userMobileNumber: 9876543211,
      feesApplicable: 1500,
      propertyOwnershipProofPdf: 'base64_pdf_content',
      applicantIdProofPdf: 'base64_pdf_content'
    };

    const response = await api.testEndpoint({
      method: 'POST',
      url: '/saveNewWaterConnection',
      data: payload,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('result');
    expect(response.data.responseStatus).toContain('successfully');
  });

  test('POST /saveWaterDisconnection', async () => {
    const payload = {
      connectionNumber: 'WC/2025/12345',
      applicantName: 'Test User',
      reason: 'Property Sale',
      disconnectionDate: '2025-06-01',
      email: 'disconnect@example.com',
      phoneNo: 9876543212,
      userMobileNumber: 9876543212,
      lastBillPaidReceiptPdf: 'base64_pdf_content',
      propertyOwnershipProofPdf: 'base64_pdf_content'
    };

    const response = await api.testEndpoint({
      method: 'POST',
      url: '/saveWaterDisconnection',
      data: payload
    });

    expect(response.status).toBe(200);
  });

  test('POST /saveWaterQualityComplaint', async () => {
    const payload = {
      complainantName: 'Test Complainant',
      connectionNumber: 'WC/2025/12346',
      complaintType: 'Contaminated Water',
      complaintDescription: 'Water has bad smell and color',
      address: 'Complaint Address',
      zone: 3,
      email: 'complaint@example.com',
      phoneNo: 9876543213,
      userMobileNumber: 9876543213
    };

    const response = await api.testEndpoint({
      method: 'POST',
      url: '/saveWaterQualityComplaint',
      data: payload
    });

    expect(response.status).toBe(200);
    console.log('Water API Healing:', api.getHealingStats());
  });
});