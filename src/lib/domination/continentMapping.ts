/**
 * Risiko Domination - Continent Mapping
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

// ISO 3166-1 alpha-2 country codes per continent
export const CONTINENT_COUNTRIES: Record<string, string[]> = {
  EUROPE: [
    'IT', 'FR', 'DE', 'ES', 'PT', 'GB', 'NL', 'BE', 'AT', 'CH',
    'PL', 'CZ', 'SK', 'HU', 'RO', 'BG', 'GR', 'HR', 'SI', 'SE',
    'NO', 'DK', 'FI', 'IE', 'LT', 'LV', 'EE'
  ],
  ASIA: [
    'CN', 'JP', 'KR', 'IN', 'ID', 'TH', 'VN', 'MY', 'PH', 'SG',
    'AE', 'SA', 'TR', 'IL', 'IR', 'IQ', 'PK', 'BD'
  ],
  NORTH_AMERICA: ['US', 'CA', 'MX'],
  SOUTH_AMERICA: ['BR', 'AR', 'CL', 'CO', 'PE', 'VE', 'EC', 'BO', 'PY', 'UY'],
  AFRICA: ['ZA', 'EG', 'NG', 'KE', 'MA', 'DZ', 'TN', 'GH', 'ET', 'TZ'],
  OCEANIA: ['AU', 'NZ', 'FJ', 'PG']
};

// Reverse mapping: country → continent
export const COUNTRY_TO_CONTINENT: Record<string, string> = {};
Object.entries(CONTINENT_COUNTRIES).forEach(([continent, countries]) => {
  countries.forEach(country => {
    COUNTRY_TO_CONTINENT[country] = continent;
  });
});

// Country names for display
export const COUNTRY_NAMES: Record<string, string> = {
  IT: 'Italia', FR: 'Francia', DE: 'Germania', ES: 'Spagna', PT: 'Portogallo',
  GB: 'Regno Unito', NL: 'Paesi Bassi', BE: 'Belgio', AT: 'Austria', CH: 'Svizzera',
  PL: 'Polonia', CZ: 'Repubblica Ceca', SK: 'Slovacchia', HU: 'Ungheria',
  RO: 'Romania', BG: 'Bulgaria', GR: 'Grecia', HR: 'Croazia', SI: 'Slovenia',
  SE: 'Svezia', NO: 'Norvegia', DK: 'Danimarca', FI: 'Finlandia', IE: 'Irlanda',
  CN: 'Cina', JP: 'Giappone', KR: 'Corea del Sud', IN: 'India', ID: 'Indonesia',
  TH: 'Thailandia', VN: 'Vietnam', MY: 'Malaysia', PH: 'Filippine', SG: 'Singapore',
  AE: 'Emirati Arabi', SA: 'Arabia Saudita', TR: 'Turchia', IL: 'Israele',
  US: 'Stati Uniti', CA: 'Canada', MX: 'Messico',
  BR: 'Brasile', AR: 'Argentina', CL: 'Cile', CO: 'Colombia', PE: 'Perù',
  ZA: 'Sudafrica', EG: 'Egitto', NG: 'Nigeria', KE: 'Kenya', MA: 'Marocco',
  AU: 'Australia', NZ: 'Nuova Zelanda'
};

// Continent names
export const CONTINENT_NAMES: Record<string, string> = {
  EUROPE: 'Europa',
  ASIA: 'Asia',
  NORTH_AMERICA: 'Nord America',
  SOUTH_AMERICA: 'Sud America',
  AFRICA: 'Africa',
  OCEANIA: 'Oceania'
};

// Check if user owns entire continent
export function checkContinentOwnership(ownedCountries: string[], continent: string): boolean {
  const continentCountries = CONTINENT_COUNTRIES[continent];
  if (!continentCountries) return false;
  return continentCountries.every(country => ownedCountries.includes(country));
}

// Get all owned continents
export function getOwnedContinents(ownedCountries: string[]): string[] {
  return Object.keys(CONTINENT_COUNTRIES).filter(continent =>
    checkContinentOwnership(ownedCountries, continent)
  );
}

