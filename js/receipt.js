/* ==========================================================================
   TUNEX - RECEIPT GENERATOR & STATEMENT BUILDER
   ========================================================================== */

const ReceiptManager = {
  activeReceipt: null,

  setCurrentReceipt(txn) {
    this.activeReceipt = txn;
  },

  showCurrentReceiptModal() {
    if (!this.activeReceipt) {
      const txns = StorageManager.getTransactions();
      if (txns.length > 0) this.activeReceipt = txns[0];
    }
    if (this.activeReceipt) {
      this.showReceiptModal(this.activeReceipt);
    }
  },

  showReceiptModal(txn) {
    this.activeReceipt = txn;
    const html = `
      <div style="background: rgba(15, 23, 42, 0.9); border: 1px solid var(--card-border); border-radius: var(--radius-lg); padding: 24px; font-family: var(--font-main);">
        <!-- Receipt Header -->
        <div style="text-align: center; padding-bottom: 20px; border-bottom: 1px solid var(--card-border); margin-bottom: 20px;">
          <img src="assets/logo.png" alt="BNP Paribas Securities Corp Logo" style="height: 40px; margin-bottom: 8px; border-radius: 6px;">
          <h3 style="margin-bottom: 4px;">Official Transaction Receipt</h3>
          <span class="badge badge-success">Dispatched & Verified</span>
        </div>

        <!-- Details Grid -->
        <div style="display: flex; flex-direction: column; gap: 12px; font-size: 0.9rem; margin-bottom: 24px;">
          <div style="display: flex; justify-content: space-between;">
            <span style="color: var(--text-muted);">Reference Number:</span>
            <span class="font-mono" style="font-weight: 700;">${txn.ref}</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span style="color: var(--text-muted);">Date & Time:</span>
            <span>${txn.date} ${txn.time}</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span style="color: var(--text-muted);">Beneficiary Name:</span>
            <span style="font-weight: 600;">${txn.beneficiary}</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span style="color: var(--text-muted);">Receiving Bank:</span>
            <span>${txn.bank}</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span style="color: var(--text-muted);">Account Number:</span>
            <span class="font-mono">${Helpers.maskAccount(txn.accountNumber || '********5625')}</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span style="color: var(--text-muted);">Routing Number:</span>
            <span class="font-mono">${Helpers.maskAccount(txn.routingNumber || '********3632')}</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span style="color: var(--text-muted);">Investment Bond:</span>
            <span>${txn.bond || 'BNP Paribas Securities Corp.'}</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span style="color: var(--text-muted);">Disbursement Method:</span>
            <span>${txn.method}</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span style="color: var(--text-muted);">Purpose:</span>
            <span>${txn.purpose || 'Money Transfer'}</span>
          </div>
          <div style="display: flex; justify-content: space-between; padding-top: 12px; border-top: 1px dashed var(--card-border);">
            <span style="font-weight: 700; font-size: 1rem;">Amount Transferred:</span>
            <span class="font-mono" style="font-size: 1.3rem; font-weight: 800; color: var(--accent-emerald);">${Helpers.formatCurrency(txn.amount)}</span>
          </div>
        </div>

        <div style="text-align: center; font-size: 0.72rem; color: var(--text-muted); margin-bottom: 20px;">
          Fictional Banking Demonstration • BNP Paribas Securities Corp N.A.
        </div>

        <div style="display: flex; gap: 10px; justify-content: flex-end;">
          <button class="btn btn-secondary btn-sm" onclick="ReceiptManager.downloadCurrentReceiptHTML()">Download HTML</button>
          <button class="btn btn-primary btn-sm" onclick="ReceiptManager.printCurrentReceipt()">Print Receipt</button>
        </div>
      </div>
    `;

    UI.showModal(`Receipt #${txn.ref}`, html);
  },

  downloadCurrentReceiptHTML() {
    const txn = this.activeReceipt || StorageManager.getTransactions()[0];
    if (!txn) return;

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Receipt_${txn.ref}</title>
  <style>
    body { font-family: 'Helvetica Neue', Arial, sans-serif; padding: 40px; max-width: 600px; margin: 0 auto; color: #1e293b; background: #f8fafc; }
    .card { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 32px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); }
    .header { text-align: center; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 24px; }
    .logo { font-size: 24px; font-weight: 800; color: #1d4ed8; letter-spacing: 2px; }
    .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f1f5f9; font-size: 14px; }
    .val { font-weight: 600; }
    .amount-box { text-align: center; margin-top: 24px; padding: 20px; background: #f0fdf4; border-radius: 12px; border: 1px solid #bbf7d0; }
    .amount { font-size: 28px; font-weight: 800; color: #166534; margin-top: 4px; }
    .footer { margin-top: 24px; text-align: center; font-size: 11px; color: #94a3b8; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <div class="logo">BNP PARIBAS SECURITIES CORP</div>
      <p style="margin-top: 4px; color: #64748b;">OFFICIAL TRANSACTION RECEIPT</p>
    </div>
    <div class="row"><span>Reference Number:</span><span class="val">${txn.ref}</span></div>
    <div class="row"><span>Date & Time:</span><span class="val">${txn.date} ${txn.time}</span></div>
    <div class="row"><span>Beneficiary:</span><span class="val">${txn.beneficiary}</span></div>
    <div class="row"><span>Bank:</span><span class="val">${txn.bank}</span></div>
    <div class="row"><span>Account Number:</span><span class="val">${Helpers.maskAccount(txn.accountNumber || '********5625')}</span></div>
    <div class="row"><span>Routing Number:</span><span class="val">${Helpers.maskAccount(txn.routingNumber || '********3632')}</span></div>
    <div class="row"><span>Investment Bond:</span><span class="val">${txn.bond || 'BNP Paribas Securities Corp.'}</span></div>
    <div class="row"><span>Disbursement Method:</span><span class="val">${txn.method}</span></div>
    <div class="row"><span>Purpose:</span><span class="val">${txn.purpose || 'Transfer'}</span></div>
    
    <div class="amount-box">
      <span style="font-size: 12px; color: #166534; font-weight: 700; text-transform: uppercase;">Amount Processed</span>
      <div class="amount">${Helpers.formatCurrency(txn.amount)}</div>
    </div>

    <div class="footer">
      This is an electronically generated receipt for a fictional demonstration banking platform.<br>
      BNP Paribas Securities Corp N.A. • All Rights Reserved.
    </div>
  </div>
</body>
</html>
    `;

    Helpers.downloadFile(`Receipt_${txn.ref}.html`, htmlContent, 'text/html;charset=utf-8;');
  },

  printCurrentReceipt() {
    window.print();
  },

  // ------------------------------------------------------------------------
  // MONTHLY STATEMENT GENERATOR
  // ------------------------------------------------------------------------
  generateStatementView() {
    const month = document.getElementById('statementMonth').value;
    const container = document.getElementById('statementOutputContainer');
    const user = StorageManager.getUser();
    const accounts = StorageManager.getAccounts();
    const txns = StorageManager.getTransactions();

    container.style.display = 'block';

    let totalCredits = 0;
    let totalDebits = 0;

    txns.forEach(t => {
      if (t.type === 'Deposit' || t.type === 'Dividend') {
        totalCredits += t.amount;
      } else {
        totalDebits += t.amount;
      }
    });

    const closingBalance = accounts.checking.balance;
    const openingBalance = closingBalance + totalDebits - totalCredits;

    let rowsHtml = '';
    let running = openingBalance;

    txns.slice().reverse().forEach(t => {
      const isCredit = (t.type === 'Deposit' || t.type === 'Dividend');
      if (isCredit) {
        running += t.amount;
      } else {
        running -= t.amount;
      }

      rowsHtml += `
        <tr>
          <td>${t.date}</td>
          <td>${t.ref}</td>
          <td>${t.beneficiary} (${t.purpose || t.type})</td>
          <td style="color: ${isCredit ? 'var(--accent-emerald)' : 'inherit'}">${isCredit ? '+' + Helpers.formatCurrency(t.amount) : '-'}</td>
          <td style="color: ${!isCredit ? 'var(--accent-danger)' : 'inherit'}">${!isCredit ? '-' + Helpers.formatCurrency(t.amount) : '-'}</td>
          <td class="font-mono">${Helpers.formatCurrency(running)}</td>
        </tr>
      `;
    });

    container.innerHTML = `
      <div style="padding: 10px;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid var(--card-border); padding-bottom: 20px; margin-bottom: 24px;">
          <div>
            <img src="assets/logo.png" alt="BNP Paribas Securities Corp Logo" style="height: 44px; margin-bottom: 8px; border-radius: 6px;">
            <h3>Monthly Account Statement</h3>
            <p style="font-size: 0.85rem; color: var(--text-muted);">Period: ${month}</p>
          </div>
          <div style="text-align: right; font-size: 0.85rem; color: var(--text-secondary);">
            <strong style="color: var(--text-primary); font-size: 1rem;">${user.name}</strong><br>
            Customer ID: ${user.id}<br>
            Account Type: ${user.accountType}<br>
            Account Number: ********5625
          </div>
        </div>

        <!-- Summary Metric Boxes -->
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 32px;">
          <div style="background: rgba(255,255,255,0.03); padding: 16px; border-radius: var(--radius-md); border: 1px solid var(--card-border);">
            <div style="font-size: 0.75rem; color: var(--text-muted);">OPENING BALANCE</div>
            <div class="font-mono" style="font-size: 1.1rem; font-weight: 700; margin-top: 4px;">${Helpers.formatCurrency(openingBalance)}</div>
          </div>
          <div style="background: rgba(16, 185, 129, 0.08); padding: 16px; border-radius: var(--radius-md); border: 1px solid rgba(16,185,129,0.3);">
            <div style="font-size: 0.75rem; color: var(--accent-emerald);">TOTAL CREDITS</div>
            <div class="font-mono" style="font-size: 1.1rem; font-weight: 700; color: var(--accent-emerald); margin-top: 4px;">+${Helpers.formatCurrency(totalCredits)}</div>
          </div>
          <div style="background: rgba(239, 68, 68, 0.08); padding: 16px; border-radius: var(--radius-md); border: 1px solid rgba(239,68,68,0.3);">
            <div style="font-size: 0.75rem; color: var(--accent-danger);">TOTAL DEBITS</div>
            <div class="font-mono" style="font-size: 1.1rem; font-weight: 700; color: var(--accent-danger); margin-top: 4px;">-${Helpers.formatCurrency(totalDebits)}</div>
          </div>
          <div style="background: rgba(59, 130, 246, 0.08); padding: 16px; border-radius: var(--radius-md); border: 1px solid rgba(59,130,246,0.3);">
            <div style="font-size: 0.75rem; color: var(--accent-blue);">CLOSING BALANCE</div>
            <div class="font-mono" style="font-size: 1.1rem; font-weight: 700; color: var(--accent-blue); margin-top: 4px;">${Helpers.formatCurrency(closingBalance)}</div>
          </div>
        </div>

        <h4 style="margin-bottom: 16px;">Statement Ledger Details</h4>
        <div class="table-responsive">
          <table class="custom-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Ref #</th>
                <th>Description</th>
                <th>Credit (+)</th>
                <th>Debit (-)</th>
                <th>Running Balance</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>
        </div>
      </div>
    `;

    UI.showToast(`Generated Statement for ${month}`, 'success');
  },

  printCurrentStatement() {
    window.print();
  }
};
