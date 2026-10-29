---
name: StudySaathi AI
colors:
  surface: '#f9f9ff'
  surface-dim: '#cfdaf2'
  surface-bright: '#f9f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f0f3ff'
  surface-container: '#e7eeff'
  surface-container-high: '#dee8ff'
  surface-container-highest: '#d8e3fb'
  on-surface: '#111c2d'
  on-surface-variant: '#44464f'
  inverse-surface: '#263143'
  inverse-on-surface: '#ecf1ff'
  outline: '#757780'
  outline-variant: '#c5c6d1'
  surface-tint: '#475d92'
  primary: '#00153d'
  on-primary: '#ffffff'
  primary-container: '#0f2a5c'
  on-primary-container: '#7c93cb'
  inverse-primary: '#b0c6ff'
  secondary: '#0051d5'
  on-secondary: '#ffffff'
  secondary-container: '#316bf3'
  on-secondary-container: '#fefcff'
  tertiary: '#251400'
  on-tertiary: '#ffffff'
  tertiary-container: '#412600'
  on-tertiary-container: '#cd8300'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d9e2ff'
  primary-fixed-dim: '#b0c6ff'
  on-primary-fixed: '#001945'
  on-primary-fixed-variant: '#2e4578'
  secondary-fixed: '#dbe1ff'
  secondary-fixed-dim: '#b4c5ff'
  on-secondary-fixed: '#00174b'
  on-secondary-fixed-variant: '#003ea8'
  tertiary-fixed: '#ffddb8'
  tertiary-fixed-dim: '#ffb95f'
  on-tertiary-fixed: '#2a1700'
  on-tertiary-fixed-variant: '#653e00'
  background: '#f9f9ff'
  on-background: '#111c2d'
  surface-variant: '#d8e3fb'
typography:
  display:
    fontFamily: Inter
    fontSize: 3rem
    fontWeight: '800'
    lineHeight: 3.5rem
  display-mobile:
    fontFamily: Inter
    fontSize: 2.25rem
    fontWeight: '800'
    lineHeight: 2.75rem
  headline-lg:
    fontFamily: Inter
    fontSize: 2rem
    fontWeight: '700'
    lineHeight: 2.5rem
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 1.5rem
    fontWeight: '700'
    lineHeight: 2rem
  headline-md:
    fontFamily: Inter
    fontSize: 1.5rem
    fontWeight: '600'
    lineHeight: 2rem
  headline-md-mobile:
    fontFamily: Inter
    fontSize: 1.25rem
    fontWeight: '600'
    lineHeight: 1.75rem
  headline-sm:
    fontFamily: Inter
    fontSize: 1.25rem
    fontWeight: '600'
    lineHeight: 1.75rem
  title-md:
    fontFamily: Inter
    fontSize: 1.125rem
    fontWeight: '600'
    lineHeight: 1.5rem
  body-lg:
    fontFamily: Inter
    fontSize: 1.125rem
    fontWeight: '400'
    lineHeight: 1.75rem
  body-md:
    fontFamily: Inter
    fontSize: 1rem
    fontWeight: '400'
    lineHeight: 1.5rem
  body-sm:
    fontFamily: Inter
    fontSize: 0.875rem
    fontWeight: '400'
    lineHeight: 1.25rem
  label-lg:
    fontFamily: Inter
    fontSize: 0.875rem
    fontWeight: '600'
    lineHeight: 1.25rem
  label-md:
    fontFamily: Inter
    fontSize: 0.75rem
    fontWeight: '600'
    lineHeight: 1rem
  label-sm:
    fontFamily: Inter
    fontSize: 0.6875rem
    fontWeight: '700'
    lineHeight: 0.875rem
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-desktop: 1.5rem
  margin: 1rem
  margin-desktop: 2rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
---

## Brand & Style

This design system is engineered for competitive exam aspirants and university students across India who require a focused, high-clarity digital study companion. The brand personality balances academic rigor with empathetic, intelligent guidance—projecting trust, precision, structured focus, and encouragement.

