import { IPFS_GATEWAY } from "./config";
import { tokenURI } from "./chain";

export type Traits = Record<string, string>;
export interface ChogMeta {
  name: string;
  image: string | null;
  traits: Traits;
  /** false when the chain or IPFS could not be reached and the traits are stand-ins */
  real: boolean;
}

export const ipfs = (u: string) => (u.startsWith("ipfs://") ? IPFS_GATEWAY + u.slice(7).replace(/^ipfs\//, "") : u);

/** Reads the Chog's metadata from its tokenURI. Falls back to stand-in traits so the town still works offline. */
export async function fetchMeta(tokenId: number): Promise<ChogMeta> {
  const uri = await tokenURI(tokenId);
  if (uri) {
    try {
      let json: { name?: string; image?: string; attributes?: { trait_type?: string; value?: unknown }[] };
      if (uri.startsWith("data:application/json;base64,")) json = JSON.parse(Buffer.from(uri.split(",")[1], "base64").toString());
      else if (uri.startsWith("data:application/json")) json = JSON.parse(decodeURIComponent(uri.split(",")[1]));
      else {
        const r = await fetch(ipfs(uri), { signal: AbortSignal.timeout(8000), next: { revalidate: 86400 } });
        json = await r.json();
      }
      const traits: Traits = {};
      for (const a of json.attributes ?? []) if (a.trait_type) traits[a.trait_type] = String(a.value);
      return { name: json.name || `Chog #${tokenId}`, image: json.image ? ipfs(json.image) : null, traits, real: true };
    } catch {
      /* fall through */
    }
  }
  return { name: `Chog #${tokenId}`, image: null, traits: standInTraits(tokenId), real: false };
}

const pick = <T,>(a: T[], n: number) => a[n % a.length];
function standInTraits(id: number): Traits {
  const h = (k: number) => Math.abs(Math.imul(id + 1, 2654435761) ^ (k * 40503)) >>> 3;
  return {
    Eyes: pick(["Grumpy", "Wide", "Sleepy", "Side Eye", "Soft", "Teary", "Angry", "Glasses"], h(1)),
    Mouth: pick(["Frown", "Grin", "Smile", "Smirk", "Open", "Teeth", "Flat"], h(2)),
    Head: pick(["None", "Crown", "Chef Hat", "Headphones", "Cap", "Flower"], h(3)),
    Aura: pick(["Calm Lilac", "Golden Glow", "Storm", "Fire", "Sparkle", "None"], h(4)),
    Tier: pick(["1", "2", "3", "4", "5"], h(5)),
    Background: pick(["Night Market", "Palace", "Garden", "Arcade", "Harbor", "Clouds"], h(6)),
  };
}
