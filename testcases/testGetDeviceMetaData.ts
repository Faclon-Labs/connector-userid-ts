import DataAccess from '../connectors/DataAccess.js';

async function testGetDeviceMetaData() {
    try {
        const dataAccess = new DataAccess({
            userId: '645a159222722a319ca5f5ad',
            dataUrl: 'datads.iosense.io',
            dsUrl: 'ds-server.iosense.io',
        });

        // Using DS_TEST_DATA_POSTING as it was visible in the device details
        const result = await dataAccess.getDeviceMetaData('DS_TEST_DATA_POSTING');
        console.log('Device Metadata:', JSON.stringify(result, null, 2));
    } catch (error) {
        console.error('Error:', error);
    }
}

// Run the test
testGetDeviceMetaData(); 