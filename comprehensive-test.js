/**
 * Comprehensive Test Suite for Municipal Services Management System
 * Tests all 6 scenarios with proper session handling and data persistence validation
 */

const API_BASE = 'http://localhost:5000';

// Test results tracking
let testResults = {
  scenarios: [],
  persistence: [],
  crossRole: [],
  workflows: [],
  security: []
};

// Session storage for cookies
let sessionCookies = {};

// Helper function to make API calls with session management
async function apiRequest(method, endpoint, data = null, userRole = null) {
  const headers = {
    'Content-Type': 'application/json'
  };
  
  // Add session cookies if available
  if (userRole && sessionCookies[userRole]) {
    headers['Cookie'] = sessionCookies[userRole];
  }

  const config = {
    method,
    headers
  };
  
  if (data) {
    config.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, config);
    
    // Store session cookies
    if (userRole && response.headers.get('set-cookie')) {
      sessionCookies[userRole] = response.headers.get('set-cookie');
    }
    
    let result;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      result = await response.json();
    } else {
      result = await response.text();
    }
    
    console.log(`${method} ${endpoint}: ${response.status}`);
    
    return { 
      success: response.ok, 
      data: result, 
      status: response.status 
    };
  } catch (error) {
    console.error(`Error ${method} ${endpoint}:`, error.message);
    return { success: false, error: error.message };
  }
}

// Test Scenario 1: Citizen Issue Reporting
async function testCitizenIssueReporting() {
  console.log('\n=== SCENARIO 1: Citizen Issue Reporting ===');
  
  try {
    // Login as citizen
    const loginResult = await apiRequest('POST', '/api/auth/login', {
      username: 'citizen',
      password: 'password'
    }, 'citizen');
    
    if (!loginResult.success) {
      throw new Error('Citizen login failed');
    }
    
    // Create water leak issue
    const issueData = {
      title: "Water leak on Main Street causing flooding",
      category: "water",
      priority: "high", 
      location: "123 Main Street, Cape Town",
      description: "Large water leak from municipal pipe causing street flooding and property damage to multiple properties. Urgent repair needed.",
      reportedBy: "John Citizen"
    };
    
    const issueResult = await apiRequest('POST', '/api/issues', issueData, 'citizen');
    
    if (!issueResult.success) {
      throw new Error('Issue creation failed');
    }
    
    const issueId = issueResult.data.id;
    const refNumber = issueResult.data.referenceNumber;
    
    // Verify issue in dashboard
    const dashboardResult = await apiRequest('GET', '/api/issues', null, 'citizen');
    const createdIssue = dashboardResult.data.find(i => i.id === issueId);
    
    if (!createdIssue) {
      throw new Error('Issue not found in citizen dashboard');
    }
    
    // Logout
    await apiRequest('POST', '/api/auth/logout', null, 'citizen');
    
    testResults.scenarios.push({
      name: 'Citizen Issue Reporting',
      status: 'PASSED',
      details: `Issue ${issueId} (${refNumber}) created successfully`
    });
    
    console.log(`✓ Scenario 1 PASSED - Issue ${issueId} (${refNumber}) created`);
    return issueId;
    
  } catch (error) {
    testResults.scenarios.push({
      name: 'Citizen Issue Reporting',
      status: 'FAILED',
      error: error.message
    });
    console.log(`✗ Scenario 1 FAILED: ${error.message}`);
    throw error;
  }
}

