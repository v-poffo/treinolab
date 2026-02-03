
export interface Exercise {
  name: string;
  sets: string;
  reps: string;
  muscleGroup: string;
  description: string;
  howTo: string;
  purpose: string;
}

export interface WorkoutDay {
  category: string; // 'A', 'B', 'C', 'D'
  title: string;
  exercises: Exercise[];
}

export interface WorkoutCycle {
  days: WorkoutDay[];
  generatedAt: string;
  totalCheckInsAtGeneration: number;
}

export interface CardioSession {
  type: 'Bike' | 'Corrida' | 'Funcional' | 'Abs';
  duration: string;
  intensity: string;
  instructions: string;
  didacticExplanation: string;
  intervals?: { label: string; seconds: number; description?: string }[];
  exercises?: { name: string; work: number; rest: number; instructions: string; howTo?: string }[];
}

export interface WeightEntry {
  date: string;
  value: number;
  waist?: number;
  neck?: number;
  hips?: number;
  fatPercentage?: number;
}

export interface DayLog {
  date: string;
  workoutDone?: string;
  cardioDone?: string;
  caloriesIn: number;
  weightAtDay?: number;
  notes?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  gender: 'M' | 'F';
  height: string;
  targetWeight: string;
  trainingFrequency: number;
  trainingGoal: string;
  weights: WeightEntry[];
  cycle: WorkoutCycle | null;
  cardio: CardioSession | null;
  abs: CardioSession | null;
  count: number;
  checkInDates: string[];
  history: { [key: string]: DayLog };
  meals: {
    [key: string]: MealAnalysis;
  };
}

export interface MealAnalysis {
  text: string;
  analysis: string;
  calories: number;
  macros?: {
    protein: number;
    carbs: number;
    fat: number;
  }
}
