
export interface GameRules {
  weeklyBuzzLimits: {
    Free: number;
    Silver: number;
    Gold: number;
    Black: number;
  };
  mapRadiusProgression: {
    week1: { generation1: number; generation2: number; maxGenerations: number };
    week2: { generation1: number; generation2: number; generation3: number; maxGenerations: number };
    week3: { generation1: number; generation2: number; generation3: number; maxGenerations: number };
    week4: { generation1: number; generation2: number; generation3: number; generation4: number; maxGenerations: number };
  };
  clueRules: {
    noCityNames: boolean;
    useGenericLocations: boolean;
    maxCluesPerBuzz: number;
  };
  paymentRules: {
    requireVerificationBeforeAccess: boolean;
    blockUnpaidUsers: boolean;
    fakePaymentForDeveloper: boolean;
  };
}

export const MISSION_GAME_RULES: GameRules = {
  weeklyBuzzLimits: {
    Free: 1,
    Silver: 3,
    Gold: 7,
    Black: 999, // Illimitato per developer test
  },
  mapRadiusProgression: {
    week1: { 
      generation1: 500, // CRITICO: 500km iniziale LANCIO 19 LUGLIO
      generation2: 475,
      maxGenerations: 2 
    },
    week2: { 
      generation1: 350, 
      generation2: 332.5, 
      generation3: 315.875, 
      maxGenerations: 3 
    },
    week3: { 
      generation1: 250, 
      generation2: 237.5, 
      generation3: 225.625, 
      maxGenerations: 3 
    },
    week4: { 
      generation1: 100, 
      generation2: 95, 
      generation3: 90.25, 
      generation4: 85.7375, 
      maxGenerations: 4 
    },
  },
  clueRules: {
    noCityNames: true, // SEVERISSIMO: Mai nomi di città
    useGenericLocations: true,
    maxCluesPerBuzz: 1,
  },
  paymentRules: {
    requireVerificationBeforeAccess: true,
    blockUnpaidUsers: true,
    fakePaymentForDeveloper: true,
  },
};

export const useGameRules = () => {
  const getCurrentWeek = (): number => {
    // LANCIO 19 LUGLIO: Sempre settimana 1 per il test iniziale
    return 1;
  };

  const getMapRadius = (week: number, generation: number): number => {
    console.log('🎯 LANCIO RULES: Getting map radius for', { week, generation });
    
    const weekKey = `week${Math.min(week, 4)}` as keyof typeof MISSION_GAME_RULES.mapRadiusProgression;
    const weekRules = MISSION_GAME_RULES.mapRadiusProgression[weekKey];
    
    let radius: number;
    if (generation === 1) radius = weekRules.generation1;
    else if (generation === 2) radius = weekRules.generation2;
    else if (generation === 3 && 'generation3' in weekRules) radius = weekRules.generation3;
    else if (generation === 4 && 'generation4' in weekRules) radius = weekRules.generation4;
    else radius = weekRules.generation1;
    
    console.log('✅ LANCIO RULES: Calculated radius', { radius, week, generation });
    return radius;
  };

  const getBuzzLimit = (tier: string): number => {
    const limit = MISSION_GAME_RULES.weeklyBuzzLimits[tier as keyof typeof MISSION_GAME_RULES.weeklyBuzzLimits] || 1;
    console.log('📊 LANCIO RULES: Buzz limit for tier', { tier, limit });
    return limit;
  };

  const validateClueContent = (clueText: string): boolean => {
    if (!MISSION_GAME_RULES.clueRules.noCityNames) return true;
    
    // LISTA SEVERISSIMA: tutte le città da bannare negli indizi
    const forbiddenCities = [
      'ventimiglia', 'sanremo', 'imperia', 'genova', 'milano', 
      'torino', 'roma', 'napoli', 'palermo', 'catania', 'bari',
      'firenze', 'bologna', 'venezia', 'verona', 'padova',
      'nice', 'cannes', 'monaco', 'montecarlo', 'nizza', 'menton'
    ];
    
    const lowerClue = clueText.toLowerCase();
    const hasForbiddenCity = forbiddenCities.some(city => lowerClue.includes(city));
    
    if (hasForbiddenCity) {
      console.error('🚫 LANCIO VALIDATION: Clue contains forbidden city name:', clueText);
    }
    
    return !hasForbiddenCity;
  };

  return {
    getCurrentWeek,
    getMapRadius,
    getBuzzLimit,
    validateClueContent,
    gameRules: MISSION_GAME_RULES,
  };
};
