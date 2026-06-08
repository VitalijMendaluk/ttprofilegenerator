"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const NICHES = [
  "БАДи та здоров'я",
  "Косметика та краса",
  "Мережевий маркетинг",
  "Схуднення та фітнес",
  "Одяг та аксесуари",
  "Своя послуга або експертність",
  "Інше",
];

const STORAGE_KEY = "tiktok_form_data";

interface FormState {
  name: string;
  niche: string;
  nicheOther: string;
  product: string;
  audience: string;
  result: string;
  link: string;
}

const defaultForm: FormState = {
  name: "",
  niche: "",
  nicheOther: "",
  product: "",
  audience: "",
  result: "",
  link: "",
};

export default function Home() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(defaultForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setForm(JSON.parse(saved));
    } catch {}
  }, []);

  const updateField = (field: keyof FormState, value: string) => {
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.name || !form.niche || !form.product || !form.audience || !form.result) {
      setError("Будь ласка, заповніть усі обов'язкові поля");
      return;
    }

    if (form.niche === "Інше" && !form.nicheOther) {
      setError("Вкажіть свою нішу");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Помилка генерації");

      localStorage.setItem("tiktok_result", JSON.stringify(data));
      router.push("/result");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Спробуйте ще раз");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen px-4 py-12 flex flex-col items-center">
      {/* Header */}
      <div className="text-center mb-10 animate-fade-up">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
          style={{ background: "rgba(124,58,237,0.15)", border: "1px solid rgba(124,58,237,0.3)" }}>
          <span className="text-sm font-medium" style={{ color: "#A78BFA" }}>
            🎵 TikTok Profile Generator
          </span>
        </div>

        <h1 className="text-3xl md:text-5xl font-bold mb-3 leading-tight">
          <span className="gradient-text">Генератор TikTok-профілю</span>
        </h1>
        <p className="text-lg md:text-xl font-medium" style={{ color: "#888" }}>
          Упакуй профіль який продає — за 2 хвилини
        </p>
      </div>

      {/* Form card */}
      <div className="w-full max-w-xl animate-fade-up stagger-1">
        <div className="rounded-2xl p-6 md:p-8"
          style={{ background: "#111", border: "1px solid #222" }}>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">

            {/* Name */}
            <Field label="Твоє ім'я або псевдонім" required>
              <input
                type="text"
                placeholder="Наприклад: Олена, Вікторія Козак"
                value={form.name}
                onChange={(e) => updateField("name", e.target.value)}
              />
            </Field>

            {/* Niche */}
            <Field label="Що ти продаєш?" required>
              <select
                value={form.niche}
                onChange={(e) => updateField("niche", e.target.value)}
              >
                <option value="" disabled>Оберіть нішу</option>
                {NICHES.map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
              {form.niche === "Інше" && (
                <input
                  className="mt-2"
                  type="text"
                  placeholder="Опишіть свою нішу"
                  value={form.nicheOther}
                  onChange={(e) => updateField("nicheOther", e.target.value)}
                />
              )}
            </Field>

            {/* Product */}
            <Field label="Назва продукту або компанії" required>
              <input
                type="text"
                placeholder="Наприклад: Herbalife, крем від зморщок, курс схуднення"
                value={form.product}
                onChange={(e) => updateField("product", e.target.value)}
              />
            </Field>

            {/* Audience */}
            <Field label="Яка твоя головна аудиторія?" required>
              <input
                type="text"
                placeholder="Наприклад: мами 30-45 років, жінки які хочуть схуднути"
                value={form.audience}
                onChange={(e) => updateField("audience", e.target.value)}
              />
            </Field>

            {/* Result */}
            <Field label="Який результат отримує клієнт?" required>
              <input
                type="text"
                placeholder="Наприклад: мінус 5 кг за місяць, чиста шкіра за 2 тижні"
                value={form.result}
                onChange={(e) => updateField("result", e.target.value)}
              />
            </Field>

            {/* Link */}
            <Field label="Є посилання (сайт, Telegram, Instagram)?">
              <input
                type="text"
                placeholder="Вставте посилання якщо є"
                value={form.link}
                onChange={(e) => updateField("link", e.target.value)}
              />
            </Field>

            {error && (
              <div className="rounded-xl px-4 py-3 text-sm font-medium"
                style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#f87171" }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl text-white font-bold text-lg transition-all duration-200 relative overflow-hidden"
              style={{
                background: loading
                  ? "#333"
                  : "linear-gradient(135deg, #7C3AED, #EC4899)",
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-3">
                  <Spinner />
                  Створюємо твій профіль який продає...
                </span>
              ) : (
                "Згенерувати профіль ✨"
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-xs mt-4" style={{ color: "#444" }}>
          Powered by Google Gemini AI • Безкоштовно
        </p>
      </div>
    </main>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-semibold" style={{ color: "#ccc" }}>
        {label}
        {required && <span style={{ color: "#EC4899" }}> *</span>}
      </label>
      {children}
    </div>
  );
}

function Spinner() {
  return (
    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}
