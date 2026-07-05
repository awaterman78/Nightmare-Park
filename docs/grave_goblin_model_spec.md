# Grave Goblin Model Spec

## Character summary

Grave Goblin is a small, nasty melee unit. He should look like a creature dragged out of a haunted graveyard, not a generic fantasy goblin.

## Shape language

Primary shape:

Small hunched triangle.

Silhouette priorities:

- Big ears
- Hooded head
- Pointed dagger
- Long arms
- Bent knees
- Low crouch

The silhouette must read clearly from the top-down arena camera.

## Body proportions

Approximate proportions:

```text
Head: large, around 30 percent of body height
Ears: exaggerated, wide and readable
Torso: short and hunched
Arms: slightly long
Hands: clawed and expressive
Legs: short, bent and springy
Feet: oversized enough to support scuttle movement
```

## Size target in Unity

Initial scale target:

```text
World height: around 0.75 to 0.9 Unity units
Tower height reference: around 2.4 to 2.8 Unity units
```

He should feel around one third of a tower height.

## Face

Required:

- Glowing green eyes
- Sharp teeth
- Mischievous snarl
- Strong brow
- Readable mouth shape
- Slight asymmetry if possible

The expression should say:

"I am about to stab something and I am delighted about it."

## Clothing

Required:

- Dark stitched hood
- Ragged cloth layers
- Leather belt or straps
- Bone charms
- Dirty wraps
- Small skull ornament or tooth necklace

Avoid:

- Clean fantasy armour
- Cute goblin
- Noble warrior costume
- Too many tiny details that vanish on mobile

## Weapon

Bone dagger.

Requirements:

- Jagged bone shape
- Slight green glow or rune detail
- Large enough to read during attack
- Must have a WeaponTipAnchor in Unity

## Materials

Suggested material groups:

```text
M_GG_Skin_Green
M_GG_Hood_DarkPurple
M_GG_Cloth_Ragged
M_GG_Bone_Dagger
M_GG_EyeGlow
M_GG_Straps_Leather
```

## Texture style

Stylised hand-painted or stylised PBR.

Mobile-friendly.

Strong colour blocking.

Avoid muddy detail.

## Colour palette

Skin:

Sickly green with darker shaded elbows, fingers and ears.

Eyes:

Bright green glow.

Clothing:

Dark purple, charcoal, dirty brown.

Bone:

Warm ivory.

Accent:

Small neon green highlights.

## LOD thinking

Not required for first test, but design with future optimisation in mind.

Keep the mesh mobile friendly.

Avoid absurdly high geometry on tiny bones, teeth and straps.
