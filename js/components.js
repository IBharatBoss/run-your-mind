export function initLayout() {
    let rootPath = './';
    const isRootUrl = window.location.pathname.endsWith('/') || window.location.pathname.endsWith('index.html');

    // Naye folders ke liye logic update: 
    // Agar URL mein inme se koi bhi folder hai, toh rootPath '../' ho jayega
    const subFolders = ['/mindset/', '/productivity/', '/survival/', '/wealthandskills/', '/policy/'];

    const isSubPage = subFolders.some(folder => window.location.pathname.includes(folder));

    if (!isRootUrl && isSubPage) {
        rootPath = '../';
    }

    const headerHTML = `
        <header class="top-header ${rootPath === '../' ? 'editorial-header-flow' : ''}">
            ${rootPath === '../' ? `
            <div class="header-left">
                <a href="${rootPath}index.html" class="back-to-library">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                    <span class="back-text">Back to Library</span>
                </a>
            </div>` : ''}
            <div id="logo-container" class="logo-container">
                <img src="${rootPath}logo.png" onerror="this.onerror=null;this.src='${rootPath}run-your-mind.png';" alt="Run Your Mind" class="top-logo" id="top-logo" width="220" height="55" ${rootPath === '../' ? 'style="width: 130px; min-width: 120px; margin: 0;"' : ''}>
                <img id="founder-img" src="${rootPath}me.png" alt="Founder" width="380" height="380" loading="lazy" ${rootPath === '../' ? 'onerror="this.src=\'https://via.placeholder.com/60\';"' : ''}>
                <button id="founder-close-btn" class="founder-close-btn" aria-label="Close image">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
                </button>
            </div>
            ${rootPath === '../' ? '<div class="header-right"></div>' : ''}
            
            ${rootPath === './' ? `
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
            </section>
            ` : ''}
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
                <a href="${rootPath}policy/terms.html" target="ReaderTab" style="color: var(--ink-muted); text-decoration: none; transition: color 0.2s ease;" onmouseover="this.style.color='var(--ink)'" onmouseout="this.style.color='var(--ink-muted)'">Terms & Conditions</a>
                <a href="${rootPath}policy/privacy.html" target="ReaderTab" style="color: var(--ink-muted); text-decoration: none; transition: color 0.2s ease;" onmouseover="this.style.color='var(--ink)'" onmouseout="this.style.color='var(--ink-muted)'">Privacy Policy</a>
                <a href="${rootPath}policy/refund.html" target="ReaderTab" style="color: var(--ink-muted); text-decoration: none; transition: color 0.2s ease;" onmouseover="this.style.color='var(--ink)'" onmouseout="this.style.color='var(--ink-muted)'">Refund Policy</a>
                <a href="${rootPath}policy/contact.html" target="ReaderTab" style="color: var(--ink-muted); text-decoration: none; transition: color 0.2s ease;" onmouseover="this.style.color='var(--ink)'" onmouseout="this.style.color='var(--ink-muted)'">Contact Us</a>
            </div>

            <div class="footer-credits">
                <p>© ${new Date().getFullYear()} RUN YOUR MIND · All rights reserved</p>
            </div>
        </footer>
    `;

    const existingHeader = document.querySelector('header.top-header');
    const existingFooter = document.querySelector('footer.app-footer');

    if (existingHeader) {
        existingHeader.outerHTML = headerHTML;
    } else {
        const pageShell = document.querySelector('.page-shell');
        if (pageShell) {
            pageShell.insertAdjacentHTML('afterbegin', headerHTML);
        }
    }

    if (existingFooter) {
        existingFooter.outerHTML = footerHTML;
    } else {
        const pageShell = document.querySelector('.page-shell');
        if (pageShell) {
            pageShell.insertAdjacentHTML('beforeend', footerHTML);
        }
    }
}