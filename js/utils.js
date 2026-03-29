// ---------- THEME TOGGLE ----------
function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
}

// ---------- SLIDER CONTROL ----------
function setSlide(index) {
    state.currentSlide = index;
    updateSlider(index);
}

function updateSlider(index) {
    if (!state.sliders || !state.sliders[index]) return;

    const slide = state.sliders[index];
    const container = document.getElementById('slider-container');

    const sliderCard = container.querySelector('.slider-card');
    if (sliderCard) {
        sliderCard.innerHTML = `
            <h2>${slide.title}</h2>
            <p>${slide.subtitle}</p>
        `;
    }

    document.querySelectorAll('.dot').forEach((dot, i) => {
        dot.classList.toggle('active', i === index);
    });
}

// ---------- BUY NOW ----------
async function buyNow(productId) {
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single();

    if (error || !data) return;

    const product = data;
    const whatsapp = state.siteSettings?.contact_whatsapp || ENV.WHATSAPP_NUMBER;
    const price = product.price?.toLocaleString() || '0';

    const lines = [
        `Hello Abihani Express!`,
        ``,
        `I'm interested in buying this product:`,
        ``,
        `🛍️ *Product:* ${product.name}`,
        `💰 *Price:* ₦${price}`,
        `👤 *Vendor:* ${product.vendor || 'Abihani Express'}`,
        `📍 *Location:* ${product.vendor_location || 'Potiskum, Yobe State'}`,
    ];

    if (product.description) {
        lines.push(`📝 *Description:* ${product.description}`);
    }

    if (product.image_url) {
        lines.push(`🖼️ *Image:* ${product.image_url}`);
    }

    lines.push(
        ``,
        `Please provide payment details and delivery information.`,
        ``,
        `Thank you!`
    );

    const message = encodeURIComponent(lines.join('\n'));
    const cleanNumber = whatsapp.replace(/[^0-9]/g, '');

    window.open(`https://wa.me/${cleanNumber}?text=${message}`, '_blank');
}

// ---------- FEEDBACK ----------
async function submitFeedback() {
    const message = document.getElementById('contact-message')?.value;

    if (!message) {
        showToast('Please enter a message', 'error');
        return;
    }

    const { error } = await supabase
        .from('feedback')
        .insert([{ message, status: 'unread' }]);

    if (error) {
        showToast('Error sending feedback', 'error');
    } else {
        showToast('Feedback sent successfully!', 'success');
        document.getElementById('contact-name').value = '';
        document.getElementById('contact-email').value = '';
        document.getElementById('contact-message').value = '';
    }
}

// ---------- TOAST NOTIFICATIONS ----------
function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ---------- UTILITY ----------
function showUnavailable() {
    showToast('This feature is not yet available.', 'info');
}
