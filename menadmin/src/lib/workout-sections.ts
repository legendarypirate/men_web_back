import { WorkoutExercise, WorkoutExercisePhase } from '@/lib/api';
import { normalizePhases, templateForMotion } from '@/lib/workout-phase-templates';

export type WorkoutSectionType =
  | 'kegelHold'
  | 'relax'
  | 'breath'
  | 'coreBrace'
  | 'stretch';

export type WorkoutSection = {
  id: string;
  label: string;
  type: WorkoutSectionType;
  durationSeconds: number;
  sets: number;
  holdSeconds: number;
  relaxSeconds: number;
  vibrationEnabled: boolean;
  vibrationIntervalMs: number;
  instruction: string;
};

export const SECTION_TYPE_OPTIONS: { value: WorkoutSectionType; label: string }[] = [
  { value: 'kegelHold', label: 'Кегелийн барилт' },
  { value: 'relax', label: 'Амрах' },
  { value: 'breath', label: 'Амьсгал' },
  { value: 'coreBrace', label: 'Гол булчин' },
  { value: 'stretch', label: 'Сунгалт' },
];

export function emptySection(type: WorkoutSectionType = 'kegelHold'): WorkoutSection {
  const preset = SECTION_TYPE_OPTIONS.find((o) => o.value === type);
  return {
    id: `section_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    label: preset?.label ?? 'Шинэ хэсэг',
    type,
    durationSeconds: type === 'breath' ? 30 : 25,
    sets: 3,
    holdSeconds: 5,
    relaxSeconds: 5,
    vibrationEnabled: type === 'kegelHold' || type === 'coreBrace',
    vibrationIntervalMs: 80,
    instruction: '',
  };
}

function phaseTypeToSectionType(
  phaseType: string,
  motion: string
): WorkoutSectionType {
  if (phaseType === 'relax') return 'relax';
  if (phaseType === 'breath') return 'breath';
  if (phaseType === 'contract' || motion === 'coreBrace') return 'coreBrace';
  if (motion === 'pushup' || motion === 'endurance' || motion === 'wave') return 'stretch';
  return 'kegelHold';
}

function sectionTypeToMotion(type: WorkoutSectionType): string {
  switch (type) {
    case 'breath':
      return 'breath';
    case 'coreBrace':
      return 'coreBrace';
    case 'stretch':
      return 'pushup';
    case 'relax':
      return 'kegelHold';
    default:
      return 'kegelHold';
  }
}

function buildPhasesForSection(section: WorkoutSection): WorkoutExercisePhase[] {
  if (section.type === 'breath') {
    return normalizePhases([
      {
        label: 'Бэлтгэх',
        phaseType: 'warmup',
        durationSeconds: 5,
        vibrationEnabled: false,
        vibrationIntervalMs: 100,
        showInCarousel: false,
      },
      {
        label: section.label,
        phaseType: 'breath',
        durationSeconds: section.durationSeconds,
        vibrationEnabled: false,
        vibrationIntervalMs: 100,
      },
    ]);
  }

  if (section.type === 'kegelHold') {
    return normalizePhases([
      {
        label: section.label,
        phaseType: 'hold',
        durationSeconds: section.durationSeconds,
        holdSeconds: section.holdSeconds,
        relaxSeconds: section.relaxSeconds,
        vibrationEnabled: section.vibrationEnabled,
        vibrationIntervalMs: section.vibrationIntervalMs,
      },
    ]);
  }

  if (section.type === 'coreBrace') {
    return normalizePhases([
      {
        label: section.label,
        phaseType: 'contract',
        durationSeconds: section.durationSeconds,
        holdSeconds: section.holdSeconds,
        relaxSeconds: section.relaxSeconds,
        vibrationEnabled: section.vibrationEnabled,
        vibrationIntervalMs: section.vibrationIntervalMs,
      },
    ]);
  }

  if (section.type === 'relax') {
    return normalizePhases([
      {
        label: section.label,
        phaseType: 'relax',
        durationSeconds: section.durationSeconds,
        vibrationEnabled: false,
        vibrationIntervalMs: 100,
      },
    ]);
  }

  return normalizePhases([
    {
      label: section.label,
      phaseType: 'hold',
      durationSeconds: section.durationSeconds,
      vibrationEnabled: section.vibrationEnabled,
      vibrationIntervalMs: section.vibrationIntervalMs,
    },
  ]);
}

export function sectionsFromExercises(exercises: WorkoutExercise[]): WorkoutSection[] {
  const sections: WorkoutSection[] = [];

  for (const exercise of exercises) {
    const phases = normalizePhases(exercise.phases);
    const visible = phases.filter(
      (phase) => phase.showInCarousel !== false && phase.phaseType !== 'warmup'
    );

    if (visible.length === 0) {
      sections.push({
        id: exercise.id || emptySection().id,
        label: exercise.name || 'Дасгал',
        type: phaseTypeToSectionType('hold', exercise.motion),
        durationSeconds: exercise.durationSeconds || 25,
        sets: exercise.sets || 3,
        holdSeconds: 5,
        relaxSeconds: 5,
        vibrationEnabled: exercise.motion === 'kegelHold' || exercise.motion === 'coreBrace',
        vibrationIntervalMs: 80,
        instruction: exercise.instruction || '',
      });
      continue;
    }

    for (const phase of visible) {
      sections.push({
        id: `${exercise.id || 'ex'}-${phase.sortOrder ?? sections.length}`,
        label: phase.label.trim() || exercise.name || 'Дасгал',
        type: phaseTypeToSectionType(phase.phaseType, exercise.motion),
        durationSeconds: phase.durationSeconds,
        sets: exercise.sets || 3,
        holdSeconds: phase.holdSeconds || 5,
        relaxSeconds: phase.relaxSeconds || 5,
        vibrationEnabled: phase.vibrationEnabled,
        vibrationIntervalMs: phase.vibrationIntervalMs,
        instruction: exercise.instruction || '',
      });
    }
  }

  return sections;
}

export function exercisesFromSections(sections: WorkoutSection[]): WorkoutExercise[] {
  return sections.map((section, index) => {
    const motion = sectionTypeToMotion(section.type);
    const phases =
      section.type === 'stretch' && !section.instruction
        ? templateForMotion('pushup').map((phase, i) =>
            i === 0
              ? {
                  ...phase,
                  label: section.label,
                  durationSeconds: section.durationSeconds,
                  vibrationEnabled: section.vibrationEnabled,
                  vibrationIntervalMs: section.vibrationIntervalMs,
                }
              : phase
          )
        : buildPhasesForSection(section);

    return {
      name: section.label,
      category: 'ДАСГАЛ',
      instruction:
        section.instruction.trim() ||
        `${section.label} — зөв хэлбэр, тогтвортой амьсгал хадгална.`,
      durationSeconds: section.durationSeconds,
      sets: section.sets,
      motion,
      motionHint: '',
      sortOrder: index,
      phases,
      introSlides: [],
      videoUrl: null,
      thumbnailUrl: null,
    };
  });
}

export function estimateProgramMinutes(sections: WorkoutSection[]): number {
  if (sections.length === 0) return 5;
  const totalSeconds = sections.reduce(
    (sum, section) => sum + section.durationSeconds * Math.max(1, section.sets),
    0
  );
  return Math.max(1, Math.round(totalSeconds / 60));
}
