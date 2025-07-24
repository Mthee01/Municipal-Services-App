# Municipal System Test Scenarios

## Test Overview
This document outlines 6 comprehensive test scenarios covering citizen issue reporting, technician field work, and technical manager oversight workflows.

## Demo Credentials
- **Citizen**: username: `citizen`, password: `password`
- **Technician**: username: `technician`, password: `password` 
- **Tech Manager**: username: `techmanager`, password: `password`

## Scenario 1: Citizen Issue Reporting with Photo Upload
**Objective**: Test complete citizen issue reporting workflow from creation to tracking

### Test Steps:
1. **Login as Citizen**
   - Navigate to login page
   - Enter credentials: username: `citizen`, password: `password`
   - Verify dashboard loads with citizen interface

2. **Create New Issue**
   - Click "Report New Issue" button
   - Fill in details:
     - Title: "Water leak on Main Street causing flooding"
     - Category: "Water"
     - Priority: "High"
     - Location: "123 Main Street, Cape Town"
     - Description: "Large water leak from municipal pipe causing street flooding and property damage"
   - Upload test photo (use test_image.jpeg)
   - Submit issue

3. **Verify Issue Creation**
   - Check issue appears in citizen dashboard
   - Verify unique reference number is generated (6-character format)
   - Confirm status shows as "Open"
   - Verify photo is displayed

### Expected Results:
- Issue created successfully with reference number
- Photo uploaded and visible
- Status tracking available for citizen
- Issue appears in call center and tech manager dashboards

---

## Scenario 2: Call Center Agent Issue Management and Escalation
**Objective**: Test call center agent capabilities for issue monitoring and escalation

### Test Steps:
1. **Login as Call Center Agent**
   - Username: `agent`, password: `password`
   - Verify agent dashboard loads

2. **Review New Citizen Issues**
   - Locate the water leak issue from Scenario 1
   - Verify issue details are visible
   - Check reference number is displayed

3. **Add Communication Notes**
   - Click "Notes" button on the issue
   - Add note: "Contacted citizen for additional details. Confirmed flooding is affecting 3 properties. Requires urgent attention."
   - Save note

4. **Escalate to Technical Manager**
   - Click "Escalate" button
   - Select escalation reason: "Urgent - Multiple properties affected"
   - Add escalation notes: "Water leak causing property damage to multiple homes. Requires immediate technical response."
   - Submit escalation

### Expected Results:
- Notes saved and visible in issue history
- Issue escalated and priority changed to "urgent"
- Technical manager receives escalation notification
- Issue shows red flashing indicator in tech manager dashboard

---

## Scenario 3: Technical Manager Issue Assignment and Oversight
**Objective**: Test technical manager's ability to assign issues and monitor technician performance

### Test Steps:
1. **Login as Technical Manager**
   - Username: `techmanager`, password: `password`
   - Verify tech manager dashboard loads

2. **Review Escalated Issues**
   - Navigate to "Issues" tab
   - Locate escalated water leak issue (red flashing indicator)
   - Click "Details" to view full information

3. **Assign Issue to Technician**
   - Select issue for assignment
   - Choose technician: "Tom Technician"
   - Add assignment notes: "Urgent water leak repair. Bring pipe coupling materials and high-pressure equipment."
   - Assign issue

4. **Monitor Technician Location**
   - Navigate to "Location Tracking" tab
   - Select "Tom Technician" from dropdown
   - Verify real-time location data is displayed
   - Check GPS coordinates and accuracy

### Expected Results:
- Issue successfully assigned to technician
- Job order number generated (JO-XXX-2025 format)
- Technician receives work assignment
- Location tracking shows technician data
- Issue status changes to "assigned"

---

## Scenario 4: Technician Field Work and Completion Report
**Objective**: Test complete technician workflow from work assignment to completion

### Test Steps:
1. **Login as Field Technician**
   - Username: `technician`, password: `password`
   - Verify technician dashboard loads

2. **Start Work on Assigned Issue**
   - Navigate to "Work Orders" tab
   - Locate assigned water leak issue
   - Click "Start Work" button
   - Verify work session begins

3. **Update Location and Progress**
   - Navigate to "Location & Travel" tab
   - Enable GPS location sharing
   - Verify location is being transmitted

