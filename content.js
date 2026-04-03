import { db } from './firebase-setup.js';
import { DB_PATHS, STORAGE_KEYS, CACHE_TTL } from './rules.js';
import { getLocalUser } from './auth.js';
import { showToast } from './ui.js';

const BATCH_SIZE = 15;

let allPublishedItems = [];
let filteredItems = [];
let visibleCount = BATCH_SIZE;
let activeGridElement = null;
let controlsBound = false;

export async function loadContent() {
    const grid = document.getElementById('content-grid');
    const loader = document.getElementById('loading-state');

    if (!grid || !loader) return;

    // Check sessionStorage cache first
    const cachedData = sessionStorage.getItem(STORAGE_KEYS.CACHED_CONTENT);
    const cachedTs = sessionStorage.getItem(STORAGE_KEYS.CONTENT_TIMESTAMP);
    const now = Date.now();

    if (cachedData && cachedTs && (now - parseInt(cachedTs, 10)) < CACHE_TTL.CONTENT) {
        try {
            renderCards(JSON.parse(cachedData), grid);
            loader.classList.add('hidden');
            return;
        } catch {
            sessionStorage.removeItem(STORAGE_KEYS.CACHED_CONTENT);
            sessionStorage.removeItem(STORAGE_KEYS.CONTENT_TIMESTAMP);
        }
    }

    // Try content_meta first; fallback to legacy 'content' node if not migrated
    if (!db) {
        showErrorState(grid);
        loader.classList.add('hidden');
        return;
    }
    try {
        let snap = null;

        // Attempt new architecture path first
        try {
            snap = await db.ref(DB_PATHS.CONTENT_META).once('value');
            if (!snap.exists()) snap = null;
        } catch (_) {
            // content_meta may not exist or may be permission-denied — that's fine
            snap = null;
        }

        // Fallback to legacy 'content' node
        if (!snap) {
            snap = await db.ref(DB_PATHS.CONTENT).once('value');
        }

        if (snap.exists()) {
            const data = snap.val();
            sessionStorage.setItem(STORAGE_KEYS.CACHED_CONTENT, JSON.stringify(data));
            sessionStorage.setItem(STORAGE_KEYS.CONTENT_TIMESTAMP, String(Date.now()));
            renderCards(data, grid);
        } else {
            showEmptyLibrary(grid);
        }
    } catch (error) {
        console.error('Content load error:', error);
        showErrorState(grid);
        showToast('Unable to load the library right now. Please retry shortly.', 'error');
    }
    loader.classList.add('hidden');
}

function showEmptyLibrary(gridElement) {
    const txtGrid = document.getElementById('txt-grid');
    if (!txtGrid) return;
    gridElement.classList.remove('hidden');
    txtGrid.innerHTML = `
        <div class="empty-list-card">
            <p style="font-size: 1.4rem; margin-bottom: 0.5rem;">The library is being prepared.</p>
            <p style="font-size: 0.95rem; font-family: 'Manrope', sans-serif; font-style: normal; color: var(--ink-muted);">New articles will appear here soon.</p>
        </div>
    `;
}

function showErrorState(gridElement) {
    const txtGrid = document.getElementById('txt-grid');
    if (!txtGrid) return;
    gridElement.classList.remove('hidden');
    txtGrid.innerHTML = `
        <div class="empty-list-card">
            <p style="font-size: 1.4rem; margin-bottom: 0.5rem;">Unable to load the library.</p>
            <p style="font-size: 0.95rem; font-family: 'Manrope', sans-serif; font-style: normal; color: var(--ink-muted);">Please check your connection and refresh.</p>
        </div>
    `;
}

/**
 * Transforms raw Firebase data into an array of items,
 * preserving the database key (_key) on each item for secure URL lookups.
 */
function renderCards(data, gridElement) {
    activeGridElement = gridElement;
    allPublishedItems = Object.keys(data)
        .map((key) => ({ ...data[key], _key: key }))
        .filter((item) => item && item.is_published);

    bindInteractiveControls();

    const searchInput = document.getElementById('content-search-input');
    const query = searchInput ? searchInput.value.trim() : '';

    visibleCount = BATCH_SIZE;
    applySearchAndRender(query);
}

