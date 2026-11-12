# The Compendium II — catalogue, preservation and acceptance

Development branch: `improvement/compendium-ii-coherence`
Source of truth: the nine-volume launcher manifest in `index.html`; the older README named the same nine but ordered four differently.
Published `main` and the original `COMPENDIUM` repository remain untouched.

## Collection identity

Nine distinct puzzles in a single lightweight, offline puzzle library. The collection shares a calm navigational language, meaningful local history, settings and a clear sense of where to return, but **never** standardises puzzle rules, scoring or solution feedback into one generic animation.

| Volume | Genre / challenge | Launch and replay model | Existing persistence / progress evidence | Mechanic-specific payoff |
| --- | --- | --- | --- | --- |
| I — Fell | Sandpile / one decisive cascade | Daily board (5×5, 6×6 or 7×7) or free generated board | `c2.v.fell.state[6/7]` and `stats[6/7]` (direct v1 objects); size setting; played/correct | Show the cascade and cleared targets; a correct one-move solution reads **Felled** |
| II — Mirrorwork | Timed matching of visual pairs | Random challenge, replay/share exact shuffle via URL | `c2.v.mirrorwork.prefs`, `best`; now `session` for matched cards, elapsed and the current deal | Paired-card reveal and a personal-best seal |
| III — Riffle | Word finding from a letter rack | Free racks at 5/6/7 letters; shared rack code | `c2.v.riffle.state`, `rack5/6/7`; now `complete` after the full dictionary sweep | Full-rack bonus and clean-sweep result |
| IV — Glean | Value route and escalating chain multiplier | Daily fixed board or free field; shared field index | `c2.v.glean.state`, `hauls`; now `run.daily` and `run.free` for an unfinished path | Score gains along the path, perfect-line result, best-haul comparison |
| V — Bight | Single-loop logic grid | Seeded daily and free generator | `c2.v.bight.day`, `free`, `stats` | The satisfying moment one uninterrupted rope closes |
| VI — Marquetry | Spatial veneer placement | Seeded daily and free 30-piece deals | `c2.v.marquetry.day`, `free`, `stats` | Completed rows/columns, a premium matched-wood multiplier and final score |
| VII — Reeve | Deduction: paid or owing plots | Seeded daily and free logic grids | `c2.v.reeve.day`, `free`, `stats` | Each justified judgement; 25 plots settled with mistakes/slips shown |
| VIII — Shunt | Move planning to free a van | Seeded daily and free rail yards | `c2.v.shunt.day`, `free`, `stats` | The van physically escapes, with par/hint quality clearly distinguished |
| IX — Furlong | Partition a field into numbered strips | Seeded daily and free region grids | `c2.v.furlong.day`, `free`, `stats` | Valid strips complete the field; final no-hint result |

All `C2.write` volume keys are wrapped `{v:1,d:<value>}` except Fell's legacy board/state keys, which use `{v:1,...}`. Do not rewrite or conflate these formats.

## Improvements on this branch

- The roll now explains **what each game is**, editorial difficulty, approximate activity length and whether its current challenge is **New**, **In progress**, or **Completed**. Filters and an earned nine-volume completion overview are based only on stored evidence.
- Last-opened dates are recorded locally in `c2.library.visits`. No cloud accounts, analytics, tracking or artificial cross-game streak are added.
- Mirrorwork now saves the dealt shuffle, matched pairs, elapsed time and moves. Reloading an unfinished game offers a paused deal with its actual cards, not a replacement deal. A shared challenge seed still overrides a different saved deal.
- Glean saves the actual current route; on resumption, every index, adjacency and uniqueness is checked and the score is **recomputed from board values**, not trusted from the save.
- Bight, Marquetry, Reeve, Shunt and Furlong can reopen an unfinished free board instead of incorrectly forcing today's daily board. Shunt's free board can resume even if the player has a previous best.
- Riffle records an actual clean sweep to distinguish a partially completed rack. Reeve's compulsory starting plot is not counted as player progress.
- Returning to the roll updates progress and uses a **puzzle-specific** completion sentence instead of all-purpose confetti. Existing game-specific sounds and feedback stay intact.
- Accessibility: keyboard-focus restoration, a focus loop for the settings/share sheet, Escape/back navigation, a text label for progress, readable difficulty metadata and reduced-motion protection.
- Performance: the launcher tests for nine baked blocks by DOM ID rather than decoding all nine large embedded HTML strings for every status redraw. Actual srcdoc is decoded only on opening a game.

