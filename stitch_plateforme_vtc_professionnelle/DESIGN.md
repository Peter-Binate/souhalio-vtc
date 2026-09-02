---
name: Midnight Elite
colors:
  surface: '#fdf8f8'
  surface-dim: '#ddd9d8'
  surface-bright: '#fdf8f8'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f7f3f2'
  surface-container: '#f1edec'
  surface-container-high: '#ebe7e6'
  surface-container-highest: '#e5e2e1'
  on-surface: '#1c1b1b'
  on-surface-variant: '#444748'
  inverse-surface: '#313030'
  inverse-on-surface: '#f4f0ef'
  outline: '#747878'
  outline-variant: '#c4c7c7'
  surface-tint: '#5f5e5e'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#1c1b1b'
  on-primary-container: '#858383'
  inverse-primary: '#c8c6c5'
  secondary: '#735b1b'
  on-secondary: '#ffffff'
  secondary-container: '#fedc8f'
  on-secondary-container: '#785f1f'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#1c1b1a'
  on-tertiary-container: '#868382'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e5e2e1'
  primary-fixed-dim: '#c8c6c5'
  on-primary-fixed: '#1c1b1b'
  on-primary-fixed-variant: '#474746'
  secondary-fixed: '#ffdf98'
  secondary-fixed-dim: '#e3c378'
  on-secondary-fixed: '#251a00'
  on-secondary-fixed-variant: '#594403'
  tertiary-fixed: '#e6e2df'
  tertiary-fixed-dim: '#cac6c4'
  on-tertiary-fixed: '#1c1b1a'
  on-tertiary-fixed-variant: '#484645'
  background: '#fdf8f8'
  on-background: '#1c1b1b'
  surface-variant: '#e5e2e1'
  surface-white: '#ffffff'
  deep-midnight: '#0f1115'
  muted-gold: '#bfa15a'
  status-blue: '#2563eb'
typography:
  headline-xl:
    fontFamily: Montserrat
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Montserrat
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Montserrat
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 34px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  price-display:
    fontFamily: Montserrat
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  container-max: 1280px
  gutter: 24px
  section-padding: 80px
  section-padding-mobile: 48px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 32px
---

## Brand & Style

The design system embodies a **Corporate Modern** aesthetic with a **Premium Minimalist** edge. It is tailored for a high-end VTC (chauffeur) service that prioritizes reliability, punctuality, and local expertise in the Île-de-France region. 

The visual narrative is built on the contrast between high-density dark elements (representing the vehicle and the chauffeur’s professionalism) and expansive white space (representing clarity, ease of booking, and "room to breathe"). 

- **Minimalism:** Use heavy white space to focus the user's attention on the booking simulator and CTA buttons.
- **Precision:** Every element is aligned to a strict grid, reflecting the brand's commitment to punctuality.
- **Premium Tactility:** Subtle shadows and micro-interactions provide a sense of depth and quality without the clutter of traditional skeuomorphism.

## Colors

The palette is strictly professional, utilizing high-contrast tones to guide the user journey.

- **Primary (#1a1a1a):** A deep charcoal black used for headers, footers, primary buttons, and critical UI anchors. It represents the "Midnight" service and the luxury of the vehicle.
- **Secondary (#bfa15a):** A muted, refined gold used sparingly for accents, highlights, and secondary call-to-actions to evoke a "premium" or "VIP" feel.
- **Background (#ffffff):** Pure white is the foundation for all content areas to ensure maximum readability and a clean, modern atmosphere.
- **Functional Blue:** Used specifically for map traces and itinerary indicators to provide professional clarity.

## Typography

This design system uses a dual-font approach to balance impact with utility.

- **Headlines (Montserrat):** Geometric and bold. Use Montserrat for all major section headers and hero text to convey confidence and modernity.
- **Body & Controls (Inter):** Highly legible and neutral. Inter is used for all functional text, pricing tables, and input fields to ensure the user can digest complex information (like fare estimates) quickly.
- **Letter Spacing:** Headlines should use a slight negative tracking (-1% to -2%) to feel tighter and more premium. Label text uses wide tracking (5%) for distinct categorization.

## Layout & Spacing

The layout philosophy follows a **Fixed Grid** model for desktop to maintain a structured, editorial feel, transitioning to a flexible fluid model for mobile devices.

- **The 8px Rule:** All spacing increments (padding, margin, gaps) must be multiples of 8px to maintain visual rhythm.
- **Section Breathing:** Use generous vertical padding (80px+) between sections to prevent the UI from feeling "cheap" or cluttered.
- **Responsive Strategy:** On mobile (below 768px), horizontal margins reduce to 16px, and stack spacing for cards becomes the primary vertical separator.

## Elevation & Depth

Visual hierarchy is achieved through a combination of **Tonal Layers** and **Ambient Shadows**.

- **Surface Tiers:** The primary background is `#ffffff`. Secondary containers (like cards or the pricing simulator) use a subtle `#f9f9f9` background or a 1px border in `#eeeeee`.
- **Shadows:** Use large, ultra-soft shadows for interactive cards (e.g., `0px 10px 30px rgba(0,0,0,0.04)`). Avoid heavy, dark shadows; the depth should feel like natural light hitting a clean surface.
- **Interactivity:** Elements should lift slightly (translate -2px) and deepen their shadow on hover to provide tactile feedback.

## Shapes

The shape language is **Soft**, striking a balance between the precision of hard edges and the approachability of rounded corners.

- **Components:** Standard buttons and input fields use a 0.25rem (4px) radius.
- **Cards:** Content containers and the pricing simulator use a 0.5rem (8px) radius to distinguish them as larger, distinct objects.
- **Icons:** Use Lucide icons with a 2px stroke weight to match the clean lines of the typography.

## Components

### Buttons
- **Primary:** Background `#1a1a1a`, Text `#ffffff`, 0.25rem radius. High contrast for "Book Now" or "Calculate" actions.
- **Secondary (Premium):** Background `#bfa15a`, Text `#1a1a1a`. Used for "Call" or "WhatsApp" to highlight the direct human connection.

### Cards
- White background with a 1px `#eeeeee` border and the defined "Ambient Shadow." Used for testimonials, service segments, and airport fare highlights.

### Input Fields & Autocomplete
- Clean borders (1px `#d1d1d1`), 0.25rem radius. Focus state uses a 2px `#1a1a1a` border. MapTiler autocomplete dropdowns should be high-contrast with clear hover states for address selection.

### Data Tables (Pricing)
- Minimalist design. Use a simple horizontal divider (`#eeeeee`) between rows. The first column (Destination) should be Montserrat Bold, while the second column (Price) should use the `price-display` typography token in `#1a1a1a`.

### Sticky Call Button
- A floating action button (FAB) for mobile. Circular or pill-shaped, using the Secondary Gold color for maximum visibility against the white background.