function bindInteractiveControls() {
    if (controlsBound) return;

    const searchInput = document.getElementById('content-search-input');
    const clearSearchBtn = document.getElementById('clear-search-btn');
    const loadMoreTrigger = document.getElementById('pdf-load-more-btn');
    const suggestionsBox = document.getElementById('search-suggestions');

    if (searchInput) {
        searchInput.addEventListener('input', () => {
            visibleCount = BATCH_SIZE;
            const query = searchInput.value.trim();
            applySearchAndRender(query);
            renderSearchSuggestions(query);
        });

        searchInput.addEventListener('focus', () => {
            renderSearchSuggestions(searchInput.value.trim());
        });

        searchInput.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                hideSearchSuggestions();
            }
        });
    }

    if (loadMoreTrigger) {
        loadMoreTrigger.addEventListener('click', () => {
            // Swap to spinner state
            loadMoreTrigger.classList.add('is-loading');

            // Simulate a micro-delay for visual smoothness, then append
            setTimeout(() => {
                visibleCount += BATCH_SIZE;
                drawFilteredContent();
                loadMoreTrigger.classList.remove('is-loading');
            }, 350);
        });

        loadMoreTrigger.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                loadMoreTrigger.click();
            }
        });
    }

    // Helper for smart-focus (desktop focus, mobile blur)
    const handleSmartControl = (input) => {
        const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        if (isTouch) {
            input.blur(); // Close keyboard on mobile to prevent zoom-out/jumps
        } else {
            input.focus(); // Keep focus for desktop speed
        }
    };

    if (clearSearchBtn && searchInput) {
        clearSearchBtn.addEventListener('click', () => {
            searchInput.value = '';
            visibleCount = BATCH_SIZE;
            applySearchAndRender('');
            hideSearchSuggestions();
            handleSmartControl(searchInput);
        });
    }

    if (suggestionsBox && searchInput) {
        suggestionsBox.addEventListener('click', (event) => {
            const btn = event.target.closest('.suggestion-item');
            if (!btn) return;

            const type = btn.getAttribute('data-type');
            const dataVal = btn.getAttribute('data-val') || '';

            if (type === 'article') {
                hideSearchSuggestions();
                handleBookClick(dataVal);
            } else if (type === 'category') {
                searchInput.value = dataVal;
                visibleCount = BATCH_SIZE;
                applySearchAndRender(dataVal);
                hideSearchSuggestions();
                handleSmartControl(searchInput);
            }
        });

        document.addEventListener('click', (event) => {
            const searchShell = searchInput.closest('.search-shell');
            if (!searchShell) return;

            if (!searchShell.contains(event.target)) {
                hideSearchSuggestions();
            }
        });
    }

    controlsBound = true;
}

function applySearchAndRender(query) {
    const normalized = query.toLowerCase();

    if (!normalized) {
        filteredItems = [...allPublishedItems];
    } else {
        filteredItems = allPublishedItems.filter((item) => {
            const searchable = `${item.title || ''} ${item.category || ''} ${item.type || ''}`.toLowerCase();
            return searchable.includes(normalized);
        });
    }

    drawFilteredContent();
    updateSearchState(query);
}

function drawFilteredContent() {
    const txtGrid = document.getElementById('txt-grid');
    const loadMoreTrigger = document.getElementById('pdf-load-more-btn');
    const searchInput = document.getElementById('content-search-input');
    const isSearching = searchInput && searchInput.value.trim().length > 0;

    if (!activeGridElement || !txtGrid) return;

    txtGrid.innerHTML = '';
    activeGridElement.classList.remove('hidden');

    // If searching, show ALL results. If browsing, paginate.
    const itemsToShow = isSearching ? filteredItems : filteredItems.slice(0, visibleCount);

    itemsToShow.forEach((item) => {
        txtGrid.appendChild(createCard(item));
    });

    if (!itemsToShow.length) {
        txtGrid.innerHTML = emptySectionCard('No articles match your search.');
    }

    // Load More trigger visibility (only when NOT searching)
    if (loadMoreTrigger) {
        if (isSearching) {
            loadMoreTrigger.classList.add('hidden');
        } else {
            const remaining = filteredItems.length - visibleCount;
            if (remaining > 0) {
                const triggerText = loadMoreTrigger.querySelector('.load-more-text');
                if (triggerText) {
                    triggerText.textContent = `Show More Articles`;
                }
                loadMoreTrigger.classList.remove('hidden');
            } else {
                loadMoreTrigger.classList.add('hidden');
            }
        }
    }
}

function updateSearchState(query) {
    const clearSearchBtn = document.getElementById('clear-search-btn');
    const searchMeta = document.getElementById('search-result-meta');

    if (clearSearchBtn) {
        if (query) {
            clearSearchBtn.classList.remove('hidden');
        } else {
            clearSearchBtn.classList.add('hidden');
        }
    }

    if (searchMeta) {
        if (query) {
            searchMeta.innerText = `${filteredItems.length} result${filteredItems.length !== 1 ? 's' : ''} for "${query}"`;
        } else {
            const total = allPublishedItems.length;
            searchMeta.innerText = total > 0 ? `${total} articles in the library` : 'Curated knowledge library';
        }
    }
}

