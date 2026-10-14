import { json } from "@/lib/api";
import { leaderboards } from "@/lib/night";

export const dynamic = "force-dynamic";

export async function GET() {
  return json(await leaderboards());
}
