# portfolio-site

En liten portfolio byggd som en statisk sida med separata filer:

- `index.html` innehåller strukturen och sektionerna.
- `styles.css` innehåller all styling och responsiv layout.
- `data.js` innehåller datan som driver repo-listan.
- `app.js` innehåller all interaktivitet i små moduler.

## Körning

Öppna `index.html` direkt i webbläsaren eller kör sidan via en enkel lokal server.

## Fokus

Projektet är uppdelat för bättre läsbarhet, enklare underhåll och mindre inline-kod.
Interaktiviteten använder `type="module"`, `IntersectionObserver`, `requestAnimationFrame` och dokumentfragment för att hålla DOM-arbetet lättare och snabbare.
