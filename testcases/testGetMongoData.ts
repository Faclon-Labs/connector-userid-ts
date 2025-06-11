import EventsHandler from '../connectors/EventsHandler.js';
import DataAccess from '../connectors/DataAccess.js';

async function testGetMongoData() {
    try {
        // First verify the device exists
        const dataAccess = new DataAccess({
            userId: '6710eea3340f9be7ffa61634',
            dataUrl: 'datads.iosense.io',
            dsUrl: 'ds-server.iosense.io'
        });

        console.log('Verifying device exists...');
        const devices = await dataAccess.getDeviceDetails();
        console.log('Available devices:', JSON.stringify(devices, null, 2));

        const eventsHandler = new EventsHandler({
            userId: '6710eea3340f9be7ffa61634',
            dataUrl: 'datads.iosense.io',
            onPrem: false,
            tz: 'UTC'
        });

        // Get device metadata first
        console.log('\nGetting device metadata...');
        const deviceMetadata = await eventsHandler.getDeviceMetadata('HHPLOEE_C2_T_Timeline_E');
        console.log('Device Metadata:', JSON.stringify(deviceMetadata, null, 2));

        // Using the provided time range
        console.log('\nGetting MongoDB data...');
        const result = await eventsHandler.getMongoData({
            devID: 'HHPLOEE_C2_T_Timeline_E',
            limit: 4,
            startTime: '2025-03-01 07:00:00',
            endTime: '2025-03-30 07:00:00'
        });

        console.log('MongoDB Data:', JSON.stringify(result, null, 2));
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
testGetMongoData(); 