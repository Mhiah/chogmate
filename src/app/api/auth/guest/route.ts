import { json } from "@/lib/api";
import { getSession, setSession, newVid } from "@/lib/session";
import { RESIDENT_IDS } from "@/lib/config";
import { getChog } from "@/lib/chogs";

export const dynamic = "force-dynamic";

/** Explore Chogtown with a resident Chog. Chats work, but only real owners shape a Chog or keep a streak. */
export async function POST() {
  const prev = await getSession();
  const tokenId = RESIDENT_IDS[0];
  await getChog(tokenId, { resident: true });
  await setSession({ guest: true, tokenId, vid: prev?.vid ?? newVid() });
  return json({ tokenId });
}
