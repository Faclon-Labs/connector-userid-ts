import MachineTimeline from '../connectors/MachineTimeline.js';

// Example usage of MachineTimeline with Timezone Support
async function exampleUsage() {
  console.log('=== MachineTimeline Test Suite with Timezone Support ===\n');

  // Test different timezone scenarios
  const timezoneConfigs = [
    { name: 'UTC User', tz: 'UTC' },
    { name: 'IST User', tz: 'Asia/Kolkata' },
    { name: 'US East Coast User', tz: 'America/New_York' },
    { name: 'UK User', tz: 'Europe/London' },
    { name: 'Singapore User', tz: 'Asia/Singapore' }
  ];

  for (const config of timezoneConfigs) {
    console.log(`\n=== Testing with ${config.name} (${config.tz}) ===`);
    
    // Initialize MachineTimeline with different timezone
    const machineTimeline = new MachineTimeline({
      userId: '6710eea3340f9be7ffa61634',
      dataUrl: 'datads.iosense.io',
      onPrem: false,
      tz: config.tz,
      logTime: true
    });

    console.log(`SDK Version: ${machineTimeline.version}`);
    console.log(`User Timezone: ${config.tz}\n`);

    try {
      // Test Case 1: Basic getMongoData test with timezone
      console.log(`1. Testing getMongoData with ${config.name} timezone...`);
      try {
        const mongoData = await machineTimeline.getMongoData({
          devID: "Planwise_Production_01",
          limit: 2 // Limit to reduce output
        });
        console.log(`✓ Basic getMongoData test: Retrieved ${mongoData.length} records`);
      } catch (error: any) {
        console.log('✗ Basic getMongoData test failed:', error.message);
      }

      // Test Case 2: getMongoData with time range filter (timezone conversion)
      console.log(`2. Testing time range query with ${config.name} timezone...`);
      try {
        const userLocalTime = "2025-01-15 10:00:00"; // 10 AM in user's timezone
        const userLocalEndTime = "2025-01-15 18:00:00"; // 6 PM in user's timezone
        
        console.log(`  User input: ${userLocalTime} to ${userLocalEndTime} (${config.tz})`);
        
        const filteredData = await machineTimeline.getMongoData({
          devID: "Planwise_Production_01",
          limit: 5,
          startTime: userLocalTime,  // Will be converted to IST
          endTime: userLocalEndTime   // Will be converted to IST
        });
        console.log(`✓ Time-filtered query: Retrieved ${filteredData.length} records`);
      } catch (error: any) {
        console.log('✗ Time-filtered query failed:', error.message);
      }

      // Test Case 3: createMongoData with timezone conversion
      console.log(`3. Testing data creation with ${config.name} timezone...`);
      try {
        const userLocalTimestamp = "2025-01-16 15:30:00"; // 3:30 PM in user's timezone
        console.log(`  User input timestamp: ${userLocalTimestamp} (${config.tz})`);
        
        const createResult = await machineTimeline.createMongoData({
          data: {
            rows: [
              {
                devID: `Test_${config.name.replace(/\s+/g, '_')}_Device`,
                rawData: true,
                data: {
                  D0: userLocalTimestamp, // Will be converted to IST
                  D1: Date.now(),
                  timezone_test: config.tz,
                  user_type: config.name,
                  temperature: 23.5,
                  status: "testing_timezone"
                }
              }
            ],
            nonIndex: false
          }
        });
        
        console.log(`✓ Data creation test: Success = ${createResult.success}`);
      } catch (error: any) {
        console.log('✗ Data creation test failed:', error.message);
      }

      // Only run comprehensive tests for one timezone to avoid spam
      if (config.tz === 'America/New_York') {
        await runComprehensiveTests(machineTimeline, config.name);
      }

    } catch (error) {
      console.error(`Error testing ${config.name}:`, error);
    }
  }

  console.log('\n=== Timezone Conversion Examples ===');
  await demonstrateTimezoneConversion();
}

