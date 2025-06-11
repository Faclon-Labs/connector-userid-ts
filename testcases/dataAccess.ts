/**
 * Test file for DataAccess TypeScript implementation
 */

import DataAccess from "../connectors/DataAccess.js";

console.log('IO Connect SDK - TypeScript Test Mode');
console.log('------------------------------------');

// Test configuration
const dataAccess = new DataAccess({
  userId: '645a159222722a319ca5f5ad',
  dataUrl: 'datads.iosense.io',
  dsUrl: 'ds-server.iosense.io',
  onPrem: false,
  tz: 'UTC'
});

// Test functions
async function runTests() {
  try {
    console.log('\n=== Testing getUserInfo ===');
    const userInfo = await dataAccess.getUserInfo(false);
    console.log('USER INFO:', JSON.stringify(userInfo, null, 2));

    console.log('\n=== Testing getDeviceDetails ===');
    const deviceDetails = await dataAccess.getDeviceDetails(false);
    console.log('DEVICE DETAILS (first 3):', JSON.stringify(Array.isArray(deviceDetails) ? deviceDetails.slice(0, 3) : deviceDetails, null, 2));

    console.log('\n=== Testing getDeviceMetaData ===');
    const deviceMetaData = await dataAccess.getDeviceMetaData("PTH_1009", false);
    console.log('DEVICE META DATA (sensors only):');
    if (deviceMetaData && typeof deviceMetaData === 'object' && 'sensors' in deviceMetaData) {
      console.log('Sensors:', JSON.stringify((deviceMetaData as any).sensors, null, 2));
    }

    console.log('\n=== Testing ALIAS functionality ===');
    console.log('--- Without Alias ---');
    const dataWithoutAlias = await dataAccess.getFirstDp({
      deviceId: 'PTH_1009',
      startTime: '2023-05-09T09:42:42.189Z',
      alias: false, // No aliases
      n: 1
    });
    console.log('WITHOUT ALIAS:', JSON.stringify(dataWithoutAlias, null, 2));

    console.log('--- With Alias ---');
    const dataWithAlias = await dataAccess.getFirstDp({
      deviceId: 'PTH_1009',
      startTime: '2023-05-09T09:42:42.189Z',
      alias: true, // Enable aliases
      n: 1
    });
    console.log('WITH ALIAS:', JSON.stringify(dataWithAlias, null, 2));

    console.log('\n=== Testing CALIBRATION functionality ===');
    console.log('--- Without Calibration ---');
    const dataWithoutCal = await dataAccess.getFirstDp({
      deviceId: 'PTH_1009',
      startTime: '2023-05-09T09:42:42.189Z',
      cal: false, // No calibration
      n: 1
    });
    console.log('WITHOUT CALIBRATION:', JSON.stringify(dataWithoutCal, null, 2));

    console.log('--- With Calibration ---');
    const dataWithCal = await dataAccess.getFirstDp({
      deviceId: 'PTH_1009',
      startTime: '2023-05-09T09:42:42.189Z',
      cal: true, // Enable calibration
      n: 1
    });
    console.log('WITH CALIBRATION:', JSON.stringify(dataWithCal, null, 2));

    console.log('\n=== Testing getDp ===');
    const dpData = await dataAccess.getDp({
      deviceId: 'PTH_1009',
      sensorList: ['PT1', 'PT2'],
      n: 5,
      endTime: new Date().toISOString()
    });
    console.log('DP DATA:', JSON.stringify(dpData, null, 2));

    console.log('\n=== Testing dataQuery ===');
    const queryData = await dataAccess.dataQuery({
      deviceId: 'APREM_B3',
      sensorList: null,
      startTime: '2025-05-25T09:42:42.189Z',
      endTime: new Date().toISOString(),
      cal: true,
      unix: false,
      alias: true
    });
    console.log('DATA QUERY RESULT:', JSON.stringify(queryData.slice(0, 5), null, 2)); // Show first 5 results

  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run tests
runTests();