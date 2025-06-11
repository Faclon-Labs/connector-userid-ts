import EventsHandler from '../connectors/EventsHandler.js';
import DataAccess from '../connectors/DataAccess.js';

async function testGetSensorRows() {
    try {
        // First get list of available devices
        const dataAccess = new DataAccess({
            userId: '6710eea3340f9be7ffa61634',
            dataUrl: 'datads.iosense.io',
            dsUrl: 'ds-server.iosense.io'
        });

        console.log('Getting list of available devices...');
        const devices = await dataAccess.getDeviceDetails();
        console.log('Available devices:', JSON.stringify(devices, null, 2));

        const eventsHandler = new EventsHandler({
            userId: '6710eea3340f9be7ffa61634',
            dataUrl: 'datads.iosense.io',
            onPrem: false,
            tz: 'UTC'
        });

        // Test with a known device ID and sensor
        console.log('\nGetting sensor rows...');
        const result = await eventsHandler.getSensorRows({
            deviceId: 'HHPLOEE_C2_T_Timeline_E',
            sensor: 'D2',  // Status sensor
            startTime: '2025-03-01 07:00:00',
            endTime: '2025-03-30 07:00:00',
            alias: true
        });
        
        console.log('Sensor Rows:', JSON.stringify(result, null, 2));
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