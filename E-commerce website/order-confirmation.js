// Format price
function formatPrice(price) {
  return `₦${Number(price).toLocaleString()}`;
}

// Cart functions
function getCart() {
  return JSON.parse(localStorage.getItem('cart')) || [];
}

function updateCartCounter() {
  const cartCounters = document.querySelectorAll('.cart-counter');
  const cart = getCart();
  const totalItems = cart.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
  
  cartCounters.forEach(counter => {
    counter.textContent = totalItems > 0 ? totalItems : '';
  });
}

// Format date
function formatDate(dateString) {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('en-US', options);
}

// Hamburger menu
function initHamburger() {
  const hamburger = document.querySelector('.hamburger');
  const navLinks = document.querySelector('.nav-links');
  
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      navLinks.classList.toggle('active');
    });
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  updateCartCounter();
  initHamburger();
  
  const order = JSON.parse(localStorage.getItem('currentOrder')) || {};
  const cart = order.cart || [];

  document.getElementById('order-id').textContent = order.id || 'N/A';
  document.getElementById('order-date').textContent = order.date ? formatDate(order.date) : 'N/A';

  document.getElementById('customer-name').textContent = order.name || 'Not provided';
  document.getElementById('customer-email').textContent = order.email || 'Not provided';
  document.getElementById('customer-phone').textContent = order.phone || 'Not provided';
  document.getElementById('customer-address').textContent = order.address || 'Not provided';

  const paymentMethod = order.paymentMethod;
  let paymentText = '';
  switch(paymentMethod) {
    case 'credit-card':
      paymentText = 'Credit/Debit Card';
      if (order.card) {
        document.getElementById('payment-details').textContent = `Card ending in ${order.card.number.slice(-4)}`;
      }
      break;
    case 'paypal':
      paymentText = 'PayPal';
      break;
    case 'bank-transfer':
      paymentText = 'Bank Transfer';
      document.getElementById('payment-details').textContent = 'Please send transfer receipt to payments@zaystore.com';
      break;
    default:
      paymentText = paymentMethod;
  }
  document.getElementById('payment-method').textContent = paymentText;

  const subtotal = cart.reduce((sum, item) => sum + (Number(item.price) * Number(item.quantity)), 0);
  const shipping = 1500;
  const total = subtotal + shipping;

  const orderItems = document.getElementById('order-items');
  orderItems.innerHTML = cart.map(item => `
    <div class="order-item">
      <span>${item.name} × ${item.quantity}</span>
      <span>${formatPrice(Number(item.price) * Number(item.quantity))}</span>
    </div>
  `).join('');

  orderItems.innerHTML += `
    <div class="order-item">
      <span>Shipping</span>
      <span>${formatPrice(shipping)}</span>
    </div>
  `;

  document.getElementById('order-total').innerHTML = `
    <span>Total</span>
    <span>${formatPrice(total)}</span>
  `;
});