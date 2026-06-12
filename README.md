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

---

## Integrating React components / Next + Tailwind + shadcn (optional)

If you plan to integrate the provided React components located in `components/ui` (for example, `retro-testimonial.tsx` and `demo.tsx`), follow these steps:

1. Initialize a Next.js + TypeScript app in this folder (if you haven't yet):

```bash
npx create-next-app@latest . --typescript
```

2. Install runtime and component deps:

```bash
npm install react react-dom next framer-motion lucide-react
```

3. Install and configure TailwindCSS:

```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

Add to `tailwind.config.js`:

```js
module.exports = {
	content: [
		'./app/**/*.{js,ts,jsx,tsx}',
		'./pages/**/*.{js,ts,jsx,tsx}',
		'./components/**/*.{js,ts,jsx,tsx}',
	],
	theme: { extend: {} },
	plugins: [],
}
```

4. Ensure `@/` path mapping in `tsconfig.json`:

```json
{
	"compilerOptions": {
		"baseUrl": ".",
		"paths": { "@/*": ["./*"] }
	}
}
```

5. (Optional) Install shadcn UI and scaffold `/components/ui`:

```bash
npm i -D @shadcn/ui
npx shadcn-ui@latest init
```

6. Run dev server:

```bash
npm run dev
```

Usage notes
- The testimonial components use `next/image`. If you integrate into a non-Next React app, replace with `<img>`.
- The carousel now uses `snap-x snap-mandatory` and `flex-shrink-0` on cards to prevent overlap. If styles still conflict, ensure Tailwind is active and no global CSS overrides `flex-shrink` or widths.

If you want, I can place `DemoOne` directly into the site block "Что я создаю" and fine-tune spacing to perfectly match your layout.
