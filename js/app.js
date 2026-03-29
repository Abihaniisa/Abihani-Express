// ---------- APP ENTRY POINT ----------

// Auth state listener
supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN') {
        const email = session?.user?.email;
        if (email === ENV.ADMIN_EMAIL) {
            state.isAdminLoggedIn = true;
            state.currentUser = session.user;
        }
    } else if (event === 'SIGNED_OUT') {
        state.isAdminLoggedIn = false;
        state.currentUser = null;
    }
});

// ---------- VERIFY DATABASE SCHEMA ----------
async function checkImageUrlColumn() {
    // Attempt a query that selects image_url — if the column is missing Supabase returns an error
    const { error } = await supabase
        .from('products')
        .select('image_url')
        .limit(1);

    if (error && error.message.includes('image_url')) {
        console.warn(
            'SETUP NEEDED: The "products" table is missing the "image_url" column.\n' +
            'Go to Supabase Dashboard > Table Editor > products table and add:\n' +
            '  Column name: image_url\n' +
            '  Type: text\n' +
            '  Nullable: yes\n' +
            'Without this column, product images will not be saved or displayed.'
        );
        state.imageUrlColumnExists = false;
    } else {
        state.imageUrlColumnExists = true;
    }
}

// ---------- INITIAL LOAD ----------
window.addEventListener('load', async () => {
    console.log('Page loaded, loading data...');

    // Show skeleton loaders while data loads
    document.getElementById('slider-container').innerHTML = '<div class="skeleton skeleton-slider"></div>';
    renderSkeletonPills(document.getElementById('categories-home'), 5);
    renderSkeletonCards(document.getElementById('featured-products'), 4);

    await checkImageUrlColumn();
    await loadSiteSettings();
    await loadCategories();
    await loadFeaturedProducts();
    checkHash();

    if (state.sliders.length > 0) {
        setInterval(() => {
            state.currentSlide = (state.currentSlide + 1) % state.sliders.length;
            updateSlider(state.currentSlide);
        }, 5000);
    }
});

// ---------- EXPOSE FUNCTIONS TO INLINE HANDLERS ----------

// Navigation
window.showPage = showPage;

// Search & filters
window.searchProducts = searchProducts;
window.filterByCategory = filterByCategory;
window.filterAllProducts = filterAllProducts;

// Slider & theme
window.setSlide = setSlide;
window.toggleTheme = toggleTheme;

// Purchase
window.buyNow = buyNow;

// Auth
window.adminLogin = adminLogin;
window.logoutAdmin = logoutAdmin;

// Utilities
window.showUnavailable = showUnavailable;
window.submitFeedback = submitFeedback;
window.showToast = showToast;

// Product detail
window.showProductDetail = showProductDetail;

// Admin modal
window.closeModal = closeModal;

// Admin - Categories
window.showAddCategory = showAddCategory;
window.saveCategory = saveCategory;
window.editCategory = editCategory;
window.updateCategory = updateCategory;
window.deleteCategory = deleteCategory;

// Admin - Subcategories
window.showAddSubcategory = showAddSubcategory;
window.saveSubcategory = saveSubcategory;
window.editSubcategory = editSubcategory;
window.updateSubcategory = updateSubcategory;
window.deleteSubcategory = deleteSubcategory;

// Admin - Products
window.showAddProduct = showAddProduct;
window.saveProduct = saveProduct;
window.editProduct = editProduct;
window.updateProduct = updateProduct;
window.deleteProduct = deleteProduct;
