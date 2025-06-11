import DataAccess from '../connectors/DataAccess.js';

async function testGetFirstDp() {
    try {
        const dataAccess = new DataAccess({
            userId: '645a159222722a319ca5f5ad',
            dataUrl: 'datads.iosense.io',
            dsUrl: 'ds-server.iosense.io',
        });

        const result = await dataAccess.getFirstDp({
            deviceId: 'UT2312EM_A2',
            sensorList:["D5","D13"],
            n: 1,
            startTime: 1687344669000,
            cal: true,
            alias: false,
            unix: false,
            onPrem: null, 
        });

        console.log('First Data Points:', JSON.stringify(result, null, 2));
    } catch (error) {
        console.error('Error:', error);
    }
}

// Run the test
testGetFirstDp(); 