# Implementation Plan: Toast Notifications & Error Handling

## Executive Summary

This plan implements the high-priority improvements from `improvements-plan.md` while ensuring **zero breaking changes** to existing functionality. We'll use an incremental, phase-by-phase approach where each phase can be tested before moving to the next.

---

## Current State Analysis

### Issues Found

**1. useAppState.tsx (lines 34-115)**
- Supabase operations are "fire-and-forget" (no error handling)
- All 6 CRUD operations lack `.then()` error checks or `.catch()` blocks
- Silent failures possible when Supabase is down or has errors
- Example (line 36-43):
  ```typescript
  supabase.from('guitars').upsert({...}); // No error handling!
  ```

**2. Forms Use Native Alerts**
- `GuitarForm.tsx` line 38: `alert('Please fill in...')`
- `MaintenanceLogForm.tsx` line 39: `alert('Please fill in...')`
- Native alerts are blocking and don't match app design

**3. Settings Page Uses Native Dialogs**
- 3x `confirm()` calls (lines 11, 53, 80)
- 5x `alert()` calls (lines 21, 49, 70, 73, 86)
- Inconsistent UX (some features use ConfirmDialog, settings doesn't)

### What Works Well (DON'T TOUCH)

✅ **ConfirmDialog component** - Already exists and used successfully
✅ **Reducer pattern** - Clean, works well
✅ **localStorage sync** - Reliable, saves after every action
✅ **Data loading** - Supabase → localStorage fallback works
✅ **Styling system** - Consistent Tailwind + custom classes
✅ **Component architecture** - Well-structured, maintainable

---

## Implementation Strategy: 4 Phases

Each phase is **independent and testable**. If any phase has issues, we can pause without breaking the app.

### Phase 1: Toast System Foundation (NEW FILES ONLY)
**Risk Level:** 🟢 Very Low (only adds new files)

**Files to Create:**
1. `src/components/Toast.tsx` - Toast notification component
2. `src/contexts/ToastContext.tsx` - Toast provider & hook

**Files to Modify:**
1. `src/app/layout.tsx` - Wrap with ToastProvider (1 line change)

**What This Achieves:**
- Toast system available app-wide
- Doesn't change any existing behavior
- Can test toast in isolation

**Implementation Details:**

**Toast.tsx:**
- Positioned fixed at top-right
- Support 4 types: success, error, warning, info
- Auto-dismiss after 4 seconds
- Stack multiple toasts vertically
- Smooth animations (slide-in from right, fade out)
- Use existing Tailwind patterns
- Include icon from lucide-react based on type

**ToastContext.tsx:**
- `ToastProvider` component wraps app
- `useToast()` hook exposes: `showToast(message, type)`
- Internal queue management (max 3 toasts visible)
- Auto-increment IDs for toasts
- Dismiss by ID or auto after timeout

**Testing After Phase 1:**
- Call `showToast()` from browser console
- Verify toasts appear, stack, and dismiss
- Check all 4 types render correctly
- Ensure no impact on existing functionality

---

### Phase 2: Replace Form Alerts (LOW RISK)
**Risk Level:** 🟡 Low (isolated changes)

**Files to Modify:**
1. `src/components/GuitarForm.tsx`
2. `src/components/MaintenanceLogForm.tsx`

**Changes Per Form:**
1. Import `useToast()` hook
2. Replace `alert()` with `showToast(message, 'error')`
3. Add success toast after dispatch
4. Add loading state: `const [isSubmitting, setIsSubmitting] = useState(false)`
5. Disable submit button when `isSubmitting === true`
6. Set `isSubmitting` to true before dispatch, false after

**Example Pattern:**
```typescript
// Before
const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  if (!formData.maker.trim()) {
    alert('Please fill in maker and model fields');
    return;
  }
  dispatch({ type: 'ADD_GUITAR', payload: newGuitar });
  onClose();
};

// After
const { showToast } = useToast();
const [isSubmitting, setIsSubmitting] = useState(false);

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!formData.maker.trim()) {
    showToast('Please fill in maker and model fields', 'error');
    return;
  }

  setIsSubmitting(true);
  try {
    dispatch({ type: 'ADD_GUITAR', payload: newGuitar });
    showToast('Guitar added successfully!', 'success');
    onClose();
  } finally {
    setIsSubmitting(false);
  }
};

// In JSX:
<button
  type="submit"
  className="btn btn-primary"
  disabled={isSubmitting}
>
  {isSubmitting ? 'Saving...' : (guitarId ? 'Update Guitar' : 'Add Guitar')}
</button>
```

**Testing After Phase 2:**
- Add a guitar → should show success toast
- Submit empty form → should show error toast
- Click rapidly → button should disable while submitting
- Forms should still work exactly as before

---

### Phase 3: Update Settings Page (MEDIUM RISK)
**Risk Level:** 🟡 Medium (more complex, but isolated)

**Files to Modify:**
1. `src/app/settings/page.tsx`

**Changes:**
1. Import `useToast()` hook
2. Add state for confirm dialogs:
   ```typescript
   const [confirmClear, setConfirmClear] = useState(false);
   const [confirmImport, setConfirmImport] = useState(false);
   const [confirmSeed, setConfirmSeed] = useState(false);
   const [pendingImportData, setPendingImportData] = useState<any>(null);
   ```
3. Replace each `confirm()` with `setConfirmX(true)`
4. Replace each `alert()` with `showToast()`
5. Add 3 `<ConfirmDialog>` components at bottom of JSX

**Specific Replacements:**

| Line | Current | New |
|------|---------|-----|
| 11 | `confirm('Are you sure...')` | `setConfirmClear(true)` |
| 21 | `alert('All data cleared')` | `showToast('All data cleared', 'success')` |
| 49 | `alert('Invalid file format')` | `showToast('Invalid file format...', 'error')` |
| 53 | `confirm('This will replace...')` | `setConfirmImport(true)` (store data first) |
| 70 | `alert('Data imported successfully')` | `showToast('Data imported!', 'success')` |
| 73 | `alert('Error importing')` | `showToast('Error importing...', 'error')` |
| 80 | `confirm('This will add...')` | `setConfirmSeed(true)` |
| 86 | `alert('Sample data added')` | `showToast('Sample data added!', 'success')` |

**Special Handling for Import:**
Import requires 2-step confirmation (validate, then confirm), so:
```typescript
const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
  const file = event.target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const importedData = JSON.parse(e.target?.result as string);
      if (!importedData.guitars || !importedData.maintenanceLogs) {
        showToast('Invalid file format. Please select a valid backup file.', 'error');
        return;
      }
      // Store for confirmation
      setPendingImportData(importedData);
      setConfirmImport(true);
    } catch (error) {
      showToast('Error importing data. Please check the file format.', 'error');
    }
  };
  reader.readAsText(file);
};

const confirmImportData = () => {
  const parsedData = {
    guitars: pendingImportData.guitars.map((g: any) => ({...})),
    maintenanceLogs: pendingImportData.maintenanceLogs.map((m: any) => ({...})),
    isLoading: false
  };
  dispatch({ type: 'LOAD_STATE', payload: parsedData });
  showToast('Data imported successfully!', 'success');
  setConfirmImport(false);
  setPendingImportData(null);
};
```

**Testing After Phase 3:**
- Clear data → should show confirm dialog, then success toast
- Import data → should validate, show confirm, then success toast
- Seed data → should show confirm dialog, then success toast
- All existing functionality preserved

---

### Phase 4: Supabase Error Handling (HIGH PRIORITY)
**Risk Level:** 🟠 Medium-High (modifies core state management)

**Files to Modify:**
1. `src/hooks/useAppState.tsx`

**Strategy:**
Keep existing behavior (optimistic localStorage updates) + add error handling

**Approach 1: Add Error Handlers to Existing Calls**

For each Supabase operation, add `.then()` with error check:

```typescript
// Before (line 36-43)
if (supabase) {
  const g = action.payload;
  supabase.from('guitars').upsert({
    id: g.id,
    maker: g.maker,
    model: g.model,
    string_specs: g.stringSpecs,
    created_at: g.createdAt.toISOString(),
    updated_at: g.updatedAt.toISOString()
  });
}

// After
if (supabase) {
  const g = action.payload;
  supabase.from('guitars').upsert({
    id: g.id,
    maker: g.maker,
    model: g.model,
    string_specs: g.stringSpecs,
    created_at: g.createdAt.toISOString(),
    updated_at: g.updatedAt.toISOString()
  }).then(({ error }) => {
    if (error) {
      console.error('Failed to sync guitar to Supabase:', error);
      // Note: Can't call toast from reducer, handled in components
    }
  });
}
```

**Approach 2: Extract Sync Functions (RECOMMENDED)**

Create helper functions that components can call:

```typescript
// New helper functions (after reducer definition, before AppProvider)
async function syncGuitarToSupabase(guitar: Guitar): Promise<{ error: any }> {
  if (!supabase) return { error: null };

  const { error } = await supabase.from('guitars').upsert({
    id: guitar.id,
    maker: guitar.maker,
    model: guitar.model,
    string_specs: guitar.stringSpecs,
    created_at: guitar.createdAt.toISOString(),
    updated_at: guitar.updatedAt.toISOString()
  });

  return { error };
}

async function syncMaintenanceLogToSupabase(log: MaintenanceLog): Promise<{ error: any }> {
  if (!supabase) return { error: null };

  const { error } = await supabase.from('maintenance_logs').upsert({
    id: log.id,
    guitar_id: log.guitarId,
    maintenance_date: log.maintenanceDate.toISOString(),
    type_of_work: log.typeOfWork,
    notes: log.notes,
    created_at: log.createdAt.toISOString()
  });

  return { error };
}

// Export for use in components
export { syncGuitarToSupabase, syncMaintenanceLogToSupabase };
```

**Update Components to Handle Errors:**

In `GuitarForm.tsx`:
```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  // ... validation ...

  setIsSubmitting(true);
  try {
    const newGuitar: Guitar = { /* ... */ };

    // Update local state immediately (optimistic)
    dispatch({ type: 'ADD_GUITAR', payload: newGuitar });

    // Sync to Supabase (background, with error handling)
    const { error } = await syncGuitarToSupabase(newGuitar);

    if (error) {
      console.error('Supabase sync error:', error);
      showToast('Guitar saved locally, but failed to sync to cloud', 'warning');
    } else {
      showToast('Guitar added successfully!', 'success');
    }

    onClose();
  } finally {
    setIsSubmitting(false);
  }
};
```

**Decision:** Use **Approach 2** because:
- Keeps reducer pure (no side effects)
- Components control error handling
- Can show toasts from components
- Easier to test
- More maintainable

**Changes Required:**
1. Remove Supabase calls from reducer (keep localStorage only)
2. Create sync helper functions (export from useAppState.tsx)
3. Update all components that dispatch:
   - GuitarForm.tsx (add/update guitar)
   - MaintenanceLogForm.tsx (add/update log)
   - MaintenanceLogList.tsx (delete log)
   - guitar/[id]/page.tsx (delete guitar)
   - settings/page.tsx (clear data, import data)

**Testing After Phase 4:**
- Add guitar with Supabase working → success toast
- Add guitar with Supabase down → warning toast, data still saved locally
- Same for all CRUD operations
- Check browser console for Supabase errors
- Verify localStorage always updates regardless of Supabase status

---

## File Manifest

### New Files (2):
- `src/components/Toast.tsx`
- `src/contexts/ToastContext.tsx`

### Modified Files (7):
1. `src/app/layout.tsx` - Add ToastProvider wrapper
2. `src/hooks/useAppState.tsx` - Extract Supabase sync, remove from reducer
3. `src/components/GuitarForm.tsx` - Toast, loading, error handling
4. `src/components/MaintenanceLogForm.tsx` - Toast, loading, error handling
5. `src/components/MaintenanceLogList.tsx` - Error handling on delete
6. `src/app/guitar/[id]/page.tsx` - Error handling on delete guitar
7. `src/app/settings/page.tsx` - Replace alerts/confirms with toast/ConfirmDialog

---

## Testing Checklist

### Phase 1 - Toast System
- [ ] Toast appears when triggered
- [ ] Multiple toasts stack vertically
- [ ] Toasts auto-dismiss after 4 seconds
- [ ] All 4 types (success/error/warning/info) render correctly
- [ ] Animations smooth (slide-in, fade-out)
- [ ] Existing app functionality unchanged

### Phase 2 - Form Updates
- [ ] Add guitar → success toast shows
- [ ] Update guitar → success toast shows
- [ ] Validation error → error toast shows
- [ ] Submit button disables during save
- [ ] Button shows "Saving..." text when submitting
- [ ] Same tests for maintenance log form
- [ ] Forms still close after successful submit

### Phase 3 - Settings Page
- [ ] Clear data → confirm dialog → success toast
- [ ] Import valid data → confirm dialog → success toast
- [ ] Import invalid data → error toast (no confirm)
- [ ] Seed data → confirm dialog → success toast
- [ ] Export data → no toast (downloads file)
- [ ] Cancel on confirms → no action taken

### Phase 4 - Error Handling
- [ ] Add guitar (Supabase up) → success toast
- [ ] Add guitar (Supabase down) → warning toast + local save
- [ ] Update guitar → same error handling
- [ ] Delete guitar → same error handling
- [ ] Add maintenance log → same error handling
- [ ] Update maintenance log → same error handling
- [ ] Delete maintenance log → same error handling
- [ ] Check browser console for error logs
- [ ] Verify localStorage always updates

### Integration Tests
- [ ] Add 5 guitars rapidly → all save, toasts stack
- [ ] Disconnect network → add guitar → warning toast, data persists
- [ ] Reconnect network → add guitar → success toast
- [ ] Import large dataset → no performance issues
- [ ] Navigate between pages → toasts persist/clear appropriately

---

## Rollback Strategy

Each phase is independent:

- **Phase 1 issue**: Remove ToastProvider from layout, delete new files
- **Phase 2 issue**: Revert form files to use `alert()` again
- **Phase 3 issue**: Revert settings to use native dialogs
- **Phase 4 issue**: Keep Supabase in reducer, skip error handling

The modular approach means we can ship 1-3 phases even if Phase 4 has issues.

---

## Benefits Summary

1. **User Experience**: Professional toast notifications instead of blocking alerts
2. **Error Visibility**: Users know when cloud sync fails
3. **Data Safety**: Local data always saves, cloud is bonus
4. **Reliability**: Proper error handling prevents silent failures
5. **Consistency**: All confirmations use ConfirmDialog
6. **Loading States**: Users get feedback during operations
7. **Maintainability**: Clean separation of concerns (sync helpers)

---

## Timeline Estimate

- **Phase 1**: 30 minutes (toast system)
- **Phase 2**: 30 minutes (forms)
- **Phase 3**: 45 minutes (settings)
- **Phase 4**: 60 minutes (error handling)
- **Testing**: 45 minutes (full integration testing)

**Total**: ~3.5 hours

---

## Implementation Order

1. Phase 1 → Test → Commit
2. Phase 2 → Test → Commit
3. Phase 3 → Test → Commit
4. Phase 4 → Test → Commit

Each commit is a working state. If we need to stop, the app is never broken.