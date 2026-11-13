# The Art of Sacrifice

A ten minute strategy simulation set in 2014. You run a fictional US telecom for four budget cycles: read the dashboard, choose one of six strategies, fund it across ten options, choose the three measures your people are paid on, then see the plan in 1,000 simulated futures. The final screen reports AT&T's public record from 2014 to 2024.

Live: https://josebowen.github.io/ArtofSacrifice/

## What is real and what is modeled
- Real: the AT&T timeline on the final screen. Sources are in `data/sources-verified.md` and in the About panel.
- Modeled: the company "Meridian", its dashboard, the chip values, the staff responses and the 1,000 futures. The model is illustrative. It is not a forecast and not a model of AT&T.
- Each strategy has a similar middle result when fully funded and measured to match. That is a design choice: the model rewards alignment and does not use hindsight.
- The alignment score is a rubric written by the author. Strategy has no computable right answer.

## Build and test
    node build.mjs            # writes index.html from src/
    node test/scenarios.js    # prints model outcomes for nine test plans
    node test/copy.js         # copy checks
    node test/walk.js         # headless walkthrough at 1600x900 and 390x844 (needs playwright and Chrome)

URL options: `?seed=1854` fixes the futures. `?fast=1` skips animation.

Built by José Antonio Bowen with Claude Fable 5.2 for faculty workshops. More demos: https://weteachwithai.com/vibe-coding/
