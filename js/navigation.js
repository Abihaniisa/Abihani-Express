// ---------- PAGE NAVIGATION ----------

function showPage(pageName) {
    window.scrollTo(0, 0);

    document.querySelectorAll('.page-section').forEach(section => {
        section.classList.remove('active-page');
    });

    if (pageName === 'home') {
        document.getElementById('home-page').classList.add('active-page');
    } else if (pageName === 'all-products') {
        document.getElementById('products-page').classList.add('active-page');
        loadAllProducts();
    } else if (pageName === 'product-detail') {
        document.getElementById('product-detail-page').classList.add('active-page');
    } else if (pageName === 'search') {
        document.getElementById('search-page').classList.add('active-page');
        document.getElementById('search-results').innerHTML = '';
        document.getElementById('search-input').value = '';
    } else if (pageName === 'admin-login') {
        document.getElementById('admin-login-page').classList.add('active-page');
    } else if (pageName === 'admin-dashboard' && state.isAdminLoggedIn) {
        document.getElementById('admin-dashboard-page').classList.add('active-page');
        renderAdminPanels();
    } else if (pageName === 'about') {
        document.getElementById('about-page').classList.add('active-page');
    } else if (pageName === 'terms') {
        document.getElementById('terms-page').classList.add('active-page');
    } else if (pageName === 'privacy') {
        document.getElementById('privacy-page').classList.add('active-page');
    } else if (pageName === 'contact') {
        document.getElementById('contact-page').classList.add('active-page');
    } else if (pageName === 'profile') {
        if (state.isAdminLoggedIn) {
            showPage('admin-dashboard');
        } else {
            document.getElementById('admin-login-page').classList.add('active-page');
        }
    }

    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    if (pageName === 'home') document.getElementById('nav-home').classList.add('active');
    else if (pageName === 'all-products' || pageName === 'product-detail') document.getElementById('nav-shop').classList.add('active');
    else if (pageName === 'search') document.getElementById('nav-search').classList.add('active');
    else if (pageName === 'profile' || pageName === 'admin-login' || pageName === 'admin-dashboard') document.getElementById('nav-profile').classList.add('active');
}

function checkHash() {
    if (window.location.hash === '#admin') {
        showPage('admin-login');
    }
}
