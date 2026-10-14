import { json, fail, parseId, verifyOwner } from "@/lib/api";
import { getSession, setSession } from "@/lib/session";
import { getChog, writeStory, saveChog, publicChog } from "@/lib/chogs";

export const dynamic = "force-dynamic";

/** Choose which of your Chogs to play as. Ownership is checked on Monad. */
export async function POST(req: Request) {
  const s = await getSession();
  if (!s?.address) return fail("Connect your wallet first.", 401);
  const { tokenId } = await req.json().catch(() => ({}));
  const id = parseId(tokenId);
  if (id === null) return fail("That isn't a Chog number.");
  const c = await getChog(id);
  if (!(await verifyOwner(c, s.address, true))) return fail(`Chog #${id} isn't in this wallet.`, 403);
  if (!c.storied || c.resident) {
    // First time its owner arrives: Claude writes its real name and backstory.
    await writeStory(c);
    c.resident = false;
    await saveChog(c);
  }
  await setSession({ ...s, tokenId: id, guest: false });
  return json({ chog: publicChog(c) });
}
