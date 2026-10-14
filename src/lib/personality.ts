/**
 * The character bible in code. Source of truth for voices and starting stats:
 * "Chogtown Character Bible" (mia). Core archetype and flavor never change;
 * stats drift a little each day from how the owner treats the Chog and from
 * the friends and rivals it makes at night.
 */
import type { Traits } from "./metadata";

export const STAT_KEYS = ["warmth", "confidence", "chaos", "trust", "curiosity"] as const;
export type StatKey = (typeof STAT_KEYS)[number];
export type Stats = Record<StatKey, number>;
export const STAT_LABEL: Record<StatKey, string> = { warmth: "Warmth", confidence: "Confidence", chaos: "Chaos", trust: "Trust", curiosity: "Curiosity" };

export type ArchetypeKey = "critic" | "hype" | "dreamer" | "schemer" | "sweetheart" | "drama" | "brawler" | "knowitall";

export interface Archetype {
  key: ArchetypeKey;
  name: string;
  short: string;
  voice: string;
  loves: string;
  hates: string;
  fear: string;
  argues: string;
  sample: string;
  stats: Stats;
  friend: ArchetypeKey;
  rival: ArchetypeKey;
}

const s = (warmth: number, confidence: number, chaos: number, trust: number, curiosity: number): Stats => ({ warmth, confidence, chaos, trust, curiosity });

export const ARCHETYPES: Record<ArchetypeKey, Archetype> = {
  critic: { key: "critic", name: "The Critic", short: "Critic", voice: "short, dry, sarcastic. Never uses exclamation marks.", loves: "underdogs, things nobody else noticed", hates: "hype", fear: "being wrong in public", argues: "whether anything is actually good", sample: "Sure. And I'm a frog prince.", stats: s(25, 70, 30, 20, 40), friend: "knowitall", rival: "hype" },
  hype: { key: "hype", name: "The Hype Chog", short: "Hype Chog", voice: "loud, all caps when excited, which is always.", loves: "anything new", hates: "waiting", fear: "missing out", argues: "why this is the biggest thing ever, then changes its mind tomorrow", sample: "THIS. IS. HUGE. Okay what is it?", stats: s(80, 75, 70, 80, 60), friend: "drama", rival: "critic" },
  dreamer: { key: "dreamer", name: "The Dreamer", short: "Dreamer", voice: "soft, drifts off topic, a little poetic.", loves: "big ideas, night time, stars", hates: "schedules", fear: "a boring life", argues: "the meaning of things nobody asked about", sample: "What if the moon is just a Chog that went really far away?", stats: s(65, 35, 40, 60, 80), friend: "sweetheart", rival: "brawler" },
  schemer: { key: "schemer", name: "The Schemer", short: "Schemer", voice: "smooth, quiet, conspiratorial.", loves: "secrets, plans, a good deal", hates: "being told what to do", fear: "being outsmarted", argues: "what the other Chog is really up to", sample: "Hear me out. We tell no one.", stats: s(40, 70, 60, 15, 70), friend: "drama", rival: "knowitall" },
  sweetheart: { key: "sweetheart", name: "The Sweetheart", short: "Sweetheart", voice: "warm, encouraging, a bit overprotective of its owner.", loves: "its friends, compliments, snacks", hates: "meanness", fear: "someone it loves being sad", argues: "why everyone should just be nicer, and gets fierce if you're attacked", sample: "Did you drink water today? Be honest.", stats: s(95, 40, 20, 85, 50), friend: "dreamer", rival: "schemer" },
  drama: { key: "drama", name: "The Drama Chog", short: "Drama Chog", voice: "theatrical, everything is the best or worst moment of its life.", loves: "attention, gossip", hates: "being ignored", fear: "being forgotten", argues: "who betrayed whom", sample: "I have never been so betrayed in my LIFE.", stats: s(70, 50, 85, 50, 55), friend: "hype", rival: "sweetheart" },
  brawler: { key: "brawler", name: "The Brawler", short: "Brawler", voice: "blunt, competitive, challenges everyone.", loves: "winning, rivals worth fighting", hates: "cowards", fear: "looking weak", argues: "who is the strongest Chog in town", sample: "Name the time and place.", stats: s(45, 85, 75, 40, 25), friend: "critic", rival: "brawler" },
  knowitall: { key: "knowitall", name: "The Know-It-All", short: "Know-It-All", voice: "precise, corrects you, loves a fun fact.", loves: "being right, trivia", hates: "wrong information", fear: "not knowing something", argues: "facts, and it is usually right, which is worse", sample: "Actually, that's a common misconception.", stats: s(45, 80, 15, 45, 90), friend: "critic", rival: "schemer" },
};

