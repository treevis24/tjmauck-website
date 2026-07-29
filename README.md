# tjmauck.com

Portfolio site for TJ Mauck — director & cinematographer, Los Angeles.

Hand-built static site (HTML/CSS/JS, no framework, no build step), rebuilt from the
Webflow design at `tj-mauck-films.webflow.io`. Deployed on Vercel; domain via Namecheap.

## Structure

- `index.html` — the whole portfolio (single page)
- `css/style.css` — all styles
- `js/main.js` — mobile nav + lightbox (video embeds and frame-grab galleries)
- `assets/img/<project>/` — optimized responsive images (480/960/1600 px)
- `_source/` — full-resolution originals, **not committed** (see `.gitignore`)

## Local development

Any static server works, e.g.:

```sh
python3 -m http.server 8080
```

## Images

Optimized JPGs are generated from `_source/` originals with `sips`:

```sh
sips -s format jpeg -s formatOptions 78 --resampleWidth 960 in.jpg --out out-960.jpg
```

## Videos

Hosted on Vimeo (one on YouTube), opened in a lightbox as embeds — see the
`data-video` attributes in `index.html`.
