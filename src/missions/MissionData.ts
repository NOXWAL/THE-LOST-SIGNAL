import { Quest } from '../types';

export const INITIAL_MISSIONS: Quest[] = [
  {
    id: 'quest_first_transmission',
    title: 'The Lost Signal: Origin',
    description: 'A faint repeating distress loop detected from Beacon Alpha in Sector 4. Investigate the transmission tower.',
    status: 'active',
    objectives: [
      {
        id: 'reach_beacon_alpha',
        description: 'Locate and approach Beacon Alpha (-30, -40)',
        current: 0,
        target: 1,
        completed: false
      },
      {
        id: 'calibrate_frequency',
        description: 'Align frequency receiver to 142.8 MHz',
        current: 0,
        target: 1,
        completed: false
      }
    ],
    rewards: {
      xp: 250,
      items: [
        {
          id: 'signal_decoder_t1',
          name: 'Signal Decoder T1',
          description: 'Decrypts weak automated distress pings.',
          type: 'signal_decoder',
          quantity: 1
        }
      ]
    }
  },
  {
    id: 'quest_broken_repeater',
    title: 'Relay Synchronization',
    description: 'Restore power to secondary radar relays across the perimeter.',
    status: 'inactive',
    objectives: [
      {
        id: 'collect_power_cells',
        description: 'Recover Ion Cells from maintenance crates',
        current: 0,
        target: 3,
        completed: false
      }
    ]
  }
];
