# 04 — Animation, Accessibility, and Performance Specification

## 1. Motion philosophy

Motion must explain hierarchy, state, navigation, or identity. It must not exist only to make every element move.

The visual standard is:

- Smooth.
- Restrained.
- Responsive to user input.
- Consistent.
- Interruptible.
- Accessible.
- Fast on ordinary devices.

A polished portfolio does not need maximum animation. It needs a small number of memorable sequences and excellent micro-interactions.

---

## 2. Animation ownership

### Motion library

Use `motion` for:

- Route transitions.
- Layout transitions.
- Shared-element transitions.
- Hover, tap, and focus feedback.
- Section reveals.
- Staggered text and list entrances.
- Mode-switch content transitions.
- Small scroll-linked transforms.

### GSAP

Use GSAP only for:

1. The home-page hero's signature entrance, if Motion cannot express it cleanly.
2. One desktop featured-work scroll sequence, if the design uses pinning or tightly synchronized timelines.

Use `@gsap/react` and scoped cleanup.

### Lenis

Use Lenis only as progressive enhancement:

- Desktop and capable devices.
- Disabled for reduced motion.
- Disabled when it causes keyboard, anchor, focus, or scroll-restoration issues.
- Native scrolling must remain the functional baseline.

### Hard rule

No DOM element may have the same transform or opacity controlled by both Motion and GSAP.

---

## 3. Motion tokens

### Durations

| Token | Duration | Use |
|---|---:|---|
| Instant | 100–140 ms | Active-state response |
| Quick | 180–240 ms | Buttons, tooltips, icon state |
| Standard | 320–420 ms | Cards, panels, small reveals |
| Slow | 520–680 ms | Route and mode transitions |
| Cinematic | 800–1000 ms | Hero sequence only |

No essential content should wait more than 800 ms before becoming readable.

### Easing

Primary enter:

```text
cubic-bezier(0.22, 1, 0.36, 1)
```

Exit:

```text
cubic-bezier(0.4, 0, 1, 1)
```

Standard UI:

```text
cubic-bezier(0.2, 0, 0, 1)
```

Springs:

- Low bounce.
- No elastic text or navigation.
- Use physical springs for draggable or magnetic interactions only.

### Stagger

- Text line stagger: 40–70 ms.
- Card stagger: 60–100 ms.
- Maximum total stagger window: 450 ms.

---

## 4. Signature animation specifications

## 4.1 First-load hero

Sequence:

1. Background grid resolves from low opacity.
2. Monogram appears.
3. Headline lines reveal through clipped masks.
4. Supporting text fades and rises 12–20 px.
5. Calls to action appear.
6. Technical status panel resolves last.

Total duration: 900–1200 ms.  
First visit only for the complete sequence. Repeat navigation should use a shorter 300–450 ms transition.

Do not use a blocking loader unless the critical assets genuinely require it. If used, maximum visible duration is 600 ms and it must disappear immediately when the page is ready.

## 4.2 Project dossier hover

Desktop pointer behavior:

- Media scales 1.00 → 1.025.
- Border signal travels across one edge.
- Metadata increases contrast.
- Arrow translates 4–6 px.
- Optional preview frame changes.

Keyboard focus must produce an equivalent visible state.

## 4.3 Route transition

- Current route fades and moves 8–16 px.
- New route enters after the old route is visually cleared.
- Header remains stable where possible.
- Focus moves to the new page's heading or main landmark after navigation.
- Maximum duration: 500–650 ms.

## 4.4 SYSTEM → STORY transition

- Use View Transition API or Motion layout transition with fallback.
- Reveal warm palette through a mask.
- Change typography styling and grid behavior.
- Avoid morphing text into unreadable states.
- Preserve route history and browser back behavior.

## 4.5 Scroll reveals

- Trigger once for most sections.
- Use opacity and translate only.
- Reveal distance: 12–32 px.
- Avoid every paragraph animating separately.
- Content above the fold must not wait for an intersection observer.

## 4.6 Photography grid

- Images load with a short opacity transition.
- Hover may reveal metadata on desktop.
- Lightbox uses a restrained scale/fade.
- No automatic slideshow by default.
- If slideshow is later added, provide play/pause and pause on focus/hover.

---

## 5. Reduced-motion specification

Respect `prefers-reduced-motion: reduce` and provide an optional site control.

When reduced motion is active:

- Disable Lenis.
- Disable parallax.
- Disable pinned scroll scenes.
- Disable magnetic buttons.
- Disable cursor-follow effects.
- Replace masks and large movement with 120–180 ms opacity transitions.
- Remove looping background animation.
- Keep immediate state feedback.
- Preserve content and navigation order.

CSS baseline:

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    scroll-behavior: auto !important;
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

Do not rely only on this global rule. Components with Motion, GSAP, canvas, or requestAnimationFrame must explicitly opt out.

---

## 6. Accessibility requirements

### Semantic structure

Each page must include:

- One `<main>`.
- One visible H1.
- Logical heading hierarchy.
- Semantic navigation.
- Lists for repeated items.
- Buttons for actions and links for navigation.
- Landmarks with labels where more than one of a type exists.

