/* ==========================================================================
   TUNEX / BNP PARIBAS - ACCOUNTS MANAGER MODULE (DETAILS & INTERNAL TRANSFERS)
   ========================================================================== */

const AccountsManager = {
  selectedAccount: 'checking',

  init() {
    this.renderBalances();
    this.selectAccount('checking');
  },

  renderBalances() {
    const accounts = StorageManager.getAccounts();
    
    const checkingEl = document.getElementById('accCheckingBal');
    const savingsEl = document.getElementById('accSavingsBal');
    const investmentEl = document.getElementById('accInvestmentBal');

    if (checkingEl) checkingEl.textContent = Helpers.formatCurrency(accounts.checking.balance);
    if (savingsEl) savingsEl.textContent = Helpers.formatCurrency(accounts.savings.balance);
    if (investmentEl) investmentEl.textContent = Helpers.formatCurrency(accounts.investment.balance);
  },

  selectAccount(type) {
    this.selectedAccount = type;

    // Toggle active card CSS
    const cards = {
      checking: document.getElementById('accCardChecking'),
      savings: document.getElementById('accCardSavings'),
      investment: document.getElementById('accCardInvestment')
    };

    Object.keys(cards).forEach(key => {
      if (cards[key]) {
        if (key === type) {
          cards[key].classList.add('active-card');
        } else {
          cards[key].classList.remove('active-card');
        }
      }
    });

    this.renderDetails(type);
    this.renderSubLedger(type);
  },

  renderDetails(type) {
    const titleEl = document.getElementById('accDetailsTitle');
    const contentEl = document.getElementById('accDetailsContent');
    if (!contentEl) return;

    const accounts = StorageManager.getAccounts();

    if (type === 'checking') {
      if (titleEl) titleEl.textContent = 'Checking Account Details';
      contentEl.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 16px;">
          <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--card-border); padding-bottom: 8px;">
            <span style="color: var(--text-secondary);">Account Name:</span>
            <strong>${accounts.checking.name}</strong>
          </div>
          <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--card-border); padding-bottom: 8px;">
            <span style="color: var(--text-secondary);">Account Number:</span>
            <strong style="font-family: var(--font-mono);">${accounts.checking.accountNumber}</strong>
          </div>
          <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--card-border); padding-bottom: 8px;">
            <span style="color: var(--text-secondary);">Routing Number:</span>
            <strong style="font-family: var(--font-mono);">${accounts.checking.routingNumber}</strong>
          </div>
          <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--card-border); padding-bottom: 8px;">
            <span style="color: var(--text-secondary);">Overdraft Protection:</span>
            <span style="color: var(--accent-emerald); font-weight: 700;">Active (Linked to Savings)</span>
          </div>
          <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--card-border); padding-bottom: 8px;">
            <span style="color: var(--text-secondary);">Daily Limit:</span>
            <strong>$50,000.00 / day</strong>
          </div>
          <div style="display: flex; justify-content: space-between; padding-bottom: 8px;">
            <span style="color: var(--text-secondary);">Monthly Maintenance Fee:</span>
            <strong style="color: var(--accent-emerald); font-weight: 700;">$0.00 (Waived for Premium Members)</strong>
          </div>
        </div>
      `;
    } else if (type === 'savings') {
      if (titleEl) titleEl.textContent = 'High-Yield Savings Details';
      contentEl.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 16px;">
          <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--card-border); padding-bottom: 8px;">
            <span style="color: var(--text-secondary);">Account Name:</span>
            <strong>${accounts.savings.name}</strong>
          </div>
          <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--card-border); padding-bottom: 8px;">
            <span style="color: var(--text-secondary);">Annual Percentage Yield (APY):</span>
            <strong style="color: var(--accent-blue); font-weight: 800;">4.85% APY</strong>
          </div>
          <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--card-border); padding-bottom: 8px;">
            <span style="color: var(--text-secondary);">Account Number:</span>
            <strong style="font-family: var(--font-mono);">${accounts.savings.accountNumber}</strong>
          </div>
          <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--card-border); padding-bottom: 8px;">
            <span style="color: var(--text-secondary);">Routing Number:</span>
            <strong style="font-family: var(--font-mono);">${accounts.savings.routingNumber}</strong>
          </div>
          <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--card-border); padding-bottom: 8px;">
            <span style="color: var(--text-secondary);">YTD Accrued Interest:</span>
            <strong style="color: var(--accent-emerald);">$24,180.45</strong>
          </div>
          <div style="display: flex; justify-content: space-between; padding-bottom: 8px;">
            <span style="color: var(--text-secondary);">Next Interest Payout:</span>
            <strong>September 1, 2026</strong>
          </div>
        </div>
      `;
    } else if (type === 'investment') {
      if (titleEl) titleEl.textContent = 'Investment Portfolio Details';
      contentEl.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 16px;">
          <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--card-border); padding-bottom: 8px;">
            <span style="color: var(--text-secondary);">Portfolio Name:</span>
            <strong>${accounts.investment.name}</strong>
          </div>
          <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--card-border); padding-bottom: 8px;">
            <span style="color: var(--text-secondary);">Custody &amp; Securities Clearing:</span>
            <strong>${accounts.investment.firm}</strong>
          </div>
          <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--card-border); padding-bottom: 8px;">
            <span style="color: var(--text-secondary);">YTD Portfolio Returns:</span>
            <strong style="color: var(--accent-emerald); font-weight: 800;">+${accounts.investment.ytdReturnPercent}% YTD</strong>
          </div>
          <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--card-border); padding-bottom: 8px;">
            <span style="color: var(--text-secondary);">Daily Market Value Change:</span>
            <span style="color: var(--accent-emerald); font-weight: 700;">+${accounts.investment.dayReturnPercent}% (+$${accounts.investment.dayReturnAmount.toLocaleString()})</span>
          </div>
          <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--card-border); padding-bottom: 8px;">
            <span style="color: var(--text-secondary);">Asset Classes:</span>
            <strong>Bonds (40%) / Equities (35%) / Cash (25%)</strong>
          </div>
          <div style="display: flex; justify-content: space-between; padding-bottom: 8px;">
            <span style="color: var(--text-secondary);">Portfolio Status:</span>
            <span class="badge badge-success">Optimized</span>
          </div>
        </div>
      `;
    }
  },

  renderSubLedger(type) {
    const tbody = document.getElementById('accLedgerBody');
    if (!tbody) return;

    const txns = StorageManager.getTransactions();
    
    // Filter transactions based on the account type
    const filtered = txns.filter(t => {
      const isChecking = type === 'checking';
      const isSavings = type === 'savings';
      const isInv = type === 'investment';

      // Checkings gets standard Transfers, Disbursements, Card Purchases, and Deposits
      if (isChecking) {
        return t.type === 'Transfer' || t.type === 'Disbursement' || t.type === 'Card Purchase' || (t.type === 'Deposit' && t.purpose !== 'Savings Deposit');
      }
      
      // Savings gets Dividend or interest deposits or transfers designated as savings deposits
      if (isSavings) {
        return t.purpose === 'Savings Deposit' || t.type === 'Dividend' || t.method === 'Savings Credit';
      }

      // Investment gets Dividends, asset allocations, realignment bonds
      if (isInv) {
        return t.type === 'Dividend' || t.purpose.includes('Allocation') || t.purpose.includes('Realignment');
      }

      return true;
    });

    if (filtered.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="3" style="text-align: center; color: var(--text-muted); padding: 24px;">
            No transactions found for this account.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = filtered.map(t => {
      const isDebit = t.type === 'Transfer' || t.type === 'Disbursement' || t.type === 'Card Purchase';
      const amtSign = isDebit ? '-' : '+';
      const amtColor = isDebit ? 'var(--accent-danger)' : 'var(--accent-emerald)';
      
      return `
        <tr>
          <td style="font-family: var(--font-mono); font-size: 0.8rem;">${t.ref}</td>
          <td>
            <div style="font-weight: 700; font-size: 0.85rem;">${t.type}</div>
            <div style="font-size: 0.72rem; color: var(--text-muted);">${t.method || t.purpose}</div>
          </td>
          <td style="font-family: var(--font-mono); text-align: right; font-weight: 700; color: ${amtColor};">
            ${amtSign}${Helpers.formatCurrency(t.amount)}
          </td>
        </tr>
      `;
    }).join('');
  },

  showInternalTransferModal() {
    UI.showModal(
      'Internal Portfolio Transfer',
      `
      <form id="internalTransferForm" onsubmit="AccountsManager.handleInternalTransfer(event)">
        <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 16px;">
          Perform a zero-fee instant transfer of liquidity between checking and savings holdings.
        </p>

        <div class="form-group">
          <label class="form-label">Source Asset Account</label>
          <select id="intSource" class="form-control" onchange="AccountsManager.updateIntModalLimits()">
            <option value="checking">Premium Checking</option>
            <option value="savings">High-Yield Savings</option>
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">Recipient Asset Account</label>
          <select id="intDest" class="form-control">
            <option value="savings">High-Yield Savings</option>
            <option value="checking">Premium Checking</option>
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">
            <span>Transfer Amount ($ USD)</span>
            <span id="intMaxLimit" style="font-size: 0.75rem; color: var(--accent-emerald);"></span>
          </label>
          <div class="input-with-icon">
            <span class="input-icon" style="font-weight: 700; color: var(--accent-emerald);">$</span>
            <input type="number" id="intAmount" class="form-control" min="1" step="0.01" required placeholder="e.g. 50000">
          </div>
        </div>

        <div style="text-align: right; gap: 12px; display: flex; justify-content: flex-end; margin-top: 24px;">
          <button type="button" class="btn btn-secondary btn-sm" onclick="UI.closeModal()">Cancel</button>
          <button type="submit" class="btn btn-primary btn-sm">Execute Transfer</button>
        </div>
      </form>
      `
    );

    this.updateIntModalLimits();
  },

  updateIntModalLimits() {
    const sourceSelect = document.getElementById('intSource');
    const destSelect = document.getElementById('intDest');
    const limitText = document.getElementById('intMaxLimit');
    if (!sourceSelect || !destSelect || !limitText) return;

    const source = sourceSelect.value;
    const accounts = StorageManager.getAccounts();
    const balance = source === 'checking' ? accounts.checking.balance : accounts.savings.balance;

    // Adjust destination select options to prevent transferring to the same account
    if (source === 'checking') {
      destSelect.value = 'savings';
      destSelect.options[0].disabled = true;  // checking is disabled
      destSelect.options[1].disabled = false; // savings is active
    } else {
      destSelect.value = 'checking';
      destSelect.options[0].disabled = false; // checking is active
      destSelect.options[1].disabled = true;  // savings is disabled
    }

    limitText.textContent = `Max: ${Helpers.formatCurrency(balance)}`;
  },

  handleInternalTransfer(event) {
    event.preventDefault();

    const source = document.getElementById('intSource').value;
    const dest = document.getElementById('intDest').value;
    const amountInput = document.getElementById('intAmount');
    const amount = parseFloat(amountInput ? amountInput.value : 0);

    if (isNaN(amount) || amount <= 0) {
      UI.showToast('Please enter a valid amount.', 'error');
      return;
    }

    const store = StorageManager.getStore();
    const sourceBal = source === 'checking' ? store.accounts.checking.balance : store.accounts.savings.balance;

    if (amount > sourceBal) {
      UI.showToast('Insufficient funds in source account.', 'error');
      return;
    }

    // Process Ledger balances
    if (source === 'checking') {
      store.accounts.checking.balance -= amount;
      store.accounts.savings.balance += amount;
    } else {
      store.accounts.savings.balance -= amount;
      store.accounts.checking.balance += amount;
    }

    // Log transaction
    const ref = 'TXN-INT-' + Math.floor(100000 + Math.random() * 900000);
    const sourceName = source === 'checking' ? 'Premium Checking' : 'High-Yield Savings';
    const destName = dest === 'checking' ? 'Premium Checking' : 'High-Yield Savings';

    const txnData = {
      ref: ref,
      beneficiary: destName,
      bank: 'BNP Paribas Sec Corp (Internal)',
      accountNumber: dest === 'checking' ? store.accounts.checking.accountNumber : store.accounts.savings.accountNumber,
      routingNumber: store.accounts.checking.routingNumber,
      amount: amount,
      type: 'Transfer',
      method: 'Internal Transfer',
      status: 'Completed',
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString('en-US', { hour12: false }),
      purpose: `Savings Deposit`
    };

    store.transactions.unshift(txnData);
    
    // Add notification
    const newNotif = {
      id: 'notif-' + Date.now(),
      title: 'Internal Transfer Completed',
      message: `${Helpers.formatCurrency(amount)} transferred from ${sourceName} to ${destName}.`,
      time: 'Just now',
      read: false
    };
    store.notifications.unshift(newNotif);

    // Save and close
    StorageManager.saveStore(store);
    UI.closeModal();

    // Rerender view balances
    this.renderBalances();
    this.selectAccount(this.selectedAccount);
    Dashboard.renderBalances(); // global dashboard balance update

    UI.showToast('Internal transfer completed successfully!', 'success');
  }
};
