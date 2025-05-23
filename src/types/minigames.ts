
export interface UserMinigameProgress {
  id: string;
  user_id: string;
  game_key: string;
  completed: boolean;
  score: number;
  last_played: string;
}

export type GameKey = 
  | 'memory_hack'
  | 'bomb_defuse'
  | 'crack_combination'
  | 'find_map_point'
  | 'satellite_tracking'
  | 'flash_interrogation';

export interface MinigameMetadata {
  key: GameKey;
  title: string;
  description: string;
  maxScore: number;
  difficultyLevel: number;
  estimatedTimeMinutes: number;
}
