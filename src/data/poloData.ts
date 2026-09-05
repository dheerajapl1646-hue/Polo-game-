import { HorseProfile, TeamConfig } from '../types/polo';

export const POLO_TEAMS: TeamConfig[] = [
  {
    id: 'hurlingham',
    name: 'Hurlingham Polo Club',
    shortName: 'HURL',
    clubCity: 'London, UK',
    primaryColor: '#064e3b', // Racing Emerald Green
    secondaryColor: '#fef3c7', // Cream Gold
    accentColor: '#10b981',
    helmetColor: '#064e3b',
    handicap: 28,
    motto: 'Concordia et Virtus'
  },
  {
    id: 'palermo',
    name: 'Palermo Openers',
    shortName: 'PALM',
    clubCity: 'Buenos Aires, ARG',
    primaryColor: '#1e3a8a', // Albiceleste Royal Blue
    secondaryColor: '#f8fafc', // Crisp White
    accentColor: '#38bdf8',
    helmetColor: '#1e3a8a',
    handicap: 34,
    motto: 'El Corazón del Polo'
  },
  {
    id: 'greenwich',
    name: 'Greenwich Polo Club',
    shortName: 'GPC',
    clubCity: 'Connecticut, USA',
    primaryColor: '#7f1d1d', // Burgundy Crimson
    secondaryColor: '#fef3c7', // Champagne
    accentColor: '#f87171',
    helmetColor: '#7f1d1d',
    handicap: 26,
    motto: 'Tradition & Honor'
  },
  {
    id: 'dubai',
    name: 'Dubai Desert Kings',
    shortName: 'DUB',
    clubCity: 'Dubai, UAE',
    primaryColor: '#78350f', // Desert Amber & Gold
    secondaryColor: '#0f172a', // Obsidian
    accentColor: '#fbbf24',
    helmetColor: '#f59e0b',
    handicap: 32,
    motto: 'Power in the Dunes'
  },
  {
    id: 'st_moritz',
    name: 'St. Moritz Snow Flyers',
    shortName: 'STM',
    clubCity: 'Engadin, Switzerland',
    primaryColor: '#0f766e', // Alpine Glacier Teal
    secondaryColor: '#ffffff', // Snow White
    accentColor: '#2dd4bf',
    helmetColor: '#0f766e',
    handicap: 27,
    motto: 'Kings of the Ice'
  },
  {
    id: 'guards',
    name: 'Guards Polo Club',
    shortName: 'GDS',
    clubCity: 'Windsor, UK',
    primaryColor: '#4c0519', // Royal Guards Scarlet
    secondaryColor: '#fde047', // Sovereign Gold
    accentColor: '#e11d48',
    helmetColor: '#4c0519',
    handicap: 30,
    motto: 'Regal Majesty'
  }
];

export const POLO_PONIES: HorseProfile[] = [
  {
    id: 'pampa_flier',
    name: 'Pampa Flier',
    breed: 'Argentine Polo Pony (Criollo x TB)',
    color: '#854d0e', // Rich Chestnut
    maneColor: '#451a03',
    tailColor: '#451a03',
    speed: 8.5,
    acceleration: 9.0,
    agility: 9.2,
    stamina: 8.0,
    bumpWeight: 7.5,
    description: 'Renowned for lightning-quick turns and agility around the goal line.'
  },
  {
    id: 'silverado',
    name: 'Silverado',
    breed: 'Thoroughbred Cross',
    color: '#d6d3d1', // Dapple Grey / Silver
    maneColor: '#78716c',
    tailColor: '#57534e',
    speed: 9.4,
    acceleration: 8.2,
    agility: 8.0,
    stamina: 8.8,
    bumpWeight: 8.2,
    description: 'Blazing top speed across long open field gallops, unstoppable on the break.'
  },
  {
    id: 'royal_sovereign',
    name: 'Royal Sovereign',
    breed: 'English Polo Thoroughbred',
    color: '#1c1917', // Midnight Jet Black
    maneColor: '#0c0a09',
    tailColor: '#0c0a09',
    speed: 8.2,
    acceleration: 8.0,
    agility: 8.4,
    stamina: 9.5,
    bumpWeight: 9.2,
    description: 'A heavyweight powerhouse that dominates ride-offs and controls the Line of the Ball.'
  },
  {
    id: 'patagonia_storm',
    name: 'Patagonia Storm',
    breed: 'Argentine Criollo Stallion',
    color: '#a16207', // Golden Dun
    maneColor: '#292524',
    tailColor: '#292524',
    speed: 8.6,
    acceleration: 8.8,
    agility: 8.7,
    stamina: 9.0,
    bumpWeight: 8.5,
    description: 'Remarkably balanced with stamina to power through high-intensity chukkers.'
  },
  {
    id: 'desert_phantom',
    name: 'Desert Phantom',
    breed: 'Arabian Cross',
    color: '#ca8a04', // Rich Palomino Gold
    maneColor: '#fef08a',
    tailColor: '#fef08a',
    speed: 9.1,
    acceleration: 9.3,
    agility: 9.0,
    stamina: 7.8,
    bumpWeight: 7.0,
    description: 'Accelerates like a rocket; excels at quick penalty breaks and midfield pivots.'
  }
];

export const PLAYER_ROSTERS = {
  hurlingham: [
    { name: 'Lord Henry Albright', number: 1 as const, handicap: 7 },
    { name: 'Capt. James Sterling', number: 2 as const, handicap: 8 },
    { name: 'Arthur Montgomery (C)', number: 3 as const, handicap: 9 },
    { name: 'Edward Kensington', number: 4 as const, handicap: 4 },
  ],
  palermo: [
    { name: 'Gonzalo Pieres', number: 1 as const, handicap: 9 },
    { name: 'Facundo Cambiaso', number: 2 as const, handicap: 10 },
    { name: 'Nacho Figueras (C)', number: 3 as const, handicap: 9 },
    { name: 'Bautista Heguy', number: 4 as const, handicap: 6 },
  ],
  greenwich: [
    { name: 'Peter Brant Jr.', number: 1 as const, handicap: 6 },
    { name: 'Mariano Aguerre', number: 2 as const, handicap: 8 },
    { name: 'Tommy Biddle (C)', number: 3 as const, handicap: 7 },
    { name: 'Harrison Rhodes', number: 4 as const, handicap: 5 },
  ],
  dubai: [
    { name: 'Rashid Al Maktoum', number: 1 as const, handicap: 7 },
    { name: 'Pablo Mac Donough', number: 2 as const, handicap: 10 },
    { name: 'Adolfo Nero (C)', number: 3 as const, handicap: 9 },
    { name: 'Zayed Al Nahyan', number: 4 as const, handicap: 6 },
  ],
  st_moritz: [
    { name: 'Lucas Von Bern', number: 1 as const, handicap: 7 },
    { name: 'Marcello Moretti', number: 2 as const, handicap: 7 },
    { name: 'Gaston Laulhe (C)', number: 3 as const, handicap: 8 },
    { name: 'Sven Lindqvist', number: 4 as const, handicap: 5 },
  ],
  guards: [
    { name: 'Julian Somerset', number: 1 as const, handicap: 7 },
    { name: 'Sir William Darcy', number: 2 as const, handicap: 8 },
    { name: 'Rupert Cavendish (C)', number: 3 as const, handicap: 9 },
    { name: 'Charles Windsor', number: 4 as const, handicap: 6 },
  ]
};
