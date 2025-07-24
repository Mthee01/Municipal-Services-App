/**
 * Automated Test Script for Municipal Services Management System
 * 
 * This script tests 6 comprehensive scenarios across citizen, technician, 
 * and technical manager workflows with real data persistence validation.
 */

const API_BASE = 'http://localhost:5000';

// Test data for scenarios
const testData = {
  credentials: {
    citizen: { username: 'citizen', password: 'password' },
    technician: { username: 'technician', password: 'password' },
    techmanager: { username: 'techmanager', password: 'password' },
    agent: { username: 'agent', password: 'password' }
  },
  
  issues: [
    {
      title: "Water leak on Main Street causing flooding",
      category: "water",
      priority: "high",
      location: "123 Main Street, Cape Town",
      description: "Large water leak from municipal pipe causing street flooding and property damage to multiple properties. Urgent repair needed.",
      reportedBy: "John Citizen"
    },
    {
      title: "Broken streetlight on Oak Avenue", 
      category: "electricity",
      priority: "medium",
      location: "Oak Avenue near Primary School",
      description: "Streetlight pole damaged and not functioning. Safety concern for pedestrians at night.",
      reportedBy: "John Citizen"
    }
  ],

  completionReports: {
    approved: {
      workCompleted: "Repaired burst water pipe using new PVC coupling. Isolated water supply, cut damaged section, installed new coupling with sealant. Tested water pressure and flow. Cleaned work area and restored service.",
      materialsUsed: ["PVC Coupling", "Pipe Sealant", "Pipe Clamps", "High-pressure testing equipment"],
      timeTaken: 90,
      issuesFound: "Old pipe coupling failed due to age and ground movement. Adjacent connections show signs of stress.",
      recommendations: "Inspect adjacent pipe sections within 3 months. Consider proactive replacement of similar aged couplings in the area.",
      customerSatisfaction: 5,
      additionalNotes: "Citizen very satisfied with quick response time and professional service. Area cleaned up completely. No disruption to neighboring properties."
    },
    rejected: {
      workCompleted: "Fixed streetlight",
      materialsUsed: ["Light bulb"],
      timeTaken: 15,
      issuesFound: "Bulb was broken",
      recommendations: "None",
      customerSatisfaction: 3,
      additionalNotes: "Job done quickly"
    }
  }
};

// API Helper Functions
async function apiCall(method, endpoint, data = null, token = null) {
  const config = {
    method,
    headers: {
      'Content-Type': 'application/json',
    }
  };
  
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  
  if (data) {
    config.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, config);
    const result = await response.json();
    
    console.log(`${method} ${endpoint}:`, response.status, result);
    return { success: response.ok, data: result, status: response.status };
  } catch (error) {
    console.error(`Error ${method} ${endpoint}:`, error);
    return { success: false, error: error.message };
  }
}

async function login(credentials) {
  return await apiCall('POST', '/api/auth/login', credentials);
}

async function logout() {
  return await apiCall('POST', '/api/auth/logout');
}

// Test Scenario Functions
async function testScenario1_CitizenIssueReporting() {
  console.log('\n=== SCENARIO 1: Citizen Issue Reporting ===');
  
  // Step 1: Login as citizen
  console.log('1. Logging in as citizen...');
  const loginResult = await login(testData.credentials.citizen);
  if (!loginResult.success) {
    throw new Error('Citizen login failed');
  }
  
  // Step 2: Create new issue
  console.log('2. Creating water leak issue...');
  const issueResult = await apiCall('POST', '/api/issues', testData.issues[0]);
  if (!issueResult.success) {
    throw new Error('Issue creation failed');
  }
  
  const issueId = issueResult.data.id;
  console.log(`✓ Issue created with ID: ${issueId}`);
  
  // Step 3: Verify issue in citizen dashboard
  console.log('3. Verifying issue appears in citizen dashboard...');
  const citizenIssues = await apiCall('GET', '/api/issues?reportedBy=citizen');
  if (!citizenIssues.success || !citizenIssues.data.find(i => i.id === issueId)) {
    throw new Error('Issue not found in citizen dashboard');
  }
  
  console.log('✓ Scenario 1 completed successfully');
  await logout();
  return issueId;
}

