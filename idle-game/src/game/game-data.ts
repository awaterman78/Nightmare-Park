export type Upgrade = {
  id: string;
  name: string;
  description: string;
  icon: string;
  baseCost: number;
  income: number;
};

export type SceneDefinition = {
  id: string;
  name: string;
  strapline: string;
  startAt: number;
  target: number;
  accent: string;
  skyTop: string;
  skyBottom: string;
  upgrades: Upgrade[];
  revealNames: string[];
};

export const SCENES: SceneDefinition[] = [
  {
    id: 'deadmans-field',
    name: "Deadman's Field",
    strapline: 'One rotten field. Unlimited dreadful potential.',
    startAt: 0,
    target: 10_000,
    accent: '#b8ff5c',
    skyTop: '#17112d',
    skyBottom: '#45245e',
    revealNames: ['Crooked gate', 'Ticket shack', 'Grave Goblin', 'Ghost train', 'Cursed carousel'],
    upgrades: [
      {
        id: 'handcart',
        name: 'Haunted Handcart',
        description: 'A squeaky cart and one deeply suspicious sheet.',
        icon: '🛒',
        baseCost: 25,
        income: 1,
      },
      {
        id: 'ticket-shack',
        name: 'Crooked Ticket Shack',
        description: 'Cash only. Refunds never. Customers occasionally.',
        icon: '🎟️',
        baseCost: 150,
        income: 6,
      },
      {
        id: 'grave-goblin',
        name: 'Grave Goblin',
        description: 'Small, green and worryingly good with a shovel.',
        icon: '👹',
        baseCost: 750,
        income: 28,
      },
      {
        id: 'ghost-train',
        name: 'Rattling Ghost Train',
        description: 'Three carriages, no brakes and several complaints.',
        icon: '🚂',
        baseCost: 3_500,
        income: 120,
      },
    ],
  },
  {
    id: 'cursed-carnival',
    name: 'Cursed Carnival',
    strapline: 'The crowds are bigger. So are the screams.',
    startAt: 10_000,
    target: 500_000,
    accent: '#ffcf4a',
    skyTop: '#100c35',
    skyBottom: '#7a1f62',
    revealNames: ['Neon entrance', 'Screaming carousel', 'Cursed big top', 'Witch tower', 'Hellhound parade'],
    upgrades: [
      {
        id: 'screaming-carousel',
        name: 'Screaming Carousel',
        description: 'It goes round. Nobody remembers getting off.',
        icon: '🎠',
        baseCost: 10_000,
        income: 260,
      },
      {
        id: 'cursed-big-top',
        name: 'Cursed Big Top',
        description: 'The clowns are not employees. Best not to ask.',
        icon: '🎪',
        baseCost: 32_000,
        income: 820,
      },
      {
        id: 'midnight-witch',
        name: 'Midnight Witch',
        description: 'Marketing, spells and crowd control in one package.',
        icon: '🧙',
        baseCost: 90_000,
        income: 2_400,
      },
      {
        id: 'hellhound-parade',
        name: 'Hellhound Parade',
        description: 'Every night at nine. Bring protective trousers.',
        icon: '🐺',
        baseCost: 220_000,
        income: 6_500,
      },
    ],
  },
  {
    id: 'haunted-resort',
    name: 'Haunted Resort',
    strapline: 'Five star luxury. One star survival rating.',
    startAt: 500_000,
    target: 50_000_000,
    accent: '#69e7ff',
    skyTop: '#061b38',
    skyBottom: '#164f64',
    revealNames: ['Grand entrance', 'Phantom pool', 'Haunted hotel', 'Demon casino', 'Portal penthouse'],
    upgrades: [
      {
        id: 'phantom-pool',
        name: 'Phantom Pool',
        description: 'Heated, moonlit and absolutely not bottomless.',
        icon: '🏊',
        baseCost: 500_000,
        income: 12_000,
      },
      {
        id: 'haunted-hotel',
        name: 'Haunted Hotel',
        description: 'Room service is quick. Checkout takes eternity.',
        icon: '🏨',
        baseCost: 1_800_000,
        income: 45_000,
      },
      {
        id: 'demon-casino',
        name: 'Demon Casino',
        description: 'The house always wins. The house is also alive.',
        icon: '🎰',
        baseCost: 6_000_000,
        income: 155_000,
      },
      {
        id: 'portal-penthouse',
        name: 'Portal Penthouse',
        description: 'Executive views across several cursed dimensions.',
        icon: '🌀',
        baseCost: 18_000_000,
        income: 520_000,
      },
    ],
  },
];

export const REVEAL_POINTS = [0, 0.14, 0.34, 0.6, 0.84];
