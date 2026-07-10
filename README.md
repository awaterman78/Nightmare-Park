# Monster Clash

Monster Clash is a portrait mobile real time card battler set inside Nightmare Park.

The active production project is in [`unity`](unity). The existing browser game remains at repository root as a gameplay and art reference, but it is no longer the route to the final product.

## Playable vertical slice target

* One complete three minute match against an enemy opponent.
* Eight card deck with a rotating four card hand.
* Energy based deployment anywhere in the player's half.
* Two bridges across a blocked cursed river.
* Eight monster archetypes with distinct cost, health, damage, range and speed.
* Two defence towers and one heart tower per side.
* Victory, defeat, timed resolution and instant restart.
* Portrait touch controls and WebGL playtest build.

Run `npm run check` for repository smoke tests. Open the `unity` directory in Unity 6 for the production game.

## Product structure

* **Game:** Monster Clash.
* **World:** Nightmare Park.
* **First arena:** The Cursed Midway.
* **Original hook:** free placement plus monster transformations driven by a shared Fright Meter.

See [`docs/MONSTER_CLASH_VERTICAL_SLICE.md`](docs/MONSTER_CLASH_VERTICAL_SLICE.md) for the scope and acceptance criteria.
