// ========================================
// DEE'S DATA DEALS - Payment script
// EmailJS-first + Paystack inline flow
// ========================================

const envConfig = (window.__ENV__ && typeof window.__ENV__ === 'object') ? window.__ENV__ : {};
const paystackPublicKey = envConfig.PAYSTACK_PUBLIC_KEY || '';
const emailjsServiceId = envConfig.EMAILJS_SERVICE_ID || 'service_4z5rit9';
const emailjsTemplateId = envConfig.EMAILJS_TEMPLATE_ID || 'template_fjymivt';
const emailjsPublicKey = envConfig.EMAILJS_PUBLIC_KEY || 'keJeBNb0TMCiJVNwd';
const orderRecipientEmail = envConfig.ORDER_RECIPIENT_EMAIL || 'deesdatadeals@gmail.com';

const bundleData = {
    MTN: [
        { size: '1GB', price: 5.50 },
        { size: '2GB', price: 9.95 },
        { size: '3GB', price: 15.60 },
        { size: '4GB', price: 18.85 },
        { size: '5GB', price: 25.00 },
        { size: '6GB', price: 28.30 },
        { size: '7GB', price: 32.40 },
        { size: '8GB', price: 36.60 },
        { size: '10GB', price: 45.85 },
        { size: '15GB', price: 64.00},
        { size: '20GB', price: 81.50 },
        { size: '25GB', price: 100.00 },
        { size: '30GB', price: 120.50 },
        { size: '40GB', price: 158.00 },
        { size: '50GB', price: 196.00 },
        { size: '100GB', price:366.00 }
    ],
    AirtelTigo: [
        { size: '1GB', price: 5.30 },
        { size: '2GB', price: 9.80 },
        { size: '3GB', price: 13.80 },
        { size: '4GB', price: 17.60 },
        { size: '5GB', price: 21.30 },
        { size: '6GB', price: 25.30 },
        { size: '7GB', price: 28.80 },
        { size: '8GB', price: 33.30 },
        { size: '10GB', price: 41.00 },
        { size: '15GB', price: 60.00 },
        { size: '20GB', price: 67.00 },
        { size: '30GB', price: 75.00 },
        { size: '40GB', price: 87.00 },
        { size: '50GB', price: 99.00 }
    ],
    Telecel: [
        { size: '10GB', price: 44.00 },
        { size: '15GB', price: 64.00 },
        { size: '20GB', price: 84.00 },
        { size: '25GB', price: 103.00 },
        { size: '30GB', price: 119.00 },
        { size: '40GB', price: 159.00 },
        { size: '50GB', price: 197.00 },
        { size: '100GB', price: 369.00 }
    ]
};

let selectedData = {
    network: null,
    bundle: null,
    amount: null
};

const networkAccent = {
    MTN: {
        accent: '#FFC107',
        button: 'linear-gradient(135deg, #F5C430 0%, #FFC107 100%)',
        glow: 'rgba(255,193,7,0.18)'
    },
    Telecel: {
        accent: '#E30613',
        button: 'linear-gradient(135deg, #FF576F 0%, #E30613 100%)',
        glow: 'rgba(227,6,19,0.18)'
    },
    AirtelTigo: {
        accent: '#007BFF',
        button: 'linear-gradient(135deg, #60A5FA 0%, #007BFF 100%)',
        glow: 'rgba(0,123,255,0.18)'
    },
    default: {
        accent: '#FFC107',
        button: 'linear-gradient(135deg, #F5C430 0%, #FFC107 100%)',
        glow: 'rgba(255,193,7,0.18)'
    }
};

const networkSelect = document.getElementById('network');
const bundleSelect = document.getElementById('bundle');
const emailInput = document.getElementById('email');
const recipientInput = document.getElementById('recipient');
const accountNameInput = document.getElementById('accountName');
const payBtn = document.getElementById('pay-btn');
const momoBtn = document.getElementById('momo-btn');
const bundlesContainer = document.getElementById('bundles-container');
const bundlesTitle = document.getElementById('bundles-title');
const validationMsg = document.getElementById('validation-msg');
const planSummary = document.getElementById('plan-summary');
const summaryNetwork = document.getElementById('summary-network');
const summaryBundle = document.getElementById('summary-bundle');
const summaryAmount = document.getElementById('summary-amount');

