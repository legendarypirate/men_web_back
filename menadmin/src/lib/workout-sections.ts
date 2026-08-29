import { SectionTiming, WorkoutExercise, WorkoutExercisePhase, WorkoutLevelPresets, WorkoutProgram } from '@/lib/api';
import { normalizePhases, templateForMotion } from '@/lib/workout-phase-templates';

export type WorkoutSectionType =
  | 'kegelHold'
  | 'relax'
  | 'breath'
  | 'coreBrace'
  | 'stretch';

export type WorkoutSectionDefinition = {
  id: string;
  label: string;
  type: WorkoutSectionType;
  instruction: string;
};

export const TRAINING_LEVELS = [
  { level: 1, label: 'Хялбар' },
  { level: 2, label: 'Дунд' },
  { level: 3, label: 'Дунд +' },
  { level: 4, label: 'Хүнд' },
  { level: 5, label: 'Хүнд +' },
  { level: 6, label: 'Маш хүнд' },
] as const;

export const DEFAULT_TRAINING_LEVEL = 5;

export const SECTION_TYPE_OPTIONS: { value: WorkoutSectionType; label: string }[] = [
  { value: 'kegelHold', label: 'Кегелийн барилт' },
  { value: 'relax', label: 'Амрах' },
  { value: 'breath', label: 'Амьсгал' },
  { value: 'coreBrace', label: 'Гол булчин' },
  { value: 'stretch', label: 'Сунгалт' },
];

