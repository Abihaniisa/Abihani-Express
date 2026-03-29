# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Abihani Express is an online store for leather goods (shoes, bags, accessories) based in Yobe State, Nigeria. It is a **multi-file web application** with no build system, bundler, or package manager. The original `index2.html` single-file version is kept for reference.

## Architecture

### File Structure

```
index.html          — Main HTML shell (page sections, header, footer, nav)
css/styles.css      — All CSS (variables, components, layout, theming)
js/config.js        — Supabase client init + global state object
js/api.js           — Data loading functions (site settings, categories, products)
js/render.js        — DOM rendering (slider, categories, products, info sections)
js/navigation.js    — Page routing (showPage, checkHash)
js/admin.js         — Admin auth, dashboard rendering, CRUD stubs
js/search.js        — Search and category filter logic
js/utils.js         — Theme toggle, slider control, buy-now, feedback, utilities
js/app.js           — Entry point (auth listener, initial load, window.* bindings)
index2.html         — (legacy) Original single-file version
```

### Script Load Order

Scripts are loaded in order at the bottom of `index.html`. Each file uses globals from prior scripts:
1. `config.js` — defines `supabase` client and `state` object
2. `api.js` — uses `supabase`, `state`, and render functions
3. `render.js` — uses `supabase`, `state`, `showPage`
4. `navigation.js` — uses `state`, `loadAllProducts`, `renderAdminPanels`
5. `admin.js` — uses `supabase`, `state`, `showPage`, `showUnavailable`
6. `search.js` — uses `supabase`, `productCardHTML`, `loadAllProducts`
7. `utils.js` — uses `supabase`, `state`
8. `app.js` — wires everything to `window.*` for inline onclick handlers

### Backend: Supabase

All data is stored in and fetched from Supabase (hosted instance). The Supabase JS client is loaded via CDN. Key tables:
- `site_settings` — site name, slogan, logo/brand/CEO image URLs, slider content, social links
- `categories` — product categories with icon and sort order
- `subcategories` — linked to categories via foreign key
- `products` — name, price, image_icon (emoji), description, vendor, rating, featured flag
- `admins` — admin email whitelist (checked after Supabase Auth sign-in)
- `feedback` — user-submitted contact messages

### Navigation

Page routing is handled by `showPage(pageName)` in `js/navigation.js` which toggles `active-page` class on page sections. The `#admin` URL hash triggers the admin login page on load. Bottom nav bar has Home, Search, and Profile tabs.

### Admin Dashboard

Accessed via `#admin` hash or Profile tab when logged in. Uses Supabase Auth (`signInWithPassword`). After auth, checks the `admins` table for authorization. Admin CRUD operations (add/edit/delete categories, subcategories, products) are **stub functions** in `js/admin.js` that show "feature not available" alerts.

### Purchase Flow

"Buy Now" generates a pre-filled WhatsApp message with product details and opens `wa.me` link. No cart or payment processing.

## Development

To run locally, open `index.html` in a browser. No server or build step needed. The app requires an internet connection for Supabase API calls and CDN resources (Font Awesome, Google Fonts, Supabase JS).

## Current Branch Context

The `feature/connecting_to_superbase` branch contains the initial Supabase integration. Admin CRUD operations are not yet implemented (all are stubs calling `showUnavailable()`).
