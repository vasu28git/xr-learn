---
name: Synthetics XR
colors:
  surface: '#10131a'
  surface-dim: '#10131a'
  surface-bright: '#363940'
  surface-container-lowest: '#0b0e14'
  surface-container-low: '#191c22'
  surface-container: '#1d2026'
  surface-container-high: '#272a31'
  surface-container-highest: '#32353c'
  on-surface: '#e1e2eb'
  on-surface-variant: '#bdc8d1'
  inverse-surface: '#e1e2eb'
  inverse-on-surface: '#2e3037'
  outline: '#87929a'
  outline-variant: '#3e484f'
  surface-tint: '#7bd0ff'
  primary: '#8ed5ff'
  on-primary: '#00354a'
  primary-container: '#38bdf8'
  on-primary-container: '#004965'
  inverse-primary: '#00668a'
  secondary: '#4de082'
  on-secondary: '#003919'
  secondary-container: '#00b55d'
  on-secondary-container: '#003e1c'
  tertiary: '#d4c4ff'
  on-tertiary: '#381385'
  tertiary-container: '#baa3ff'
  on-tertiary-container: '#4c2d99'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#c4e7ff'
  primary-fixed-dim: '#7bd0ff'
  on-primary-fixed: '#001e2c'
  on-primary-fixed-variant: '#004c69'
  secondary-fixed: '#6dfe9c'
  secondary-fixed-dim: '#4de082'
  on-secondary-fixed: '#00210c'
  on-secondary-fixed-variant: '#005227'
  tertiary-fixed: '#e8ddff'
  tertiary-fixed-dim: '#cebdff'
  on-tertiary-fixed: '#21005e'
  on-tertiary-fixed-variant: '#4f319c'
  background: '#10131a'
  on-background: '#e1e2eb'
  surface-variant: '#32353c'
typography:
  display-lg:
    fontFamily: Geist
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-sm:
    fontFamily: Geist
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  body-md:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Geist
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 18px
  code-md:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 20px
  code-sm:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '400'
    lineHeight: 16px
  label-caps:
    fontFamily: JetBrains Mono
    fontSize: 10px
    fontWeight: '700'
    lineHeight: 12px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  gutter: 16px
  margin: 24px
  panel-padding: 12px
---

## Brand & Style
The design system is engineered for a professional, technical, and high-precision environment. It bridges the gap between a 3D production environment and a modern IDE, prioritizing utility and deep-work focus. 

The aesthetic is **Modern Developer Tooling** mixed with **Glassmorphism**. It utilizes a "Dark Mode First" philosophy to reduce eye strain during long XR development sessions. Surfaces are characterized by deep charcoal tones, ultra-fine borders, and semi-transparent layers that suggest the depth of a 3D workspace without the visual noise of traditional gaming interfaces. The emotional response is one of mastery, technical clarity, and sophisticated immersion.

## Colors
The palette is rooted in a layered grayscale to define hierarchy. 

- **Primary (Cyber Blue):** Used for active states, primary actions, and selection highlights. 
- **Secondary (Terminal Green):** Reserved for success states, execution status, and syntax highlights.
- **Tertiary (XR Violet):** Specifically designated for spatial elements, 3D coordinate markers, and XR-specific features.
- **Neutral/Surface:** The background logic follows a tiered approach: `#0B0E14` for the application shell and `#151921` for elevated panels and editor regions.

## Typography
This design system utilizes a dual-font strategy. **Geist** provides a sharp, neutral sans-serif foundation for all UI controls, navigation, and instructional content. **JetBrains Mono** is employed for code blocks, terminal outputs, and metadata labels to reinforce the developer-tool aesthetic. 

Line heights are kept tight to allow for high information density. On mobile, headlines scale down significantly to maintain the compact, tool-like feel. Use `label-caps` for table headers and side-panel category titles.

## Layout & Spacing
The layout follows a **Fixed Sidebar / Fluid Content** model common in IDEs. The application is divided into functional zones: a thin activity bar (48px-64px), a collapsible sidebar for file navigation/hierarchy, and a primary central viewport.

Spacing follows a 4px grid system. Components should prioritize density; margins between related elements should be `1x` (4px) or `2x` (8px). Larger layout gaps between unrelated panels use `4x` (16px). The layout must adapt by collapsing sidebars into drawers on mobile, prioritizing the 3D viewport or code editor.

## Elevation & Depth
Depth is communicated through **Tonal Layering** and **Glassmorphism** rather than traditional drop shadows.

- **Level 0 (Base):** `#0B0E14` – The absolute background.
- **Level 1 (Panels):** `#151921` – Floating panels or sidebars with a `1px` solid border of `#2D333B`.
- **Level 2 (Overlays):** Semi-transparent surfaces (80% opacity) with a `backdrop-filter: blur(12px)` for context menus and modals.
- **Inner Glows:** Active elements may use a subtle inner stroke or "bloom" effect using the primary color to simulate an illuminated terminal screen.

## Shapes
The shape language is disciplined and professional. A base radius of `8px` (`0.5rem`) is applied to panels, cards, and input fields. For smaller components like checkboxes or tags, a tighter `4px` radius may be used. 

Buttons and interactive tabs should maintain the consistent `8px` radius to feel cohesive. Avoid fully pill-shaped elements to maintain the structured, architectural feel of the platform.

## Components
- **Buttons:** Primary buttons use a solid Cyber Blue fill with high-contrast dark text. Secondary buttons use a ghost style with a `#2D333B` border and white text, shifting to a subtle gray fill on hover.
- **Inputs:** Dark backgrounds (`#0B0E14`) with a 1px border. Focus state is a 1px Cyber Blue border with no outer glow.
- **Panels/Cards:** Use a "Glass" approach for the 3D viewport overlays. Use solid `#151921` for sidebars. All must have the standard `#2D333B` border.
- **Tree View:** Used for the scene hierarchy. Use JetBrains Mono for text. Highlight selected rows with a 10% opacity Cyber Blue background and a 2px left-accent border.
- **Tabs:** "Underline" style for top-level navigation (using Cyber Blue); "Folder" style for code editor tabs (matching the panel background).
- **Status Indicators:** Small 8px circles using Terminal Green (Success), Cyber Blue (Processing), or Warning/Error colors.