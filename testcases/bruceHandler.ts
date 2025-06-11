/**
 * Test file for BruceHandler TypeScript implementation
 */

import BruceHandler from "../connectors/bruceHandler.js";

console.log('IO Connect SDK - BruceHandler Test Mode');
console.log('-------------------------------------');

// Test configuration with IST timezone to demonstrate timezone conversion
const bruceHandler = new BruceHandler({
  userId: '645a159222722a319ca5f5ad',
  dataUrl: 'datads.iosense.io',
  onPrem: false,
  tz: 'Asia/Kolkata'  // Using IST to demonstrate timezone conversion
});

// Test function
async function runBruceHandlerTest() {
  try {
    console.log('\n=== Testing fetchUserInsights ===');
    
    // Call the fetchUserInsights function with default parameters
    const userInsights = await bruceHandler.fetchUserInsights({
      pagination: {
        page: 1,
        count: 10  // Using smaller count for testing
      },
      populate: [
        {
          path: "sourceInsightID",
          select: "insightID insightProperty tags source"
        }
      ],
      sort: { "createdAt": -1 },
      projection: null
    });

    console.log('USER INSIGHTS FETCHED:');
    console.log(`Total insights retrieved: ${userInsights.length}`);
    
    if (userInsights.length > 0) {
      console.log('\nFirst insight details:');
      console.log(JSON.stringify(userInsights[0], null, 2));
      
      console.log('\nInsight summary:');
      userInsights.forEach((insight, index) => {
        console.log(`${index + 1}. ${insight.insightName} (ID: ${insight.insightID})`);
        console.log(`   Source: ${insight.source}`);
        console.log(`   Created: ${insight.createdAt}`);
        console.log(`   Starred: ${insight.starred}`);
        console.log(`   Hidden: ${insight.hidden}`);
        console.log('');
      });

      // Test getSourceInsight with the first insight ID
      const firstInsightID = userInsights[0].insightID;
      console.log('\n=== Testing getSourceInsight ===');
      console.log(`Testing with insight ID: ${firstInsightID}`);
      
      const sourceInsight = await bruceHandler.getSourceInsight({
        insightId: firstInsightID
      });

      console.log('\nSOURCE INSIGHT DETAILS:');
      console.log(`Insight Name: ${sourceInsight.insightName || 'No name set'}`);
      console.log(`Insight ID: ${sourceInsight.insightID}`);
      console.log(`Source: ${sourceInsight.source}`);
      console.log(`Note: ${sourceInsight.note}`);
      console.log(`Organizations: ${sourceInsight.organisations.length} org(s)`);
      console.log(`Users with access: ${sourceInsight.users.length} user(s)`);
      console.log(`Workbenches: ${sourceInsight.workbenches.length} workbench(es)`);
      console.log(`Tags: ${sourceInsight.tags.join(', ')}`);
      console.log(`Vector Model: ${sourceInsight.vectorConfig.modelName}`);
      console.log(`Vector Size: ${sourceInsight.vectorConfig.vectorSize}`);
      console.log(`Distance Metric: ${sourceInsight.vectorConfig.distanceMetric}`);
      console.log(`Restricted Access: ${sourceInsight.restrictedAccess}`);
      console.log(`First Data Point: ${sourceInsight.firstDataPointTime}`);
      console.log(`Last Data Point: ${sourceInsight.lastDataPointTime}`);
      
      if (sourceInsight.selectedUsers.length > 0) {
        console.log('\nSelected Users:');
        sourceInsight.selectedUsers.forEach((user, index) => {
          console.log(`${index + 1}. ${user.userName} (${user.email}) - ${user.orgName}`);
        });
      }

      // Test fetchInsightResults with the first insight ID and timezone conversion
      console.log('\n=== Testing fetchInsightResults with Timezone Conversion ===');
      console.log(`Testing with insight ID: ${firstInsightID}`);
      console.log(`User timezone: Asia/Kolkata (IST)`);
      
      // Define local time in IST (user's timezone)
      const localStartTime = "2025-06-01T10:00:00";  // 10 AM IST
      const localEndTime = "2025-06-12T18:00:00";    // 6 PM IST
      
      console.log(`\nLocal start time (IST): ${localStartTime}`);
      console.log(`Local end time (IST): ${localEndTime}`);
      console.log('Note: These times will be automatically converted to UTC for the API call');
      
      const insightResults = await bruceHandler.fetchInsightResults({
        insightId: firstInsightID,
        filter: {
          startDate: localStartTime,  // Will be converted from IST to UTC
          endDate: localEndTime,      // Will be converted from IST to UTC
          insightProperty: []
        },
        pagination: {
          page: 1,
          count: 10
        }
      });

      console.log('\nINSIGHT RESULTS:');
      console.log(`Total results found: ${insightResults.totalCount}`);
      console.log(`Results in current page: ${insightResults.results.length}`);
      console.log(`Current page: ${insightResults.pagination.page} of ${insightResults.pagination.totalPages}`);
      
      if (insightResults.results.length > 0) {
        console.log('\nResults summary:');
        insightResults.results.forEach((result, index) => {
          console.log(`${index + 1}. ${result.resultName || 'Unnamed Result'}`);
          console.log(`   ID: ${result._id}`);
          console.log(`   Application Type: ${result.applicationType}`);
          console.log(`   Tags: ${result.tags.join(', ')}`);
          console.log(`   Invocation Time: ${result.invocationTime}`);
          
          if (result.metadata.s3Details) {
            console.log(`   File: ${result.metadata.s3Details.fileName}`);
            console.log(`   Content Type: ${result.metadata.s3Details.contentType}`);
            if (result.metadata.s3Details.fileSize) {
              console.log(`   File Size: ${(result.metadata.s3Details.fileSize / 1024 / 1024).toFixed(2)} MB`);
            }
          }
          
          if (result.metadata.filetype) {
            console.log(`   File Type: ${result.metadata.filetype}`);
          }
          
          if (result.metadata.status) {
            console.log(`   Status: ${result.metadata.status}`);
          }
          
          if (result.applicationID) {
            console.log(`   Workbench: ${result.applicationID.workbenchName}`);
          }
          
          console.log('');
        });

        // Show detailed metadata for first result
        console.log('\nFirst result detailed metadata:');
        console.log(JSON.stringify(insightResults.results[0].metadata, null, 2));

        // Test tags filtering with a different insight that might have tagged results
        console.log('\n=== Testing fetchInsightResults with Tags Filter ===');
        console.log('Testing with OEE Document Base insight for tag-filtered results...');
        
        const oeeInsightId = "INS_d8c4dfe45543"; // OEE Document Base from the insights list
        const tagFilteredResults = await bruceHandler.fetchInsightResults({
          insightId: oeeInsightId,
          filter: {
            startDate: "2025-05-01T00:00:00",  // Earlier date to include more results
            endDate: "2025-06-15T23:59:59",   // Later date to include more results
            tags: ["Profile"]  // Filter for Profile tags
          },
          pagination: {
            page: 1,
            count: 5
          }
        });

        console.log('\nTAG-FILTERED RESULTS:');
        console.log(`Total results found with "Profile" tag: ${tagFilteredResults.totalCount}`);
        console.log(`Results in current page: ${tagFilteredResults.results.length}`);
        
        if (tagFilteredResults.results.length > 0) {
          console.log('\nProfile-tagged results:');
          tagFilteredResults.results.forEach((result, index) => {
            console.log(`${index + 1}. ${result.resultName || 'Unnamed Result'}`);
            console.log(`   Tags: ${result.tags.join(', ')}`);
            console.log(`   Invocation Time: ${result.invocationTime}`);
            console.log('');
          });
        } else {
          console.log('No results found with "Profile" tag. Trying with different tags...');
          
          // Try with OEE tags
          const oeeTagResults = await bruceHandler.fetchInsightResults({
            insightId: oeeInsightId,
            filter: {
              startDate: "2025-05-01T00:00:00",
              endDate: "2025-06-15T23:59:59",
              tags: ["OEE"]
            },
            pagination: {
              page: 1,
              count: 5
            }
          });
          
          console.log(`\nResults with "OEE" tag: ${oeeTagResults.totalCount}`);
          if (oeeTagResults.results.length > 0) {
            console.log('OEE-tagged results:');
            oeeTagResults.results.forEach((result, index) => {
              console.log(`${index + 1}. ${result.resultName || 'Unnamed Result'}`);
              console.log(`   Tags: ${result.tags.join(', ')}`);
              console.log('');
            });
          }
        }

      } else {
        console.log('No insight results found for this insight within the specified time range.');
        console.log('This might be because the timezone conversion filtered out results,');
        console.log('or there are genuinely no results in the specified time period.');
      }

    } else {
      console.log('No user insights found for this user.');
    }

    console.log('\n=== BruceHandler Test Completed Successfully ===');

  } catch (error: any) {
    console.error('BruceHandler test failed:', error.message);
    console.error('Full error:', error);
  }
}

// Run the test
runBruceHandlerTest(); 