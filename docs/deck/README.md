# docs/deck — deck working files (not tracked by git)

This whole folder is in `.gitignore`. Nothing here is committed or pushed, so it never
reaches the public repository. Keep your own backup of it.

## What is here

```text
docs/deck/
  README.md         this file
  BUILD-KIT.md      everything needed to finish the deck: slide text,
                    decisions, asset requests, checklists. Start here.
  figures.md        mermaid source for F1, F2 and F7, light-themed,
                    with export settings for PowerPoint
  slides/           the five content slides, 1920x1080 each
    deck.json       index: title, slide order, typefaces
    solution.html     slide 2  Our Solution
    technical.html    slide 3  Technical Approach
    feasibility.html  slide 4  Feasibility and Viability
    impact.html       slide 5  Impact and Benefits
    references.html   slide 6  Research and References
```

Suggested places for the rest, as Guide A Step 5 describes:

```text
  figures/          F1-F5 sources (.drawio / .excalidraw) and PNG exports
  screenshots/      C's six screenshots, B's network-monitor capture
  numbers.md        D's measured numbers and the exact model names, as sent
  SIH26154-deck.pptx   the final deck only, not every draft
```

## The slides

Live version: <https://claude.ai/artifact/C7HDQhJuRBqn5c2NMX7tcP> — private until shared
from that page's Share menu. Download it as `.pptx` or PDF from the same page.

Built to the pattern the winning SIH decks share: product name as the slide title, a
horizontal pipeline strip, a "why we stand out" panel, and the two drift examples given
centre stage as the problem.

**Placeholders still to fill:**

| Placeholder | Where | Decide |
| --- | --- | --- |
| `PRAMAAN` | the `<h1>` | Confirm the product name, or swap for MetaMorph.AI / another |
| `[Team name]` | the footer bar | The name registered on the SIH portal |

**No measured numbers are on this slide yet, deliberately.** D's table is due Sunday
27 September; until then a number on a slide must be in that table or labelled *target*
(Guide A, Step 8). Slide 4 is where the measured numbers go.

## Note

Guide A, Step 5 says to keep deck sources in the repository so nothing exists only on one
laptop. That is the opposite of ignoring this folder. If you want the safety of having it
in git, either remove the `docs/deck/` line from `.gitignore`, or push this folder to a
separate private repository.
