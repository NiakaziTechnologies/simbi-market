# Light Mode Fix - TODO List

## Task
Fix light mode so that the remaining dark grey components have a light grey/off whitish theme

## Files Modified:

### 1. `app/globals.css`
- Updated `.glass-card` class for light mode: uses `rgba(248, 249, 250, 0.9)` (off-white)
- Added `.dark .glass-card` variant to restore dark mode styling

### 2. `components/footer.tsx`
- Changed `bg-foreground` to `bg-background` for light mode support

### 3. `components/navigation.tsx`
- Fixed border colors for theme support
- Fixed nav button text colors

### 4. `components/search-filters.tsx`
- Updated dropdown buttons and popover with theme-aware colors

### 5. `components/hero-section.tsx`
- Fixed glass-card, search toggle, and input colors for light mode

### 6. `components/features-section.tsx`
- Fixed background, text colors

### 7. `components/engineering-excellence-section.tsx`
- Fixed background and text colors

### 8. `components/brands-section.tsx`
- Fixed background and text colors

### 9. `components/testimonials-section.tsx`
- Fixed background and text colors

### 10. `components/access-point-section.tsx`
- Fixed glass-card and text colors

## Status
- [x] Completed