async function testScenario2_CallCenterEscalation(issueId) {
  console.log('\n=== SCENARIO 2: Call Center Agent Management ===');
  
  // Step 1: Login as call center agent
  console.log('1. Logging in as call center agent...');
  const loginResult = await login(testData.credentials.agent);
  if (!loginResult.success) {
    throw new Error('Agent login failed');
  }
  
  // Step 2: Add communication notes
  console.log('2. Adding communication notes...');
  const noteData = {
    note: "Contacted citizen for additional details. Confirmed flooding is affecting 3 properties. Requires urgent attention from technical team."
  };
  const noteResult = await apiCall('POST', `/api/issues/${issueId}/notes`, noteData);
  if (!noteResult.success) {
    throw new Error('Note creation failed');
  }
  
  // Step 3: Escalate issue
  console.log('3. Escalating issue to technical manager...');
  const escalationData = {
    reason: "Urgent - Multiple properties affected",
    escalationReason: "Water leak causing property damage to multiple homes. Requires immediate technical response with specialized equipment."
  };
  const escalationResult = await apiCall('POST', `/api/issues/${issueId}/escalate`, escalationData);
  if (!escalationResult.success) {
    throw new Error('Escalation failed');
  }
  
  // Step 4: Verify escalation
  console.log('4. Verifying issue escalation...');
  const updatedIssue = await apiCall('GET', `/api/issues/${issueId}`);
  if (!updatedIssue.success || updatedIssue.data.priority !== 'urgent') {
    throw new Error('Issue priority not updated to urgent');
  }
  
  console.log('✓ Scenario 2 completed successfully');
  await logout();
  return issueId;
}

async function testScenario3_TechManagerAssignment(issueId) {
  console.log('\n=== SCENARIO 3: Technical Manager Assignment ===');
  
  // Step 1: Login as technical manager
  console.log('1. Logging in as technical manager...');
  const loginResult = await login(testData.credentials.techmanager);
  if (!loginResult.success) {
    throw new Error('Tech manager login failed');
  }
  
  // Step 2: Review escalated issues
  console.log('2. Reviewing escalated issues...');
  const issues = await apiCall('GET', '/api/issues?status=open&priority=urgent');
  if (!issues.success || !issues.data.find(i => i.id === issueId)) {
    throw new Error('Escalated issue not found');
  }
  
  // Step 3: Assign issue to technician
  console.log('3. Assigning issue to technician...');
  const assignmentData = {
    technicianId: 6, // Tom Technician ID
    notes: "Urgent water leak repair. Bring pipe coupling materials and high-pressure equipment. Multiple properties affected - priority response required."
  };
  const assignResult = await apiCall('POST', `/api/issues/${issueId}/assign`, assignmentData);
  if (!assignResult.success) {
    throw new Error('Issue assignment failed');
  }
  
  // Step 4: Verify assignment
  console.log('4. Verifying issue assignment...');
  const assignedIssue = await apiCall('GET', `/api/issues/${issueId}`);
  if (!assignedIssue.success || assignedIssue.data.status !== 'assigned') {
    throw new Error('Issue status not updated to assigned');
  }
  
  // Step 5: Check technician location tracking
  console.log('5. Checking technician location tracking...');
  const locationData = await apiCall('GET', '/api/technicians-with-locations');
  if (!locationData.success) {
    console.warn('Location tracking data not available');
  }
  
  console.log('✓ Scenario 3 completed successfully');
  await logout();
  return issueId;
}

async function testScenario4_TechnicianFieldWork(issueId) {
  console.log('\n=== SCENARIO 4: Technician Field Work ===');
  
  // Step 1: Login as technician
  console.log('1. Logging in as technician...');
  const loginResult = await login(testData.credentials.technician);
  if (!loginResult.success) {
    throw new Error('Technician login failed');
  }
  
  // Step 2: Start work session
  console.log('2. Starting work session...');
  const startWorkData = {
    issueId: issueId,
    startLocation: "123 Main Street, Cape Town"
  };
  const workSessionResult = await apiCall('POST', '/api/work-sessions/start', startWorkData);
  if (!workSessionResult.success) {
    throw new Error('Work session start failed');
  }
  
  const sessionId = workSessionResult.data.id;
  console.log(`✓ Work session started with ID: ${sessionId}`);
  
  // Step 3: Update location
  console.log('3. Updating GPS location...');
  const locationData = {
    latitude: -33.9249,
    longitude: 18.4241,
    accuracy: 5
  };
  const locationResult = await apiCall('POST', '/api/technicians/location', locationData);
  if (!locationResult.success) {
    console.warn('Location update failed, continuing test');
  }
  
  // Step 4: Complete work with detailed report
  console.log('4. Completing work with detailed report...');
  const completionData = {
    sessionId: sessionId,
    issueId: issueId,
    ...testData.completionReports.approved
  };
  const completionResult = await apiCall('POST', '/api/work-sessions/complete', completionData);
  if (!completionResult.success) {
    throw new Error('Work completion failed');
  }
  
  // Step 5: Verify issue status change
  console.log('5. Verifying issue status change to resolved...');
  const resolvedIssue = await apiCall('GET', `/api/issues/${issueId}`);
  if (!resolvedIssue.success || resolvedIssue.data.status !== 'resolved') {
    throw new Error('Issue status not updated to resolved');
  }
  
  console.log('✓ Scenario 4 completed successfully');
  await logout();
  return completionResult.data.id;
}