const originalPayBtnText = payBtn ? payBtn.textContent.trim() : 'Pay with Paystack';
const originalMomoBtnText = momoBtn ? momoBtn.textContent.trim() : 'Pay with MoMo';

if (networkSelect) networkSelect.addEventListener('change', handleNetworkChange);
if (bundleSelect) bundleSelect.addEventListener('change', handleBundleChange);
if (emailInput) emailInput.addEventListener('input', validateForm);
if (recipientInput) recipientInput.addEventListener('input', validateForm);
if (accountNameInput) accountNameInput.addEventListener('input', validateForm);
if (payBtn) payBtn.addEventListener('click', handlePayment);
if (momoBtn) momoBtn.addEventListener('click', handlePayment);

function handleNetworkChange(event) {
    const network = event.target.value;
    selectedData.network = network || null;

    if (!network) {
        resetBundleSelection();
        applyNetworkAccent(null);
        updateNetworkLogo(null);
        updateNetworkTitle(null);
        return;
    }

    // apply visual accent and update UI
    applyNetworkAccent(network);
    updateNetworkLogo(network);
    updateNetworkTitle(network);

    populateBundleOptions(network);
    displayBundleCards(network);
    selectedData.bundle = null;
    selectedData.amount = null;
    updatePlanSummary();
    validateForm();
}

function resetBundleSelection() {
    if (!bundleSelect) return;
    bundleSelect.innerHTML = '<option value="">Select a bundle...</option>';
    bundleSelect.disabled = true;
    if (bundlesContainer) bundlesContainer.innerHTML = '';
    if (bundlesTitle) bundlesTitle.textContent = 'Select a network to see bundles';
    selectedData.bundle = null;
    selectedData.amount = null;
    updatePlanSummary();
    if (validationMsg) validationMsg.classList.add('hidden');
}

function populateBundleOptions(network) {
    if (!bundleSelect) return;
    bundleSelect.disabled = false;
    bundleSelect.innerHTML = '<option value="">Select a bundle...</option>';

    const bundles = bundleData[network] || [];
    bundles.forEach(bundle => {
        const option = document.createElement('option');
        option.value = bundle.size;
        option.textContent = `${bundle.size} - ₵${bundle.price.toFixed(2)}`;
        option.dataset.price = bundle.price;
        bundleSelect.appendChild(option);
    });
}

function displayBundleCards(network) {
    if (!bundlesContainer) return;
    bundlesContainer.innerHTML = '';
    const bundles = bundleData[network] || [];

    bundles.forEach(bundle => {
        const item = document.createElement('div');
        item.className = 'bundle-item';
        item.innerHTML = `<div class="bundle-size">${bundle.size}</div><div class="bundle-price">₵${bundle.price.toFixed(2)}</div>`;
        item.addEventListener('click', () => selectBundle(network, bundle.size, bundle.price, item));
        bundlesContainer.appendChild(item);
    });
}

function selectBundle(network, size, price, selectedElement) {
    selectedData.network = network;
    selectedData.bundle = size;
    selectedData.amount = price;

    if (bundleSelect) bundleSelect.value = size;

    document.querySelectorAll('.bundle-item').forEach(item => item.classList.remove('selected'));
    if (selectedElement) selectedElement.classList.add('selected');

    updatePlanSummary();
    validateForm();
}

function handleBundleChange(event) {
    const bundleSize = event.target.value;
    const network = selectedData.network;
    const bundles = bundleData[network] || [];
    const selectedBundle = bundles.find(bundle => bundle.size === bundleSize);

    if (selectedBundle) {
        selectedData.bundle = selectedBundle.size;
        selectedData.amount = selectedBundle.price;
        document.querySelectorAll('.bundle-item').forEach(item => {
            item.classList.toggle('selected', item.querySelector('.bundle-size').textContent === bundleSize);
        });
    } else {
        selectedData.bundle = null;
        selectedData.amount = null;
    }

    updatePlanSummary();
    validateForm();
}