export function emptySectionDefinition(type: WorkoutSectionType = 'kegelHold'): WorkoutSectionDefinition {
  const preset = SECTION_TYPE_OPTIONS.find((o) => o.value === type);
  return {
    id: `section_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    label: preset?.label ?? 'Шинэ хэсэг',
    type,
    instruction: '',
  };
}

export function emptySectionTiming(type: WorkoutSectionType = 'kegelHold'): SectionTiming {
  return normalizeSectionTiming({
    durationSeconds: type === 'breath' ? 30 : 25,
    sets: 3,
    holdSeconds: 5,
    relaxSeconds: 5,
    vibrationEnabled: type === 'kegelHold' || type === 'coreBrace',
    vibrationIntervalMs: 80,
  });
}

export function normalizeSectionTiming(raw: Partial<SectionTiming>): SectionTiming {
  return {
    durationSeconds: Math.max(0, Number(raw.durationSeconds) || 0),
    sets: Math.max(1, Number(raw.sets) || 1),
    holdSeconds: Math.max(1, Number(raw.holdSeconds) || 1),
    relaxSeconds: Math.max(1, Number(raw.relaxSeconds) || 1),
    vibrationEnabled: raw.vibrationEnabled ?? true,
    vibrationIntervalMs: Math.max(40, Number(raw.vibrationIntervalMs) || 80),
  };
}

export function buildLevelPresets(
  sectionCount: number,
  template?: SectionTiming
): WorkoutLevelPresets {
  const timing = template ?? emptySectionTiming();
  const presets: WorkoutLevelPresets = {};
  for (const { level } of TRAINING_LEVELS) {
    presets[String(level)] = Array.from({ length: sectionCount }, () => ({ ...timing }));
  }
  return presets;
}

export function syncLevelPresets(
  sections: WorkoutSectionDefinition[],
  presets: WorkoutLevelPresets | undefined
): WorkoutLevelPresets {
  const next = { ...(presets || {}) };
  for (const { level } of TRAINING_LEVELS) {
    const key = String(level);
    const current = next[key] ?? [];
    const synced = sections.map((section, index) => {
      if (current[index]) return normalizeSectionTiming(current[index]);
      return emptySectionTiming(section.type);
    });
    next[key] = synced;
  }
  return next;
}

function phaseTypeToSectionType(phaseType: string, motion: string): WorkoutSectionType {
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

function buildPhasesForSection(
  section: WorkoutSectionDefinition,
  timing: SectionTiming
): WorkoutExercisePhase[] {
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
        durationSeconds: timing.durationSeconds,
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
        durationSeconds: timing.durationSeconds,
        holdSeconds: timing.holdSeconds,
        relaxSeconds: timing.relaxSeconds,
        vibrationEnabled: timing.vibrationEnabled,
        vibrationIntervalMs: timing.vibrationIntervalMs,
      },
    ]);
  }

  if (section.type === 'coreBrace') {
    return normalizePhases([
      {
        label: section.label,
        phaseType: 'contract',
        durationSeconds: timing.durationSeconds,
        holdSeconds: timing.holdSeconds,
        relaxSeconds: timing.relaxSeconds,
        vibrationEnabled: timing.vibrationEnabled,
        vibrationIntervalMs: timing.vibrationIntervalMs,
      },
    ]);
  }

  if (section.type === 'relax') {
    return normalizePhases([
      {
        label: section.label,
        phaseType: 'relax',
        durationSeconds: timing.durationSeconds,
        vibrationEnabled: false,
        vibrationIntervalMs: 100,
      },
    ]);
  }

  return normalizePhases([
    {
      label: section.label,
      phaseType: 'hold',
      durationSeconds: timing.durationSeconds,
      vibrationEnabled: timing.vibrationEnabled,
      vibrationIntervalMs: timing.vibrationIntervalMs,
    },
  ]);
}

function timingFromPhase(
  phase: WorkoutExercisePhase,
  exercise: WorkoutExercise
): SectionTiming {
  return normalizeSectionTiming({
    durationSeconds: phase.durationSeconds,
    sets: exercise.sets || 3,
    holdSeconds: phase.holdSeconds || 5,
    relaxSeconds: phase.relaxSeconds || 5,
    vibrationEnabled: phase.vibrationEnabled,
    vibrationIntervalMs: phase.vibrationIntervalMs,
  });
}

export function loadProgramSections(program: WorkoutProgram): {
  sections: WorkoutSectionDefinition[];
  levelPresets: WorkoutLevelPresets;
} {
  const sections: WorkoutSectionDefinition[] = [];
  const baseTimings: SectionTiming[] = [];

  for (const exercise of program.exercises || []) {
    const phases = normalizePhases(exercise.phases);
    const visible = phases.filter(
      (phase) => phase.showInCarousel !== false && phase.phaseType !== 'warmup'
    );

    if (visible.length === 0) {
      sections.push({
        id: exercise.id || emptySectionDefinition().id,
        label: exercise.name || 'Дасгал',
        type: phaseTypeToSectionType('hold', exercise.motion),
        instruction: exercise.instruction || '',
      });
      baseTimings.push({
        durationSeconds: exercise.durationSeconds || 25,
        sets: exercise.sets || 3,
        holdSeconds: 5,
        relaxSeconds: 5,
        vibrationEnabled: exercise.motion === 'kegelHold' || exercise.motion === 'coreBrace',
        vibrationIntervalMs: 80,
      });
      continue;
    }

    for (const phase of visible) {
      sections.push({
        id: `${exercise.id || 'ex'}-${phase.sortOrder ?? sections.length}`,
        label: phase.label.trim() || exercise.name || 'Дасгал',
        type: phaseTypeToSectionType(phase.phaseType, exercise.motion),
        instruction: exercise.instruction || '',
      });
      baseTimings.push(timingFromPhase(phase, exercise));
    }
  }

  if (sections.length === 0) {
    const fallback = emptySectionDefinition();
    sections.push(fallback);
    baseTimings.push(emptySectionTiming(fallback.type));
  }

  const stored = program.levelPresets;
  if (stored && Object.keys(stored).length > 0) {
    const synced = syncLevelPresets(sections, stored);
    const hasAllLevels = TRAINING_LEVELS.every(({ level }) => {
      const timings = synced[String(level)];
      return Array.isArray(timings) && timings.length === sections.length;
    });
    if (hasAllLevels) {
      return { sections, levelPresets: synced };
    }
  }

  const levelPresets = buildLevelPresets(sections.length);
  for (const { level } of TRAINING_LEVELS) {
    levelPresets[String(level)] = baseTimings.map((timing) =>
      normalizeSectionTiming(timing)
    );
  }

  return { sections, levelPresets };
}

export function exercisesFromSections(
  sections: WorkoutSectionDefinition[],
  levelPresets: WorkoutLevelPresets,
  level = DEFAULT_TRAINING_LEVEL
): WorkoutExercise[] {
  const timings = levelPresets[String(level)] ?? levelPresets['5'] ?? [];

  return sections.map((section, index) => {
    const timing = timings[index] ?? emptySectionTiming(section.type);
    const motion = sectionTypeToMotion(section.type);
    const phases =
      section.type === 'stretch' && !section.instruction
        ? templateForMotion('pushup').map((phase, phaseIndex) =>
            phaseIndex === 0
              ? {
                  ...phase,
                  label: section.label,
                  durationSeconds: timing.durationSeconds,
                  vibrationEnabled: timing.vibrationEnabled,
                  vibrationIntervalMs: timing.vibrationIntervalMs,
                }
              : phase
          )
        : buildPhasesForSection(section, timing);

    return {
      name: section.label,
      category: 'ДАСГАЛ',
      instruction:
        section.instruction.trim() ||
        `${section.label} — зөв хэлбэр, тогтвортой амьсгал хадгална.`,
      durationSeconds: timing.durationSeconds,
      sets: timing.sets,
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

export function estimateProgramMinutes(
  sections: WorkoutSectionDefinition[],
  levelPresets: WorkoutLevelPresets,
  level = DEFAULT_TRAINING_LEVEL
): number {
  const timings = levelPresets[String(level)] ?? [];
  if (timings.length === 0) return 5;
  const totalSeconds = timings.reduce(
    (sum, timing) => sum + timing.durationSeconds * Math.max(1, timing.sets),
    0
  );
  return Math.max(1, Math.round(totalSeconds / 60));
}
