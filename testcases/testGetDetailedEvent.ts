import EventsHandler from '../connectors/EventsHandler.js';
import DataAccess from '../connectors/DataAccess.js';

async function testGetDetailedEvent() {
    try {


        const eventsHandler = new EventsHandler({
            userId: '63d9138194015538294b6cb4',
            dataUrl: 'datads.iosense.io',
            onPrem: false,
            tz: 'UTC'
        });

        // First get event categories
        console.log('\nGetting event categories...');
        const categories = await eventsHandler.getEventCategories();
        console.log('Event Categories:', JSON.stringify(categories, null, 2));

        // Test with event tags from categories
        console.log('\nGetting detailed events...');
        const result = await eventsHandler.getDetailedEvent({
            eventTagsList: ["64030b81130b12e44089c4ab"], // Use first 2 categories
            startTime: '2025-03-01 07:00:00',
            
            endTime: '2025-03-30 07:00:00'
        });
        
        console.log('Detailed Events:', JSON.stringify(result, null, 2));
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
testGetDetailedEvent(); 