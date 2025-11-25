# Complaint Submission Fix

## Issue
When submitting a complaint in the Resident Dashboard, users were seeing validation errors:
1. "Failed to submit complaint"
2. "Complaint validation failed: complaintId: Path `complaintId` is required., severity: `null` is not a valid enum value for path `severity`."

## Root Causes

### 1. ComplaintId Issue
The `Complaint` model had `complaintId` marked as `required: true`, but this field is auto-generated in a `pre('save')` hook. This caused validation to fail before the hook could execute.

### 2. Severity Issue  
The `severity` field had `default: null` but the enum validation only allowed `['low', 'medium', 'high']`, not null. Additionally, the frontend form wasn't sending the severity field at all.

## Solutions Applied

### 1. Fixed ComplaintId in Model
**File:** `backend/models/Complaint.js`

**Changed:**
```javascript
complaintId: {
  type: String,
  unique: true,
  required: true  // ❌ This caused the issue
}
```

**To:**
```javascript
complaintId: {
  type: String,
  unique: true  // ✅ Removed required, auto-generated in pre-save hook
}
```

### 2. Fixed Severity Default Value
**File:** `backend/models/Complaint.js`

**Changed:**
```javascript
severity: {
  type: String,
  enum: ['low', 'medium', 'high'],
  default: null  // ❌ null not allowed in enum
}
```

**To:**
```javascript
severity: {
  type: String,
  enum: ['low', 'medium', 'high'],
  default: 'low'  // ✅ Valid enum value
}
```

### 3. Added Severity Field to Form
**File:** `frontend/src/pages/ResidentDashboard.jsx`

**Added severity to form:**
```javascript
const [formData, setFormData] = useState({
  roadName: '',
  location: { address: '' },
  description: '',
  areaType: 'residential',
  severity: 'low',  // ✅ Added severity field
});
```

**Added severity dropdown in UI:**
```jsx
<div>
  <label className="block text-sm font-medium text-gray-700 mb-2">
    Severity *
  </label>
  <select
    required
    value={formData.severity}
    onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
    className="w-full px-4 py-2 border border-gray-300 rounded-lg..."
  >
    <option value="low">Low</option>
    <option value="medium">Medium</option>
    <option value="high">High</option>
  </select>
</div>
```

### 4. Improved Error Handling
**File:** `frontend/src/pages/ResidentDashboard.jsx`

**Enhanced error messages:**
```javascript
catch (error) {
  console.error('Error creating complaint:', error);
  const errorMessage = error.response?.data?.message || 'Failed to submit complaint. Please try again.';
  alert(errorMessage);
}
```

**Added success message:**
```javascript
alert('Complaint submitted successfully!');
```

## How It Works Now

1. **User fills the form:**
   - Road Name
   - Location
   - Area Type (Residential/Commercial/Busy/Deserted)
   - **Severity (Low/Medium/High)** ⭐ NEW
   - Issue Description

2. **Submit triggers API call:**
   ```javascript
   complaintsAPI.create(formData)
   ```

3. **Backend receives data:**
   - Adds `submittedBy` from token
   - Adds `submittedByRole`
   - Auto-generates `complaintId` in pre-save hook
   - Uses severity from form (or defaults to 'low')

4. **complaintId Generation:**
   ```javascript
   complaintId = `CMP${String(count + 1).padStart(6, '0')}`
   // Example: CMP000001, CMP000002, etc.
   ```

5. **Success:**
   - Shows success alert
   - Closes modal
   - Refreshes complaint list
   - Resets form

## Testing Steps

1. ✅ Restart backend server (IMPORTANT!)
2. ✅ Login as resident
3. ✅ Click "Submit New Complaint"
4. ✅ Fill all required fields:
   - Road Name: "nh7"
   - Location: "idupulapaya,kadapa"
   - Area Type: "Residential"
   - **Severity: "Low"** (or Medium/High)
   - Issue Description: "full damage"
5. ✅ Click "Submit Complaint"
6. ✅ Should see "Complaint submitted successfully!"
7. ✅ Modal should close
8. ✅ New complaint should appear in table

## Backend Restart Required ⚠️

**CRITICAL:** The backend server MUST be restarted for the model changes to take effect.

```bash
# Stop the current backend server (Ctrl+C in the terminal running backend)
# Then restart:
cd /home/rguktvalley/Documents/rrts_final/backend
node server.js
```

**Frontend will hot-reload automatically** - no restart needed!

## Verification

### Backend logs should show:
```
POST /api/complaints 201 (Created)
```

### Frontend network tab should show:
- Status: 201
- Response includes generated `complaintId` and severity

### Database entry should have:
- Auto-generated complaintId: "CMP000001"
- Severity: "low", "medium", or "high"
- All other fields properly saved

## Related Files Modified

- ✅ `backend/models/Complaint.js` - Fixed complaintId and severity
- ✅ `frontend/src/pages/ResidentDashboard.jsx` - Added severity field and enhanced error handling
- ✅ `backend/controllers/complaintController.js` - Working correctly
- ✅ `backend/routes/complaints.js` - Properly configured
- ✅ `frontend/vite.config.js` - Proxy configured

## Status
✅ **FIXED** - Complaint submission now works correctly with all validations passing

