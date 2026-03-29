// ---------- SUPABASE INITIALIZATION ----------
// Credentials loaded from js/env.js

// Use var to avoid conflict with Supabase CDN's global 'supabase' declaration
var supabase = window.supabase.createClient(ENV.SUPABASE_URL, ENV.SUPABASE_ANON_KEY);

// ---------- GLOBAL STATE ----------
const state = {
    siteSettings: null,
    allCategories: [],
    allProducts: [],
    isAdminLoggedIn: false,
    currentUser: null,
    currentSlide: 0,
    sliders: [],
    imageUrlColumnExists: false
};

console.log('Supabase client created');
