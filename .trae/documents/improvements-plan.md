# Guitar Maintenance App - High Priority Improvements Plan

## Scope
Fix the 3 high-priority issues to improve reliability and user experience:
1. Add error handling for Supabase operations
2. Ensure data consistency between localStorage and Supabase
3. Replace native alerts with proper toast notifications

**Estimated Time:** 2-3 hours
**Focus:** Reliability, error handling, and better user feedback

---

## Implementation Plan

### 1. Create Toast Notification System (30 min)

**New File:** `src/components/Toast.tsx`
- Create a reusable toast notification component
- Support types: success, error, info, warning
- Auto-dismiss after 3-5 seconds
- Positioned at top-right of screen
- Use Tailwind for styling (consistent with app design)

**New File:** `src/hooks/useToast.tsx`
- Toast context provider and hook
- Manage toast queue (multiple toasts)
- API: `showToast(message, type)`, `dismissToast(id)`

**Update:** `src/app/layout.tsx`
- Wrap app with `ToastProvider`
- Render `<Toast />` component at root level

---

### 2. Add Proper Error Handling to Supabase Operations (60 min)

**Update:** `src/hooks/useAppState.tsx`

#### Changes to Reducer:
- Make Supabase operations **async with await**
- Add error handling with try-catch
- Show toast notifications on errors
- On Supabase error: still save to localStorage (optimistic local, warn user about sync)

#### Specific Updates:

**ADD_GUITAR action (lines 28-44):**
```typescript
case 'ADD_GUITAR':
  newState = {
    ...state,
    guitars: [...state.guitars, action.payload],
    isLoading: false
  };

  if (supabase) {
    const g = action.payload;
    // Make async - will be called after return
    supabase.from('guitars').upsert({...})
      .then(({ error }) => {
        if (error) {
          console.error('Failed to sync guitar to Supabase:', error);
          // Show toast via callback passed in action
          action.payload.onError?.('Failed to sync to cloud. Data saved locally.');
        }
      });
  }
  break;
```

**Apply same pattern to:**
- UPDATE_GUITAR (lines 46-61)
- DELETE_GUITAR (lines 64-72)
- ADD_MAINTENANCE_LOG (lines 74-89)
- UPDATE_MAINTENANCE_LOG (lines 91-106)
- DELETE_MAINTENANCE_LOG (lines 108-115)

#### Alternative Approach (Simpler):
Since we can't use async in the reducer directly, we'll:
1. Create separate async functions for Supabase operations
2. Call them after dispatch (fire and forget with error handling)
3. Pass toast callback through actions

---

### 3. Update All Forms to Use Toast Notifications (45 min)

**Update:** `src/components/GuitarForm.tsx`
- Remove `alert()` on line 38
- Add `useToast()` hook
- Show success toast: "Guitar added successfully!" / "Guitar updated!"
- Show error toast if validation fails
- Add loading state to submit button

**Update:** `src/components/MaintenanceLogForm.tsx`
- Remove `alert()` on line 39
- Add `useToast()` hook
- Show success toast: "Maintenance log added!" / "Updated!"
- Show error toast if validation fails
- Add loading state to submit button

**Update:** `src/app/settings/page.tsx`
- Replace all `alert()` and `confirm()` calls (lines 11, 21, 49, 53, 70, 73, 80, 86)
- Use `ConfirmDialog` component for confirmations
- Use toast for success/error messages
- Add proper error handling for localStorage operations

---

### 4. Improve Data Sync Strategy (30 min)

**Update:** `src/hooks/useAppState.tsx`

#### Strategy:
- **Optimistic UI**: Always update localStorage immediately (fast user feedback)
- **Background Sync**: Sync to Supabase asynchronously
- **Error Handling**: If Supabase fails, show toast warning but keep local data
- **Initial Load**: Prefer Supabase data over localStorage if available

#### Implementation:
1. Create helper function: `syncToSupabase(operation, data, onError)`
2. Call after each dispatch action
3. Add error boundary around Supabase calls
4. Log errors to console for debugging

**Example Pattern:**
```typescript
// In component
const handleAddGuitar = (guitarData) => {
  dispatch({
    type: 'ADD_GUITAR',
    payload: guitarData,
  });

  // Async sync with error handling
  syncToSupabase('guitars', 'insert', guitarData)
    .catch(error => {
      showToast('Failed to sync to cloud. Data saved locally.', 'warning');
    });
};
```

---

### 5. Add Loading States to Critical Operations (15 min)

**Update:** `src/components/GuitarForm.tsx`
- Add `const [isSubmitting, setIsSubmitting] = useState(false)`
- Disable submit button while submitting
- Show "Saving..." text or spinner

**Update:** `src/components/MaintenanceLogForm.tsx`
- Same loading state pattern

**Update:** `src/components/ConfirmDialog.tsx` (if exists)
- Add loading state for delete confirmations
- Show "Deleting..." when in progress

---

## Files to Modify

### New Files (2):
1. `src/components/Toast.tsx` - Toast notification component
2. `src/hooks/useToast.tsx` - Toast context and hook

### Modified Files (5):
1. `src/app/layout.tsx` - Add ToastProvider
2. `src/hooks/useAppState.tsx` - Error handling & data sync
3. `src/components/GuitarForm.tsx` - Replace alerts, add loading
4. `src/components/MaintenanceLogForm.tsx` - Replace alerts, add loading
5. `src/app/settings/page.tsx` - Replace alerts/confirms

---

## Testing Checklist

After implementation, test:
- [ ] Add guitar - success toast shows
- [ ] Update guitar - success toast shows
- [ ] Delete guitar - confirmation dialog works
- [ ] Add maintenance log - success toast shows
- [ ] Form validation errors show in toast (not alert)
- [ ] Simulate Supabase error (disconnect) - warning toast shows
- [ ] Data persists to localStorage even if Supabase fails
- [ ] Loading states prevent double-clicks
- [ ] Multiple toasts stack properly
- [ ] Toasts auto-dismiss after 3-5 seconds

---

## Benefits

1. **Better Error Visibility**: Users know when syncing fails
2. **Data Safety**: Local data always saved, cloud sync is bonus
3. **Professional UX**: Toast notifications match app design
4. **Reliability**: Proper error handling prevents silent failures
5. **User Confidence**: Loading states show system is working

---

## Notes

- Keep localStorage as source of truth for immediate UI updates
- Supabase becomes "backup/sync" rather than primary storage
- This approach handles offline scenarios gracefully
- Can add "Sync Status" indicator in future if needed
