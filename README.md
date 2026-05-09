# Review Booster

Review Booster is a product MVP that helps businesses collect more useful customer reviews by rewarding review quality, not positive sentiment. Customers publish reviews, receive a fast quality score, earn coupons when their feedback is helpful, and build reputation through useful reviews and helpful likes.

## Problem

Many reward systems push customers toward short positive reviews. Those reviews may increase star averages, but they do not help future buyers understand tradeoffs, and they do not give businesses clear signals about what to improve.

## Solution

Review Booster rewards usefulness:

- Detailed positive reviews can earn rewards.
- Detailed negative reviews can also earn rewards.
- Generic or repetitive reviews receive low scores.
- Helpful likes improve reviewer reputation, but quality remains the main leaderboard factor.
- Business insights turn review text into signals about complaints, praised features, categories, and trust growth.

## Main Flow

1. The user creates a lightweight profile saved on the device.
2. The user chooses a category: marketplace, store, cafe / restaurant, or service.
3. The user selects or writes the purchased product, item, or service.
4. The user adds a star rating and publishes a review.
5. The local scoring engine analyzes usefulness in under 5 seconds.
6. A result popup shows the quality score, bonus decision, and coupon code if unlocked.
7. The review appears in the feed where other users can mark it as helpful.
8. Profile, leaderboard, and business insights update automatically.

## Tech Stack

- React 19
- Vite
- Tailwind CSS v4 via `@tailwindcss/vite`
- lucide-react icons
- LocalStorage for profile, reviews, likes, language, theme, and app state
- Fast local rule-based NLP scoring

## Why A Local Algorithm Instead Of OpenAI API

The core review check and coupon decision must finish in less than 5 seconds. A local rule-based engine avoids network latency, API availability risk, and unpredictable response times. It also makes the logic easy to explain: the score comes from transparent signals such as usage experience, specific details, pros, cons, advice, constructive tone, and spam penalties.

OpenAI or another LLM could be added later for deeper summarization, but the main reward decision is intentionally local and instant.

## How The `< 5 Second` Requirement Is Met

- Review scoring runs in the browser.
- No server request is required for the reward decision.
- The publish animation lasts only about 650ms.
- Coupon generation is synchronous.
- Feed, profile, leaderboard, and dashboard updates are stored locally.

## Scoring Algorithm

The scoring engine returns `0-100` and supports English, Russian, and Kazakh keywords.

Positive scoring signals:

- Length and detail level
- Usage experience such as "used", "пользуюсь", or "қолдандым"
- Time periods such as years, months, weeks, "год", "месяц", "жыл"
- Specific details such as delivery, taste, comfort, battery, quality, price, service, atmosphere, packaging, size, material, portion, staff, and location
- Pros such as good, tasty, useful, качественный, жақсы, сапалы
- Cons or balanced feedback such as but, problem, но, минус, бірақ
- Advice or recommendation such as recommend, советую, ұсынамын
- Constructive non-toxic tone

Penalty signals:

- Repeated words
- Random repeated letters
- Too many emoji
- Extremely short low-information phrases
- Generic wording without concrete details

Expected examples:

- `Very good` scores low but not zero.
- `very good I used it for 3 years` scores around the middle range because it includes real usage duration.
- `I used this power bank for 3 years. Battery lasts long, but it charges slowly. Good for travel.` scores high because it includes usage, detail, pros, cons, and advice.
- `Пользуюсь месяц, качество хорошее, но доставка была долгой. За свою цену нормально.` scores high because it is specific and balanced.
- `Өте жақсы, бір ай қолдандым` receives a reasonable score because Kazakh usage and positive signals are detected.

## Bonus Logic

- Score below `45`: `0%`
- Score `45-64`: `5%`
- Score `65-84`: `10%`
- Score `85-100`: `10%` for normal users
- Top 3 leaderboard users can unlock up to `15%`

The app does not reward positivity by itself. A negative but detailed and constructive review can unlock a bonus.

## Leaderboard Logic

Monthly points prioritize quality:

```text
monthly points = average quality + helpful likes bonus + review count bonus + consistency bonus
```

Average quality is the main factor, while helpful likes and consistency provide smaller boosts. This keeps high-volume low-quality reviewing from winning.

## Mobile-First Design

Review Booster is built as a mobile app experience:

- first-run welcome/profile setup
- floating bottom navigation
- tabbed screens without page reloads
- Home, Feed, Leaderboard, Dashboard, and Profile tabs
- dark premium theme with lime accents
- light warm theme with orange/gold accents
- responsive centered app shell on laptop and desktop

## Run Locally

```bash
npm install
npm run dev -- --host 0.0.0.0
```

Then open the local Vite URL in your browser.

## Open On Phone

1. Connect your phone and computer to the same Wi-Fi.
2. Run:

```bash
npm run dev -- --host 0.0.0.0
```

3. In the terminal, find the Vite `Network` URL.
4. Open that `Network` URL in your phone browser.

## Build

```bash
npm run build
```
