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

// Get status display
function getStatusDisplay(status) {
  const statusMap = {
    'processing': { text: 'Processing', color: '#f59e0b' },
    'shipped': { text: 'Shipped', color: '#3b82f6' },
    'delivered': { text: 'Delivered', color: '#10b981' },
    'cancelled': { text: 'Cancelled', color: '#ef4444' }
  };
  return statusMap[status] || { text: status, color: '#6b7280' };
}

// Calculate progress percentage
function getStatusProgress(status) {
  const progressMap = {
    'processing': 33,
    'shipped': 66,
    'delivered': 100,
    'cancelled': 100
  };
  return progressMap[status] || 0;
}

// Calculate order total
function calculateOrderTotal(items) {
  const subtotal = items.reduce((sum, item) => sum + (Number(item.price) * Number(item.quantity)), 0);
  const shipping = 1500;
  return { subtotal, shipping, total: subtotal + shipping };
}

// Render order tracking
function renderOrderTracking(order) {
  const { subtotal, shipping, total } = calculateOrderTotal(order.items);
  const status = getStatusDisplay(order.status);
  const progress = getStatusProgress(order.status);

  const trackingHTML = `
    <div class="tracking-card">
      <div class="order-header">
        <div class="order-number">
          Order #<span>${order.id}</span>
        </div>
        <div class="order-date">
          Placed on ${formatDate(order.date)}
        </div>
      </div>
      
      <div class="tracking-status">
        <h3 style="color: ${status.color};">Order Status: ${status.text}</h3>
        
        <div class="status-timeline">
          <div class="status-line"></div>
          <div class="status-line-progress" style="height: ${progress}%;"></div>
          
          <div class="status-step">
            <div class="step-icon ${order.status !== 'cancelled' ? 'completed' : ''}">
              <i class="fas fa-check"></i>
            </div>
            <div class="step-details">
              <h4>Order Placed</h4>
              <p>${formatDate(order.date)}</p>
            </div>
          </div>
          
          <div class="status-step">
            <div class="step-icon ${order.status === 'shipped' || order.status === 'delivered' ? 'completed' : order.status === 'processing' ? 'active' : ''}">
              <i class="fas ${order.status === 'cancelled' ? 'fa-times' : 'fa-cog'}"></i>
            </div>
            <div class="step-details">
              <h4>Processing</h4>
              <p>
                ${order.status === 'processing' ? 'Your order is being prepared' : 
                  order.status === 'cancelled' ? 'Order cancelled' : 'Completed'}
              </p>
            </div>
          </div>
          
          <div class="status-step">
            <div class="step-icon ${order.status === 'delivered' ? 'completed' : order.status === 'shipped' ? 'active' : ''}">
              <i class="fas ${order.status === 'cancelled' ? 'fa-times' : 'fa-truck'}"></i>
            </div>
            <div class="step-details">
              <h4>${order.status === 'cancelled' ? 'Cancelled' : 'Delivery'}</h4>
              <p>
                ${order.status === 'shipped' ? 'Your order is on the way' : 
                  order.status === 'delivered' ? 'Delivered' : 
                  order.status === 'cancelled' ? 'Order cancelled' : 'Awaiting shipment'}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div class="order-details">
        <h3>Order Details</h3>
        
        <div class="detail-row">
          <div class="detail-label">Shipping Address</div>
          <div class="detail-value">${order.address || 'Not specified'}</div>
        </div>
        
        <div class="detail-row">
          <div class="detail-label">Contact</div>
          <div class="detail-value">${order.email} | ${order.phone}</div>
        </div>
      </div>
      
      <div class="tracking-actions">
        <a href="products.html" class="btn btn-primary">Continue Shopping</a>
        <button class="btn btn-secondary" onclick="contactSupport('${order.id}')">
          <i class="fas fa-question-circle"></i> Need Help?
        </button>
      </div>
    </div>
    
    <div class="tracking-card">
      <h3>Order Summary</h3>
      ${order.items.map(item => `
        <div class="order-item">
          <span>${item.name} × ${item.quantity}</span>
          <span>${formatPrice(Number(item.price) * Number(item.quantity))}</span>
        </div>
      `).join('')}
      <div class="order-item">
        <span>Shipping</span>
        <span>${formatPrice(shipping)}</span>
      </div>
      <div class="order-total">
        <span>Total</span>
        <span>${formatPrice(total)}</span>
      </div>
    </div>
  `;

  document.getElementById('order-tracking-container').innerHTML = trackingHTML;
  document.getElementById('no-orders-message').style.display = 'none';
  document.getElementById('order-tracking-container').style.display = 'block';
}

// Search orders
function searchOrders(orderNumber, email) {
  const orderHistory = JSON.parse(localStorage.getItem('orderHistory')) || [];
  const foundOrder = orderHistory.find(order => 
    order.id.toString() === orderNumber.toString() && 
    order.email.toLowerCase() === email.toLowerCase()
  );
  
  if (foundOrder) {
    renderOrderTracking(foundOrder);
  } else {
    document.getElementById('order-tracking-container').style.display = 'none';
    document.getElementById('no-orders-message').style.display = 'block';
  }
}

// Contact support
window.contactSupport = function(orderId) {
  showToast(`Support ticket created for order #${orderId}`, 'info');
};

// Check URL parameters
function checkUrlParameters() {
  const urlParams = new URLSearchParams(window.location.search);
  const orderId = urlParams.get('order_id');
  const email = urlParams.get('email');
  
  if (orderId && email) {
    searchOrders(orderId, email);
  }
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
  checkUrlParameters();
  
  document.getElementById('order-search-form')?.addEventListener('submit', function(e) {
    e.preventDefault();
    const orderNumber = document.getElementById('order-number').value.trim();
    const email = document.getElementById('order-email').value.trim();
    
    if (orderNumber && email) {
      searchOrders(orderNumber, email);
    }
  });
});