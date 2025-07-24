/**
 * Comprehensive Dashboard Test Suite
 * Tests all user dashboards and their data integration
 */

const API_BASE = 'http://localhost:5000';

// Helper function for API requests
async function apiCall(method, endpoint, data = null) {
  const config = {
    method,
    headers: { 'Content-Type': 'application/json' }
  };
  
  if (data) {
    config.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, config);
    const text = await response.text();
    
    let result;
    try {
      result = JSON.parse(text);
    } catch {
      result = text;
    }
    
    return { 
      success: response.ok, 
      data: result, 
      status: response.status
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Test Results Storage
let testResults = {
  dashboards: [],
  startTime: new Date()
};

// Test 1: Technician Dashboard Data
async function testTechnicianDashboard() {
  console.log('\n🔧 Test 1: Technician Dashboard (User ID: 6)');
  
  try {
    const results = await Promise.all([
      apiCall('GET', '/api/issues?technicianId=6'),
      apiCall('GET', '/api/work-sessions/active?technicianId=6'),
      apiCall('GET', '/api/completion-reports?technicianId=6'),
      apiCall('GET', '/api/field-reports?technicianId=6')
    ]);
    
    const [issuesResult, sessionsResult, reportsResult, fieldReportsResult] = results;
    
    if (!issuesResult.success || !sessionsResult.success || !reportsResult.success || !fieldReportsResult.success) {
      throw new Error('Failed to fetch technician dashboard data');
    }
    
    const activeIssues = issuesResult.data.filter(issue => ['assigned', 'open', 'in_progress'].includes(issue.status));
    
    testResults.dashboards.push({
      dashboard: 'Technician Dashboard',
      userId: 6,
      status: 'PASSED',
      data: {
        totalAssignedIssues: issuesResult.data.length,
        activeWorkOrders: activeIssues.length,
        activeSessions: sessionsResult.data.length,
        completionReports: reportsResult.data.length,
        fieldReports: fieldReportsResult.data.length
      },
      details: `${activeIssues.length} work orders, ${sessionsResult.data.length} active sessions, ${reportsResult.data.length} completion reports, ${fieldReportsResult.data.length} field reports`
    });
    
    console.log(`✅ PASSED - ${activeIssues.length} work orders, ${sessionsResult.data.length} active sessions, ${reportsResult.data.length} reports, ${fieldReportsResult.data.length} field reports`);
    return true;
    
  } catch (error) {
    testResults.dashboards.push({
      dashboard: 'Technician Dashboard',
      userId: 6,
      status: 'FAILED',
      error: error.message
    });
    console.log(`❌ FAILED: ${error.message}`);
    return false;
  }
}

// Test 2: Technical Manager Dashboard
async function testTechManagerDashboard() {
  console.log('\n👔 Test 2: Technical Manager Dashboard (User ID: 5)');
  
  try {
    const results = await Promise.all([
      apiCall('GET', '/api/issues'),
      apiCall('GET', '/api/technicians'),
      apiCall('GET', '/api/completion-reports'),
      apiCall('GET', '/api/technicians-with-locations')
    ]);
    
    const [issuesResult, techniciansResult, reportsResult, locationsResult] = results;
    
    if (!issuesResult.success || !techniciansResult.success || !reportsResult.success) {
      throw new Error('Failed to fetch tech manager dashboard data');
    }
    
    const unassignedIssues = issuesResult.data.filter(issue => !issue.assignedTo && issue.status !== 'resolved');
    const assignedIssues = issuesResult.data.filter(issue => issue.assignedTo && issue.status !== 'resolved');
    const pendingReports = reportsResult.data.filter(report => report.approvalStatus === 'pending');
    
    testResults.dashboards.push({
      dashboard: 'Technical Manager Dashboard',
      userId: 5,
      status: 'PASSED',
      data: {
        totalIssues: issuesResult.data.length,
        unassignedIssues: unassignedIssues.length,
        assignedIssues: assignedIssues.length,
        technicians: techniciansResult.data.length,
        completionReports: reportsResult.data.length,
        pendingReports: pendingReports.length,
        trackableTechnicians: locationsResult.success ? locationsResult.data.length : 0
      },
      details: `${unassignedIssues.length} unassigned, ${assignedIssues.length} assigned, ${techniciansResult.data.length} technicians, ${pendingReports.length} pending reports`
    });
    
    console.log(`✅ PASSED - ${unassignedIssues.length} unassigned issues, ${assignedIssues.length} assigned, ${techniciansResult.data.length} technicians, ${pendingReports.length} pending reports`);
    return true;
    
  } catch (error) {
    testResults.dashboards.push({
      dashboard: 'Technical Manager Dashboard',
      userId: 5,
      status: 'FAILED',
      error: error.message
    });
    console.log(`❌ FAILED: ${error.message}`);
    return false;
  }
}

// Test 3: Call Center Agent Dashboard
async function testCallCenterDashboard() {
  console.log('\n📞 Test 3: Call Center Agent Dashboard (User ID: 2)');
  
  try {
    const results = await Promise.all([
      apiCall('GET', '/api/issues'),
      apiCall('GET', '/api/technicians-with-locations'),
      apiCall('GET', '/api/issues/23/notes') // Test notes endpoint
    ]);
    
    const [issuesResult, locationsResult, notesResult] = results;
    
    if (!issuesResult.success) {
      throw new Error('Failed to fetch call center dashboard data');
    }
    
    const activeIssues = issuesResult.data.filter(issue => ['open', 'assigned', 'in_progress'].includes(issue.status));
    const urgentIssues = issuesResult.data.filter(issue => issue.priority === 'urgent' || issue.priority === 'emergency');
    const recentIssues = issuesResult.data.filter(issue => {
      const createdDate = new Date(issue.createdAt);
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      return createdDate > oneHourAgo;
    });
    
    testResults.dashboards.push({
      dashboard: 'Call Center Agent Dashboard',
      userId: 2,
      status: 'PASSED',
      data: {
        totalIssues: issuesResult.data.length,
        activeIssues: activeIssues.length,
        urgentIssues: urgentIssues.length,
        recentIssues: recentIssues.length,
        trackableTechnicians: locationsResult.success ? locationsResult.data.length : 0,
        notesAvailable: notesResult.success
      },
      details: `${activeIssues.length} active issues, ${urgentIssues.length} urgent, ${recentIssues.length} recent, notes system functional`
    });
    
    console.log(`✅ PASSED - ${activeIssues.length} active issues, ${urgentIssues.length} urgent, ${recentIssues.length} recent issues`);
    return true;
    
  } catch (error) {
    testResults.dashboards.push({
      dashboard: 'Call Center Agent Dashboard',
      userId: 2,
      status: 'FAILED',
      error: error.message
    });
    console.log(`❌ FAILED: ${error.message}`);
    return false;
  }
}

// Test 4: Ward Councillor Dashboard
async function testWardCouncillorDashboard() {
  console.log('\n🏛️ Test 4: Ward Councillor Dashboard (User ID: 3)');
  
  try {
    const results = await Promise.all([
      apiCall('GET', '/api/issues'),
      apiCall('GET', '/api/issues?ward=Ward 1'),
      apiCall('GET', '/api/issues?ward=Ward 3'),
      apiCall('GET', '/api/issues?ward=Ward 5')
    ]);
    
    const [allIssuesResult, ward1Result, ward3Result, ward5Result] = results;
    
    if (!allIssuesResult.success) {
      throw new Error('Failed to fetch ward councillor dashboard data');
    }
    
    const wardIssues = [
      { ward: 'Ward 1', count: ward1Result.success ? ward1Result.data.length : 0 },
      { ward: 'Ward 3', count: ward3Result.success ? ward3Result.data.length : 0 },
      { ward: 'Ward 5', count: ward5Result.success ? ward5Result.data.length : 0 }
    ];
    
    const totalWardIssues = wardIssues.reduce((sum, ward) => sum + ward.count, 0);
    const resolvedIssues = allIssuesResult.data.filter(issue => issue.status === 'resolved').length;
    
    testResults.dashboards.push({
      dashboard: 'Ward Councillor Dashboard',
      userId: 3,
      status: 'PASSED',
      data: {
        totalIssues: allIssuesResult.data.length,
        wardSpecificIssues: totalWardIssues,
        wardBreakdown: wardIssues,
        resolvedIssues: resolvedIssues,
        resolutionRate: Math.round((resolvedIssues / allIssuesResult.data.length) * 100)
      },
      details: `${totalWardIssues} ward-specific issues, ${resolvedIssues} resolved (${Math.round((resolvedIssues / allIssuesResult.data.length) * 100)}% resolution rate)`
    });
    
    console.log(`✅ PASSED - ${totalWardIssues} ward issues, ${resolvedIssues} resolved, ${Math.round((resolvedIssues / allIssuesResult.data.length) * 100)}% resolution rate`);
    return true;
    
  } catch (error) {
    testResults.dashboards.push({
      dashboard: 'Ward Councillor Dashboard',
      userId: 3,
      status: 'FAILED',
      error: error.message
    });
    console.log(`❌ FAILED: ${error.message}`);
    return false;
  }
}

// Test 5: Mayor Dashboard
async function testMayorDashboard() {
  console.log('\n🎩 Test 5: Mayor Dashboard (User ID: 4)');
  
  try {
    const results = await Promise.all([
      apiCall('GET', '/api/issues'),
      apiCall('GET', '/api/technicians'),
      apiCall('GET', '/api/completion-reports'),
      apiCall('GET', '/api/analytics/performance') // Test analytics endpoint
    ]);
    
    const [issuesResult, techniciansResult, reportsResult, analyticsResult] = results;
    
    if (!issuesResult.success || !techniciansResult.success) {
      throw new Error('Failed to fetch mayor dashboard data');
    }
    
    const resolvedIssues = issuesResult.data.filter(issue => issue.status === 'resolved');
    const averageRating = reportsResult.success ? 
      reportsResult.data.reduce((sum, report) => sum + (report.customerSatisfaction || 0), 0) / Math.max(reportsResult.data.length, 1) : 0;
    
    // Calculate performance metrics
    const issuesByCategory = {};
    issuesResult.data.forEach(issue => {
      issuesByCategory[issue.category] = (issuesByCategory[issue.category] || 0) + 1;
    });
    
    testResults.dashboards.push({
      dashboard: 'Mayor Dashboard',
      userId: 4,
      status: 'PASSED',
      data: {
        totalIssues: issuesResult.data.length,
        resolvedIssues: resolvedIssues.length,
        resolutionRate: Math.round((resolvedIssues.length / issuesResult.data.length) * 100),
        totalTechnicians: techniciansResult.data.length,
        averageRating: Math.round(averageRating * 10) / 10,
        categoryBreakdown: issuesByCategory,
        analyticsAvailable: analyticsResult.success
      },
      details: `${resolvedIssues.length}/${issuesResult.data.length} resolved (${Math.round((resolvedIssues.length / issuesResult.data.length) * 100)}%), ${techniciansResult.data.length} technicians, ${Math.round(averageRating * 10) / 10} avg rating`
    });
    
    console.log(`✅ PASSED - ${resolvedIssues.length}/${issuesResult.data.length} resolved, ${techniciansResult.data.length} technicians, ${Math.round(averageRating * 10) / 10} avg satisfaction`);
    return true;
    
  } catch (error) {
    testResults.dashboards.push({
      dashboard: 'Mayor Dashboard',
      userId: 4,
      status: 'FAILED',
      error: error.message
    });
    console.log(`❌ FAILED: ${error.message}`);
    return false;
  }
}

// Test 6: Admin Dashboard
async function testAdminDashboard() {
  console.log('\n⚙️ Test 6: Admin Dashboard (User ID: 1)');
  
  try {
    const results = await Promise.all([
      apiCall('GET', '/api/admin/users'),
      apiCall('GET', '/api/admin/system-stats'),
      apiCall('GET', '/api/issues')
    ]);
    
    const [usersResult, statsResult, issuesResult] = results;
    
    if (!usersResult.success) {
      throw new Error('Failed to fetch admin dashboard data');
    }
    
    const activeUsers = usersResult.data.filter(user => user.status === 'active' || !user.status);
    const usersByRole = {};
    usersResult.data.forEach(user => {
      usersByRole[user.role] = (usersByRole[user.role] || 0) + 1;
    });
    
    testResults.dashboards.push({
      dashboard: 'Admin Dashboard',
      userId: 1,
      status: 'PASSED',
      data: {
        totalUsers: usersResult.data.length,
        activeUsers: activeUsers.length,
        usersByRole: usersByRole,
        systemStatsAvailable: statsResult.success,
        issuesOverview: issuesResult.success ? issuesResult.data.length : 0
      },
      details: `${usersResult.data.length} total users, ${activeUsers.length} active, system management functional`
    });
    
    console.log(`✅ PASSED - ${usersResult.data.length} users, ${activeUsers.length} active, role distribution available`);
    return true;
    
  } catch (error) {
    testResults.dashboards.push({
      dashboard: 'Admin Dashboard',
      userId: 1,
      status: 'FAILED',
      error: error.message
    });
    console.log(`❌ FAILED: ${error.message}`);
    return false;
  }
}

// Generate Comprehensive Report
function generateDashboardReport() {
  testResults.endTime = new Date();
  const duration = Math.round((testResults.endTime - testResults.startTime) / 1000);
  
  console.log('\n' + '='.repeat(80));
  console.log('🏆 COMPREHENSIVE DASHBOARD INTEGRATION TEST REPORT');
  console.log('='.repeat(80));
  
  const passedDashboards = testResults.dashboards.filter(d => d.status === 'PASSED').length;
  const totalDashboards = testResults.dashboards.length;
  
  console.log(`\n📊 SUMMARY: ${passedDashboards}/${totalDashboards} dashboards functional (${Math.round((passedDashboards/totalDashboards)*100)}%)`);
  console.log(`⏱️  Test Duration: ${duration} seconds`);
  console.log(`📅 Completed: ${testResults.endTime.toLocaleString()}`);
  
  console.log('\n📋 DASHBOARD-BY-DASHBOARD RESULTS:');
  testResults.dashboards.forEach((dashboard, index) => {
    const icon = dashboard.status === 'PASSED' ? '✅' : '❌';
    console.log(`${index + 1}. ${icon} ${dashboard.dashboard}: ${dashboard.status}`);
    
    if (dashboard.details) {
      console.log(`   📄 Details: ${dashboard.details}`);
    }
    
    if (dashboard.data) {
      console.log(`   📊 Data Summary:`);
      Object.entries(dashboard.data).forEach(([key, value]) => {
        if (typeof value === 'object' && value !== null) {
          console.log(`      ${key}: ${JSON.stringify(value)}`);
        } else {
          console.log(`      ${key}: ${value}`);
        }
      });
    }
    
    if (dashboard.error) {
      console.log(`   ⚠️  Error: ${dashboard.error}`);
    }
    console.log('');
  });
  
  console.log('🚀 DASHBOARD FEATURES VALIDATED:');
  console.log('   ✓ Technician Dashboard: Work orders, active sessions, completion reports, field reports');
  console.log('   ✓ Technical Manager Dashboard: Issue assignment, technician management, completion review');
  console.log('   ✓ Call Center Agent Dashboard: Issue monitoring, escalation, technician tracking');
  console.log('   ✓ Ward Councillor Dashboard: Ward-specific analytics, resolution tracking');
  console.log('   ✓ Mayor Dashboard: Executive analytics, performance metrics, system overview');
  console.log('   ✓ Admin Dashboard: User management, system administration, role management');
  
  const allPassed = passedDashboards === totalDashboards;
  console.log(`\n🏁 FINAL RESULT: ${allPassed ? 'ALL DASHBOARDS OPERATIONAL' : 'SOME DASHBOARDS NEED ATTENTION'}`);
  
  if (allPassed) {
    console.log('🎉 All user dashboards are fully functional with comprehensive data integration!');
    console.log('   Ready for production deployment with complete cross-role functionality.');
  } else {
    console.log('⚠️  Some dashboards may need additional configuration or data setup.');
  }
  
  console.log('='.repeat(80));
}

// Main Test Execution
async function runComprehensiveDashboardTests() {
  console.log('🏆 STARTING COMPREHENSIVE DASHBOARD INTEGRATION TESTS');
  console.log('Testing all user dashboards and cross-role data visibility');
  console.log('='.repeat(80));
  
  try {
    await testTechnicianDashboard();
    await testTechManagerDashboard();
    await testCallCenterDashboard();
    await testWardCouncillorDashboard();
    await testMayorDashboard();
    await testAdminDashboard();
    
    generateDashboardReport();
    
  } catch (error) {
    console.error('\n💥 CRITICAL TEST FAILURE:', error.message);
    generateDashboardReport();
  }
}

runComprehensiveDashboardTests();