function applyNetworkAccent(network) {
    const accentSettings = networkAccent[network] || networkAccent.default;
    document.documentElement.style.setProperty('--accent-color', accentSettings.accent);
    document.documentElement.style.setProperty('--button-gradient', accentSettings.button);
    document.documentElement.style.setProperty('--accent-glow', accentSettings.glow);

    const selectedItems = document.querySelectorAll('.bundle-item.selected');
    selectedItems.forEach(item => item.style.boxShadow = `0 0 24px ${accentSettings.glow}`);
}

function revealSplash() {
    const splash = document.getElementById('splash');
    const app = document.getElementById('app');

    if (!splash || !app) {
        return;
    }

    setTimeout(() => {
        splash.classList.add('hide');
        app.classList.remove('app-hidden');
    }, 2200);
}

function updateNetworkTitle(network) {
    if (!bundlesTitle) return;
    bundlesTitle.textContent = network ? `${network} Bundles` : 'Select a network to see bundles';
}

function updateNetworkLogo(network) {
    const logoImg = document.getElementById('network-logo');
    if (!logoImg) return;

    const logoMap = {
        MTN: 'MTN.png',
        Telecel: 'Tele.png',
        AirtelTigo: 'AirtelTigo.png'
    };

    if (network && logoMap[network]) {
        logoImg.src = logoMap[network];
        logoImg.alt = `${network} logo`;
        logoImg.classList.remove('hidden');
    } else {
        logoImg.src = '';
        logoImg.alt = 'Network logo';
        logoImg.classList.add('hidden');
    }
}
function updatePlanSummary() {
    if (!planSummary) return;
    if (selectedData.network && selectedData.bundle && selectedData.amount !== null) {
        planSummary.classList.remove('hidden');
        if (summaryNetwork) summaryNetwork.textContent = selectedData.network;
        if (summaryBundle) summaryBundle.textContent = selectedData.bundle;
        if (summaryAmount) summaryAmount.textContent = `₵${Number(selectedData.amount).toFixed(2)}`;
    } else {
        planSummary.classList.add('hidden');
        if (summaryNetwork) summaryNetwork.textContent = '-';
        if (summaryBundle) summaryBundle.textContent = '-';
        if (summaryAmount) summaryAmount.textContent = '-';
    }
}

function validateForm() {
    const emailValue = emailInput ? emailInput.value.trim() : '';
    const recipientValue = recipientInput ? recipientInput.value.trim() : '';
    const accountNameValue = accountNameInput ? accountNameInput.value.trim() : '';
    const hasNetwork = !!selectedData.network;
    const hasBundle = !!selectedData.bundle;
    const validEmail = emailValue === '' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue);
    const validRecipient = /^0\d{9}$/.test(recipientValue);
    const validName = accountNameValue.length > 1;
    // Email is optional now — only require if provided
    const isValid = hasNetwork && hasBundle && validRecipient && validName;

    if (payBtn) payBtn.disabled = !isValid;
    if (momoBtn) momoBtn.disabled = !isValid;

    if (!isValid && validationMsg) {
        if (emailValue && !validEmail) {
            showMessage('Please enter a valid email address.', false);
        } else if (recipientValue && !validRecipient) {
            showMessage('Please enter a valid Ghanaian phone number (0XXXXXXXXX).', false);
        } else if (accountNameValue && !validName) {
            showMessage('Please enter a valid account name.', false);
        } else {
            hideMessage();
        }
    } else {
        hideMessage();
    }
}

function showMessage(text, success) {
    if (!validationMsg) return;
    validationMsg.textContent = text;
    validationMsg.classList.remove('hidden', 'error', 'success');
    validationMsg.classList.add(success ? 'success' : 'error');
}

