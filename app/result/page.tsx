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

  const copy = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(""), 2000);
  };

  const CopyBtn = ({ text, id }: { text: string; id: string }) => (
    <button
      onClick={() => copy(text, id)}
      className="shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200"
      style={{
        background: copiedKey === id ? "rgba(34,197,94,0.2)" : "rgba(255,255,255,0.08)",
        color: copiedKey === id ? "#86efac" : "#aaa",
        border: `1px solid ${copiedKey === id ? "rgba(34,197,94,0.4)" : "rgba(255,255,255,0.1)"}`,
      }}
    >
      {copiedKey === id ? "✓ Скопійовано" : "Копіювати"}
    </button>
  );

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
      <div className="flex gap-2">{[0,1,2].map(i => (
        <div key={i} className="w-3 h-3 rounded-full animate-bounce"
          style={{ background: "linear-gradient(135deg,#7C3AED,#EC4899)", animationDelay: `${i*0.15}s` }} />
      ))}</div>
    </div>
  );

  const nicks = [result.nickname.option1, result.nickname.option2, result.nickname.option3];
  const currentNick = nicks[activeNick];
  const headerFull = `${result.header.line1}\n${result.header.line2}\n${result.header.line3}`;

  return (
    <main className="min-h-screen px-4 py-10 flex flex-col items-center">
      <div className="w-full max-w-xl">

        {/* Title */}
        <div className="text-center mb-8 animate-fade-up">
          <h1 className="text-2xl md:text-3xl font-bold mb-1">
            <span className="gradient-text">Твій TikTok-профіль готовий! 🎉</span>
          </h1>
          <p className="text-sm" style={{ color: "#555" }}>Натискай на елементи щоб скопіювати</p>
        </div>

        {/* ═══ TIKTOK PROFILE MOCKUP ═══ */}
        <div className="animate-fade-up stagger-1 rounded-2xl overflow-hidden mb-8"
          style={{ background: "#111", border: "1px solid #222" }}>

          {/* Mockup top bar */}
          <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: "#1e1e1e" }}>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ background: "#333" }} />
              <span className="text-xs font-medium" style={{ color: "#444" }}>TikTok — Профіль</span>
            </div>
            <div className="flex gap-1.5">
              {["#ff5f57","#febc2e","#28c840"].map(c => (
                <div key={c} className="w-2.5 h-2.5 rounded-full" style={{ background: c }} />
              ))}
            </div>
          </div>

          {/* Mockup content */}
          <div className="px-5 py-6">
            {/* Avatar + stats */}
            <div className="flex items-start gap-4 mb-4">
              {/* Avatar */}
              <div className="relative shrink-0">
                <div className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold"
                  style={{ background: "linear-gradient(135deg,#7C3AED,#EC4899)" }}>
                  {userName.charAt(0).toUpperCase() || "?"}
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs"
                  style={{ background: "#FE2C55", border: "2px solid #111" }}>+</div>
              </div>
              {/* Stats */}
              <div className="flex gap-5 mt-2">
                {[["0","Відео"],["0","Підписки"],["0","Підписники"]].map(([n,l]) => (
                  <div key={l} className="text-center">
                    <div className="font-bold text-white text-lg leading-tight">{n}</div>
                    <div className="text-xs" style={{ color: "#666" }}>{l}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Display name / header — це "ім'я" у профілі */}
            <div className="mb-1 group cursor-pointer" onClick={() => copy(headerFull, "header-mock")}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-bold text-white text-base leading-tight">{result.header.line1}</div>
                  <div className="text-sm leading-tight" style={{ color: "#ccc" }}>{result.header.line2}</div>
                  <div className="text-sm leading-tight" style={{ color: "#aaa" }}>{result.header.line3}</div>
                </div>
                <span className="text-xs px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                  style={{ background: copiedKey === "header-mock" ? "rgba(34,197,94,0.2)" : "rgba(124,58,237,0.2)", color: copiedKey === "header-mock" ? "#86efac" : "#A78BFA" }}>
                  {copiedKey === "header-mock" ? "✓" : "копіювати"}
                </span>
              </div>
            </div>

            {/* Bio */}
            <div className="mb-3 group cursor-pointer" onClick={() => copy(result.bio.text, "bio-mock")}>
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm leading-relaxed" style={{ color: "#ddd" }}>{result.bio.text}</p>
                <span className="text-xs px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                  style={{ background: copiedKey === "bio-mock" ? "rgba(34,197,94,0.2)" : "rgba(124,58,237,0.2)", color: copiedKey === "bio-mock" ? "#86efac" : "#A78BFA" }}>
                  {copiedKey === "bio-mock" ? "✓" : "копіювати"}
                </span>
              </div>
            </div>

            {/* Link */}
            {userLink && (
              <div className="flex items-center gap-1.5 mb-3 group cursor-pointer" onClick={() => copy(userLink, "link-mock")}>
                <span style={{ color: "#FE2C55" }}>🔗</span>
                <span className="text-sm underline" style={{ color: "#6eb3f7" }}>{userLink}</span>
                {copiedKey === "link-mock" && <span className="text-xs" style={{ color: "#86efac" }}>✓</span>}
              </div>
            )}

            {/* Nickname selector */}
            <div className="mt-4 pt-4 border-t" style={{ borderColor: "#1e1e1e" }}>
              <p className="text-xs mb-2 font-medium" style={{ color: "#555" }}>
                @ Нікнейм — обери варіант:
              </p>
              <div className="flex flex-wrap gap-2">
                {nicks.map((nick, i) => (
                  <button key={i} onClick={() => { setActiveNick(i); copy(nick, `nick-mock-${i}`); }}
                    className="px-3 py-1.5 rounded-full text-sm font-semibold transition-all"
                    style={{
                      background: activeNick === i ? "linear-gradient(135deg,#7C3AED,#EC4899)" : "rgba(255,255,255,0.05)",
                      color: activeNick === i ? "#fff" : "#888",
                      border: activeNick === i ? "none" : "1px solid #2a2a2a",
                    }}>
                    @{nick} {copiedKey === `nick-mock-${i}` ? "✓" : ""}
                  </button>
                ))}
              </div>
              <p className="text-xs mt-2" style={{ color: "#444" }}>Активний: @{currentNick}</p>
            </div>
          </div>

          {/* Legend */}
          <div className="px-5 pb-4 flex flex-wrap gap-x-4 gap-y-1">
            {[
              { dot: "#7C3AED", label: "Шапка профілю (ім'я)" },
              { dot: "#EC4899", label: "Біо" },
              { dot: "#6eb3f7", label: "Посилання" },
            ].map(({ dot, label }) => (
              <div key={label} className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ background: dot }} />
                <span className="text-xs" style={{ color: "#555" }}>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ═══ COPY SECTIONS ═══ */}
        <div className="flex flex-col gap-4">

          {/* Nickname detail */}
          <Section title="@ Нікнейм" icon="@" delay="stagger-2">
            <div className="flex flex-col gap-2 mb-3">
              {nicks.map((nick, i) => (
                <div key={i} className="flex items-center justify-between rounded-xl px-4 py-3 cursor-pointer transition-all"
                  style={{ background: activeNick === i ? "rgba(124,58,237,0.12)" : "#0d0d0d", border: `1px solid ${activeNick === i ? "rgba(124,58,237,0.4)" : "#222"}` }}
                  onClick={() => setActiveNick(i)}>
                  <span className="font-semibold" style={{ color: activeNick === i ? "#A78BFA" : "#fff" }}>@{nick}</span>
                  <CopyBtn text={nick} id={`nick-${i}`} />
                </div>
              ))}
            </div>
            <Tip text={result.nickname.tip} />
          </Section>

          {/* Bio */}
          <Section title="Біо профілю" icon="📝" delay="stagger-3">
            <div className="rounded-xl p-4 mb-3 cursor-pointer" style={{ background: "#0d0d0d", border: "1px solid #222" }}
              onClick={() => copy(result.bio.text, "bio-section")}>
              <div className="flex items-start justify-between gap-3">
                <p className="text-white leading-relaxed">{result.bio.text}</p>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <CopyBtn text={result.bio.text} id="bio-section" />
                  <span className="text-xs" style={{ color: result.bio.text.length > 70 ? "#f87171" : "#555" }}>
                    {result.bio.text.length}/80
                  </span>
                </div>
              </div>
            </div>
            <Tip text={result.bio.tip} />
          </Section>

          {/* Header */}
          <Section title="Шапка профілю — 3 рядки під аватаркою" icon="🔝" delay="stagger-4">
            <p className="text-xs mb-3" style={{ color: "#555" }}>
              Це поле «Ім'я» у налаштуваннях TikTok — видно одразу під фото профілю
            </p>
            <div className="flex flex-col gap-2 mb-3">
              {[
                { label: "Рядок 1 — Хто ти", text: result.header.line1, id: "h1" },
                { label: "Рядок 2 — Для кого / результат", text: result.header.line2, id: "h2" },
                { label: "Рядок 3 — Заклик до дії", text: result.header.line3, id: "h3" },
              ].map(({ label, text, id }) => (
                <div key={id} className="rounded-xl px-4 py-3" style={{ background: "#0d0d0d", border: "1px solid #222" }}>
                  <p className="text-xs mb-1 font-medium" style={{ color: "#555" }}>{label}</p>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-white font-semibold">{text}</span>
                    <CopyBtn text={text} id={id} />
                  </div>
                </div>
              ))}
            </div>
            <button onClick={() => copy(headerFull, "header-all")}
              className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all"
              style={{ background: copiedKey === "header-all" ? "rgba(34,197,94,0.15)" : "rgba(124,58,237,0.1)", color: copiedKey === "header-all" ? "#86efac" : "#A78BFA", border: `1px solid ${copiedKey === "header-all" ? "rgba(34,197,94,0.3)" : "rgba(124,58,237,0.2)"}` }}>
              {copiedKey === "header-all" ? "✓ Скопійовано всі рядки" : "Скопіювати всі 3 рядки"}
            </button>
            <div className="mt-3"><Tip text={result.header.tip} /></div>
          </Section>

          {/* CTA */}
          <Section title="Заклик до дії у відео" icon="📣" delay="stagger-5">
            <div className="rounded-xl p-4 mb-3" style={{ background: "#0d0d0d", border: "1px solid #222" }}>
              <div className="flex items-start justify-between gap-3">
                <p className="text-white leading-relaxed">«{result.cta.text}»</p>
                <CopyBtn text={result.cta.text} id="cta" />
              </div>
            </div>
            <Tip text={result.cta.tip} />
          </Section>

          {/* Link */}
          <Section title="Посилання в профілі" icon="🔗" delay="stagger-6">
            <div className="rounded-xl p-4 mb-3" style={{ background: "#0d0d0d", border: "1px solid #222" }}>
              <p className="text-sm leading-relaxed mb-3" style={{ color: "#ccc" }}>{result.link.recommendation}</p>
              {userLink && (
                <div className="flex items-center justify-between gap-3 pt-3 border-t" style={{ borderColor: "#222" }}>
                  <span className="text-sm" style={{ color: "#6eb3f7" }}>{userLink}</span>
                  <CopyBtn text={userLink} id="link-section" />
                </div>
              )}
            </div>
            <Tip text={result.link.tip} />
          </Section>

          {/* First video */}
          <div className="rounded-2xl p-5 animate-fade-up stagger-6"
            style={{ background: "linear-gradient(135deg, rgba(124,58,237,0.1), rgba(236,72,153,0.1))", border: "1px solid rgba(124,58,237,0.35)" }}>
            <div className="flex items-center gap-2 mb-3">
              <span>✨</span>
              <h2 className="font-bold" style={{ color: "#A78BFA" }}>Ідея першого відео 🎬</h2>
            </div>
            <p className="text-white leading-relaxed text-sm mb-4">{result.first_video_idea}</p>
            <button disabled
              className="w-full py-2.5 rounded-xl text-sm font-semibold opacity-50 cursor-not-allowed"
              style={{ background: "rgba(124,58,237,0.15)", color: "#A78BFA", border: "1px solid rgba(124,58,237,0.2)" }}>
              Згенерувати сценарій для цього відео ↗ (незабаром)
            </button>
          </div>

          {error && (
            <div className="rounded-xl px-4 py-3 text-sm font-medium"
              style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#f87171" }}>
              {error}
            </div>
          )}

          {/* Bottom buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pb-10">
            <button onClick={regenerate} disabled={loading}
              className="flex-1 py-3.5 rounded-xl font-semibold text-sm transition-all"
              style={{ background: loading ? "#222" : "linear-gradient(135deg,#7C3AED,#EC4899)", color: "white", cursor: loading ? "not-allowed" : "pointer" }}>
              {loading ? <span className="flex items-center justify-center gap-2"><Spinner /> Генеруємо...</span> : "Згенерувати новий варіант ↺"}
            </button>
            <button onClick={() => router.push("/")}
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

function Section({ title, icon, delay, children }: { title: string; icon: string; delay: string; children: React.ReactNode }) {
  return (
    <div className={`rounded-2xl p-5 animate-fade-up ${delay}`} style={{ background: "#111", border: "1px solid #222" }}>
      <div className="flex items-center gap-2 mb-4">
        <span>{icon}</span>
        <h2 className="font-bold text-sm" style={{ color: "#ddd" }}>{title}</h2>
      </div>
      {children}
    </div>
  );
}

function Tip({ text }: { text: string }) {
  return <p className="text-xs leading-relaxed" style={{ color: "#555" }}>💡 {text}</p>;
}

function Spinner() {
  return (
    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}
