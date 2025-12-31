/**
 * Netflix-style Hero Banner for Jellyfin
 * Otimizado para carregamento rápido
 */

(function() {
    'use strict';

    const CONFIG = {
        rotationInterval: 10000,
        maxItems: 5,
        backdropQuality: '1920'
    };

    let currentIndex = 0;
    let heroItems = [];
    let rotationTimer = null;
    let progressTimer = null;
    let progressValue = 0;
    let isInitialized = false;
    let cachedItems = null;

    function waitForJellyfin() {
        return new Promise((resolve) => {
            if (window.ApiClient && window.ApiClient.getCurrentUserId()) {
                resolve();
                return;
            }
            const check = () => {
                if (window.ApiClient && window.ApiClient.getCurrentUserId()) {
                    resolve();
                } else {
                    setTimeout(check, 200);
                }
            };
            check();
        });
    }

    function preloadImage(url) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve(url);
            img.onerror = () => resolve(null);
            img.src = url;
        });
    }

    async function fetchHeroItems() {
        if (cachedItems && cachedItems.length > 0) {
            return cachedItems;
        }

        const userId = ApiClient.getCurrentUserId();

        try {
            const [movies, shows] = await Promise.all([
                ApiClient.getItems(userId, {
                    SortBy: 'DateCreated,SortName',
                    SortOrder: 'Descending',
                    IncludeItemTypes: 'Movie',
                    Recursive: true,
                    Fields: 'Overview,Genres,OfficialRating,ProductionYear,RunTimeTicks',
                    ImageTypeLimit: 1,
                    EnableImageTypes: 'Backdrop',
                    Limit: CONFIG.maxItems
                }),
                ApiClient.getItems(userId, {
                    SortBy: 'DateCreated,SortName',
                    SortOrder: 'Descending',
                    IncludeItemTypes: 'Series',
                    Recursive: true,
                    Fields: 'Overview,Genres,OfficialRating,ProductionYear',
                    ImageTypeLimit: 1,
                    EnableImageTypes: 'Backdrop',
                    Limit: CONFIG.maxItems
                })
            ]);

            const allItems = [...(movies.Items || []), ...(shows.Items || [])]
                .filter(item => item.BackdropImageTags && item.BackdropImageTags.length > 0)
                .slice(0, CONFIG.maxItems);

            cachedItems = allItems;
            return allItems;
        } catch (error) {
            console.error('Hero: Erro ao buscar itens:', error);
            return [];
        }
    }

    function getBackdropUrl(item) {
        if (!item.BackdropImageTags || !item.BackdropImageTags.length) return null;
        return `${ApiClient.serverAddress()}/Items/${item.Id}/Images/Backdrop/0?tag=${item.BackdropImageTags[0]}&maxWidth=${CONFIG.backdropQuality}&quality=90`;
    }

    function formatRuntime(ticks) {
        if (!ticks) return '';
        const minutes = Math.floor(ticks / 600000000);
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return hours > 0 ? `${hours}h ${mins}min` : `${mins}min`;
    }

    function createHeroHTML() {
        return `
            <div id="custom-hero">
                <div class="hero-backdrop"></div>
                <div class="hero-gradient"></div>
                <div class="hero-content">
                    <h1 class="hero-title"></h1>
                    <div class="hero-meta">
                        <span class="hero-year"></span>
                        <span class="hero-rating"></span>
                        <span class="hero-runtime"></span>
                        <span class="hero-genres"></span>
                    </div>
                    <p class="hero-description"></p>
                    <div class="hero-buttons">
                        <a class="hero-btn hero-btn-play" href="#">
                            <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                            <span>Assistir</span>
                        </a>
                        <a class="hero-btn hero-btn-info" href="#">
                            <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
                            <span>Mais Info</span>
                        </a>
                    </div>
                </div>
                <div class="hero-indicators"></div>
                <div class="hero-progress"></div>
            </div>
        `;
    }

    function restartAnimations() {
        const hero = document.getElementById('custom-hero');
        if (!hero) return;

        const elements = ['.hero-title', '.hero-meta', '.hero-description', '.hero-buttons'];
        elements.forEach(selector => {
            const el = hero.querySelector(selector);
            if (el) {
                el.style.animation = 'none';
                el.offsetHeight;
                el.style.animation = '';
            }
        });
    }

    function startProgressBar() {
        const progressBar = document.querySelector('#custom-hero .hero-progress');
        if (!progressBar) return;

        progressValue = 0;
        progressBar.style.width = '0%';

        if (progressTimer) clearInterval(progressTimer);

        const updateInterval = 100;
        const increment = 100 / (CONFIG.rotationInterval / updateInterval);

        progressTimer = setInterval(() => {
            progressValue += increment;
            progressBar.style.width = Math.min(progressValue, 100) + '%';
        }, updateInterval);
    }

    async function updateHero(item, isInitial = false) {
        const hero = document.getElementById('custom-hero');
        if (!hero || !item) return;

        const backdrop = hero.querySelector('.hero-backdrop');
        const title = hero.querySelector('.hero-title');
        const year = hero.querySelector('.hero-year');
        const rating = hero.querySelector('.hero-rating');
        const runtime = hero.querySelector('.hero-runtime');
        const genres = hero.querySelector('.hero-genres');
        const description = hero.querySelector('.hero-description');
        const playBtn = hero.querySelector('.hero-btn-play');
        const infoBtn = hero.querySelector('.hero-btn-info');

        title.textContent = item.Name;
        year.textContent = item.ProductionYear || '';
        rating.textContent = item.OfficialRating || '';
        rating.style.display = item.OfficialRating ? 'inline' : 'none';
        runtime.textContent = formatRuntime(item.RunTimeTicks);
        genres.textContent = item.Genres ? item.Genres.slice(0, 3).join(' • ') : '';
        description.textContent = item.Overview || '';

        const itemUrl = `#!/details?id=${item.Id}`;
        playBtn.href = itemUrl;
        infoBtn.href = itemUrl;

        playBtn.onclick = (e) => {
            e.preventDefault();
            window.location.hash = `!/details?id=${item.Id}`;
        };

        if (!isInitial) {
            restartAnimations();
        }

        const backdropUrl = getBackdropUrl(item);
        if (backdropUrl) {
            if (isInitial) {
                backdrop.style.backgroundImage = `url('${backdropUrl}')`;
                backdrop.style.opacity = '1';
            } else {
                backdrop.style.opacity = '0.3';
                await preloadImage(backdropUrl);
                backdrop.style.backgroundImage = `url('${backdropUrl}')`;
                backdrop.style.opacity = '1';
            }
        }

        updateIndicators();

        if (heroItems.length > 1) {
            startProgressBar();
        }
    }

    function updateIndicators() {
        const container = document.querySelector('#custom-hero .hero-indicators');
        if (!container) return;

        container.innerHTML = '';
        heroItems.forEach((_, index) => {
            const dot = document.createElement('div');
            dot.className = `hero-indicator${index === currentIndex ? ' active' : ''}`;
            dot.onclick = () => goToSlide(index);
            container.appendChild(dot);
        });
    }

    function goToSlide(index) {
        currentIndex = index;
        updateHero(heroItems[currentIndex]);
        resetRotationTimer();
    }

    function nextSlide() {
        currentIndex = (currentIndex + 1) % heroItems.length;
        updateHero(heroItems[currentIndex]);
    }

    function startRotation() {
        if (rotationTimer) clearInterval(rotationTimer);
        rotationTimer = setInterval(nextSlide, CONFIG.rotationInterval);
    }

    function resetRotationTimer() {
        startRotation();
    }

    function stopTimers() {
        if (rotationTimer) clearInterval(rotationTimer);
        if (progressTimer) clearInterval(progressTimer);
    }

    // Injeta o hero (com suporte a TV)
    function injectHero() {
        const existing = document.getElementById('custom-hero');
        if (existing) return true;

        // Seletores para desktop e TV
        const homeContainer = document.querySelector('.homeSectionsContainer') ||
                              document.querySelector('.view-home-sections') ||
                              document.querySelector('.skinBody');

        if (!homeContainer) return false;

        const heroDiv = document.createElement('div');
        heroDiv.innerHTML = createHeroHTML();
        homeContainer.parentNode.insertBefore(heroDiv.firstElementChild, homeContainer);

        return true;
    }

    // Verifica se está na home (desktop e TV)
    function isHomePage() {
        const hash = window.location.hash;
        return hash === '' ||
               hash === '#/' ||
               hash === '#/home' ||
               hash.includes('/home') ||
               hash.includes('home.html');
    }

    function toggleHeroVisibility() {
        const hero = document.getElementById('custom-hero');
        if (!hero) return;

        if (isHomePage()) {
            hero.style.display = 'block';
            if (heroItems.length > 1) startRotation();
        } else {
            hero.style.display = 'none';
            stopTimers();
        }
    }

    async function initHero() {
        if (!isHomePage()) return;

        await waitForJellyfin();

        heroItems = await fetchHeroItems();

        if (heroItems.length === 0) {
            console.log('Hero: Nenhum item com backdrop');
            return;
        }

        const firstBackdrop = getBackdropUrl(heroItems[0]);
        if (firstBackdrop) {
            await preloadImage(firstBackdrop);
        }

        if (injectHero()) {
            updateHero(heroItems[0], true);
            if (heroItems.length > 1) {
                startRotation();
                heroItems.slice(1).forEach(item => {
                    const url = getBackdropUrl(item);
                    if (url) preloadImage(url);
                });
            }
            isInitialized = true;
            console.log('Hero: Pronto com', heroItems.length, 'itens');
        }
    }

    function observePageChanges() {
        // Observa hashchange
        window.addEventListener('hashchange', () => {
            setTimeout(checkAndInitHero, 300);
        });

        // Observa mudanças no DOM (SPA navigation)
        const observer = new MutationObserver(() => {
            if (isHomePage() && !document.getElementById('custom-hero')) {
                const container = document.querySelector('.homeSectionsContainer');
                if (container) {
                    isInitialized = false;
                    initHero();
                }
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    function checkAndInitHero() {
        if (isHomePage()) {
            const heroExists = document.getElementById('custom-hero');
            if (!heroExists) {
                isInitialized = false;
                initHero();
            } else {
                toggleHeroVisibility();
            }
        } else {
            toggleHeroVisibility();
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            observePageChanges();
            initHero();
        });
    } else {
        observePageChanges();
        initHero();
    }

    // Verifica periodicamente se hero sumiu (fallback)
    setInterval(() => {
        if (isHomePage() && !document.getElementById('custom-hero')) {
            const container = document.querySelector('.homeSectionsContainer');
            if (container) {
                isInitialized = false;
                initHero();
            }
        }
    }, 2000);

})();
