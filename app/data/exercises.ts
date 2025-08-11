// ~/data/exercises.ts
export type SplitKey = 'chestTris' | 'backBis' | 'legs' | 'shouldersAbs'

export const SPLITS: Record<SplitKey, string> = {
  chestTris: 'Chest/Triceps',
  backBis: 'Back/Biceps',
  legs: 'Legs',
  shouldersAbs: 'Shoulders/Abs',
}

export type Bodypart =
  | 'chest' | 'triceps'
  | 'back' | 'biceps'
  | 'legs' | 'quads' | 'hamstrings' | 'glutes' | 'calves'
  | 'shoulders' | 'abs' | 'core'

export interface Exercise {
  id: string           // slug
  name: string
  split: SplitKey
  bodypart: Bodypart
}

export const EXERCISES: Exercise[] = [
  // Chest/Triceps
  { id: 'bb-bench-press', name: 'Barbell Bench Press', split: 'chestTris', bodypart: 'chest' },
  { id: 'db-bench-press', name: 'Dumbbell Bench Press', split: 'chestTris', bodypart: 'chest' },
  { id: 'incline-bench', name: 'Incline Bench Press', split: 'chestTris', bodypart: 'chest' },
  { id: 'chest-dips', name: 'Dips (Chest)', split: 'chestTris', bodypart: 'chest' },
  { id: 'cable-fly', name: 'Cable Fly', split: 'chestTris', bodypart: 'chest' },
  { id: 'triceps-pushdown', name: 'Triceps Pushdown', split: 'chestTris', bodypart: 'triceps' },
  { id: 'skullcrushers', name: 'Skullcrushers', split: 'chestTris', bodypart: 'triceps' },

  // Back/Biceps
  { id: 'deadlift', name: 'Deadlift', split: 'backBis', bodypart: 'back' },
  { id: 'barbell-row', name: 'Barbell Row', split: 'backBis', bodypart: 'back' },
  { id: 'lat-pulldown', name: 'Lat Pulldown', split: 'backBis', bodypart: 'back' },
  { id: 'pull-ups', name: 'Pull-Ups', split: 'backBis', bodypart: 'back' },
  { id: 'seated-row', name: 'Seated Cable Row', split: 'backBis', bodypart: 'back' },
  { id: 'bb-curl', name: 'Barbell Curl', split: 'backBis', bodypart: 'biceps' },
  { id: 'db-curl', name: 'Dumbbell Curl', split: 'backBis', bodypart: 'biceps' },

  // Legs
  { id: 'back-squat', name: 'Back Squat', split: 'legs', bodypart: 'quads' },
  { id: 'front-squat', name: 'Front Squat', split: 'legs', bodypart: 'quads' },
  { id: 'leg-press', name: 'Leg Press', split: 'legs', bodypart: 'quads' },
  { id: 'rdl', name: 'Romanian Deadlift', split: 'legs', bodypart: 'hamstrings' },
  { id: 'walking-lunge', name: 'Walking Lunge', split: 'legs', bodypart: 'glutes' },
  { id: 'leg-curl', name: 'Leg Curl', split: 'legs', bodypart: 'hamstrings' },
  { id: 'calf-raise', name: 'Standing Calf Raise', split: 'legs', bodypart: 'calves' },

  // Shoulders/Abs
  { id: 'ohp', name: 'Overhead Press', split: 'shouldersAbs', bodypart: 'shoulders' },
  { id: 'db-shoulder-press', name: 'DB Shoulder Press', split: 'shouldersAbs', bodypart: 'shoulders' },
  { id: 'lateral-raise', name: 'Lateral Raise', split: 'shouldersAbs', bodypart: 'shoulders' },
  { id: 'rear-delt-fly', name: 'Rear Delt Fly', split: 'shouldersAbs', bodypart: 'shoulders' },
  { id: 'plank', name: 'Plank', split: 'shouldersAbs', bodypart: 'abs' },
  { id: 'cable-crunch', name: 'Cable Crunch', split: 'shouldersAbs', bodypart: 'abs' },
]

export const getExercisesForSplit = (split: SplitKey) =>
  EXERCISES.filter(e => e.split === split)
