import { json, fail } from "@/lib/api";
import { getSession, setSession, newVid } from "@/lib/session";
import { ensureDebate, vote, type Debate } from "@/lib/night";
import { loadChog, label } from "@/lib/chogs";
import { ARCHETYPES } from "@/lib/personality";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

async function view(d: Debate | null, vid?: string) {
  if (!d) return { debate: null };
  const side = async (k: "a" | "b") => {
    const c = await loadChog(d[k].id);
    return { id: d[k].id, who: c ? label(c) : `Chog #${d[k].id}`, type: c ? ARCHETYPES[c.archetype].name : "", line: d[k].line, votes: Object.values(d.votes).filter((v) => v === k).length };
  };
  return { debate: { day: d.day, topic: d.topic, a: await side("a"), b: await side("b"), mine: vid ? d.votes[vid] ?? null : null, settled: d.settled, winner: d.winner } };
}

export async function GET() {
  const s = await getSession();
  return json(await view(await ensureDebate(), s?.vid));
}

export async function POST(req: Request) {
  let s = await getSession();
  if (!s) { s = { vid: newVid() }; await setSession(s); }
  const { side } = await req.json().catch(() => ({}));
  if (side !== "a" && side !== "b" && side !== null) return fail("Pick a side");
  const d = await vote(s.vid, side);
  if (!d) return fail("Voting has closed for this one.", 409);
  return json(await view(d, s.vid));
}
