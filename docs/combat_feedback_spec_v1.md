# Combat Feedback Spec v1

## Purpose

Every important combat action should give immediate feedback.

## Deployment feedback

When Grave Goblin is placed:

- Show green deployment ring.
- Play spawn puff.
- Play spawn sound.
- Trigger SpawnLeap animation.

## Damage feedback

When damage is dealt:

- Floating number appears.
- Damaged object flashes.
- Health bar changes.
- Small impact VFX appears.

## Tower fire feedback

Tower attacks should be readable.

First version:

- Instant damage is acceptable.
- Show a quick bolt line from tower to target.
- Play small hit effect on target.

## Bone Stab feedback

Bone Stab needs special treatment:

- Green slash effect.
- First hit damage text in gold.
- Slight screen shake.
- Target flash.

## Death feedback

On death:

- Trigger death animation.
- Spawn death puff.
- Hide health bar.
- Destroy unit after animation.

## Screen shake rule

Use screen shake lightly.

Too much shake makes a mobile game feel cheap.

Use only for:

- First Bone Stab
- Core damage
- Tower destruction
- Death puff if close
