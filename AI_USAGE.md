# AI usage

## Tool

OpenAI Codex assisted with component design, React and CSS implementation, documentation, and verification.

## Representative prompts

1. “Build a responsive, functional task dashboard from the current Figma reference. Use React or Next.js.”
2. “Implement case-insensitive title search, status tabs and priority filtering that work together.”
3. “Save task updates in localStorage and restore correctly after refresh; sample data should not overwrite saved data.”

## Implementation check

The persistence implementation was reviewed for the case where every task has been deleted. An empty saved array passes validation and hydrates as an empty board. The initializer falls back to sample tasks only for missing or invalid data. This keeps deliberate deletions intact after refresh.

## Code walkthrough

`App` owns the task collection. Follow `saveTask` or `updateStatus` to see how changes trigger both derived UI updates and localStorage writes. In `FocusNotes`, the displayed note and active indicator both use the same index.
