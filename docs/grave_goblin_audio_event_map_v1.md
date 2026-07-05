# Grave Goblin Audio Event Map v1

## Animation event to audio map

| Animation event | Audio |
|---|---|
| AnimEvent_SpawnImpact | spawn_pop.wav |
| AnimEvent_FootstepLeft | scuttle_step_01.wav or scuttle_step_02.wav |
| AnimEvent_FootstepRight | scuttle_step_01.wav or scuttle_step_02.wav |
| AnimEvent_BoneStabImpact | bone_stab.wav |
| Health damaged | hit_squeak.wav |
| AnimEvent_DeathPuff | death_puff.wav |

## UI event to audio map

| UI event | Audio |
|---|---|
| Card selected | card_select.wav |
| Invalid placement | invalid_placement.wav |
| Victory | victory.wav |
| Defeat | defeat.wav |

## Tower event to audio map

| Combat event | Audio |
|---|---|
| Tower fires | tower_bolt.wav |

## Volume guidance

First pass suggested volumes:

```text
Spawn pop: 0.75
Footsteps: 0.35
Bone Stab: 0.8
Hit squeak: 0.65
Death puff: 0.75
Tower bolt: 0.45
Card select: 0.6
Invalid placement: 0.45
Victory: 0.8
Defeat: 0.75
```

## Pitch variation

For common repeated sounds, use pitch variation:

```text
0.92 to 1.08
```

Especially:

- footstep
- hit
- tower bolt
