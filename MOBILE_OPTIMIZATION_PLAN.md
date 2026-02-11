# REVO Mobile Optimization Plan

## Phase 1: Critical Fixes (High Impact)

### 1. Dashboard Padding/Gap Scaling
**File**: `components/Dashboard.tsx`
- Line 51: `gap-8` → `gap-4 sm:gap-6 lg:gap-8`
- Line 52: `p-8` → `p-4 sm:p-6 lg:p-8`
- Line 46: `text-4xl` → `text-2xl sm:text-3xl lg:text-4xl`
- Line 135: `gap-10` → `gap-4 sm:gap-6 lg:gap-10`

### 2. Sidebar Auto-Close on Mobile
**File**: `components/Sidebar.tsx`
- Add auto-close after navigation click on mobile
- Change: `onClick={() => { onViewChange(item.id); onCloseMobile?.(); }}`

### 3. SiteList: Add Mobile Card View
**File**: `components/SiteList.tsx`
- Add `viewMode` state with "list", "kanban", "card" (mobile fallback)
- Show card view on mobile (<768px) instead of table
- Card layout: Site name, status badge, date, client

### 4. Global Padding Adjustment
**Files**: All components with `p-8`, `px-10`, `py-8`
- Pattern: `p-6` → `p-3 sm:p-4 lg:p-6`
- Pattern: `gap-8` → `gap-3 sm:gap-4 lg:gap-6`
- Pattern: `px-10` → `px-4 sm:px-6 lg:px-10`

## Phase 2: Layout Improvements

### 1. Calendar View Mobile Simplification
**File**: `components/CalendarView.tsx`
- Week view: Show 2-3 days only on mobile
- Month view: Hide event details, show dots only
- Remove horizontal scroll tables
- Single-day view for mobile (<640px)

### 2. Pipeline Kanban Mobile
**File**: `components/Pipeline.tsx`
- Allow columns to flex and wrap
- Option: Switch to list view on mobile
- Show only 1-2 columns per screen

### 3. Modal Responsive Sizing
**All Modals**:
- `max-w-lg` → `max-w-[95vw] sm:max-w-lg`
- `max-w-md` → `max-w-[95vw] sm:max-w-md`
- Ensure padding doesn't overflow on small screens

## Phase 3: Touch Optimization

### 1. Touch Target Sizes
- All buttons/clickables: minimum 44×44px
- Icons that are tappable: wrap in button with adequate padding
- Drag handles: `w-3` → `w-5 sm:w-3`

### 2. Hover-Dependent Buttons
**File**: `components/Pipeline.tsx`
- Pipeline won/lost buttons: Show on mobile
- Change: Only hide on desktop with `hidden sm:flex`
- Or: Always visible on mobile

### 3. Typography Scaling
- `text-4xl` → `text-2xl sm:text-3xl lg:text-4xl`
- `text-3xl` → `text-xl sm:text-2xl lg:text-3xl`
- Max font size on mobile: 28px for headings

## Implementation Order (Recommended)

1. **Day 1**: Dashboard + Global padding scaling (Biggest impact)
2. **Day 2**: Sidebar auto-close + Avatar sizing
3. **Day 3**: SiteList card view for mobile
4. **Day 4**: Calendar simplification + Touch targets
5. **Day 5**: Pipeline kanban adjustments + Hover button fix
6. **Day 6**: Modal responsive sizing + Typography
7. **Day 7**: Testing + Polish

## Key Breakpoints

```
xs: 320px - 374px  (Old phones)
sm: 375px - 640px  (Mobile)
md: 641px - 768px  (Tablet)
lg: 769px+         (Desktop)
```

## Utilities to Add (if not present)

```tailwind
/* Responsive grid gaps */
@media (max-width: 640px) { gap: 0.75rem /* gap-3 */ }
@media (min-width: 641px) { gap: 1rem /* gap-4 */ }
@media (min-width: 1024px) { gap: 1.5rem /* gap-6 */ }

/* Responsive padding */
@media (max-width: 640px) { padding: 0.75rem /* p-3 */ }
@media (min-width: 641px) { padding: 1rem /* p-4 */ }

/* Min touch target */
.touch-target {
  min-width: 2.75rem; /* 44px */
  min-height: 2.75rem; /* 44px */
}
```

## Files to Modify (Priority)

1. ✅ Dashboard.tsx (padding, gaps, typography)
2. ✅ Sidebar.tsx (auto-close, sizing)
3. ✅ SiteList.tsx (card view, table hiding)
4. ✅ CalendarView.tsx (day view, event hiding)
5. ✅ Pipeline.tsx (visible buttons, column sizing)
6. ✅ ClientGrid.tsx (padding, card sizing)
7. ✅ ChecklistManager.tsx (modal sizing, padding)
8. ✅ LandingPage.tsx (mobile hero, buttons)
9. ⚠️ All Modals (responsive width)
10. ⚠️ All Input Forms (mobile-friendly labels)

## Testing Checklist

- [ ] iPhone SE (375px width)
- [ ] iPhone 12 (390px width)
- [ ] iPad (768px width)
- [ ] Desktop (1920px)
- [ ] Landscape orientation
- [ ] Touch interactions (no hover states)
- [ ] Form input focus on mobile
- [ ] Sidebar open/close on mobile
- [ ] Modal sizing on small screens
- [ ] Overflow/scrolling content

## Success Metrics

✅ No horizontal scrolling (except modals with internal scroll)
✅ All buttons ≥44×44px touch targets
✅ Typography readable without zoom
✅ Navigation accessible without scrolling
✅ Forms usable with mobile keyboard
✅ Tap-friendly spacing between elements
✅ Fast load time (<3s on 4G)