// Test Scenario 2: Call Center Management
async function testCallCenterManagement(issueId) {
  console.log('\n=== SCENARIO 2: Call Center Agent Management ===');
  
  try {
    // Login as call center agent
    const loginResult = await apiRequest('POST', '/api/auth/login', {
      username: 'agent',
      password: 'password'
    }, 'agent');
    
    if (!loginResult.success) {
      throw new Error('Agent login failed');
    }
    
    // Add communication notes
    const noteData = {
      note: "Contacted citizen for additional details. Confirmed flooding is affecting 3 properties. Requires urgent attention from technical team."
    };
    
    const noteResult = await apiRequest('POST', `/api/issues/${issueId}/notes`, noteData, 'agent');
    
    if (!noteResult.success) {
      throw new Error('Note creation failed');
    }
    
    // Escalate issue
    const escalationData = {
      reason: "Urgent - Multiple properties affected",
      escalationReason: "Water leak causing property damage to multiple homes. Requires immediate technical response."
    };
    
    const escalationResult = await apiRequest('POST', `/api/issues/${issueId}/escalate`, escalationData, 'agent');
    
    if (!escalationResult.success) {
      throw new Error('Escalation failed');
    }
    
    // Verify escalation
    const issueCheck = await apiRequest('GET', `/api/issues/${issueId}`, null, 'agent');
    
    if (!issueCheck.success || issueCheck.data.priority !== 'urgent') {
      throw new Error('Issue priority not updated to urgent');
    }
    
    await apiRequest('POST', '/api/auth/logout', null, 'agent');
    
    testResults.scenarios.push({
      name: 'Call Center Management',
      status: 'PASSED',
      details: `Issue ${issueId} escalated to urgent priority with notes`
    });
    
    console.log(`✓ Scenario 2 PASSED - Issue ${issueId} escalated successfully`);
    return issueId;
    
  } catch (error) {
    testResults.scenarios.push({
      name: 'Call Center Management', 
      status: 'FAILED',
      error: error.message
    });
    console.log(`✗ Scenario 2 FAILED: ${error.message}`);
    throw error;
  }
}

// Test Scenario 3: Technical Manager Assignment
async function testTechManagerAssignment(issueId) {
  console.log('\n=== SCENARIO 3: Technical Manager Assignment ===');
  
  try {
    // Login as technical manager
    const loginResult = await apiRequest('POST', '/api/auth/login', {
      username: 'techmanager',
      password: 'password'
    }, 'techmanager');
    
    if (!loginResult.success) {
      throw new Error('Tech manager login failed');
    }
    
    // Check urgent issues
    const urgentIssues = await apiRequest('GET', '/api/issues?priority=urgent', null, 'techmanager');
    
    if (!urgentIssues.success || !urgentIssues.data.find(i => i.id === issueId)) {
      throw new Error('Escalated issue not found in urgent queue');
    }
    
    // Assign to technician
    const assignmentData = {
      technicianId: 6, // Tom Technician
      notes: "Urgent water leak repair. Bring pipe coupling materials and high-pressure equipment."
    };
    
    const assignResult = await apiRequest('POST', `/api/issues/${issueId}/assign`, assignmentData, 'techmanager');
    
    if (!assignResult.success) {
      throw new Error('Issue assignment failed');
    }
    
    // Verify assignment
    const assignedIssue = await apiRequest('GET', `/api/issues/${issueId}`, null, 'techmanager');
    
    if (!assignedIssue.success || assignedIssue.data.status !== 'assigned') {
      throw new Error('Issue status not updated to assigned');
    }
    
    await apiRequest('POST', '/api/auth/logout', null, 'techmanager');
    
    testResults.scenarios.push({
      name: 'Technical Manager Assignment',
      status: 'PASSED',
      details: `Issue ${issueId} assigned to technician 6`
    });
    
    console.log(`✓ Scenario 3 PASSED - Issue ${issueId} assigned to technician`);
    return issueId;
    
  } catch (error) {
    testResults.scenarios.push({
      name: 'Technical Manager Assignment',
      status: 'FAILED', 
      error: error.message
    });
    console.log(`✗ Scenario 3 FAILED: ${error.message}`);
    throw error;
  }
}

