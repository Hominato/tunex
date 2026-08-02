/* ==========================================================================
   TUNEX - HELPER & UTILITY FUNCTIONS
   ========================================================================== */

const Helpers = {
  // Format Currency: e.g. 10000000 -> "$10,000,000.00"
  formatCurrency(amount) {
    const num = parseFloat(amount);
    if (isNaN(num)) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(num);
  },

  // Format Compact Number: e.g. 10000000 -> "$10.0M"
  formatCompactCurrency(amount) {
    const num = parseFloat(amount);
    if (isNaN(num)) return '$0';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      compactDisplay: 'short'
    }).format(num);
  },

  // Format Date: e.g. "2026-08-01" -> "Aug 1, 2026"
  formatDate(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  },

  // Get Current Formatted Date: e.g. "Sunday, August 2, 2026"
  getCurrentFormattedDate() {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  },

  // Generate Unique Reference Number: e.g. "TXN-739204"
  generateTxnRef() {
    const randomDigits = Math.floor(100000 + Math.random() * 900000);
    return `TXN-${randomDigits}`;
  },

  // Mask Account Number: e.g. "123456785625" -> "********5625"
  maskAccount(accNumber) {
    if (!accNumber) return '********';
    const clean = accNumber.toString().replace(/\s+/g, '');
    if (clean.startsWith('*')) return clean; // Already masked
    const visible = clean.slice(-4);
    return `********${visible}`;
  },

  // Export Array of Objects to CSV File
  exportToCSV(filename, dataArray) {
    if (!dataArray || !dataArray.length) {
      alert('No data available to export.');
      return;
    }

    const headers = Object.keys(dataArray[0]);
    const csvRows = [];

    // Header row
    csvRows.push(headers.join(','));

    // Data rows
    dataArray.forEach(row => {
      const values = headers.map(header => {
        const val = row[header] === null || row[header] === undefined ? '' : row[header];
        const escaped = ('' + val).replace(/"/g, '""');
        return `"${escaped}"`;
      });
      csvRows.push(values.join(','));
    });

    const csvContent = csvRows.join('\n');
    this.downloadFile(filename, csvContent, 'text/csv;charset=utf-8;');
  },

  // Trigger File Download in Browser
  downloadFile(filename, content, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
};
