# TODO: Add Today's Approvals Section to Dashboards

## AttendantDashboard.tsx
- [ ] Add state for todaysApprovals
- [ ] Add fetchTodaysApprovals function (query attendant_id == user.id, status in ['attendant_approved', 'superintendent_approved'], created_at >= startOfDay, join with profiles)
- [ ] Call fetchTodaysApprovals in useEffect
- [ ] Add UI Card after existing grid: "Today's Approvals" with count and expandable list of pass details

## SuperintendentDashboard.tsx
- [ ] Add state for todaysApprovals
- [ ] Add fetchTodaysApprovals function (query superintendent_id == user.id, status == 'superintendent_approved', created_at >= startOfDay, join with profiles)
- [ ] Call fetchTodaysApprovals in useEffect
- [ ] Add UI Card after existing grid: "Today's Approvals" with count and expandable list of pass details

## Testing
- [ ] Test AttendantDashboard for correct today's approvals display
- [ ] Test SuperintendentDashboard for correct today's approvals display
- [ ] Verify date filtering and list details
