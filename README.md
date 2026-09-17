# BVantrix — website

Static site. No build step, no dependencies.

## Run it

```bash
cd site && python3 -m http.server 8777
```

Then open http://localhost:8777

Open `index.html` directly and the CSS won't load — relative paths need a server.

## Structure

```
index.html          the page
css/style.css       all styling, tokens at the top
js/main.js          scroll reveal, sticky nav, mobile drawer
assets/
  vectors/          logo, favicon
  images/team/      headshots — placeholders for now
  images/og/        social share card
```

## Editing

Every colour, radius and spacing value is a custom property in the `:root`
block at the top of `style.css`. Change one there and it updates everywhere.

Type is **Onest**, one family throughout, loaded from Google Fonts.