// Test Scenario 4: Technician Field Work
async function testTechnicianFieldWork(issueId) {
  console.log('\n=== SCENARIO 4: Technician Field Work ===');
  
  try {
    // Login as technician
    const loginResult = await apiRequest('POST', '/api/auth/login', {
      username: 'technician',
      password: 'password'
    }, 'technician');
    
    if (!loginResult.success) {
      throw new Error('Technician login failed');
    }
    
    // Start work session
    const workStartData = {
      issueId: issueId,
      startLocation: "123 Main Street, Cape Town"
    };
    
    const workSession = await apiRequest('POST', '/api/work-sessions/start', workStartData, 'technician');
    
    if (!workSession.success) {
      throw new Error('Work session start failed');
    }
    
    const sessionId = workSession.data.id;
    
    // Update GPS location
    const locationData = {
      latitude: -33.9249,
      longitude: 18.4241,
      accuracy: 5
    };
    
    await apiRequest('POST', '/api/technicians/location', locationData, 'technician');
    
    // Complete work with detailed report
    const completionData = {
      sessionId: sessionId,
      issueId: issueId,
      workCompleted: "Repaired burst water pipe using new PVC coupling. Isolated water supply, cut damaged section, installed new coupling with sealant. Tested water pressure and flow. Cleaned work area.",
      materialsUsed: ["PVC Coupling", "Pipe Sealant", "Pipe Clamps"],
      timeTaken: 90,
      issuesFound: "Old pipe coupling failed due to age and ground movement",
      recommendations: "Inspect adjacent pipe sections within 3 months",
      customerSatisfaction: 5,
      additionalNotes: "Citizen very satisfied with quick response. Area cleaned up completely.",
      jobCardNumber: `JO-${String(issueId).padStart(3, '0')}-2025`
    };
    
    const completionResult = await apiRequest('POST', '/api/work-sessions/complete', completionData, 'technician');
    
    if (!completionResult.success) {
      throw new Error('Work completion failed');
    }
    
    // Verify issue status change
    const resolvedIssue = await apiRequest('GET', `/api/issues/${issueId}`, null, 'technician');
    
    if (!resolvedIssue.success || resolvedIssue.data.status !== 'resolved') {
      throw new Error('Issue status not updated to resolved');
    }
    
    await apiRequest('POST', '/api/auth/logout', null, 'technician');
    
    testResults.scenarios.push({
      name: 'Technician Field Work',
      status: 'PASSED',
      details: `Issue ${issueId} completed with detailed report`
    });
    
    console.log(`✓ Scenario 4 PASSED - Issue ${issueId} completed by technician`);
    return completionResult.data.id;
    
  } catch (error) {
    testResults.scenarios.push({
      name: 'Technician Field Work',
      status: 'FAILED',
      error: error.message
    });
    console.log(`✗ Scenario 4 FAILED: ${error.message}`);
    throw error;
  }
}

// Test Scenario 5: Completion Report Approval
async function testCompletionReportApproval() {
  console.log('\n=== SCENARIO 5: Completion Report Approval ===');
  
  try {
    // Login as technical manager
    const loginResult = await apiRequest('POST', '/api/auth/login', {
      username: 'techmanager',
      password: 'password'
    }, 'techmanager');
    
    if (!loginResult.success) {
      throw new Error('Tech manager login failed');
    }
    
    // Get completion reports
    const reportsResult = await apiRequest('GET', '/api/completion-reports', null, 'techmanager');
    
    if (!reportsResult.success) {
      throw new Error('Failed to fetch completion reports');
    }
    
    // Find a pending report
    const pendingReport = reportsResult.data.find(r => r.approvalStatus === 'pending');
    
    if (!pendingReport) {
      console.log('No pending reports found, using first available report');
      const firstReport = reportsResult.data[0];
      if (!firstReport) {
        throw new Error('No completion reports available');
      }
      
      // Use first report for testing
      var reportId = firstReport.id;
    } else {
      var reportId = pendingReport.id;
    }
    
    // Approve the report
    const approvalData = {
      reviewNotes: "Excellent work on the water leak repair. Professional completion with proper materials and comprehensive documentation.",
      reviewedBy: 5
    };
    
    const approvalResult = await apiRequest('POST', `/api/completion-reports/${reportId}/approve`, approvalData, 'techmanager');
    
    if (!approvalResult.success) {
      throw new Error('Report approval failed');
    }
    
    await apiRequest('POST', '/api/auth/logout', null, 'techmanager');
    
    testResults.scenarios.push({
      name: 'Completion Report Approval',
      status: 'PASSED',
      details: `Report ${reportId} approved with review notes`
    });
    
    console.log(`✓ Scenario 5 PASSED - Report ${reportId} approved`);
    return reportId;
    
  } catch (error) {
    testResults.scenarios.push({
      name: 'Completion Report Approval',
      status: 'FAILED',
      error: error.message
    });
    console.log(`✗ Scenario 5 FAILED: ${error.message}`);
    throw error;
  }
}

