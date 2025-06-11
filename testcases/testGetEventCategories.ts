
import EventsHandler from '../connectors/EventsHandler.js';

async function testGetEventCategories() {
    try {
        const eventsHandler = new EventsHandler({
            userId: '63d9138194015538294b6cb4',
            dataUrl: 'datads.iosense.io',
            onPrem: false,
            tz: 'UTC'
        });

        console.log('\nGetting event categories...');
        const categories = await eventsHandler.getEventCategories();
        console.log('Event Categories:', JSON.stringify(categories, null, 2));
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
testGetEventCategories(); 