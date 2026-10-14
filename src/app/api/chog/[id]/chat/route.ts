import { json, fail, parseId, actor } from "@/lib/api";
import { chat } from "@/lib/life";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const id = parseId(params.id);
  if (id === null) return fail("Not a Chog number", 404);
  const a = await actor(id);
  if ("error" in a) return fail(a.error, a.status);
  const { message } = await req.json().catch(() => ({}));
  const text = typeof message === "string" ? message.trim().slice(0, 500) : "";
  if (!text) return fail("Say something first.");
  const who = a.guest ? `guest:${a.s.vid}` : a.s.address!;
  const r = await chat(a.c, who, text, a.guest);
  return json(r);
}
