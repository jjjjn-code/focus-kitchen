# Focus Kitchen: Version 1 Spec

Status: approved direction, ready to build. Audience: Claude Code (building) and Jane (checking).

## 1. Goal

Help Jane spend more time reading (and doing other focused work) without picking up her phone, by turning focus time into a cooking game with a surprise reward.

Success after two weeks of use: Jane reads more often, sessions get longer, and she wants to open the recipe book.

## 2. Core loop

1. Jane opens the app and taps **Start cooking**.
2. She picks an **activity** (Reading by default) and, optionally, a **goal** (for example, a book title).
3. She picks a **target time**.
4. The phone goes face down. A dark, calm cooking scene runs and the screen stays awake.
5. When the target is reached, the dish is cooked. If she keeps going, the dish keeps upgrading to higher tiers (shown only as a hint, never the actual dish).
6. She taps **Serve** to finish. The lid lifts and the dish is revealed.
7. The dish goes into the recipe book with the session details.

## 3. Session rules

### 3.1 Target time

Options: 10, 15, 25, 45, 60, 90, 120 minutes. Default: 25. Remember the last choice.

### 3.2 Outcomes

| Situation | Outcome |
|---|---|
| Taps Stop before the target | **Raw** |
| Leaves the app and does not return within the grace period | **Burnt** |
| Reaches the target, then taps Serve | **Cooked**: dish from the tier matching the **actual focused minutes** |

- Stop needs a **press and hold** (about 1.5 seconds) with the message "Your dish is not ready yet. Stop now and it comes out raw?"
- After the target is reached, the main button changes to **Serve**. There is no failure after the target is reached except leaving the app (which still burns the dish: "You left the kitchen").
  - Open question for Jane: should leaving after the target burn the dish, or just serve it at the tier reached so far? Default for v1: **serve at the tier reached when she left**, because the target was met. Easy to change in settings code.
- There is no pause.

### 3.3 Leaving the app (the burnt rule)

A web app cannot tell the difference between locking the screen and switching apps. The v1 approach:

- Keep the screen awake with the **Screen Wake Lock API** (`navigator.wakeLock.request('screen')`). Re-request it whenever the page becomes visible again. If it is not available or fails, fall back to a silent looping video technique (as used by the NoSleep.js library) and show a one-line tip: "Set Auto-Lock to Never while cooking".
- The cooking screen is near-black so it uses little battery on an OLED screen.
- Jane puts the phone **face down without locking it**.
- On `visibilitychange` to hidden: immediately write `hiddenAt` to storage.
- On visible again: if `now - hiddenAt <= graceSeconds` (default **10**), continue and count a "close call". Otherwise end the session as **burnt**, with the end time set to `hiddenAt`.
- If the app is reopened from scratch and an active session exists:
  - with a `hiddenAt` older than the grace period: **burnt**;
  - with no `hiddenAt` (the page was killed without warning): **burnt**.