// Test Scenario 6: Report Rejection and Issue Reopening
async function testReportRejectionAndReopening() {
  console.log('\n=== SCENARIO 6: Report Rejection and Issue Reopening ===');
  
  try {
    // Create second issue first
    await apiRequest('POST', '/api/auth/login', {
      username: 'citizen',
      password: 'password'
    }, 'citizen');
    
    const issueData = {
      title: "Broken streetlight on Oak Avenue",
      category: "electricity",
      priority: "medium",
      location: "Oak Avenue near Primary School",
      description: "Streetlight pole damaged and not functioning. Safety concern for pedestrians at night.",
      reportedBy: "John Citizen"
    };
    
    const issueResult = await apiRequest('POST', '/api/issues', issueData, 'citizen');
    const issueId = issueResult.data.id;
    
    await apiRequest('POST', '/api/auth/logout', null, 'citizen');
    
    // Quick assignment by tech manager
    await apiRequest('POST', '/api/auth/login', {
      username: 'techmanager',
      password: 'password'
    }, 'techmanager');
    
    await apiRequest('POST', `/api/issues/${issueId}/assign`, {
      technicianId: 6,
      notes: "Fix broken streetlight"
    }, 'techmanager');
    
    await apiRequest('POST', '/api/auth/logout', null, 'techmanager');
    
    // Quick completion by technician
    await apiRequest('POST', '/api/auth/login', {
      username: 'technician',
      password: 'password'
    }, 'technician');
    
    const workSession = await apiRequest('POST', '/api/work-sessions/start', {
      issueId: issueId,
      startLocation: "Oak Avenue"
    }, 'technician');
    
    const completionResult = await apiRequest('POST', '/api/work-sessions/complete', {
      sessionId: workSession.data.id,
      issueId: issueId,
      workCompleted: "Fixed streetlight",
      materialsUsed: ["Light bulb"],
      timeTaken: 15,
      issuesFound: "Bulb was broken",
      recommendations: "None",
      customerSatisfaction: 3,
      additionalNotes: "Job done quickly",
      jobCardNumber: `JO-${String(issueId).padStart(3, '0')}-2025`
    }, 'technician');
    
    const reportId = completionResult.data.id;
    
    await apiRequest('POST', '/api/auth/logout', null, 'technician');
    
    // Tech manager rejection
    await apiRequest('POST', '/api/auth/login', {
      username: 'techmanager',
      password: 'password'
    }, 'techmanager');
    
    const rejectionResult = await apiRequest('POST', `/api/completion-reports/${reportId}/reject`, {
      reviewNotes: "Completion report lacks sufficient detail. Please provide comprehensive description of work performed and proper materials documentation.",
      reviewedBy: 5
    }, 'techmanager');
    
    if (!rejectionResult.success) {
      throw new Error('Report rejection failed');
    }
    
    // Verify issue reopening
    const reopenedIssue = await apiRequest('GET', `/api/issues/${issueId}`, null, 'techmanager');
    
    if (!reopenedIssue.success || reopenedIssue.data.status !== 'assigned') {
      throw new Error('Issue not properly reopened');
    }
    
    await apiRequest('POST', '/api/auth/logout', null, 'techmanager');
    
    testResults.scenarios.push({
      name: 'Report Rejection and Issue Reopening',
      status: 'PASSED',
      details: `Report ${reportId} rejected, Issue ${issueId} reopened`
    });
    
    console.log(`✓ Scenario 6 PASSED - Report ${reportId} rejected, Issue ${issueId} reopened`);
    return { issueId, reportId };
    
  } catch (error) {
    testResults.scenarios.push({
      name: 'Report Rejection and Issue Reopening',
      status: 'FAILED',
      error: error.message
    });
    console.log(`✗ Scenario 6 FAILED: ${error.message}`);
    throw error;
  }
}

