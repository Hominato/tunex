/* ==========================================================================
   TUNEX - DISBURSEMENT MANAGER MODULE (TRANSFER VS CASHIER'S CHECK)
   ========================================================================== */

const DisbursementManager = {
  selectedMethod: 'transfer',

  init() {
    this.resetForm();
  },

  resetForm() {
    this.selectedMethod = 'transfer';
    this.selectMethod('transfer');

    const refInput = document.getElementById('disburseRefInput');
    if (refInput) refInput.value = 'DSB-' + Math.floor(100000 + Math.random() * 900000);

    const amountInput = document.getElementById('disburseAmountInput');
    if (amountInput) amountInput.value = '';

    this.updateCalculations();
  },

  selectMethod(method) {
    this.selectedMethod = method;

    const transferCard = document.getElementById('disburseMethodTransferCard');
    const checkCard = document.getElementById('disburseMethodCheckCard');
    const transferFields = document.getElementById('disburseTransferFields');
    const checkFields = document.getElementById('disburseCheckFields');

    const radios = document.getElementsByName('disbursementMethodRadio');

    if (method === 'transfer') {
      if (transferCard) {
        transferCard.style.border = '2px solid var(--accent-blue)';
        transferCard.style.background = 'rgba(59, 130, 246, 0.08)';
      }
      if (checkCard) {
        checkCard.style.border = '1px solid var(--card-border)';
        checkCard.style.background = 'var(--card-bg)';
      }
      if (transferFields) transferFields.style.display = 'block';
      if (checkFields) checkFields.style.display = 'none';
      if (radios[0]) radios[0].checked = true;
    } else {
      if (checkCard) {
        checkCard.style.border = '2px solid var(--accent-gold)';
        checkCard.style.background = 'rgba(245, 158, 11, 0.08)';
      }
      if (transferCard) {
        transferCard.style.border = '1px solid var(--card-border)';
        transferCard.style.background = 'var(--card-bg)';
      }
      if (checkFields) checkFields.style.display = 'block';
      if (transferFields) transferFields.style.display = 'none';
      if (radios[1]) radios[1].checked = true;
    }
  },

  updateCalculations() {
    const accounts = StorageManager.getAccounts();
    const currentBalance = accounts.checking.balance;
    const amountInput = document.getElementById('disburseAmountInput');
    const amountVal = parseFloat(amountInput ? amountInput.value : 0) || 0;
    const remaining = currentBalance - amountVal;

    const availEl = document.getElementById('disburseAvailBal');
    const remEl = document.getElementById('disburseRemBal');

    if (availEl) availEl.textContent = Helpers.formatCurrency(currentBalance);
    if (remEl) {
      remEl.textContent = Helpers.formatCurrency(remaining);
      remEl.style.color = remaining < 0 ? 'var(--accent-danger)' : 'var(--accent-emerald)';
    }
  },

  processDisbursement() {
    const accounts = StorageManager.getAccounts();
    const currentBalance = accounts.checking.balance;
    const amountInput = document.getElementById('disburseAmountInput');
    const amount = parseFloat(amountInput ? amountInput.value : 0);

    if (isNaN(amount) || amount <= 0) {
      UI.showToast('Please enter a valid disbursement amount greater than $0.00', 'error');
      return;
    }

    if (amount > currentBalance) {
      UI.showToast(`Disbursement amount cannot exceed available balance (${Helpers.formatCurrency(currentBalance)})`, 'error');
      return;
    }

    const ref = document.getElementById('disburseRefInput').value || ('DSB-' + Math.floor(100000 + Math.random() * 900000));
    const isCheck = this.selectedMethod === 'check';

    let methodText = isCheck ? "Cashier's Check Delivery" : "Bank Transfer (Direct Wire)";
    let beneficiaryText = isCheck 
      ? document.getElementById('disbursePayeeName').value || 'David McKenzie'
      : 'David McKenzie (BancFirst)';
    
    let detailsText = isCheck
      ? `Courier: ${document.getElementById('disburseCourier').value}`
      : 'Account ********5625 (BancFirst)';

    // Show simulated modal
    UI.showModal('Processing Disbursement', `
      <div class="processing-modal-content">
        <h4 style="margin-bottom: 12px;">Authorizing Disbursement Request</h4>
        <p style="font-size: 0.85rem; color: var(--text-secondary);">Dispatching ${methodText} for ${Helpers.formatCurrency(amount)}...</p>
        
        <div class="progress-bar-track">
          <div id="disburseProgressFill" class="progress-bar-fill"></div>
        </div>
        <div id="disburseStepText" class="processing-step-status">Verifying disbursement allocation...</div>
      </div>
    `);

    const fill = document.getElementById('disburseProgressFill');
    const stepText = document.getElementById('disburseStepText');

    const steps = [
      { pct: 30, text: 'Verifying available liquidity...' },
      { pct: 60, text: isCheck ? 'Generating trackable Cashier Check...' : 'Encrypting ACH/Wire protocol...' },
      { pct: 100, text: 'Disbursement Approved & Logged' }
    ];

    steps.forEach((step, idx) => {
      setTimeout(() => {
        if (fill) fill.style.width = `${step.pct}%`;
        if (stepText) stepText.textContent = step.text;

        if (idx === steps.length - 1) {
          setTimeout(() => {
            UI.closeModal();

            // Persist to LocalStorage
            const newBal = currentBalance - amount;
            StorageManager.updateCheckingBalance(newBal);

            const txnData = {
              ref: ref,
              beneficiary: beneficiaryText,
              bank: isCheck ? 'Tunex Treasury Disburse' : 'BancFirst',
              accountNumber: '********5625',
              routingNumber: '********3632',
              amount: amount,
              type: 'Disbursement',
              method: methodText,
              status: 'Completed',
              date: new Date().toISOString().split('T')[0],
              time: new Date().toLocaleTimeString('en-US', { hour12: false }),
              purpose: `Disbursement (${methodText} - ${detailsText})`
            };

            StorageManager.addTransaction(txnData);
            StorageManager.addNotification(
              'Disbursement Processed',
              `${Helpers.formatCurrency(amount)} via ${methodText} (${ref}).`
            );

            // Update UI
            Dashboard.renderBalances();
            this.resetForm();

            UI.showToast('Disbursement submitted successfully!', 'success');
            ReceiptManager.showReceiptModal(txnData);
          }, 500);
        }
      }, (idx + 1) * 600);
    });
  },

  /* -----------------------------------------------------------------------
     Tax & Compliance Panel Handlers
     ----------------------------------------------------------------------- */
  showVATInfo(event) {
    if (event) event.preventDefault();
    UI.showModal(
      'VAT / GST Information',
      `
      <div style="font-size: 0.88rem; line-height: 1.7; color: var(--text-secondary);">
        <p style="margin-bottom: 14px;">Your <strong style="color:var(--text-primary)">VAT / GST registration</strong> is on file and verified. This information is used to accurately determine applicable tax obligations on disbursements processed through BNP Paribas Securities Corp.</p>

        <div style="background: rgba(16,185,129,0.07); border: 1px solid rgba(16,185,129,0.25); border-radius: 10px; padding: 14px 18px; margin-bottom: 16px;">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 10px; font-weight: 700; color: var(--text-primary); font-size: 0.92rem;">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10B981" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            Status: Completed &amp; Verified
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 0.82rem;">
            <div><span style="color: var(--text-muted);">VAT Number:</span> <strong>EU826504183</strong></div>
            <div><span style="color: var(--text-muted);">Jurisdiction:</span> <strong>EU / US</strong></div>
            <div><span style="color: var(--text-muted);">Filing Status:</span> <strong>Exempt (W-9 on file)</strong></div>
            <div><span style="color: var(--text-muted);">Last Updated:</span> <strong>Jan 15, 2026</strong></div>
          </div>
        </div>

        <p style="font-size: 0.80rem; color: var(--text-muted);">To update your VAT/GST registration details, please contact your Tunex relationship manager or visit the compliance portal.</p>
      </div>
      <div style="text-align: right; margin-top: 16px;">
        <button class="btn btn-primary btn-sm" onclick="UI.closeModal()">Close</button>
      </div>
      `
    );
  },

  showDisbursementStatus() {
    UI.showModal(
      'Disbursement Status — Initiated / Pending',
      `
      <div style="font-size: 0.88rem; line-height: 1.7; color: var(--text-secondary);">
        <p style="margin-bottom: 16px;">Your disbursement request has been <strong style="color: #F59E0B;">initiated and is currently pending</strong> final ledger authorization. The timeline below reflects the current processing stage.</p>

        <!-- Status Timeline -->
        <div style="display: flex; flex-direction: column; gap: 14px; margin-bottom: 20px;">

          <div style="display: flex; gap: 14px; align-items: flex-start;">
            <div style="width: 30px; height: 30px; border-radius: 50%; background: #10B981; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <div>
              <div style="font-weight: 700; color: var(--text-primary);">Request Submitted</div>
              <div style="font-size: 0.78rem; color: var(--text-muted);">Disbursement order received and logged in the system.</div>
            </div>
          </div>

          <div style="display: flex; gap: 14px; align-items: flex-start;">
            <div style="width: 30px; height: 30px; border-radius: 50%; background: #10B981; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <div>
              <div style="font-weight: 700; color: var(--text-primary);">Compliance Review Passed</div>
              <div style="font-size: 0.78rem; color: var(--text-muted);">VAT, Tax Interview, and DAC7 checks all verified.</div>
            </div>
          </div>

          <div style="display: flex; gap: 14px; align-items: flex-start;">
            <div style="width: 30px; height: 30px; border-radius: 50%; background: linear-gradient(135deg,#F59E0B,#D97706); display: flex; align-items: center; justify-content: center; flex-shrink: 0; animation: pulse 1.5s infinite;">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            </div>
            <div>
              <div style="font-weight: 700; color: #F59E0B;">Awaiting Ledger Authorization ← Current Stage</div>
              <div style="font-size: 0.78rem; color: var(--text-muted);">Funds are queued for final senior ledger sign-off. ETA: 1–2 business days.</div>
            </div>
          </div>

          <div style="display: flex; gap: 14px; align-items: flex-start; opacity: 0.4;">
            <div style="width: 30px; height: 30px; border-radius: 50%; border: 2px dashed var(--card-border); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </div>
            <div>
              <div style="font-weight: 700; color: var(--text-primary);">Funds Released</div>
              <div style="font-size: 0.78rem; color: var(--text-muted);">Disbursement wire / check dispatched to beneficiary.</div>
            </div>
          </div>
        </div>

        <div style="background: rgba(245,158,11,0.07); border: 1px solid rgba(245,158,11,0.25); border-radius: 10px; padding: 12px 16px; font-size: 0.80rem;">
          <strong style="color: #F59E0B;">⏳ Expected Settlement:</strong> 1–2 business banking days from authorization approval. You will receive a notification upon completion.
        </div>
      </div>
      <div style="text-align: right; margin-top: 18px;">
        <button class="btn btn-primary btn-sm" onclick="UI.closeModal()">Got it</button>
      </div>
      `
    );
  }
};

