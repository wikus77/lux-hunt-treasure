
export interface MapSettings {
  tileUrl: string;
  attribution: string;
}

export function getDefaultMapSettings(): MapSettings {
  return {
    tileUrl: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  };
}
