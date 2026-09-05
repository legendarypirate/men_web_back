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
  avatarImages?: string[];
};

export function normalizeAvatarImages(
  raw?: unknown,
  fallback?: string | null
): string[] {
  const list: string[] = [];
  if (Array.isArray(raw)) {
    for (const item of raw) {
      if (typeof item === 'string' && item.trim()) list.push(item.trim());
    }
  }
  if (list.length === 0 && typeof fallback === 'string' && fallback.trim()) {
    list.push(fallback.trim());
  }
  return list;
}

export const TRAINING_LEVELS = [
  { level: 1, label: 'Хялбар' },
  { level: 2, label: 'Дунд' },
  { level: 3, label: 'Дунд +' },
  { level: 4, label: 'Хүнд' },
  { level: 5, label: 'Хүнд +' },
  { level: 6, label: 'Маш хүнд' },
] as const;

export const DEFAULT_TRAINING_LEVEL = 5;
export const REFERENCE_TRAINING_LEVEL = 6;

export const SECTION_TYPE_OPTIONS: { value: WorkoutSectionType; label: string }[] = [
  { value: 'kegelHold', label: 'Кегелийн барилт' },
  { value: 'relax', label: 'Амрах' },
  { value: 'breath', label: 'Амьсгал' },
  { value: 'coreBrace', label: 'Гол булчин' },
  { value: 'stretch', label: 'Сунгалт' },
];

export const HOME_SECTION_TYPE_OPTIONS: { value: WorkoutSectionType; label: string }[] = [
  { value: 'relax', label: 'Амрах' },
  { value: 'stretch', label: 'Дасгал' },
];

