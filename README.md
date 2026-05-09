# Review Booster

Review Booster is a hackathon MVP for rewarding useful customer reviews instead of rewarding only positive sentiment. The product analyzes each review locally in the browser, scores how helpful it is, and issues a coupon only when the feedback is detailed, constructive, and buyer-friendly.

## Problem

Most review incentive systems accidentally push people toward short, overly positive comments that do not help future buyers or the business. That creates fake-looking review sections and weak customer insight.

## Solution

Review Booster flips the logic:

- Bonuses depend on usefulness, not positivity.
- Negative reviews can still earn rewards if they are specific and constructive.
- Scoring happens locally in under 5 seconds, so the demo stays fast and reliable.
- The same review data powers rewards, reviewer reputation, leaderboard ranking, and business insight.

## Key Features

- Premium dark navy mobile-first UI built with React, Vite, and Tailwind CSS
- Local rule-based review scoring from `0` to `100`
- Instant coupon generation for helpful reviews
- Review feed with helpful likes and anti-abuse cap
- Reviewer profile with levels and badges
- Leaderboard ranked by quality-first reviewer score
- Business dashboard with trust metrics and insight extraction
- LocalStorage persistence so reviews remain after refresh
- Preloaded sample data so the MVP feels alive during judging

## Tech Stack

- React 19
- Vite
- Tailwind CSS v4 via `@tailwindcss/vite`
- LocalStorage for MVP persistence
- Plain JavaScript rule-based NLP logic

## Why No OpenAI API In The MVP

The hackathon case requires review analysis and coupon issuing in less than 5 seconds. Calling an external LLM API would add network latency, dependency risk, and demo fragility. For the MVP, a local rule-based engine is the safer choice because it is:

- fast
- deterministic
- offline-friendly
- easy to explain to judges
- reliable on a normal smartphone

This keeps the main scoring loop entirely in-browser and near-instant.

## How The `< 5 second` Requirement Is Met

- The review text is processed locally in the frontend.
- No server call is required for the main scoring step.
- The app uses a short `420ms` loading animation only for perceived polish.
- Coupon generation happens immediately after scoring.
- Reviews, likes, and dashboard updates are stored locally.

In practice, the logic runs almost instantly and comfortably inside the time limit.

## Scoring Algorithm

The scoring engine is rule-based and rewards usefulness, not positivity.

Positive factors:

- review length
- specific details and measurable facts
- real usage experience
- pros mentioned
- cons mentioned
- advice for other buyers
- constructive tone
- readable structure

Penalty factors:

- generic praise or generic complaints
- repeated words or phrases
- spammy punctuation / excessive caps
- lack of details

Bonus logic:

- `< 50` score: `0%`
- `50-69` score: `5%`
- `70-84` score: `10%`
- `85+` score: `15%`

Because pros and cons are evaluated separately, a negative review can still earn a strong score if it is detailed and useful.

## Project Structure

```text
src/
  components/
    ReviewCard.jsx
    SectionHeading.jsx
    StarRating.jsx
  data/
    sampleData.js
  utils/
    reviewEngine.js
    storage.js
  App.jsx
  index.css
  main.jsx
```

## Run Locally

```bash
npm install
npm run dev
```

Build for production:

```bash
npm run build
```

## Hackathon Pitch Summary

Review Booster helps brands collect better review content without encouraging fake positivity. Customers get rewarded for being helpful, future buyers get clearer decision support, and businesses get structured insight on what to fix, what to promote, and which reviewers build the most trust.
