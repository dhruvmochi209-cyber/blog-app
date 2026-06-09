---
name: Engineered Narrative
colors:
  surface: '#0c1324'
  surface-dim: '#0c1324'
  surface-bright: '#33394c'
  surface-container-lowest: '#070d1f'
  surface-container-low: '#151b2d'
  surface-container: '#191f31'
  surface-container-high: '#23293c'
  surface-container-highest: '#2e3447'
  on-surface: '#dce1fb'
  on-surface-variant: '#c2c6d6'
  inverse-surface: '#dce1fb'
  inverse-on-surface: '#2a3043'
  outline: '#8c909f'
  outline-variant: '#424754'
  surface-tint: '#adc6ff'
  primary: '#adc6ff'
  on-primary: '#002e6a'
  primary-container: '#4d8eff'
  on-primary-container: '#00285d'
  inverse-primary: '#005ac2'
  secondary: '#c0c1ff'
  on-secondary: '#1000a9'
  secondary-container: '#3131c0'
  on-secondary-container: '#b0b2ff'
  tertiary: '#89ceff'
  on-tertiary: '#00344d'
  tertiary-container: '#009ada'
  on-tertiary-container: '#002d43'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#d8e2ff'
  primary-fixed-dim: '#adc6ff'
  on-primary-fixed: '#001a42'
  on-primary-fixed-variant: '#004395'
  secondary-fixed: '#e1e0ff'
  secondary-fixed-dim: '#c0c1ff'
  on-secondary-fixed: '#07006c'
  on-secondary-fixed-variant: '#2f2ebe'
  tertiary-fixed: '#c9e6ff'
  tertiary-fixed-dim: '#89ceff'
  on-tertiary-fixed: '#001e2f'
  on-tertiary-fixed-variant: '#004c6e'
  background: '#0c1324'
  on-background: '#dce1fb'
  surface-variant: '#2e3447'
typography:
  display-lg:
    fontFamily: Hanken Grotesk
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Hanken Grotesk
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Hanken Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Geist
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Geist
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  code-sm:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
  label-caps:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.05em
  headline-lg-mobile:
    fontFamily: Hanken Grotesk
    fontSize: 28px
    fontWeight: '600'
    lineHeight: '1.2'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  container-max: 1200px
  gutter: 24px
  margin-mobile: 16px
  section-gap: 80px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 32px
---

## Brand & Style

The design system is engineered for high-end technical discourse. It targets developers, architects, and engineering leaders who value precision, performance, and aesthetic clarity. The brand personality is **authoritative yet visionary**, blending the utilitarian efficiency of a code editor with the refined elegance of a premium digital publication.

The visual direction follows a **Modern/Glassmorphic** approach:
- **Surface Layering:** Depth is communicated through varying levels of transparency and background blurs rather than traditional solid fills.
- **Precision Details:** 1px borders and micro-interactions mirror the exactness of well-written code.
- **Luminous Accents:** Use of subtle glows and "electric" primary colors to draw focus against a deep, technical backdrop.
- **Atmospheric Depth:** The UI feels like a series of glass panes floating in a dark, infinite space, creating a focused "flow state" for reading and writing.

## Colors

The palette is anchored in a **Deep Slate/Black foundation** to reduce eye strain during long-form technical reading. 

- **Primary & Accents:** Use `#3b82f6` for primary actions. Utilize the secondary Indigo (`#6366f1`) and tertiary Cyan (`#0ea5e9`) specifically for syntax highlighting roles or sophisticated gradient transitions.
- **Glass Surfaces:** Surface colors should rarely be opaque. Use `rgba(15, 23, 42, 0.8)` with a `backdrop-filter: blur(12px)` for cards and navigation bars.
- **The Glow:** Primary actions can occasionally use a subtle outer glow (box-shadow) using the primary color at 20% opacity to simulate an "active state" or high-priority focus.

## Typography

The typographic system provides a clear distinction between **Editorial**, **UI**, and **Code**.

- **Editorial (Hanken Grotesk):** Used for headlines to provide a sharp, contemporary "tech-journal" feel. Headlines should use tight letter-spacing to feel "packed" and premium.
- **Interface & Reading (Geist):** Used for the primary body of articles and general UI. Its geometric nature maintains the technical vibe while ensuring high legibility.
- **Technical (JetBrains Mono):** Reserved for code snippets, metadata labels, and system status indicators. 

For long-form reading, ensure a max-width of `680px` for text containers to maintain optimal line lengths. Use "Smart Quotes" and proper em-dashes for a truly editorial finish.

## Layout & Spacing

This design system employs a **Fluid Grid** with generous white space to evoke a "premium" feel. 

- **The Rhythm:** Based on a 4px baseline, with most components using increments of 16px or 24px for internal padding.
- **Desktop:** 12-column grid with 24px gutters. Page margins should be dynamic but never less than 40px.
- **Mobile:** 4-column grid with 16px gutters and margins.
- **Breathability:** Increase `section-gap` between major content blocks to 80px or 120px on desktop to allow the "glass" elements to feel isolated and important.
- **Motion:** All interactive transitions (hover, scale, entry) should use the defined `spring-default` to give the UI a tactile, responsive quality that feels alive yet controlled.

## Elevation & Depth

Depth is not achieved through darkness, but through **light and translucency**.

1. **Base:** The `#020617` background acts as the canvas.
2. **Layer 1 (Cards/Sidebar):** Semi-transparent fills with `backdrop-filter: blur(12px)`. Borders are `1px solid rgba(255, 255, 255, 0.05)`.
3. **Layer 2 (Modals/Popovers):** Higher opacity fills with a multi-layered shadow:
   - *Shadow:* `0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)`
   - *Inner Glow:* 1px top-stroke of `rgba(255, 255, 255, 0.1)` to simulate light hitting the top edge of the glass.
4. **Interactive States:** On hover, elements should slightly increase in background opacity and trigger a subtle primary-colored drop shadow (`0 0 20px rgba(59, 130, 246, 0.1)`).

## Shapes

The shape language is **Modern Rounded**, striking a balance between the friendliness of consumer apps and the structure of professional tools.

- **Standard UI (Buttons/Inputs):** Use `rounded` (8px/0.5rem).
- **Containers (Cards/Sections):** Use `rounded-lg` (16px/1rem).
- **Specialty (Search Bars/Tags):** Use `rounded-xl` or full pill shapes for high-contrast interactive elements.
- **Borders:** Always 1px. Avoid thicker borders unless they are part of a deliberate "focus" state or progress indicator.

## Components

- **Buttons:** 
  - *Primary:* Solid `#3b82f6` with white text. 
  - *Secondary:* Ghost style with 1px border `rgba(255,255,255,0.1)` and a subtle background blur.
  - *Interaction:* 2% scale-down on click to provide tactile feedback.
- **Input Fields:** Darker than the surface (`#020617`), 1px border. On focus, the border turns Primary Blue with a 2px outer glow.
- **Code Blocks:** 
  - Background: Solid `#0f172a`.
  - Border: Left-side 2px accent border (Primary).
  - Header: Includes the file name in `label-caps` and a "Copy" button that only appears on hover.
- **Cards:** The hallmark of the system. Glassmorphic backgrounds, 1px subtle borders, and `headline-md` titles.
- **Chips/Tags:** Small, `label-caps` typography, with low-opacity primary backgrounds (e.g., `rgba(59, 130, 246, 0.1)`).
- **Navigation:** Fixed top-bar with `backdrop-filter: blur(20px)` and a bottom border of `rgba(255, 255, 255, 0.05)`.