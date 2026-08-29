import { WorkoutExercisePhase } from '@/lib/api';

export const PHASE_TYPE_LABELS: Record<string, string> = {
  hold: 'Барих',
  relax: 'Амрах',
  contract: 'Чангалах',
  breath: 'Амьсгал',
  warmup: 'Бэлтгэх (дотоод)',
};

export function emptyPhase(sortOrder = 0): WorkoutExercisePhase {
  return {
    sortOrder,
    label: '',
    phaseType: 'hold',
    durationSeconds: 25,
    holdSeconds: 5,
    relaxSeconds: 5,
    vibrationEnabled: true,
    vibrationIntervalMs: 80,
    showInCarousel: true,
  };
}

export function normalizePhase(raw: WorkoutExercisePhase, sortOrder: number): WorkoutExercisePhase {
  const phaseType = raw.phaseType || 'hold';
  const isHold = phaseType === 'hold' || phaseType === 'contract';
  return {
    sortOrder,
    label: raw.label ?? '',
    phaseType,
    durationSeconds: Math.max(1, Number(raw.durationSeconds) || 5),
    holdSeconds: isHold ? Math.max(1, Number(raw.holdSeconds) || 5) : 0,
    relaxSeconds: isHold ? Math.max(1, Number(raw.relaxSeconds) || 5) : 0,
    holdIntervalLabel: raw.holdIntervalLabel,
    relaxIntervalLabel: raw.relaxIntervalLabel,
    vibrationEnabled: raw.vibrationEnabled ?? isHold,
    vibrationIntervalMs: Math.min(500, Math.max(40, Number(raw.vibrationIntervalMs) || 80)),
    showInCarousel:
      raw.showInCarousel ?? (phaseType !== 'warmup'),
  };
}

export function normalizePhases(phases: WorkoutExercisePhase[] | undefined): WorkoutExercisePhase[] {
  return (phases ?? []).map((p, i) => normalizePhase(p, i));
}

export function phaseSequenceTotalSeconds(phases: WorkoutExercisePhase[]): number {
  return phases.reduce((sum, p) => sum + (p.durationSeconds || 0), 0);
}

/** First hold/contract tab — this is what the app timer displays. */
export function primaryHoldPhaseIndex(phases: WorkoutExercisePhase[]): number {
  return normalizePhases(phases).findIndex(
    (p) => p.phaseType === 'hold' || p.phaseType === 'contract',
  );
}

export function primaryHoldDurationSeconds(phases: WorkoutExercisePhase[]): number | null {
  const idx = primaryHoldPhaseIndex(phases);
  if (idx < 0) return null;
  return normalizePhases(phases)[idx].durationSeconds;
}

/** Keep exercise duration field in sync with the hold tab the user sees in the app. */
export function syncHoldTabDuration(
  phases: WorkoutExercisePhase[],
  holdSeconds: number,
): WorkoutExercisePhase[] {
  const normalized = normalizePhases(phases);
  const idx = primaryHoldPhaseIndex(normalized);
  if (idx < 0) return normalized;
  const next = [...normalized];
  next[idx] = {
    ...next[idx],
    durationSeconds: Math.max(1, holdSeconds),
  };
  return next;
}

/** Tabs visible in the app carousel (matches Flutter WorkoutCarouselTabs). */
export function carouselTabLabels(phases: WorkoutExercisePhase[], exerciseName: string): string[] {
  return phases
    .filter((p) => p.showInCarousel !== false && p.phaseType !== 'warmup')
    .map((p) => (p.label.trim() ? p.label : exerciseName));
}

export function templateForMotion(motion: string): WorkoutExercisePhase[] {
  switch (motion) {
    case 'breath':
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
          label: 'Гүн амьсгал',
          phaseType: 'breath',
          durationSeconds: 25,
          vibrationEnabled: false,
          vibrationIntervalMs: 100,
        },
      ]);
    case 'coreBrace':
      return normalizePhases([
        {
          label: 'Чангалах',
          phaseType: 'contract',
          durationSeconds: 12,
          holdSeconds: 3,
          relaxSeconds: 3,
          vibrationEnabled: true,
          vibrationIntervalMs: 100,
        },
        {
          label: 'Барих',
          phaseType: 'hold',
          durationSeconds: 12,
          holdSeconds: 5,
          relaxSeconds: 4,
          vibrationEnabled: true,
          vibrationIntervalMs: 80,
        },
        {
          label: 'Амрах',
          phaseType: 'relax',
          durationSeconds: 11,
          vibrationEnabled: false,
          vibrationIntervalMs: 100,
        },
      ]);
    case 'pulse':
      return normalizePhases([
        {
          label: 'Агшилт',
          phaseType: 'contract',
          durationSeconds: 15,
          holdSeconds: 1,
          relaxSeconds: 1,
          vibrationEnabled: true,
          vibrationIntervalMs: 60,
        },
        {
          label: 'Амрах',
          phaseType: 'relax',
          durationSeconds: 15,
          vibrationEnabled: false,
          vibrationIntervalMs: 100,
        },
      ]);
    case 'pushup':
      return normalizePhases([
        { label: 'Доошлох', phaseType: 'contract', durationSeconds: 12, vibrationEnabled: false, vibrationIntervalMs: 100 },
        { label: 'Дээшлэх', phaseType: 'hold', durationSeconds: 8, vibrationEnabled: false, vibrationIntervalMs: 100 },
        { label: 'Амрах', phaseType: 'relax', durationSeconds: 8, vibrationEnabled: false, vibrationIntervalMs: 100 },
      ]);
    default:
      return normalizePhases([
        {
          label: 'Чангалж барих',
          phaseType: 'hold',
          durationSeconds: 25,
          holdSeconds: 5,
          relaxSeconds: 5,
          vibrationEnabled: true,
          vibrationIntervalMs: 80,
        },
        {
          label: 'Амрах',
          phaseType: 'relax',
          durationSeconds: 15,
          vibrationEnabled: false,
          vibrationIntervalMs: 100,
        },
      ]);
  }
}

export function programCarouselPreview(
  exercises: { name: string; phases?: WorkoutExercisePhase[] }[]
): string[] {
  const labels: string[] = [];
  for (const ex of exercises) {
    const phases = normalizePhases(ex.phases);
    labels.push(...carouselTabLabels(phases, ex.name || 'Дасгал'));
  }
  return labels;
}