export function emptySectionDefinition(type: WorkoutSectionType = 'kegelHold'): WorkoutSectionDefinition {
  const preset = SECTION_TYPE_OPTIONS.find((o) => o.value === type);
  return {
    id: `section_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    label: preset?.label ?? 'Шинэ хэсэг',
    type,
    instruction: '',
    avatarImages: [],
  };
}

export function defaultHoldIntervalLabel(type: WorkoutSectionType): string {
  return type === 'coreBrace' ? 'Чангалах' : 'Барих';
}

export function defaultRelaxIntervalLabel(): string {
  return 'Амрах';
}

export function emptySectionTiming(type: WorkoutSectionType = 'kegelHold'): SectionTiming {
  return normalizeSectionTiming({
    enabled: true,
    durationSeconds: type === 'breath' ? 30 : 25,
    sets: 3,
    holdSeconds: 5,
    relaxSeconds: 5,
    holdIntervalLabel: defaultHoldIntervalLabel(type),
    relaxIntervalLabel: defaultRelaxIntervalLabel(),
    vibrationEnabled: type === 'kegelHold' || type === 'coreBrace',
    vibrationIntervalMs: 80,
  });
}

export function normalizeSectionTiming(raw: Partial<SectionTiming>, sectionType?: WorkoutSectionType): SectionTiming {
  const type = sectionType ?? 'kegelHold';
  return {
    enabled: raw.enabled !== false,
    durationSeconds: Math.max(0, Number(raw.durationSeconds) || 0),
    sets: Math.max(1, Number(raw.sets) || 1),
    holdSeconds: Math.max(1, Number(raw.holdSeconds) || 1),
    relaxSeconds: Math.max(1, Number(raw.relaxSeconds) || 1),
    holdIntervalLabel:
      String(raw.holdIntervalLabel || '').trim() || defaultHoldIntervalLabel(type),
    relaxIntervalLabel:
      String(raw.relaxIntervalLabel || '').trim() || defaultRelaxIntervalLabel(),
    vibrationEnabled: raw.vibrationEnabled ?? true,
    vibrationIntervalMs: Math.max(40, Number(raw.vibrationIntervalMs) || 80),
  };
}

export function defaultEnabledForLevel(level: number): boolean {
  // Easy levels start with fewer sections enabled; admin can override per section.
  return level >= 4;
}

export function buildLevelPresets(
  sections: WorkoutSectionDefinition[],
  template?: SectionTiming
): WorkoutLevelPresets {
  const presets: WorkoutLevelPresets = {};
  for (const { level } of TRAINING_LEVELS) {
    presets[String(level)] = sections.map((section) =>
      normalizeSectionTiming({
        ...(template ?? emptySectionTiming(section.type)),
        enabled: defaultEnabledForLevel(level),
      })
    );
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
      if (current[index]) return normalizeSectionTiming(current[index], section.type);
      return normalizeSectionTiming(
        {
          ...emptySectionTiming(section.type),
          enabled: defaultEnabledForLevel(level),
        },
        section.type
      );
    });
    next[key] = synced;
  }
  return next;
}

export function countEnabledSections(levelPresets: WorkoutLevelPresets, level: number): number {
  const timings = levelPresets[String(level)] ?? [];
  return timings.filter((timing) => timing.enabled).length;
}

export function activeSectionLabels(
  sections: WorkoutSectionDefinition[],
  levelPresets: WorkoutLevelPresets,
  level: number
): string[] {
  const timings = levelPresets[String(level)] ?? [];
  return sections
    .map((section, index) => ({ section, timing: timings[index] }))
    .filter(({ timing }) => timing?.enabled !== false)
    .map(({ section }) => section.label || 'Хэсэг');
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
        holdIntervalLabel: timing.holdIntervalLabel,
        relaxIntervalLabel: timing.relaxIntervalLabel,
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
        holdIntervalLabel: timing.holdIntervalLabel,
        relaxIntervalLabel: timing.relaxIntervalLabel,
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

function buildExerciseFromSection(
  section: WorkoutSectionDefinition,
  timing: SectionTiming,
  sortOrder: number
): WorkoutExercise {
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
    sortOrder,
    phases,
    introSlides: [],
    videoUrl: null,
    thumbnailUrl: normalizeAvatarImages(section.avatarImages)[0] || null,
    avatarImages: normalizeAvatarImages(section.avatarImages),
  };
}

function timingFromPhase(
  phase: WorkoutExercisePhase,
  exercise: WorkoutExercise,
  sectionType: WorkoutSectionType
): SectionTiming {
  return normalizeSectionTiming(
    {
      enabled: true,
      durationSeconds: phase.durationSeconds,
      sets: exercise.sets || 3,
      holdSeconds: phase.holdSeconds || 5,
      relaxSeconds: phase.relaxSeconds || 5,
      holdIntervalLabel: phase.holdIntervalLabel,
      relaxIntervalLabel: phase.relaxIntervalLabel,
      vibrationEnabled: phase.vibrationEnabled,
      vibrationIntervalMs: phase.vibrationIntervalMs,
    },
    sectionType
  );
}

function referenceTiming(
  levelPresets: WorkoutLevelPresets,
  sectionIndex: number,
  section: WorkoutSectionDefinition,
  level = REFERENCE_TRAINING_LEVEL
): SectionTiming {
  const fromRequested = levelPresets[String(level)]?.[sectionIndex];
  if (fromRequested) return normalizeSectionTiming(fromRequested);
  const fromSix = levelPresets[String(REFERENCE_TRAINING_LEVEL)]?.[sectionIndex];
  if (fromSix) return normalizeSectionTiming(fromSix);
  const fromFive = levelPresets[String(DEFAULT_TRAINING_LEVEL)]?.[sectionIndex];
  if (fromFive) return normalizeSectionTiming(fromFive);
  return emptySectionTiming(section.type);
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
        avatarImages: normalizeAvatarImages(
          exercise.avatarImages,
          exercise.thumbnailUrl
        ),
      });
      baseTimings.push(
        normalizeSectionTiming(
          {
            enabled: true,
            durationSeconds: exercise.durationSeconds || 25,
            sets: exercise.sets || 3,
            holdSeconds: 5,
            relaxSeconds: 5,
            vibrationEnabled: exercise.motion === 'kegelHold' || exercise.motion === 'coreBrace',
            vibrationIntervalMs: 80,
          },
          phaseTypeToSectionType('hold', exercise.motion)
        )
      );
      continue;
    }

    for (const phase of visible) {
      const sectionType = phaseTypeToSectionType(phase.phaseType, exercise.motion);
      sections.push({
        id: `${exercise.id || 'ex'}-${phase.sortOrder ?? sections.length}`,
        label: phase.label.trim() || exercise.name || 'Дасгал',
        type: sectionType,
        instruction: exercise.instruction || '',
        avatarImages: normalizeAvatarImages(
          exercise.avatarImages,
          exercise.thumbnailUrl
        ),
      });
      baseTimings.push(timingFromPhase(phase, exercise, sectionType));
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

  const levelPresets = buildLevelPresets(sections);
  for (const { level } of TRAINING_LEVELS) {
    levelPresets[String(level)] = sections.map((section, index) =>
      normalizeSectionTiming({
        ...baseTimings[index],
        enabled: true,
      })
    );
  }

  return { sections, levelPresets };
}

/** Full section templates stored on the program (all sections, regardless of level). */
export function templateExercisesFromSections(
  sections: WorkoutSectionDefinition[],
  levelPresets: WorkoutLevelPresets,
  level = REFERENCE_TRAINING_LEVEL
): WorkoutExercise[] {
  return sections.map((section, index) =>
    buildExerciseFromSection(
      section,
      referenceTiming(levelPresets, index, section, level),
      index
    )
  );
}

/** Exercises actually used for a given training level (enabled sections only). */
export function exercisesFromSections(
  sections: WorkoutSectionDefinition[],
  levelPresets: WorkoutLevelPresets,
  level = DEFAULT_TRAINING_LEVEL
): WorkoutExercise[] {
  const timings = levelPresets[String(level)] ?? levelPresets[String(DEFAULT_TRAINING_LEVEL)] ?? [];
  const exercises: WorkoutExercise[] = [];

  sections.forEach((section, index) => {
    const timing = normalizeSectionTiming(timings[index] ?? emptySectionTiming(section.type));
    if (!timing.enabled) return;
    exercises.push(buildExerciseFromSection(section, timing, exercises.length));
  });

  return exercises;
}

export function estimateProgramMinutes(
  sections: WorkoutSectionDefinition[],
  levelPresets: WorkoutLevelPresets,
  level = DEFAULT_TRAINING_LEVEL
): number {
  const timings = levelPresets[String(level)] ?? [];
  if (timings.length === 0) return 5;
  const totalSeconds = timings.reduce((sum, timing, index) => {
    if (!timing?.enabled) return sum;
    const duration =
      timing.durationSeconds ||
      (sections[index]?.type === 'breath' ? 30 : 25);
    return sum + duration * Math.max(1, timing.sets || 1);
  }, 0);
  return Math.max(1, Math.round(totalSeconds / 60));
}

export function validateLevelPresets(
  sections: WorkoutSectionDefinition[],
  levelPresets: WorkoutLevelPresets
): string | null {
  for (const { level, label } of TRAINING_LEVELS) {
    if (countEnabledSections(levelPresets, level) === 0) {
      return `${label} түвшинд дор хаяж нэг идэвхтэй хэсэг байх ёстой.`;
    }
  }
  if (sections.length === 0) {
    return 'Дор хаяж нэг хэсэг нэмнэ үү.';
  }
  return null;
}
