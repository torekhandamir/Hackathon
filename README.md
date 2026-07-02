# Review Booster

Review Booster is a product MVP that helps businesses collect useful customer reviews by rewarding review quality, not positive sentiment.

## Main Flow

1. The user creates a lightweight profile saved on the device.
2. The user chooses a category: marketplace, store, cafe / restaurant, or service.
3. The user selects or writes the purchased product, item, or service.
4. The user adds a star rating and submits a review.
5. The frontend calls `/api/evaluate-review`.
6. The server-side OpenAI evaluator returns structured JSON with publishability, AI Quality Score, breakdown, bonus, coupon, suggestions, explanation, tags, complaints, and praises.
7. Publishable reviews appear in the feed and update profile, leaderboard, and analytics.
8. Rejected reviews are not saved.

## Tech Stack

- React 19
- Vite
- Tailwind CSS v4 via `@tailwindcss/vite`
- Vercel serverless function at `api/evaluate-review.ts`
- Official OpenAI JavaScript/TypeScript SDK
- LocalStorage for profile, reviews, likes, language, theme, and app state

## OpenAI Evaluation

New user submissions are evaluated server-side. The frontend never calls OpenAI directly and never reads an API key.

Configure environment variables before deploying:

```bash
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=your_model_here
```

The editable evaluator instructions live in `src/ai/reviewEvaluationPrompt.ts` under the marker:

```text
// EDIT THIS PROMPT TO CHANGE OPENAI EVALUATION BEHAVIOR
```

The API asks OpenAI for strict JSON, parses the response safely, validates required fields, clamps the AI Quality Score to `0-100`, clamps each breakdown dimension to `0-20`, and enforces the official coupon tiers.

## Bonus Logic

- Score `0-39`: `0%`, coupon `-`
- Score `40-69`: `5%`, coupon `RB5`
- Score `70-84`: `10%`, coupon `RB10`
- Score `85-100`: `15%`, coupon `RB15`

The app does not reward positivity by itself. A negative but detailed and constructive review can unlock a bonus.

## Mobile-First Design

Review Booster is built as a mobile app experience:

- first-run welcome/profile setup
- floating bottom navigation
- tabbed screens without page reloads
- Home, Feed, Leaderboard, Dashboard, and Profile tabs
- dark and light themes
- responsive centered app shell on laptop and desktop

## Run Locally

```bash
npm install
npm run dev -- --host 0.0.0.0
```

For Vercel serverless API testing, run the app through Vercel dev or deploy with `OPENAI_API_KEY` configured.
