/* ==========================================================================
   TUNEX - THREE-STAGE TRANSFER WIZARD MODULE
   ========================================================================== */

const TransferWizard = {
  currentStage: 1,
  currentTxnData: null,
  isVerified: false,

  init() {
    this.resetWizard();
  },

  resetWizard() {
    this.currentStage = 1;
    this.isVerified = false;
    this.currentTxnData = null;

    // Reset Stepper
    this.updateStepperUI(1);

    // Reset Stage Panels
    document.querySelectorAll('.transfer-stage-panel').forEach(p => p.classList.remove('active'));
    const stage1 = document.getElementById('transferStage1');
    if (stage1) stage1.classList.add('active');

    // Reset Form Fields
    const terminal = document.getElementById('verificationTerminal');
    if (terminal) {
      terminal.classList.remove('show');
      document.getElementById('terminalLogContent').innerHTML = '';
    }

    const verifyBtn = document.getElementById('verifyBtn');
    if (verifyBtn) {
      verifyBtn.disabled = false;
      verifyBtn.innerHTML = `
        <span>Verify Beneficiary</span>
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
      `;
    }

    const amountInput = document.getElementById('transferAmountInput');
    if (amountInput) amountInput.value = '';

    const refInput = document.getElementById('transferRefInput');
    if (refInput) refInput.value = Helpers.generateTxnRef();

    this.updateLiveCalculations();
  },

  startTransferWithPreset() {
    Dashboard.switchView('transfer');
    this.resetWizard();
  },

  onBeneficiaryChange() {
    const sel = document.getElementById('transferBeneficiarySelect').value;
    const fields = document.getElementById('beneficiaryDetailsFields');
    
    if (sel === 'custom') {
      UI.showToast('Preloaded demo beneficiary David McKenzie selected for best experience.', 'info');
    }
  },

  // ------------------------------------------------------------------------
  // STAGE 1: BENEFICIARY VERIFICATION TERMINAL SIMULATION
  // ------------------------------------------------------------------------
  runVerificationStage1() {
    const btn = document.getElementById('verifyBtn');
    const terminal = document.getElementById('verificationTerminal');
    const logBox = document.getElementById('terminalLogContent');

    btn.disabled = true;
    terminal.classList.add('show');
    logBox.innerHTML = '';

    const logs = [
      'Connecting to secure banking network...',
      'Querying BancFirst Routing Node (********3632)...',
      'Verifying beneficiary account ********5625...',
      'Checking investment bond link (BNP Paribas Securities Corp.)...',
      'SUCCESS: Beneficiary Account Verified & Active'
    ];

    logs.forEach((log, index) => {
      setTimeout(() => {
        const line = document.createElement('div');
        line.className = 'terminal-log-line';
        if (index === logs.length - 1) {
          line.innerHTML = `<span style="color:#10B981">✔</span> <strong>${log}</strong>`;
        } else {
          line.innerHTML = `<div class="terminal-spinner"></div> <span>${log}</span>`;
        }
        logBox.appendChild(line);

        if (index === logs.length - 1) {
          this.isVerified = true;
          UI.showToast('Beneficiary verified successfully!', 'success');
          
          btn.innerHTML = `
            <span>Beneficiary Verified</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10B981" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
          `;

          setTimeout(() => {
            this.goToStage(2);
          }, 600);
        }
      }, (index + 1) * 600);
    });
  },

  // ------------------------------------------------------------------------
  // STAGE 2: LIVE CALCULATIONS & VALIDATION
  // ------------------------------------------------------------------------
  updateLiveCalculations() {
    const accounts = StorageManager.getAccounts();
    const currentBalance = accounts.checking.balance;

    const amountInput = document.getElementById('transferAmountInput');
    const amountVal = parseFloat(amountInput ? amountInput.value : 0) || 0;

    const remaining = currentBalance - amountVal;

    const availEl = document.getElementById('stage2AvailBalance');
    const remEl = document.getElementById('stage2RemainingBalance');

    if (availEl) availEl.textContent = Helpers.formatCurrency(currentBalance);
    if (remEl) {
      remEl.textContent = Helpers.formatCurrency(remaining);
      if (remaining < 0) {
        remEl.style.color = 'var(--accent-danger)';
      } else {
        remEl.style.color = 'var(--accent-emerald)';
      }
    }
  },

  proceedToStage3() {
    const accounts = StorageManager.getAccounts();
    const currentBalance = accounts.checking.balance;
    const amountInput = document.getElementById('transferAmountInput').value;
    const amount = parseFloat(amountInput);

    if (isNaN(amount) || amount <= 0) {
      UI.showToast('Please enter a valid transfer amount greater than $0.00', 'error');
      return;
    }

    if (amount > currentBalance) {
      UI.showToast(`Transfer amount cannot exceed available balance (${Helpers.formatCurrency(currentBalance)})`, 'error');
      return;
    }

    // Build Current Txn Data Object
    const ref = document.getElementById('transferRefInput').value || Helpers.generateTxnRef();
    const purpose = document.getElementById('transferPurposeSelect').value;
    const method = document.getElementById('benMethod').value;
    const benName = document.getElementById('benName').value;
    const benBank = document.getElementById('benBank').value;
    const benAccount = document.getElementById('benAccount').value;
    const benRouting = document.getElementById('benRouting').value;
    const benBond = document.getElementById('benBond').value;

    this.currentTxnData = {
      ref,
      beneficiary: benName,
      bank: benBank,
      accountNumber: benAccount,
      routingNumber: benRouting,
      bond: benBond,
      method,
      purpose,
      amount,
      type: 'Transfer',
      status: 'Processing',
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString('en-US', { hour12: false })
    };

    // Populate Stage 3 Review UI
    document.getElementById('revBenName').textContent = benName;
    document.getElementById('revBenBank').textContent = benBank;
    document.getElementById('revBenAccount').textContent = benAccount;
    document.getElementById('revBenRouting').textContent = benRouting;
    document.getElementById('revBenBond').textContent = benBond;
    document.getElementById('revBenMethod').textContent = method;
    document.getElementById('revPurpose').textContent = purpose;
    document.getElementById('revRef').textContent = ref;
    document.getElementById('revAmount').textContent = Helpers.formatCurrency(amount);

    this.goToStage(3);
  },

  // ------------------------------------------------------------------------
  // STAGE 3: EXECUTE & SIMULATED PROCESSING MODAL
  // ------------------------------------------------------------------------
  executeFinalTransfer() {
    if (!this.currentTxnData) return;

    // Show Processing Modal
    const modalContent = `
      <div class="processing-modal-content">
        <h4 style="margin-bottom: 12px;">Dispatched to Tunex Banking Network</h4>
        <p style="font-size: 0.85rem; color: var(--text-secondary);">Please do not refresh. Encrypted transfer in progress...</p>
        
        <div class="progress-bar-track">
          <div id="processingProgressFill" class="progress-bar-fill"></div>
        </div>

        <div id="processingStepText" class="processing-step-status">Initializing transfer...</div>
      </div>
    `;

    UI.showModal('Processing Wire Transfer', modalContent);

    const fill = document.getElementById('processingProgressFill');
    const stepText = document.getElementById('processingStepText');

    const steps = [
      { pct: 20, text: 'Initializing transfer sequence...' },
      { pct: 40, text: 'Encrypting transaction payload (AES-256)...' },
      { pct: 60, text: 'Connecting to secure banking network...' },
      { pct: 80, text: 'Sending payment to BancFirst node...' },
      { pct: 100, text: 'Awaiting network confirmation...' }
    ];

    steps.forEach((step, index) => {
      setTimeout(() => {
        if (fill) fill.style.width = `${step.pct}%`;
        if (stepText) stepText.textContent = step.text;

        if (index === steps.length - 1) {
          setTimeout(() => {
            UI.closeModal();
            this.completeTransferSuccess();
          }, 600);
        }
      }, (index + 1) * 700);
    });
  },

  completeTransferSuccess() {
    const txn = this.currentTxnData;
    const accounts = StorageManager.getAccounts();
    const newBalance = accounts.checking.balance - txn.amount;

    // Persist to LocalStorage
    StorageManager.updateCheckingBalance(newBalance);
    StorageManager.addTransaction(txn);
    StorageManager.addNotification(
      'Transfer Submitted',
      `${Helpers.formatCurrency(txn.amount)} sent to ${txn.beneficiary} (${txn.ref}).`
    );

    // Save for receipt generator module
    ReceiptManager.setCurrentReceipt(txn);

    // Update Dashboard UI Balances
    Dashboard.renderBalances();

    // Show Success Panel
    document.querySelectorAll('.transfer-stage-panel').forEach(p => p.classList.remove('active'));
    const successPanel = document.getElementById('transferSuccessPanel');
    if (successPanel) successPanel.classList.add('active');

    const refBadge = document.getElementById('successRefBadge');
    if (refBadge) refBadge.textContent = txn.ref;

    UI.showToast('Transfer completed and saved to LocalStorage!', 'success');
  },

  // ------------------------------------------------------------------------
  // Stepper Controller Helper
  // ------------------------------------------------------------------------
  goToStage(stageNum) {
    this.currentStage = stageNum;
    this.updateStepperUI(stageNum);

    document.querySelectorAll('.transfer-stage-panel').forEach(p => p.classList.remove('active'));
    const target = document.getElementById(`transferStage${stageNum}`);
    if (target) target.classList.add('active');
  },

  updateStepperUI(stageNum) {
    const lineFill = document.getElementById('stepperProgressFill');
    if (lineFill) {
      if (stageNum === 1) lineFill.style.width = '0%';
      if (stageNum === 2) lineFill.style.width = '50%';
      if (stageNum === 3) lineFill.style.width = '100%';
    }

    [1, 2, 3].forEach(num => {
      const stepEl = document.getElementById(`stepIndicator${num}`);
      if (stepEl) {
        stepEl.classList.remove('active', 'completed');
        if (num === stageNum) stepEl.classList.add('active');
        if (num < stageNum) stepEl.classList.add('completed');
      }
    });
  }
};
