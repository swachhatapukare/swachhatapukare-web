# SwachhataPukare Foundation — website + shop (static prototype)

A complete, dependency-free front-end prototype for the SwachhataPukare Foundation
(HIG-276, Ward No-15, Near Bank Of Baroda, Adityapur, Jamshedpur, Jharkhand 831013):
a Foundation website (work, gallery, donate, contact, bulk enquiry) and a
single-brand marketplace for its handcrafted catalogue.

**This is a static prototype.** No real payments or orders are taken. Cart, coupons,
OTP login, orders and invoices all live in `localStorage` (`sp_*` keys) in the browser.

## Run it locally

No build step, no dependencies. Any static server works:

```bash
# Python
python -m http.server 8123
# → http://127.0.0.1:8123/

# or Node
npx serve .
```

Opening `index.html` straight from disk (`file://`) also works — Google Fonts and
all assets resolve with relative paths.

## Publish on GitHub Pages

1. Push this repository to GitHub (all files at the repo root, no `/docs` folder).
2. Repo **Settings → Pages → Build and deployment → Deploy from a branch**.
3. Branch: `main`, folder: `/root` → Save.
4. The included `.nojekyll` file keeps GitHub from running the site through Jekyll.

## Pages

| Area | Files |
| --- | --- |
| Home | `index.html` |
| Catalogue | `shop.html`, `product.html?slug=…` |
| Purchase flow | `cart.html`, `checkout.html`, `order-confirmation.html?id=…`, `track.html`, `invoice.html` |
| Account | `account.html` (login, profile, addresses, order history) |
| Foundation work | `about.html`, `water-hyacinth.html`, `river-cleaning.html`, `tedxbistupur.html`, `solar-power.html`, `sewage-treatment.html`, `gallery.html` |
| Take action | `donate.html`, `contact.html`, `bulk-enquiry.html` |
| Legal / misc | `policies.html`, `404.html` |

## How it is built

```
assets/
  css/  tokens.css → base.css → layout.css → components.css → pages.css → print.css
  js/   config.js → data.js → utils.js → store.js → components.js → <page>.js
  products/   (drop product photos here: {slug}-1.jpg, {slug}-2.jpg, {slug}-3.jpg)
  gallery/    (drop work photos here; see config.js GALLERY)
  SPF Logo - Highres.png  (master logo, 1920x1920, kept untouched)
  logo.png                (generated: 512px circular emblem, PNG-8 27 KB — used by the site)
  logo-full.png           (generated: full lock-up incl. caption, 621x768, 52 KB)
```

### Logo

The header, mobile menu and footer load `assets/logo.png` (`LOGO_PATH` in
`config.js`); if that file is missing the SVG water-drop wordmark is used instead.

The two `logo.png` / `logo-full.png` files are generated from the high-res master
by `tools/logo.py` — it trims the transparent margins, splits the emblem off from
the caption line, resizes with LANCZOS and writes the smaller of a full-colour or
256-colour PNG:

```bash
python -m pip install pillow   # once
python tools/logo.py
```

* Plain HTML5 / CSS3 / vanilla ES2020 JavaScript. No framework, no CDN (Google Fonts only),
  no bundler, no inline styles or inline event handlers.
* Classic `<script defer>` files sharing one global namespace: `SP`.
* `components.js` injects the header, mega/mobile menu, footer,
  mini-cart drawer, modal, toast and WhatsApp button into `#sp-top` / `#sp-bottom`,
  so the chrome is edited in exactly one place.
* Prices everywhere state that they **exclude print and courier charges**.
* All product images degrade to a generated SVG placeholder tinted by category,
  so the site is fully presentable before any photography exists.
* Every unverified claim is marked with a visible `TODO` note (see `config.js`).

### Prototype mechanics

* Coupon `SWACHH10` → 10% off. Free shipping above `FREE_SHIPPING_ABOVE` (₹999).
* Cash on Delivery is blocked for orders above `COD_MAX` (₹5,000) with an explanation.
* OTP login always accepts `123456` (any other code fails).
* Order ids look like `SP-20261008-0001`; the tracking timeline is simulated from
  `TRACK_TIMELINE` (0h / 6h / 24h / 48h / 96h).
* Invoices use `GST_PERCENT` (5%).

## Where to fill in real values

Everything client-specific is at the top of `assets/js/config.js`:

| Placeholder | Replace with |
| --- | --- |
| `FOUNDATION.whatsapp` (`910000000000`) | the Foundation's WhatsApp Business number |
| `FOUNDATION.email`, `FOUNDATION.hours` | real enquiry email + working hours |
| `IMPACT` counters | verified impact numbers |
| `TESTIMONIALS` | real quotes + attributions |
| `COPY.about`, `COPY.whatWeDo` | approved About and work copy |
| `COUPONS`, `GST_PERCENT`, `COD_MAX`, `SHIPPING_FLAT`, `FREE_SHIPPING_ABOVE` | commercial terms |
| `DISPATCH_HOURS`, `COURIER_PARTNER`, delivery day range | real fulfilment terms |
| `GALLERY` | real photo paths + captions |

Product data (name, price, size, tags, variants) lives in `assets/js/data.js`.
Only items tagged **Water Hyacinth** may claim that material; the rest are described
as handcrafted, and unknown dimensions use "Size on request".

## Migration notes — this maps to WordPress + WooCommerce

The prototype was written deliberately close to how the same site would be structured
on WordPress, so a rebuild is mostly a lift-and-shift:

| Here | On WordPress |
| --- | --- |
| `index.html`, `about.html`, work pages, `policies.html` | Pages (Gutenberg blocks) |
| `shop.html` / `product.html?slug=…` | WooCommerce shop archive / single product |
| `assets/js/data.js` products | WooCommerce products (title, price, gallery, product attributes for tags, variations for the pen-stand / lamp sizes) |
| Water Hyacinth / Office Essentials tags | Product categories + attributes (used for the filters and `?tag=` links) |
| `cart.html`, `checkout.html` | WooCommerce cart + checkout (native templates) |
| `store.js` totals, `SWACHH10` coupon | WooCommerce cart totals + coupon |
| `order-confirmation`, `track`, `invoice` | Thank-you page, **Order tracking** plugin, **PDF invoices** plugin (order notes hold the timeline) |
| `account.html` | My Account (login uses WooCommerce; the OTP flow would need an SMS OTP plugin) |
| `donate.html`, `contact.html`, `bulk-enquiry.html` | Donation plugin (or WooCommerce product) + a forms plugin (WPForms/CF7) with mail routing |
| `components.js` header/footer | Theme header/footer templates |
| `localStorage` state | Server-side sessions/orders — all `BACKEND-HOOK:` comments in `store.js` mark the seams |
| `assets/products/*.jpg` | Media Library uploads (WooCommerce sizes) |

Design tokens in `assets/css/tokens.css` are already named like a theme's
CSS custom properties, so they transfer one-to-one into a child theme.

## Accessibility & behaviour notes

* Skip link, `aria-*` on menus/drawers/modals, focus trapping in modals,
  ESC closes the drawer, menu and lightbox.
* Responsive at 360 / 768 / 1280 with no horizontal overflow; the header hides the
  account icon below 560px (it stays in the menu).
* `prefers-reduced-motion` is respected; `print.css` gives a clean invoice print.
