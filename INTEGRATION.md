# SlimCookieConsent Integration Guide

Quick integration guide for consuming sites.

## Basic Integration (30 seconds)

### 1. Add the Script

Include the cookie consent script in your HTML:

```html
<script src="path/to/cookieconsent/index.js"></script>
```

### 2. Initialize

Initialize with default settings:

```html
<script>
  SlimSlimCookieConsent.init();
</script>
```

That's it! The consent popup will automatically show on first visit.

---

## Standard Integration (with Analytics)

### 1. Add Script and Initialize

```html
<script src="path/to/cookieconsent/index.js"></script>
<script>
  SlimCookieConsent.init({
    onAccept: function(state) {
      if (state.optional) {
        loadAnalytics();
      }
    }
  });

  function loadAnalytics() {
    // Load Google Analytics or similar
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=GA_ID';
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'GA_ID');
  }
</script>
```

---

## Advanced Integration (Custom UI)

### Add "Cookie Settings" Button

```html
<button onclick="SlimCookieConsent.showConsent()">Cookie Settings</button>
```

### Listen to Events

```javascript
SlimCookieConsent.init();

// Listen for user acceptance
SlimCookieConsent.on('accept', function(state) {
  console.log('User accepted cookies');
  loadThirdPartyScripts();
});

// Listen for rejection
SlimCookieConsent.on('reject', function(state) {
  console.log('User rejected optional cookies');
  disableTracking();
});

// Listen for initialization
SlimCookieConsent.on('init', function(state) {
  console.log('Consent module initialized:', state);
});
```

---

## Check Consent Before Loading

```javascript
SlimCookieConsent.init();

// Later, check if optional cookies are accepted
if (SlimCookieConsent.hasOptionalCookies()) {
  loadFacebookPixel();
}
```

---

## Custom Messages

```javascript
SlimCookieConsent.init({
  essentialMessage: 'These cookies are necessary for our website to function.',
  optionalMessage: 'We use analytics to understand how you use our site.'
});
```

---

## Programmatic Consent Control

```javascript
// Accept all cookies programmatically
SlimCookieConsent.setConsent({ optional: true });

// Reject optional cookies programmatically
SlimCookieConsent.setConsent({ optional: false });

// Get current consent state
const state = SlimCookieConsent.getConsent();
console.log(state);
// { essential: true, optional: false, timestamp: 1635123456789, version: 1 }

// Reset consent (show popup again, clear storage)
SlimCookieConsent.reset();
```

---

## Common Integrations

### Google Analytics (GA4)

```javascript
SlimCookieConsent.init({
  onAccept: function(state) {
    if (state.optional) {
      // Inject GA4
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('consent', 'update', {
        'analytics_storage': 'granted'
      });

      const script = document.createElement('script');
      script.async = true;
      script.src = 'https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX';
      document.head.appendChild(script);
    }
  },
  onReject: function(state) {
    // Deny analytics
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('consent', 'update', {
      'analytics_storage': 'denied'
    });
  }
});
```

### Facebook Pixel

```javascript
SlimCookieConsent.init({
  onAccept: function(state) {
    if (state.optional) {
      // Inject Facebook Pixel
      !function(f,b,e,v,n,t,s)
      {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};
      // ... rest of pixel code
    }
  }
});
```

### Hotjar

```javascript
SlimCookieConsent.init({
  onAccept: function(state) {
    if (state.optional) {
      (function(h,o,t,j,a,r){
        h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
        h._hjSettings={hjid:XXXXXXX,hjsv:6};
        // ... rest of Hotjar code
      })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
    }
  }
});
```

---

## Testing

### Check Storage

Open DevTools Console and run:

```javascript
// Check current consent state
SlimCookieConsent.getConsent();

// Check localStorage
localStorage.getItem('cookieconsent-preferences');
```

### Manual Testing

1. **First Visit** — Popup should show automatically
2. **Accept** — Preferences saved, popup hides, callback fires
3. **Reload Page** — Popup should NOT show (preference persisted)
4. **Reset** — Click reset, popup shows again
5. **Reject** — Preferences saved with `optional: false`

---

## Troubleshooting

### Popup Not Showing

- Check that script is loaded: `typeof CookieConsent !== 'undefined'`
- Check localStorage is enabled: `localStorage.setItem('test', 'test')`
- Check that `init()` has been called

### Storage Not Persisting

- Verify localStorage is available in browser
- Check browser privacy settings aren't blocking localStorage
- Use Dev Tools → Application → Storage → Local Storage

### Callbacks Not Firing

- Verify callback is a function: `typeof onAccept === 'function'`
- Check browser console for errors
- Verify popup interaction (button clicks) are working

---

## Google Tag Manager (GTM) Consent Mode

CookieConsent has built-in support for GTM Consent Mode. Enable it with a single option.

### Basic GTM Setup

```html
<!-- Google Tag Manager script -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>

<!-- CookieConsent with GTM integration -->
<script src="path/to/cookieconsent/index.js"></script>
<script>
  SlimCookieConsent.init({
    gtmConsent: true  // Automatically manage GTM consent
  });
</script>
```

That's it! Consent is now:
- ✅ Denied by default on first visit
- ✅ Updated when user accepts/rejects
- ✅ Persisted across sessions

### How It Works

1. **Page Load** — Default consent is set to `denied`
2. **User Decides** — Consent is updated to `granted` (accept) or `denied` (reject)
3. **GTM Receives Update** — Analytics and ads respect the user choice

### What Gets Managed

```javascript
// When user accepts optional cookies:
gtag('consent', 'update', {
  'analytics_storage': 'granted',
  'ad_storage': 'granted'
});

// When user rejects optional cookies:
gtag('consent', 'update', {
  'analytics_storage': 'denied',
  'ad_storage': 'denied'
});
```

### GTM + Google Analytics (GA4)

```javascript
SlimCookieConsent.init({
  gtmConsent: true,
  onAccept: function(state) {
    // GTM consent already updated automatically
    // Google Analytics will now track based on consent
    console.log('GA4 will now collect data');
  },
  onReject: function(state) {
    // GTM consent set to denied
    // Google Analytics will not track
    console.log('GA4 will not collect data');
  }
});
```

### GTM + Additional Pixels

Use `gtmConsent` for GTM, then load additional scripts in callbacks:

```javascript
SlimCookieConsent.init({
  gtmConsent: true,  // Manages GTM consent
  onAccept: function(state) {
    if (state.optional) {
      // Load Facebook Pixel
      loadFacebookPixel();
      // Load custom analytics
      loadCustomAnalytics();
    }
  }
});

function loadFacebookPixel() {
  !function(f,b,e,v,n,t,s){if(f.fbq)return;
    // ... Facebook Pixel code
  }(window, document, 'img', 'https://connect.facebook.net/en_US/fbevents.js', 'fbq');
}
```

### Disable GTM Consent (Optional)

If you don't want automatic GTM integration:

```javascript
SlimCookieConsent.init({
  gtmConsent: false  // Disable GTM integration
  // Manage GTM manually in callbacks
});
```

---

For issues or questions, refer to:
- [README.md](./README.md) — Full API reference
- [BRIEF.md](./BRIEF.md) — Project requirements
- [index.html](./index.html) — Interactive demo
