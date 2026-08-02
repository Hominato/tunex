/* ==========================================================================
   TUNEX - MAIN DASHBOARD & CANVAS CHARTING ENGINE
   ========================================================================== */

const Dashboard = {
  activeView: 'dashboard',

  init() {
    this.renderBalances();
    this.renderRecentTransactions();
    this.renderNotifications();
    this.initCanvasCharts();
  },

  // ------------------------------------------------------------------------
  // SPA View Navigation Router
  // ------------------------------------------------------------------------
  switchView(viewId) {
    this.activeView = viewId;

    // Update Sidebar Active Links
    document.querySelectorAll('.sidebar-menu-item').forEach(item => {
      item.classList.remove('active');
      if (item.getAttribute('data-view') === viewId) {
        item.classList.add('active');
      }
    });

    // Update View Sections Visibility
    document.querySelectorAll('.view-section').forEach(sec => {
      sec.classList.remove('active');
    });

    const targetSec = document.getElementById(`view-${viewId}`);
    if (targetSec) {
      targetSec.classList.add('active');
    }

    // Trigger View Specific Renderers
    if (viewId === 'dashboard') {
      this.renderBalances();
      this.renderRecentTransactions();
    } else if (viewId === 'accounts') {
      AccountsManager.init();
    } else if (viewId === 'transactions') {
      TransactionsManager.render();
    } else if (viewId === 'investments') {
      setTimeout(() => this.initCanvasCharts(), 100);
    } else if (viewId === 'disbursements') {
      DisbursementManager.init();
    } else if (viewId === 'statements') {
      ReceiptManager.generateStatementView();
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Auto-close drawer on mobile after navigating
    if (window.innerWidth <= 768) {
      this.closeMobileDrawer();
    }
  },

  toggleSidebar() {
    const sidebar = document.getElementById('appSidebar');
    const overlay = document.getElementById('mobileDrawerOverlay');
    if (sidebar) {
      if (window.innerWidth <= 768) {
        const isOpen = sidebar.classList.toggle('mobile-open');
        if (overlay) overlay.classList.toggle('active', isOpen);
        // Prevent body scroll while drawer is open
        document.body.style.overflow = isOpen ? 'hidden' : '';
      } else {
        sidebar.classList.toggle('collapsed');
      }
    }
  },

  closeMobileDrawer() {
    const sidebar = document.getElementById('appSidebar');
    const overlay = document.getElementById('mobileDrawerOverlay');
    if (sidebar && window.innerWidth <= 768) {
      sidebar.classList.remove('mobile-open');
      if (overlay) overlay.classList.remove('active');
      document.body.style.overflow = '';
    }
  },

  // ------------------------------------------------------------------------
  // Balance Counters Rendering
  // ------------------------------------------------------------------------
  renderBalances() {
    const accounts = StorageManager.getAccounts();
    
    const checkingEl = document.getElementById('checkingBalanceDisplay');
    const savingsEl = document.getElementById('savingsBalanceDisplay');
    const investmentEl = document.getElementById('investmentBalanceDisplay');

    if (checkingEl) UI.animateCounter(checkingEl, accounts.checking.balance);
    if (savingsEl) UI.animateCounter(savingsEl, accounts.savings.balance);
    if (investmentEl) UI.animateCounter(investmentEl, accounts.investment.balance);
  },

  // ------------------------------------------------------------------------
  // Dashboard Recent Transactions Preview Table
  // ------------------------------------------------------------------------
  renderRecentTransactions() {
    const tableBody = document.getElementById('recentTransactionsTableBody');
    if (!tableBody) return;

    const txns = StorageManager.getTransactions().slice(0, 5);

    if (txns.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:20px;">No recent transactions.</td></tr>`;
      return;
    }

    tableBody.innerHTML = txns.map(t => {
      const isCredit = (t.type === 'Deposit' || t.type === 'Dividend');
      const badgeClass = t.status === 'Completed' ? 'badge-success' : 'badge-warning';

      return `
        <tr style="cursor:pointer;" onclick='ReceiptManager.showReceiptModal(${JSON.stringify(t)})'>
          <td class="font-mono" style="font-weight:700;">${t.ref}</td>
          <td style="font-weight:600;">${t.beneficiary}</td>
          <td class="font-mono" style="font-weight:800; color: ${isCredit ? 'var(--accent-emerald)' : 'var(--text-primary)'}">
            ${isCredit ? '+' : '-'}${Helpers.formatCurrency(t.amount)}
          </td>
          <td>${t.type}</td>
          <td><span class="badge ${badgeClass}">${t.status}</span></td>
          <td style="font-size:0.8rem; color:var(--text-muted);">${t.date}</td>
        </tr>
      `;
    }).join('');
  },

  // ------------------------------------------------------------------------
  // Notifications Bell Drawer
  // ------------------------------------------------------------------------
  toggleNotifications() {
    const dropdown = document.getElementById('notifDropdown');
    if (dropdown) {
      dropdown.classList.toggle('show');
      this.renderNotifications();
    }
  },

  renderNotifications() {
    const notifList = document.getElementById('notifList');
    if (!notifList) return;

    const notifs = StorageManager.getNotifications();
    notifList.innerHTML = notifs.map(n => `
      <div class="notif-item">
        <div class="notif-item-title">${n.title}</div>
        <div style="color: var(--text-secondary); margin-bottom: 4px;">${n.message}</div>
        <div class="notif-item-time">${n.time}</div>
      </div>
    `).join('');
  },

  // ------------------------------------------------------------------------
  // Global Header Instant Search Filter
  // ------------------------------------------------------------------------
  handleGlobalSearch(event) {
    const query = event.target.value.toLowerCase().trim();
    if (!query) return;

    if (this.activeView !== 'transactions') {
      this.switchView('transactions');
    }
    const searchInput = document.getElementById('txnSearchInput');
    if (searchInput) {
      searchInput.value = query;
      TransactionsManager.render();
    }
  },

  // ------------------------------------------------------------------------
  // 3D Debit Card Flip & Controls
  // ------------------------------------------------------------------------
  flipDebitCard() {
    const container = document.getElementById('debitCardContainer');
    if (container) {
      container.classList.toggle('flipped');
    }
  },

  toggleCardFreeze() {
    const chk = document.getElementById('cardFreezeToggle').checked;
    StorageManager.updateCard({ frozen: chk });
    UI.showToast(chk ? 'Debit Card Frozen' : 'Debit Card Unfrozen', chk ? 'error' : 'success');
  },

  toggleCardMask() {
    const chk = document.getElementById('cardUnmaskToggle').checked;
    const cardEl = document.getElementById('displayCardNumber');
    const card = StorageManager.getCard();

    if (cardEl) {
      if (chk) {
        cardEl.textContent = card.number;
      } else {
        cardEl.textContent = '4532 •••• •••• 5625';
      }
    }
  },

  saveProfileSettings(e) {
    e.preventDefault();
    const name = document.getElementById('setFullName').value;
    const email = document.getElementById('setEmail').value;
    const phone = document.getElementById('setPhone').value;

    StorageManager.updateUser({ name, email, phone });
    UI.showToast('Profile settings saved successfully!', 'success');
  },

  // ------------------------------------------------------------------------
  // PURE VANILLA HTML5 2D CANVAS CHARTING ENGINE
  // ------------------------------------------------------------------------
  initCanvasCharts() {
    this.drawGrowthChartCanvas();
    this.drawAllocationChartCanvas();
  },

  // Portfolio Growth Line Graph
  drawGrowthChartCanvas() {
    const canvas = document.getElementById('growthChartCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;

    // Clear
    ctx.clearRect(0, 0, width, height);

    const data = [3.8, 3.95, 4.1, 4.05, 4.35, 4.6, 4.85]; // Millions
    const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];

    const padding = 40;
    const chartW = width - padding * 2;
    const chartH = height - padding * 2;

    const minVal = 3.5;
    const maxVal = 5.2;

    // Grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = padding + (chartH / 4) * i;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();
    }

    // Points calculation
    const points = data.map((val, idx) => {
      const x = padding + (chartW / (data.length - 1)) * idx;
      const y = padding + chartH - ((val - minVal) / (maxVal - minVal)) * chartH;
      return { x, y, val, label: labels[idx] };
    });

    // Draw Fill Gradient
    const gradient = ctx.createLinearGradient(0, padding, 0, height - padding);
    gradient.addColorStop(0, 'rgba(16, 185, 129, 0.35)');
    gradient.addColorStop(1, 'rgba(16, 185, 129, 0.0)');

    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      const xc = (points[i].x + points[i - 1].x) / 2;
      const yc = (points[i].y + points[i - 1].y) / 2;
      ctx.quadraticCurveTo(points[i - 1].x, points[i - 1].y, xc, yc);
    }
    ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y);
    ctx.lineTo(points[points.length - 1].x, height - padding);
    ctx.lineTo(points[0].x, height - padding);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    // Draw Smooth Line Curve
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      const xc = (points[i].x + points[i - 1].x) / 2;
      const yc = (points[i].y + points[i - 1].y) / 2;
      ctx.quadraticCurveTo(points[i - 1].x, points[i - 1].y, xc, yc);
    }
    ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y);
    ctx.strokeStyle = '#10B981';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Draw Data Dots & Labels
    points.forEach((pt) => {
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 5, 0, Math.PI * 2);
      ctx.fillStyle = '#10B981';
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#FFFFFF';
      ctx.stroke();

      // Label below
      ctx.fillStyle = '#94A3B8';
      ctx.font = '11px Plus Jakarta Sans, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(pt.label, pt.x, height - 12);
    });
  },

  // Asset Allocation Donut Chart
  drawAllocationChartCanvas() {
    const canvas = document.getElementById('allocationChartCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;

    ctx.clearRect(0, 0, width, height);

    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2 - 10;
    const innerRadius = radius * 0.65;

    const slices = [
      { percentage: 0.40, color: '#3B82F6' }, // Sovereign Bonds
      { percentage: 0.35, color: '#10B981' }, // BNP Securities
      { percentage: 0.25, color: '#F59E0B' }  // Equities
    ];

    let startAngle = -Math.PI / 2;

    slices.forEach(slice => {
      const sliceAngle = slice.percentage * Math.PI * 2;
      const endAngle = startAngle + sliceAngle;

      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.arc(centerX, centerY, innerRadius, endAngle, startAngle, true);
      ctx.closePath();

      ctx.fillStyle = slice.color;
      ctx.fill();

      startAngle = endAngle;
    });

    // Center text
    ctx.fillStyle = '#F8FAFC';
    ctx.font = 'bold 14px Plus Jakarta Sans, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('100%', centerX, centerY - 6);
    ctx.fillStyle = '#94A3B8';
    ctx.font = '10px Plus Jakarta Sans, sans-serif';
    ctx.fillText('Allocated', centerX, centerY + 10);
  }
};
