"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

interface ProfileResult {
  nickname: {
    option1: string;
    option2: string;
    option3: string;
    tip: string;
  };
  bio: {
    text: string;
    tip: string;
  };
  header: {
    line1: string;
    line2: string;
    line3: string;
    tip: string;
  };
  cta: {
    text: string;
    tip: string;
  };
  link: {
    recommendation: string;
    tip: string;
  };
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

  useEffect(() => {
    try {
      const saved = localStorage.getItem("tiktok_result");
      if (saved) setResult(JSON.parse(saved));
      else router.push("/");

      const form = localStorage.getItem(STORAGE_KEY);
      if (form) {
        const parsed = JSON.parse(form);
        setUserLink(parsed.link || "");
      }
    } catch {
      router.push("/");
    }
  }, [router]);

  const copy = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(""), 2000);
  };

  const regenerate = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) { router.push("/"); return; }
      const form = JSON.parse(saved);

      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Помилка генерації");
      localStorage.setItem("tiktok_result", JSON.stringify(data));
      setResult(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Спробуйте ще раз");
    } finally {
      setLoading(false);
    }
  }, [router]);

  const goBack = () => {
    router.push("/");
  };

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <LoadingPulse />
          <p className="mt-4" style={{ color: "#666" }}>Завантаження...</p>
        </div>
      </div>
    );
  }

  const copyBtn = (text: string, key: string) => (
    <button
      onClick={() => copy(text, key)}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
      style={{
        background: copiedKey === key ? "rgba(34,197,94,0.15)" : "rgba(124,58,237,0.15)",
        color: copiedKey === key ? "#86efac" : "#A78BFA",
        border: `1px solid ${copiedKey === key ? "rgba(34,197,94,0.3)" : "rgba(124,58,237,0.3)"}`,
      }}
    >
      {copiedKey === key ? "✓ Скопійовано" : "Копіювати"}
    </button>
  );

  return (
    <main className="min-h-screen px-4 py-10 flex flex-col items-center">
      {/* Header */}
      <div className="text-center mb-8 animate-fade-up w-full max-w-xl">
        <h1 className="text-2xl md:text-3xl font-bold mb-1">
          <span className="gradient-text">Твій TikTok-профіль готовий! 🎉</span>
        </h1>
        <p className="text-sm" style={{ color: "#666" }}>
          Скопіюй і встав у свій профіль
        </p>
      </div>

      <div className="w-full max-w-xl flex flex-col gap-5">

        {/* Card 1 — Nickname */}
        <Card title="Нікнейм" icon="@" delay="stagger-1">
          <div className="flex flex-wrap gap-2 mb-4">
            {[result.nickname.option1, result.nickname.option2, result.nickname.option3].map((nick, i) => (
              <div key={i} className="flex items-center gap-2 px-4 py-2 rounded-full"
                style={{ background: "rgba(124,58,237,0.15)", border: "1px solid rgba(124,58,237,0.3)" }}>
                <span className="font-semibold text-sm" style={{ color: "#A78BFA" }}>@{nick}</span>
                {copyBtn(nick, `nick-${i}`)}
              </div>
            ))}
          </div>
          <Tip text={result.nickname.tip} />
        </Card>

        {/* Card 2 — Bio */}
        <Card title="Біо профілю" icon="📝" delay="stagger-2">
          <div className="relative rounded-xl p-4 mb-3"
            style={{ background: "#0d0d0d", border: "1px solid #2a2a2a" }}>
            <p className="text-white leading-relaxed text-base pr-20">{result.bio.text}</p>
            <div className="absolute top-3 right-3 flex flex-col items-end gap-2">
              {copyBtn(result.bio.text, "bio")}
              <span className="text-xs" style={{ color: "#555" }}>
                {result.bio.text.length}/80
              </span>
            </div>
          </div>
          <Tip text={result.bio.tip} />
        </Card>

        {/* Card 3 — Header */}
        <Card title="Шапка профілю" icon="🔝" delay="stagger-3">
          <div className="flex flex-col gap-2 mb-3">
            {[
              { label: "Рядок 1", text: result.header.line1 },
              { label: "Рядок 2", text: result.header.line2 },
              { label: "Рядок 3", text: result.header.line3 },
            ].map((row, i) => (
              <div key={i} className="flex items-center justify-between rounded-xl px-4 py-3"
                style={{ background: "#0d0d0d", border: "1px solid #2a2a2a" }}>
                <div>
                  <span className="text-xs font-medium mr-2" style={{ color: "#555" }}>{row.label}</span>
                  <span className="text-white text-sm font-medium">{row.text}</span>
                </div>
                {copyBtn(row.text, `header-${i}`)}
              </div>
            ))}
          </div>
          <button
            onClick={() => copy(`${result.header.line1}\n${result.header.line2}\n${result.header.line3}`, "header-all")}
            className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all"
            style={{
              background: copiedKey === "header-all" ? "rgba(34,197,94,0.15)" : "rgba(124,58,237,0.1)",
              color: copiedKey === "header-all" ? "#86efac" : "#A78BFA",
              border: `1px solid ${copiedKey === "header-all" ? "rgba(34,197,94,0.3)" : "rgba(124,58,237,0.2)"}`,
            }}
          >
            {copiedKey === "header-all" ? "✓ Скопійовано всі рядки" : "Скопіювати все"}
          </button>
          <div className="mt-3">
            <Tip text={result.header.tip} />
          </div>
        </Card>

        {/* Card 4 — CTA */}
        <Card title="Заклик до дії у відео" icon="📣" delay="stagger-4">
          <div className="relative rounded-xl p-4 mb-3"
            style={{ background: "#0d0d0d", border: "1px solid #2a2a2a" }}>
            <p className="text-white leading-relaxed pr-24">{result.cta.text}</p>
            <div className="absolute top-3 right-3">
              {copyBtn(result.cta.text, "cta")}
            </div>
          </div>
          <Tip text={result.cta.tip} />
        </Card>

        {/* Card 5 — Link */}
        <Card title="Рекомендація по посиланню" icon="🔗" delay="stagger-5">
          <div className="rounded-xl p-4 mb-3"
            style={{ background: "#0d0d0d", border: "1px solid #2a2a2a" }}>
            <p className="text-white leading-relaxed text-sm">{result.link.recommendation}</p>
            {userLink && (
              <div className="mt-3 flex items-center gap-2 flex-wrap">
                <span className="text-xs font-medium" style={{ color: "#666" }}>Твоє посилання:</span>
                <span className="text-sm font-medium" style={{ color: "#A78BFA" }}>{userLink}</span>
                {copyBtn(userLink, "user-link")}
              </div>
            )}
          </div>
          <Tip text={result.link.tip} />
        </Card>

        {/* Card 6 — First Video */}
        <Card title="Ідея першого відео 🎬" icon="✨" delay="stagger-6" accent>
          <div className="rounded-xl p-4 mb-4"
            style={{
              background: "linear-gradient(135deg, rgba(124,58,237,0.1), rgba(236,72,153,0.1))",
              border: "1px solid rgba(124,58,237,0.3)",
            }}>
            <p className="text-white leading-relaxed">{result.first_video_idea}</p>
          </div>
          <button
            className="w-full py-3 rounded-xl text-sm font-semibold transition-all opacity-70 cursor-not-allowed"
            style={{
              background: "rgba(124,58,237,0.1)",
              color: "#A78BFA",
              border: "1px solid rgba(124,58,237,0.2)",
            }}
            disabled
            title="Незабаром"
          >
            Згенерувати сценарій для цього відео ↗ (незабаром)
          </button>
        </Card>

        {error && (
          <div className="rounded-xl px-4 py-3 text-sm font-medium"
            style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#f87171" }}>
            {error}
          </div>
        )}

        {/* Bottom buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pb-10">
          <button
            onClick={regenerate}
            disabled={loading}
            className="flex-1 py-3.5 rounded-xl font-semibold text-sm transition-all"
            style={{
              background: loading ? "#222" : "linear-gradient(135deg, #7C3AED, #EC4899)",
              color: "white",
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Spinner /> Генеруємо...
              </span>
            ) : "Згенерувати новий варіант ↺"}
          </button>

          <button
            onClick={goBack}
            className="flex-1 py-3.5 rounded-xl font-semibold text-sm transition-all"
            style={{
              background: "transparent",
              color: "#888",
              border: "1px solid #2a2a2a",
            }}
          >
            Змінити дані ←
          </button>
        </div>
      </div>
    </main>
  );
}

function Card({
  title,
  icon,
  delay,
  accent,
  children,
}: {
  title: string;
  icon: string;
  delay: string;
  accent?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`rounded-2xl p-5 animate-fade-up ${delay}`}
      style={{
        background: accent
          ? "linear-gradient(135deg, rgba(124,58,237,0.08), rgba(236,72,153,0.08))"
          : "#111",
        border: accent ? "1px solid rgba(124,58,237,0.4)" : "1px solid #222",
      }}
    >
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg">{icon}</span>
        <h2 className="font-bold text-base" style={{ color: accent ? "#A78BFA" : "#eee" }}>
          {title}
        </h2>
      </div>
      {children}
    </div>
  );
}

function Tip({ text }: { text: string }) {
  return (
    <p className="text-xs leading-relaxed" style={{ color: "#555" }}>
      💡 {text}
    </p>
  );
}

function LoadingPulse() {
  return (
    <div className="flex gap-2 justify-center">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="w-3 h-3 rounded-full animate-bounce"
          style={{
            background: "linear-gradient(135deg, #7C3AED, #EC4899)",
            animationDelay: `${i * 0.15}s`,
          }}
        />
      ))}
    </div>
  );
}

function Spinner() {
  return (
    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}
