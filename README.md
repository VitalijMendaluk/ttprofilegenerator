# Генератор TikTok-профілю під продажі

## Що це?

Веб-додаток який генерує повністю готовий TikTok-профіль для продажів за 2 хвилини.

## Локальний запуск

```bash
npm install
npm run dev
```

Відкрий http://localhost:3000

## Деплой на Vercel (крок за кроком)

### 1. Завантаж на GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/ТВІЙ_НІКНЕЙМ/tiktok-profile-generator.git
git push -u origin main
```

### 2. Підключи до Vercel

1. Зайди на [vercel.com](https://vercel.com) і увійди через GitHub
2. Натисни **"Add New Project"**
3. Вибери репозиторій `tiktok-profile-generator`
4. Натисни **"Deploy"**

### 3. Додай API-ключ

1. В проєкті на Vercel → **Settings → Environment Variables**
2. Додай змінну:
   - Name: `GEMINI_API_KEY`
   - Value: твій ключ від Google Gemini
3. Натисни **Save**
4. Зайди в **Deployments** → **Redeploy**

Готово! Сайт працює.

## Структура файлів

```
/app
  /api/generate/route.ts  — API endpoint (Google Gemini)
  /result/page.tsx         — Сторінка з результатом
  page.tsx                 — Форма введення
  globals.css              — Стилі
/config
  prompts.ts               — Промпт для Gemini
```

## Змінні середовища

| Змінна | Опис |
|--------|------|
| `GROQ_API_KEY` | API ключ від Groq (безкоштовний на console.groq.com) |
