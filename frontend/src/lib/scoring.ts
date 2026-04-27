export const SENSATIONAL = [
  "shocking","bombshell","suppressed","miracle","cure","secret",
  "they don't want","proven","guaranteed","breaking","hoax","fraud",
  "exposed","mainstream media","big pharma","government hiding","wake up",
  "share before deleted","urgent","crisis","outrage","cover-up",
  "conspiracy","scientists baffled","immediately","bleach","5g","microchip"
];

export const HEDGE_WORDS = [
  "according to","study shows","research suggests","experts say",
  "data indicates","as reported","sources confirm","scientists found",
  "evidence suggests"
];

export const EMOTIONAL = [
  "outrage","shocking","disgusting","unbelievable","terrifying",
  "alarming","devastating","horrifying","insane","crazy","insidious",
  "evil","corrupt","traitor","liar","scam"
];

export const FALSE_CLAIM_PATTERNS = [
  [/(bleach|chlorine dioxide)/i, 0.95, "Dangerous health misinformation"],
  [/(5g.*covid|covid.*5g|microchip.*vaccine|vaccine.*microchip)/i, 0.92, "Debunked conspiracy theory"],
  [/(voting machine.*hack|election.*stolen|votes.*flipped)/i, 0.78, "Election misinformation pattern"],
  [/(cure.*diabetes|diabetes.*cure|cancer.*cure.*week)/i, 0.80, "Unverified medical cure claim"],
  [/(suppress.*study|government.*hiding|mainstream.*media.*lie)/i, 0.72, "Suppression conspiracy framing"],
  [/(9 out of 10.*doctor|doctors recommend.*supplement)/i, 0.68, "Misleading endorsement statistic"],
] as const;

export const SOURCE_SCORES: Record<string, number> = {
  "Social media post":       0.45,
  "News article":            0.72,
  "Blog / unknown site":     0.38,
  "Official / government":   0.88,
  "Satire site":             0.20,
};

export interface ScoringResult {
  risk: number;
  linguistic: number;
  source: number;
  pattern: number;
  context: number;
  flags: [string, string][];
  entities: [string, string][];
  pattern_match: string | null;
}

export function scoreText(text: string, source: string): ScoringResult {
  const lower = text.toLowerCase();
  const words = lower.split(/\s+/);

  const sens_count = words.filter(w => SENSATIONAL.some(s => w.includes(s))).length;
  const emot_count = words.filter(w => EMOTIONAL.some(e => w.includes(e))).length;
  
  const capsMatch = text.match(/[A-Z]/g);
  const caps_ratio = (capsMatch?.length || 0) / Math.max(text.length, 1);
  const exc_count = (text.match(/!/g) || []).length;
  
  const hedge_count = HEDGE_WORDS.filter(h => lower.includes(h)).length;

  const linguistic = Math.min(1.0, Math.max(0.0,
    sens_count * 0.15 + emot_count * 0.10 +
    caps_ratio * 2.0 + exc_count * 0.10 -
    hedge_count * 0.10
  ));

  const source_risk = 1.0 - (SOURCE_SCORES[source] || 0.5);

  let pattern_risk = 0.0;
  let pattern_match: string | null = null;
  
  for (const [pat, score, label] of FALSE_CLAIM_PATTERNS) {
    if (pat.test(text)) {
      pattern_risk = score as number;
      pattern_match = label as string;
      break;
    }
  }

  const has_numbers = /\d+%|\d+ out of \d+|\d+ times/.test(text);
  const has_attribution = /according to|study|research|scientists|experts/.test(lower);
  const context_risk = (has_numbers && !has_attribution) ? 0.50 : 0.10;

  let final = 0;
  if (pattern_risk > 0) {
    final = pattern_risk * 0.50 + linguistic * 0.25 + source_risk * 0.20 + context_risk * 0.05;
  } else {
    final = linguistic * 0.40 + source_risk * 0.35 + context_risk * 0.25;
  }

  final = Math.min(0.98, Math.max(0.03, final));

  // Flags
  const flags: [string, string][] = [];
  if (sens_count > 0) {
    flags.push(["#e04040", `${sens_count} sensational keyword${sens_count > 1 ? 's' : ''} detected`]);
  }
  if (caps_ratio > 0.15) {
    flags.push(["#e04040", "Unusually high use of capital letters"]);
  }
  if (exc_count > 1) {
    flags.push(["#d4850a", `${exc_count} exclamation marks — typical of clickbait writing`]);
  }
  if (emot_count > 0) {
    flags.push(["#d4850a", `${emot_count} emotionally charged word${emot_count > 1 ? 's' : ''} detected`]);
  }
  if (has_numbers && !has_attribution) {
    flags.push(["#e04040", "Unattributed statistic — numbers without a source are a red flag"]);
  }
  if (hedge_count > 0) {
    flags.push(["#5a9e2f", `${hedge_count} hedging phrase${hedge_count > 1 ? 's' : ''} — appropriate epistemic caution`]);
  }
  if (pattern_match) {
    flags.push(["#c04040", `Pattern match: ${pattern_match}`]);
  }
  if ((SOURCE_SCORES[source] || 0.5) < 0.5) {
    flags.push(["#d4850a", `Source type '${source}' has low inherent credibility`]);
  }

  // Entities
  const entities: [string, string][] = [];
  
  const claim_hits = text.match(/\b(cure[sd]?|prevent[sd]?|cause[sd]?|proven|guarantee[sd]?|confirm[sed]?)\b/gi) || [];
  const unique_claims = [...new Set(claim_hits)].slice(0, 2);
  unique_claims.forEach(w => entities.push([w, "claim"]));

  const num_hits = text.match(/\d+\s*(?:out of|%|times|days?|weeks?|hours?)/gi) || [];
  const unique_nums = [...new Set(num_hits)].slice(0, 3);
  unique_nums.forEach(n => entities.push([n, "stat"]));

  const src_hits = text.match(/\b(scientists?|doctors?|experts?|researchers?|government|WHO|CDC|FDA)\b/gi) || [];
  const unique_srcs = [...new Set(src_hits)].slice(0, 3);
  unique_srcs.forEach(s => entities.push([s, "source"]));

  const cap_hits = text.match(/\b[A-Z]{4,}\b/g) || [];
  const unique_caps = [...new Set(cap_hits)].slice(0, 3);
  unique_caps.forEach(c => entities.push([c, "entity"]));

  return {
    risk: final,
    linguistic,
    source: source_risk,
    pattern: pattern_risk,
    context: context_risk,
    flags,
    entities,
    pattern_match,
  };
}

export function riskLevel(r: number): "high" | "medium" | "low" {
  if (r > 0.65) return "high";
  if (r > 0.35) return "medium";
  return "low";
}

export function riskLabel(r: number): string {
  if (r > 0.65) return "High Risk";
  if (r > 0.35) return "Medium Risk";
  return "Low Risk";
}

export function barColor(val: number): string {
  if (val > 0.65) return "#e04040";
  if (val > 0.35) return "#d4850a";
  return "#5a9e2f";
}