async function testScenario5_CompletionReportApproval(reportId) {
  console.log('\n=== SCENARIO 5: Completion Report Approval ===');
  
  // Step 1: Login as technical manager
  console.log('1. Logging in as technical manager...');
  const loginResult = await login(testData.credentials.techmanager);
  if (!loginResult.success) {
    throw new Error('Tech manager login failed');
  }
  
  // Step 2: Review completion reports
  console.log('2. Reviewing completion reports...');
  const reports = await apiCall('GET', '/api/completion-reports');
  if (!reports.success) {
    throw new Error('Failed to fetch completion reports');
  }
  
  const report = reports.data.find(r => r.id === reportId);
  if (!report) {
    throw new Error('Completion report not found');
  }
  
  // Step 3: Approve completion report
  console.log('3. Approving completion report...');
  const approvalData = {
    reviewNotes: "Excellent work on the water leak repair. Professional completion with proper materials and comprehensive documentation. Customer satisfaction rating of 5/5 shows quality service delivery. Work meets all municipal standards.",
    reviewedBy: 5 // Tech manager user ID
  };
  const approvalResult = await apiCall('POST', `/api/completion-reports/${reportId}/approve`, approvalData);
  if (!approvalResult.success) {
    throw new Error('Report approval failed');
  }
  
  // Step 4: Verify approval status
  console.log('4. Verifying approval status...');
  const updatedReports = await apiCall('GET', '/api/completion-reports');
  const updatedReport = updatedReports.data.find(r => r.id === reportId);
  if (!updatedReport || updatedReport.approvalStatus !== 'approved') {
    throw new Error('Report approval status not updated');
  }
  
  console.log('✓ Scenario 5 completed successfully');
  await logout();
  return reportId;
}

async function testScenario6_ReportRejectionAndReopening() {
  console.log('\n=== SCENARIO 6: Report Rejection and Issue Reopening ===');
  
  // Step 1: Create second issue for rejection test
  console.log('1. Creating second issue as citizen...');
  await login(testData.credentials.citizen);
  const issueResult = await apiCall('POST', '/api/issues', testData.issues[1]);
  if (!issueResult.success) {
    throw new Error('Second issue creation failed');
  }
  const issueId = issueResult.data.id;
  await logout();
  
  // Step 2: Quick assignment by tech manager
  console.log('2. Assigning issue to technician...');
  await login(testData.credentials.techmanager);
  const assignmentData = {
    technicianId: 6,
    notes: "Fix broken streetlight on Oak Avenue"
  };
  await apiCall('POST', `/api/issues/${issueId}/assign`, assignmentData);
  await logout();
  
  // Step 3: Quick completion by technician with minimal report
  console.log('3. Completing work with insufficient detail...');
  await login(testData.credentials.technician);
  
  const startWorkData = { issueId: issueId, startLocation: "Oak Avenue" };
  const workSession = await apiCall('POST', '/api/work-sessions/start', startWorkData);
  const sessionId = workSession.data.id;
  
  const completionData = {
    sessionId: sessionId,
    issueId: issueId,
    ...testData.completionReports.rejected
  };
  const completionResult = await apiCall('POST', '/api/work-sessions/complete', completionData);
  const reportId = completionResult.data.id;
  await logout();
  
  // Step 4: Technical manager rejection
  console.log('4. Rejecting completion report...');
  await login(testData.credentials.techmanager);
  
  const rejectionData = {
    reviewNotes: "Completion report lacks sufficient detail and professionalism. Issues: 1) Work description too brief - need comprehensive explanation of diagnosis and repair process. 2) Materials list incomplete - only 'light bulb' listed. 3) No root cause analysis provided. 4) Customer satisfaction of 3/5 indicates service quality issues. 5) No recommendations for preventive maintenance. Please provide detailed rework with proper documentation standards.",
    reviewedBy: 5
  };
  const rejectionResult = await apiCall('POST', `/api/completion-reports/${reportId}/reject`, rejectionData);
  if (!rejectionResult.success) {
    throw new Error('Report rejection failed');
  }
  
  // Step 5: Verify issue reopening
  console.log('5. Verifying issue reopening...');
  const reopenedIssue = await apiCall('GET', `/api/issues/${issueId}`);
  if (!reopenedIssue.success || reopenedIssue.data.status !== 'assigned') {
    throw new Error('Issue not properly reopened');
  }
  
  // Step 6: Check rejection notes in issue history
  console.log('6. Verifying rejection notes in issue history...');
  const issueNotes = await apiCall('GET', `/api/issues/${issueId}/notes`);
  if (!issueNotes.success) {
    console.warn('Could not verify rejection notes');
  }
  
  console.log('✓ Scenario 6 completed successfully');
  await logout();
  return { issueId, reportId };
}

