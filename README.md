# Персональный сайт-портфолио

Современный одностраничный сайт для Байдаевой Гиляны — разработчика и digital-специалиста (сайты, боты, CRM, автоматизация).

## Что внутри

- Конверсионная структура из 8 блоков
- Светлый минималистичный дизайн с мягким radial glow
- Адаптивная верстка для desktop/tablet/mobile
- CTA-кнопки и форма заявки
- Базовая SEO-разметка (description + OpenGraph)

## Стек

- HTML5
- CSS3
- Vanilla JavaScript

## Структура проекта

```text
.
├── index.html
├── styles.css
├── script.js
├── IMG_9788.PNG
├── package.json
├── .gitignore
├── .editorconfig
└── .prettierrc.json
```

## Быстрый старт

### Вариант 1: через npm

```bash
npm run dev
```

Сайт откроется по адресу: `http://localhost:3000`

### Вариант 2: без npm

```bash
python3 -m http.server 3000
```

## Что нужно настроить перед публикацией

В файле `index.html` замените:

- `https://t.me/your_username` на ваш Telegram
- `you@example.com` на ваш Email

В файле `script.js` замените:

- `you@example.com` на ваш Email для получения заявок из формы

## Деплой

Проект можно развернуть как статический сайт на:

- Vercel
- Netlify
- GitHub Pages

## Лицензия

Использование по договоренности с автором проекта.