The visual direction follows a modern, high-utility Corporate SaaS aesthetic tailored for education. It rejects decorative clutter, distracting animations, and heavy visual effects in favor of crisp typography, scannable hierarchies, high-contrast states, and immediate feedback. The interface evokes feelings of composure, discipline, and momentum during intense study sessions.

## Colors

The palette uses deliberate functional zoning to distinguish administrative structure from interactive affordances and academic validation:

- **Deep Navy (`#0F2A5C`)**: Anchors primary navigation bars, headings, structural cards, and high-emphasis brand elements. Communicates institutional authority and stability.
- **Royal Blue (`#2563EB`)**: Exclusively drives interactive affordances—primary call-to-action buttons, active navigation indicators, tabs, and hyperlinks.
- **Page Background (`#F5F8FF`)**: A cool, glare-reducing tinted light canvas that prevents visual fatigue during long revision sessions.
- **Surfaces & Cards (`#FFFFFF`)**: Pure white containers layered above the tinted canvas, bordered with subtle perimeter lines (`#E2E8F0`).
- **Accent Amber (`#F59E0B`)**: Reserved for motivation, streaks, progress meters, badge callouts, and hints.
- **Validation Signals**: Direct pedagogical feedback uses Success Green (`#16A34A`) for correct answers/mastered topics and Error Red (`#DC2626`) for diagnostic test mistakes and critical alerts.
- **Body Neutral (`#1E293B`)**: High-contrast, legible dark slate applied to paragraph copy, metadata, and structural dividers.

## Typography

The design system implements a single, high-performance grotesque typeface family across all roles. The selection guarantees cross-platform rendering fidelity, compact vertical metrics, and tabular numeric legibility for math, timers, and quantitative scorecards.

- **Headlines & Page Titles**: Rendered in heavy weights (`600`, `700`, `800`) using `#0F2A5C` to provide immediate orientation. Letter tracking is slightly condensed (`-0.015em`) on larger sizes to maintain cohesion.
- **Body & Problem Statements**: Typeset in `400` weight using `#1E293B` at a strict `1.5` minimum line-height ratio to ensure readability of multi-step explanations and formula derivations.
- **Labels & Microcopy**: Rendered in medium-to-bold weights (`600`, `700`) with positive tracking (`+0.02em`) for tags, streak counts, difficulty levels, and interactive triggers.

## Layout & Spacing

A mobile-first fluid layout model guarantees immediate accessibility on low-to-mid-tier Android mobile devices, reflowing cleanly up to multi-column desktop dashboards.

- **Mobile Viewports (< 768px)**: 4-column layout with fixed `1rem` outer canvas padding (`margin`) and `1rem` gutters (`gutter`). Core workflows (such as question practices, chat inputs, flashcards) occupy full column width.
- **Tablet Viewports (768px - 1024px)**: 8-column layout with `1.5rem` margins and gutters, supporting a split-pane view (e.g., question list on the left, solution workbench on the right).
- **Desktop Viewports (> 1024px)**: 12-column layout capped at a maximum container width of `1280px` with `2rem` margins (`margin-desktop`) and `1.5rem` gutters (`gutter-desktop`).
- **Vertical Spacing Rhythm**: Strict adherence to an 8pt base grid for structural containers (`space-md`, `space-lg`, `space-xl`) and a 4pt sub-grid for badge insets and inline chip gaps (`space-xs`, `space-sm`).

## Elevation & Depth

Visual hierarchy uses a combined strategy of low-contrast borders and subtle, cool-toned ambient shadows. Surfaces avoid heavy drop shadows to prevent visual noise.

- **Surface Ground**: The page background (`#F5F8FF`) forms the base layer (level 0).
- **Card Tier (Level 1)**: Pure white `#FFFFFF` with a crisp `1px solid #E2E8F0` border and an ambient shadow: `0 1px 3px 0 rgba(15, 42, 92, 0.05), 0 1px 2px -1px rgba(15, 42, 92, 0.04)`.
- **Floating Controls & Dropdowns (Level 2)**: Used for active query palettes, exam timer heads, and popovers: `0 10px 15px -3px rgba(15, 42, 92, 0.08), 0 4px 6px -4px rgba(15, 42, 92, 0.04)` enclosed by `1px solid #CBD5E1`.
- **Active Focus & Modals (Level 3)**: Overlay backdrops utilize `#0F2A5C` at `40%` opacity with zero blur, prioritizing render speed on low-power devices. Modal dialogs sit atop with a `0 20px 25px -5px rgba(15, 42, 92, 0.12)` shadow envelope.

