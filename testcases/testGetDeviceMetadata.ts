import EventsHandler from '../connectors/EventsHandler.js';

async function testGetDeviceMetadata() {
    try {
        const eventsHandler = new EventsHandler({
            userId: '63d9138194015538294b6cb4',
            dataUrl: 'datads.iosense.io',
            onPrem: false,
            tz: 'UTC'
        });

        // Specify the device ID you want to get metadata for
        const deviceId = 'PPAPEM_G8';  // Using a device ID from previous examples

        console.log('\nGetting device metadata for device:', deviceId);
        const metadata = await eventsHandler.getDeviceMetadata(deviceId);
        
        console.log('Device Metadata:', JSON.stringify(metadata, null, 2));
    } catch (error: any) {
        console.error('\nError Details:');
        console.error('Message:', error.message);
        if (error.response) {
            console.error('Response Status:', error.response.status);
            console.error('Response Data:', JSON.stringify(error.response.data, null, 2));
        }
    }
}

// Run the test
testGetDeviceMetadata(); 