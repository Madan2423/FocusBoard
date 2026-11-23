# FocusBoard

A responsive single-user task dashboard built with React, Vite, CSS and Lucide icons. It runs entirely in the browser.

## Setup

Use Node.js 22 or newer.

```sh
npm ci
npm run dev
```

Open the URL printed by Vite. Use `npm run build` to generate `dist/` and `npm run preview` to preview the production build.

## Features and data flow

- Create, edit, and delete tasks. The form validates a trimmed title, and deletion requires confirmation. Each task has a unique ID, title, description, category, status, priority, and optional due date.
- Change status directly in a task row. Case-insensitive title search, status buttons, and the priority selector apply together.
- The dashboard keeps one task array in React `useState`. Add, edit, delete, and status updates use functional setters and create new arrays. Counts, completion rate, and filtered results are computed from the task array during rendering. React hooks are sufficient because the board has one owner and a small component tree.
- A lazy initializer loads and validates saved data. An effect saves the array to `focusboard.tasks.v1` in localStorage. A saved empty array stays empty. Missing or invalid data falls back to the six sample tasks.
- Focus Notes owns its slide index. Arrows, indicator buttons, and Left/Right keys within the carousel update the same index. Navigation wraps around.
- Native dialogs support keyboard focus and Escape. Both the task form and confirmation restore focus when closed.

## Design and limitations

The supplied brief included frame IDs without a resolvable Figma file URL. Layout, colors, typography, and Focus Notes copy are provisional interpretations. The live Figma frames are needed to match the visuals and all three slides exactly. The sidebar links navigate within the dashboard. The profile display is static.

Tasks persist in the current browser and origin. Cross-device and cross-tab synchronization are outside the implementation scope.

## Deployment

- Framework preset: Vite
- Install command: `npm ci`
- Build command: `npm run build`
- Output directory: `dist`
- Hosted URL: pending
- Public GitHub URL: pending

Deploy the project as a static site on Vercel, Netlify, or an equivalent provider. Add both URLs here before submitting.

## Verification and screenshots

The production build was checked with Chromium at 1440, 768, and 390 px. Checks covered horizontal overflow in the dashboard and form, title validation, task creation and editing, immediate status/statistics updates, combined filters, persistence after refresh, deletion confirmation, an empty saved board, and carousel arrows and indicators.

- [Desktop screenshot](screenshots/desktop.png)
- [Mobile screenshot](screenshots/mobile.png)