async function runComprehensiveTests(machineTimeline: any, configName: string) {
  console.log(`\n=== Comprehensive Tests for ${configName} ===`);

  // Test Case 4: Multiple rows with different timestamps
  console.log('4. Testing multiple rows with timezone conversion...');
  try {
    const baseTime = new Date();
    const rows = [];
    
    // Create 3 test rows with different user-timezone timestamps
    for (let i = 0; i < 3; i++) {
      const timestamp = new Date(baseTime.getTime() + (i * 3600000)); // 1 hour apart
      const timeString = timestamp.toISOString().slice(0, 19).replace('T', ' ');
      
      rows.push({
        devID: "Comprehensive_Test_Device",
        rawData: true,
        data: {
          D0: timeString, // Will be converted from user's timezone to IST
          D1: timestamp.getTime(),
          batch_id: `BATCH_${i + 1}`,
          sequence: i + 1,
          test_timestamp: timeString, // Additional timestamp field
          quality_score: 90 + (i * 2)
        }
      });
    }

    const batchResult = await machineTimeline.createMongoData({
      data: {
        rows: rows,
        nonIndex: false
      }
    });
    
    console.log(`✓ Multiple rows test: Success = ${batchResult.success}`);
    if (batchResult.success) {
      console.log(`Successfully created ${rows.length} rows with timezone conversion`);
    }
  } catch (error: any) {
    console.log('✗ Multiple rows test failed:', error.message);
  }

  // Test Case 5: Edge case - Different date formats
  console.log('5. Testing different timestamp formats...');
  try {
    const formats = [
      "2025-01-16 09:15:30",  // Standard format
      "2025-01-16 23:45:00",  // Late night
      "2025-02-28 12:00:00"   // Different month
    ];

    for (let i = 0; i < formats.length; i++) {
      const formatResult = await machineTimeline.createMongoData({
        data: {
          rows: [
            {
              devID: "Format_Test_Device",
              rawData: true,
              data: {
                D0: formats[i],
                format_test: `format_${i + 1}`,
                original_input: formats[i]
              }
            }
          ],
          nonIndex: false
        }
      });
      
      if (formatResult.success) {
        console.log(`  ✓ Format ${i + 1} (${formats[i]}): Success`);
      } else {
        console.log(`  ✗ Format ${i + 1} (${formats[i]}): Failed`);
      }
    }
  } catch (error: any) {
    console.log('✗ Format testing failed:', error.message);
  }

  // Test Case 6: Query back the created data
  console.log('6. Testing data retrieval with timezone filtering...');
  try {
    const queryStart = "2025-01-16 08:00:00"; // 8 AM in user's timezone
    const queryEnd = "2025-01-17 08:00:00";   // 8 AM next day in user's timezone
    
    const queryResult = await machineTimeline.getMongoData({
      devID: "Comprehensive_Test_Device",
      limit: 10,
      startTime: queryStart,
      endTime: queryEnd
    });
    
    console.log(`✓ Query test: Found ${queryResult.length} records in time range`);
    console.log(`  Query range: ${queryStart} to ${queryEnd} (user timezone)`);
  } catch (error: any) {
    console.log('✗ Query test failed:', error.message);
  }
}

async function demonstrateTimezoneConversion() {
  console.log('');
  console.log('=== How Timezone Conversion Works ===');
  console.log('');
  console.log('1. User Input Time Conversion Examples:');
  console.log('   • User in New York enters: "2025-01-15 14:30:00"');
  console.log('   • System converts to IST:   "2025-01-16 01:00:00" (EST is UTC-5, IST is UTC+5.5)');
  console.log('');
  console.log('   • User in London enters:    "2025-01-15 14:30:00"');
  console.log('   • System converts to IST:   "2025-01-15 20:00:00" (GMT is UTC+0, IST is UTC+5.5)');
  console.log('');
  console.log('   • User in Singapore enters: "2025-01-15 14:30:00"');
  console.log('   • System converts to IST:   "2025-01-15 12:00:00" (SGT is UTC+8, IST is UTC+5.5)');
  console.log('');
  console.log('2. API Requirements:');
  console.log('   • All timestamps (D0 field) must be in IST timezone');
  console.log('   • Time filters (startTime, endTime) must be in IST timezone');
  console.log('   • Format must be: "YYYY-MM-DD HH:mm:ss"');
  console.log('');
  console.log('3. Automatic Conversion:');
  console.log('   • Users work in their local timezone');
  console.log('   • SDK automatically converts to IST before API calls');
  console.log('   • No manual timezone handling required by users');
  console.log('');
  console.log('=== How to Use MachineTimeline with Timezones ===');
  console.log('');
  console.log('1. Initialize with User Timezone:');
  console.log('   const timeline = new MachineTimeline({');
  console.log('     userId: "your-user-id",');
  console.log('     dataUrl: "your-data-url",');
  console.log('     tz: "America/New_York", // User\'s timezone');
  console.log('     logTime: true // See conversion logs');
  console.log('   });');
  console.log('');
  console.log('2. Query Data (times in user timezone):');
  console.log('   const data = await timeline.getMongoData({');
  console.log('     devID: "your-device-id",');
  console.log('     startTime: "2025-01-15 09:00:00", // 9 AM in user\'s timezone');
  console.log('     endTime: "2025-01-15 17:00:00"     // 5 PM in user\'s timezone');
  console.log('   });');
  console.log('   // Times automatically converted to IST for API');
  console.log('');
  console.log('3. Create Data (timestamps in user timezone):');
  console.log('   const result = await timeline.createMongoData({');
  console.log('     data: {');
  console.log('       rows: [{');
  console.log('         devID: "your-device-id",');
  console.log('         data: {');
  console.log('           D0: "2025-01-15 14:30:00", // 2:30 PM in user\'s timezone');
  console.log('           // Automatically converted to IST before insertion');
  console.log('         }');
  console.log('       }]');
  console.log('     }');
  console.log('   });');
  console.log('');
  console.log('4. Supported Timezones:');
  console.log('   • UTC, Asia/Kolkata (IST)');
  console.log('   • America/New_York, America/Los_Angeles');
  console.log('   • Europe/London, Europe/Paris');
  console.log('   • Asia/Singapore, Asia/Tokyo');
  console.log('   • And all IANA timezone identifiers');
  console.log('');
  console.log('5. Benefits:');
  console.log('   • No manual timezone conversion required');
  console.log('   • Work in your local timezone naturally');
  console.log('   • Automatic IST conversion for API compliance');
  console.log('   • Error handling for invalid timezones/dates');
  console.log('   • Optional conversion logging for debugging');
}

// Run the example
exampleUsage().catch(console.error); 