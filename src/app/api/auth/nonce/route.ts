import { store } from "@/lib/store";
import { json } from "@/lib/api";

export const dynamic = "force-dynamic";

/** A one-time message for the wallet to sign. Signing is free and sends no transaction. */
export async function POST(req: Request) {
  const { address } = await req.json().catch(() => ({}));
  if (typeof address !== "string" || !/^0x[0-9a-fA-F]{40}$/.test(address)) return json({ error: "Bad address" }, 400);
  const nonce = crypto.randomUUID().replace(/-/g, "");
  const host = req.headers.get("host") ?? "chogtown";
  const issued = new Date().toISOString();
  const message = `Welcome to Chogtown!\n\nSign in to prove this wallet holds your Chog. This is free and sends no transaction.\n\nSite: ${host}\nWallet: ${address}\nNonce: ${nonce}\nIssued: ${issued}`;
  await store().set("nonces", nonce, { address: address.toLowerCase(), t: Date.now() });
  return json({ message });
}
