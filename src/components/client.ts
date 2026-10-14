"use client";

export async function api<T = unknown>(path: string, body?: unknown): Promise<T> {
  const r = await fetch(path, body === undefined ? { cache: "no-store" } : { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data.error || "Something went wrong. Try again.");
  return data as T;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Eth = { request(args: { method: string; params?: unknown[] }): Promise<any> };
const eth = () => (typeof window !== "undefined" ? (window as unknown as { ethereum?: Eth }).ethereum : undefined);
export const hasWallet = () => !!eth();

const MONAD = {
  chainId: "0x8f",
  chainName: "Monad",
  nativeCurrency: { name: "Monad", symbol: "MON", decimals: 18 },
  rpcUrls: ["https://rpc.monad.xyz"],
  blockExplorerUrls: ["https://monadvision.com"],
};

/** Connects the browser wallet and signs a free sign-in message. No transaction is sent. */
export async function signIn() {
  const w = eth();
  if (!w) throw new Error("No wallet found. Open Chogtown in your wallet's browser, or install a wallet extension.");
  const [address] = await w.request({ method: "eth_requestAccounts" });
  try {
    await w.request({ method: "wallet_switchEthereumChain", params: [{ chainId: MONAD.chainId }] });
  } catch (e) {
    if ((e as { code?: number })?.code === 4902) await w.request({ method: "wallet_addEthereumChain", params: [MONAD] }).catch(() => {});
  }
  const { message } = await api<{ message: string }>("/api/auth/nonce", { address });
  const hex = "0x" + Array.from(new TextEncoder().encode(message)).map((b) => b.toString(16).padStart(2, "0")).join("");
  const signature = await w.request({ method: "personal_sign", params: [hex, address] });
  return api<{ address: string }>("/api/auth/verify", { message, signature });
}

export const short = (a: string) => `${a.slice(0, 6)}…${a.slice(-4)}`;

export function ago(t: number) {
  const m = Math.round((Date.now() - t) / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.round(h / 24);
  return d === 1 ? "yesterday" : `${d} days ago`;
}

export const errMsg = (e: unknown) => (e instanceof Error ? e.message : "Something went wrong. Try again.");
