# Focus Kitchen: 3D Dish Art Guide

How to create the dish illustrations so all of them look as if they belong to one set.

## 1. The chosen style

Cute, stylised 3D food renders that look like miniature clay or soft plastic toys:

- Rounded, simplified, slightly chunky shapes. Recognisable, but not photorealistic.
- Soft matte materials with a gentle sheen on sauces, eggs and broth.
- Soft diffused studio lighting from the upper left, with a gentle soft shadow under the dish.
- Cream or warm off-white ceramic bowls and plates (sukiyaki uses a dark cast-iron pot). Keep tableware simple, with no patterns.
- Three-quarter view from above (about 45 degrees), dish centred, filling about 80% of the frame.
- Plain white background (to be removed afterwards; see section 5).
- No text, no logos, no hands, no chopsticks floating in the air, no extra props unless the dish needs them.

Style anchor: the "3D / Omurice" frame in the Figma file https://www.figma.com/design/XJ9uISO5YPC32BH0ESBZfw. Compare every new image against it.

## 2. Prompt templates

These templates produced the approved samples (Figma `generate_image`, model `gpt-image-2.5-flare`, 1024 x 1024). Fill in the parts in curly brackets.

### Cooked

```
Cute stylised 3D render of {DISH DESCRIPTION} {SERVING VESSEL}.
Soft clay and matte plastic materials, rounded simplified chunky shapes,
miniature toy-like food, soft diffused studio lighting, gentle soft shadow,
high detail 3D icon style. Single dish centred, three-quarter view from above,
isolated on a plain white background. No text, no lettering.
```

`{DISH DESCRIPTION}` lists the 4 to 7 most recognisable ingredients, for example: "a bowl of Japanese shoyu ramen: brown broth, wavy noodles, two round slices of chashu pork, a halved soft-boiled egg with jammy orange yolk, a nori sheet, narutomaki fish cake, chopped spring onions".

`{SERVING VESSEL}` is usually "in a cream ceramic bowl" or "on a round cream ceramic plate".

### Raw (quit early)

```
Cute stylised 3D render of {DISH NAME} that is still RAW and undercooked:
{RAW DETAILS}, looks unfinished, with a small sad cartoon face (two dot eyes
and a little frown) on the food, {SERVING VESSEL}.
Soft clay and matte plastic materials, rounded simplified chunky shapes,
miniature toy-like food, soft diffused studio lighting, gentle soft shadow,
3D icon style, gently humorous. Single dish centred, three-quarter view from
above, isolated on a plain white background. No text, no lettering.
```

`{RAW DETAILS}` makes rawness obvious at a glance: pale colours, uncooked noodles still in a block, pink meat, liquid egg, dough that has not risen, ingredients not yet combined.

### Burnt (left the app)

```
Cute stylised 3D render of a BURNT {DISH NAME}: {BURNT DETAILS}, a few soft
grey puffs of cartoon smoke rising, with a small sad cartoon face (two dot
eyes and a little frown) on the food, {SERVING VESSEL}.
Soft clay and matte plastic materials, rounded simplified chunky shapes,
miniature toy-like food, soft diffused studio lighting, gentle soft shadow,
3D icon style, cute and gently humorous rather than gross. Single dish
centred, three-quarter view from above, isolated on a plain white background.
No text, no lettering.
```

`{BURNT DETAILS}`: charred dark brown and black surfaces, blackened crispy edges, dried-up sauce.

## 3. The face rule

- **Cooked dishes have no face.** They are the reward and should simply look delicious.
- **Raw and burnt dishes have a small sad face.** This came out by accident in the first raw sample and Jane liked it. It makes failures feel gently funny instead of harsh, and makes them easy to tell apart from successes in the mishaps page.
- Keep the face tiny and simple: two dot eyes and a small frown, placed on the main food item.

## 4. Assets needed for version 1

20 dishes (see the menu in `SPEC.md` section 4.4) x 3 states = **60 images**.

Suggested order, so the app can ship with real art early:
1. All 20 cooked images.
2. Raw and burnt for tiers 1 to 3.
3. Raw and burnt for tiers 4 and 5.

Until a raw or burnt image exists, the app falls back to the cooked image with a CSS treatment (raw: desaturated and pale; burnt: darkened with a smoke overlay).

Already generated (in Figma, may be reused if they pass the checklist): omurice (cooked, raw, burnt), shoyu ramen (cooked), sukiyaki (cooked). The raw omurice already has the sad face; the burnt omurice does not, so regenerate it with the burnt template.

Cost note: each Figma generation uses one Figma AI credit on the "fresh workspace" team. Expect to regenerate about 1 in 3 images, so budget about 80 credits for the full set.

## 5. Processing

1. **Generate** at 1024 x 1024 on a plain white background.
2. **Remove the background** to get a transparent PNG. Options, in order of preference:
   - Figma: select the image and use "Remove background", then export as PNG.
   - Locally with the `rembg` Python package (`rembg i input.png output.png`). Its model downloads on first use, which may be blocked in a cloud session.
   - If neither works: keep the white background and place images on white rounded cards in the UI.
3. **Trim and centre**: make sure each dish sits centred with similar padding (about 8% on each side) so the grid looks even.
4. **Export** as WebP:
   - `public/dishes/512/{id}.webp`, `{id}-raw.webp`, `{id}-burnt.webp`
   - `public/dishes/256/{id}.webp`, `{id}-raw.webp`, `{id}-burnt.webp`
   - Use quality about 85. Keep the transparent background.
5. **Silhouettes** for locked dishes are made in CSS from the cooked image. No separate files.

Figma image download links expire after 7 days, and `www.figma.com` may be blocked in Claude cloud sessions. The simplest route is for Jane to export from Figma and add the files to the repository, or to allow `www.figma.com` in the session's network settings.

## 6. Consistency checklist (check every image)

- [ ] Three-quarter view from above, same angle as the omurice anchor
- [ ] Dish centred, filling about 80% of the frame
- [ ] Light from the upper left, soft shadow below
- [ ] Clay or soft plastic look, not photographic
- [ ] Cream ceramic tableware with no pattern (unless the spec says otherwise)
- [ ] No text, no watermark, no stray props
- [ ] Recognisable at 96 px (check a small preview)
- [ ] Raw and burnt versions have the small sad face; cooked versions do not
- [ ] Raw and burnt are obviously different from the cooked version at small size

## 7. Originality

Describe the style in general terms. Do not name living artists, copy a specific artist's work, or reuse images found online (some reference images had "licensed use only" watermarks). All images in the app must be generated or made for this project.
