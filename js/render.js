// ---------- SKELETON LOADERS ----------

function renderSkeletonCards(container, count = 4) {
    if (!container) return;
    container.innerHTML = Array(count)
        .fill('<div class="skeleton skeleton-card"></div>')
        .join('');
}

function renderSkeletonPills(container, count = 4) {
    if (!container) return;
    container.innerHTML = Array(count)
        .fill('<div class="skeleton skeleton-pill" style="margin-right:12px;"></div>')
        .join('');
}

// ---------- RENDER FUNCTIONS ----------

function renderSlider() {
    if (!state.sliders || state.sliders.length === 0) {
        document.getElementById('slider-container').innerHTML = `
            <div class="slider-card">
                <h2>Welcome to Abihani Express</h2>
                <p>Your perfect home for<br>leather works</p>
            </div>
        `;
        return;
    }

    const container = document.getElementById('slider-container');
    const current = state.sliders[0];

    container.innerHTML = `
        <div class="slider-card">
            <h2>${current.title}</h2>
            <p>${current.subtitle}</p>
        </div>
        <div class="slider-dots">
            ${state.sliders.map((_, i) => `<span class="dot ${i === 0 ? 'active' : ''}" onclick="window.setSlide(${i})"></span>`).join('')}
        </div>
    `;
}

