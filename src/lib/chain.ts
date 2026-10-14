import { createPublicClient, defineChain, http, getAddress, type Address } from "viem";
import { CHOG_CONTRACT, MONAD_CHAIN_ID, MONAD_RPC } from "./config";

export const monad = defineChain({
  id: MONAD_CHAIN_ID,
  name: "Monad",
  nativeCurrency: { name: "Monad", symbol: "MON", decimals: 18 },
  rpcUrls: { default: { http: [MONAD_RPC] } },
  blockExplorers: { default: { name: "MonadVision", url: "https://monadvision.com" } },
});

export const client = createPublicClient({ chain: monad, transport: http(MONAD_RPC, { timeout: 8000 }) });

const erc721 = [
  { type: "function", name: "ownerOf", stateMutability: "view", inputs: [{ name: "tokenId", type: "uint256" }], outputs: [{ type: "address" }] },
  { type: "function", name: "tokenURI", stateMutability: "view", inputs: [{ name: "tokenId", type: "uint256" }], outputs: [{ type: "string" }] },
  { type: "function", name: "balanceOf", stateMutability: "view", inputs: [{ name: "owner", type: "address" }], outputs: [{ type: "uint256" }] },
  { type: "function", name: "tokenOfOwnerByIndex", stateMutability: "view", inputs: [{ name: "owner", type: "address" }, { name: "index", type: "uint256" }], outputs: [{ type: "uint256" }] },
] as const;

export async function ownerOf(tokenId: number): Promise<Address | null> {
  try {
    return getAddress(await client.readContract({ address: CHOG_CONTRACT, abi: erc721, functionName: "ownerOf", args: [BigInt(tokenId)] }));
  } catch {
    return null;
  }
}

export async function tokenURI(tokenId: number): Promise<string | null> {
  try {
    return await client.readContract({ address: CHOG_CONTRACT, abi: erc721, functionName: "tokenURI", args: [BigInt(tokenId)] });
  } catch {
    return null;
  }
}

/** Chogs held by an address. Returns null when the contract can't enumerate, so the user types their Chog number instead. */
export async function chogsOf(owner: Address): Promise<{ balance: number; ids: number[] | null }> {
  const balance = Number(await client.readContract({ address: CHOG_CONTRACT, abi: erc721, functionName: "balanceOf", args: [owner] }));
  if (!balance) return { balance, ids: [] };
  try {
    const ids: number[] = [];
    for (let i = 0; i < Math.min(balance, 20); i++) {
      ids.push(Number(await client.readContract({ address: CHOG_CONTRACT, abi: erc721, functionName: "tokenOfOwnerByIndex", args: [owner, BigInt(i)] })));
    }
    return { balance, ids };
  } catch {
    return { balance, ids: null };
  }
}

/** Checks a signed message, including smart-contract wallets (ERC-1271) when the RPC is reachable. */
export async function verifySignature(address: Address, message: string, signature: `0x${string}`) {
  try {
    return await client.verifyMessage({ address, message, signature });
  } catch {
    const { verifyMessage } = await import("viem");
    return verifyMessage({ address, message, signature });
  }
}
