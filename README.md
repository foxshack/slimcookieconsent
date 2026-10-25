# Cookie Consent

A lightweight, GDPR-compliant cookie consent solution for websites. Simple to integrate, no external dependencies, and minimal UI footprint.

## Features

✅ **GDPR Compliant** — Clear consent capture with essential vs optional cookie differentiation  
✅ **Minimal UI** — Unobtrusive consent banner at the bottom of the viewport  
✅ **Persistent Storage** — User preferences stored in localStorage  
✅ **Event-Driven** — Listen for accept/reject/init events and trigger custom actions  
✅ **No Dependencies** — Pure JavaScript, works in all modern browsers  
✅ **Accessible** — Semantic HTML, keyboard navigation, ARIA labels  
✅ **Mobile Friendly** — Responsive design that works on all screen sizes  
✅ **Lightweight** — ~7KB unminified, ~3KB minified+gzipped  

## Installation

### Via NPM
```bash
npm install cookieconsent
```

### Direct Script Tag
```html
<script src="path/to/cookieconsent/index.js"></script>
```

## Quick Start

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body>
  <h1>My Website</h1>
  
  <script src="cookieconsent/index.js"></script>
  <script>
    CookieConsent.init({
      onAccept: function(state) {
        console.log('User accepted cookies:', state);
        // Load analytics, tracking scripts, etc.
      },
      onReject: function(state) {
        console.log('User rejected optional cookies:', state);
      }
    });
  </script>
</body>
</html>
```

## API Reference

### `CookieConsent.init(options)`

Initialize the cookie consent library. If no consent preference is stored, the popup will be shown automatically.

**Parameters:**
- `options` (object) — Configuration object with the following properties:
  - `essentialMessage` (string) — Description of essential cookies *(default: built-in message)*
  - `optionalMessage` (string) — Description of optional cookies *(default: built-in message)*
  - `onAccept` (function) — Callback fired when user accepts optional cookies
  - `onReject` (function) — Callback fired when user rejects optional cookies
  - `onInit` (function) — Callback fired when the library initializes

**Example:**
```javascript
CookieConsent.init({
  essentialMessage: 'We use essential cookies to keep the site secure.',
  optionalMessage: 'Optional cookies help us improve your experience.',
  onAccept: function(state) {
    loadAnalytics();
  },
  onReject: function(state) {
    disableTracking();
  }
});
```

---

### `CookieConsent.showConsent()`

Display the consent popup.

**Example:**
```javascript
CookieConsent.showConsent();
```

---

### `CookieConsent.hideConsent()`

Hide the consent popup without saving preferences.

**Example:**
```javascript
CookieConsent.hideConsent();
```

---

### `CookieConsent.getConsent()`

Get the current consent state.

**Returns:** Object with the following properties:
- `essential` (boolean) — Always `true`
- `optional` (boolean) — `true` if user accepted optional cookies
- `timestamp` (number) — Milliseconds since epoch when consent was saved
- `version` (number) — Storage schema version

**Example:**
```javascript
const state = CookieConsent.getConsent();
console.log(state);
// Output: { essential: true, optional: true, timestamp: 1635123456789, version: 1 }
```

---

### `CookieConsent.setConsent(state)`

Set the consent state programmatically (useful for admin panels or programmatic control).

**Parameters:**
- `state` (object) — Object with `optional` boolean property

**Example:**
```javascript
CookieConsent.setConsent({ optional: true });
```

---

### `CookieConsent.hasOptionalCookies()`

Check if the user has accepted optional cookies.

**Returns:** `true` if optional cookies are accepted, `false` otherwise

**Example:**
```javascript
if (CookieConsent.hasOptionalCookies()) {
  loadGoogleAnalytics();
}
```

---

### `CookieConsent.reset()`

Clear the stored consent preference and show the consent popup again.

**Example:**
```javascript
CookieConsent.reset();
```

---

### `CookieConsent.on(eventName, callback)`

Listen for consent events.

**Parameters:**
- `eventName` (string) — Event type: `'accept'`, `'reject'`, or `'init'`
- `callback` (function) — Function called when event fires, receives consent state as argument

**Available Events:**
- `init` — Fired when library initializes
- `accept` — Fired when user accepts optional cookies
- `reject` — Fired when user rejects optional cookies

**Example:**
```javascript
CookieConsent.on('accept', function(state) {
  console.log('Cookies accepted:', state);
  loadTrackingPixels();
});

CookieConsent.on('reject', function(state) {
  console.log('Cookies rejected:', state);
  disableTracking();
});
```

---

## Storage Format

Preferences are stored in `localStorage` under the key `cookieconsent-preferences`:

```json
{
  "essential": true,
  "optional": false,
  "timestamp": 1635123456789,
  "version": 1
}
```

If localStorage is unavailable, consent state only persists for the current session.

---

## Browser Support

| Browser | Support |
|---------|---------|
| Chrome  | ✅ All versions |
| Firefox | ✅ All versions |
| Safari  | ✅ 11+ |
| Edge    | ✅ All versions |
| IE 11   | ⚠️ Requires polyfills for arrow functions |

---

## Customization

### Custom Messages

```javascript
CookieConsent.init({
  essentialMessage: 'These cookies are required for the website to function properly.',
  optionalMessage: 'We use these cookies to improve your browsing experience and analyze site usage.'
});
```

### Custom Styling

The library injects minimal CSS. To override styles, add CSS after the script:

```html
<script src="cookieconsent/index.js"></script>
<style>
  #cookieconsent-popup {
    background: #1a1a1a;
    color: white;
  }

  .cookieconsent-btn-accept {
    background: #28a745;
  }

  .cookieconsent-btn-reject {
    background: #6c757d;
  }
</style>
```

---

## Examples

### Example 1: Load Google Analytics only if user accepts

```javascript
CookieConsent.init({
  onAccept: function(state) {
    if (state.optional) {
      // Load Google Analytics
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('consent', 'update', {
        'analytics_storage': 'granted'
      });
    }
  }
});
```

### Example 2: Settings Page with Consent Control

```html
<button onclick="showSettings()">Cookie Settings</button>

<script>
  function showSettings() {
    CookieConsent.showConsent();
  }

  document.getElementById('accept-all').addEventListener('click', function() {
    CookieConsent.setConsent({ optional: true });
  });

  document.getElementById('reject-all').addEventListener('click', function() {
    CookieConsent.setConsent({ optional: false });
  });
</script>
```

### Example 3: Check Consent Before Loading Third-Party Script

```javascript
CookieConsent.init({
  onInit: function(state) {
    if (state.optional) {
      loadFacebookPixel();
    }
  }
});

function loadFacebookPixel() {
  const script = document.createElement('script');
  script.src = 'https://connect.facebook.net/en_US/fbevents.js';
  document.head.appendChild(script);
}
```

---

## License

MIT

## Author

mikeh74
