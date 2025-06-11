import EventsHandler from '../connectors/EventsHandler.js';

async function testGetEventsInTimeslot() {
    try {
        const eventsHandler = new EventsHandler({
            userId: '63d9138194015538294b6cb4',
            dataUrl: 'datads.iosense.io',
            onPrem: false,
            tz: 'UTC'
        });

        console.log('\nGetting events in timeslot...');
        const result = await eventsHandler.getEventsInTimeslot({
            startTime: "2023-06-14 00:00:00",
            endTime: new Date()
        });
        
        console.log('Events in Timeslot:', JSON.stringify(result, null, 2));
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
testGetEventsInTimeslot(); 