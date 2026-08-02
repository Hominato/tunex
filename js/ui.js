/* ==========================================================================
   TUNEX - UI MANAGER & INTERACTIVE CONTROLLERS
   ========================================================================== */

const UI = {
  init() {
    this.initClock();
    this.initTheme();
    this.setupModalBackdrop();
  },

  // ------------------------------------------------------------------------
  // Live Digital Clock & Date
  // ------------------------------------------------------------------------
  initClock() {
    const timeEl = document.getElementById('digitalClockTime');
    const dateEl = document.getElementById('digitalClockDate');

    const update = () => {
      const now = new Date();
      if (timeEl) {
        timeEl.textContent = now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true
        });
      }
      if (dateEl) {
        dateEl.textContent = Helpers.getCurrentFormattedDate();
      }
    };

    update();
    setInterval(update, 1000);
  },

  // ------------------------------------------------------------------------
  // Theme Engine (Dark / Light persistence)
  // ------------------------------------------------------------------------
  initTheme() {
    const prefs = StorageManager.getPreferences();
    const currentTheme = prefs.theme || 'dark';
    document.documentElement.setAttribute('data-theme', currentTheme);
    this.updateThemeIcons(currentTheme);
  },

  toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') || 'dark';
    const nextTheme = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', nextTheme);
    StorageManager.savePreferences({ theme: nextTheme });
    this.updateThemeIcons(nextTheme);
    this.showToast(`Switched to ${nextTheme} theme`, 'info');
  },

  updateThemeIcons(theme) {
    const btn = document.getElementById('themeToggleBtn');
    if (!btn) return;
    if (theme === 'light') {
      btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>`;
      btn.setAttribute('title', 'Switch to Dark Mode');
    } else {
      btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>`;
      btn.setAttribute('title', 'Switch to Light Mode');
    }
  },

  // ------------------------------------------------------------------------
  // Toast Notifications
  // ------------------------------------------------------------------------
  showToast(message, type = 'info') {
    let container = document.getElementById('toastContainer');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toastContainer';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    let iconSvg = '';
    if (type === 'success') {
      iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10B981" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`;
    } else if (type === 'error') {
      iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#EF4444" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`;
    } else {
      iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`;
    }

    toast.innerHTML = `${iconSvg} <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = 'toastSlideOut 0.3s ease forwards';
      setTimeout(() => {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 300);
    }, 4000);
  },

  // ------------------------------------------------------------------------
  // Modal Controller
  // ------------------------------------------------------------------------
  setupModalBackdrop() {
    let backdrop = document.getElementById('appModalBackdrop');
    if (!backdrop) {
      backdrop = document.createElement('div');
      backdrop.id = 'appModalBackdrop';
      backdrop.className = 'modal-backdrop';
      backdrop.innerHTML = `
        <div class="modal-dialog">
          <div class="modal-header">
            <h3 id="appModalTitle" class="modal-title">Modal Title</h3>
            <button class="modal-close" onclick="UI.closeModal()">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <div id="appModalBody" class="modal-body"></div>
        </div>
      `;
      document.body.appendChild(backdrop);
    }
  },

  showModal(title, contentHtml) {
    const backdrop = document.getElementById('appModalBackdrop');
    const titleEl = document.getElementById('appModalTitle');
    const bodyEl = document.getElementById('appModalBody');

    if (titleEl) titleEl.textContent = title;
    if (bodyEl) bodyEl.innerHTML = contentHtml;
    if (backdrop) backdrop.classList.add('show');
  },

  closeModal() {
    const backdrop = document.getElementById('appModalBackdrop');
    if (backdrop) backdrop.classList.remove('show');
  },

  // ------------------------------------------------------------------------
  // Animated Balance Counter (Count Up Effect)
  // ------------------------------------------------------------------------
  animateCounter(element, targetValue, duration = 1200) {
    if (!element) return;
    const startValue = 0;
    const startTime = performance.now();

    const update = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease Out Quad
      const easeProgress = 1 - (1 - progress) * (1 - progress);
      const currentValue = startValue + (targetValue - startValue) * easeProgress;

      element.textContent = Helpers.formatCurrency(currentValue);

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        element.textContent = Helpers.formatCurrency(targetValue);
      }
    };

    requestAnimationFrame(update);
  }
};
