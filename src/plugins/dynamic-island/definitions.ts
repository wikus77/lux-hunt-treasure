
export interface DynamicIslandPlugin {
  startActivity(options: {
    type: string;
    data: {
      missionId: string;
      timeLeft: number;
      progress: number;
      status?: string;
    };
  }): Promise<{ success: boolean }>;
  
  updateActivity(options: {
    missionId: string;
    timeLeft: number;
    progress: number;
    status?: string;
  }): Promise<{ success: boolean }>;
  
  endActivity(options: {
    missionId: string;
  }): Promise<{ success: boolean }>;
}