### Keyboard

All functionality must work using:

- Tab and Shift+Tab.
- Enter and Space where appropriate.
- Escape to close dialog, drawer, palette, and lightbox.
- Arrow keys where the interaction pattern requires them.

No keyboard traps.

### Focus

- Always show a high-contrast focus-visible state.
- Do not remove outlines without a replacement.
- Return focus to the trigger after closing a modal or drawer.
- On route change, move focus intentionally without disorienting the user.

### Skip link

First focusable element:

`Skip to main content`

### Command palette

- Built on an accessible dialog pattern.
- Proper label.
- Escape closes.
- Focus is trapped while open.
- Results are keyboard selectable.
- Shortcuts are supplemental.

### Color

- Body text contrast at least WCAG AA.
- Accent text must pass contrast against its background.
- Do not communicate status using color alone.

### Form

- Every input has a visible label.
- Errors linked with `aria-describedby`.
- Error summary optional but recommended.
- Pending state announced.
- Success/error status uses a live region.
- Toast is not the only feedback.

### Media

- Meaningful images have descriptive alt text.
- Decorative images use empty alt.
- Videos require captions when speech exists.
- Autoplay video must be muted, short, pauseable, and disabled for reduced motion.

---

## 7. Animation performance rules

Prefer animating:

- `transform`.
- `opacity`.

Avoid animating:

- `width`.
- `height`.
- `top`, `left`, `right`, `bottom`.
- Large blur values.
- Large box shadows.
- Background position on large layers.
- Complex filters on full-screen media.

Use `will-change` only immediately before or during known animation. Do not add it globally.

### Runtime behavior

- Pause looping animation when the page is not visible.
- Stop requestAnimationFrame loops on unmount.
- Clean up all ScrollTriggers.
- Debounce or avoid resize work.
- Use passive listeners where appropriate.
- Avoid reading layout and writing styles repeatedly in the same frame.

---

## 8. Performance budgets

### Core Web Vitals targets

- LCP: ≤ 2.5 seconds.
- INP: ≤ 200 ms.
- CLS: ≤ 0.1.
- Measure at the 75th percentile when field data is available.

### Lighthouse production targets

| Category | Target |
|---|---:|
| Performance | 90+ mobile, 95+ desktop |
| Accessibility | 95+ |
| Best Practices | 95+ |
| SEO | 95+ |

### Bundle targets

- Initial route JavaScript: target ≤ 180 KB gzip where practical.
- No unused heavy 3D library in the main bundle.
- Lightbox loaded only on the Beyond route.
- GSAP sequence code limited to routes that use it.
- Photography data and images not imported into the professional home bundle unless required for the preview.

### Page transfer targets

- Home initial transfer: target ≤ 1.5 MB on first load.
- Other non-gallery routes: target ≤ 1.2 MB.
- Photography route may be larger over time, but first viewport must remain controlled.

### Image targets

- Hero/LCP image: ≤ 180 KB when possible.
- Project thumbnails: 80–220 KB.
- Photography thumbnails: 40–160 KB depending on dimensions.
- Full lightbox images loaded on demand.

---

## 9. Mobile performance mode

Use CSS and media queries rather than JavaScript device detection where possible.

On small screens:

- Remove large fixed layers.
- Remove custom cursor.
- Use standard vertical project flow.
- Reduce background decoration.
- Avoid fixed video backgrounds.
- Reduce simultaneous animated elements.
- Avoid scroll pinning.

On low-power or data-saving environments, optional enhancement:

- Respect `navigator.connection?.saveData` when available.
- Replace video previews with poster images.
- Skip non-essential texture assets.

---

## 10. Manual QA matrix

| Test | Desktop | Tablet | Mobile | Keyboard | Reduced motion |
|---|---|---|---|---|---|
| Header/navigation | Required | Required | Required | Required | Required |
| Hero | Required | Required | Required | Required | Required |
| Project dossiers | Required | Required | Required | Required | Required |
| Case-study route | Required | Required | Required | Required | Required |
| SYSTEM/STORY switch | Required | Required | Required | Required | Required |
| Command palette | Required | Optional shortcut | Hidden shortcut | Required | Required |
| Photography lightbox | Required | Required | Required | Required | Required |
| Contact form | Required | Required | Required | Required | Required |
| 404 | Required | Required | Required | Required | Required |

Browsers:

- Current Chrome.
- Current Firefox.
- Current Edge.
- Current Safari on macOS/iOS when available.
- Android Chrome.

Minimum viewport checks:

- 320 × 568.
- 375 × 667.
- 390 × 844.
- 768 × 1024.
- 1366 × 768.
- 1440 × 900.
- 1920 × 1080.

---

## 11. Motion acceptance criteria

The animation system is complete only when:

- The site remains fully understandable with all motion removed.
- No essential content is hover-only.
- Route changes preserve expected browser navigation.
- Reduced-motion mode removes scroll-linked and large spatial movement.
- No animation causes horizontal overflow.
- No animation causes meaningful layout shift.
- No persistent animation consumes CPU while the tab is hidden.
- Focus states remain visible during and after transitions.
- Performance remains within the defined budgets.
