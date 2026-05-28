// Products array
const products = [
  // Electronics
  {
    id: 101,
    name: "Samsung Galaxy S23 Ultra",
    category: "electronics",
    price: 890000,
    image: "images/Samsunggalaxy.jpg",
    rating: 4.8,
    reviewCount: 245,
    inStock: true,
    specs: "256GB Storage, 12GB RAM, 200MP Camera"
  },
  {
    id: 102,
    name: "Apple AirPods Pro (2nd Gen)",
    category: "electronics",
    price: 185000,
    image: "images/Airpodspro.jpg",
    rating: 4.7,
    reviewCount: 189,
    inStock: true
  },
  {
    id: 103,
    name: "HP Pavilion Laptop (16GB/512GB)",
    category: "electronics",
    price: 420000,
    image: "images/HP Pavilion Laptop.jpg",
    rating: 4.5,
    reviewCount: 156,
    inStock: true
  },
  {
    id: 104,
    name: "Sony 4K Smart TV (55-inch)",
    category: "electronics",
    price: 650000,
    image: "images/sonytv.jpg",
    rating: 4.6,
    reviewCount: 98,
    inStock: false
  },
  {
    id: 105,
    name: "Canon EOS R6 Camera",
    category: "electronics",
    price: 950000,
    image: "images/camera.jpg",
    rating: 4.9,
    reviewCount: 67,
    inStock: true
  },
  {
    id: 106,
    name: "Amazon Echo Dot (4th Gen)",
    category: "electronics",
    price: 45000,
    image: "images/speaker.jpg",
    rating: 4.3,
    reviewCount: 234,
    inStock: true
  },

  // Fashion
  {
    id: 201,
    name: "African Print Linen Shirt",
    category: "fashion",
    price: 12500,
    image: "images/africanprintshirt.jpg",
    rating: 4.5,
    reviewCount: 45,
    inStock: true,
    sizes: ["S", "M", "L", "XL"]
  },
  {
    id: 202,
    name: "Designer Leather Sandals",
    category: "fashion",
    price: 22000,
    image: "images/sandals.jpg",
    rating: 4.2,
    reviewCount: 23,
    inStock: false
  },
  {
    id: 203,
    name: "Premium Denim Jeans",
    category: "fashion",
    price: 18000,
    image: "images/denimjacket.jpg",
    rating: 4.4,
    reviewCount: 67,
    inStock: true,
    sizes: ["28", "30", "32", "34"]
  },
  {
    id: 204,
    name: "Silk Ankara Gown",
    category: "fashion",
    price: 35000,
    image: "images/ankaragown.jpg",
    rating: 4.7,
    reviewCount: 34,
    inStock: true
  },
  {
    id: 205,
    name: "Men's Leather Belt",
    category: "fashion",
    price: 8500,
    image: "images/leatherbelt.jpg",
    rating: 4.1,
    reviewCount: 89,
    inStock: true
  },

  // Home & Living
  {
    id: 301,
    name: "Handwoven Raffia Basket Set",
    category: "home",
    price: 15000,
    image: "images/handwovenbasket.jpg",
    rating: 4.9,
    reviewCount: 56,
    inStock: true
  },
  {
    id: 302,
    name: "Ceramic Dinnerware Set (16pc)",
    category: "home",
    price: 45000,
    image: "images/ceramicplates.jpg",
    rating: 4.6,
    reviewCount: 78,
    inStock: true
  },
  {
    id: 303,
    name: "Modern Floor Lamp",
    category: "home",
    price: 28000,
    image: "images/modernfloorlamp.jpg",
    rating: 4.3,
    reviewCount: 45,
    inStock: true
  },
  {
    id: 304,
    name: "Egyptian Cotton Bed Sheets",
    category: "home",
    price: 32000,
    image: "images/egyptianbedsheet.jpg",
    rating: 4.5,
    reviewCount: 67,
    inStock: false
  },

  // Accessories
  {
    id: 401,
    name: "Handcrafted Beaded Necklace",
    category: "accessories",
    price: 8500,
    image: "images/bracelet.jpg",
    rating: 4.3,
    reviewCount: 34,
    inStock: true
  },
  {
    id: 402,
    name: "Vintage Leather Wallet",
    category: "accessories",
    price: 12000,
    image: "images/vintagewallet.jpg",
    rating: 4.0,
    reviewCount: 56,
    inStock: true
  },
  {
    id: 403,
    name: "Designer Sunglasses",
    category: "accessories",
    price: 15000,
    image: "images/sunglasses.jpg",
    rating: 4.2,
    reviewCount: 45,
    inStock: true
  },
  {
    id: 404,
    name: "Smart Watch",
    category: "accessories",
    price: 25000,
    image: "images/smartwatch.jpg",
    rating: 4.4,
    reviewCount: 89,
    inStock: true
  },

  // Groceries
  {
    id: 501,
    name: "Premium Nigerian Rice (10kg)",
    category: "groceries",
    price: 16000,
    image: "images/premuimrice.jpg",
    rating: 4.7,
    reviewCount: 234,
    inStock: true
  },
  {
    id: 502,
    name: "Pure Honey (500ml)",
    category: "groceries",
    price: 7500,
    image: "images/honey.jpg",
    rating: 4.8,
    reviewCount: 156,
    inStock: true
  },
  {
    id: 503,
    name: "Organic Coconut Oil (1L)",
    category: "groceries",
    price: 6500,
    image: "images/coconutoil.jpg",
    rating: 4.6,
    reviewCount: 89,
    inStock: false
  },

  // Beauty
  {
    id: 601,
    name: "Shea Butter Skincare Kit",
    category: "beauty",
    price: 12500,
    image: "images/sheabutter.jpg",
    rating: 4.9,
    reviewCount: 145,
    inStock: true
  },
  {
    id: 602,
    name: "Luxury Perfume (100ml)",
    category: "beauty",
    price: 35000,
    image: "images/perfume.jpg",
    rating: 4.5,
    reviewCount: 78,
    inStock: true
  }
];

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

