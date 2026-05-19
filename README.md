# Brand Brief Questionnaire

Українська інтерактивна анкета для клієнтів, які готують бриф перед розробкою логотипа або візуальної ідентичності.

## Стек

- React
- TypeScript
- Vite
- Tailwind CSS
- localStorage для чернетки
- Vercel serverless function для відправки брифа на email

## Локальний запуск

```bash
npm install
npm run dev
```

Цей режим запускає тільки інтерфейс анкети. Для перевірки саме email-відправки використовуйте Vercel Dev:

```bash
npm run dev:vercel
```

Локальна адреса за замовчуванням:

```text
http://127.0.0.1:5173/
```

## Перевірка

```bash
npm run lint
npm run build
```

## Email-відправка

Фронтенд надсилає готовий бриф у `POST /api/send-brief`. Отримувач зафіксований у коді:

```text
v.demidov@urc.org.ua
```

Для роботи відправки потрібно додати environment variables у Vercel або у локальний `.env` для `npm run dev:vercel`:

```text
SMTP_HOST
SMTP_PORT
SMTP_USER
SMTP_PASS
SMTP_FROM
```

Приклад є у `.env.example`.

## Публікація

Найпростіший шлях:

1. Завантажити проект у GitHub.
2. Імпортувати репозиторій у Vercel.
3. Додати SMTP-змінні у Project Settings -> Environment Variables.
4. Задеплоїти.

Після цього анкета буде доступна в інтернеті як статичний сайт із serverless-відправкою пошти.