function hideMessage() {
    if (!validationMsg) return;
    validationMsg.classList.add('hidden');
}

async function handlePayment(event) {
    event.preventDefault();
    const activeButton = event.currentTarget;

    if (!activeButton) return;

    validateForm();
    if (activeButton.disabled) return;

    const recipient = recipientInput ? recipientInput.value.trim() : '';
    const accountName = accountNameInput ? accountNameInput.value.trim() : '';
    const customerEmail = emailInput ? emailInput.value.trim() : '';

    const orderPayload = {
        network: selectedData.network,
        bundle: selectedData.bundle,
        price: Number(selectedData.amount).toFixed(2),
        recipient,
        account_name: accountName,
        customer_email: customerEmail,
        _subject: `New Order: ${selectedData.bundle} (${selectedData.network})`,
        _replyto: customerEmail
    };

    setPaymentButtonsBusy(activeButton, 'Processing...');

    try {
        if (!window.emailjs) {
            throw new Error('EmailJS library not loaded. Please refresh the page or contact support.');
        }

        if (!emailjsServiceId || !emailjsTemplateId || !emailjsPublicKey || !orderRecipientEmail) {
            throw new Error('EmailJS configuration is incomplete. Please ensure all EmailJS keys and recipient email are set.');
        }

        window.emailjs.init(emailjsPublicKey);

        const emailParams = {
            order_id: `DEE_${Date.now()}`,
            network: orderPayload.network,
            bundle: orderPayload.bundle,
            amount: orderPayload.price,
            email: orderPayload.customer_email,
            recipient: orderPayload.recipient,
            account: orderPayload.account_name,
            to_email: orderRecipientEmail,
            payment_note: 'Your order would only be processed once the required payment is made.'
        };

        const result = await window.emailjs.send(emailjsServiceId, emailjsTemplateId, emailParams);
        console.log('EmailJS send result:', result);

        const orderQuery = new URLSearchParams({
            network: orderPayload.network,
            bundle: orderPayload.bundle,
            amount: orderPayload.price,
            recipient: orderPayload.recipient,
            accountName: orderPayload.account_name,
            email: orderPayload.customer_email
        }).toString();

        window.location.href = `topup.html?${orderQuery}`;
    } catch (error) {
        console.error('Order submission error:', error);
        const details = error && (error.text || error.message || error.statusText || JSON.stringify(error));
        showMessage(`Order submission failed. ${details || 'Please try again.'}`, false);
        setPaymentButtonsReady(activeButton);
    }
}

function setPaymentButtonsBusy(activeButton, label) {
    if (payBtn) {
        payBtn.disabled = true;
        payBtn.textContent = label;
    }
    if (momoBtn) {
        momoBtn.disabled = true;
        momoBtn.textContent = label;
    }
    if (activeButton && activeButton !== payBtn && activeButton !== momoBtn) {
        activeButton.disabled = true;
        activeButton.textContent = label;
    }
}

function setPaymentButtonsCompleted(activeButton) {
    if (payBtn) {
        payBtn.disabled = true;
        payBtn.textContent = 'Done';
    }
    if (momoBtn) {
        momoBtn.disabled = true;
        momoBtn.textContent = 'Done';
    }
    if (activeButton && activeButton !== payBtn && activeButton !== momoBtn) {
        activeButton.disabled = true;
        activeButton.textContent = 'Done';
    }
}

function setPaymentButtonsReady(activeButton) {
    if (payBtn) {
        payBtn.disabled = false;
        payBtn.textContent = originalPayBtnText;
    }
    if (momoBtn) {
        momoBtn.disabled = false;
        momoBtn.textContent = originalMomoBtnText;
    }
    if (activeButton && activeButton !== payBtn && activeButton !== momoBtn) {
        activeButton.disabled = false;
        activeButton.textContent = originalPayBtnText;
    }
}

function showSuccessPopup(message) {
    const popup = document.createElement('div');
    popup.className = 'success-popup';
    popup.textContent = message;
    document.body.appendChild(popup);

    setTimeout(() => {
        popup.classList.add('show');
    }, 10);

    setTimeout(() => {
        popup.classList.remove('show');
        setTimeout(() => popup.remove(), 300);
    }, 2200);
}

