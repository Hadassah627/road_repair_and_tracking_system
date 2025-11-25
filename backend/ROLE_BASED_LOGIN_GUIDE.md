# Role-Based Login System Implementation Guide

## Overview
This guide explains the complete implementation of the role-based login system for the Road Repair and Tracking System (RRTS) project.

## System Flow

### 1. Landing Page Role Selection
When users visit the landing page, they see 5 role cards:
- **Resident** 👤
- **Clerk** 📝
- **Supervisor** 👷
- **Administrator** ⚙️
- **Mayor** 🏛️

Each card is clickable and performs the following actions:
```javascript
onClick={() => {
  localStorage.setItem('selectedRole', 'role_name');
  navigate('/login');
}}
```

### 2. Login Page Dynamic Display
The Login page reads the selected role from localStorage and displays:
- **Role-specific icon** (e.g., 👤 for Resident)
- **Dynamic heading** (e.g., "Resident Login")
- **Role-specific message** (e.g., "Sign in to your resident account")

**Key Features:**
- Validates that the user logging in matches the selected role
- Shows error if role mismatch detected
- Clears selectedRole from localStorage after successful login

### 3. Registration with Pre-selected Role
When users click "Register" from a role card or login page:
- The role dropdown is pre-filled with the selected role
- Users can still change the role if needed
- Clears selectedRole from localStorage after successful registration

### 4. Dashboard Routing
After successful login, users are automatically redirected to their role-specific dashboard:
- **Resident** → ResidentDashboard
- **Clerk** → ClerkDashboard
- **Supervisor** → SupervisorDashboard
- **Administrator** → AdministratorDashboard
- **Mayor** → MayorDashboard

## Implementation Details

### Files Modified

#### 1. LandingPage.jsx
**Changes:**
- Added `onClick` handlers to all 5 role cards
- Added cursor pointer and hover effects
- Added "Login as [Role]" buttons to each card
- Store selected role in localStorage before navigation

**Example Code:**
```jsx
<div 
  onClick={() => {
    localStorage.setItem('selectedRole', 'resident');
    navigate('/login');
  }}
  className="...cursor-pointer hover:border-blue-500"
>
  {/* Card content */}
  <button className="mt-4 w-full bg-blue-600...">
    Login as Resident
  </button>
</div>
```

#### 2. Login.jsx
**Changes:**
- Added state for `selectedRole`
- Added `useEffect` to read role from localStorage
- Added role validation logic in submit handler
- Added helper functions: `getRoleDisplayName()` and `getRoleIcon()`
- Updated UI to display role-specific information
- Clear selectedRole after successful login

**Key Functions:**
```jsx
// Get selected role on component mount
React.useEffect(() => {
  const role = localStorage.getItem('selectedRole');
  if (role) {
    setSelectedRole(role);
  }
}, []);

// Validate role on login
if (selectedRole && result.user && result.user.role !== selectedRole) {
  setError(`Please login with ${selectedRole} credentials`);
  return;
}

// Clear after success
localStorage.removeItem('selectedRole');
```

#### 3. Register.jsx
**Changes:**
- Read selectedRole from localStorage for initial form state
- Pre-select the role in the form
- Clear selectedRole after successful registration

**Example Code:**
```jsx
const initialRole = localStorage.getItem('selectedRole') || 'resident';

const [formData, setFormData] = useState({
  // ...other fields
  role: initialRole,
});
```

#### 4. AuthContext.jsx
**Changes:**
- Updated `login` function to return user data in success response
- This allows Login component to validate role match

```jsx
return { success: true, user: response.data.user };
```

### State Management

**LocalStorage Usage:**
- **Key:** `selectedRole`
- **Values:** 'resident', 'clerk', 'supervisor', 'administrator', 'mayor'
- **Lifecycle:**
  - Set: When role card is clicked on landing page
  - Read: On Login/Register page mount
  - Clear: After successful login or registration

## User Experience Flow

### Scenario 1: Resident Login
1. User visits landing page
2. Clicks on "Resident" card
3. Redirected to login page showing "👤 Resident Login"
4. Enters credentials
5. System validates:
   - Credentials are correct
   - User's role in database is 'resident'
6. Redirects to Resident Dashboard

### Scenario 2: Role Mismatch
1. User clicks "Clerk" card
2. Login page shows "📝 Clerk Login"
3. User enters Resident credentials
4. System detects role mismatch
5. Shows error: "Please login with clerk credentials"
6. User can click "Back to Home" to select different role

### Scenario 3: Direct Login (No Role Selected)
1. User navigates directly to /login
2. Login page shows generic "RRTS Login"
3. User enters credentials
4. System validates credentials only (no role check)
5. Redirects to appropriate dashboard based on user's role

### Scenario 4: Registration from Role Card
1. User clicks "Supervisor" card
2. Clicks "Register here" link on login page
3. Register page opens with "Supervisor" pre-selected
4. User fills form (can change role if needed)
5. Successful registration redirects to Supervisor Dashboard

## Security Considerations

1. **Client-side Validation Only:**
   - Role selection is for UX enhancement
   - Backend must still validate user roles
   - Never trust localStorage for security decisions

2. **Token-based Authentication:**
   - JWT token stored in localStorage
   - Token contains user role information
   - Backend validates token on every request

3. **Role-based Access Control:**
   - Protected routes check user role
   - Unauthorized access redirects to /unauthorized
   - Each dashboard only accessible by correct role

## Testing Checklist

- [ ] Click each role card (Resident, Clerk, Supervisor, Administrator, Mayor)
- [ ] Verify login page shows correct role name and icon
- [ ] Test successful login with matching role
- [ ] Test login with mismatched role (should show error)
- [ ] Test direct navigation to /login (no role selected)
- [ ] Verify selectedRole is cleared after successful login
- [ ] Test registration with pre-selected role
- [ ] Verify correct dashboard loads for each role
- [ ] Test "Back to Home" button functionality
- [ ] Verify mobile responsiveness of role cards

## Code Quality Features

✅ **Clean Code:**
- Modular helper functions
- Clear variable naming
- Proper error handling

✅ **User Experience:**
- Visual feedback (hover effects, borders)
- Clear error messages
- Role icons for quick recognition

✅ **Maintainability:**
- Centralized role configuration
- Easy to add new roles
- Consistent pattern across components

✅ **Performance:**
- Minimal re-renders
- Efficient state management
- No unnecessary API calls

## Future Enhancements

1. **Role Descriptions Modal:**
   - Add info button on each card
   - Show detailed role responsibilities

2. **Role-based Registration Validation:**
   - Some roles may require admin approval
   - Different registration fields per role

3. **Multi-factor Authentication:**
   - Enhanced security for admin/mayor roles
   - Optional 2FA for all users

4. **Session Management:**
   - Remember selected role preference
   - Quick role switching for multi-role users

## Troubleshooting

### Issue: Login page doesn't show role name
**Solution:** Check if localStorage.setItem is being called in LandingPage role card onClick

### Issue: Role mismatch error not showing
**Solution:** Verify AuthContext returns user object in login response

### Issue: Wrong dashboard after login
**Solution:** Check App.jsx DashboardRouter switch statement for correct role mapping

### Issue: selectedRole persists after logout
**Solution:** Add localStorage.removeItem('selectedRole') in logout function

## Support

For additional help or questions about the role-based login system:
1. Review the code comments in each modified file
2. Check console.log statements for debugging
3. Verify localStorage contents in browser DevTools
4. Test with different user accounts for each role

---

**Last Updated:** November 13, 2025
**Version:** 1.0
**Author:** RRTS Development Team
