import { json, fail, parseId } from "@/lib/api";
import { getSession } from "@/lib/session";
import { getChog, loadChog, publicChog, label } from "@/lib/chogs";
import { getChat, greeting } from "@/lib/life";

export const dynamic = "force-dynamic";

/** A Chog's public profile. Its owner (or a guest exploring it) also gets their own chat history. */
export async function GET(_: Request, { params }: { params: { id: string } }) {
  const id = parseId(params.id);
  if (id === null) return fail("Not a Chog number", 404);
  const c = await getChog(id);
  const s = await getSession();
  const mine = s?.tokenId === id;
  const who = s?.guest ? `guest:${s.vid}` : s?.address;
  const log = mine && who ? await getChat(c, who) : null;
  const names: Record<number, string> = {};
  for (const r of Object.keys(c.rel)) { const o = await loadChog(Number(r)); if (o) names[o.id] = label(o); }
  return json({
    chog: publicChog(c),
    names,
    mine,
    chat: log ? { messages: log.messages.slice(-30), greeting: greeting(c), left: Math.max(0, 40 - (log.day === new Date().toISOString().slice(0, 10) ? log.count : 0)) } : null,
  });
}