- Timers must be based on stored timestamps (`Date.now()`), never on counting intervals, because iOS suspends hidden pages.
- Experiment (keep only if reliable on Jane's iPhone): when the page goes hidden, try `registration.showNotification("Your dish is still cooking! Come back within 10 seconds.")`. Requires notification permission and the app being installed to the Home Screen. If it does not fire reliably, remove it.

### 3.4 Minimum

Sessions under 10 minutes of focus never produce a cooked dish.

## 4. Tiers and dish roll

### 4.1 Tiers (by actual focused minutes)

| Tier | Name | Minutes |
|---|---|---|
| 1 | Snack | 10 to 24 |
| 2 | Light meal | 25 to 44 |
| 3 | Main | 45 to 74 |
| 4 | Hearty | 75 to 119 |
| 5 | Feast | 120 and over |

During overtime, show a hint such as "Next tier in 12 min" and a small tier badge. Never show which dish.

### 4.2 Rarity

Each dish has a rarity. Within a tier the roll weights are: common 70, rare 25, legendary 5 (shared between dishes of that rarity).

Collection boost: dishes Jane has **never cooked** get double weight, so the collection keeps growing. Keep this a single constant so it is easy to tune.

### 4.3 Failure dish

For raw or burnt outcomes, roll a dish from the tier of the **target time** (what she was trying to cook). The failure screen names it: "Your shoyu ramen came out raw." This should sting a little.

### 4.4 Starter menu (20 dishes)

Japanese and East Asian comfort food, matching the 3D style samples. `id` values are used for asset file names.

| Tier | id | Name | Rarity |
|---|---|---|---|
| 1 | onigiri | Onigiri | common |
| 1 | tamagoyaki | Tamagoyaki | common |
| 1 | fruit-sando | Fruit sando | rare |
| 1 | mitarashi-dango | Mitarashi dango | legendary |
| 2 | omurice | Omurice | common |
| 2 | gyoza | Gyoza | common |
| 2 | fried-rice | Egg fried rice | rare |
| 2 | katsu-sando | Katsu sando | legendary |
| 3 | shoyu-ramen | Shoyu ramen | common |
| 3 | curry-rice | Japanese curry rice | common |
| 3 | teriyaki-don | Chicken teriyaki don | rare |
| 3 | xiao-long-bao | Xiao long bao | legendary |
| 4 | sukiyaki | Sukiyaki | common |
| 4 | tonkatsu-set | Tonkatsu set meal | common |
| 4 | dolsot-bibimbap | Stone pot bibimbap | rare |
| 4 | unagi-don | Unagi don | legendary |
| 5 | hot-pot | Yin-yang hot pot | common |
| 5 | sushi-platter | Sushi platter | common |
| 5 | shortcake | Strawberry shortcake | rare |
| 5 | celebration-bento | Celebration jubako bento | legendary |

Store the menu as `src/data/dishes.ts` with `{ id, name, tier, rarity, blurb }`. A blurb is one short, friendly line about the dish.

## 5. Screens

1. **Kitchen (home)**: big Start cooking button, today's focus minutes, current streak (days with at least one cooked dish), last dish cooked.
2. **Set up**: activity chips (Reading, Study, Work, Creative, Other), goal picker (optional, with "New goal"), target time picker, Start button.
3. **Cooking**: near-black background; a 3D-style pot with a lid that gently bubbles, soft steam and a low flame (CSS or Lottie animation, no dish visible). Elapsed time in small, dim text. A thin progress ring to the target. After the target: "Cooked! Keep going to upgrade" and the next-tier hint. Hold-to-stop button, or Serve after the target.
4. **Reveal**: lid lifts, dish appears with a gentle bounce, name, rarity badge, "New!" badge for a first-time dish. Below: minutes focused, activity and goal, this week's total, and one message (see section 7). Buttons: "Add to recipe book" (default) and an optional "Add a note" (for example, a favourite line from the book).
5. **Failure**: the raw or burnt dish image (with a sad face, see the art guide), one gentle line, time focused before it went wrong. No shaming.
6. **Recipe book**: grid grouped by tier. Uncooked dishes show as a dark silhouette of the dish image (CSS `filter: brightness(0)` with low opacity), so no extra art is needed. Cooked dishes show the image and a "x3" count. Tapping opens a **dish card**: image, blurb, every time it was cooked (date, minutes, activity, goal, note).
7. **Kitchen mishaps**: separate page listing raw and burnt results with counts.
8. **Goals**: list of goals with total minutes and dishes cooked for each. "Mark as finished" shows a **feast** screen: every dish cooked for that goal laid out together on a table, titled with the goal name (for example "The Atomic Habits feast").
9. **Stats**: minutes per day for the last 14 days (simple bar chart), total minutes, longest session, close calls.
10. **Settings**: grace period (5, 10, 20 seconds), sound on or off (off by default), notification experiment on or off, export data (JSON download), import data.

Navigation: bottom tab bar with Kitchen, Recipe book, Goals, Stats. Settings from the Kitchen screen.

## 6. Data model (IndexedDB, via the `idb` library)

```ts
type Activity = 'reading' | 'study' | 'work' | 'creative' | 'other';
type Outcome = 'active' | 'cooked' | 'raw' | 'burnt';

interface Session {
  id: string;
  activity: Activity;
  goalId?: string;
  targetMin: number;
  startedAt: number;      // epoch ms
  endedAt?: number;
  focusedMin?: number;    // whole minutes, computed at the end
  outcome: Outcome;
  dishId?: string;        // cooked dish, or the failed dish for raw/burnt
  tier?: number;
  hiddenAt?: number;      // set while the page is hidden
  closeCalls: number;     // returns within the grace period
  note?: string;
}

interface Goal {
  id: string;
  title: string;
  activity: Activity;
  createdAt: number;
  finishedAt?: number;
}

interface Settings {
  graceSeconds: number;   // default 10
  sound: boolean;         // default false
  notifyExperiment: boolean;
  lastTargetMin: number;  // default 25
}
```

The collection, counts, streaks and stats are all derived from sessions. Only one session may be `active` at a time.

Implementation notes added in M1:

- The one `active` session is kept in `localStorage`, not IndexedDB, because the write is synchronous and so `hiddenAt` is safely stored before iOS suspends the page. It moves to IndexedDB when the session ends.
- `Session` also has `lastSeenAt` (a heartbeat written every 5 seconds while visible) and `leftKitchen`. If the page is killed without warning, the last heartbeat stands in for `hiddenAt`, so the focused minutes stay accurate.
- `Settings` also has `lastActivity`, remembered like `lastTargetMin`.

Home Screen PWAs on iOS are not subject to Safari's 7-day storage eviction, but keep the JSON export as a backup anyway.

## 7. Messages on the reveal screen

Three kinds, picked at random with personal stats most often:

1. **Personal stats** (always accurate, about 60%): for example "That is 3 hours 20 minutes of reading this week, 40 minutes more than last week." or "Your longest session yet!"
2. **Quotes** about reading, attention and patience (about 25%). Quotes are often misattributed online, so each one must be checked against a reliable source before it is added, and stored with its source.
3. **Research findings** (about 15%). Rules:
   - Only include a finding after reading the original paper or a reliable summary of it.
   - Word it carefully ("A 2016 study of 3,600 adults found...", "Research suggests..."). No exaggeration.
   - Store `{ text, source, url, strength: 'strong' | 'moderate' }` and show the source under the message.
   - Do not use commonly repeated but weak claims (for example, "6 minutes of reading reduces stress by 68%", which comes from a commercial study, not a peer-reviewed one).

Store messages in `src/data/messages.ts`. Start with stat templates only if verified quotes and findings are not ready yet; never fill gaps with unverified content.

## 8. Look and feel

- Warm, cosy and playful outside the cooking screen: cream background (around `#FAF6EE`), soft rounded cards, warm accent colours taken from the food art.
- Cooking screen: near-black (`#0B0B0C`), dim warm glow from the flame.
- Rounded, friendly typeface (for example "Nunito" or "Quicksand" from Google Fonts, self-hosted for offline use).
- Gentle animations only. Respect `prefers-reduced-motion`.
- Designed for iPhone portrait; respect safe areas (`env(safe-area-inset-*)`).
- Copy: British English, no en or em dashes, no contractions.

## 9. Tech

- Vite + React + TypeScript.
- `vite-plugin-pwa`: manifest (name, icons, `display: standalone`, theme colours) and an offline-first service worker that precaches all assets including dish images.
- `idb` for IndexedDB.
- Images: WebP, 512 px for the reveal screen and 256 px for the grid.
- Deploy: GitHub Pages via a GitHub Actions workflow. Set Vite `base` to the repository name.
- Tests: Vitest for `tierFor(minutes)`, `rollDish(tier, collection, rng)`, and the hidden/visible timing logic (inject a clock). Playwright with the "iPhone 15" device profile for: start session, reach target, serve, see dish in recipe book; stop early gives raw; hidden longer than grace gives burnt.

## 10. Milestones

| # | Milestone | Done when |
|---|---|---|
| M0 | Scaffold and deploy | Empty PWA installs on Jane's iPhone from GitHub Pages |
| M1 | Session engine | Timer, target, hold-to-stop, raw and burnt rules, wake lock, all unit tested |
| M2 | Reveal and recipe book | Uses placeholder art (emoji or simple shapes) so it can ship before the art is ready |
| M3 | Dish art | 20 dishes with cooked, raw and burnt images in place (see ART_GUIDE.md) |
| M4 | Goals, feasts, stats, messages | All screens in section 5 working |
| M5 | Polish and two-week trial | Jane uses it daily; collect notes for tuning |

## 11. Out of scope for version 1

Accounts, sync, friends and shared cooking, app blocking, App Store release, native app, push notifications from a server, in-app purchases.

## 12. Open questions for Jane (sensible defaults are already set)

1. Should leaving the app after the target burn the dish? Default: no, serve at the tier reached.
2. Grace period length. Default: 10 seconds.
3. Should the cooking screen show the elapsed time, or hide it so she is not tempted to check? Default: show it, small and dim.
4. Sound effects (gentle sizzle, lid lift). Default: off.
