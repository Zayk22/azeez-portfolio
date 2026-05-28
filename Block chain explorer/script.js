// ===== CONFIGURATION =====
const COVALENT_API_KEY = "cqt_rQt9kCxCjCHkYc9VFpQQBXDkvVXf";
const COVALENT_BASE = "https://api.covalenthq.com/v1";
const COINGECKO_URL = "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd";

// DOM Elements
const addressInput = document.getElementById('addressInput');
const searchBtn = document.getElementById('searchBtn');
const resultPlaceholder = document.getElementById('resultPlaceholder');
const resultContent = document.getElementById('resultContent');
const errorMessage = document.getElementById('errorMessage');
const errorText = document.getElementById('errorText');
const walletAddressSpan = document.getElementById('walletAddress');
const balanceAmountSpan = document.getElementById('balanceAmount');
const usdAmountSpan = document.getElementById('usdAmount');
const copyBtn = document.getElementById('copyBtn');
const transactionsListDiv = document.getElementById('transactionsList');
const transactionsEmptyDiv = document.getElementById('transactionsEmpty');
const etherscanLink = document.getElementById('etherscanLink');

const balanceSkeleton = document.getElementById('balanceSkeleton');
const transactionsSkeleton = document.getElementById('transactionsSkeleton');
const realData = document.getElementById('realData');

let isFetching = false;
let currentAddress = '';

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    addressInput.focus();
    initTheme();
    console.log('Blockchain Explorer Ready - Upgraded version');
});

function setupEventListeners() {
    searchBtn.addEventListener('click', handleSearch);
    addressInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !isFetching) handleSearch();
    });
    copyBtn.addEventListener('click', handleCopyAddress);
    document.getElementById('themeToggle').addEventListener('click', toggleTheme);
}

// ===== THEME =====
function initTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark');
        document.querySelector('.theme-icon').textContent = '☀️';
    } else {
        document.querySelector('.theme-icon').textContent = '🌙';
    }
}