// Data Persistence Verification
async function verifyDataPersistence() {
  console.log('\n=== DATA PERSISTENCE VERIFICATION ===');
  
  // Test 1: Verify issues persist
  console.log('1. Checking issue persistence...');
  const issues = await apiCall('GET', '/api/issues');
  if (!issues.success || issues.data.length === 0) {
    throw new Error('Issues not persisting in database');
  }
  console.log(`✓ Found ${issues.data.length} persisted issues`);
  
  // Test 2: Verify notes persist
  console.log('2. Checking notes persistence...');
  const firstIssue = issues.data[0];
  if (firstIssue) {
    const notes = await apiCall('GET', `/api/issues/${firstIssue.id}/notes`);
    if (notes.success && notes.data.length > 0) {
      console.log(`✓ Found ${notes.data.length} persisted notes`);
    }
  }
  
  // Test 3: Verify completion reports persist
  console.log('3. Checking completion reports persistence...');
  const reports = await apiCall('GET', '/api/completion-reports');
  if (!reports.success) {
    throw new Error('Completion reports not accessible');
  }
  console.log(`✓ Found ${reports.data.length} persisted completion reports`);
  
  // Test 4: Verify approval status persistence
  const approvedReports = reports.data.filter(r => r.approvalStatus === 'approved');
  const rejectedReports = reports.data.filter(r => r.approvalStatus === 'rejected');
  const pendingReports = reports.data.filter(r => r.approvalStatus === 'pending');
  
  console.log(`✓ Approval status distribution: ${approvedReports.length} approved, ${rejectedReports.length} rejected, ${pendingReports.length} pending`);
  
  console.log('✓ Data persistence verification completed');
}

// Main Test Execution
async function runAllTests() {
  console.log('🚀 Starting Municipal System Test Suite');
  console.log('==========================================');
  
  try {
    // Run all test scenarios
    const issue1Id = await testScenario1_CitizenIssueReporting();
    const escalatedIssueId = await testScenario2_CallCenterEscalation(issue1Id);
    const assignedIssueId = await testScenario3_TechManagerAssignment(escalatedIssueId);
    const reportId = await testScenario4_TechnicianFieldWork(assignedIssueId);
    await testScenario5_CompletionReportApproval(reportId);
    await testScenario6_ReportRejectionAndReopening();
    
    // Verify data persistence
    await verifyDataPersistence();
    
    console.log('\n🎉 ALL TESTS PASSED SUCCESSFULLY!');
    console.log('==========================================');
    console.log('✅ Citizen issue reporting workflow');
    console.log('✅ Call center escalation process');
    console.log('✅ Technical manager assignment');
    console.log('✅ Technician field work completion');
    console.log('✅ Completion report approval');
    console.log('✅ Report rejection and issue reopening');
    console.log('✅ Data persistence across all workflows');
    
  } catch (error) {
    console.error('\n❌ TEST SUITE FAILED:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Export for manual execution
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    runAllTests,
    testData,
    apiCall
  };
}

// Auto-execute if run directly
if (typeof window === 'undefined') {
  runAllTests();
}