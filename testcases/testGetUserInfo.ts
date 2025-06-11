import DataAccess from '../connectors/DataAccess.js';

async function testGetUserInfo() {
    try {
        const dataAccess = new DataAccess({
            userId: '645a159222722a319ca5f5ad',
            dataUrl: 'datads.iosense.io',
            dsUrl: 'ds-server.iosense.io',
        });

        const result = await dataAccess.getUserInfo();
        console.log('User Info:', JSON.stringify(result, null, 2));
    } catch (error) {
        console.error('Error:', error);
    }
}

// Run the test
testGetUserInfo(); 