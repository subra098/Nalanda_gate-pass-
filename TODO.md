# TODO: Add Profile Icon to Security Dashboard

- [ ] Add profile state variables (profile, showProfile) to SecurityDashboard.tsx
- [ ] Implement fetchProfile function to query profiles table for current user
- [ ] Call fetchProfile in useEffect alongside fetchLogs
- [ ] Add profile icon button (User icon) to the header next to the title
- [ ] Implement toggle functionality for showProfile on icon click
- [ ] Add conditional rendering for profile display card above main content
- [ ] Display profile fields (full_name, roll_no, hostel, parent_contact, college_email) in the card
- [ ] Handle case when profile is null (show fallback message or user email)
- [ ] Add loading state and error handling for profile fetch
- [ ] Test profile icon click and display functionality
- [ ] Verify integration with existing dashboard features
