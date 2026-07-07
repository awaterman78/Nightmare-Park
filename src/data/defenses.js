export const DEFENSE_LIBRARY = Object.freeze({
  soulLanternTurret: {
    id: 'soulLanternTurret',
    name: 'Soul Lantern Turret',
    shortName: 'Lantern',
    role: 'Side Defence',
    slotType: 'side',
    hp: 430,
    radius: 25,
    range: 118,
    damage: 15,
    attackEvery: 0.82,
    projectile: 'soulBolt',
    palette: {
      stone: '#1a2631',
      stone2: '#2a3f4d',
      roof: '#23335e',
      glow: '#88efff',
      accent: '#7dff66',
      metal: '#b7eaff'
    },
    customisable: true,
    upgradeTrack: ['range lens', 'frost lantern', 'chain spark']
  },
  cursedSkullTurret: {
    id: 'cursedSkullTurret',
    name: 'Cursed Skull Turret',
    shortName: 'Skull',
    role: 'Enemy Defence',
    slotType: 'side',
    hp: 430,
    radius: 25,
    range: 118,
    damage: 15,
    attackEvery: 0.82,
    projectile: 'bloodBolt',
    palette: {
      stone: '#311925',
      stone2: '#4b2231',
      roof: '#4a1025',
      glow: '#ff5b6e',
      accent: '#ffd86f',
      metal: '#ffc0c9'
    },
    customisable: true,
    upgradeTrack: ['bleed lens', 'panic pulse', 'bone shrapnel']
  },
  greenGateCore: {
    id: 'greenGateCore',
    name: 'Haunted Gate Core',
    shortName: 'Gate',
    role: 'Player Core',
    slotType: 'core',
    hp: 820,
    radius: 34,
    range: 138,
    damage: 19,
    attackEvery: 0.68,
    projectile: 'gateBolt',
    palette: {
      stone: '#15251e',
      stone2: '#294538',
      roof: '#203c2e',
      glow: '#7dff66',
      accent: '#88efff',
      metal: '#d4ffe4'
    },
    customisable: true,
    upgradeTrack: ['core ward', 'soul beam', 'panic shield']
  },
  crimsonMausoleumCore: {
    id: 'crimsonMausoleumCore',
    name: 'Crimson Mausoleum Core',
    shortName: 'Mausoleum',
    role: 'Enemy Core',
    slotType: 'core',
    hp: 820,
    radius: 34,
    range: 138,
    damage: 19,
    attackEvery: 0.68,
    projectile: 'mausoleumBolt',
    palette: {
      stone: '#2b1620',
      stone2: '#462130',
      roof: '#5d142b',
      glow: '#ff5b6e',
      accent: '#d58cff',
      metal: '#ffd0da'
    },
    customisable: true,
    upgradeTrack: ['doom bell', 'curse beam', 'blood shield']
  }
});

export const DEFAULT_DEFENSE_LOADOUT = Object.freeze({
  player: {
    left: 'soulLanternTurret',
    right: 'soulLanternTurret',
    core: 'greenGateCore'
  },
  enemy: {
    left: 'cursedSkullTurret',
    right: 'cursedSkullTurret',
    core: 'crimsonMausoleumCore'
  }
});

export function getDefense(defenseId) {
  return DEFENSE_LIBRARY[defenseId] || DEFENSE_LIBRARY.soulLanternTurret;
}
