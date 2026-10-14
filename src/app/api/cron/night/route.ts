import { json, fail } from "@/lib/api";
import { runNight } from "@/lib/night";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

/** Called by Vercel Cron just after midnight UTC (see vercel.json). Add ?force=1 to rerun today's night. */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) return fail("Unauthorized", 401);
  const force = new URL(req.url).searchParams.get("force") === "1";
  return json(await runNight({ force }));
}
