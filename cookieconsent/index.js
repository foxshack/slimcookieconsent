/**
 * CookieConsent - GDPR compliant cookie consent management
 * @version 1.0.0
 */

(function (global) {
  'use strict';

  const STORAGE_KEY = 'cookieconsent-preferences';
  const STORAGE_VERSION = 1;
  const DEFAULT_OPTIONS = {
    essentialMessage: 'Essential cookies are required to operate this website. They enable basic functionality such as security and network management.',
    optionalMessage: 'Optional cookies help us improve your experience by collecting usage data and enabling personalization features.',
    onAccept: null,
    onReject: null,
    onInit: null,
  };

  let config = { ...DEFAULT_OPTIONS };
  let consentState = null;
  let popupElement = null;
  let listeners = {};

  /**
   * Check if localStorage is available
   */
  function isStorageAvailable() {
    try {
      const test = '__cookieconsent_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * Get stored consent preferences
   */
  function getStoredConsent() {
    if (!isStorageAvailable()) {
      return null;
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        return null;
      }
      return JSON.parse(stored);
    } catch (e) {
      console.warn('CookieConsent: Failed to parse stored preferences', e);
      return null;
    }
  }

  /**
   * Save consent preferences to storage
   */
  function saveConsent(state) {
    if (!isStorageAvailable()) {
      console.warn('CookieConsent: localStorage unavailable, consent will not persist');
      return;
    }

    try {
      const toStore = {
        essential: true,
        optional: state.optional || false,
        timestamp: Date.now(),
        version: STORAGE_VERSION,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));
      consentState = toStore;
    } catch (e) {
      console.error('CookieConsent: Failed to save preferences', e);
    }
  }

  /**
   * Create and inject consent popup DOM
   */
  function createPopup() {
    if (popupElement) {
      return popupElement;
    }

    const popup = document.createElement('div');
    popup.id = 'cookieconsent-popup';
    popup.setAttribute('role', 'dialog');
    popup.setAttribute('aria-labelledby', 'cookieconsent-title');
    popup.setAttribute('aria-modal', 'true');
    popup.innerHTML = `
      <div class="cookieconsent-container">
        <div class="cookieconsent-content">
          <h2 id="cookieconsent-title">Cookie Consent</h2>
          
          <div class="cookieconsent-section">
            <label class="cookieconsent-cookie-type">
              <input type="checkbox" class="cookieconsent-essential" disabled checked aria-label="Essential cookies" />
              <span class="cookieconsent-label-text">
                <strong>Essential</strong>
                <p>${config.essentialMessage}</p>
              </span>
            </label>
          </div>

          <div class="cookieconsent-section">
            <label class="cookieconsent-cookie-type">
              <input type="checkbox" class="cookieconsent-optional" aria-label="Optional cookies" />
              <span class="cookieconsent-label-text">
                <strong>Optional</strong>
                <p>${config.optionalMessage}</p>
              </span>
            </label>
          </div>

          <div class="cookieconsent-actions">
            <button class="cookieconsent-btn cookieconsent-btn-reject" type="button">Reject Optional</button>
            <button class="cookieconsent-btn cookieconsent-btn-accept" type="button">Accept All</button>
          </div>
        </div>
      </div>
    `;

    popup.style.display = 'none';
    document.body.appendChild(popup);

    attachPopupListeners(popup);
    popupElement = popup;
    return popup;
  }

  /**
   * Attach event listeners to popup buttons
   */
  function attachPopupListeners(popup) {
    const acceptBtn = popup.querySelector('.cookieconsent-btn-accept');
    const rejectBtn = popup.querySelector('.cookieconsent-btn-reject');
    const optionalCheckbox = popup.querySelector('.cookieconsent-optional');

    acceptBtn.addEventListener('click', function () {
      saveConsent({ optional: true });
      hideConsent();
      emit('accept', consentState);
      if (config.onAccept && typeof config.onAccept === 'function') {
        config.onAccept(consentState);
      }
    });

    rejectBtn.addEventListener('click', function () {
      saveConsent({ optional: false });
      hideConsent();
      emit('reject', consentState);
      if (config.onReject && typeof config.onReject === 'function') {
        config.onReject(consentState);
      }
    });

    optionalCheckbox.addEventListener('change', function () {
      // Update UI state when checkbox changes (for keyboard accessibility)
      const acceptBtn = popup.querySelector('.cookieconsent-btn-accept');
      acceptBtn.textContent = this.checked ? 'Accept All' : 'Accept Essential Only';
    });
  }

  /**
   * Show consent popup
   */
  function showConsent() {
    const popup = createPopup();
    popup.style.display = 'flex';
    const optionalCheckbox = popup.querySelector('.cookieconsent-optional');
    if (consentState) {
      optionalCheckbox.checked = consentState.optional;
    } else {
      optionalCheckbox.checked = true;
    }
  }

  /**
   * Hide consent popup
   */
  function hideConsent() {
    if (popupElement) {
      popupElement.style.display = 'none';
    }
  }

  /**
   * Get current consent state
   */
  function getConsent() {
    return consentState ? { ...consentState } : null;
  }

  /**
   * Set consent state programmatically
   */
  function setConsent(state) {
    if (!state || typeof state !== 'object') {
      console.error('CookieConsent: setConsent requires an object');
      return;
    }
    saveConsent({
      optional: state.optional === true,
    });
  }

  /**
   * Check if user has accepted optional cookies
   */
  function hasOptionalCookies() {
    return consentState && consentState.optional === true;
  }

  /**
   * Reset consent and show popup
   */
  function reset() {
    if (isStorageAvailable()) {
      localStorage.removeItem(STORAGE_KEY);
    }
    consentState = null;
    showConsent();
  }

  /**
   * Event emitter - emit custom events
   */
  function on(eventName, callback) {
    if (!listeners[eventName]) {
      listeners[eventName] = [];
    }
    listeners[eventName].push(callback);
  }

  /**
   * Event emitter - trigger events
   */
  function emit(eventName, data) {
    if (!listeners[eventName]) {
      return;
    }
    listeners[eventName].forEach(function (callback) {
      try {
        callback(data);
      } catch (e) {
        console.error('CookieConsent: Error in event listener', e);
      }
    });
  }

  /**
   * Initialize cookie consent
   */
  function init(options) {
    if (options && typeof options === 'object') {
      Object.keys(options).forEach(function (key) {
        if (key in DEFAULT_OPTIONS || key === 'onAccept' || key === 'onReject' || key === 'onInit') {
          config[key] = options[key];
        }
      });
    }

    // Load stored consent
    const stored = getStoredConsent();
    if (stored) {
      consentState = stored;
    } else {
      // No stored consent, show popup with optional pre-ticked
      consentState = {
        essential: true,
        optional: true,
        timestamp: Date.now(),
        version: STORAGE_VERSION,
      };
      createPopup();
      showConsent();
    }

    // Fire init callback
    if (config.onInit && typeof config.onInit === 'function') {
      config.onInit(consentState);
    }

    emit('init', consentState);
  }

  /**
   * Inject minimal CSS styling
   */
  function injectStyles() {
    const styleId = 'cookieconsent-styles';
    if (document.getElementById(styleId)) {
      return; // Already injected
    }

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      #cookieconsent-popup {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        background: #fff;
        box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
        z-index: 9999;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        display: flex;
        justify-content: center;
        align-items: center;
      }

      .cookieconsent-container {
        width: 100%;
        max-width: 600px;
        padding: 24px;
      }

      .cookieconsent-content {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      .cookieconsent-content h2 {
        margin: 0;
        font-size: 20px;
        font-weight: 600;
      }

      .cookieconsent-section {
        padding: 12px 0;
        border-bottom: 1px solid #e5e5e5;
      }

      .cookieconsent-section:last-of-type {
        border-bottom: none;
      }

      .cookieconsent-cookie-type {
        display: flex;
        gap: 12px;
        cursor: pointer;
        align-items: flex-start;
      }

      .cookieconsent-cookie-type input[type="checkbox"] {
        margin-top: 2px;
        cursor: pointer;
        width: 18px;
        height: 18px;
        min-width: 18px;
        accent-color: #333;
      }

      .cookieconsent-cookie-type input[type="checkbox"]:disabled {
        cursor: not-allowed;
        opacity: 0.6;
      }

      .cookieconsent-label-text {
        flex: 1;
      }

      .cookieconsent-label-text strong {
        display: block;
        font-weight: 600;
        margin-bottom: 4px;
      }

      .cookieconsent-label-text p {
        margin: 0;
        font-size: 14px;
        line-height: 1.5;
        color: #666;
      }

      .cookieconsent-actions {
        display: flex;
        gap: 12px;
        justify-content: flex-end;
        margin-top: 16px;
      }

      .cookieconsent-btn {
        padding: 10px 20px;
        font-size: 14px;
        font-weight: 500;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        transition: background-color 0.2s;
      }

      .cookieconsent-btn-reject {
        background-color: #f0f0f0;
        color: #333;
      }

      .cookieconsent-btn-reject:hover {
        background-color: #e0e0e0;
      }

      .cookieconsent-btn-accept {
        background-color: #333;
        color: #fff;
      }

      .cookieconsent-btn-accept:hover {
        background-color: #555;
      }

      .cookieconsent-btn:focus {
        outline: 2px solid #333;
        outline-offset: 2px;
      }

      @media (max-width: 640px) {
        #cookieconsent-popup {
          bottom: 0;
          padding: 0;
        }

        .cookieconsent-container {
          max-width: 100%;
        }

        .cookieconsent-actions {
          flex-direction: column;
        }

        .cookieconsent-btn {
          width: 100%;
        }
      }
    `;

    document.head.appendChild(style);
  }

  /**
   * Public API
   */
  const CookieConsent = {
    init: init,
    showConsent: showConsent,
    hideConsent: hideConsent,
    getConsent: getConsent,
    setConsent: setConsent,
    hasOptionalCookies: hasOptionalCookies,
    reset: reset,
    on: on,
  };

  // Auto-inject styles when module loads
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectStyles);
  } else {
    injectStyles();
  }

  // Export for CommonJS
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = CookieConsent;
  }

  // Export for global
  global.CookieConsent = CookieConsent;
})(typeof window !== 'undefined' ? window : global);
