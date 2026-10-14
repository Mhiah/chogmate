import { clearSession } from "@/lib/session";
import { json } from "@/lib/api";

export async function POST() {
  clearSession();
  return json({ ok: true });
}