function toggleTheme() {
    document.body.classList.toggle('dark');
    const isDark = document.body.classList.contains('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    const icon = document.querySelector('.theme-icon');
    icon.textContent = isDark ? '☀️' : '🌙';
}

// ===== VALIDATION =====
function isValidEthereumAddress(address) {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
}

function validateInput(address) {
    if (!address || address.trim() === '') {
        showError('Please enter an Ethereum address');
        return false;
    }
    if (!isValidEthereumAddress(address)) {
        showError('Invalid address format. Ethereum addresses start with 0x and have 40 hex characters.');
        return false;
    }
    return true;
}

// ===== API CALLS =====
async function fetchWalletBalance(address) {
    const url = `${COVALENT_BASE}/1/address/${address}/balances_v2/?key=${COVALENT_API_KEY}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    if (data.error) throw new Error(data.error_message || 'API error');
    const ethItem = data.data?.items?.find(item => item.contract_ticker_symbol === 'ETH');
    if (ethItem) {
        const balanceWei = ethItem.balance;
        return balanceWei / 1e18;
    }
    return 0;
}

async function fetchETHPrice() {
    const response = await fetch(COINGECKO_URL);
    if (!response.ok) throw new Error('Price fetch failed');
    const data = await response.json();
    return data.ethereum?.usd || 0;
}

async function fetchTransactions(address, limit = 10) {
    const url = `${COVALENT_BASE}/1/address/${address}/transactions_v2/?key=${COVALENT_API_KEY}&limit=${limit}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    if (data.error) throw new Error(data.error_message);
    return data.data?.items || [];
}

// ===== UI UPDATE =====
function showLoading() {
    isFetching = true;
    searchBtn.disabled = true;
    searchBtn.classList.add('loading');

    resultPlaceholder.style.display = 'none';
    errorMessage.style.display = 'none';
    resultContent.style.display = 'block';

    if (realData) realData.style.display = 'none';
    if (balanceSkeleton) balanceSkeleton.style.display = 'block';
    if (transactionsSkeleton) transactionsSkeleton.style.display = 'block';
}

function hideLoading() {
    isFetching = false;
    searchBtn.disabled = false;
    searchBtn.classList.remove('loading');
}

function showResult(address, balance, usdPrice, transactions) {
    currentAddress = address;
    walletAddressSpan.textContent = address;
    balanceAmountSpan.textContent = balance.toFixed(6);
    const usdValue = balance * usdPrice;
    usdAmountSpan.textContent = `$${usdValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    etherscanLink.href = `https://etherscan.io/address/${address}`;

    if (transactions && transactions.length > 0) {
        transactionsEmptyDiv.style.display = 'none';
        transactionsListDiv.innerHTML = transactions.map(tx => {
            const hash = tx.tx_hash;
            const valueEth = parseFloat(tx.value) / 1e18;
            const timestamp = new Date(tx.block_signed_at).toLocaleString();
            return `
                <div class="transaction-card">
                    <div class="transaction-header">
                        <span class="transaction-hash">${hash.slice(0, 10)}...${hash.slice(-8)}</span>
                        <span class="transaction-value">${valueEth.toFixed(6)} ETH</span>
                    </div>
                    <div class="transaction-detail">
                        <span class="from-to">From: ${tx.from_address.slice(0, 8)}...${tx.from_address.slice(-6)} → To: ${tx.to_address.slice(0, 8)}...${tx.to_address.slice(-6)}</span>
                    </div>
                    <div class="transaction-detail">📅 ${timestamp}</div>
                </div>
            `;
        }).join('');
    } else {
        transactionsListDiv.innerHTML = '';
        transactionsEmptyDiv.style.display = 'block';
    }

    if (balanceSkeleton) balanceSkeleton.style.display = 'none';
    if (transactionsSkeleton) transactionsSkeleton.style.display = 'none';
    if (realData) realData.style.display = 'block';

    resultPlaceholder.style.display = 'none';
    errorMessage.style.display = 'none';
    resultContent.style.display = 'block';
}

function showError(message) {
    let displayMessage = message;
    if (message === 'ADDRESS_NOT_FOUND') displayMessage = '⚠️ Address not found. Please check and try again.';
    else if (message === 'RATE_LIMIT') displayMessage = '⏱️ Rate limit exceeded. Please wait a moment.';
    else if (message.includes('network') || message.includes('fetch')) displayMessage = '🌐 Network error. Check your connection.';
    else displayMessage = `❌ ${message}`;

    errorText.textContent = displayMessage;
    errorMessage.style.display = 'flex';
    resultPlaceholder.style.display = 'none';
    resultContent.style.display = 'none';

    if (balanceSkeleton) balanceSkeleton.style.display = 'none';
    if (transactionsSkeleton) transactionsSkeleton.style.display = 'none';
    if (realData) realData.style.display = 'none';

    setTimeout(() => {
        if (errorMessage.style.display === 'flex') {
            errorMessage.style.display = 'none';
            resultPlaceholder.style.display = 'flex';
            resultPlaceholder.innerHTML = `
                <svg class="placeholder-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <p>Enter an address to view balance</p>
            `;
        }
    }, 5000);
}

function showToast(message) {
    const toastContainer = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    toastContainer.appendChild(toast);
    setTimeout(() => {
        toast.classList.add('fade-out');
        setTimeout(() => toast.remove(), 300);
    }, 2000);
}

// ===== MAIN SEARCH =====
async function handleSearch() {
    const address = addressInput.value.trim();
    if (!validateInput(address)) return;

    showLoading();
    try {
        const [balance, ethPrice, transactions] = await Promise.all([
            fetchWalletBalance(address),
            fetchETHPrice(),
            fetchTransactions(address, 10)
        ]);
        hideLoading();
        showResult(address, balance, ethPrice, transactions);
    } catch (error) {
        console.error('Search error:', error);
        hideLoading();
        showError(error.message);
    }
}

// ===== COPY ADDRESS =====
async function handleCopyAddress() {
    const address = walletAddressSpan.textContent;
    if (!address || address === '--') return;
    try {
        await navigator.clipboard.writeText(address);
        showToast('✅ Address copied!');
    } catch (err) {
        const textarea = document.createElement('textarea');
        textarea.value = address;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        showToast('✅ Address copied!');
    }
}

// Clear placeholder when focusing input
addressInput.addEventListener('focus', () => {
    if (resultContent.style.display === 'block') {
        resultPlaceholder.style.display = 'flex';
        resultContent.style.display = 'none';
        errorMessage.style.display = 'none';
        resultPlaceholder.innerHTML = `
            <svg class="placeholder-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <p>Enter an address to view balance</p>
        `;
    }
});