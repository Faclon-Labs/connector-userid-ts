import EventsHandler from '../connectors/EventsHandler.js';

async function testGetEventDataCount() {
    try {
        const eventsHandler = new EventsHandler({
            userId: '63d9138194015538294b6cb4',
            dataUrl: 'datads.iosense.io',
            onPrem: false,
            tz: 'UTC'
        });

        console.log('\nGetting event data count...');
        const result = await eventsHandler.getEventDataCount({
            count: 1,  // Get last 5 events
            endTime: "2023-06-14 12:00:00"  // Use current time as end time
        });
        
        console.log('Event Data Count:', JSON.stringify(result, null, 2));
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
testGetEventDataCount(); 