## Shapes

The interface employs a balanced geometric scale calibrated to produce approachable yet structural study cards:

- **Base Radius (`rounded-md`, 0.5rem / 8px)**: Applied to text input fields, toolbars, list elements, code snippets, and button groups.
- **Large Radius (`rounded-lg`, 1rem / 16px)**: Applied to modular panels, diagnostic summary widgets, and test prompt containers.
- **Card & Surface Enclosures (`rounded-xl`, 1.5rem / 24px)**: Applied to primary study cards, performance overviews, flashcard viewports, and AI dialogue modules.
- **Pill Radius (`rounded-full`, 9999px)**: Reserved strictly for status badges, syllabus tags, micro progress counters, and floating action indicators.

## Components

### Buttons
- **Primary**: Background `#2563EB`, text `#FFFFFF`, minimum height `44px` for touch targets. Border radius `0.5rem`. Hover state darkens to `#1D4ED8`. Active state scales subtly (`0.98`) without layout shift.
- **Secondary**: Transparent background, border `1px solid #CBD5E1`, text `#0F2A5C`. Hover state applies `#F1F5F9`.
- **Destructive**: Background `#DC2626`, text `#FFFFFF`.
- **Ghost/Tertiary**: Text `#2563EB`, zero border, `space-sm` padding for inline actions.

### Cards
- Constructed with `#FFFFFF` background, `rounded-xl` (1.5rem / 24px) corners, and `1px solid #E2E8F0`. Padding uses `space-lg` (1.5rem) on desktop and `space-md` (1rem) on mobile. Header areas house title and status chips, with content body segregated by an optional `#F1F5F9` divider.

### Input Fields & AI Prompt Bar
- Inputs use `#FFFFFF` fill, `1px solid #CBD5E1` border, `rounded-md` (0.5rem), and text `#1E293B`.
- Focus state shifts border directly to `#2563EB` paired with an outline ring of `2px solid rgba(37, 99, 235, 0.2)`.
- The AI Prompt input features a pinned right-side submit button and quick-action chips directly below.

### Chips & Badges
- **Status / Streaks**: Pill-shaped with background `rgba(245, 158, 11, 0.12)`, text `#B45309`, and font token `label-sm`.
- **Subject Tags**: Background `#EFF6FF`, text `#1D4ED8`, border `1px solid #DBEAFE`.
- **Correct State**: Background `rgba(22, 163, 74, 0.1)`, text `#15803D`, border `1px solid rgba(22, 163, 74, 0.2)`.
- **Error State**: Background `rgba(220, 38, 38, 0.1)`, text `#B91C1C`, border `1px solid rgba(220, 38, 38, 0.2)`.

### Checkboxes & Multiple-Choice Radios
- MCQ options are styled as interactive card rows (`min-height: 48px`, border `1px solid #E2E8F0`, `rounded-md`).
- Selected state turns the container border to `2px solid #2563EB` with a subtle `#EFF6FF` tint.
- Evaluated Correct state shifts border and tint to `#16A34A` / `rgba(22, 163, 74, 0.06)`. Evaluated Wrong state shifts border and tint to `#DC2626` / `rgba(220, 38, 38, 0.06)`.

### Lists & Revision Trackers
- Dense, tabular-aligned rows separated by `1px solid #F1F5F9`. Left section contains priority icon or rank, center carries concept title and metadata (`body-sm`), right section anchors completion toggle or action link.

### Progress Meters & Streaks
- Linear progress tracks use `#E2E8F0` at an `8px` height with a `rounded-full` inner fill of `#F59E0B` for streaks and `#2563EB` for syllabus completion.