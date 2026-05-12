# Sudoku Design System (Current)

This file defines the active visual system for both mobile and desktop.  
If implementation differs from this spec, this spec wins.

## Design Direction

- Premium minimal, Nothing-inspired: restrained, high-contrast, calm.
- Monochrome-first interface with selective semantic accents.
- Flat surfaces and strokes only; no ornamental shadows or gradients.
- Functional hierarchy through spacing, weight, and tone (not decoration).

## Tokens

### Color (Light)

- Page: `#f4f5f6`
- Surface: `#ffffff`
- Surface low/container: `#eef0f2` / `#e7eaee`
- Primary text: `#18171a`
- Secondary text: `#626874`
- Border strong/soft: `#aeb5bf` / `#d8dde3`
- Primary action (neutral ink): `#111317`
- Primary hover/strong: `#2a2f38`
- Success: `#1a7a40`
- Warning: `#a04f00`
- Error: `#c0180f`

### Color (Dark)

- Page: `#0e0e0e`
- Surface: `#161616`
- Surface low/container: `#1a1a1a` / `#202020`
- Primary text: `#f2f2f2`
- Secondary text: `#9a9a9a`
- Border strong/soft: `#404040` / `#2c2c2c`
- Primary action (neutral light): `#f2f2f2`
- Primary hover/strong: `#d8dde3`
- Success: `#5ee577`
- Warning: `#ffc779`
- Error: `#ff7b7b`

### Typography

- UI font: `DM Sans`
- Number/board font: `DM Mono`
- Title large: `28-34`, `800-900`, tight tracking
- Body: `14-15`, `400-600`
- Label caps: `10-12`, `700-800`, uppercase, tracking `0.06-0.1em`

### Spacing & Shape

- Base spacing scale: `4, 8, 12, 16, 20, 24, 32`
- Page gutter: `20` (mobile), desktop uses equivalent rhythm
- Radius: `10, 12, 16`, pill `9999`
- Borders: `1px` default, `2px` only for board separators/high-priority framing

### Elevation

- No drop shadows for core UI.
- Use tone layering (`surface` vs `surface-container`) and border contrast instead.

## Component Rules

### Buttons

- Primary: neutral ink fill (`primary`), contrasting text, no shadow.
- Secondary: surface fill + outline border.
- Ghost: text-only or transparent with subtle hover surface.
- Focus ring: always visible, uses neutral primary accent token.

### Inputs

- Border `1px` soft outline.
- Radius `10-12`.
- Placeholder uses secondary text token.
- Same vertical rhythm as buttons.

### Pills/Badges

- Capsule shape.
- Difficulty pills may use semantic tint per difficulty.
- Do not use gradients.

### Cards/Surfaces

- `background: surface` or `surface-low`
- `border: 1px solid line`
- no shadow
- avoid ad-hoc opacity backgrounds when tokenized surface works

### Sudoku Board

- Keep technical precision:
  - clear cell grid
  - major 3x3 separators
  - mono numerics
- Interactive states can keep blue family for clarity:
  - selected
  - related
  - same number
- Error state always red tokenized.

## Cross-Platform Consistency Contract

Mobile and desktop must match in:

- Token values and semantic meaning.
- Component intent (same role, same hierarchy).
- Spacing rhythm and corner radii family.
- Focus/hover/pressed behavior tone (desktop hover must not introduce new style language).
- Auth, Home, Stats, Settings visual hierarchy.

Allowed differences:

- Density tuned for input method (touch vs mouse/keyboard).
- Board scale/responsiveness constraints by viewport.

## Implementation Notes

- Prefer reusable classes/components over inline one-off styles.
- When adding styles, use token variables first; hardcoded colors are exception-only.
- Any new desktop style must be checked against mobile equivalent screen before merge.