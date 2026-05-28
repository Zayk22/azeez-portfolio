// Toast functions
function showToast(message, type = 'success', duration = 3000) {
  const toastContainer = document.getElementById('toast-container') || createToastContainer();
  
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
    <span>${message}</span>
  `;
  
  toastContainer.appendChild(toast);
  
  setTimeout(() => {
    toast.classList.add('fade-out');
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

function createToastContainer() {
  const container = document.createElement('div');
  container.id = 'toast-container';
  container.className = 'toast-container';
  document.body.appendChild(container);
  return container;
}

// Format price
function formatPrice(price) {
  return `₦${Number(price).toLocaleString()}`;
}

// Cart functions
function getCart() {
  return JSON.parse(localStorage.getItem('cart')) || [];
}

function saveCart(cart) {
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartCounter();
}

function updateCartCounter() {
  const cartCounters = document.querySelectorAll('.cart-counter');
  const cart = getCart();
  const totalItems = cart.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
  
  cartCounters.forEach(counter => {
    counter.textContent = totalItems > 0 ? totalItems : '';
  });
}

// Calculate cart total
function calculateCartTotal(cart) {
  const subtotal = cart.reduce((sum, item) => sum + (Number(item.price) * Number(item.quantity)), 0);
  const shipping = 1500;
  return { subtotal, shipping, total: subtotal + shipping };
}

// Load cart page
function loadCart() {
  const cartContent = document.getElementById('cart-content');
  if (!cartContent) return;

  const cart = getCart();

  if (cart.length === 0) {
    cartContent.innerHTML = `
      <div class="empty-cart">
        <i class="fas fa-shopping-cart"></i>
        <h2>Your Cart is Empty</h2>
        <p>Looks like you haven't added any items to your cart yet</p>
        <a href="products.html" class="btn btn-primary">Browse Products</a>
      </div>
    `;
    return;
  }

  const { subtotal, shipping, total } = calculateCartTotal(cart);

  let itemsHTML = `
    <table class="cart-table">
      <thead>
        <tr>
          <th>Product</th>
          <th>Name</th>
          <th>Price</th>
          <th>Quantity</th>
          <th>Subtotal</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
  `;

  cart.forEach((item, index) => {
    const itemTotal = Number(item.price) * Number(item.quantity);
    
    itemsHTML += `
      <tr>
        <td><img src="${item.image}" alt="${item.name}" class="cart-product-image"></td>
        <td>${item.name}</td>
        <td>${formatPrice(item.price)}</td>
        <td>
          <div class="quantity-control">
            <button class="quantity-btn" onclick="updateQuantity(${index}, -1)">-</button>
            <span>${item.quantity}</span>
            <button class="quantity-btn" onclick="updateQuantity(${index}, 1)">+</button>
          </div>
        </td>
        <td>${formatPrice(itemTotal)}</td>
        <td><button class="remove-btn" onclick="removeFromCart(${index})">Remove</button></td>
      </tr>
    `;
  });

  itemsHTML += `
      </tbody>
    </table>
    <div class="cart-summary">
      <div class="cart-total">
        <span>Subtotal:</span> ${formatPrice(subtotal)}
        <span style="margin-left: 1rem;">Shipping:</span> ${formatPrice(shipping)}
        <span style="margin-left: 1rem; color: var(--accent-primary);">Total:</span> ${formatPrice(total)}
      </div>
      <div class="cart-actions">
        <button class="btn btn-secondary" onclick="clearCart()">Clear Cart</button>
        <button class="btn btn-primary" onclick="proceedToCheckout()">Proceed to Checkout</button>
      </div>
    </div>
  `;

  cartContent.innerHTML = itemsHTML;
}

// Update quantity
window.updateQuantity = function(index, change) {
  const cart = getCart();
  const item = cart[index];

  if (item) {
    item.quantity = Math.max(Number(item.quantity) + change, 1);

    if (item.quantity <= 0) {
      cart.splice(index, 1);
    }

    saveCart(cart);
    loadCart();
  }
};

// Remove from cart
window.removeFromCart = function(index) {
  const cart = getCart();
  const item = cart[index];
  cart.splice(index, 1);
  saveCart(cart);
  showToast(`${item.name} removed from cart`, 'warning');
  loadCart();
};

// Clear cart
window.clearCart = function() {
  if (confirm('Are you sure you want to clear your cart?')) {
    localStorage.removeItem('cart');
    updateCartCounter();
    loadCart();
    showToast('Cart cleared', 'warning');
  }
};

// Proceed to checkout
window.proceedToCheckout = function() {
  const cart = getCart();
  if (cart.length === 0) {
    showToast('Your cart is empty!', 'error');
    return;
  }
  window.location.href = 'checkout.html';
};

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
  loadCart();
  updateCartCounter();
  initHamburger();
});