// Mock data for Living Layers (Events, Agents, Zones)

export const MOCK_EVENTS = [
  { id: 'e_summit', name: 'Tech Summit 2025', lat: 37.7749, lng: -122.4194 },
  { id: 'e_hackathon', name: 'Global Hackathon', lat: 51.5074, lng: -0.1278 },
  { id: 'e_conference', name: 'AI Conference', lat: 35.6762, lng: 139.6503 },
];

export const MOCK_AGENTS = [
  { id: 'a_alpha', name: 'Agent Alpha', lat: 40.7128, lng: -74.0060 },
  { id: 'a_beta', name: 'Agent Beta', lat: 34.0522, lng: -118.2437 },
  { id: 'a_gamma', name: 'Agent Gamma', lat: 48.8566, lng: 2.3522 },
  { id: 'a_delta', name: 'Agent Delta', lat: -33.8688, lng: 151.2093 },
  { id: 'a_epsilon', name: 'Agent Epsilon', lat: 1.3521, lng: 103.8198 },
];

export const MOCK_ZONES = [
  {
    id: 'z_pacific',
    name: 'Pacific Zone',
    coordinates: [
      [35.0, -125.0],
      [45.0, -125.0],
      [45.0, -115.0],
      [35.0, -115.0],
    ] as [number, number][],
  },
  {
    id: 'z_europe',
    name: 'European Zone',
    coordinates: [
      [45.0, -5.0],
      [55.0, -5.0],
      [55.0, 15.0],
      [45.0, 15.0],
    ] as [number, number][],
  },
];

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
