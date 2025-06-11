import EventsHandler from '../connectors/EventsHandler.js';

async function testGetMaintenanceModuleData() {
    try {
        const eventsHandler = new EventsHandler({
            userId: '64807e6560fc9faa38fc3236',
            dataUrl: 'datads.iosense.io',
            onPrem: false,
            tz: 'UTC'
        });

        console.log('\nGetting maintenance module data...');
        const result = await eventsHandler.getMaintenanceModuleData({
            startTime: 1735669800000,
            endTime: 1737829800000,
            operator: 'activeDuration',
            periodicity: 'day',
            dataPrecision: 1,
            remarkGroup: ['65145a2193d952b0647c010e'],
            eventId: ['651427e73750210f67f06a17'],
            maintenanceModuleId: '677e4316bc3ef30aec6ed933',
           
        });
        
        console.log('Maintenance Module Data:', JSON.stringify(result, null, 2));
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
testGetMaintenanceModuleData(); 