// Add to cart
window.addToCart = function(productId) {
  const product = products.find(p => p.id === productId);
  if (!product || !product.inStock) return;

  const cart = getCart();
  const cartItem = cart.find(item => item.id === productId);

  if (cartItem) {
    cartItem.quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }

  saveCart(cart);
  showToast(`${product.name} added to cart!`, 'success');
  
  // Add animation to cart icon
  const cartIcon = document.querySelector('.cart-link i');
  if (cartIcon) {
    cartIcon.style.transform = 'scale(1.2)';
    setTimeout(() => {
      cartIcon.style.transform = 'scale(1)';
    }, 200);
  }
};

// Display products
function displayProducts(productArray) {
  const container = document.getElementById('product-list');
  if (!container) return;

  if (productArray.length === 0) {
    container.innerHTML = `
      <div class="empty-cart">
        <i class="fas fa-box-open"></i>
        <h3>No products found</h3>
        <p>Check back later for new arrivals</p>
      </div>
    `;
    return;
  }

  container.innerHTML = productArray.slice(0, 6).map(product => `
    <div class="product-card">
      <div class="product-badges">
        <span class="category-badge">${product.category}</span>
        ${!product.inStock ? '<span class="stock-badge">Out of Stock</span>' : ''}
      </div>
      <img src="${product.image}" alt="${product.name}" class="product-image" loading="lazy">
      <div class="product-info">
        <h3 class="product-title">${product.name}</h3>
        ${product.rating ? `
          <div class="product-rating">
            <div class="stars">
              ${'★'.repeat(Math.floor(product.rating))}${'☆'.repeat(5 - Math.floor(product.rating))}
            </div>
            <span class="rating-count">(${product.reviewCount || 0})</span>
          </div>
        ` : ''}
        <p class="product-price">${formatPrice(product.price)}</p>
        <button class="add-to-cart-btn" onclick="addToCart(${product.id})" ${!product.inStock ? 'disabled' : ''}>
          ${product.inStock ? 'Add to Cart' : 'Out of Stock'}
        </button>
      </div>
    </div>
  `).join('');
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
  displayProducts(products);
  updateCartCounter();
  initHamburger();
});