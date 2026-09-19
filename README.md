# BVantrix — website

Static site. No build step, no dependencies.

## Run it

```bash
cd site && python3 -m http.server 8777
```

Then open http://localhost:8777

Open `index.html` directly and the CSS won't load — relative paths need a server.

## How it was built

[`CONVERSATION.md`](CONVERSATION.md) is the full log of the session that produced
this site — every request and the reasoning behind each change, in order. Useful
when you wonder why something is the way it is.

## Structure

```
index.html          the page
css/style.css       all styling, tokens at the top
js/main.js          scroll reveal, sticky nav, drawer, booking panel, contact form
assets/
  vectors/          logo, favicon
  images/team/      headshots — placeholders for now
  images/og/        social share card
```

## Editing

Every colour, radius and spacing value is a custom property in the `:root`
block at the top of `style.css`. Change one there and it updates everywhere.

Type is **Onest**, one family throughout, loaded from Google Fonts.

## Forms

The booking panel and the contact form both read one constant at the top of
`js/main.js`:

```js
var BVANTRIX_ENDPOINT = '';
```

Empty, they fall back to opening the visitor's own mail client — which fails
silently for anyone who does not have one configured. Paste a form endpoint
(Formspree, Getform, Basin, your own API) and both POST to it instead, so the
request is sent server-side and reaches info@bvantrix.com either way.