function createCard(item) {
    const card = document.createElement('div');
    card.className = 'content-card';
    card.setAttribute('data-key', item._key);
    card.onclick = () => handleBookClick(item._key);

    const category = item.category ? escapeHtml(item.category) : '';
    const freeBadge = item.is_free ? `<span style="font-size: 0.6rem; font-weight: 800; background: rgba(109, 173, 150, 0.15); color: var(--accent-sage); padding: 0.2rem 0.5rem; border-radius: 20px; margin-left: 10px;">FREE DEMO</span>` : '';

    card.innerHTML = `
        <div class="file-list-row">
            <div class="file-list-title-shell">
                <h3 class="file-list-title">${escapeHtml(item.title || 'Untitled')}</h3>
                ${(category || freeBadge) ? `<span class="file-list-category">${category}${freeBadge}</span>` : ''}
            </div>
            <span class="file-list-arrow" aria-hidden="true">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </span>
        </div>
    `;

    return card;
}

function emptySectionCard(message) {
    return `
        <div class="empty-list-card">
            ${escapeHtml(message)}
        </div>
    `;
}

function renderSearchSuggestions(query) {
    const suggestionsBox = document.getElementById('search-suggestions');
    if (!suggestionsBox) return;

    const normalized = query.toLowerCase();
    if (!normalized || normalized.length < 2) {
        hideSearchSuggestions();
        return;
    }

    const uniqueSuggestions = [];
    const seen = new Set();

    allPublishedItems.forEach((item) => {
        const title = item.title ? String(item.title).trim() : '';
        const category = item.category ? String(item.category).trim() : '';

        if (title && title.toLowerCase().includes(normalized) && !seen.has('t:' + title.toLowerCase())) {
            seen.add('t:' + title.toLowerCase());
            if (uniqueSuggestions.length < 6) {
                uniqueSuggestions.push({ label: title, type: 'article', data: item._key });
            }
        }

        if (category && category.toLowerCase().includes(normalized) && !seen.has('c:' + category.toLowerCase())) {
            seen.add('c:' + category.toLowerCase());
            if (uniqueSuggestions.length < 6) {
                uniqueSuggestions.push({ label: category, type: 'category', data: category });
            }
        }
    });

    if (!uniqueSuggestions.length) {
        hideSearchSuggestions();
        return;
    }

    suggestionsBox.innerHTML = uniqueSuggestions
        .map((target) => `
            <button type="button" class="suggestion-item premium-suggestion" data-type="${target.type}" data-val="${escapeHtml(target.data || '')}">
                <span class="suggestion-dot" style="background: ${target.type === 'article' ? 'var(--accent-mint)' : 'var(--accent-yellow)'}"></span>
                <span class="suggestion-text">${escapeHtml(target.label)}</span>
                <span class="suggestion-badge">${target.type === 'article' ? 'Article' : 'Category'}</span>
            </button>
        `)
        .join('');

    suggestionsBox.classList.remove('hidden');
}

function hideSearchSuggestions() {
    const suggestionsBox = document.getElementById('search-suggestions');
    if (!suggestionsBox) return;

    suggestionsBox.classList.add('hidden');
    suggestionsBox.innerHTML = '';
}

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

/**
 * Secure content access:
 * 1. Checks if the article is marked as free demo (bypassing auth)
 * 2. Validates premium status locally if not free
 * 3. Fetches from content_urls/<key> on demand or via cache
 * 4. Opens the content targeting 'ReaderTab'
 */
async function handleBookClick(articleKey) {
    const clickedItem = allPublishedItems.find(item => item._key === articleKey);
    const isFreeArticle = (clickedItem && clickedItem.is_free === true);

    if (!isFreeArticle) {
        const user = getLocalUser();
        if (!user) {
            window.dispatchEvent(new Event('open-auth-modal'));
            return;
        }

        if (user.membership_status !== 'active') {
            showToast('Your premium access is inactive. Please renew to continue.', 'info');
            return;
        }
    }

    if (clickedItem && clickedItem.file_url) {
        window.open(clickedItem.file_url, 'ReaderTab');
        return;
    }

    const card = document.querySelector(`.content-card[data-key="${articleKey}"]`);
    const arrow = card ? card.querySelector('.file-list-arrow') : null;
    if (arrow) arrow.innerHTML = '<span class="card-loading-dot"></span>';

    try {
        const snap = await db.ref(`${DB_PATHS.CONTENT_URLS}/${articleKey}`).once('value');
        if (snap.exists()) {
            const urlData = snap.val();
            const fileUrl = typeof urlData === 'string' ? urlData : urlData.file_url;
            if (fileUrl) {
                window.open(fileUrl, 'ReaderTab');
            } else {
                showToast('Content link is unavailable. Please contact support.', 'error');
            }
        } else {
            showToast('Content not found. Please contact support.', 'error');
        }
    } catch (error) {
        console.error('Secure URL fetch error:', error);
        showToast('Unable to load content. Please try again.', 'error');
    }

    if (arrow) {
        arrow.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>';
    }
}
