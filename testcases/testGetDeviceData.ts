import EventsHandler from '../connectors/EventsHandler.js';

async function testGetDeviceData() {
  try {
    // Initialize EventsHandler
    const eventsHandler = new EventsHandler({
      userId: '64807e6560fc9faa38fc3236',
      dataUrl: 'datads.iosense.io',
      onPrem: false,
      tz: 'Asia/Kolkata'
    });

    // Get device data with specified parameters
    const result = await eventsHandler.getDeviceData({
      devices:["HHPLOEE_B3_T_Timeline_E", "HHPLOEE_C2_T_Timeline_E"],  // Specify device IDs here
      n: 2,                   // Number of records to fetch
      startTime: "2025-01-27 07:00:00",  // Start time
      endTime: "2025-01-28 06:59:59"     // End time
    });

    console.log('Device Data:', JSON.stringify(result, null, 2));

  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the test
testGetDeviceData();
