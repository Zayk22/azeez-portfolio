// ===== DOM Elements =====
const searchInput = document.getElementById('searchInput');
const clearSearchBtn = document.getElementById('clearSearch');
const animeGrid = document.getElementById('animeGrid');
const loading = document.getElementById('loading');
const emptyState = document.getElementById('emptyState');
const errorState = document.getElementById('errorState');
const resultsCount = document.getElementById('resultsCount');
const resetFiltersBtn = document.getElementById('resetFilters');
const retryBtn = document.getElementById('retryButton');
const clearEmptyFilters = document.getElementById('clearEmptyFilters');
const loadMoreBtn = document.getElementById('loadMoreBtn');
const loadMoreContainer = document.getElementById('loadMoreContainer');

// Filter Elements
const genreFilter = document.getElementById('genreFilter');
const typeFilter = document.getElementById('typeFilter');
const statusFilter = document.getElementById('statusFilter');
const ratingFilter = document.getElementById('ratingFilter');
const yearFilter = document.getElementById('yearFilter');
const seasonFilter = document.getElementById('seasonFilter');

// ===== Constants =====
const API_URL = 'https://api.jikan.moe/v4';
const GENRES_URL = 'https://api.jikan.moe/v4/genres/anime';
const FALLBACK_IMAGE = 'https://via.placeholder.com/300x450/1a1f2e/4a6cf7?text=No+Image';
let currentAnimeList = [];
let currentPage = 1;
let hasNextPage = false;
let currentQuery = '';
let searchTimeout;
let allGenres = [];
let isLoadingMore = false;

// ===== Initialize =====
document.addEventListener('DOMContentLoaded', async () => {
    await loadGenres();
    populateYearFilter();
    await fetchTopAnime();
    setupEventListeners();
});

// ===== Event Listeners =====
function setupEventListeners() {
    searchInput.addEventListener('input', handleSearchInput);
    clearSearchBtn.addEventListener('click', clearSearch);
    
    [genreFilter, typeFilter, statusFilter, ratingFilter, yearFilter, seasonFilter].forEach(filter => {
        filter.addEventListener('change', applyFilters);
    });
    
    resetFiltersBtn.addEventListener('click', resetAllFilters);
    
    if (retryBtn) {
        retryBtn.addEventListener('click', () => {
            fetchTopAnime();
        });
    }
    
    if (clearEmptyFilters) {
        clearEmptyFilters.addEventListener('click', resetAllFilters);
    }
    
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', loadMoreAnime);
    }
}

// ===== Load Genres from API =====
async function loadGenres() {
    try {
        const response = await fetch(GENRES_URL);
        const data = await response.json();
        allGenres = data.data;
        populateGenreFilter();
    } catch (error) {
        console.error('Error loading genres:', error);
    }
}

// ===== Populate Filters =====
function populateGenreFilter() {
    genreFilter.innerHTML = '<option value="">All Genres</option>';
    allGenres.sort((a, b) => a.name.localeCompare(b.name)).forEach(genre => {
        const option = document.createElement('option');
        option.value = genre.mal_id;
        option.textContent = genre.name;
        genreFilter.appendChild(option);
    });
}

function populateYearFilter() {
    const currentYear = new Date().getFullYear();
    yearFilter.innerHTML = '<option value="">All Years</option>';
    for (let year = currentYear; year >= 1980; year--) {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        yearFilter.appendChild(option);
    }
}

// ===== Search Handling =====
function handleSearchInput() {
    const query = searchInput.value.trim();
    clearSearchBtn.classList.toggle('visible', query.length > 0);
    
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        currentQuery = query;
        currentPage = 1;
        if (query) {
            searchAnime(query);
        } else {
            fetchTopAnime();
        }
    }, 500);
}

function clearSearch() {
    searchInput.value = '';
    clearSearchBtn.classList.remove('visible');
    currentQuery = '';
    currentPage = 1;
    fetchTopAnime();
}

