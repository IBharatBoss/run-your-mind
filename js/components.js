// RUN YOUR MIND - Core Dynamic Layout & Editorial Features
let themeInitialized = false;
let fontInitialized = false;

function initLayout() {
    let prefix = "./";
    const isRoot = window.location.pathname.endsWith("/") || window.location.pathname.endsWith("index.html");
    const isSub = ["/mindset/", "/productivity/", "/survival/", "/wealthandskills/", "/policy/"].some(t => window.location.pathname.includes(t));
    if (!isRoot && isSub) {
        prefix = "../";
    }

    const headerHTML = `
        <header class="top-header ${prefix === "../" ? "editorial-header-flow" : ""}">
            ${prefix === "../" ? `
            <div class="header-left">
                <a href="${prefix}index.html" class="back-to-library" aria-label="Back to library">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                    <span class="back-text">Back to Library</span>
                </a>
            </div>` : ""}
            <div id="logo-container" class="logo-container">
                <img src="${prefix}logo.webp" alt="Run Your Mind" class="top-logo" id="top-logo" width="220" height="55" ${prefix === "../" ? 'style="width: 130px; min-width: 120px; margin: 0;"' : ""}>
                <div id="founder-card" class="founder-card">
                    <p>If you want to know your true character,<br>look at how you treat someone<br>who can do absolutely nothing for you.</p>
                </div>
                <button id="founder-close-btn" class="founder-close-btn" aria-label="Close founder quote">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
                </button>
            </div>
            
            ${prefix === "../" ? `
            <div class="header-right">
                <div class="reader-toolbar">
                    <div class="font-controls-group" title="Adjust text size">
                        <button id="font-decrease-btn" class="font-btn" aria-label="Decrease font size" title="Smaller text">A−</button>
                        <button id="font-increase-btn" class="font-btn" aria-label="Increase font size" title="Larger text">A+</button>
                    </div>
                    <span class="reader-toolbar-divider" aria-hidden="true"></span>
                    <button id="theme-toggle-btn" class="reader-tool-btn theme-toggle-btn" aria-label="Toggle dark mode" title="Toggle theme">
                        <span class="theme-icon-slot"></span>
                    </button>
                </div>
            </div>` : `
            <button id="theme-toggle-btn" class="header-theme-toggle" aria-label="Toggle dark mode" title="Toggle theme (T)">
                <span class="theme-icon-slot"></span>
            </button>
            <section class="auth-strip-shell">
                <button id="nav-auth-btn" class="auth-strip-btn auth-cta-btn">LOGIN / SIGNUP</button>
                <span id="user-greeting" class="hidden"></span>
                <span id="premium-badge" class="hidden"></span>

                <div id="profile-menu" class="profile-menu overlay-mask hidden">
                    <div class="profile-menu-shell">
                        <button id="close-profile-btn" class="close-profile-btn" aria-label="Close profile menu">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
                        </button>
                        <div id="profile-menu-content" class="profile-menu-content"></div>
                        <button id="profile-logout-btn" class="profile-logout-btn">Sign Out</button>
                    </div>
                </div>
            </section>`}
        </header>
    `;

    const footerHTML = `
        <footer class="app-footer">
            <details class="editorial-accordion">
                <summary class="accordion-header">THE MISSION & PHILOSOPHY</summary>
                <div class="accordion-content">
                    <h3>Our Mission: Cultivating Clarity</h3>
                    <p>In an era of noise and information overload, our mission is simple: To provide distilled, executable intellect for modern minds seeking rapid, high-quality growth without the fluff. We bridge the gap between theoretical knowledge and real-world execution, ensuring you spend less time reading and more time implementing.</p>

                    <h3>Frequently Asked Questions</h3>
                    <ul class="clean-bullet-list">
                        <li>
                            <strong>How does this platform differ from random internet articles?</strong>
                            <p>Internet articles are often written for engagement, not execution. Our library is curated and engineered. Every piece of content undergoes a rigorous distillation process to provide only the core actionable strategies.</p>
                        </li>
                        <li>
                            <strong>Is the one-time payment truly lifetime?</strong>
                            <p>Yes. We do not believe in subscription fatigue. Your one-time investment unlocks the entire repository, including all future updates and additions.</p>
                        </li>
                        <li>
                            <strong>Who creates this content?</strong>
                            <p>Our network consists of industry practitioners, specialized researchers, and veteran executors. Every guide is either written by or vetted by someone with real-world experience.</p>
                        </li>
                        <li>
                            <strong>What topics are covered?</strong>
                            <p>Our core focus is on self-improvement, education insights, AI-driven strategies, and high-performance mindset guides. The library continuously expands into new high-value areas.</p>
                        </li>
                    </ul>

                    <h3>Future Vision</h3>
                    <p>The vision of RUN YOUR MIND extends beyond a static library. We are building an ecosystem of disciplined execution:</p>
                    <ul class="clean-bullet-list">
                        <li><strong>AI-Powered Reading Paths:</strong> Custom-tailored content recommendations based on your goals.</li>
                        <li><strong>Printable Cheat Sheets:</strong> Ultra-condensed, single-page printable summaries for offline review.</li>
                        <li><strong>Specialized Guides:</strong> Expanding into niche high-value areas like advanced SaaS marketing and automation workflows.</li>
                        <li><strong>Community Insights:</strong> Allowing verified premium members to share execution insights directly on guide pages.</li>
                    </ul>

                    <h3>Design Philosophy</h3>
                    <ul class="clean-bullet-list">
                        <li><strong>Minimal User Friction:</strong> Technology should disappear; content should be front and center.</li>
                        <li><strong>High Information Density:</strong> Maximum value per minute spent reading.</li>
                        <li><strong>Data Security First:</strong> Session tokens and single-device access ensure your premium experience is protected.</li>
                    </ul>
                </div>
            </details>

            <div style="margin-top: 2.5rem; display: flex; flex-wrap: wrap; justify-content: center; gap: 1.5rem; font-family: var(--font-sans); font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em;">
                <a href="${prefix}policy/terms.html" target="ReaderTab" style="color: var(--ink-muted); text-decoration: none; transition: color 0.2s ease;" onmouseover="this.style.color='var(--ink)'" onmouseout="this.style.color='var(--ink-muted)'">Terms & Conditions</a>
                <a href="${prefix}policy/privacy.html" target="ReaderTab" style="color: var(--ink-muted); text-decoration: none; transition: color 0.2s ease;" onmouseover="this.style.color='var(--ink)'" onmouseout="this.style.color='var(--ink-muted)'">Privacy Policy</a>
                <a href="${prefix}policy/refund.html" target="ReaderTab" style="color: var(--ink-muted); text-decoration: none; transition: color 0.2s ease;" onmouseover="this.style.color='var(--ink)'" onmouseout="this.style.color='var(--ink-muted)'">Refund Policy</a>
                <a href="${prefix}policy/contact.html" target="ReaderTab" style="color: var(--ink-muted); text-decoration: none; transition: color 0.2s ease;" onmouseover="this.style.color='var(--ink)'" onmouseout="this.style.color='var(--ink-muted)'">Contact Us</a>
            </div>

            <div class="footer-credits">
                <p>© ${new Date().getFullYear()} RUN YOUR MIND · All rights reserved</p>
            </div>
        </footer>
    `;

    const oldHeader = document.querySelector("header.top-header");
    const oldFooter = document.querySelector("footer.app-footer");
    
    if (oldHeader) {
        oldHeader.outerHTML = headerHTML;
    } else {
        const shell = document.querySelector(".page-shell");
        if (shell) shell.insertAdjacentHTML("afterbegin", headerHTML);
    }

    if (oldFooter) {
        oldFooter.outerHTML = footerHTML;
    } else {
        const shell = document.querySelector(".page-shell");
        if (shell) shell.insertAdjacentHTML("beforeend", footerHTML);
    }

    // Initialize luxury reader systems
    initTheme();
    initFontSize();
    initReadingExperience(prefix);
    initQuoteSharing();
}

