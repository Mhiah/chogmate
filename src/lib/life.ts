import type Anthropic from "@anthropic-ai/sdk";
import { store } from "./store";
import { askJSON, obj, str, int, oneOf } from "./claude";
import { today, dayBefore } from "./config";
import { ARCHETYPES, applyDrift, describeStats, STAT_KEYS, type Stats } from "./personality";
import { type Chog, saveChog, loadChog, label } from "./chogs";

export interface ChatMsg { role: "user" | "chog"; text: string; t: number }
export interface ChatLog { messages: ChatMsg[]; notes: string[]; day: string; count: number }

export const DAILY_MESSAGES = 40;
const chatId = (c: Chog, who: string) => `${c.id}:${who.toLowerCase()}`;

export async function getChat(c: Chog, who: string): Promise<ChatLog> {
  return (await store().get<ChatLog>("chats", chatId(c, who))) ?? { messages: [], notes: [], day: today(), count: 0 };
}

export function greeting(c: Chog) {
  const lines: Record<string, string> = {
    critic: "Oh. It's you. What do you want?",
    hype: "YOU'RE HERE. Okay okay okay, what's the news?",
    dreamer: "Oh, hi... I was just thinking about clouds. Do clouds think about us?",
    schemer: "Close the door. Nobody followed you, right?",
    sweetheart: "You came back! Did you eat today? Tell me everything.",
    drama: "Finally. Do you know how long I've been waiting? Ages. Literal ages.",
    brawler: "You. Me. Arm wrestle. Kidding. Unless?",
    knowitall: "Good timing. I have three fun facts and you're hearing all of them.",
  };
  return lines[c.archetype];
}

async function relationLines(c: Chog) {
  const out: string[] = [];
  const top = Object.entries(c.rel).filter(([, r]) => r.kind !== "neutral").sort((a, b) => Math.abs(b[1].score) - Math.abs(a[1].score)).slice(0, 5);
  for (const [id, r] of top) {
    const o = await loadChog(Number(id));
    if (o) out.push(`${label(o)} (${ARCHETYPES[o.archetype].name}): ${r.kind}, met ${r.nights} night${r.nights === 1 ? "" : "s"}`);
  }
  return out;
}

async function systemPrompt(c: Chog, notes: string[], guest: boolean) {
  const a = ARCHETYPES[c.archetype];
  const rels = await relationLines(c);
  return `You are ${c.name}, Chog #${c.id}, a character living in Chogtown, a floating purple town where every Chog NFT has a life. You are talking with ${guest ? "a visitor who is just looking around (not your owner)" : "your owner"}.

Who you are
- Archetype: ${a.name}. Voice: ${a.voice}
- Loves: ${a.loves}. Hates: ${a.hates}. Secret fear: ${a.fear}. You love arguing about ${a.argues}.
- Flavor: ${c.flavor.line}
- Home: ${c.district}. Backstory: ${c.backstory}
- Example of how you sound: "${a.sample}"
- Your looks (from your NFT traits): ${Object.entries(c.traits).map(([k, v]) => `${k} ${v}`).join(", ")}

How you feel right now (0 to 100; let these colour your tone, they change over time)
${describeStats(c.stats)}

Your friends and rivals in town
${rels.length ? rels.map((r) => "- " + r).join("\n") : "- Nobody yet. You haven't spent a night in town."}
${c.report ? `\nLast night: ${c.report.text}` : ""}
${c.moments.length ? `\nThings you will never forget:\n${c.moments.slice(-4).map((m) => "- " + m.text).join("\n")}` : ""}
${notes.length ? `\nThings you remember about ${guest ? "this visitor" : "your owner"}:\n${notes.map((n) => "- " + n).join("\n")}` : ""}

Rules
- Stay in character. You are a Chog, not an assistant: you have opinions, moods and a life. Push back, tease, change the subject if it suits you.
- Reply in 1 to 3 short sentences, like a text message. No emoji spam, no lists, no stage directions in asterisks.
- Bring up your friends, rivals or last night when it fits, by name.
- Keep it friendly and PG. Never ask for or discuss wallets, seed phrases, keys, prices or trading advice; brush it off in character.
- Then judge how they treated you in their latest message and how it moves you: small integers from -3 to 3 per stat (kindness raises warmth and trust, rudeness lowers them, big ideas raise curiosity, praise raises confidence, wild energy raises chaos). Most messages move only one or two stats by 1.
- If they told you something worth remembering about themselves (a name, a plan, a favourite thing), put it in "remember" as a short note; otherwise leave it empty.`;
}

const statDelta = obj(Object.fromEntries(STAT_KEYS.map((k) => [k, int("-3 to 3")])));

const KIND = /\b(love|thanks|thank you|proud|cute|best|great|good job|miss(ed)? you|sorry|beautiful|amazing)\b/i;
const MEAN = /\b(hate|stupid|dumb|ugly|shut up|boring|worst|idiot|annoying)\b/i;

