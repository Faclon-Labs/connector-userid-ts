import DataAccess from '../connectors/DataAccess.js';

async function testGetLoadEntities() {
  console.log('🧪 Testing getLoadEntities method...\n');

  // Initialize DataAccess with test credentials
  const dataAccess = new DataAccess({
    userId: "645a159222722a319ca5f5ad",
    dataUrl: "datads.iosense.io",
    dsUrl: "ds-server.iosense.io",
    onPrem: false,
    tz: "UTC"
  });

  try {
    console.log('📡 Fetching all load entities...');
    const allEntities = await dataAccess.getLoadEntities();
    console.log(`✅ Retrieved ${allEntities.length} load entities`);
    
    if (allEntities.length > 0) {
      console.log('\n📋 Sample load entity:');
      console.log(JSON.stringify(allEntities[0], null, 2));
      
      // Test filtering by specific clusters
      const firstEntityName = allEntities[0].name;
      const firstEntityId = allEntities[0].id;
      
      console.log(`\n🔍 Testing filter by name: "${firstEntityName}"`);
      const filteredByName = await dataAccess.getLoadEntities({
        clusters: [firstEntityName]
      });
      console.log(`✅ Filtered result count: ${filteredByName.length}`);
      
      console.log(`\n🔍 Testing filter by ID: "${firstEntityId}"`);
      const filteredById = await dataAccess.getLoadEntities({
        clusters: [firstEntityId]
      });
      console.log(`✅ Filtered result count: ${filteredById.length}`);
    }

    // Test with onPrem override
    console.log('\n🏢 Testing with onPrem override (should use HTTP)...');
    const onPremEntities = await dataAccess.getLoadEntities({
      onPrem: false // Still using HTTPS for this test
    });
    console.log(`✅ OnPrem test result count: ${onPremEntities.length}`);

    // Test error case - empty clusters array
    console.log('\n❌ Testing error case - empty clusters array...');
    try {
      await dataAccess.getLoadEntities({
        clusters: []
      });
      console.log('❌ Should have thrown an error');
    } catch (error: any) {
      console.log(`✅ Correctly caught error: ${error.message}`);
    }

  } catch (error: any) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Run the test
testGetLoadEntities().then(() => {
  console.log('\n🎉 Test completed!');
}).catch((error) => {
  console.error('💥 Test execution failed:', error);
}); 