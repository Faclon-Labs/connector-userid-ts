import DataAccess from '../connectors/DataAccess.js';

async function testGetDeviceDetails() {
    try {
        const dataAccess = new DataAccess({
            userId: '645a159222722a319ca5f5ad',
            dataUrl: 'datads.iosense.io',
            dsUrl: 'ds-server.iosense.io',
        });

        const result = await dataAccess.getDeviceDetails();
        console.log('Device Details:', JSON.stringify(result, null, 2));
    } catch (error) {
        console.error('Error:', error);
    }
}

// Run the test
testGetDeviceDetails(); 