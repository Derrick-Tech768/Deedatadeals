const defaultUserId = 'demo-user';

function getApiBase() {
  const currentOrigin = window.location.origin;
  const isPreviewPort = ['5500', '5501', '8080'].includes(window.location.port);

  if (isPreviewPort) {
    return 'http://localhost:3000';
  }

  return currentOrigin;
}

const apiBase = getApiBase();

const state = {
  balance: 0,
  userCode: '',
  momoConfig: null
};

const momoNumberEl = document.getElementById('momo-number');
const momoNameEl = document.getElementById('momo-name');
const momoNetworkEl = document.getElementById('momo-network');
const paystackBtn = document.getElementById('paystack-btn');
const momoBtn = document.getElementById('momo-btn');
const orderSummaryCard = document.getElementById('order-summary-card');
const orderNetworkEl = document.getElementById('order-network');
const orderBundleEl = document.getElementById('order-bundle');
const orderAmountEl = document.getElementById('order-amount');
const orderRecipientEl = document.getElementById('order-recipient');
const orderAccountEl = document.getElementById('order-account');
const okayBtn = document.getElementById('okay-btn');

async function loadInitialData() {
  try {
    const momoResponse = await fetch(`${apiBase}/api/config/momo`);
    const momoData = await momoResponse.json();

    state.momoConfig = momoData;

    if (momoNumberEl) momoNumberEl.textContent = momoData.momoNumber || '0256802586';
    if (momoNameEl) momoNameEl.textContent = momoData.recipientName || 'Ametepey Derrick Delali';
    if (momoNetworkEl) momoNetworkEl.textContent = momoData.network || 'MTN';
  } catch (error) {
    if (momoNumberEl) momoNumberEl.textContent = '0256802586';
    if (momoNameEl) momoNameEl.textContent = 'Ametepey Derrick Delali';
    if (momoNetworkEl) momoNetworkEl.textContent = 'MTN';
  }
}

function handlePaystackCheckout() {
  if (!window.PaystackPop || !window.PaystackPop.setup) {
    alert('Paystack is unavailable right now. Please try again shortly or use MoMo instead.');
    return;
  }

  const order = getOrderDetailsFromQuery();
  const amount = Number(order.amount) || 0;
  const email = order.email || 'customer@example.com';
  const paymentRef = `DEE_TOPUP_${Date.now()}`;

  const handler = window.PaystackPop.setup({
    key: window.__ENV__?.PAYSTACK_PUBLIC_KEY || '',
    email,
    amount: Math.round(amount * 100),
    currency: 'GHS',
    ref: paymentRef,
    metadata: {
      network: order.network,
      bundle: order.bundle,
      recipient: order.recipient,
      accountName: order.accountName
    },
    callback: function(response) {
      alert(`Payment complete. Reference: ${response.reference || 'N/A'}`);
    },
    onClose: function() {
      alert('Payment was not completed. You can still use MoMo if needed.');
    }
  });

  handler.openIframe();
}

function getOrderDetailsFromQuery() {
  const params = new URLSearchParams(window.location.search);
  return {
    network: params.get('network') || '',
    bundle: params.get('bundle') || '',
    amount: params.get('amount') || '',
    recipient: params.get('recipient') || '',
    accountName: params.get('accountName') || '',
    email: params.get('email') || ''
  };
}

function populateOrderDetails() {
  const order = getOrderDetailsFromQuery();

  if (!order.network && !order.bundle && !order.amount) {
    return;
  }

  if (orderSummaryCard) orderSummaryCard.classList.remove('hidden');
  if (orderNetworkEl) orderNetworkEl.textContent = order.network || '-';
  if (orderBundleEl) orderBundleEl.textContent = order.bundle || '-';
  if (orderAmountEl) orderAmountEl.textContent = order.amount ? `₵${Number(order.amount).toFixed(2)}` : '-';
  if (orderRecipientEl) orderRecipientEl.textContent = order.recipient || '-';
  if (orderAccountEl) orderAccountEl.textContent = order.accountName || '-';
}

if (paystackBtn) {
  paystackBtn.addEventListener('click', handlePaystackCheckout);
}

if (momoBtn) {
  momoBtn.addEventListener('click', () => {
    document.getElementById('momo-number')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
}

if (okayBtn) {
  okayBtn.addEventListener('click', () => {
    window.location.href = 'index.html';
  });
}

window.addEventListener('DOMContentLoaded', () => {
  loadInitialData();
  populateOrderDetails();
});
