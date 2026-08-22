/** Sample phase sequences for workout exercises (admin-editable via API). */

/**
 * Hold tab with inner hold/relax cycles + standalone relax tab.
 * Tabs are strictly sequential: hold tab must fully finish before Амрах tab starts.
 * Inner relax is NOT a separate carousel tab.
 */
function kegelHoldSequence(
  holdLabel = 'Чангалж барих',
  {
    holdBlockSec = 25,
    relaxTabSec = 15,
    innerHoldSec = 5,
    innerRelaxSec = 5,
    repeatHold = false,
  } = {}
) {
  const holdTab = {
    sortOrder: 0,
    label: holdLabel,
    phaseType: 'hold',
    durationSeconds: holdBlockSec,
    holdSeconds: innerHoldSec,
    relaxSeconds: innerRelaxSec,
    vibrationEnabled: true,
    vibrationIntervalMs: 80,
  };

  const relaxTab = {
    sortOrder: 1,
    label: 'Амрах',
    phaseType: 'relax',
    durationSeconds: relaxTabSec,
    vibrationEnabled: false,
    vibrationIntervalMs: 100,
  };

  if (!repeatHold) return [holdTab, relaxTab];

  return [
    holdTab,
    relaxTab,
    {
      ...holdTab,
      sortOrder: 2,
      label: holdLabel,
    },
  ];
}

/** @deprecated use kegelHoldSequence */
function kegelHoldPhases(holdSec = 5, relaxSec = 5, holdLabel = 'Чангалж барих') {
  return kegelHoldSequence(holdLabel, {
    holdBlockSec: holdSec + relaxSec,
    relaxTabSec: relaxSec,
    innerHoldSec: holdSec,
    innerRelaxSec: relaxSec,
    repeatHold: false,
  });
}

function breathPhases(warmupSec = 5, breathSec = 10) {
  return [
    {
      sortOrder: 0,
      label: 'Бэлтгэх',
      phaseType: 'warmup',
      durationSeconds: warmupSec,
      vibrationEnabled: false,
      vibrationIntervalMs: 100,
    },
    {
      sortOrder: 1,
      label: 'Гүн амьсгал',
      phaseType: 'breath',
      durationSeconds: breathSec,
      vibrationEnabled: false,
      vibrationIntervalMs: 100,
    },
  ];
}

function coreBracePhases() {
  return [
    {
      sortOrder: 0,
      label: 'Чангалах',
      phaseType: 'contract',
      durationSeconds: 12,
      holdSeconds: 3,
      relaxSeconds: 3,
      vibrationEnabled: true,
      vibrationIntervalMs: 100,
    },
    {
      sortOrder: 1,
      label: 'Барих',
      phaseType: 'hold',
      durationSeconds: 12,
      holdSeconds: 5,
      relaxSeconds: 4,
      vibrationEnabled: true,
      vibrationIntervalMs: 80,
    },
    {
      sortOrder: 2,
      label: 'Амрах',
      phaseType: 'relax',
      durationSeconds: 11,
      vibrationEnabled: false,
      vibrationIntervalMs: 100,
    },
  ];
}

function pulsePhases() {
  return [
    {
      sortOrder: 0,
      label: 'Агшилт',
      phaseType: 'contract',
      durationSeconds: 15,
      holdSeconds: 1,
      relaxSeconds: 1,
      vibrationEnabled: true,
      vibrationIntervalMs: 60,
    },
    {
      sortOrder: 1,
      label: 'Амрах',
      phaseType: 'relax',
      durationSeconds: 15,
      vibrationEnabled: false,
      vibrationIntervalMs: 100,
    },
  ];
}

function pushupPhases() {
  return [
    {
      sortOrder: 0,
      label: 'Доошлох',
      phaseType: 'contract',
      durationSeconds: 12,
      vibrationEnabled: false,
      vibrationIntervalMs: 100,
    },
    {
      sortOrder: 1,
      label: 'Дээшлэх',
      phaseType: 'hold',
      durationSeconds: 8,
      vibrationEnabled: false,
      vibrationIntervalMs: 100,
    },
    {
      sortOrder: 2,
      label: 'Амрах',
      phaseType: 'relax',
      durationSeconds: 8,
      vibrationEnabled: false,
      vibrationIntervalMs: 100,
    },
  ];
}

function defaultPhasesForMotion(motion) {
  switch (motion) {
    case 'kegelHold':
    case 'endurance':
    case 'wave':
      return kegelHoldSequence();
    case 'breath':
      return breathPhases();
    case 'coreBrace':
      return coreBracePhases();
    case 'pulse':
      return pulsePhases();
    case 'pushup':
      return pushupPhases();
    default:
      return kegelHoldSequence();
  }
}

module.exports = {
  kegelHoldSequence,
  kegelHoldPhases,
  breathPhases,
  coreBracePhases,
  pulsePhases,
  pushupPhases,
  defaultPhasesForMotion,
};
