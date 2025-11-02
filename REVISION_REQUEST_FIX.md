# Revision Request Feature - Implementation Summary

## Issue Reported
When clients tried to request a revision on an order with status `in_review`, they received an error:
```
Status cannot be directly set to booked or revision_requested via this endpoint
```

## Root Cause
The **OrderDetailsPage** component had uncommitted code that was calling the generic `updateOrderStatus('revision_requested')` endpoint, which doesn't allow direct status changes to `revision_requested`. The backend has a dedicated endpoint for revision requests that requires feedback.

## Solution Implemented

### 1. **OrderDetailsPage.jsx** - Revision Modal
Added a complete revision request flow:

```javascript
// State for modal and feedback
const [showRevisionModal, setShowRevisionModal] = useState(false);
const [revisionFeedback, setRevisionFeedback] = useState('');

// Handler for revision request
const handleRequestRevision = async () => {
  if (!revisionFeedback.trim()) {
    setError('Please provide feedback for the revision request');
    return;
  }

  try {
    setActionLoading(true);
    await api.requestRevision(id, { feedback: revisionFeedback });
    await fetchOrderDetails();
    setShowRevisionModal(false);
    setRevisionFeedback('');
    setError(null);
  } catch (err) {
    setError(err.response?.data?.message || 'Failed to request revision');
  } finally {
    setActionLoading(false);
  }
};
```

**Button Change:**
- ❌ **Before:** `onClick={() => updateOrderStatus('revision_requested')}`
- ✅ **After:** `onClick={() => setShowRevisionModal(true)}`

**Modal Features:**
- Textarea for detailed revision feedback
- Cancel button to close modal
- Submit button that calls `api.requestRevision()`
- Validation: Requires non-empty feedback

### 2. **StudentDashboard.jsx** - Visual Indicators
Enhanced the student's order view to show revision requests clearly:

#### Status Colors
Added status color for `revision_requested`:
```javascript
case 'revision_requested': 
  return 'text-orange-600 bg-orange-100 dark:bg-orange-900 dark:text-orange-300';
```

Also added colors for other missing statuses:
- `booked` - Blue
- `accepted` - Cyan
- `cancelled` - Red

#### Summary Cards
Added a **5th card** for Revisions:
```javascript
<div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
  <div className="text-sm text-orange-600 dark:text-orange-400">Revisions</div>
  <div className="text-2xl font-bold text-orange-700 dark:text-orange-300">
    {orders.filter(o => o.status === 'revision_requested').length}
  </div>
</div>
```

#### Visual Indicators
Added "Action required" label for revision requests:
```javascript
{order.status === 'revision_requested' && (
  <div className="text-xs text-orange-500 dark:text-orange-400 mt-1">
    Action required
  </div>
)}
```

## API Integration
The solution properly uses the dedicated backend endpoint:

**Frontend:**
```javascript
// services/api.js
async requestRevision(orderId, revisionRequest) {
  return this.request(`/orders/${orderId}/request-revision`, {
    method: 'PATCH',
    body: JSON.stringify(revisionRequest)
  });
}
```

**Backend:**
```javascript
// PATCH /api/orders/:id/request-revision
// Expects: { feedback: string }
// Updates: status to 'revision_requested', increments requestedRevisionCount
// Creates: Notification to student with feedback
```

## Order Lifecycle Flow

```
booked → accepted → in_progress → in_review → revision_requested
                                              ↓
                                         in_progress (rework)
                                              ↓
                                         in_review (resubmit)
                                              ↓
                                         completed
```

## Deployment
Changes have been committed and pushed to GitHub:

1. **Commit 1:** `feat: Add revision request modal with feedback for proper API integration`
   - OrderDetailsPage with complete modal implementation

2. **Commit 2:** `feat: Add revision_requested status support in StudentDashboard with visual indicators`
   - StudentDashboard enhancements for better visibility

Vercel will automatically deploy these changes. The frontend should update within 2-3 minutes.

## Testing Checklist
After deployment completes:

1. **Client Side (OrderDetailsPage):**
   - [ ] Navigate to an order with status `in_review`
   - [ ] Click "Request Revision" button
   - [ ] Verify modal opens with textarea
   - [ ] Try submitting without feedback (should show error)
   - [ ] Enter feedback and submit
   - [ ] Verify order status updates to `revision_requested`

2. **Student Side (StudentDashboard):**
   - [ ] Check "Revisions" summary card shows correct count
   - [ ] Verify revision_requested orders show orange badge
   - [ ] Confirm "Action required" label appears below status
   - [ ] Click "View Details" to see revision feedback

3. **Order Details:**
   - [ ] Student should see revision feedback from client
   - [ ] Student can upload new delivery files
   - [ ] Status transitions back through workflow

## Files Modified
- `client/src/pages/OrderDetailsPage.jsx` - Added revision modal
- `client/src/pages/StudentDashboard.jsx` - Enhanced visual indicators
- `REVISION_REQUEST_FIX.md` - This documentation

## Related Backend Files (No changes needed)
- `server/controllers/orderController.js` - `requestRevision` handler
- `server/routes/orderRoutes.js` - `PATCH /:id/request-revision` route
- `server/models/Order.js` - `revision_requested` status, `requestedRevisionCount` field
