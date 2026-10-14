import { json, fail, parseId, actor } from "@/lib/api";
import { checkIn } from "@/lib/life";
import { publicChog } from "@/lib/chogs";

export const dynamic = "force-dynamic";

export async function POST(_: Request, { params }: { params: { id: string } }) {
  const id = parseId(params.id);
  if (id === null) return fail("Not a Chog number", 404);
  const a = await actor(id);
  if ("error" in a) return fail(a.error, a.status);
  if (a.guest) return fail("Connect a wallet that holds a Chog to keep a streak.", 403);
  const r = await checkIn(a.c);
  return json({ ...r, chog: publicChog(a.c) });
}
