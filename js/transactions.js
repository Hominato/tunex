/* ==========================================================================
   TUNEX - TRANSACTIONS HISTORY & CSV EXPORTER
   ========================================================================== */

const TransactionsManager = {
  render() {
    const tableBody = document.getElementById('fullTransactionsTableBody');
    if (!tableBody) return;

    const allTxns = StorageManager.getTransactions();
    const searchVal = (document.getElementById('txnSearchInput')?.value || '').toLowerCase().trim();
    const typeFilter = document.getElementById('txnTypeFilter')?.value || 'ALL';
    const statusFilter = document.getElementById('txnStatusFilter')?.value || 'ALL';

    // Filter Logic
    const filtered = allTxns.filter(t => {
      const matchSearch = !searchVal || 
        t.ref.toLowerCase().includes(searchVal) || 
        t.beneficiary.toLowerCase().includes(searchVal) ||
        (t.bank && t.bank.toLowerCase().includes(searchVal)) ||
        (t.purpose && t.purpose.toLowerCase().includes(searchVal));

      const matchType = typeFilter === 'ALL' || t.type === typeFilter;
      const matchStatus = statusFilter === 'ALL' || t.status === statusFilter;

      return matchSearch && matchType && matchStatus;
    });

    if (filtered.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="8" style="text-align: center; padding: 40px; color: var(--text-muted);">
            No transactions found matching criteria.
          </td>
        </tr>
      `;
      return;
    }

    tableBody.innerHTML = filtered.map((t, index) => {
      const isCredit = (t.type === 'Deposit' || t.type === 'Dividend');
      const badgeClass = t.status === 'Completed' ? 'badge-success' : 'badge-warning';

      return `
        <tr>
          <td class="font-mono" style="font-weight: 700;">${t.ref}</td>
          <td>
            <div style="font-weight: 600; color: var(--text-primary);">${t.beneficiary}</div>
            <div style="font-size: 0.76rem; color: var(--text-muted);">${t.purpose || t.type}</div>
          </td>
          <td>${t.bank || 'N/A'}</td>
          <td class="font-mono" style="font-weight: 800; color: ${isCredit ? 'var(--accent-emerald)' : 'var(--text-primary)'}">
            ${isCredit ? '+' : '-'}${Helpers.formatCurrency(t.amount)}
          </td>
          <td>${t.method}</td>
          <td><span class="badge ${badgeClass}">${t.status}</span></td>
          <td style="font-size: 0.82rem; color: var(--text-secondary);">${t.date} ${t.time}</td>
          <td>
            <button class="btn btn-secondary btn-sm" onclick='ReceiptManager.showReceiptModal(${JSON.stringify(t)})'>
              Receipt
            </button>
          </td>
        </tr>
      `;
    }).join('');
  },

  exportLedgerCSV() {
    const txns = StorageManager.getTransactions();
    if (!txns || txns.length === 0) {
      UI.showToast('No transaction ledger data to export.', 'error');
      return;
    }

    const exportData = txns.map(t => ({
      Reference: t.ref,
      Date: t.date,
      Time: t.time,
      Beneficiary: t.beneficiary,
      Bank: t.bank || '',
      Account: t.accountNumber || '',
      Routing: t.routingNumber || '',
      Type: t.type,
      Method: t.method,
      Purpose: t.purpose || '',
      Amount: t.amount,
      Status: t.status
    }));

    const dateStr = new Date().toISOString().split('T')[0];
    Helpers.exportToCSV(`Tunex_Transaction_Ledger_${dateStr}.csv`, exportData);
    UI.showToast('Transaction ledger exported to CSV', 'success');
  }
};
