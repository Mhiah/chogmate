"use client";

import { useEffect, useState } from "react";
import type { Shell } from "../types";
import { api } from "../client";

type Row = { id: number; other?: number; name: string; value: string };

export default function HallPanel({ shell }: { shell: Shell }) {
  const [boards, setBoards] = useState<Record<string, Row[]> | null>(null);
  const [tab, setTab] = useState("Streaks");
  useEffect(() => { api<Record<string, Row[]>>("/api/leaderboard").then(setBoards).catch(() => setBoards({})); }, []);
  if (!boards) return <p className="sub">Polishing the trophies…</p>;
  const mine = shell.me?.tokenId;
  const rows = boards[tab] ?? [];
  return (
    <>
      <div className="tabs" role="tablist">
        {Object.keys(boards).map((t) => <button key={t} role="tab" aria-selected={t === tab} onClick={() => setTab(t)}>{t}</button>)}
      </div>
      <div className="card" style={{ gap: 0, paddingBlock: 4 }}>
        {rows.length === 0 ? <p className="note" style={{ padding: "12px 0" }}>Nobody here yet. Be the first.</p> :
          rows.map((r, i) => (
            <div key={r.name} className={`rank ${r.id === mine || r.other === mine ? "me" : ""}`}><span className="n">{i + 1}</span><span>{r.name}</span><span className="num">{r.value}</span></div>
          ))}
      </div>
      <p className="note">Your Chog is highlighted in gold. Streaks count only while they're alive.</p>
    </>
  );
}
