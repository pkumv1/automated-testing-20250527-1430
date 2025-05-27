const { test, expect } = require('@playwright/test');
const { SelfHealingAPI } = require('../self-healing/SelfHealingAPI');

test.describe('Birth Certificate API Tests', () => {
  let api;
  const baseURL = 'https://nagpur.egovmars.in/RTSservices';

  test.beforeAll(async () => {
    api = new SelfHealingAPI(baseURL);
    await api.discoverEndpoints();
  });

  test('POST /saveBirthApplication - Valid submission', async ({ request }) => {
    const payload = {
      applicantName: 'Test User',
      applicantFatherName: 'Father Name',
      applicantSurname: 'Surname',
      applicantFullName: 'Test User Father Name Surname',
      applicantAreaName: 'Test Area',
      cityName: 'Nagpur',
      applicantPinCode: 440001,
      applicantPlotNo: '123',
      applicantRelationship: 'Father',
      applicantTitle: 'Mr',
      email: 'test@example.com',
      address: 'Test Address',
      phoneNo: 9876543210,
      zone: 1,
      childName: 'Test Child',
      dateOfBirth: '2025-01-01',
      certificateExpectedInDays: 7,
      gender: 'Male',
      placeofbirth: 'Hospital',
      hospitalName: 'Test Hospital',
      reasonForCertificate: 'School Admission',
      feesApplicable: 50,
      noOfCertificateCopies: 1,
      fatherName: 'Father Name',
      motherName: 'Mother Name',
      userMobileNumber: 9876543210,
      checkChildName: 'YES',
      hospitalCertificatePdf: 'base64_encoded_pdf_content',
      fatherormotherIdProofPdf: 'base64_encoded_pdf_content',
      applicantIdProofPdf: 'base64_encoded_pdf_content'
    };

    const response = await api.testEndpoint({
      method: 'POST',
      url: '/saveBirthApplication',
      data: payload,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('result');
    expect(response.data.responseStatus).toContain('successfully');
  });

  test('GET /getRTSRegistrationform/1 - Get birth form URL', async ({ request }) => {
    const response = await api.testEndpoint({
      method: 'POST',
      url: '/getRTSRegistrationform/1'
    });

    expect(response.status).toBe(200);
    expect(response.data).toContain('newRTIBirthApplication.do');
  });

  test('API Healing Statistics', async () => {
    const stats = api.getHealingStats();
    console.log('API Healing Stats:', stats);
    expect(stats.healingRate).toBeDefined();
  });
});