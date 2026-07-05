# Grave Goblin Animation Spec v1

## Overall animation direction

Grave Goblin must feel alive, punchy and goblin-like.

Movement should feel like:

- Quick bursts
- Low scuttle
- Uneven rhythm
- Nervous twitching
- Dirty little creature energy

Do not animate him like a normal human runner.

## Clip list

```text
GG_Idle
GG_Spawn_Leap
GG_Scuttle_Walk
GG_Scuttle_Run
GG_Bone_Stab
GG_Hit_Reaction
GG_Death
GG_Victory_Snarl
```

## Clip details

### GG_Idle

Length:

1.5 to 2.2 seconds.

Loop:

Yes.

Direction:

- Hunched breathing
- Dagger twitch
- Eyes flick
- Ears twitch
- Tiny shoulder roll
- Foot shuffle

He should look impatient and dangerous.

### GG_Spawn_Leap

Length:

0.35 to 0.55 seconds.

Loop:

No.

Direction:

- Green puff start
- Pops forward into crouch
- Knees squash on landing
- Head snaps up
- Immediately ready to scuttle

### GG_Scuttle_Walk

Length:

0.7 to 0.9 seconds.

Loop:

Yes.

Direction:

- Cautious movement
- Low to the ground
- Small side-to-side movement
- Sneaky feet

Optional for later but useful for speed blending.

### GG_Scuttle_Run

Length:

0.45 to 0.65 seconds.

Loop:

Yes.

Direction:

- Fast low movement
- Uneven foot timing
- Head bob
- Shoulders twitch
- Arms forward
- Dagger low and ready
- Slight side-to-side weave
- Feet should feel quick and scratchy

This is the most important clip.

### GG_Bone_Stab

Length:

0.45 to 0.6 seconds.

Loop:

No.

Timing:

```text
0 to 25 percent: anticipation
25 to 45 percent: lunge
45 percent: impact frame
45 to 75 percent: recoil
75 to 100 percent: recover
```

Animation event:

```text
AnimEvent_BoneStabImpact
```

Direction:

- Pull dagger back
- Crouch lower
- Eyes brighten
- Fast forward stab
- Green slash
- Recoil backwards
- Return to stance

### GG_Hit_Reaction

Length:

0.2 to 0.35 seconds.

Loop:

No.

Direction:

- Snap backwards
- Shoulders jolt
- Angry facial reaction
- Quick recovery

Should not lock gameplay too long.

### GG_Death

Length:

0.5 to 0.8 seconds.

Loop:

No.

Direction:

- Small spin or collapse
- Dagger drops or flips
- Green puff
- Bone scatter
- Body disappears or settles

### GG_Victory_Snarl

Length:

0.8 to 1.2 seconds.

Loop:

No.

Direction:

- Raises dagger
- Snarls
- Little chest puff
- Ears twitch

Optional later.

## Animation events

Required:

```text
AnimEvent_BoneStabImpact
AnimEvent_FootstepLeft
AnimEvent_FootstepRight
AnimEvent_SpawnImpact
AnimEvent_DeathPuff
```

## Animator transitions

### Idle to Scuttle Run

Condition:

IsMoving true.

Should be instant or under 0.1 seconds.

### Scuttle Run to Idle

Condition:

IsMoving false.

Transition around 0.1 seconds.

### Any State to Bone Stab

Trigger:

BoneStab.

Should interrupt movement.

### Any State to Hit

Trigger:

Hit.

Should be brief.

### Any State to Death

Trigger:

Death.

Should override everything.

## Feel checklist

The movement is accepted when:

- He looks smaller than towers.
- He looks fast without becoming unreadable.
- His feet feel like they touch the ground.
- He has personality even when idle.
- Bone Stab feels nasty and satisfying.
