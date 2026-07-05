# Grave Goblin Feel Tuning v1

## What we are tuning

The Grave Goblin must feel alive in play.

The model and animation matter, but the gameplay controller also needs little touches that create personality.

## Required feel elements

### 1. Scuttle movement

Movement should not be perfectly straight.

Use:

- Small side to side weave.
- Burst speed variation.
- Low quick body bob.
- Foot dust on movement.
- Fast turns but not instant snapping.

### 2. Spawn feel

Deployment should include:

- Small green ring.
- Grave puff.
- Spawn leap animation.
- Tiny screen pulse if close to camera.
- Card deselect.

### 3. Attack feel

Bone Stab should include:

- Anticipation.
- Lunge.
- Impact timing.
- Green slash.
- Damage number.
- Target flash.
- Small screen shake on first Bone Stab.

### 4. Hit feel

When hit:

- Goblin flinches.
- Brief material flash.
- Damage number appears.
- Health bar updates.
- Tiny knockback or recoil.

### 5. Death feel

Death should include:

- Short death animation.
- Green puff.
- Bone scatter.
- Health bar disappears.
- Body removed after delay.

## First tuning values

```text
Scuttle weave amplitude: 0.08 to 0.14 world units
Scuttle weave frequency: 8 to 12
Burst speed variation: plus/minus 15 percent
Turn speed: 12 to 16
First Bone Stab shake: 0.12
Normal hit shake: 0.04
Damage text lifetime: 0.8 to 1.0 seconds
```

## Pass condition

The player should want to deploy Grave Goblin again just to watch him move and stab.