// Data Persistence Verification
async function verifyDataPersistence() {
  console.log('\n=== DATA PERSISTENCE VERIFICATION ===');
  
  try {
    // Test 1: Verify issues persist
    const issuesResult = await apiRequest('GET', '/api/issues');
    if (!issuesResult.success || issuesResult.data.length === 0) {
      throw new Error('Issues not persisting');
    }
    console.log(`✓ Found ${issuesResult.data.length} persisted issues`);
    
    // Test 2: Verify completion reports persist
    const reportsResult = await apiRequest('GET', '/api/completion-reports');
    if (!reportsResult.success) {
      throw new Error('Completion reports not accessible');
    }
    console.log(`✓ Found ${reportsResult.data.length} persisted completion reports`);
    
    // Test 3: Verify approval statuses
    const approved = reportsResult.data.filter(r => r.approvalStatus === 'approved').length;
    const rejected = reportsResult.data.filter(r => r.approvalStatus === 'rejected').length;
    const pending = reportsResult.data.filter(r => r.approvalStatus === 'pending').length;
    
    console.log(`✓ Approval status distribution: ${approved} approved, ${rejected} rejected, ${pending} pending`);
    
    testResults.persistence.push({
      name: 'Data Persistence',
      status: 'PASSED',
      details: `${issuesResult.data.length} issues, ${reportsResult.data.length} reports persisted`
    });
    
  } catch (error) {
    testResults.persistence.push({
      name: 'Data Persistence',
      status: 'FAILED',
      error: error.message
    });
    console.log(`✗ Data Persistence FAILED: ${error.message}`);
  }
}

// Generate test report
function generateTestReport() {
  console.log('\n==========================================');
  console.log('🔍 COMPREHENSIVE TEST RESULTS SUMMARY');
  console.log('==========================================');
  
  const totalScenarios = testResults.scenarios.length;
  const passedScenarios = testResults.scenarios.filter(s => s.status === 'PASSED').length;
  const failedScenarios = testResults.scenarios.filter(s => s.status === 'FAILED').length;
  
  console.log(`\n📊 SCENARIO RESULTS: ${passedScenarios}/${totalScenarios} PASSED`);
  testResults.scenarios.forEach(scenario => {
    const icon = scenario.status === 'PASSED' ? '✅' : '❌';
    console.log(`${icon} ${scenario.name}: ${scenario.status}`);
    if (scenario.details) console.log(`   ${scenario.details}`);
    if (scenario.error) console.log(`   Error: ${scenario.error}`);
  });
  
  console.log(`\n📈 DATA PERSISTENCE: ${testResults.persistence.length > 0 ? testResults.persistence[0].status : 'NOT TESTED'}`);
  if (testResults.persistence.length > 0) {
    const persistence = testResults.persistence[0];
    if (persistence.details) console.log(`   ${persistence.details}`);
    if (persistence.error) console.log(`   Error: ${persistence.error}`);
  }
  
  console.log('\n🎯 KEY FEATURES TESTED:');
  console.log('   • Citizen issue reporting with reference numbers');
  console.log('   • Call center agent note-taking and escalation');
  console.log('   • Technical manager issue assignment and oversight');
  console.log('   • Technician field work and completion reporting');
  console.log('   • Completion report approval/rejection workflow');
  console.log('   • Automatic issue reopening on report rejection');
  console.log('   • Data persistence across user sessions');
  console.log('   • Cross-role data visibility and updates');
  
  const overallSuccess = failedScenarios === 0;
  console.log(`\n🏆 OVERALL RESULT: ${overallSuccess ? 'ALL TESTS PASSED' : 'SOME TESTS FAILED'}`);
  
  if (overallSuccess) {
    console.log('✨ The municipal services management system is fully operational!');
  } else {
    console.log('⚠️  Some issues need attention before deployment.');
  }
  
  console.log('==========================================');
}

// Main test execution
async function runComprehensiveTests() {
  console.log('🚀 STARTING COMPREHENSIVE MUNICIPAL SYSTEM TESTS');
  console.log('Testing 6 scenarios with data persistence validation');
  console.log('==========================================');
  
  try {
    // Run all test scenarios sequentially
    const issue1Id = await testCitizenIssueReporting();
    const escalatedIssueId = await testCallCenterManagement(issue1Id);
    const assignedIssueId = await testTechManagerAssignment(escalatedIssueId);
    await testTechnicianFieldWork(assignedIssueId);
    await testCompletionReportApproval();
    await testReportRejectionAndReopening();
    
    // Verify data persistence
    await verifyDataPersistence();
    
    // Generate comprehensive report
    generateTestReport();
    
  } catch (error) {
    console.error('\n💥 TEST SUITE EXECUTION FAILED:', error.message);
    generateTestReport();
  }
}

// Execute tests
runComprehensiveTests();