// ===== API Calls =====
async function fetchTopAnime(page = 1) {
    hideError();
    showLoading();
    hideLoadMore();
    
    try {
        const response = await fetch(`${API_URL}/top/anime?page=${page}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (page === 1) {
            currentAnimeList = data.data;
        } else {
            currentAnimeList = [...currentAnimeList, ...data.data];
        }
        
        hasNextPage = data.pagination.has_next_page;
        currentPage = page;
        
        displayAnime(currentAnimeList);
        
        if (hasNextPage) {
            showLoadMore();
        }
    } catch (error) {
        console.error('Error:', error);
        showError();
    } finally {
        hideLoading();
    }
}

async function searchAnime(query, page = 1) {
    hideError();
    showLoading();
    hideLoadMore();
    
    try {
        const response = await fetch(`${API_URL}/anime?q=${encodeURIComponent(query)}&order_by=popularity&sort=asc&limit=25&page=${page}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (page === 1) {
            currentAnimeList = data.data;
        } else {
            currentAnimeList = [...currentAnimeList, ...data.data];
        }
        
        hasNextPage = data.pagination.has_next_page;
        currentPage = page;
        
        displayAnime(currentAnimeList);
        
        if (hasNextPage) {
            showLoadMore();
        }
    } catch (error) {
        console.error('Error:', error);
        showError();
    } finally {
        hideLoading();
    }
}

async function loadMoreAnime() {
    if (isLoadingMore || !hasNextPage) return;
    
    isLoadingMore = true;
    loadMoreBtn.classList.add('loading');
    
    const nextPage = currentPage + 1;
    
    if (currentQuery) {
        await searchAnime(currentQuery, nextPage);
    } else {
        await fetchTopAnime(nextPage);
    }
    
    isLoadingMore = false;
    loadMoreBtn.classList.remove('loading');
}

// ===== Filtering =====
function applyFilters() {
    if (currentAnimeList.length === 0) return;
    
    const filteredList = currentAnimeList.filter(anime => {
        // Genre filter
        if (genreFilter.value && !anime.genres.some(g => g.mal_id === parseInt(genreFilter.value))) {
            return false;
        }
        
        // Type filter
        if (typeFilter.value && anime.type?.toLowerCase() !== typeFilter.value) {
            return false;
        }
        
        // Status filter
        if (statusFilter.value) {
            const statusMap = {
                'airing': 'currently airing',
                'complete': 'finished',
                'upcoming': 'not yet aired'
            };
            const expectedStatus = statusMap[statusFilter.value];
            if (anime.status?.toLowerCase() !== expectedStatus) {
                return false;
            }
        }
        
        // Rating filter - Improved matching logic
        if (ratingFilter.value && anime.rating) {
            const ratingLower = anime.rating.toLowerCase();
            const filterValue = ratingFilter.value.toLowerCase();
            
            // More accurate matching based on rating categories
            if (filterValue === 'g' && !ratingLower.includes('g')) return false;
            if (filterValue === 'pg' && !ratingLower.includes('pg')) return false;
            if (filterValue === 'pg13' && !ratingLower.includes('pg-13')) return false;
            if (filterValue === 'r17' && !ratingLower.includes('17')) return false;
            if (filterValue === 'r' && ratingLower.includes('+')) return false;
            if (filterValue === 'rx' && !ratingLower.includes('hentai')) return false;
        }
        
        // Year filter
        if (yearFilter.value && anime.year !== parseInt(yearFilter.value)) {
            return false;
        }
        
        // Season filter
        if (seasonFilter.value && anime.season?.toLowerCase() !== seasonFilter.value) {
            return false;
        }
        
        return true;
    });
    
    displayAnime(filteredList);
}

// ===== Display Functions =====
function displayAnime(animeList) {
    if (currentPage === 1) {
        animeGrid.innerHTML = '';
    }
    
    if (animeList.length === 0) {
        showEmptyState();
        resultsCount.textContent = '0 results';
        hideLoadMore();
        return;
    }
    
    hideEmptyState();
    resultsCount.textContent = `${animeList.length} results`;
    
    // Only append new cards if we're on page > 1
    if (currentPage === 1) {
        animeGrid.innerHTML = '';
        animeList.forEach(anime => {
            const animeCard = createAnimeCard(anime);
            animeGrid.appendChild(animeCard);
        });
    } else {
        // Get current cards count
        const currentCards = animeGrid.children.length;
        const newAnime = animeList.slice(currentCards);
        
        newAnime.forEach(anime => {
            const animeCard = createAnimeCard(anime);
            animeGrid.appendChild(animeCard);
        });
    }
}

function createAnimeCard(anime) {
    const card = document.createElement('div');
    card.className = 'anime-card';
    
    // Store filter data as data attributes
    card.dataset.genres = anime.genres.map(g => g.mal_id).join(',');
    card.dataset.type = (anime.type || '').toLowerCase();
    card.dataset.year = anime.year || '';
    card.dataset.rating = (anime.rating || '').toLowerCase();
    card.dataset.status = (anime.status || '').toLowerCase();
    
    card.innerHTML = `
        <img src="${anime.images.jpg.image_url}" alt="${anime.title}" class="anime-poster" loading="lazy" onerror="this.src='${FALLBACK_IMAGE}'">
        <div class="anime-info">
            <h3 class="anime-title">${anime.title}</h3>
            <div class="anime-meta">
                <span>${anime.type || 'Unknown'}</span>
                <span>${anime.year || 'N/A'}</span>
            </div>
            <div class="rating">
                ${getStarRating(anime.score)}
                <span>${anime.score ? anime.score.toFixed(1) : 'N/A'}</span>
            </div>
        </div>
    `;

    card.addEventListener('click', () => {
        window.open(anime.url, '_blank');
    });

    return card;
}

function getStarRating(score) {
    if (!score) return '<i class="far fa-star"></i>'.repeat(5);
    
    const stars = Math.round(score / 2);
    let starsHtml = '';
    
    for (let i = 0; i < 5; i++) {
        if (i < stars) {
            starsHtml += '<i class="fas fa-star"></i>';
        } else {
            starsHtml += '<i class="far fa-star"></i>';
        }
    }
    
    return starsHtml;
}

// ===== UI State Functions =====
function showLoading() {
    loading.style.display = 'flex';
    if (currentPage === 1) {
        animeGrid.style.opacity = '0.3';
        animeGrid.style.pointerEvents = 'none';
    }
    emptyState.style.display = 'none';
    errorState.style.display = 'none';
}

function hideLoading() {
    loading.style.display = 'none';
    animeGrid.style.opacity = '1';
    animeGrid.style.pointerEvents = 'auto';
}

function showEmptyState() {
    emptyState.style.display = 'flex';
    animeGrid.style.display = 'none';
    errorState.style.display = 'none';
    hideLoadMore();
}

function hideEmptyState() {
    emptyState.style.display = 'none';
    animeGrid.style.display = 'grid';
}

function showError() {
    errorState.style.display = 'flex';
    animeGrid.style.display = 'none';
    emptyState.style.display = 'none';
    loading.style.display = 'none';
    resultsCount.textContent = 'Error loading';
    hideLoadMore();
}

function hideError() {
    errorState.style.display = 'none';
    animeGrid.style.display = 'grid';
}

function showLoadMore() {
    if (loadMoreContainer) {
        loadMoreContainer.style.display = 'flex';
    }
}

function hideLoadMore() {
    if (loadMoreContainer) {
        loadMoreContainer.style.display = 'none';
    }
}

// ===== Filter Reset =====
function resetAllFilters() {
    genreFilter.value = '';
    typeFilter.value = '';
    statusFilter.value = '';
    ratingFilter.value = '';
    yearFilter.value = '';
    seasonFilter.value = '';
    
    // Reset to page 1
    currentPage = 1;
    
    // If there's a search query, maintain it, otherwise show top anime
    if (searchInput.value.trim()) {
        searchAnime(searchInput.value.trim());
    } else {
        displayAnime(currentAnimeList);
    }
}