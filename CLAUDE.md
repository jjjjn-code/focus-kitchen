# Focus Kitchen (working title)

A personal focus app for iPhone. While you concentrate (reading a book, studying, working), a dish cooks. The longer you focus, the better the dish. You only find out which dish you made at the end. Leave early and it comes out raw; get distracted and it burns. Every dish goes into a recipe book you fill over time.

Owner: Jane. Version 1 (the MVP) is for Jane only. No App Store, no accounts, no friends features yet.

## Read these first

- `docs/SPEC.md`: product and build spec for version 1 (rules, screens, data model, milestones).
- `docs/ART_GUIDE.md`: how to create the 3D dish illustrations so they stay consistent.

## Decisions already made (do not reopen without asking Jane)

1. **Platform:** a Progressive Web App (PWA) installed on Jane's iPhone via Safari "Add to Home Screen". Hosted free on GitHub Pages. A native app (Expo or SwiftUI) is stage 2, only if the MVP proves the idea works.
2. **Art style:** cute stylised 3D "clay" food renders (chosen over a Japanese magazine gouache style). See `docs/ART_GUIDE.md`.
3. **Activities:** works for any focus activity, not only reading. Reading is the main use case and the default.
4. **Surprise reward:** the dish is revealed only at the end. Longer focus unlocks higher tiers.
5. **Penalties:** quitting before the target gives a **raw** dish; leaving the app gives a **burnt** dish.
6. **No break or "urge" button.** The aim is not to touch the phone at all.
7. **No real-money or treat-jar link.** The reward is the collection itself.
8. **Completion screen** shows personal stats plus a message. Any scientific claim must be verified against the original source and shown with its citation. No made-up or weak "brain fact" claims.
9. **Failures are kept** on a separate "Kitchen mishaps" page, not mixed into the main recipe book.

## How Jane likes to work

- Use British English everywhere, including in the app's copy.
- Do not use en dashes or em dashes in writing or in UI copy.
- Do not use contractions (write "do not", not "don't") in writing or UI copy.
- Jane wants to plan before building. Check in before large design changes; small implementation choices are fine to make alone.

## Tech summary

- Vite + React + TypeScript, `vite-plugin-pwa` for the manifest and service worker.
- All data stored on the device (IndexedDB). No backend.
- Deployed to GitHub Pages with a GitHub Actions workflow.
- Unit tests (Vitest) for tier, dish roll and timing logic. Playwright with an iPhone device profile for the main flows.

## Reference material

- Figma file with approved style samples (3D row is the chosen style): https://www.figma.com/design/XJ9uISO5YPC32BH0ESBZfw
  The "3D / Omurice" frame is the style anchor. Note: in Claude cloud sessions, `www.figma.com` downloads may be blocked by the network policy; Jane can export the images from Figma, or allow that host.
- Competitors (so we stay different): Focus Friend (bean knits, room decorating), Focus Fridge (mystery food box per session), Focus Noodles, FocusOven, Sweet Time, Fodcus, Forest. Our differences: the dish tier grows with open-ended overtime, two distinct failure states, a recipe book that doubles as a focus journal, goal "feasts", and verified research messages.
