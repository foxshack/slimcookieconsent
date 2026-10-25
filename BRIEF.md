# Cookie Consent Brief

## Project Overview

A lightweight, GDPR-compliant cookie consent solution designed for easy integration into any website. The library provides consent management with minimal UI overhead, storing user preferences in browser storage and allowing host sites to trigger callbacks when users accept optional cookies.

---

## Objectives

1. **GDPR Compliance** — Implement a simple, legally compliant cookie consent mechanism that respects user privacy
2. **Cookie Differentiation** — Clearly distinguish between essential (required) and optional cookies
3. **Minimal UI** — Provide an unobtrusive, lightweight consent interface
4. **Callback Integration** — Enable consuming sites to trigger actions when users accept optional cookies
5. **Preference Management** — Allow users to modify consent preferences at any time via a triggerable popup command

---

## Scope

### Included Features

- ✅ Cookie consent banner/popup with accept/reject options
- ✅ Browser storage (localStorage/sessionStorage) for persistent consent state
- ✅ Clear differentiation between essential and optional cookies (no granular categorization)
- ✅ Minimal, clean UI (no distracting animations or complex styling)
- ✅ Public API to trigger popup for preference changes
- ✅ Callback mechanism for host sites to hook into accept events
- ✅ Detection of existing consent state to avoid re-showing banner
- ✅ Optional Google Tag Manager Consent Mode integration (lightweight, no extra dependencies)

### Excluded Features

- ❌ Cookie category granularity (no "analytics," "marketing," "functional" splits)
- ❌ Complex UI customization options
- ❌ Cookie scanning/detection
- ❌ Internationalization (i18n) support
- ❌ Analytics integration

---

## Technical Specifications

### Architecture

- **Delivery Method:** JavaScript module (CommonJS)
- **Storage:** Browser `localStorage` (with graceful fallback if unavailable)
- **DOM Integration:** Inject consent banner as DOM element when needed
- **Library Size:** Minimal footprint (target < 10KB unminified)

### Browser Storage

**Storage Key:** `cookieconsent-preferences` (or similar)

**Storage Format:**
```json
{
  "essential": true,
  "optional": false,
  "timestamp": 1635123456789,
  "version": 1
}
```

### Public API

#### Initialization
```javascript
CookieConsent.init(options)
```

**Options Object:**
- `essentialMessage` (string) — Description of essential cookies
- `optionalMessage` (string) — Description of optional cookies
- `gtmConsent` (boolean) — Enable Google Tag Manager consent integration *(default: false)*
- `onAccept` (function) — Callback fired when user accepts optional cookies
- `onReject` (function) — Callback fired when user rejects optional cookies
- `onInit` (function) — Callback fired when consent module initializes

#### GTM Integration (Optional)

When `gtmConsent: true`, the library automatically manages Google Tag Manager Consent Mode:
- Sets default consent to `denied` before GTM loads
- Updates `analytics_storage` and `ad_storage` based on user choice
- No manual gtag() calls required
- Persists consent across sessions

#### Methods

- `CookieConsent.showConsent()` — Display the consent popup
- `CookieConsent.hideConsent()` — Hide the consent popup
- `CookieConsent.getConsent()` — Retrieve current consent state object
- `CookieConsent.setConsent(state)` — Programmatically set consent state
- `CookieConsent.reset()` — Clear stored consent and show popup again
- `CookieConsent.hasOptionalCookies()` — Check if user accepted optional cookies

---

## UI/UX Requirements

### Consent Popup

- **Display Trigger:** Auto-show on first visit (if no stored preference) or via API call
- **Position:** Bottom of viewport (fixed) or modal overlay
- **Content Structure:**
  - Header: "Cookie Consent" or similar
  - Essential description (read-only, always enabled)
  - Optional description with toggle/checkbox
  - Action buttons: Accept All / Reject Optional / Save Preferences
- **Styling:** Minimal, neutral colors; no animations
- **Dismissibility:** Users can decline without clicking (optional: close button)

### Accessibility

- ✅ Keyboard navigable
- ✅ Semantic HTML (buttons, labels, landmarks)
- ✅ ARIA labels where appropriate
- ✅ Sufficient color contrast

---

## Implementation Details

### Storage Behavior

- Consent preference persists across sessions (localStorage)
- Popup suppressed if valid consent already stored
- User can reset consent at any time via API or UI button
- Include version field to allow future schema migrations

### Callback Mechanism

Host sites should be able to register multiple callbacks:
```javascript
CookieConsent.on('accept', () => {
  // Load analytics, tracking, etc.
});

CookieConsent.on('reject', () => {
  // Disable optional cookies
});
```

### Graceful Degradation

- If localStorage unavailable, consent state only persists for current session
- If JavaScript disabled, no consent check (assume minimal impact)
- No external dependencies required

---

## Acceptance Criteria

- [ ] Cookie consent popup renders correctly on page load
- [ ] User choices (accept/reject) are stored in browser storage
- [ ] Stored preference persists across page reloads and new sessions
- [ ] Popup only shows on first visit (or after reset)
- [ ] "Show preferences" command triggers popup again
- [ ] Callbacks fire correctly when user accepts/rejects
- [ ] Essential cookies always enabled; optional cookies respect user choice
- [ ] UI is minimal, mobile-friendly, and accessible
- [ ] No external dependencies
- [ ] Unminified bundle < 10KB
- [ ] Works in all modern browsers (Chrome, Firefox, Safari, Edge)
- [ ] GDPR compliant (no dark patterns, clear consent capture)

---

## Success Metrics

- Lightweight, easy to integrate into existing sites
- Clear, unambiguous user consent
- Reliable storage of preferences
- Minimal performance impact on host site