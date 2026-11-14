import { Quest } from '../types';

export const MAIN_QUESTS: Quest[] = [
  {
    id: 'mission_01_arrival',
    missionNumber: 'MISSION 01',
    title: 'THE ARRIVAL',
    district: 'residential',
    description: 'You arrive in the rain-slicked city after receiving an encrypted distress frequency. Locate your safehouse apartment in the Westside Residential district and search for Dr. Evelyn Vance\'s hidden journal.',
    status: 'active',
    isMainMission: true,
    objectives: [
      {
        id: 'obj_reach_apartment',
        description: 'Navigate to Safehouse Apartment in Westside Residential (-84, 175)',
        current: 0,
        target: 1,
        completed: false,
        location: { x: -84, y: 0, z: 175, radius: 12 }
      },
      {
        id: 'obj_discover_message',
        description: 'Inspect the desk to recover Dr. Vance\'s secret journal [Press E]',
        current: 0,
        target: 1,
        completed: false,
        location: { x: -84, y: 0, z: 175, radius: 4 }
      }
    ],
    rewards: {
      xp: 500,
      items: [
        {
          id: 'apartment_key',
          name: 'Westside Safehouse Key',
          description: 'Access key to Apartment 304.',
          type: 'key',
          quantity: 1
        }
      ]
    }
  },
  {
    id: 'mission_02_office',
    missionNumber: 'MISSION 02',
    title: 'THE FORGOTTEN OFFICE',
    district: 'industrial',
    description: 'The journal mentions an abandoned ChronoTech office in the Industrial District. Infiltrate the facility, search for declassified blueprints, and obtain the underground facility schematics.',
    status: 'inactive',
    isMainMission: true,
    objectives: [
      {
        id: 'obj_reach_office',
        description: 'Travel to the Abandoned ChronoTech Office in the Industrial District (150, -80)',
        current: 0,
        target: 1,
        completed: false,
        location: { x: 150, y: 0, z: -80, radius: 16 }
      },
      {
        id: 'obj_collect_blueprints',
        description: 'Search the office security safe and retrieve the Site-Zero blueprints [Press E]',
        current: 0,
        target: 1,
        completed: false,
        location: { x: 150, y: 0, z: -80, radius: 5 }
      }
    ],
    rewards: {
      xp: 750,
      items: [
        {
          id: 'industrial_passcard',
          name: 'ChronoTech Security Card',
          description: 'Level 3 security access badge.',
          type: 'key',
          quantity: 1
        }
      ]
    }
  },
  {
    id: 'mission_03_stranger',
    missionNumber: 'MISSION 03',
    title: 'THE STRANGER',
    district: 'forest',
    description: 'Dr. Vance\'s colleague, Marcus, went off-grid into the Northwood Forest Outskirts. Follow the radio telemetry to his secluded cabin, interrogate him, and secure the bunker access keycode.',
    status: 'inactive',
    isMainMission: true,
    objectives: [
      {
        id: 'obj_reach_cabin',
        description: 'Locate Marcus\'s secluded cabin in the Forest Outskirts (-180, -180)',
        current: 0,
        target: 1,
        completed: false,
        location: { x: -180, y: 0, z: -180, radius: 14 }
      },
      {
        id: 'obj_talk_marcus',
        description: 'Converse with Marcus and acquire the bunker bypass code [Press E]',
        current: 0,
        target: 1,
        completed: false,
        location: { x: -180, y: 0, z: -175, radius: 5 }
      }
    ],
    rewards: {
      xp: 1000,
      items: [
        {
          id: 'bunker_override_chip',
          name: 'Site-Zero Bypass Matrix',
          description: 'Decrypts the storm canal blast doors.',
          type: 'key',
          quantity: 1
        }
      ]
    }
  },
  {
    id: 'mission_04_beneath',
    missionNumber: 'MISSION 04',
    title: 'BENEATH THE CITY',
    district: 'underground',
    description: 'Find the concealed drainage conduit hatch in the Industrial canal and descend into the subterranean facility "Site-Zero". Connect your evidence to bypass the containment perimeter.',
    status: 'inactive',
    isMainMission: true,
    objectives: [
      {
        id: 'obj_enter_bunker',
        description: 'Enter the drainage hatch in Industrial Canal (180, -120) to descend underground',
        current: 0,
        target: 1,
        completed: false,
        location: { x: 180, y: 0, z: -120, radius: 8 }
      },
      {
        id: 'obj_download_telemetry',
        description: 'Access the mainframe terminal inside Site-Zero (600, 560)',
        current: 0,
        target: 1,
        completed: false,
        location: { x: 600, y: -35, z: 560, radius: 6 }
      }
    ],
    rewards: {
      xp: 1500
    }
  },
  {
    id: 'mission_05_truth',
    missionNumber: 'MISSION 05',
    title: 'THE TRUTH',
    district: 'underground',
    description: 'Infiltrate the Central Resonance Chamber. Stabilize the anomalous frequency orb, unlock Dr. Evelyn Vance\'s final echo transmission, and resolve the mystery of the Lost Signal.',
    status: 'inactive',
    isMainMission: true,
    objectives: [
      {
        id: 'obj_reach_core',
        description: 'Approach the Sub-Zero Resonance Core at (600, 600)',
        current: 0,
        target: 1,
        completed: false,
        location: { x: 600, y: -35, z: 600, radius: 10 }
      },
      {
        id: 'obj_align_resonance',
        description: 'Activate the Frequency Override Console to stabilize the signal [Press E]',
        current: 0,
        target: 1,
        completed: false,
        location: { x: 600, y: -35, z: 600, radius: 4 }
      }
    ],
    rewards: {
      xp: 3000
    }
  }
];