// 1. Theme Management (100% Reliable Dark Mode)
function initTheme() {
    const prefersDarkMedia = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
    
    function isDarkActive() {
        const custom = document.documentElement.getAttribute('data-theme');
        if (custom === 'dark') return true;
        if (custom === 'light') return false;
        return prefersDarkMedia ? prefersDarkMedia.matches : false;
    }

    function renderIcons() {
        const dark = isDarkActive();
        const slots = document.querySelectorAll('.theme-icon-slot');
        slots.forEach(slot => {
            slot.innerHTML = dark
                ? `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`
                : `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;
        });
    }

    const saved = localStorage.getItem('rym_theme');
    if (saved === 'dark' || saved === 'light') {
        document.documentElement.setAttribute('data-theme', saved);
    }
    renderIcons();

    if (prefersDarkMedia && !themeInitialized) {
        prefersDarkMedia.addEventListener('change', () => {
            if (!localStorage.getItem('rym_theme')) {
                renderIcons();
            }
        });
    }

    if (!themeInitialized) {
        document.addEventListener('click', (e) => {
            const btn = e.target.closest('#theme-toggle-btn');
            if (!btn) return;
            e.preventDefault();
            const darkNow = isDarkActive();
            const next = darkNow ? 'light' : 'dark';
            localStorage.setItem('rym_theme', next);
            document.documentElement.setAttribute('data-theme', next);
            renderIcons();
        });
        themeInitialized = true;
    }
}

// 2. Font Size Scaling
function initFontSize() {
    const SIZES = ['sm', 'md', 'lg', 'xl'];
    let current = localStorage.getItem('rym_font_size') || 'md';
    if (!SIZES.includes(current)) current = 'md';
    document.documentElement.setAttribute('data-font-size', current);

    if (!fontInitialized) {
        document.addEventListener('click', (e) => {
            if (e.target.closest('#font-increase-btn')) {
                e.preventDefault();
                const idx = SIZES.indexOf(current);
                if (idx < SIZES.length - 1) {
                    current = SIZES[idx + 1];
                    document.documentElement.setAttribute('data-font-size', current);
                    localStorage.setItem('rym_font_size', current);
                }
            }
            if (e.target.closest('#font-decrease-btn')) {
                e.preventDefault();
                const idx = SIZES.indexOf(current);
                if (idx > 0) {
                    current = SIZES[idx - 1];
                    document.documentElement.setAttribute('data-font-size', current);
                    localStorage.setItem('rym_font_size', current);
                }
            }
        });
        fontInitialized = true;
    }
}

// 3. Reading Progress Bar, Estimated Read Time & Author Card
function initReadingExperience(prefix = "./") {
    const article = document.querySelector('.editorial-article');
    if (!article) return;

    // A. Reading Progress Bar
    let bar = document.getElementById('reading-progress-bar');
    if (!bar) {
        bar = document.createElement('div');
        bar.id = 'reading-progress-bar';
        bar.className = 'reading-progress-bar';
        document.body.appendChild(bar);
    }

    function updateProgress() {
        const articleRect = article.getBoundingClientRect();
        const winHeight = window.innerHeight;
        const total = article.offsetHeight - winHeight;
        if (total <= 0) {
            bar.style.width = '0%';
            return;
        }
        const current = -articleRect.top;
        const pct = Math.min(100, Math.max(0, (current / total) * 100));
        bar.style.width = pct + '%';
    }

    window.addEventListener('scroll', () => {
        requestAnimationFrame(updateProgress);
    }, { passive: true });
    updateProgress();

    // B. Estimated Read Time Badge
    const content = article.querySelector('.article-content');
    const header = article.querySelector('.article-header');
    if (content && header && !header.querySelector('.read-time-pill')) {
        const words = (content.textContent || '').trim().split(/\s+/).filter(Boolean).length;
        const mins = Math.max(1, Math.ceil(words / 200));
        const metaStrip = document.createElement('div');
        metaStrip.className = 'article-meta-strip';
        metaStrip.innerHTML = `
            <span class="read-time-pill">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                ${mins} MIN READ
            </span>
        `;
        const lead = header.querySelector('.article-lead');
        if (lead) {
            header.insertBefore(metaStrip, lead);
        } else {
            header.appendChild(metaStrip);
        }
    }

    // C. Automatic Author Credit Card (Zero HTML duplication across articles)
    if (!article.querySelector('.author-credit')) {
        const authorHTML = `
            <div class="author-credit">
                <img src="${prefix}me.webp" alt="Bharat Kumar Patel" class="author-avatar" width="60" height="60" loading="lazy">
                <div class="author-details">
                    <span class="author-title">FOUNDER & AUTHOR</span>
                    <h4 class="author-name">Bharat Kumar Patel</h4>
                    <a href="mailto:ibbchoudhary@gmail.com" class="author-email">ibbchoudhary@gmail.com</a>
                </div>
            </div>
        `;
        article.insertAdjacentHTML('beforeend', authorHTML);
    }
}

// 4. Highlight & Shareable Quote Cards
function initQuoteSharing() {
    const article = document.querySelector('.editorial-article');
    if (!article) return;

    // A. Floating Popover on selection
    let popover = document.getElementById('quote-share-popover');
    if (!popover) {
        popover = document.createElement('div');
        popover.id = 'quote-share-popover';
        popover.className = 'quote-share-popover';
        popover.innerHTML = `
            <button id="popover-share-btn" class="popover-share-btn" type="button">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
                Share Quote
            </button>
        `;
        document.body.appendChild(popover);
    }

    // B. Quick Share Buttons on Blockquotes and Takeaway boxes
    article.querySelectorAll('.article-quote, .article-takeaway').forEach(block => {
        if (!block.querySelector('.quote-quick-share-btn')) {
            const btn = document.createElement('button');
            btn.className = 'quote-quick-share-btn';
            btn.type = 'button';
            btn.innerHTML = `
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
                Share as Card
            `;
            btn.addEventListener('click', (ev) => {
                ev.stopPropagation();
                const text = (block.textContent || '').replace('Share as Card', '').trim();
                openQuoteModal(text);
            });
            block.appendChild(btn);
        }
    });

    let selectedText = '';
    function checkSelection() {
        const sel = window.getSelection();
        if (!sel || sel.isCollapsed || !article.contains(sel.anchorNode)) {
            popover.classList.remove('is-visible');
            return;
        }
        const text = sel.toString().trim();
        if (text.length >= 10 && text.length <= 400) {
            selectedText = text;
            const range = sel.getRangeAt(0);
            const rect = range.getBoundingClientRect();
            popover.style.left = `${rect.left + rect.width / 2}px`;
            popover.style.top = `${rect.top + window.scrollY}px`;
            popover.classList.add('is-visible');
        } else {
            popover.classList.remove('is-visible');
        }
    }

    document.addEventListener('selectionchange', checkSelection);
    document.addEventListener('mouseup', checkSelection);
    document.addEventListener('touchend', checkSelection);

    popover.querySelector('#popover-share-btn').addEventListener('click', (e) => {
        e.preventDefault();
        popover.classList.remove('is-visible');
        if (selectedText) openQuoteModal(selectedText);
    });

    // C. Quote Card Modal
    let modal = document.getElementById('quote-card-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'quote-card-modal';
        modal.className = 'auth-modal overlay-mask hidden opacity-0';
        modal.innerHTML = `
            <div class="quote-modal-shell">
                <div class="quote-modal-head">
                    <h3 class="quote-modal-title">Share Quote Card</h3>
                    <button id="close-quote-modal-btn" class="icon-action" aria-label="Close modal">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
                    </button>
                </div>
                <div class="quote-card-preview" id="quote-card-preview">
                    <div class="quote-card-branding">
                        <span class="quote-brand-title">RUN YOUR MIND</span>
                        <span class="quote-brand-badge">EXECUTABLE INTELLECT</span>
                    </div>
                    <div class="quote-card-body">
                        <span class="quote-card-mark">“</span>
                        <p class="quote-card-text" id="quote-card-text"></p>
                    </div>
                    <div class="quote-card-footer">
                        <div class="quote-card-author">
                            <span class="quote-author-name">Bharat Kumar Patel</span>
                            <span class="quote-author-role">Founder · Run Your Mind</span>
                        </div>
                        <span class="quote-card-source" id="quote-card-source"></span>
                    </div>
                </div>
                <div class="quote-actions-row">
                    <button id="quote-copy-text-btn" class="quote-action-btn">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                        Copy Text
                    </button>
                    <button id="quote-download-btn" class="quote-action-btn btn-primary">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                        Download Image
                    </button>
                    <a id="quote-share-x-btn" target="_blank" rel="noopener noreferrer" class="quote-action-btn">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                        Share to X
                    </a>
                    <a id="quote-share-wa-btn" target="_blank" rel="noopener noreferrer" class="quote-action-btn">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z"/></svg>
                        WhatsApp
                    </a>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        modal.querySelector('#close-quote-modal-btn').addEventListener('click', closeQuoteModal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeQuoteModal();
        });
    }

    function openQuoteModal(quoteText) {
        const cleanQuote = quoteText.slice(0, 320);
        const title = document.querySelector('h1')?.textContent || document.title.split('|')[0].trim();
        const url = window.location.href;

        document.getElementById('quote-card-text').textContent = cleanQuote;
        document.getElementById('quote-card-source').textContent = title;

        const xText = `"${cleanQuote}"\n\n— via Run Your Mind\n${url}`;
        document.getElementById('quote-share-x-btn').href = `https://twitter.com/intent/tweet?text=${encodeURIComponent(xText)}`;

        const waText = `"${cleanQuote}"\n\nRead more at Run Your Mind: ${url}`;
        document.getElementById('quote-share-wa-btn').href = `https://api.whatsapp.com/send?text=${encodeURIComponent(waText)}`;

        document.getElementById('quote-copy-text-btn').onclick = async () => {
            try {
                await navigator.clipboard.writeText(`"${cleanQuote}"\n— Run Your Mind (${url})`);
                const toastMod = await import('./ui.js');
                toastMod.showToast('Quote copied to clipboard!', 'success');
            } catch {
                const toastMod = await import('./ui.js');
                toastMod.showToast('Quote copied!', 'info');
            }
        };

        document.getElementById('quote-download-btn').onclick = () => {
            generateQuoteCardImage(cleanQuote, title);
        };

        modal.classList.remove('hidden');
        requestAnimationFrame(() => modal.classList.remove('opacity-0'));
        document.body.style.overflow = 'hidden';
    }

    function closeQuoteModal() {
        modal.classList.add('opacity-0');
        setTimeout(() => {
            modal.classList.add('hidden');
            document.body.style.overflow = '';
        }, 220);
    }
}

// 5. Canvas High-Res Image Generator (1080x1080 Square Card)
function generateQuoteCardImage(quote, title) {
    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1080;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Dark obsidian gradient background
    const bg = ctx.createLinearGradient(0, 0, 1080, 1080);
    bg.addColorStop(0, '#15151A');
    bg.addColorStop(1, '#0C0C0F');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, 1080, 1080);

    // Subtle golden corner glow
    const glow = ctx.createRadialGradient(920, 160, 10, 920, 160, 480);
    glow.addColorStop(0, 'rgba(201, 168, 76, 0.16)');
    glow.addColorStop(1, 'rgba(201, 168, 76, 0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, 1080, 1080);

    // Outer & inner decorative borders
    ctx.strokeStyle = '#C9A84C';
    ctx.lineWidth = 3;
    ctx.strokeRect(50, 50, 980, 980);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;
    ctx.strokeRect(62, 62, 956, 956);

    // Top Branding
    ctx.fillStyle = '#C9A84C';
    ctx.font = '800 24px "Manrope", sans-serif';
    ctx.fillText('RUN YOUR MIND', 95, 128);

    ctx.fillStyle = '#8E8E98';
    ctx.font = '700 18px "Manrope", sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('EXECUTABLE INTELLECT', 985, 128);
    ctx.textAlign = 'left';

    // Divider Line
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.beginPath();
    ctx.moveTo(95, 158);
    ctx.lineTo(985, 158);
    ctx.stroke();

    // Large Quotation Mark
    ctx.fillStyle = '#C9A84C';
    ctx.font = 'italic 110px "Playfair Display", Georgia, serif';
    ctx.fillText('“', 95, 280);

    // Multiline Word Wrap for Quote
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'italic 38px "Playfair Display", Georgia, serif';
    const maxWidth = 880;
    const lineHeight = 58;
    const words = quote.split(' ');
    let line = '';
    let y = 350;

    for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth && n > 0) {
            ctx.fillText(line, 95, y);
            line = words[n] + ' ';
            y += lineHeight;
            if (y > 780) {
                line += '...';
                break;
            }
        } else {
            line = testLine;
        }
    }
    ctx.fillText(line, 95, y);

    // Bottom Divider Line
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.beginPath();
    ctx.moveTo(95, 885);
    ctx.lineTo(985, 885);
    ctx.stroke();

    // Author & Citation
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '800 24px "Manrope", sans-serif';
    ctx.fillText('Bharat Kumar Patel', 95, 930);

    ctx.fillStyle = '#9C9CA6';
    ctx.font = '600 18px "Manrope", sans-serif';
    ctx.fillText('Founder · Run Your Mind', 95, 960);

    ctx.fillStyle = '#C9A84C';
    ctx.font = '700 20px "Manrope", sans-serif';
    ctx.textAlign = 'right';
    const displayTitle = title.length > 36 ? title.slice(0, 33) + '...' : title;
    ctx.fillText(displayTitle, 985, 945);
    ctx.textAlign = 'left';

    try {
        const dataUrl = canvas.toDataURL('image/png');
        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = `run-your-mind-quote-${Date.now()}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        import('./ui.js').then(m => m.showToast('Quote Card downloaded successfully!', 'success'));
    } catch (err) {
        console.error('Image export error:', err);
        import('./ui.js').then(m => m.showToast('Unable to export image.', 'error'));
    }
}

export { initLayout };
