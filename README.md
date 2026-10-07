# BVANTRIX — website

Static site. No build step, no dependencies.

The current design is the editorial one: cream and forest bands, serif
headlines, the brand B mark. The previous white minimal build is kept in
`legacy/`, and at the git tag `design-v1` / branch `design-v1-backup`.

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
legacy/             the previous design, kept so it can be read without git
assets/
  vectors/          the B mark and favicon
  images/team/      the founder portrait
  images/og/        social share card + the page it is rendered from
```

## Editing

Every colour, radius and spacing value is a custom property in the `:root`
block at the top of `style.css`. Change one there and it updates everywhere.

## Icons

**Material Symbols Outlined**, weight 300 to match the type, subset in the
`<head>` to exactly the 23 names the page uses via `icon_names=`. Adding an
icon means adding its name to that list as well as the markup, or it will
render as the literal word.

## Type

Two families, both from Google Fonts: **Newsreader** carries the argument
(every headline and pull quote), **Onest** carries everything else. The
split is deliberate — the serif is what stops the page reading as generic.

## Photographs

The founder portrait is in place: `assets/images/team/founder.{jpg,webp}`,
900x1200, served through a `<picture>` so WebP goes to browsers that take
it and JPEG to the rest.

One slot is still empty, marked `PHOTO SLOT` in `index.html`: the hero,
which renders a built dusk gradient rather than a photograph. It is
designed to look intentional while empty.

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
