export const WORKOUT_KINDS = [
  'kegel',
  'kegel_challenge',
  'pelvic_stretching',
  'groin_fitness',
] as const;

export type WorkoutKind = (typeof WORKOUT_KINDS)[number];

export const KIND_DEFAULT_TAG: Record<WorkoutKind, string> = {
  kegel: 'ӨНӨӨДРИЙН ДАСГАЛ',
  kegel_challenge: 'KEGEL CHALLENGE',
  pelvic_stretching: 'PELVIC STRETCHING',
  groin_fitness: 'GROIN FITNESS',
};
