// ---------- DATA LOADING FUNCTIONS ----------

async function loadSiteSettings() {
    console.log('Loading site settings...');
    const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .eq('id', 1)
        .single();

    if (error) {
        console.error('Error loading site settings:', error);
        return;
    }

    console.log('Site settings loaded:', data);
    state.siteSettings = data;
    state.sliders = data.sliders || [];

    document.querySelector('.footer-brand h4').textContent = data.site_name || 'Abihani Express';
    document.querySelector('.footer-brand p').textContent = data.slogan || 'MOM · DAD · UMMIHANI';
    document.getElementById('copyright').textContent = data.footer_text || '© 2026 Abihani Express';

    renderSlider();
    renderInfoSections();
    renderSocialLinks();
}

async function loadCategories() {
    const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('order');

    if (error) {
        console.error('Error loading categories:', error);
        return;
    }

    state.allCategories = data || [];
    renderCategoriesHome();
    renderCategoriesFilter();
}

async function loadFeaturedProducts() {
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('featured', true)
        .order('featured_order');

    if (error) {
        console.error('Error loading featured products:', error);
        return;
    }

    state.allProducts = data || [];
    renderFeaturedProducts(data || []);
}

async function loadAllProducts(categoryId = null) {
    let query = supabase.from('products').select('*');

    if (categoryId) {
        query = query.eq('category_id', categoryId);
    }

    const { data, error } = await query;

    if (error) {
        console.error('Error loading products:', error);
        return;
    }

    state.allProducts = data || [];
    renderAllProducts(data || []);
}
