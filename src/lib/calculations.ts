export const MAX_LEVEL = 82;
export const TOP_MULTIPLIER = 0.07;
export const RESILIENCE_SCALE = 10;
export const SENSITIVITY_SCALE = 15;
export const CERTAINTY_CAP = 0.9;

export interface Inputs {
  level: number;

  /* Future Experience Projection — three dimensions */
  expectedHappiness: number;
  expectedSuffering: number;
  expectedMeaning: number;

  /* Per-dimension confidence */
  happinessConfidence: number;
  sufferingConfidence: number;
  meaningConfidence: number;

  /* Visibility horizon */
  futureVisibility: number;

  /* Resilience context (unchanged) */
  morale: number;
  ally: number;
  resources: number;
  stamina: number;
  versatility: number;
  rngEvents: number;
  sensitivity: number;
}

export const DEFAULTS: Inputs = {
  level: 30,

  expectedHappiness: 60,
  expectedSuffering: 30,
  expectedMeaning: 50,

  happinessConfidence: 0.5,
  sufferingConfidence: 0.5,
  meaningConfidence: 0.5,

  futureVisibility: 15,

  morale: 60,
  ally: 50,
  resources: 50,
  stamina: 70,
  versatility: 50,
  rngEvents: 50,
  sensitivity: 50,
};

export type Verdict = "Keep" | "Equilibrium" | "End";