function renderInfoSections() {
    const container = document.getElementById('info-sections');

    if (!state.siteSettings) {
        container.innerHTML = `
            <div class="info-card">
                <h4>Abihani Express</h4>
                <p>Your perfect home for leather works. We specialize in premium leather shoes, bags, and accessories.</p>
            </div>
            <div class="info-card">
                <h4>About Abihani Express</h4>
                <p>We are the first and No.1 online store in Yobe State specializing in everything leather works. Quality and durability is our promise.</p>
            </div>
            <div class="info-card">
                <h4>About Abihani Isa</h4>
                <p>A young entrepreneur with big dreams, popularly known for his novel chronicling his journey of love with Ummihani.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = `
        <!-- Top Section: Company Logo (Image Left, Text Right) -->
        <div class="section-left">
            <img src="${state.siteSettings.logo_url || 'https://placehold.co/200x200/8b4513/ffffff?text=Logo'}"
                 alt="Abihani Express Logo"
                 class="circle-image"
                 onerror="this.src='https://placehold.co/200x200/8b4513/ffffff?text=Logo'">
            <div class="text-content">
                <h3>${state.siteSettings.site_name || 'Abihani Express'}</h3>
                <p>Quality and Durability, Our Promise. Your perfect home for leather works.</p>
            </div>
        </div>

        <!-- Middle Section: About Company (Image Left, Text Right) -->
        <div class="section-left">
            <img src="${state.siteSettings.brand_image_url || 'https://placehold.co/200x200/8b4513/ffffff?text=Brand'}"
                 alt="Abihani Store"
                 class="circle-image"
                 onerror="this.src='https://placehold.co/200x200/8b4513/ffffff?text=Brand'">
            <div class="text-content">
                <h3>About ${state.siteSettings.site_name || 'Abihani Express'}</h3>
                <p>We are the first and leading online store in Yobe State specializing in everything leather works. Quality and durability is our promise.</p>
            </div>
        </div>

        <!-- Bottom Section: About CEO (Image Right, Text Left) -->
        <div class="section-right">
            <img src="${state.siteSettings.ceo_image_url || 'https://placehold.co/200x200/8b4513/ffffff?text=CEO'}"
                 alt="Abihani Isa"
                 class="circle-image"
                 onerror="this.src='https://placehold.co/200x200/8b4513/ffffff?text=CEO'">
            <div class="text-content">
                <h3>About Abihani Isa</h3>
                <p>A young entrepreneur with big dreams, popularly known for his novel chronicling his journey of love with Ummihani.</p>
            </div>
        </div>
    `;
}

function renderSocialLinks() {
    const container = document.getElementById('social-links');
    if (!container) return;

    const whatsapp = state.siteSettings?.contact_whatsapp || ENV.WHATSAPP_NUMBER;

    container.innerHTML = `
        <a href="https://wa.me/${whatsapp.replace('+', '')}" target="_blank"><i class="fab fa-whatsapp"></i></a>
        <a href="#"><i class="fab fa-facebook"></i></a>
        <a href="#"><i class="fab fa-instagram"></i></a>
        <a href="#"><i class="fab fa-twitter"></i></a>
    `;
}

function renderCategoriesHome() {
    const container = document.getElementById('categories-home');
    if (!container) return;

    if (!state.allCategories.length) {
        container.innerHTML = '<div class="category-pill">Loading...</div>';
        return;
    }

    container.innerHTML = state.allCategories.map(cat =>
        `<div class="category-pill" onclick="window.filterByCategory(${cat.id})">
            <i class="fas ${cat.icon}"></i> ${cat.name}
        </div>`
    ).join('');
}

function renderCategoriesFilter() {
    const container = document.getElementById('categories-filter');
    if (!container) return;

    if (!state.allCategories.length) {
        container.innerHTML = '<div class="category-pill">All</div>';
        return;
    }

    container.innerHTML = `<div class="category-pill active" onclick="window.filterAllProducts()">All</div>` +
        state.allCategories.map(cat =>
            `<div class="category-pill" onclick="window.filterByCategory(${cat.id})">
                <i class="fas ${cat.icon}"></i> ${cat.name}
            </div>`
        ).join('');
}

function renderFeaturedProducts(products) {
    const container = document.getElementById('featured-products');
    if (!container) return;

    if (!products.length) {
        container.innerHTML = '<div class="product-card">No products</div>';
        return;
    }

    container.innerHTML = products.map(p => productCardHTML(p)).join('');
}

function renderAllProducts(products) {
    const container = document.getElementById('all-products-grid');
    if (!container) return;

    if (!products.length) {
        container.innerHTML = '<p class="text-center">No products found</p>';
        return;
    }

    container.innerHTML = products.map(p => productCardHTML(p)).join('');
}

function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function productImageHTML(imageUrl, fallbackIcon, altText) {
    if (!imageUrl) return fallbackIcon || '📦';
    const safeAlt = escapeHtml(altText || '');
    const safeIcon = escapeHtml(fallbackIcon || '📦');
    return `<img src="${escapeHtml(imageUrl)}" alt="${safeAlt}" loading="lazy" onerror="this.style.display='none';this.parentElement.insertAdjacentText('afterbegin','${safeIcon}');">`;
}

function productCardHTML(p) {
    const imageContent = productImageHTML(p.image_url, p.image_icon, p.name);

    return `<div class="product-card" onclick="window.showProductDetail(${p.id})">
        <div class="product-image">${imageContent}</div>
        <h4>${escapeHtml(p.name)}</h4>
        <div class="product-price">₦${p.price?.toLocaleString() || '0'}</div>
        <div class="product-vendor"><i class="fas fa-store"></i> ${escapeHtml(p.vendor || 'Abihani Express')}</div>
        <button class="btn-wa-small" onclick="window.buyNow(${p.id}); event.stopPropagation();">
            <i class="fab fa-whatsapp"></i> Buy Now
        </button>
    </div>`;
}

async function showProductDetail(productId) {
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single();

    if (error || !data) return;

    const product = data;
    const container = document.getElementById('product-detail-container');

    const safeIcon = escapeHtml(product.image_icon || '📦');
    const detailImage = product.image_url
        ? `<img src="${escapeHtml(product.image_url)}" alt="${escapeHtml(product.name)}" style="width:100%;height:100%;object-fit:cover;border-radius:20px;" onerror="this.style.display='none';this.parentElement.insertAdjacentText('afterbegin','${safeIcon}');">`
        : safeIcon;

    container.innerHTML = `
        <div class="product-image" style="height: 250px; font-size: 80px;">${detailImage}</div>
        <h2 style="margin: 16px 0 4px;">${escapeHtml(product.name)}</h2>
        <div class="product-price" style="font-size: 28px;">₦${product.price?.toLocaleString() || '0'}</div>
        <div style="display: flex; gap: 12px; margin: 12px 0;">
            <span><i class="fas fa-star" style="color: #FFD700;"></i> ${product.rating || 0} (${product.review_count || 0})</span>
            <span><i class="fas fa-map-marker-alt"></i> ${product.vendor_location || 'Potiskum, Yobe State'}</span>
        </div>
        <div class="admin-card">
            <p>${product.description || 'No description available'}</p>
            <p style="margin-top: 12px;"><i class="fas fa-store"></i> ${product.vendor || 'Abihani Express'}</p>
        </div>
        <button class="wa-btn" onclick="window.buyNow(${product.id})">
            <i class="fab fa-whatsapp"></i> Buy Now via WhatsApp
        </button>
        <button class="btn-secondary" style="margin-top: 12px;" onclick="window.showPage('all-products')">← Back to Products</button>
    `;
    showPage('product-detail');
}
