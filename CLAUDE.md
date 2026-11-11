# CLAUDE.md - The Compendium II

Instructions for AI assistants working in this repository.

## What this is

The second Compendium: nine puzzle volumes in one file - Fell, Mirrorwork, Riffle, Glean, Reeve, Shunt, Bight, Marquetry and Furlong. Shared links read "Compendium 2 - Nine puzzles for you to play".

- Live: https://connex222.github.io/COMPENDIUM-2/ (GitHub Pages, updates automatically from `main`)
- Audience: Puzzle players on phones.

## Architecture

- **One self-contained file: `index.html`.** All CSS, JavaScript, fonts and artwork live inside it.
- State is saved in the browser's `localStorage`. All keys start with `c2.`. Never rename an existing key without migrating the old data, or players lose their progress.

## Hard rules

- **Fully offline.** No network requests: no CDNs, no fonts or images from the internet, no analytics, no `fetch`.
- **No external dependencies.** Everything stays inside `index.html`.
- Readable in direct sunlight and in the dark (provide both light and dark themes with strong contrast).
- Works one-handed on a phone in portrait, and safe to interrupt at any moment without losing progress.
- Free to use. Do not add adverts, tracking or sign-ups.

## Project notes

- Shaun will not release Compendium II until all nine volumes are finished. Do not suggest shipping a subset.
- Volumes must be moreish and leave a result worth showing other people.
- Volumes run in a same-origin iframe so their `const` names cannot collide. Keep each volume self-contained.

## Working with Shaun (the owner)

- Shaun is not a programmer. Explain every step in plain English, in order, and assume no prior knowledge.
- Always return the complete `index.html`, never partial snippets or "..." placeholders.
- Use UK English.
- Before saying a change is finished, check that the file still opens with no errors in the browser console.
- Never force-push, rewrite history or rename the repository.