function openPaystack(orderPayload, customerEmail) {
    // PAYSTACK TEMPORARILY DISABLED - re-enable by removing the disabled state below
    if (!paystackPublicKey) {
        showMessage('Payment setup missing. Contact support.', false);
        setPaymentButtonsReady();
        return;
    }

    const paymentRef = `DEE_${Date.now()}`;
    const handler = PaystackPop.setup({
        key: paystackPublicKey,
        email: customerEmail,
        amount: Math.round(parseFloat(orderPayload.price) * 100),
        currency: 'GHS',
        ref: paymentRef,
        metadata: {
            network: orderPayload.network,
            bundle: orderPayload.bundle,
            recipient: orderPayload.recipient
        },
        callback: function(response) {
            const payRef = response.reference || response.ref || paymentRef;
            const confirmationPayload = {
                payment_reference: payRef,
                network: orderPayload.network,
                bundle: orderPayload.bundle,
                recipient: orderPayload.recipient,
                amount: orderPayload.price,
                customer_email: customerEmail,
                _subject: `Payment Confirmed: ${payRef}`
            };

            if (window.emailjs && emailjsServiceId && emailjsTemplateId && emailjsPublicKey && orderRecipientEmail) {
                window.emailjs.init(emailjsPublicKey);
                const confirmationParams = {
                    payment_reference: payRef,
                    network: orderPayload.network,
                    bundle: orderPayload.bundle,
                    amount: orderPayload.price,
                    email: customerEmail,
                    recipient: orderPayload.recipient,
                    account: orderPayload.account_name,
                    to_email: orderRecipientEmail,
                    _subject: `Payment Confirmed: ${payRef}`
                };

                window.emailjs.send(emailjsServiceId, emailjsTemplateId, confirmationParams).catch(err => {
                    console.error('Payment confirmation failed', err);
                    showMessage('Order recorded but confirmation failed. Contact support.', false);
                });
            } else {
                console.error('EmailJS not configured for payment confirmation');
            }

            // Show success popup
            showSuccessPopup('Order placed successfully. Note your order would only be processed once the required payment is made.');

            // Temporarily mark the button as placed, then restore
            setPaymentButtonsCompleted();

            // Reset selection and clear inputs
            selectedData.network = null;
            selectedData.bundle = null;
            selectedData.amount = null;
            if (bundleSelect) {
                bundleSelect.innerHTML = '<option value="">Select a bundle...</option>';
                bundleSelect.disabled = true;
            }
            if (emailInput) emailInput.value = '';
            if (recipientInput) recipientInput.value = '';
            if (accountNameInput) accountNameInput.value = '';
            if (typeof updatePlanSummary === 'function') updatePlanSummary();

            // After popup hides, return button to normal state so user can place another order
            setTimeout(() => {
                setPaymentButtonsReady();
            }, 2400);
        },
        onClose: function() {
            showMessage('Payment was not completed. Your order was not charged.', false);
            setPaymentButtonsReady();
        }
    });

    handler.openIframe();
}

window.addEventListener('load', function() {
    // initial state
    if (bundleSelect) bundleSelect.disabled = true;
    if (payBtn) payBtn.disabled = true;
    if (validationMsg) validationMsg.classList.add('hidden');
    updatePlanSummary();

    // reveal splash then app
    revealSplash();

    // allow user to click splash to skip
    const splash = document.getElementById('splash');
    if (splash) {
        splash.addEventListener('click', () => {
            splash.classList.add('hide');
            const app = document.getElementById('app');
            if (app) app.classList.remove('app-hidden');
        });
    }

    // if a network was preselected in the select, apply its accent
    if (networkSelect && networkSelect.value) {
        applyNetworkAccent(networkSelect.value);
        updateNetworkLogo(networkSelect.value);
        updateNetworkTitle(networkSelect.value);
    }
});

