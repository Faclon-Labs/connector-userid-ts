import EventsHandler from '../connectors/EventsHandler.js';

// Example usage of EventsHandler
async function exampleUsage() {
  // Initialize EventsHandler
  const eventsHandler = new EventsHandler({
    userId: '6710eea3340f9be7ffa61634',
    dataUrl: 'datads.iosense.io',
    onPrem: false,
    tz: 'UTC',
    logTime: true
  });

  try {
    console.log('=== EventsHandler Test Suite ===\n');

    // Example 1: Get event categories
    console.log('1. Fetching event categories...');
    const categories = await eventsHandler.getEventCategories();
    console.log('Event categories:', categories);
    console.log(`Found ${categories.length} event categories\n`);

    // Example 2: Publish an event (only if categories exist)
    if (categories.length > 0) {
      console.log('2. Publishing an event using existing category...');
      const firstCategory = categories[0];
      // const publishResult = await eventsHandler.publishEvent({
      //   message: 'Test event from TypeScript SDK',
      //   metaData: JSON.stringify({ test: true, timestamp: new Date().toISOString() }),
      //   hoverData: 'This is a test event published from the TypeScript EventsHandler.',
      //   title: 'Test Event',
      //   eventNamesList: [firstCategory.name], // Use existing category
      //   createdOn: new Date().toISOString()
      // });
      // console.log('Event published:', publishResult);
    } else {
      console.log('2. Skipping event publishing - no event categories available');
      console.log('   You can create event categories in your IoSense dashboard first\n');
    }

    // Example 3: Get events in a time slot
    console.log('3. Fetching events in time slot (last 24 hours)...');
    const startTime = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours ago
    const endTime = new Date(); // Now
    const events = await eventsHandler.getEventsInTimeslot({
      startTime,
      endTime
    });
    console.log(`Found ${events.length} events in the last 24 hours`);
    if (events.length > 0) {
      console.log('Latest event:', events[0]);
    }
    console.log('');

    // Example 4: Get event data count
    console.log('4. Fetching event data count (last 5 events)...');
    const eventCount = await eventsHandler.getEventDataCount({
      count: 5,
      endTime: new Date()
    });
    console.log(`Retrieved ${eventCount.length} recent events`);
    if (eventCount.length > 0) {
      console.log('Most recent event:', eventCount[0]);
    }
    console.log('');

    // Example 5: Get detailed events
    console.log('5. Fetching detailed events (last 7 days)...');
    const detailedEvents = await eventsHandler.getDetailedEvent({
      startTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      endTime: new Date()
    });
    console.log(`Retrieved ${detailedEvents.length} detailed events from last 7 days`);
    if (detailedEvents.length > 0) {
      console.log('Sample detailed event:', detailedEvents[0]);
    }
    console.log('');

    // Example 6: Get device metadata (using a sample device ID)
    console.log('6. Fetching device metadata...');
    try {
      const deviceMetadata = await eventsHandler.getDeviceMetadata('PTH_1009'); // Using existing device from other tests
      console.log('Device metadata keys:', Object.keys(deviceMetadata));
      if (deviceMetadata._id) {
        console.log('Device found:', deviceMetadata._id);
      }
    } catch (error: any) {
      console.log('Device metadata fetch failed (device may not exist):', error.message);
    }

    // NEW: Example 7: Get MongoDB Data - Various Test Cases
    console.log('\n=== MongoDB Data Test Cases ===');
    
    // Test Case 7: Basic getMongoData test
    console.log('7. Testing getMongoData...');
    try {
      const mongoData = await eventsHandler.getMongoData({
        devID: "Planwise_Production_01",
        limit: 5
      });
      console.log(`✓ getMongoData test: Retrieved ${mongoData.length} records`);
      if (mongoData.length > 0) {
        console.log('Sample record:', mongoData[0]);
      }
    } catch (error: any) {
      console.log('✗ getMongoData test failed:', error.message);
    }

    console.log('\n=== MongoDB Data Tests Completed ===');
    console.log('\n=== EventsHandler Test Suite Completed ===');

  } catch (error) {
    console.error('Error in example usage:', error);
  }
}

// Run the example
exampleUsage(); 