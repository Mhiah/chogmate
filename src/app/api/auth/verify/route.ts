import { getAddress } from "viem";
import { store } from "@/lib/store";
import { json, fail } from "@/lib/api";
import { verifySignature } from "@/lib/chain";
import { getSession, setSession, newVid } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const { message, signature } = await req.json().catch(() => ({}));
  if (typeof message !== "string" || typeof signature !== "string") return fail("Missing signature");
  const nonce = /Nonce: (\w+)/.exec(message)?.[1], wallet = /Wallet: (0x[0-9a-fA-F]{40})/.exec(message)?.[1];
  if (!nonce || !wallet) return fail("Bad message");
  const rec = await store().get<{ address: string; t: number }>("nonces", nonce);
  await store().del("nonces", nonce);
  if (!rec || rec.address !== wallet.toLowerCase() || Date.now() - rec.t > 10 * 60e3) return fail("This sign-in expired. Try again.", 401);
  const address = getAddress(wallet);
  if (!(await verifySignature(address, message, signature as `0x${string}`))) return fail("Signature didn't match this wallet.", 401);
  const prev = await getSession();
  await setSession({ address, vid: prev?.vid ?? newVid() });
  return json({ address });
}
