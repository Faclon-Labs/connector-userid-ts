import DataAccess from '../connectors/DataAccess.js';

async function testGetDp() {
    try {
        const dataAccess = new DataAccess({
            userId: '645a159222722a319ca5f5ad',
            dataUrl: 'datads.iosense.io',
            dsUrl: 'ds-server.iosense.io',
        });

        const result = await dataAccess.getDp({
            deviceId: 'DS_TEST_DATA_POSTING',
            sensorList: null,
            n: 2,
            endTime: 1717180320000,
            cal: true,
            alias: true,
            unix: false,
        });

        console.log('Data Points:', JSON.stringify(result, null, 2));
    } catch (error) {
        console.error('Error:', error);
    }
}

testGetDp(); 