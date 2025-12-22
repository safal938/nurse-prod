# Medforce AI Clinic - Design System
**Version:** 1.1.0 (Lightweight Refactor)
**Philosophy:** "Maximum Data, Minimum Ink."
**Tech Stack:** React, Tailwind CSS, Lucide Icons

This design system prioritizes legibility, speed, and clinical precision. It avoids heavy shadows in favor of crisp borders and distinct typography hierarchy.

---

## 1. Foundations

### 🎨 Color Palette
The palette is intentionally restrained. We use a **Sky Blue** primary for actions to distinguish from clinical **Red/Green** status indicators.

| Token Name | Hex Value | Tailwind Class | Usage |
| :--- | :--- | :--- | :--- |
| **Primary** | `#0ea5e9` | `text-primary`, `bg-primary` | Main actions, active states, links. |
| **Primary Hover** | `#0284c7` | `hover:bg-primary-hover` | Hover states for interactive elements. |
| **Neutral 900** | `#171717` | `text-neutral-900` | Headings, primary text, high-contrast buttons. |
| **Neutral 600** | `#525252` | `text-neutral-600` | Body text, secondary labels. |
| **Neutral 200** | `#e5e5e5` | `border-neutral-200` | Card borders, dividers. |
| **Surface** | `#ffffff` | `bg-white` | Card backgrounds, panels. |
| **Background** | `#f3f4f6` | `bg-secondary` | App background (typically used with opacity). |

#### Status Colors (Semantic)
Used exclusively for patient health status.

*   **Critical:** `bg-red-50` + `text-red-600` (Alert)
*   **Stable:** `bg-green-50` + `text-green-600` (Safe)
*   **Recovering:** `bg-blue-50` + `text-blue-600` (Progress)
*   **Discharged:** `bg-neutral-100` + `text-neutral-500` (Inactive)

---

### 🔤 Typography
**Primary Font:** `Poppins` (Google Fonts)
**Fallbacks:** Sans-serif

| Role | Weight | Size | Tracking | Usage |
| :--- | :--- | :--- | :--- | :--- |
| **Page Title** | 400 (Regular) | `text-2xl` | Normal | Main page headers. |
| **Card Title** | 500 (Medium) | `text-lg` | Tight | Patient names. |
| **Label** | 500 (Medium) | `text-xs` | Wide/Uppercase | Metadata labels (e.g., "CHIEF COMPLAINT"). |
| **Body** | 400 (Regular) | `text-sm` | Normal | General content. |
| **Clinical** | 400 (Regular) | `text-[15px]` | Normal | **Serif Font Override** for HPI/Clinical Notes. |
| **Data** | 400 (Regular) | `text-xs` | Normal | Monospace numbers, IDs (tnum enabled). |

**Global Rule:**
```css
font-feature-settings: "tnum"; /* Tabular Numerals for vertical alignment */
```

---

## 2. Component DNA

### Shape & Structure
*   **Border Radius:** `8px` (`rounded-lg`) or `12px` (`rounded-xl`) for larger containers.
*   **Border Width:** `1px` Solid.
*   **Shadows:** Minimal to None.
    *   *Idle:* `shadow-sm` or none.
    *   *Hover:* `shadow-md` or border color change.

### Cards (Patient Card)
The primary unit of the interface.
*   **Background:** White.
*   **Border:** `neutral-200`.
*   **Interaction:** On hover, the border turns `primary` (Sky Blue) and the card lifts slightly or internal elements shift.
*   **Content Strategy:**
    1.  **Header:** Name (Left) + Status Badge (Right).
    2.  **Body:** Secondary metadata (ID, Age, Gender).
    3.  **Content:** Highlighted diagnosis block (`bg-neutral-50`).
    4.  **Footer:** Update timestamp.

### Buttons & Badges
*   **Primary Button:**
    *   Background: `bg-neutral-900` (Black).
    *   Text: White.
    *   Radius: `rounded-xl`.
    *   Effect: `hover:bg-neutral-800`, `active:scale-[0.98]`.
*   **Status Badge:**
    *   Style: Flat pastel background with saturated text.
    *   Shape: `rounded-md`.
    *   Text: Uppercase, `text-xs`, `font-medium`.
    *   *Example:* `<span className="bg-red-50 text-red-600 rounded-md">CRITICAL</span>`

---

## 3. UI Patterns & Layout

### Grid System
*   **Responsive:**
    *   Mobile: 1 Column.
    *   Tablet: 2 Columns.
    *   Desktop: 3 Columns.
*   **Max Width:** `1920px` (Optimized for medical monitors).
*   **Margins:** 90% width centered.

### Navigation (Header)
*   **Style:** Sticky Top (`sticky top-0`).
*   **Appearance:** White background, 1px bottom border (`border-border`).
*   **Z-Index:** `z-10` or `z-20`.

### Detail View (Patient Profile)
*   **Layout:** 3-Column Asymmetric Grid.
    *   *Left (3 cols):* Demographics & History (Context).
    *   *Center (6 cols):* Clinical Notes & Documents (Focus).
    *   *Right (3 cols):* Actions & Communication (Utility).
*   **Lightbox:** Full-screen modal with backdrop blur (`backdrop-blur-sm`) for viewing documents.

---

## 4. Implementation Config (Tailwind)

To replicate this design, ensure your `tailwind.config.js` contains:

```javascript
theme: {
  extend: {
    colors: {
      primary: {
        DEFAULT: '#0ea5e9',
        hover: '#0284c7',
      },
      secondary: {
        DEFAULT: '#f3f4f6', // Light Gray Wash
      },
      border: '#e5e5e5',
    },
    fontFamily: {
      sans: ['"Poppins"', 'sans-serif'],
    },
    borderRadius: {
      base: '8px',
    }
  }
}
```
