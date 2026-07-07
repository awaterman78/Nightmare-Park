# V15 Roadmap — Make the Map and Combat Feel Premium

V14 solves the immediate problem: the new map is in the game, and units are aware of walkable paths and blocked terrain.

V15 should focus on feel and depth.

## 1. Layered map rendering

Split the current single map image into gameplay layers:

- base terrain
- river/fog animation
- lamps/crystal glow
- foreground props
- collision/nav debug layer

## 2. Real enemy behaviour

Enemy AI should stop feeling random and start responding:

- defend the lane you pressure
- counter swarm with splash
- push opposite lane if you overcommit
- save energy for bigger units
- attack weak towers

## 3. Better card hand

Move from full test deck to real battle hand:

- 4-card hand
- next card preview
- rotation after deploy
- cooldown visual

## 4. Unit navigation polish

Add:

- lane switching for flying units
- obstacle-aware building placement
- bridge chokepoint crowding
- unit separation/avoidance
- target pursuit without leaving legal routes

## 5. Visual hierarchy

The map is now detailed. Next, units need to stay readable:

- stronger shadows
- outline/glow per team
- bigger hit flashes
- attack wind-up frames
- death bursts
