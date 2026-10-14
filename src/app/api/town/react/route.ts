import { json, fail } from "@/lib/api";
import { getSession, setSession, newVid } from "@/lib/session";
import { store } from "@/lib/store";
import type { TownEvent } from "@/lib/night";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let s = await getSession();
  if (!s) { s = { vid: newVid() }; await setSession(s); }
  const { id } = await req.json().catch(() => ({}));
  const e = typeof id === "string" ? await store().get<TownEvent>("events", id) : null;
  if (!e) return fail("Not found", 404);
  const has = e.lovedBy.includes(s.vid);
  e.lovedBy = has ? e.lovedBy.filter((v) => v !== s!.vid) : [...e.lovedBy, s.vid];
  await store().set("events", e.id, e);
  return json({ loves: e.lovedBy.length, loved: !has });
}
