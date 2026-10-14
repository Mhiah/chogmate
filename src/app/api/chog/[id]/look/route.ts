import { json, fail, parseId, actor } from "@/lib/api";
import { saveChog } from "@/lib/chogs";

export const dynamic = "force-dynamic";
const HATS = ["none", "party", "crown", "chef"], AURAS = ["gold", "rose", "cyan", "mint"];

/** Studio outfit. Saved in Chogtown only: the NFT itself never changes. */
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const id = parseId(params.id);
  if (id === null) return fail("Not a Chog number", 404);
  const a = await actor(id);
  if ("error" in a) return fail(a.error, a.status);
  const { hat, aura } = await req.json().catch(() => ({}));
  if (!HATS.includes(hat) || !AURAS.includes(aura)) return fail("Unknown outfit");
  if (a.guest) return json({ look: { hat, aura }, saved: false });
  a.c.look = { hat, aura };
  await saveChog(a.c);
  return json({ look: a.c.look, saved: true });
}
