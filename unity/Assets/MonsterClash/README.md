# Monster Clash Unity vertical slice

This folder is the clean Unity 6 gameplay foundation for Monster Clash.

## Current playable loop

* Eight card deck and four card rotating hand.
* Energy economy with double energy in the final minute.
* Free deployment anywhere in the player's half.
* Two bridge navigation around a blocked cursed river.
* Eight distinct monster stat profiles and procedural visual stand ins.
* Defensive towers, heart towers, projectiles, health bars and destruction.
* Enemy deployment AI that reacts to deep threats.
* Three minute match, timed resolution, victory, defeat and restart.
* Portrait WebGL input and HUD.

## Open in Unity

Open the `unity` directory as a Unity project. Use `Monster Clash > Prepare Arena One`, then enter Play mode.

The scene deliberately remains almost empty. `MonsterClashBootstrap` constructs the complete test arena at runtime, which keeps local and cloud builds deterministic while art assets are still being integrated.

## Build

Use `Monster Clash > Build WebGL`, or run the GitHub Actions Unity WebGL workflow. The build output is written to `builds/MonsterClashWebGL` at repository root.

## Art boundary

The procedural characters prove gameplay and scale only. Replace each `MonsterCard.ModelPrefab` with the final rigged model. Game logic does not need to change when production art arrives.