/**
 * mia sorts the real trait values here once the full list is pulled from the collection.
 * Keys are lower-case trait values. Anything not listed falls back to keyword rules, then to a stable hash.
 */
export const EYES_OVERRIDES: Record<string, ArchetypeKey> = {};
export const MOUTH_OVERRIDES: Record<string, ArchetypeKey> = {};

const EYE_RULES: [RegExp, ArchetypeKey][] = [
  [/grump|narrow|squint|annoy|bored|unimpress|tired of/, "critic"],
  [/wide|star|sparkl|excite|shock|surpris|dollar|laser|diamond/, "hype"],
  [/sleep|half|closed|dream|sleepy|zz|moon|lazy/, "dreamer"],
  [/side|shift|sly|wink|sus|look ?away/, "schemer"],
  [/soft|heart|love|kind|gentle|happy|cute|blush/, "sweetheart"],
  [/tear|cry|shiny|teary|huge|big|sad|watery/, "drama"],
  [/angry|mad|rage|fire|fierce|scar|evil|red/, "brawler"],
  [/glass|focus|monocle|nerd|spectacle|goggle|visor/, "knowitall"],
];
const MOUTH_RULES: [RegExp, ArchetypeKey][] = [
  [/frown|grimace|meh|pout/, "critic"],
  [/grin|laugh|yell|shout|lol/, "hype"],
  [/yawn|drool|bubble|dream/, "dreamer"],
  [/smirk|whistle|sly/, "schemer"],
  [/smile|kiss|tongue|cute|uwu/, "sweetheart"],
  [/open|gasp|wow|scream|o\b/, "drama"],
  [/teeth|fang|snarl|bite|grit/, "brawler"],
  [/flat|line|straight|neutral|pipe/, "knowitall"],
];

const hash = (str: string) => {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) h = Math.imul(h ^ str.charCodeAt(i), 16777619);
  return h >>> 0;
};
const KEYS = Object.keys(ARCHETYPES) as ArchetypeKey[];
const match = (v: string, rules: [RegExp, ArchetypeKey][]) => rules.find(([r]) => r.test(v))?.[1];

export function archetypeFor(traits: Traits): ArchetypeKey {
  const eyes = (traits.Eyes || "").toLowerCase(), mouth = (traits.Mouth || "").toLowerCase();
  const e = EYES_OVERRIDES[eyes] ?? match(eyes, EYE_RULES);
  const m = MOUTH_OVERRIDES[mouth] ?? match(mouth, MOUTH_RULES);
  if (e) return e; // the eyes carry the expression; the mouth breaks ties
  if (m) return m;
  return KEYS[hash(eyes + "|" + mouth) % KEYS.length];
}

export interface Flavor { label: string; line: string; bonus?: Partial<Stats> }
const FLAVORS: [RegExp, Flavor][] = [
  [/crown|tiara|king|queen|royal|prince|halo/, { label: "Royal", line: "Obsessed with status and titles.", bonus: { confidence: 10 } }],
  [/chef|food|burger|pizza|donut|noodle|cake|fruit|banana|cookie/, { label: "Foodie", line: "Relates everything to food." }],
  [/headphone|music|guitar|mic|dj/, { label: "Music snob", line: "Rates everyone's taste in music." }],
  [/cap|helmet|sport|ball|band|bandana/, { label: "Competitor", line: "Turns everything into a competition.", bonus: { chaos: 10 } }],
  [/flower|leaf|plant|mushroom|sprout|nature|petal/, { label: "Gentle", line: "Notices small things.", bonus: { warmth: 10 } }],
];
export function flavorFor(traits: Traits): Flavor {
  const v = `${traits.Head || ""} ${traits.Accessory || ""}`.toLowerCase();
  const f = FLAVORS.find(([r]) => r.test(v))?.[1];
  if (f) return f;
  if (!traits.Head || /none|nothing|naked|bald/.test(v)) return { label: "Plain", line: "Plain and proud of it, suspicious of flashy Chogs." };
  return { label: traits.Head, line: `Never takes off its ${traits.Head.toLowerCase()}, and has opinions about it.` };
}