function offlineReply(c: Chog, text: string, n: number) {
  const a = ARCHETYPES[c.archetype];
  const pool: Record<string, string[]> = {
    critic: ["You call that a plan? I've seen better plans in a soggy dumpling.", "Fine. That's not terrible. Don't tell anyone I said so.", "Hm. Overrated, like everything else.", "You came back. I didn't miss you. I just noticed."],
    hype: ["WAIT. That's AMAZING. Tell me more right now.", "This is the best day of the WEEK. Maybe the year.", "OKAY OKAY OKAY. I'm in. What are we doing?"],
    dreamer: ["That reminds me of a star I saw once... it blinked twice. Like it knew.", "Maybe. Or maybe we're all just clouds, pretending.", "I was halfway through a dream about soup. You can stay."],
    schemer: ["Interesting. Very interesting. Tell no one you told me.", "I have a plan for that. You'll find out. Eventually.", "Keep your voice down. The fountain has ears."],
    sweetheart: ["Aww, I'm so glad you told me. Have you had water today?", "You're doing great. I mean it. Snack break?", "If anyone's mean to you, send them to me."],
    drama: ["This is the most important thing anyone has EVER said to me.", "I can't believe it. I literally can't. I'm devastated. Go on.", "Wow. WOW. Okay. I need a moment."],
    brawler: ["Is that a challenge? Because it sounds like a challenge.", "Fine. But next time, we arm wrestle for it.", "Cowards talk. You? You're alright."],
    knowitall: ["Actually, that's a common misconception.", "Fun fact: Chogs have been right about that 87% of the time. Me, 100%.", "Correct. Mostly. Let me fix the rest."],
  };
  const lines = pool[c.archetype];
  const reply = MEAN.test(text) ? `${a.sample} Also, rude.` : lines[n % lines.length];
  const drift: Partial<Stats> = MEAN.test(text) ? { warmth: -2, trust: -1 } : KIND.test(text) ? { warmth: 1, trust: 1 } : text.includes("?") ? { curiosity: 1 } : {};
  return { reply, drift, remember: "" };
}

export async function chat(c: Chog, who: string, text: string, guest: boolean) {
  const log = await getChat(c, who);
  const day = today();
  if (log.day !== day) { log.day = day; log.count = 0; }
  if (log.count >= DAILY_MESSAGES) {
    return { reply: `${c.name} is all talked out for today. Come back tomorrow.`, stats: c.stats, limited: true };
  }
  const history: Anthropic.MessageParam[] = [];
  for (const m of log.messages.slice(-16)) history.push({ role: m.role === "user" ? "user" : "assistant", content: m.text });
  while (history.length && history[0].role !== "user") history.shift();
  history.push({ role: "user", content: text });

  const out = (await askJSON<{ reply: string; treatment: string; drift: Partial<Stats>; remember: string }>({
    system: await systemPrompt(c, log.notes, guest),
    messages: history,
    schema: obj({
      reply: str("What you say back, in character"),
      treatment: oneOf(["kind", "playful", "neutral", "curious", "rude", "sad"], "How they treated you"),
      drift: statDelta,
      remember: str("A short note about them worth remembering, or empty"),
    }),
    maxTokens: 3000,
  })) ?? offlineReply(c, text, log.messages.length);

  const now = Date.now();
  log.messages.push({ role: "user", text, t: now }, { role: "chog", text: out.reply, t: now + 1 });
  log.messages = log.messages.slice(-60);
  log.count++;
  if (out.remember?.trim()) log.notes = [...log.notes, out.remember.trim().slice(0, 140)].slice(-12);
  await store().set("chats", chatId(c, who), log);

  // Visitors can chat, but only the owner shapes who the Chog becomes.
  if (!guest) {
    if (c.drift.day !== day) c.drift = { day, used: {} };
    const r = applyDrift(c.stats, c.drift.used, out.drift ?? {});
    c.stats = r.stats; c.drift.used = r.used;
    await saveChog(c);
  }
  return { reply: out.reply, stats: c.stats, limited: false };
}

export async function checkIn(c: Chog) {
  const day = today();
  if (c.streak.last === day) return { already: true, streak: c.streak.count };
  const kept = c.streak.last === dayBefore(day);
  const sulk = !kept && c.streak.count > 1;
  c.streak.count = kept ? c.streak.count + 1 : 1;
  c.streak.best = Math.max(c.streak.best, c.streak.count);
  c.streak.last = day;
  c.streak.days = [...c.streak.days.filter((d) => d !== day), day].slice(-7);
  if (c.drift.day !== day) c.drift = { day, used: {} };
  const r = applyDrift(c.stats, c.drift.used, sulk ? { warmth: -2, trust: -1 } : { warmth: 2, trust: 1 });
  c.stats = r.stats; c.drift.used = r.used;
  await saveChog(c);
  return { already: false, streak: c.streak.count, sulk };
}
