// ---------- ADMIN FUNCTIONS ----------

async function adminLogin() {
    const email = document.getElementById('admin-email').value;
    const password = document.getElementById('admin-password').value;

    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password
        });

        if (error) throw error;

        const { data: adminData, error: adminError } = await supabase
            .from('admins')
            .select('*')
            .eq('email', email)
            .single();

        if (adminError || !adminData) {
            alert('You do not have admin privileges');
            await supabase.auth.signOut();
            return;
        }

        state.isAdminLoggedIn = true;
        state.currentUser = data.user;
        showPage('admin-dashboard');
    } catch (error) {
        alert('Login failed: ' + error.message);
    }
}

async function logoutAdmin() {
    await supabase.auth.signOut();
    state.isAdminLoggedIn = false;
    state.currentUser = null;
    showPage('home');
}

async function renderAdminPanels() {
    const { data: categories } = await supabase
        .from('categories')
        .select('*')
        .order('order');

    document.getElementById('admin-categories-list').innerHTML = categories?.map(c => `
        <div class="admin-item">
            <span><i class="fas ${c.icon}"></i> ${c.name}</span>
            <span class="admin-actions">
                <i class="fas fa-edit" onclick="window.editCategory(${c.id})"></i>
                <i class="fas fa-trash" onclick="window.deleteCategory(${c.id})"></i>
            </span>
        </div>
    `).join('') || '<p>No categories</p>';

    const { data: subcategories } = await supabase
        .from('subcategories')
        .select('*, categories(name)');

    document.getElementById('admin-subcategories-list').innerHTML = subcategories?.map(s => `
        <div class="admin-item">
            <span>${s.name} (${s.categories?.name || 'Unknown'})</span>
            <span class="admin-actions">
                <i class="fas fa-edit" onclick="window.editSubcategory(${s.id})"></i>
                <i class="fas fa-trash" onclick="window.deleteSubcategory(${s.id})"></i>
            </span>
        </div>
    `).join('') || '<p>No subcategories</p>';

    const { data: products } = await supabase
        .from('products')
        .select('*')
        .order('id');

    document.getElementById('admin-products-list').innerHTML = products?.map(p => `
        <div class="admin-item">
            <span>${p.image_url ? '<img src="' + p.image_url + '" style="width:28px;height:28px;border-radius:6px;object-fit:cover;vertical-align:middle;margin-right:6px;">' : (p.image_icon || '📦')} ${p.name} - ₦${p.price}</span>
            <span class="admin-actions">
                <i class="fas fa-edit" onclick="window.editProduct(${p.id})"></i>
                <i class="fas fa-trash" onclick="window.deleteProduct(${p.id})"></i>
            </span>
        </div>
    `).join('') || '<p>No products</p>';
}

// ---------- MODAL HELPERS ----------

function openModal(html) {
    document.getElementById('admin-modal-content').innerHTML = html;
    document.getElementById('admin-modal').classList.add('active');
}

function closeModal() {
    document.getElementById('admin-modal').classList.remove('active');
    document.getElementById('admin-modal-content').innerHTML = '';
}

// Close modal on overlay click
document.addEventListener('click', (e) => {
    if (e.target.id === 'admin-modal') {
        closeModal();
    }
});

// ---------- IMAGE UPLOAD ----------

const STORAGE_BUCKET = 'images';

async function ensureStorageBucket() {
    // Check if bucket exists by trying to list files
    const { error } = await supabase.storage.from(STORAGE_BUCKET).list('', { limit: 1 });

    if (error) {
        // Try to create the bucket
        const { error: createError } = await supabase.storage.createBucket(STORAGE_BUCKET, {
            public: true,
            allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
            fileSizeLimit: 5 * 1024 * 1024
        });

        if (createError) {
            console.error('Bucket creation failed:', createError);
            throw new Error(
                'Storage bucket "' + STORAGE_BUCKET + '" does not exist and could not be created automatically.\n\n' +
                'Please go to your Supabase Dashboard > Storage and:\n' +
                '1. Create a new bucket named "' + STORAGE_BUCKET + '"\n' +
                '2. Make it a PUBLIC bucket\n' +
                '3. Add a policy allowing authenticated users to upload (INSERT)\n' +
                '4. Add a policy allowing anyone to view (SELECT)'
            );
        }
    }
}