## Tests completed and evidence

- Source inspection confirmed **9/9** manifest entries, **9/9** embedded volumes, and all ten shell/volume scripts passed a static JavaScript syntax parse in the connected inspection environment.
- The saved-state classifier passed **28/28 synthetic scenarios** across all nine volumes (fresh, in progress, complete and free-session return), before the later Reeve baseline refinement.
- `node qa/verify.mjs` is a reproducible dependency-free source/contract check on this branch. It does **not** constitute a successful browser solve.
- **Not yet verified:** a real Chrome/Edge/Safari end-to-end solve, interrupted save, refresh, resume and back-to-library for every one of the nine games. These are **blocking** acceptance tests before approval. Do not claim 9/9 E2E or publish this branch on the strength of static checks alone.

## Browser acceptance matrix — required before merge

Test each volume on mobile portrait and desktop keyboard. Use a fresh browser profile and a profile with existing `c2.` saves. Refresh mid-input and again after completion; confirm results and old records do not change.

| Volume | Solve or finish via UI | Interrupted save / restore | Invalid input / navigation |
| --- | --- | --- | --- |
| Fell | Use Show the move and choose the indicated well; verify settled cascade, correct result, daily persistence | Reload after a wrong move and retry on that exact board; check 5/6/7 independently | Locked cells during cascade; Back to roll after final result |
| Mirrorwork | Find every true pair and see win seal, score and best time | Stop after two matched pairs; refresh, inspect restored faces, elapsed time and pause; finish same deal | Repeated card flips, unmatched pairs, pause/mute, keyboard arrows |
| Riffle | Set every valid word in a rack, including the full rack, and bank sweep | Set several words, leave and reopen; check order, hints, score and found words | Duplicate words, invalid letters, Enter and touch reorder |
| Glean | Trace an allowed route to finish; inspect score and perfect-line feedback when applicable | Save two or more steps, refresh and complete; revisit the same field | Reject diagonal/reused cells, prevent extending past end, undo |
| Bight | Complete a valid closed loop and see finished result | Draw multiple rope edges and refresh; verify same edges, clock and hints | Open/branching/invalid rope, touch and keyboard |
| Marquetry | Place pieces to end-of-deal or no legal placement; check scoring and end panel | Place three pieces, rotate and refresh; verify placement, next piece and score | Reject overlap/out-of-bounds; rotate and keyboard placement |
| Reeve | Settle all 25 plots; check slips and final reading | Make justified judgements, leave and resume with known clues unchanged | Invalid/unsupported proof, hint penalty, keyboard selection |
| Shunt | Move van out of yard and check par-star outcome | Make several moves, refresh and continue same layout, even with existing personal best | Jammed state, undo and reset, click correct wagon end |
| Furlong | Cover every square with valid non-overlapping strips; confirm completion | Lay two strips and refresh; check exact placement and timers | Reject wrong-sized strips, overlap, clear/hint and keyboard |

Also verify deep links to a volume and its free puzzle, forward/back browser history, modal focus and dismiss, iOS Safari storage, sound off and reduced motion. Verify offline from a saved copy of `index.html`.

## Rule and product guardrails

Do not change seeded daily algorithms, scoring, validation, dictionary, original art or `c2.` key meanings without a separate rules review. The original `COMPENDIUM` repository has a different seven-game set and storage system: **share design conventions, not volatile gameplay code or key names**. Avoid adding daily or weekly challenges to games with random/free puzzle supply alone. Progress is a record of enjoyment, not an obligation.

**Release condition:** review and pass all nine browser solve/resume paths and regression checks, then obtain explicit approval before any merge/deploy.
