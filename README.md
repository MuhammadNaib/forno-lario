# Forno Lario · pizzeria website template

A one-page, scroll-driven website for a wood-fired pizzeria. Forno Lario is a
**fictional** restaurant on Lake Como, used to show the template.

Static HTML, CSS and JavaScript. No build step, no framework, no server.

## What's on the page

| Section | What it does |
|---|---|
| Hero | The view lowers from the lake to the table; the first pizza lands with its label |
| Menu | The menu as a sideways rail. Each pizza has the same label: number, name, ingredients, base, diet, price |
| Dough | A quiet beat about the dough |
| Oven | The oven opens from a small glowing circle to the full screen |
| Visit | Location, opening hours, phone, map link |
| Order | The order slip. Every "Add to order" stamps a line on the order slip; the total and the order are sent to the restaurant on WhatsApp |

Also: a menu index in the top bar that jumps to each pizza, a floating slip
that follows you and docks into the order slip, the order kept after a page reload
(localStorage), a phone layout composed separately, and a reduced-motion
version for people who turn animations off.

## Run it locally

Open `index.html` through any static server, for example:

```bash
npx serve .
# or
python -m http.server 8000
```

## Deploy (free)

* **Netlify**: drag the folder onto https://app.netlify.com/drop
* **Cloudflare Pages**: Create project, Direct upload, select the folder
* **GitHub Pages**: push the folder to a repo, Settings, Pages, deploy from branch

## Rebrand it for a client

1. **Name, number, hours**: top of `site.js`:
   ```js
   var SHOP = {
     name: 'Forno Lario',
     whatsapp: '390341000000',   // digits only, international format
     currency: '€',
     pickup: { open: '18:30', close: '22:30', stepMinutes: 15 },
   };
   ```
2. **Colours and fonts**: top of `site.css` (`:root`). Six colours, two
   typefaces, plus the slip paper colour. Change the Google Fonts link in
   `index.html` if you change the typefaces.
3. **Menu**: in `index.html`, each pizza is one `<article class="dish">`.
   Name, ingredients and price are plain text; the `Add to order` button
   carries `data-id`, `data-name`, `data-price` (that is what the order uses).
   Keep the menu index in the header (`.index__list`) in step.
4. **Text**: address, phone, hours and copy are plain HTML in `index.html`.
5. **Photos**: replace the files in `assets/` keeping the same names, or
   change the `src`. Sizes used:
   * `lake-d.webp` 2560×1440 and `lake-m.webp` 1080×1920 (hero, desktop and phone)
   * `pizza-diavola-cut.webp` 1600×1600 PNG/WebP **with transparency** (hero pizza)
   * `menu-1…6.webp` 1100×1100 squares
   * `fire-d.webp` 2400×1350, `fire-m.webp` 1080×1920
   * `dough.webp`, `cheese.webp` 1200×1600, `terrace.webp` 2200×1400
   * `og.jpg` 1200×630 (link preview image)

`scrollcraft.js` / `scrollcraft.css` are the scroll engine. Don't edit them;
everything specific to this site lives in `index.html`, `site.css`, `site.js`.

## Photo credits

Photos are free-licence images from Unsplash / Pexels, edited (cropped,
resized, hero pizza cut out). Add each photographer's name and link here
before publishing:

| File | Photographer | Link |
|---|---|---|
| lake (hero) | | |
| pizza (hero) | | |
| menu-1 … menu-6 | | |
| fire, dough, cheese, terrace | | |

## Notes

* The WhatsApp number, address and phone are placeholders (`000`).
* Orders are not stored on a server: the customer sends them from their own
  WhatsApp, and the restaurant confirms. For online payment, a backend
  (e.g. Midtrans, Stripe) would be added.