async function uploadImage(file, folder) {
    // Ensure bucket exists before attempting upload
    await ensureStorageBucket();

    const fileExt = file.name.split('.').pop().toLowerCase();
    const fileName = `${folder}/${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;

    const { data, error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false
        });

    if (error) {
        console.error('Upload error:', error);

        if (error.message.includes('security') || error.message.includes('policy') || error.message.includes('RLS')) {
            throw new Error(
                'Upload blocked by storage policy.\n\n' +
                'In Supabase Dashboard > Storage > "' + STORAGE_BUCKET + '" bucket > Policies:\n' +
                '- Add INSERT policy for "authenticated" role\n' +
                '- Add SELECT policy for "anon" role (public reads)'
            );
        }

        throw new Error('Image upload failed: ' + error.message);
    }

    const { data: urlData } = supabase.storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(fileName);

    return urlData.publicUrl;
}

function handleImagePreview(inputId, previewId) {
    const input = document.getElementById(inputId);
    const preview = document.getElementById(previewId);
    if (!input || !preview) return;

    input.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            alert('Please select an image file');
            input.value = '';
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            alert('Image must be under 5MB');
            input.value = '';
            return;
        }

        const reader = new FileReader();
        reader.onload = (ev) => {
            preview.innerHTML = `<img src="${ev.target.result}" alt="Preview">`;
        };
        reader.readAsDataURL(file);
    });
}

// ---------- CATEGORY CRUD ----------

function showAddCategory() {
    openModal(`
        <h3>Add Category</h3>
        <label>Category Name</label>
        <input type="text" id="modal-cat-name" class="admin-input" placeholder="e.g. Shoes">
        <label>Icon (Font Awesome class)</label>
        <input type="text" id="modal-cat-icon" class="admin-input" placeholder="e.g. fa-shoe-prints">
        <label>Sort Order</label>
        <input type="number" id="modal-cat-order" class="admin-input" placeholder="1" value="0">
        <div class="modal-actions">
            <button class="btn-secondary" onclick="window.closeModal()">Cancel</button>
            <button class="btn-primary" onclick="window.saveCategory()">Save</button>
        </div>
    `);
}

async function saveCategory() {
    const name = document.getElementById('modal-cat-name').value.trim();
    const icon = document.getElementById('modal-cat-icon').value.trim();
    const order = parseInt(document.getElementById('modal-cat-order').value) || 0;

    if (!name) { alert('Please enter a name'); return; }

    const btn = document.querySelector('#admin-modal .btn-primary');
    btn.innerHTML = '<span class="upload-spinner"></span> Saving...';
    btn.disabled = true;

    try {
        const { error } = await supabase
            .from('categories')
            .insert([{ name, icon, order }]);

        if (error) throw error;

        closeModal();
        await renderAdminPanels();
        await loadCategories();
    } catch (err) {
        alert('Error: ' + err.message);
    } finally {
        btn.innerHTML = 'Save';
        btn.disabled = false;
    }
}

async function editCategory(id) {
    const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('id', id)
        .single();

    if (error || !data) { alert('Category not found'); return; }

    openModal(`
        <h3>Edit Category</h3>
        <label>Category Name</label>
        <input type="text" id="modal-cat-name" class="admin-input" value="${data.name || ''}">
        <label>Icon (Font Awesome class)</label>
        <input type="text" id="modal-cat-icon" class="admin-input" value="${data.icon || ''}">
        <label>Sort Order</label>
        <input type="number" id="modal-cat-order" class="admin-input" value="${data.order || 0}">
        <div class="modal-actions">
            <button class="btn-secondary" onclick="window.closeModal()">Cancel</button>
            <button class="btn-primary" onclick="window.updateCategory(${id})">Update</button>
        </div>
    `);
}

async function updateCategory(id) {
    const name = document.getElementById('modal-cat-name').value.trim();
    const icon = document.getElementById('modal-cat-icon').value.trim();
    const order = parseInt(document.getElementById('modal-cat-order').value) || 0;

    if (!name) { alert('Please enter a name'); return; }

    const btn = document.querySelector('#admin-modal .btn-primary');
    btn.innerHTML = '<span class="upload-spinner"></span> Updating...';
    btn.disabled = true;

    try {
        const { error } = await supabase
            .from('categories')
            .update({ name, icon, order })
            .eq('id', id);

        if (error) throw error;

        closeModal();
        await renderAdminPanels();
        await loadCategories();
    } catch (err) {
        alert('Error: ' + err.message);
    } finally {
        btn.innerHTML = 'Update';
        btn.disabled = false;
    }
}

async function deleteCategory(id) {
    if (!confirm('Delete this category? Products in it may become uncategorized.')) return;

    try {
        const { error } = await supabase
            .from('categories')
            .delete()
            .eq('id', id);

        if (error) throw error;

        await renderAdminPanels();
        await loadCategories();
    } catch (err) {
        alert('Error: ' + err.message);
    }
}

// ---------- SUBCATEGORY CRUD ----------

async function showAddSubcategory() {
    const { data: categories } = await supabase
        .from('categories')
        .select('*')
        .order('order');

    const options = (categories || []).map(c =>
        `<option value="${c.id}">${c.name}</option>`
    ).join('');

    openModal(`
        <h3>Add Subcategory</h3>
        <label>Parent Category</label>
        <select id="modal-subcat-parent" class="admin-input">
            <option value="">Select category...</option>
            ${options}
        </select>
        <label>Subcategory Name</label>
        <input type="text" id="modal-subcat-name" class="admin-input" placeholder="e.g. Sneakers">
        <div class="modal-actions">
            <button class="btn-secondary" onclick="window.closeModal()">Cancel</button>
            <button class="btn-primary" onclick="window.saveSubcategory()">Save</button>
        </div>
    `);
}

async function saveSubcategory() {
    const name = document.getElementById('modal-subcat-name').value.trim();
    const category_id = document.getElementById('modal-subcat-parent').value;

    if (!name) { alert('Please enter a name'); return; }
    if (!category_id) { alert('Please select a category'); return; }

    const btn = document.querySelector('#admin-modal .btn-primary');
    btn.innerHTML = '<span class="upload-spinner"></span> Saving...';
    btn.disabled = true;

    try {
        const { error } = await supabase
            .from('subcategories')
            .insert([{ name, category_id: parseInt(category_id) }]);

        if (error) throw error;

        closeModal();
        await renderAdminPanels();
    } catch (err) {
        alert('Error: ' + err.message);
    } finally {
        btn.innerHTML = 'Save';
        btn.disabled = false;
    }
}

async function editSubcategory(id) {
    const { data, error } = await supabase
        .from('subcategories')
        .select('*')
        .eq('id', id)
        .single();

    if (error || !data) { alert('Subcategory not found'); return; }

    const { data: categories } = await supabase
        .from('categories')
        .select('*')
        .order('order');

    const options = (categories || []).map(c =>
        `<option value="${c.id}" ${c.id === data.category_id ? 'selected' : ''}>${c.name}</option>`
    ).join('');

    openModal(`
        <h3>Edit Subcategory</h3>
        <label>Parent Category</label>
        <select id="modal-subcat-parent" class="admin-input">
            ${options}
        </select>
        <label>Subcategory Name</label>
        <input type="text" id="modal-subcat-name" class="admin-input" value="${data.name || ''}">
        <div class="modal-actions">
            <button class="btn-secondary" onclick="window.closeModal()">Cancel</button>
            <button class="btn-primary" onclick="window.updateSubcategory(${id})">Update</button>
        </div>
    `);
}

async function updateSubcategory(id) {
    const name = document.getElementById('modal-subcat-name').value.trim();
    const category_id = document.getElementById('modal-subcat-parent').value;

    if (!name) { alert('Please enter a name'); return; }

    const btn = document.querySelector('#admin-modal .btn-primary');
    btn.innerHTML = '<span class="upload-spinner"></span> Updating...';
    btn.disabled = true;

    try {
        const { error } = await supabase
            .from('subcategories')
            .update({ name, category_id: parseInt(category_id) })
            .eq('id', id);

        if (error) throw error;

        closeModal();
        await renderAdminPanels();
    } catch (err) {
        alert('Error: ' + err.message);
    } finally {
        btn.innerHTML = 'Update';
        btn.disabled = false;
    }
}

async function deleteSubcategory(id) {
    if (!confirm('Delete this subcategory?')) return;

    try {
        const { error } = await supabase
            .from('subcategories')
            .delete()
            .eq('id', id);

        if (error) throw error;

        await renderAdminPanels();
    } catch (err) {
        alert('Error: ' + err.message);
    }
}

// ---------- PRODUCT CRUD ----------

async function showAddProduct() {
    const { data: categories } = await supabase
        .from('categories')
        .select('*')
        .order('order');

    const catOptions = (categories || []).map(c =>
        `<option value="${c.id}">${c.name}</option>`
    ).join('');

    openModal(`
        <h3>Add Product</h3>
        <label>Product Image</label>
        <div class="image-upload-area" id="modal-prod-upload-area">
            <input type="file" id="modal-prod-image" accept="image/*">
            <div id="modal-prod-preview">
                <i class="fas fa-cloud-upload-alt"></i>
                <p>Tap here to upload product photo</p>
                <span style="font-size:11px;color:var(--text-muted);margin-top:4px;display:block;">JPEG, PNG, GIF, WebP — max 5MB</span>
            </div>
        </div>
        <label>Product Name</label>
        <input type="text" id="modal-prod-name" class="admin-input" placeholder="e.g. Classic Leather Shoe">
        <label>Price (₦)</label>
        <input type="number" id="modal-prod-price" class="admin-input" placeholder="15000">
        <label>Category</label>
        <select id="modal-prod-category" class="admin-input">
            <option value="">Select category...</option>
            ${catOptions}
        </select>
        <label>Vendor</label>
        <input type="text" id="modal-prod-vendor" class="admin-input" placeholder="Abihani Express" value="Abihani Express">
        <label>Description</label>
        <textarea id="modal-prod-desc" class="admin-input" placeholder="Product description..."></textarea>
        <label>Emoji Icon (fallback if no image)</label>
        <input type="text" id="modal-prod-icon" class="admin-input" placeholder="👞" value="📦">
        <label><input type="checkbox" id="modal-prod-featured"> Featured product</label>
        <div class="modal-actions">
            <button class="btn-secondary" onclick="window.closeModal()">Cancel</button>
            <button class="btn-primary" onclick="window.saveProduct()">Save</button>
        </div>
    `);

    handleImagePreview('modal-prod-image', 'modal-prod-preview');
}

async function saveProduct() {
    const name = document.getElementById('modal-prod-name').value.trim();
    const price = parseInt(document.getElementById('modal-prod-price').value);
    const category_id = document.getElementById('modal-prod-category').value;
    const vendor = document.getElementById('modal-prod-vendor').value.trim();
    const description = document.getElementById('modal-prod-desc').value.trim();
    const image_icon = document.getElementById('modal-prod-icon').value.trim();
    const featured = document.getElementById('modal-prod-featured').checked;
    const imageFile = document.getElementById('modal-prod-image').files[0];

    if (!name) { alert('Please enter a product name'); return; }
    if (!price || price <= 0) { alert('Please enter a valid price'); return; }

    if (imageFile && !state.imageUrlColumnExists) {
        alert(
            'Cannot save product image yet.\n\n' +
            'The "products" table is missing the "image_url" column.\n' +
            'Go to Supabase Dashboard > Table Editor > products and add:\n' +
            '  Column: image_url, Type: text, Nullable: yes\n\n' +
            'Then reload this page and try again.'
        );
        return;
    }

    const btn = document.querySelector('#admin-modal .btn-primary');
    btn.innerHTML = '<span class="upload-spinner"></span> Saving...';
    btn.disabled = true;

    try {
        let image_url = null;
        if (imageFile) {
            image_url = await uploadImage(imageFile, 'products');
        }

        const productData = {
            name,
            price,
            vendor: vendor || 'Abihani Express',
            description,
            image_icon: image_icon || '📦',
            featured
        };

        if (category_id) productData.category_id = parseInt(category_id);
        if (image_url) productData.image_url = image_url;

        const { error } = await supabase
            .from('products')
            .insert([productData]);

        if (error) throw error;

        closeModal();
        await renderAdminPanels();
        await loadFeaturedProducts();
    } catch (err) {
        alert('Error: ' + err.message);
    } finally {
        btn.innerHTML = 'Save';
        btn.disabled = false;
    }
}

async function editProduct(id) {
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

    if (error || !data) { alert('Product not found'); return; }

    const { data: categories } = await supabase
        .from('categories')
        .select('*')
        .order('order');

    const catOptions = (categories || []).map(c =>
        `<option value="${c.id}" ${c.id === data.category_id ? 'selected' : ''}>${c.name}</option>`
    ).join('');

    const currentImage = data.image_url
        ? `<img src="${data.image_url}" alt="Current">`
        : `<i class="fas fa-cloud-upload-alt"></i><p>Click or drag to upload image</p>`;

    openModal(`
        <h3>Edit Product</h3>
        <label>Product Image</label>
        <div class="image-upload-area" id="modal-prod-upload-area">
            <input type="file" id="modal-prod-image" accept="image/*">
            <div id="modal-prod-preview">
                ${currentImage}
                ${data.image_url ? '' : '<span style="font-size:11px;color:var(--text-muted);margin-top:4px;display:block;">Tap to upload a photo</span>'}
            </div>
        </div>
        <label>Product Name</label>
        <input type="text" id="modal-prod-name" class="admin-input" value="${data.name || ''}">
        <label>Price (₦)</label>
        <input type="number" id="modal-prod-price" class="admin-input" value="${data.price || ''}">
        <label>Category</label>
        <select id="modal-prod-category" class="admin-input">
            <option value="">No category</option>
            ${catOptions}
        </select>
        <label>Vendor</label>
        <input type="text" id="modal-prod-vendor" class="admin-input" value="${data.vendor || 'Abihani Express'}">
        <label>Description</label>
        <textarea id="modal-prod-desc" class="admin-input">${data.description || ''}</textarea>
        <label>Emoji Icon (fallback if no image)</label>
        <input type="text" id="modal-prod-icon" class="admin-input" value="${data.image_icon || '📦'}">
        <label><input type="checkbox" id="modal-prod-featured" ${data.featured ? 'checked' : ''}> Featured product</label>
        <div class="modal-actions">
            <button class="btn-secondary" onclick="window.closeModal()">Cancel</button>
            <button class="btn-primary" onclick="window.updateProduct(${id})">Update</button>
        </div>
    `);

    handleImagePreview('modal-prod-image', 'modal-prod-preview');
}

async function updateProduct(id) {
    const name = document.getElementById('modal-prod-name').value.trim();
    const price = parseInt(document.getElementById('modal-prod-price').value);
    const category_id = document.getElementById('modal-prod-category').value;
    const vendor = document.getElementById('modal-prod-vendor').value.trim();
    const description = document.getElementById('modal-prod-desc').value.trim();
    const image_icon = document.getElementById('modal-prod-icon').value.trim();
    const featured = document.getElementById('modal-prod-featured').checked;
    const imageFile = document.getElementById('modal-prod-image').files[0];

    if (!name) { alert('Please enter a product name'); return; }
    if (!price || price <= 0) { alert('Please enter a valid price'); return; }

    if (imageFile && !state.imageUrlColumnExists) {
        alert(
            'Cannot save product image yet.\n\n' +
            'The "products" table is missing the "image_url" column.\n' +
            'Go to Supabase Dashboard > Table Editor > products and add:\n' +
            '  Column: image_url, Type: text, Nullable: yes\n\n' +
            'Then reload this page and try again.'
        );
        return;
    }

    const btn = document.querySelector('#admin-modal .btn-primary');
    btn.innerHTML = '<span class="upload-spinner"></span> Updating...';
    btn.disabled = true;

    try {
        let image_url = undefined;
        if (imageFile) {
            image_url = await uploadImage(imageFile, 'products');
        }

        const productData = {
            name,
            price,
            vendor: vendor || 'Abihani Express',
            description,
            image_icon: image_icon || '📦',
            featured
        };

        if (category_id) {
            productData.category_id = parseInt(category_id);
        } else {
            productData.category_id = null;
        }

        if (image_url !== undefined) {
            productData.image_url = image_url;
        }

        const { error } = await supabase
            .from('products')
            .update(productData)
            .eq('id', id);

        if (error) throw error;

        closeModal();
        await renderAdminPanels();
        await loadFeaturedProducts();
    } catch (err) {
        alert('Error: ' + err.message);
    } finally {
        btn.innerHTML = 'Update';
        btn.disabled = false;
    }
}

async function deleteProduct(id) {
    if (!confirm('Delete this product?')) return;

    try {
        const { error } = await supabase
            .from('products')
            .delete()
            .eq('id', id);

        if (error) throw error;

        await renderAdminPanels();
        await loadFeaturedProducts();
    } catch (err) {
        alert('Error: ' + err.message);
    }
}
