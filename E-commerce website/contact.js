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
});