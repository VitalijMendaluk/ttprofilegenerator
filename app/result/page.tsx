"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

interface ProfileResult {
  nickname: { option1: string; option2: string; option3: string; tip: string };
  bio: { text: string; tip: string };
  header: { line1: string; line2: string; line3: string; tip: string };
  cta: { text: string; tip: string };
  link: { recommendation: string; tip: string };
  first_video_idea: string;
}

const STORAGE_KEY = "tiktok_form_data";

export default function ResultPage() {
  const router = useRouter();
  const [result, setResult] = useState<ProfileResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copiedKey, setCopiedKey] = useState("");
  const [userLink, setUserLink] = useState("");
  const [userName, setUserName] = useState("");
  const [activeNick, setActiveNick] = useState(0);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("tiktok_result");
      if (saved) setResult(JSON.parse(saved));
      else router.push("/");
      const form = localStorage.getItem(STORAGE_KEY);
      if (form) {
        const p = JSON.parse(form);
        setUserLink(p.link || "");
        setUserName(p.name || "");
      }
    } catch { router.push("/"); }
  }, [router]);

  const copy = useCallback(async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(""), 2000);
    } catch {}
  }, []);

  const regenerate = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) { router.push("/"); return; }
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: saved,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Помилка");
      localStorage.setItem("tiktok_result", JSON.stringify(data));
      setResult(data);
      setActiveNick(0);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Спробуйте ще раз");
    } finally { setLoading(false); }
  }, [router]);

  if (!result) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex gap-2">{[0, 1, 2].map(i => (
        <div key={i} className="w-3 h-3 rounded-full animate-bounce"
          style={{ background: "linear-gradient(135deg,#7C3AED,#EC4899)", animationDelay: `${i * 0.15}s` }} />
      ))}</div>
    </div>
  );

  const nicks = [result.nickname.option1, result.nickname.option2, result.nickname.option3];

  const CopyBtn = ({ text, id }: { text: string; id: string }) => (
    <button
      onClick={(e) => { e.stopPropagation(); copy(text, id); }}
      className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150"
      style={{
        background: copiedKey === id ? "rgba(34,197,94,0.2)" : "rgba(124,58,237,0.15)",
        color: copiedKey === id ? "#86efac" : "#A78BFA",
        border: `1px solid ${copiedKey === id ? "rgba(34,197,94,0.4)" : "rgba(124,58,237,0.3)"}`,
      }}
    >
      {copiedKey === id ? "✓ Скопійовано" : "Копіювати"}
    </button>
  );

  return (
    <main className="min-h-screen px-4 py-10 flex flex-col items-center">
      <div className="w-full max-w-md">

        {/* Title */}
        <div className="text-center mb-6 animate-fade-up">
          <h1 className="text-2xl font-bold mb-1">
            <span className="gradient-text">Профіль готовий! 🎉</span>
          </h1>
          <p className="text-sm" style={{ color: "#555" }}>Вставляй по одному полю в TikTok</p>
        </div>

        {/* ═══════════════════════════════════
            TIKTOK "EDIT PROFILE" SCREEN MOCKUP
            ═══════════════════════════════════ */}
        <div className="animate-fade-up stagger-1 rounded-3xl overflow-hidden mb-6"
          style={{ background: "#0f0f0f", border: "1px solid #2a2a2a" }}>

          {/* TikTok top nav */}
          <div className="flex items-center justify-between px-4 pt-4 pb-3">
            <button className="text-white" style={{ fontSize: 20 }}>←</button>
            <span className="font-semibold text-white text-base">Редагувати профіль</span>
            <span className="text-sm font-semibold" style={{ color: "#FE2C55" }}>Зберегти</span>
          </div>

          {/* Avatar */}
          <div className="flex flex-col items-center pb-4 pt-2">
            <div className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold mb-2"
              style={{ background: "linear-gradient(135deg,#7C3AED,#EC4899)" }}>
              {userName.charAt(0).toUpperCase() || "?"}
            </div>
            <span className="text-sm" style={{ color: "#FE2C55" }}>Змінити фото</span>
          </div>

          <div className="px-4 pb-6 flex flex-col gap-1">

            {/* USERNAME */}
            <FieldLabel>Нікнейм</FieldLabel>
            <div className="flex flex-col gap-2 mb-4">
              {nicks.map((nick, i) => (
                <div key={i}
                  onClick={() => setActiveNick(i)}
                  className="flex items-center justify-between rounded-xl px-4 py-3 cursor-pointer transition-all"
                  style={{
                    background: activeNick === i ? "rgba(254,44,85,0.08)" : "#1a1a1a",
                    border: `1px solid ${activeNick === i ? "rgba(254,44,85,0.4)" : "#2a2a2a"}`,
                  }}>
                  <div className="flex items-center gap-2">
                    {activeNick === i && (
                      <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                        style={{ background: "rgba(254,44,85,0.15)", color: "#FE2C55" }}>
                        Варіант {i + 1}
                      </span>
                    )}
                    {activeNick !== i && (
                      <span className="text-xs font-medium" style={{ color: "#555" }}>Варіант {i + 1}</span>
                    )}
                    <span className="font-semibold text-white">@{nick}</span>
                  </div>
                  <CopyBtn text={nick} id={`nick-${i}`} />
                </div>
              ))}
              <p className="text-xs px-1" style={{ color: "#444" }}>💡 {result.nickname.tip}</p>
            </div>

            {/* NAME (header) */}
            <FieldLabel>Ім&apos;я <span style={{ color: "#555", fontWeight: 400 }}>(відображається під аватаром)</span></FieldLabel>
            <div className="rounded-xl overflow-hidden mb-1" style={{ border: "1px solid #2a2a2a" }}>
              {[
                { text: result.header.line1, id: "h1", hint: "рядок 1" },
                { text: result.header.line2, id: "h2", hint: "рядок 2" },
                { text: result.header.line3, id: "h3", hint: "рядок 3" },
              ].map(({ text, id, hint }, i) => (
                <div key={id}
                  className="flex items-center justify-between px-4 py-3"
                  style={{ background: "#1a1a1a", borderBottom: i < 2 ? "1px solid #222" : "none" }}>
                  <div>
                    <span className="text-xs mr-2" style={{ color: "#444" }}>{hint}</span>
                    <span className="text-white text-sm font-medium">{text}</span>
                  </div>
                  <CopyBtn text={text} id={id} />
                </div>
              ))}
            </div>
            <button
              onClick={() => copy(`${result.header.line1}\n${result.header.line2}\n${result.header.line3}`, "header-all")}
              className="w-full py-2 rounded-lg text-xs font-semibold mb-3 transition-all"
              style={{
                background: copiedKey === "header-all" ? "rgba(34,197,94,0.12)" : "rgba(255,255,255,0.04)",
                color: copiedKey === "header-all" ? "#86efac" : "#666",
                border: `1px solid ${copiedKey === "header-all" ? "rgba(34,197,94,0.3)" : "#2a2a2a"}`,
              }}>
              {copiedKey === "header-all" ? "✓ Всі 3 рядки скопійовано" : "Скопіювати всі 3 рядки разом"}
            </button>
            <p className="text-xs px-1 mb-4" style={{ color: "#444" }}>💡 {result.header.tip}</p>

            {/* BIO */}
            <FieldLabel>
              Біографія{" "}
              <span style={{ color: result.bio.text.length > 79 ? "#f87171" : "#555", fontWeight: 400 }}>
                ({result.bio.text.length}/80 символів{result.bio.text.length > 79 ? " — ЗАБАГАТО!" : ""})
              </span>
            </FieldLabel>
            <div className="rounded-xl px-4 py-3 mb-1" style={{ background: "#1a1a1a", border: "1px solid #2a2a2a" }}>
              <div className="flex items-start justify-between gap-3">
                <p className="text-white text-sm leading-relaxed flex-1">{result.bio.text}</p>
                <CopyBtn text={result.bio.text} id="bio" />
              </div>
            </div>
            <p className="text-xs px-1 mb-4" style={{ color: "#444" }}>💡 {result.bio.tip}</p>

            {/* LINK */}
            <FieldLabel>Посилання в профілі</FieldLabel>
            <div className="rounded-xl px-4 py-3" style={{ background: "#1a1a1a", border: "1px solid #2a2a2a" }}>
              {userLink ? (
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm" style={{ color: "#6eb3f7" }}>{userLink}</span>
                  <CopyBtn text={userLink} id="link" />
                </div>
              ) : (
                <p className="text-sm" style={{ color: "#555" }}>{result.link.recommendation}</p>
              )}
            </div>
            {!userLink && (
              <p className="text-xs px-1 mt-1" style={{ color: "#444" }}>💡 {result.link.tip}</p>
            )}
          </div>
        </div>

        {/* ═══ CTA + VIDEO IDEA ═══ */}
        <div className="flex flex-col gap-4 animate-fade-up stagger-2">

          {/* CTA */}
          <div className="rounded-2xl p-5" style={{ background: "#111", border: "1px solid #222" }}>
            <div className="flex items-center gap-2 mb-3">
              <span>📣</span>
              <h2 className="font-bold text-sm text-white">Що говорити в кінці кожного відео</h2>
            </div>
            <div className="rounded-xl px-4 py-3 mb-2" style={{ background: "#0d0d0d", border: "1px solid #222" }}>
              <div className="flex items-start justify-between gap-3">
                <p className="text-white text-sm leading-relaxed">«{result.cta.text}»</p>
                <CopyBtn text={result.cta.text} id="cta" />
              </div>
            </div>
            <p className="text-xs" style={{ color: "#555" }}>💡 {result.cta.tip}</p>
          </div>

          {/* First video */}
          <div className="rounded-2xl p-5"
            style={{ background: "linear-gradient(135deg,rgba(124,58,237,0.1),rgba(236,72,153,0.08))", border: "1px solid rgba(124,58,237,0.3)" }}>
            <div className="flex items-center gap-2 mb-3">
              <span>🎬</span>
              <h2 className="font-bold text-sm" style={{ color: "#A78BFA" }}>Ідея першого відео</h2>
            </div>
            <p className="text-white text-sm leading-relaxed">{result.first_video_idea}</p>
          </div>

          {error && (
            <div className="rounded-xl px-4 py-3 text-sm font-medium"
              style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#f87171" }}>
              {error}
            </div>
          )}

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pb-10">
            <button onClick={regenerate} disabled={loading}
              className="flex-1 py-3.5 rounded-xl font-semibold text-sm transition-all"
              style={{ background: loading ? "#222" : "linear-gradient(135deg,#7C3AED,#EC4899)", color: "white", cursor: loading ? "not-allowed" : "pointer" }}>
              {loading
                ? <span className="flex items-center justify-center gap-2"><Spinner /> Генеруємо...</span>
                : "Згенерувати новий варіант ↺"}
            </button>
            <button onClick={() => router.push("/?edit=1")}
              className="flex-1 py-3.5 rounded-xl font-semibold text-sm transition-all"
              style={{ background: "transparent", color: "#888", border: "1px solid #2a2a2a" }}>
              Змінити дані ←
            </button>
          </div>
        </div>

      </div>
    </main>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold mb-1.5 px-1" style={{ color: "#888" }}>
      {children}
    </p>
  );
}

function Spinner() {
  return (
    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}