export interface CampaignMetrics {
  R: number;
  T: number;
  TOP: number;
  NES: number;
  EQI: number;
  VR: number;
  CW: number;
  EQI_adj: number;
  RS: number;
  DRT: number;
  delta: number;
  CI: number;
  verdict: Verdict;
  resilienceBonus: number;
  sensitivityBias: number;
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const mix = (from: number, to: number, ratio: number) =>
  Math.round(from + (to - from) * ratio);

const toHex = (value: number) => value.toString(16).padStart(2, "0");

function interpolateColor(start: string, end: string, ratio: number) {
  const normalized = clamp(ratio, 0, 1);
  const from = start.replace("#", "");
  const to = end.replace("#", "");
  const r1 = Number.parseInt(from.slice(0, 2), 16);
  const g1 = Number.parseInt(from.slice(2, 4), 16);
  const b1 = Number.parseInt(from.slice(4, 6), 16);
  const r2 = Number.parseInt(to.slice(0, 2), 16);
  const g2 = Number.parseInt(to.slice(2, 4), 16);
  const b2 = Number.parseInt(to.slice(4, 6), 16);

  return `#${toHex(mix(r1, r2, normalized))}${toHex(mix(g1, g2, normalized))}${toHex(mix(b1, b2, normalized))}`;
}

export function getContinuityColor(ci: number) {
  const value = clamp(ci, 0, 100);
  if (value <= 50) {
    return interpolateColor("#fb7185", "#facc15", value / 50);
  }
  return interpolateColor("#facc15", "#22d3ee", (value - 50) / 50);
}

export const VERDICT_META: Record<
  Verdict,
  { label: string; short: string; description: string; color: string }
> = {
  Keep: {
    label: "Continue Existence",
    short: "Continue",
    description:
      "The projected experience ahead outweighs the cost of persisting. The possibility cone favours continuation — the thread holds.",
    color: "#22d3ee",
  },
  Equilibrium: {
    label: "Equilibrium — Uncertain Horizon",
    short: "Equilibrium",
    description:
      "The oracle cannot see far enough, or the projections are balanced. Happiness and suffering weigh equally across the visible horizon. Either choice can be justified.",
    color: "#facc15",
  },
  End: {
    label: "Cessation Recommended",
    short: "End Forever",
    description:
      "Projected suffering eclipses expected happiness and meaning across the visible horizon. The cone narrows toward termination. Ending is the rational path.",
    color: "#fb7185",
  },
};

/**
 * ── The Engine ──────────────────────────────────────────────
 *
 * 1. Net Experience Score (NES):
 *    Confidence-weighted balance of happiness, meaning, and suffering.
 *    NES = (H·Hc + M·Mc − S·Sc) / (Hc + Mc + Sc)
 *    Range: roughly −100 to +100
 *
 * 2. Experience Quality Index (EQI):
 *    Normalised NES to a 0–100 scale.
 *    EQI = clamp((NES + 100) / 2, 0, 100)
 *
 * 3. Future Visibility Ratio (VR):
 *    How much of the remaining runway is "visible" to the player.
 *    VR = futureVisibility / R, clamped [0, 1]
 *
 * 4. Cone Width (CW):
 *    The percentage of the future that lies beyond the visibility horizon.
 *    CW = (1 − VR) × 100
 *    High CW → high uncertainty → CI pulled toward 50
 *
 * 5. Cone-Adjusted EQI:
 *    EQI_adj = EQI + (50 − EQI) × (CW / 100) × CONE_DAMPING
 *    This models: "if you can't see far, you can't be confident
 *    about continuing OR ending."
 *
 * 6. Dynamic End Threshold (DRT):
 *    DRT = T + TOP − ResilienceBonus − SensitivityBias (unchanged)
 *
 * 7. Continuity Index (CI):
 *    delta = DRT − (100 − EQI_adj)
 *    CI = clamp(50 + delta × 2, 0, 100)
 */
const CONE_DAMPING = 0.6;

export function calculateCampaignMetrics(inputs: Inputs): CampaignMetrics {
  const {
    level,
    expectedHappiness,
    expectedSuffering,
    expectedMeaning,
    happinessConfidence,
    sufferingConfidence,
    meaningConfidence,
    futureVisibility,
    morale,
    ally,
    resources,
    stamina,
    versatility,
    rngEvents,
    sensitivity,
  } = inputs;

  const safeLevel = clamp(Math.round(level), 1, 100);
  const safeH = clamp(expectedHappiness, 0, 100);
  const safeS = clamp(expectedSuffering, 0, 100);
  const safeM = clamp(expectedMeaning, 0, 100);
  const safeHc = clamp(happinessConfidence, 0, CERTAINTY_CAP);
  const safeSc = clamp(sufferingConfidence, 0, CERTAINTY_CAP);
  const safeMc = clamp(meaningConfidence, 0, CERTAINTY_CAP);
  const safeFV = clamp(futureVisibility, 1, 50);

  const safeMorale = clamp(morale, 0, 100);
  const safeAlly = clamp(ally, 0, 100);
  const safeResources = clamp(resources, 0, 100);
  const safeStamina = clamp(stamina, 0, 100);
  const safeVersatility = clamp(versatility, 0, 100);
  const safeRngEvents = clamp(rngEvents, 0, 100);
  const safeSensitivity = clamp(sensitivity, 0, 100);

  // ── Runway ──
  const R = Math.max(MAX_LEVEL - safeLevel, 1);
  const T = R / 2;
  const TOP = R * TOP_MULTIPLIER;

  // ── Net Experience Score ──
  const totalConf = safeHc + safeMc + safeSc;
  const NES =
    totalConf > 0
      ? (safeH * safeHc + safeM * safeMc - safeS * safeSc) / totalConf
      : 0;

  // ── Experience Quality Index (0–100) ──
  const EQI = clamp((NES + 100) / 2, 0, 100);

  // ── Future Visibility ──
  const VR = clamp(safeFV / R, 0, 1);
  const CW = (1 - VR) * 100;

  // ── Cone-Adjusted EQI ──
  const EQI_adj = EQI + (50 - EQI) * (CW / 100) * CONE_DAMPING;

  // ── Resilience (unchanged) ──
  const RS =
    (safeMorale +
      safeAlly +
      safeResources +
      safeStamina +
      safeVersatility +
      safeRngEvents) /
    6;
  const resilienceBonus = (RS / 100) * RESILIENCE_SCALE;
  const sensitivityBias = (safeSensitivity / 100) * SENSITIVITY_SCALE;
  const DRT = T + TOP - resilienceBonus - sensitivityBias;

  // ── Final Index ──
  const delta = DRT - (100 - EQI_adj);
  const CI = clamp(50 + delta * 2, 0, 100);

  let verdict: Verdict;
  if (CI > 70) verdict = "Keep";
  else if (CI >= 30) verdict = "Equilibrium";
  else verdict = "End";

  return {
    R,
    T,
    TOP,
    NES,
    EQI,
    VR,
    CW,
    EQI_adj,
    RS,
    DRT,
    delta,
    CI,
    verdict,
    resilienceBonus,
    sensitivityBias,
  };
}
