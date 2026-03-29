// ---------- SEARCH ----------

let searchDebounceTimer = null;

async function searchProducts() {
    const query = document.getElementById('search-input').value.toLowerCase().trim();
    const resultsDiv = document.getElementById('search-results');

    if (query === '') {
        clearTimeout(searchDebounceTimer);
        resultsDiv.innerHTML = '<p class="text-center" style="grid-column: 1 / -1; color: var(--text-muted);">Type to search products...</p>';
        return;
    }

    clearTimeout(searchDebounceTimer);
    searchDebounceTimer = setTimeout(async () => {
        const priceNum = parseInt(query);
        const isPrice = !isNaN(priceNum);

        let products = [];
        if (isPrice) {
            const { data } = await supabase
                .from('products')
                .select('*')
                .gte('price', priceNum)
                .lte('price', priceNum + 5000)
                .order('price');
            products = data || [];
        } else {
            const { data } = await supabase
                .from('products')
                .select('*')
                .ilike('name', `%${query}%`);
            products = data || [];
        }

        if (products.length === 0) {
            resultsDiv.innerHTML = '<p class="text-center" style="grid-column: 1 / -1;">No products found</p>';
        } else {
            resultsDiv.innerHTML = products.map(p => productCardHTML(p)).join('');
        }
    }, 300);
}

// ---------- FILTERS ----------
function filterByCategory(categoryId) {
    loadAllProducts(categoryId);
    document.querySelectorAll('#categories-filter .category-pill').forEach(p => p.classList.remove('active'));
    event.target.classList.add('active');
}

function filterAllProducts() {
    loadAllProducts();
    document.querySelectorAll('#categories-filter .category-pill').forEach(p => p.classList.remove('active'));
    document.querySelector('#categories-filter .category-pill:first-child').classList.add('active');
}
