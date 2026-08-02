/* ==========================================================================
   TUNEX - LOCALSTORAGE DATA MANAGER & DEFAULT STATE SEEDER
   ========================================================================== */

const STORAGE_KEY = 'tunex_banking_system_v1';

const DEFAULT_STATE = {
  user: {
    name: 'David McKenzie',
    id: 'BNK-8492041',
    accountType: 'Premium Checking',
    memberSince: 'Jan 2021',
    status: 'Verified',
    email: 'david.mckenzie@private.tunex.com',
    phone: '+1 (555) 892-3401',
    address: '742 Evergreen Terrace, New York, NY 10001'
  },
  accounts: {
    checking: {
      name: 'Checking Account',
      balance: 10000000.00,
      accountNumber: '********5625',
      routingNumber: '********3632'
    },
    savings: {
      name: 'High-Yield Savings',
      balance: 2500000.00,
      accountNumber: '********9012',
      routingNumber: '********3632'
    },
    investment: {
      name: 'Portfolio Bonds & Equities',
      balance: 4850000.00,
      firm: 'BNP Paribas Securities Corp.',
      dayReturnPercent: 0.71,
      dayReturnAmount: 34200.00,
      ytdReturnPercent: 14.2
    },
    creditScore: 825
  },
  beneficiary: {
    name: 'David McKenzie',
    bank: 'BancFirst',
    accountNumber: '********5625',
    routingNumber: '********3632',
    investmentBond: 'BNP Paribas Securities Corp.',
    disbursementMethods: ['Bank Transfer', 'Check']
  },
  card: {
    number: '4532 8912 3456 5625',
    expiry: '08/29',
    holder: 'DAVID MCKENZIE',
    cvv: '882',
    frozen: false,
    contactless: true,
    dailyLimit: 50000
  },
  transactions: [
    {
      ref: 'TXN-984210',
      beneficiary: 'David McKenzie',
      bank: 'BancFirst',
      amount: 150000.00,
      type: 'Transfer',
      method: 'Bank Transfer',
      status: 'Completed',
      date: '2026-08-01',
      time: '14:22:05',
      bond: 'BNP Paribas Securities Corp.',
      purpose: 'Portfolio Realignment'
    },
    {
      ref: 'TXN-874109',
      beneficiary: 'BNP Paribas Securities Corp.',
      bank: 'BNP Paribas Custody',
      amount: 45000.00,
      type: 'Dividend',
      method: 'Direct Credit',
      status: 'Completed',
      date: '2026-07-28',
      time: '09:15:30',
      bond: 'BNP Paribas Securities Corp.',
      purpose: 'Q2 Dividend Payout'
    },
    {
      ref: 'TXN-763098',
      beneficiary: 'Alpine Private Wealth Ltd',
      bank: 'UBS Zurich',
      amount: 500000.00,
      type: 'Wire Transfer',
      method: 'Swift Wire',
      status: 'Completed',
      date: '2026-07-20',
      time: '16:45:12',
      bond: 'N/A',
      purpose: 'Asset Allocation'
    },
    {
      ref: 'TXN-652987',
      beneficiary: 'Monaco Yacht Club',
      bank: 'Barclays Private',
      amount: 12500.00,
      type: 'Card Purchase',
      method: 'Debit Card',
      status: 'Completed',
      date: '2026-07-15',
      time: '20:10:40',
      bond: 'N/A',
      purpose: 'Membership Dues'
    },
    {
      ref: 'TXN-541876',
      beneficiary: 'Tunex Treasury Reserve',
      bank: 'Tunex Private Bank',
      amount: 1000000.00,
      type: 'Deposit',
      method: 'Wire Transfer',
      status: 'Completed',
      date: '2026-07-01',
      time: '11:00:00',
      bond: 'BNP Paribas Securities Corp.',
      purpose: 'Liquidity Injection'
    }
  ],
  notifications: [
    {
      id: 'notif-1',
      title: 'Welcome to BNP Paribas Securities Corp',
      message: 'Your high-yield premium checking account is active.',
      time: 'Just now',
      read: false
    },
    {
      id: 'notif-2',
      title: 'Dividend Credited',
      message: '$45,000.00 received from BNP Paribas Securities Corp.',
      time: '5 days ago',
      read: true
    },
    {
      id: 'notif-3',
      title: 'Security Verification Successful',
      message: 'Beneficiary David McKenzie verified for transfers.',
      time: '1 week ago',
      read: true
    }
  ],
  preferences: {
    theme: 'dark',
    language: 'en',
    emailAlerts: true,
    pushAlerts: true,
    twoFactor: true
  }
};

const StorageManager = {
  // Get entire state tree
  getStore() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) {
        this.saveStore(DEFAULT_STATE);
        return JSON.parse(JSON.stringify(DEFAULT_STATE));
      }
      return JSON.parse(data);
    } catch (e) {
      console.error('Error loading LocalStorage state:', e);
      return JSON.parse(JSON.stringify(DEFAULT_STATE));
    }
  },

  // Save entire state tree
  saveStore(state) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error('Error saving LocalStorage state:', e);
    }
  },

  // Specific Getters & Modifiers
  getUser() {
    return this.getStore().user;
  },

  updateUser(userData) {
    const store = this.getStore();
    store.user = { ...store.user, ...userData };
    this.saveStore(store);
  },

  getAccounts() {
    return this.getStore().accounts;
  },

  updateCheckingBalance(newBalance) {
    const store = this.getStore();
    store.accounts.checking.balance = newBalance;
    this.saveStore(store);
  },

  getBeneficiary() {
    return this.getStore().beneficiary;
  },

  getCard() {
    return this.getStore().card;
  },

  updateCard(cardData) {
    const store = this.getStore();
    store.card = { ...store.card, ...cardData };
    this.saveStore(store);
  },

  getTransactions() {
    return this.getStore().transactions || [];
  },

  addTransaction(txn) {
    const store = this.getStore();
    store.transactions.unshift(txn);
    this.saveStore(store);
  },

  getNotifications() {
    return this.getStore().notifications || [];
  },

  addNotification(title, message) {
    const store = this.getStore();
    const newNotif = {
      id: 'notif-' + Date.now(),
      title,
      message,
      time: 'Just now',
      read: false
    };
    store.notifications.unshift(newNotif);
    this.saveStore(store);
  },

  getPreferences() {
    return this.getStore().preferences;
  },

  savePreferences(prefs) {
    const store = this.getStore();
    store.preferences = { ...store.preferences, ...prefs };
    this.saveStore(store);
  },

  resetToDefaults() {
    this.saveStore(DEFAULT_STATE);
  }
};