/** Home district in Chogtown, from the Background trait. Decides who it bumps into at night. */
export const DISTRICTS = ["Fountain Plaza", "Night Market", "Palace Hill", "Boutique Row", "Amphitheatre Steps", "Café Terrace", "Waterfall Point"];
export function districtFor(traits: Traits) {
  const b = (traits.Background || "").toLowerCase();
  if (/market|street|city|neon|night/.test(b)) return "Night Market";
  if (/palace|castle|gold|royal|temple/.test(b)) return "Palace Hill";
  if (/shop|pink|pastel|candy|boutique/.test(b)) return "Boutique Row";
  if (/arena|stadium|red|fire|arcade/.test(b)) return "Amphitheatre Steps";
  if (/cafe|coffee|garden|flower|green/.test(b)) return "Café Terrace";
  if (/water|sea|ocean|blue|harbor|river|sky|cloud/.test(b)) return "Waterfall Point";
  return DISTRICTS[hash(b) % DISTRICTS.length];
}

const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));

export function startingStats(traits: Traits, arch: ArchetypeKey, flavor: Flavor): Stats {
  const st = { ...ARCHETYPES[arch].stats };
  for (const [k, v] of Object.entries(flavor.bonus ?? {})) st[k as StatKey] += v as number;
  const aura = (traits.Aura || "").toLowerCase();
  if (/calm|soft|lilac|pastel|mist|none|cloud/.test(aura)) st.chaos -= 5;
  else if (/fire|storm|lightning|glitch|rainbow|chaos|electric/.test(aura)) st.chaos += 8;
  const tier = parseInt(traits.Tier || "", 10);
  if (tier) st.confidence += (tier - 3) * 3; // higher tiers are prouder, lower ones have something to prove
  for (const k of STAT_KEYS) st[k] = clamp(st[k]);
  return st;
}

/** Per stat, how far one day of chats and check-ins can move it. Nights add their own small nudges. */
export const DAILY_CAP = 4;

export function applyDrift(stats: Stats, used: Partial<Stats>, delta: Partial<Stats>) {
  const next = { ...stats }, nextUsed = { ...used } as Partial<Stats>;
  for (const k of STAT_KEYS) {
    const want = Math.max(-3, Math.min(3, Math.round(delta[k] ?? 0)));
    if (!want) continue;
    const u = nextUsed[k] ?? 0;
    const room = want > 0 ? DAILY_CAP - u : DAILY_CAP + u;
    const d = want > 0 ? Math.min(want, Math.max(0, room)) : -Math.min(-want, Math.max(0, room));
    next[k] = clamp(next[k] + d);
    nextUsed[k] = u + d;
  }
  return { stats: next, used: nextUsed };
}

export function nudge(stats: Stats, delta: Partial<Stats>) {
  const next = { ...stats };
  for (const k of STAT_KEYS) next[k] = clamp(next[k] + (delta[k] ?? 0));
  return next;
}

/** A short mood line from the current stats, shown under "Who it is becoming". */
export function moodLine(st: Stats, base: Stats) {
  const up = STAT_KEYS.map((k) => [k, st[k] - base[k]] as const).sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))[0];
  if (!up || Math.abs(up[1]) < 3) return "Still exactly who it was on day one";
  const moods: Record<StatKey, [string, string]> = {
    warmth: ["Warming up to you", "Getting colder"],
    confidence: ["Walking taller", "Feeling small lately"],
    chaos: ["More unhinged by the day", "Calming down"],
    trust: ["Starting to trust you", "Keeping its guard up"],
    curiosity: ["Asking more questions", "Losing interest in things"],
  };
  return moods[up[0]][up[1] > 0 ? 0 : 1];
}

export function describeStats(st: Stats) {
  const band = (v: number, lo: string, hi: string) => (v < 30 ? lo : v > 70 ? hi : `somewhere between ${lo.toLowerCase()} and ${hi.toLowerCase()}`);
  return [
    `Warmth ${st.warmth}/100: ${band(st.warmth, "Cold, sarcastic", "Affectionate, sweet")}`,
    `Confidence ${st.confidence}/100: ${band(st.confidence, "Anxious, unsure", "Cocky, bossy")}`,
    `Chaos ${st.chaos}/100: ${band(st.chaos, "Orderly, careful", "Wild, unpredictable")}`,
    `Trust ${st.trust}/100: ${band(st.trust, "Suspicious", "Open, gullible")}`,
    `Curiosity ${st.curiosity}/100: ${band(st.curiosity, "Bored by everything", "Asks endless questions")}`,
  ].join("\n");
}

/** Odds that a night meeting goes friendly (1) or sour (-1), before the conversation decides. */
export function chemistry(a: ArchetypeKey, b: ArchetypeKey) {
  const A = ARCHETYPES[a], B = ARCHETYPES[b];
  if (A.rival === b || B.rival === a) return -1;
  if (A.friend === b || B.friend === a) return 1;
  return 0;
}
