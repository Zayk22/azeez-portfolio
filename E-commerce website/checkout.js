import { showToast, formatPrice, getCart, saveCart, calculateCartTotal, ensureNumber } from './utils.js';

// DOM Elements
const checkoutForm = document.getElementById('checkout-form');
const orderItemsContainer = document.getElementById('order-items');
const orderTotalElement = document.getElementById('order-total');
const creditCardForm = document.getElementById('credit-card-form');
const bankTransferDetails = document.getElementById('bank-transfer-details');
const paymentOptions = document.querySelectorAll('.payment-option');

// Load cart data
function loadCartData() {
  const cart = getCart();
  
  if (cart.length === 0) {
    window.location.href = 'cart.html';
    return;
  }
  
  renderOrderSummary(cart);
}

// Render order summary
function renderOrderSummary(cart) {
  const { subtotal, shipping, total } = calculateCartTotal(cart);
  
  let itemsHTML = '';
  
  cart.forEach(item => {
    const itemTotal = ensureNumber(item.price) * ensureNumber(item.quantity);
    itemsHTML += `
      <div class="order-item">
        <span>${item.name} × ${item.quantity}</span>
        <span>${formatPrice(itemTotal)}</span>
      </div>
    `;
  });
  
  itemsHTML += `
    <div class="order-item">
      <span>Shipping</span>
      <span>${formatPrice(shipping)}</span>
    </div>
  `;
  
  orderItemsContainer.innerHTML = itemsHTML;
  orderTotalElement.innerHTML = formatPrice(total);
}

// Handle payment method change
function handlePaymentMethodChange(method) {
  creditCardForm.style.display = 'none';
  bankTransferDetails.style.display = 'none';
  
  if (method === 'credit-card') {
    creditCardForm.style.display = 'block';
  } else if (method === 'bank-transfer') {
    bankTransferDetails.style.display = 'block';
  }
}

// Validate Nigerian phone number
function validatePhoneNumber(phone) {
  return /^(\+?234|0)[789]\d{9}$/.test(phone);
}

// Validate email
function validateEmail(email) {
  return /^\S+@\S+\.\S+$/.test(email);
}

// Validate credit card
function validateCard(card) {
  const cardNumber = card.number.replace(/\s/g, '');
  const isValidCard = /^\d{12,19}$/.test(cardNumber);
  const isValidExpiry = /^(0[1-9]|1[0-2])\/?([0-9]{2})$/.test(card.expiry);
  const isValidCVV = /^\d{3,4}$/.test(card.cvv);
  
  return isValidCard && isValidExpiry && isValidCVV;
}

// Show error under input
function showInputError(input, message) {
  const formGroup = input.closest('.form-group');
  let errorDiv = formGroup.querySelector('.error-message');
  
  if (!errorDiv) {
    errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    formGroup.appendChild(errorDiv);
  }
  
  errorDiv.textContent = message;
  input.classList.add('error');
}

// Clear input errors
function clearInputErrors() {
  document.querySelectorAll('.error-message').forEach(el => el.remove());
  document.querySelectorAll('.form-control.error').forEach(el => el.classList.remove('error'));
}

// Handle form submission
checkoutForm?.addEventListener('submit', function(e) {
  e.preventDefault();
  clearInputErrors();
  
  const cart = getCart();
  if (cart.length === 0) {
    showToast('Your cart is empty!', 'error');
    window.location.href = 'cart.html';
    return;
  }

  // Get form data
  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const address = document.getElementById('address').value.trim();
  const paymentMethod = document.querySelector('input[name="payment-method"]:checked')?.value;

  // Validate required fields
  let isValid = true;

  if (!name) {
    showInputError(document.getElementById('name'), 'Name is required');
    isValid = false;
  }

  if (!email) {
    showInputError(document.getElementById('email'), 'Email is required');
    isValid = false;
  } else if (!validateEmail(email)) {
    showInputError(document.getElementById('email'), 'Invalid email address');
    isValid = false;
  }

  if (!phone) {
    showInputError(document.getElementById('phone'), 'Phone number is required');
    isValid = false;
  } else if (!validatePhoneNumber(phone)) {
    showInputError(document.getElementById('phone'), 'Invalid Nigerian phone number');
    isValid = false;
  }

  if (!address) {
    showInputError(document.getElementById('address'), 'Address is required');
    isValid = false;
  }

  if (!paymentMethod) {
    showToast('Please select a payment method', 'error');
    isValid = false;
  }

  // Validate payment details
  if (paymentMethod === 'credit-card') {
    const cardNumber = document.getElementById('card-number')?.value.trim();
    const expiryDate = document.getElementById('expiry-date')?.value.trim();
    const cvv = document.getElementById('cvv')?.value.trim();
    
    if (!cardNumber || !expiryDate || !cvv) {
      showToast('Please fill in all card details', 'error');
      isValid = false;
    } else if (!validateCard({ number: cardNumber, expiry: expiryDate, cvv })) {
      showToast('Invalid card details', 'error');
      isValid = false;
    }
  }

  if (!isValid) return;

  // Prepare order data
  const orderData = {
    id: Date.now(),
    name,
    email,
    phone,
    address,
    paymentMethod,
    cart,
    total: calculateCartTotal(cart).total,
    date: new Date().toISOString(),
    status: 'processing'
  };

  // Save order
  const orderHistory = JSON.parse(localStorage.getItem('orderHistory')) || [];
  orderHistory.push(orderData);
  localStorage.setItem('orderHistory', JSON.stringify(orderHistory));
  localStorage.setItem('currentOrder', JSON.stringify(orderData));
  localStorage.removeItem('cart');

  showToast('Order placed successfully!', 'success');
  
  setTimeout(() => {
    window.location.href = 'order-confirmation.html';
  }, 1000);
});

// Format card number
document.getElementById('card-number')?.addEventListener('input', function(e) {
  let value = e.target.value.replace(/\s+/g, '');
  if (value.length > 0) {
    value = value.match(new RegExp('.{1,4}', 'g'))?.join(' ') || value;
  }
  e.target.value = value;
});

// Format expiry date
document.getElementById('expiry-date')?.addEventListener('input', function(e) {
  let value = e.target.value.replace(/\D/g, '');
  if (value.length >= 2) {
    value = value.substring(0, 2) + '/' + value.substring(2, 4);
  }
  e.target.value = value;
});

// Payment method selection
paymentOptions.forEach(option => {
  option.addEventListener('click', function() {
    paymentOptions.forEach(opt => opt.classList.remove('active'));
    this.classList.add('active');
    const method = this.getAttribute('data-method');
    handlePaymentMethodChange(method);
  });
});

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('checkout-form')) {
    loadCartData();
  }
});