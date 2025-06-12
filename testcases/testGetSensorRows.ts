import EventsHandler from '../connectors/EventsHandler.js';

async function testGetSensorRows() {
    try {
        const eventsHandler = new EventsHandler({
            userId: '6710eea3340f9be7ffa61634',
            dataUrl: 'datads.iosense.io',
            onPrem: false,
            tz: 'UTC'
        });

        // Test with a known device ID and sensor
        console.log('\nGetting sensor rows...');
        const result = await eventsHandler.getSensorRows({
            deviceId: 'PHEXT_L1_Timeline',
            sensor: 'D4',  // Status sensor
            value: '220044',    // Add the expected sensor value

            alias: true
        });
        
        console.log('Sensor Rows:', JSON.stringify(result, null, 2));
        console.log('Number of records:', result.length);
        
    } catch (error: any) {
        console.error('\nError Details:');
        console.error('Message:', error.message);
        if (error.response) {
            console.error('Response Status:', error.response.status);
            console.error('Response Data:', JSON.stringify(error.response.data, null, 2));
            console.error('Response Headers:', JSON.stringify(error.response.headers, null, 2));
        }
        if (error.request) {
            console.error('Request:', error.request);
        }
    }
}

// Run the test
testGetSensorRows();