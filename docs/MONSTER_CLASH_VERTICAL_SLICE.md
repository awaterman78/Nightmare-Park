# Monster Clash vertical slice

## Product promise

Monster Clash should deliver the speed and readability of a premium mobile card battler while building its own identity around horror comedy, free placement and mid battle monster transformations.

The game is Monster Clash. Nightmare Park is its world and expandable arena theme.

## Match rules

| Rule | Vertical slice |
| --- | --- |
| Match length | 3 minutes |
| Energy | 5 starting, 10 maximum, 1 per second |
| Final minute | Double energy |
| Deck | 8 cards |
| Hand | 4 rotating cards plus next card preview |
| Placement | Anywhere in the player's half, excluding the river |
| Routes | Two bridges selected dynamically from deployment and target position |
| Defences | 2 side towers and 1 heart tower per player |
| Immediate win | Destroy the enemy heart tower |
| Time limit | Highest remaining combined tower health wins |

## Starter roster

| Monster | Cost | Job |
| --- | ---: | --- |
| Grave Goblin | 2 | Fast melee pressure |
| Candle Imp | 3 | Ranged fire support |
| Tin Bat | 2 | Flying bridge bypass |
| Mirror Clown | 4 | Durable lane control |
| Zombie Runner | 3 | Fast building hunter |
| Bone Brute | 5 | Frontline tank |
| Phantom Bride | 4 | Spectral ranged support |
| Werewolf King | 6 | Heavy legendary bruiser |

## What is implemented in the foundation

The Unity runtime contains the complete base match loop, card cycle, energy economy, free placement validation, two bridge pathing, monster targeting, melee and ranged combat, towers, projectiles, enemy deployment logic, HUD, match resolution and restart.

Procedural character stand ins are generated at runtime so the build remains playable before the rigged production models arrive. `MonsterCard.ModelPrefab` is the replacement boundary for finished monster art.

## Production quality gates

The vertical slice is not approved until all of the following are true.

1. One complete match can be played on an iPhone sized portrait screen without instructions.
2. All eight monsters are instantly distinguishable at battle camera distance.
3. Movement, anticipation, impact, hit reaction and death are animated for every monster.
4. Deployment, tower fire, damage and destruction each have readable sound and visual feedback.
5. The arena uses real 3D geometry, lighting, fog, particles and layered ambience.
6. A stable WebGL playtest maintains 50 frames per second on the agreed test machine.
7. No placeholder model or programmer UI appears in the quality review build.

## Next production pass

1. Compile the clean Unity foundation through the cloud workflow.
2. Integrate a legal animated 3D monster pack for internal playtesting.
3. Replace the procedural HUD with the final card and battle interface.
4. Tune combat from recorded full match playtests.
5. Add the Fright Meter and one transformation as the first unmistakably original mechanic.
6. Commission or generate production model sheets, then build custom rigged replacements one monster at a time.
