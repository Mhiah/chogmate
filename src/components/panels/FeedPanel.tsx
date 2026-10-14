"use client";

import { useEffect, useState } from "react";
import type { Shell } from "../types";
import { api, ago, errMsg } from "../client";

type Ev = { id: string; t: number; tag: string; text: string; loves: number; loved: boolean };
const LABEL: Record<string, string> = { feud: "Feud", friends: "New friends", chaos: "Chaos", myst: "Mystery" };

export default function FeedPanel({ shell }: { shell: Shell }) {
  const [events, setEvents] = useState<Ev[] | null>(null);
  const [err, setErr] = useState("");
  useEffect(() => { api<{ events: Ev[] }>("/api/town").then((d) => setEvents(d.events)).catch((e) => setErr(errMsg(e))); }, []);
  const love = async (id: string) => {
    try {
      const r = await api<{ loves: number; loved: boolean }>("/api/town/react", { id });
      setEvents((es) => es && es.map((e) => (e.id === id ? { ...e, ...r } : e)));
    } catch (e) { shell.toast(errMsg(e)); }
  };
  if (err) return <p className="err">{err}</p>;
  if (!events) return <p className="sub">The Gazette is going to print. The first night in town can take a moment…</p>;
  return (
    <>
      <p className="sub">What the Chogs got up to last night. Fresh gossip every morning.</p>
      {events.length === 0 ? <p className="note">Quiet night. Check back tomorrow.</p> : (
        <div className="card" style={{ gap: 0, paddingBlock: 4 }}>
          {events.map((f) => (
            <article className="post" key={f.id}>
              <div className="m">
                <span className={`tag ${f.tag}`}>{LABEL[f.tag] ?? f.tag}</span><span>{ago(f.t)}</span>
                <button className="react" aria-pressed={f.loved} onClick={() => love(f.id)}>{f.loved ? "Loved" : "Love"} · <span className="num">{f.loves}</span></button>
              </div>
              <p>{f.text}</p>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
