export interface FormData {
  name: string;
  niche: string;
  nicheOther?: string;
  product: string;
  audience: string;
  result: string;
  link?: string;
}

export function buildPrompt(data: FormData): string {
  const niche = data.niche === "Інше" ? data.nicheOther || "Інше" : data.niche;
  const link = data.link || "не вказано";

  return `Ти — експерт з TikTok-маркетингу та особистого брендингу. Створи повністю готовий TikTok-профіль для продажів.

Дані користувача:
- Ім'я: ${data.name}
- Ніша: ${niche}
- Продукт/компанія: ${data.product}
- Аудиторія: ${data.audience}
- Результат клієнта: ${data.result}
- Посилання: ${link}

Поверни ТІЛЬКИ JSON без жодного тексту до або після:
{
  "nickname": {
    "option1": "рядок до 24 символів",
    "option2": "рядок до 24 символів",
    "option3": "рядок до 24 символів",
    "tip": "порада чому ці варіанти працюють"
  },
  "bio": {
    "text": "рядок до 80 символів, емодзі дозволені",
    "tip": "що робить це біо ефективним"
  },
  "header": {
    "line1": "головний меседж, до 30 символів",
    "line2": "результат або обіцянка, до 30 символів",
    "line3": "заклик до дії, до 30 символів",
    "tip": "що робить шапку ефективною"
  },
  "cta": {
    "text": "що написати як заклик до дії у відео",
    "tip": "як використовувати цей CTA"
  },
  "link": {
    "recommendation": "що поставити в посилання і чому",
    "tip": "порада що поставити якщо посилання немає"
  },
  "first_video_idea": "ідея першого відео під цей профіль"
}
Мова відповіді: українська. Поверни ТІЛЬКИ валідний JSON.`;
}