4. **Complete Work with Photo Documentation**
   - Return to "Active Work" tab
   - Click "Close Issue & Complete Work"
   - Fill completion report:
     - Work Description: "Repaired burst water pipe using new PVC coupling. Isolated water supply, cut damaged section, installed new coupling with sealant. Tested water pressure and flow. Cleaned work area."
     - Materials Used: "PVC Coupling, Pipe Sealant, Pipe Clamps"
     - Time Taken: 90 minutes
     - Issues Found: "Old pipe coupling failed due to age and ground movement"
     - Recommendations: "Inspect adjacent pipe sections within 3 months"
     - Customer Satisfaction: 5 stars
     - Additional Notes: "Citizen very satisfied with quick response. Area cleaned up completely."
   - Capture work completion photos
   - Submit completion report

### Expected Results:
- Work session tracked correctly
- GPS location transmitted to management
- Completion report submitted with photos
- Issue status changes to "resolved"
- Technical manager receives completion report for review

---

## Scenario 5: Technical Manager Completion Report Approval
**Objective**: Test technical manager's ability to review and approve completion reports

### Test Steps:
1. **Login as Technical Manager**
   - Verify tech manager dashboard
   - Navigate to "Completed Work" tab

2. **Review Completion Report**
   - Locate water leak completion report
   - Click "View Report" to see full details
   - Review work description, materials, photos, and customer satisfaction

3. **Approve Completion Report**
   - Click "Approve" button
   - Add review notes: "Excellent work on the water leak repair. Professional completion with proper materials and cleanup. Customer satisfaction rating of 5/5 shows quality service delivery."
   - Submit approval

### Expected Results:
- Completion report status changes to "approved"
- Review notes saved in system
- Report shows green "Approved" badge
- Approval audit trail maintained

---

## Scenario 6: Technical Manager Completion Report Rejection and Issue Reopening
**Objective**: Test rejection workflow and automatic issue reopening

### Test Steps:
1. **Create Second Issue for Rejection Test**
   - Login as citizen and create new issue:
     - Title: "Broken streetlight on Oak Avenue"
     - Category: "Electricity"
     - Priority: "Medium"
     - Location: "Oak Avenue near School"

2. **Quick Assignment and Completion**
   - Login as tech manager, assign to technician
   - Login as technician, complete work with minimal report:
     - Work Description: "Fixed light"
     - Materials Used: "Bulb"
     - Time Taken: 15 minutes
     - Customer Satisfaction: 3 stars

3. **Technical Manager Rejection**
   - Login as tech manager
   - Navigate to "Completed Work" tab
   - Locate streetlight completion report
   - Click "Reject" button
   - Add rejection reason: "Completion report lacks sufficient detail. Please provide comprehensive description of work performed, root cause analysis, and proper materials documentation. Customer satisfaction of 3/5 indicates possible service issues."
   - Submit rejection

4. **Verify Issue Reopening**
   - Check that issue status changes back to "assigned"
   - Verify issue returns to "Active Work" in tech manager dashboard
   - Confirm rejection notes appear in issue history
   - Verify technician can see rejection feedback

### Expected Results:
- Completion report marked as "rejected" with red badge
- Issue automatically reopened and status changed to "assigned"
- Rejection notes added to issue history
- Issue appears back in active work queue
- Technician receives feedback about required improvements

---

## Verification Checklist

### Data Persistence Tests:
- [ ] Issue reference numbers persist across sessions
- [ ] Notes and escalations remain in database
- [ ] Photo uploads are stored and accessible
- [ ] Completion reports with status are maintained
- [ ] GPS location data is recorded
- [ ] Approval/rejection decisions are auditable

### Cross-Role Visibility Tests:
- [ ] Citizen issues visible to call center agents
- [ ] Escalated issues show in tech manager dashboard
- [ ] Assigned issues appear in technician dashboard
- [ ] Completion reports visible to tech managers
- [ ] Status changes reflect across all relevant dashboards

### Workflow Integration Tests:
- [ ] Issue creation → assignment → completion → approval flow works end-to-end
- [ ] Escalation process updates priority and notifications
- [ ] GPS tracking transmits from technician to management
- [ ] Photo documentation carries through completion workflow
- [ ] Rejection workflow reopens issues correctly

### Security and Access Control Tests:
- [ ] Users only see appropriate data for their role
- [ ] Technicians can only work on assigned issues
- [ ] Status changes require proper authorization
- [ ] Cross-user data access is properly controlled

## Test Execution Notes
1. Run tests in sequential order for best results
2. Use browser developer tools to monitor API calls
3. Check database persistence by logging out and back in
4. Verify real-time updates by having multiple browser tabs open
5. Test photo upload with actual image files
6. Monitor GPS location accuracy and transmission timing

## Success Criteria
All 6 scenarios should complete successfully with:
- Proper data flow between user roles
- Persistent storage of all information
- Real-time updates and notifications
- Complete audit trails for all actions
- Working photo upload and GPS tracking
- Functional approval/rejection workflow with issue reopening