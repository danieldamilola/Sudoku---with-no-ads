---
name: Architectural Precision
colors:
  surface: '#fbf8ff'
  surface-dim: '#dad9e4'
  surface-bright: '#fbf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f4f2fe'
  surface-container: '#eeedf8'
  surface-container-high: '#e8e7f3'
  surface-container-highest: '#e2e1ed'
  on-surface: '#1a1b23'
  on-surface-variant: '#444654'
  inverse-surface: '#2f3039'
  inverse-on-surface: '#f1effb'
  outline: '#747686'
  outline-variant: '#c4c5d7'
  surface-tint: '#2d50d9'
  primary: '#2a4dd7'
  on-primary: '#ffffff'
  primary-container: '#4868f1'
  on-primary-container: '#fffbff'
  inverse-primary: '#b9c3ff'
  secondary: '#5d5c74'
  on-secondary: '#ffffff'
  secondary-container: '#e2e0fc'
  on-secondary-container: '#63627a'
  tertiary: '#954500'
  on-tertiary: '#ffffff'
  tertiary-container: '#bb5800'
  on-tertiary-container: '#fffbff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dde1ff'
  primary-fixed-dim: '#b9c3ff'
  on-primary-fixed: '#001257'
  on-primary-fixed-variant: '#0034c0'
  secondary-fixed: '#e2e0fc'
  secondary-fixed-dim: '#c6c4df'
  on-secondary-fixed: '#1a1a2e'
  on-secondary-fixed-variant: '#45455b'
  tertiary-fixed: '#ffdbc8'
  tertiary-fixed-dim: '#ffb68a'
  on-tertiary-fixed: '#321300'
  on-tertiary-fixed-variant: '#743500'
  background: '#fbf8ff'
  on-background: '#1a1b23'
  surface-variant: '#e2e1ed'
typography:
  display-lg:
    fontFamily: DM Sans
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-md:
    fontFamily: DM Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: '1.4'
    letterSpacing: -0.01em
  body-main:
    fontFamily: DM Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  body-strong:
    fontFamily: DM Sans
    fontSize: 16px
    fontWeight: '600'
    lineHeight: '1.6'
  label-caps:
    fontFamily: DM Sans
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.05em
  number-grid:
    fontFamily: DM Mono
    fontSize: 24px
    fontWeight: '400'
    lineHeight: '1'
  number-grid-sm:
    fontFamily: DM Mono
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1'
  meta-sm:
    fontFamily: DM Sans
    fontSize: 13px
    fontWeight: '400'
    lineHeight: '1.4'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 48px
  huge: 80px
  board-gutter: 2px
---

## Brand & Style

This design system is anchored in **Architectural Minimalism**, utilizing vast negative space to create a sanctuary of focus. It draws 20% of its character from **Dark Precision**, manifesting in sharp, hairline borders and technical monospaced numerical data that evoke the feeling of a high-end drafting tool. The final 10% is a **Bold Consumer** influence, seen in the vibrant electric indigo accents and high-legibility sans-serif type, ensuring the interface remains energetic and accessible.

The emotional goal is "Industrial Calm"—a sense of organized, high-performance clarity where the user's input is the primary focus and the UI serves as a silent, perfectly aligned scaffold.

## Colors

The palette uses a warm, off-white foundation (`#FAFAFA`) to reduce eye strain and provide a sophisticated backdrop for the structural elements. 

- **Structural Surfaces:** The main interface board utilizes absolute white (`#FFFFFF`) to distinguish it from the background.
- **State Feedback:** Cells within the board use a hierarchy of subtle tints—cool blues for selection and highlights, and neutral grays for pre-filled data.
- **Action & Emphasis:** Electric Indigo (`#4F6EF7`) is the sole driver of attention, used exclusively for interactive states, primary buttons, and user-generated numerical input.
- **Functional Accents:** Success and Error states use high-chroma green and red, but are applied sparingly to maintain the minimalist aesthetic.

## Typography

The typography system is split between functional UI text and data entry.

- **Primary UI:** **DM Sans** provides a low-contrast, modern geometric feel for all labels, headings, and instructions.
- **Data & Numbers:** **DM Mono** is utilized for all numerical input and grid data to ensure perfect vertical and horizontal alignment, reinforcing the "Precision" aspect of the design.
- **Hierarchy:** Use tight letter spacing on larger headings to create a "dense" professional feel. For smaller labels, use increased letter spacing and uppercase styling to ensure legibility despite the small footprint.

## Layout & Spacing

The layout philosophy relies on a **fixed-width central board** for primary tasks, surrounded by expansive, fluid margins that emphasize the "Architectural Minimalism."

- **The Grid:** A base unit of **4px** governs all spacing. 
- **The Board:** The central interaction area (e.g., a Sudoku grid or data table) uses hairline borders (`1px`) between cells to minimize visual noise. 
- **Whitespace:** Use "huge" spacing increments (80px+) between major sections to let the UI breathe. 
- **Mobile Adaptivity:** On mobile, the board scales to fill the width minus a `16px` margin. Vast vertical whitespace is preserved to maintain the brand character.

## Elevation & Depth

This system avoids traditional depth in favor of **Planar Hierarchy**. 

- **Base Layer:** The page background (`#FAFAFA`) is the lowest level.
- **The Board:** The primary interaction container is the only element with a shadow. This shadow is an "Ambient Lift"—extremely subtle (`#0A000000` opacity, `20px` blur, `4px` Y-offset) to make the board feel like a sheet of paper floating slightly above a desk.
- **No Overlays:** Avoid modals where possible; use inline expansions or full-page transitions to maintain the flat, architectural integrity of the layout.

## Shapes

The shape language is a deliberate contrast between **Hard Logic** and **Soft Interaction**.

- **The Grid:** All internal cells and data containers use **0px (Sharp)** corners. This creates a technical, rigid structure that feels precise.
- **The Frame:** The outer board and all major buttons use a **12px radius**. This "softens" the entry points of the UI, making the overall product feel modern and premium.
- **Pills:** Floating labels or status indicators use a **100px (Pill)** radius to distinguish them clearly from structural grid elements.

## Components

### Buttons
- **Primary:** Background `#4F6EF7`, text `#FFFFFF`, `12px` radius. No shadow. 
- **Secondary:** Background `transparent`, border `1px` solid `#B0B8C8`, text `#1A1A2E`.
- **Tertiary/Ghost:** Text `#4F6EF7`, no background or border.

### Grid Cells
- **Default:** `#FFFFFF` background, `1px` hairline border `#E8EAED`.
- **Given/Locked:** `#F4F4F4` background, `600` weight text.
- **Selected:** `#EEF3FF` background with a slightly thicker `2px` Indigo border.
- **Highlight (Related):** `#F5F7FF` background.

### Input Fields
- Use the same styling as the Grid Cells but with a `12px` radius for standalone form fields.
- Placeholder text uses `text-muted` (`#C4C9D4`).

### Icons
- Use **Lucide-style** icons (2px stroke width). 
- Icons should always be monochromatic (using `text-secondary`) unless they are part of an active Indigo state.

### Board Container
- Border: `2px` or `3px` solid `#8892A4` to provide a strong visual frame for the sharp-edged cells inside.
- Radius: `12px`.