# Focus Kitchen: 3D Dish Art Guide

How to create the dish illustrations so all of them look as if they belong to one set.

## 1. The chosen style

Cute, stylised 3D food renders that look like handmade miniature clay models, photographed on a sand coloured paper backdrop (updated after Jane's clay figure references):

- Rounded, simplified, slightly chunky shapes. Recognisable, but not photorealistic.
- Soft matte materials with a gentle sheen on sauces, eggs and broth.
- Soft diffused studio lighting from the upper left, with a gentle soft shadow under the dish.
- Cream or warm off-white ceramic bowls and plates (sukiyaki uses a dark cast-iron pot). Keep tableware simple, with no patterns.
- Three-quarter view from above (about 45 degrees), dish centred, filling about 80% of the frame.
- Plain warm beige (light sand) paper backdrop that fills the frame. The backdrop stays in the image; the app shows each picture as a rounded tile, so no background removal is needed.
- No text, no logos, no hands, no chopsticks floating in the air, no extra props unless the dish needs them.

Style anchor: the "3D / Omurice" frame in the Figma file https://www.figma.com/design/XJ9uISO5YPC32BH0ESBZfw. Compare every new image against it.

## 2. Prompt templates

These templates produced the approved samples (Figma `generate_image`, model `gpt-image-2.5-flare`, 1024 x 1024). Fill in the parts in curly brackets.

### Cooked

This is the template that produced all 23 cooked images now in the app:

```
Cute stylised 3D render of {DISH DESCRIPTION} {SERVING VESSEL}.
Handmade modelling clay look with a soft matte surface and subtle hand-shaped
texture, rounded simplified chunky shapes, miniature toy-like food, muted warm
colours, soft diffused studio lighting from the upper left, gentle soft shadow,
high detail 3D icon style. Single dish centred and filling about 70% of the
frame, three-quarter view from above, on a plain seamless warm beige paper
backdrop in a light sand colour that fills the whole frame evenly. No text, no
lettering, no face, no hands, no extra props.
```

### Raw (quit early)

```
Cute stylised 3D render of {DISH NAME} that is still RAW and undercooked:
{RAW DETAILS}, looks unfinished, with a small sad cartoon face (two dot eyes
and a little frown) on the food, {SERVING VESSEL}.
Handmade modelling clay look with a soft matte surface and subtle hand-shaped
texture, rounded simplified chunky shapes, miniature toy-like food, muted warm
colours, soft diffused studio lighting from the upper left, gentle soft shadow,
3D icon style, gently humorous. Single dish centred, three-quarter view from
above, on a plain seamless warm beige paper backdrop in a light sand colour that fills
the whole frame evenly. No text, no lettering.
```

`{RAW DETAILS}` makes rawness obvious at a glance: pale colours, uncooked noodles still in a block, pink meat, liquid egg, dough that has not risen, ingredients not yet combined.

### Burnt (left the app)

```
Cute stylised 3D render of a BURNT {DISH NAME}: {BURNT DETAILS}, a few soft
grey puffs of cartoon smoke rising, with a small sad cartoon face (two dot
eyes and a little frown) on the food, {SERVING VESSEL}.
Handmade modelling clay look with a soft matte surface and subtle hand-shaped
texture, rounded simplified chunky shapes, miniature toy-like food, muted warm
colours, soft diffused studio lighting from the upper left, gentle soft shadow,
3D icon style, cute and gently humorous rather than gross. Single dish
centred, three-quarter view from above, on a plain seamless warm beige paper
backdrop in a light sand colour that fills the whole frame evenly. No text, no
lettering.
```

`{BURNT DETAILS}`: charred dark brown and black surfaces, blackened crispy edges, dried-up sauce.

## 3. The face rule

- **Cooked dishes have no face.** They are the reward and should simply look delicious.
- **Raw and burnt dishes have a small sad face.** This came out by accident in the first raw sample and Jane liked it. It makes failures feel gently funny instead of harsh, and makes them easy to tell apart from successes in the mishaps page.
- Keep the face tiny and simple: two dot eyes and a small frown, placed on the main food item.

## 4. Assets needed for version 1

23 dishes (see the menu in `SPEC.md` section 4.4) x 3 states = **69 images**.

Status:
1. **Done:** all 23 cooked images.
2. **To do:** raw and burnt images (46). Until one exists, the app shows the cooked image with a CSS treatment (raw: desaturated and pale; burnt: darkened) and a small sad face badge.

Cost note: each Figma generation uses one Figma AI credit on the "fresh workspace" team. The 23 cooked images took 25 credits (the fried egg was generated twice while settling the backdrop). None of the others needed regenerating.

## 5. Processing

1. **Generate** at 1024 x 1024 with Figma `generate_image` (model `gpt-image-2.5-flare`).
2. **Record** the image link in `art-src/urls.txt` as `<name> <asset id>`, where `<name>` is the dish id, optionally followed by `-raw` or `-burnt`.
3. **Download** with `scripts/fetch-art.sh`. Links expire after 7 days. The PNG originals in `art-src/` are not committed (they are about 1 MB each); only the converted files are.
4. **Convert** with `python3 scripts/process-art.py`, which writes:
   - `public/dishes/512/{name}.webp` for the reveal, dish card and set up screens
   - `public/dishes/256/{name}.webp` for grids and small tiles
5. **Locked dishes** are made in CSS from the cooked image (blurred and greyed). No separate files.

`www.figma.com` is blocked in the default Claude cloud environment. The "focus-kitchen" environment allows it.

## 6. Consistency checklist (check every image)

- [ ] Three-quarter view from above, same angle as the omurice anchor
- [ ] Dish centred, filling about 80% of the frame
- [ ] Light from the upper left, soft shadow below
- [ ] Clay or soft plastic look, not photographic
- [ ] Cream ceramic tableware with no pattern (unless the dish calls for something else, such as a cast-iron pot or lacquer box)
- [ ] Sand backdrop fills the frame, similar in tone to the other images
- [ ] No text, no watermark, no stray props
- [ ] Recognisable at 96 px (check a small preview)
- [ ] Raw and burnt versions have the small sad face; cooked versions do not
- [ ] Raw and burnt are obviously different from the cooked version at small size

## 7. Originality

Describe the style in general terms. Do not name living artists, copy a specific artist's work, or reuse images found online (some reference images had "licensed use only" watermarks). All images in the app must be generated or made for this project.
