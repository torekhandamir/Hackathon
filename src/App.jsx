import { useEffect, useMemo, useState } from 'react'
import {
  BarChart3,
  Check,
  ChevronRight,
  Crown,
  Home,
  MessageCircle,
  Moon,
  Sparkles,
  Sun,
  Trophy,
  User,
  X,
} from 'lucide-react'
import {
  CAFE_ITEMS,
  CAFE_PLACES,
  CATEGORY_OPTIONS,
  MARKETPLACE_PRODUCTS,
  MARKETPLACES,
  SERVICE_PLACES,
  SERVICE_TYPES,
  STORE_PLACES,
  STORE_PRODUCTS,
} from './data/appData'
import { createReviewRecord } from './utils/reviewEngine'
import {
  clearProfile,
  loadLikedReviewIds,
  loadProfile,
  loadReviews,
  saveLikedReviewIds,
  saveProfile,
  saveReviews,
} from './utils/storage'

const languages = ['ru', 'en', 'kz']

const copy = {
  ru: {
    welcomeTitle: 'Добро пожаловать в Review Booster',
    slogan: 'Полезные отзывы. Умные бонусы.',
    welcomeText: 'Получайте бонусы за отзывы, которые действительно помогают другим покупателям.',
    firstName: 'Имя',
    lastName: 'Фамилия',
    chooseLanguage: 'Язык',
    chooseTheme: 'Тема',
    dark: 'Темная',
    light: 'Светлая',
    continue: 'Продолжить',
    home: 'Главная',
    feed: 'Отзывы',
    leaderboard: 'Рейтинг',
    dashboard: 'Аналитика',
    profile: 'Профиль',
    hi: 'Привет',
    purchaseQuestion: 'Что вы приобрели?',
    whereBought: 'Где вы это купили?',
    chooseProduct: 'Выберите продукт',
    writeOwnOption: 'Напишите свой вариант',
    writeProductName: 'Напишите название продукта',
    writeReview: 'Напишите отзыв',
    reviewPlaceholder: 'Опишите реальный опыт: срок использования, качество, цену, доставку, вкус, сервис или честный минус.',
    publishReview: 'Опубликовать отзыв',
    yourRating: 'Ваша оценка',
    publishing: 'Публикуем отзыв',
    checking: 'Проверяем полезные детали',
    calculating: 'Считаем качество',
    rewardReady: 'Решение по бонусу готово',
    published: 'Отзыв опубликован',
    scoreLine: 'Ваш отзыв получил',
    bonus: 'Бонус',
    coupon: 'Купон',
    whyGood: 'Почему: отзыв содержит опыт использования, конкретные детали и полезную обратную связь.',
    lowResult: 'Отзыв опубликован, но бонус пока не разблокирован.',
    improve: 'Добавьте больше конкретных деталей: срок использования, цену, качество, доставку, вкус, сервис или один честный минус.',
    goFeed: 'Перейти к отзывам',
    close: 'Закрыть',
    recentReviews: 'Недавние отзывы',
    helpful: 'Полезно',
    counted: 'Учтено',
    bonusLocked: 'Бонус пока не открыт',
    topReviewers: 'Лучшие авторы',
    thisMonth: 'За месяц',
    totalPoints: 'Всего баллов',
    monthlyPoints: 'Баллы за месяц',
    reviews: 'Отзывы',
    likes: 'Лайки',
    averageQuality: 'Среднее качество',
    level: 'Уровень',
    beginner: 'Новичок',
    trusted: 'Надежный автор',
    expert: 'Эксперт отзывов',
    legend: 'Легенда отзывов',
    leaderBonus: 'Бонус лидера до 15%',
    activityOverview: 'Аналитика отзывов',
    totalReviews: 'Всего отзывов',
    averageReviewQuality: 'Среднее качество',
    couponsIssued: 'Выдано купонов',
    helpfulLikes: 'Полезные лайки',
    trustGrowth: 'Рост доверия',
    topCategories: 'Топ категорий',
    complaints: 'Частые жалобы',
    praised: 'Что хвалят',
    topUseful: 'Самые полезные отзывы',
    monthly: 'Месячные баллы',
    badges: 'Бейджи',
    savedDevice: 'Ваш профиль сохранен на этом устройстве.',
    reset: 'Сбросить профиль',
    noName: 'Ваше имя',
    writeMore: 'Полезные отзывы помогают выбирать честнее',
    detailMaster: 'Мастер деталей',
    honestCritic: 'Честный критик',
    helpfulVoice: 'Полезный голос',
    topReviewer: 'Топ-автор',
  },
  en: {
    welcomeTitle: 'Welcome to Review Booster',
    slogan: 'Better reviews. Smarter rewards.',
    welcomeText: 'Earn rewards for reviews that truly help other customers.',
    firstName: 'First name',
    lastName: 'Last name',
    chooseLanguage: 'Choose language',
    chooseTheme: 'Choose theme',
    dark: 'Dark mode',
    light: 'Light mode',
    continue: 'Continue',
    home: 'Home',
    feed: 'Feed',
    leaderboard: 'Leaderboard',
    dashboard: 'Insights',
    profile: 'Profile',
    hi: 'Hi',
    purchaseQuestion: 'What did you purchase?',
    whereBought: 'Where did you buy it?',
    chooseProduct: 'Choose product',
    writeOwnOption: 'Write your own option',
    writeProductName: 'Write product name',
    writeReview: 'Write your review',
    reviewPlaceholder: 'Describe real experience: usage time, quality, price, delivery, taste, service, or one honest downside.',
    publishReview: 'Publish Review',
    yourRating: 'Your rating',
    publishing: 'Publishing review',
    checking: 'Checking useful details',
    calculating: 'Calculating quality score',
    rewardReady: 'Reward decision ready',
    published: 'Review published',
    scoreLine: 'Your review scored',
    bonus: 'Bonus',
    coupon: 'Coupon',
    whyGood: 'Why: usage experience, specific details, and useful feedback.',
    lowResult: 'Your review was published, but the bonus is not unlocked yet.',
    improve: 'Add more specific details: usage time, price, quality, delivery, taste, service, or one honest downside.',
    goFeed: 'Go to Feed',
    close: 'Close',
    recentReviews: 'Recent reviews',
    helpful: 'Helpful',
    counted: 'Counted',
    bonusLocked: 'Bonus not unlocked yet',
    topReviewers: 'Top Reviewers',
    thisMonth: 'This month',
    totalPoints: 'Total points',
    monthlyPoints: 'Monthly points',
    reviews: 'Reviews',
    likes: 'Likes',
    averageQuality: 'Average quality',
    level: 'Level',
    beginner: 'Beginner Reviewer',
    trusted: 'Trusted Reviewer',
    expert: 'Review Expert',
    legend: 'Review Legend',
    leaderBonus: 'Leader bonus up to 15%',
    activityOverview: 'Review insights',
    totalReviews: 'Total reviews',
    averageReviewQuality: 'Average review quality',
    couponsIssued: 'Coupons issued',
    helpfulLikes: 'Helpful likes',
    trustGrowth: 'Estimated trust growth',
    topCategories: 'Top categories',
    complaints: 'Common complaints',
    praised: 'Most praised features',
    topUseful: 'Top useful reviews',
    monthly: 'Monthly points',
    badges: 'Badges',
    savedDevice: 'Your profile is saved on this device.',
    reset: 'Reset profile',
    noName: 'Your name',
    writeMore: 'Useful reviews help people choose with confidence',
    detailMaster: 'Detail Master',
    honestCritic: 'Honest Critic',
    helpfulVoice: 'Helpful Voice',
    topReviewer: 'Top Reviewer',
  },
  kz: {
    welcomeTitle: 'Review Booster-ге қош келдіңіз',
    slogan: 'Пайдалы пікірлер. Ақылды бонустар.',
    welcomeText: 'Басқа сатып алушыларға көмектесетін пікірлер үшін бонус алыңыз.',
    firstName: 'Аты',
    lastName: 'Тегі',
    chooseLanguage: 'Тіл',
    chooseTheme: 'Тақырып',
    dark: 'Қараңғы',
    light: 'Жарық',
    continue: 'Жалғастыру',
    home: 'Басты',
    feed: 'Пікірлер',
    leaderboard: 'Рейтинг',
    dashboard: 'Талдау',
    profile: 'Профиль',
    hi: 'Сәлем',
    purchaseQuestion: 'Сіз не сатып алдыңыз?',
    whereBought: 'Қай жерден алдыңыз?',
    chooseProduct: 'Өнімді таңдаңыз',
    writeOwnOption: 'Өз нұсқаңызды жазыңыз',
    writeProductName: 'Өнім атауын жазыңыз',
    writeReview: 'Пікіріңізді жазыңыз',
    reviewPlaceholder: 'Нақты тәжірибені жазыңыз: қолдану уақыты, сапа, баға, жеткізу, дәм, қызмет немесе бір шынайы минус.',
    publishReview: 'Пікірді жариялау',
    yourRating: 'Сіздің бағаңыз',
    publishing: 'Пікір жариялануда',
    checking: 'Пайдалы мәліметтер тексерілуде',
    calculating: 'Сапа бағасы есептелуде',
    rewardReady: 'Бонус шешімі дайын',
    published: 'Пікір жарияланды',
    scoreLine: 'Сіздің пікіріңіз алды',
    bonus: 'Бонус',
    coupon: 'Купон',
    whyGood: 'Себебі: қолдану тәжірибесі, нақты мәліметтер және пайдалы пікір бар.',
    lowResult: 'Пікір жарияланды, бірақ бонус әлі ашылған жоқ.',
    improve: 'Көбірек нақты мәлімет қосыңыз: қолдану уақыты, баға, сапа, жеткізу, дәм, қызмет немесе бір шынайы минус.',
    goFeed: 'Пікірлерге өту',
    close: 'Жабу',
    recentReviews: 'Соңғы пікірлер',
    helpful: 'Пайдалы',
    counted: 'Ескерілді',
    bonusLocked: 'Бонус әлі ашылған жоқ',
    topReviewers: 'Үздік авторлар',
    thisMonth: 'Осы айда',
    totalPoints: 'Жалпы ұпай',
    monthlyPoints: 'Айлық ұпай',
    reviews: 'Пікірлер',
    likes: 'Лайктар',
    averageQuality: 'Орташа сапа',
    level: 'Деңгей',
    beginner: 'Жаңа автор',
    trusted: 'Сенімді автор',
    expert: 'Пікір сарапшысы',
    legend: 'Пікір аңызы',
    leaderBonus: 'Көшбасшы бонусы 15%-ға дейін',
    activityOverview: 'Пікір талдауы',
    totalReviews: 'Барлық пікір',
    averageReviewQuality: 'Орташа сапа',
    couponsIssued: 'Купондар',
    helpfulLikes: 'Пайдалы лайктар',
    trustGrowth: 'Сенім өсімі',
    topCategories: 'Топ санаттар',
    complaints: 'Жиі шағымдар',
    praised: 'Көп мақталған',
    topUseful: 'Ең пайдалы пікірлер',
    monthly: 'Айлық ұпай',
    badges: 'Белгілер',
    savedDevice: 'Профиль осы құрылғыда сақталды.',
    reset: 'Профильді өшіру',
    noName: 'Сіздің атыңыз',
    writeMore: 'Пайдалы пікірлер адамдарға сенімді таңдауға көмектеседі',
    detailMaster: 'Деталь шебері',
    honestCritic: 'Адал сыншы',
    helpfulVoice: 'Пайдалы дауыс',
    topReviewer: 'Үздік автор',
  },
}

const navItems = [
  ['home', Home],
  ['feed', MessageCircle],
  ['leaderboard', Trophy],
  ['dashboard', BarChart3],
  ['profile', User],
]

const processingSteps = ['publishing', 'checking', 'calculating', 'rewardReady']
const levelLabel = { beginner: 'beginner', trusted: 'trusted', expert: 'expert', legend: 'legend' }
const badgeCopyKeys = {
  'Detail Master': 'detailMaster',
  'Honest Critic': 'honestCritic',
  'Helpful Voice': 'helpfulVoice',
  'Top Reviewer': 'topReviewer',
}

const initialForm = {
  category: 'marketplace',
  marketplace: 'kaspi',
  marketplaceProduct: 'wireless_headphones',
  storePlace: 'electronics_store',
  storeProduct: 'electronics',
  cafePlace: 'coffee_shop',
  cafeItem: 'coffee',
  servicePlace: 'delivery_service',
  serviceType: 'delivery',
  customPlace: '',
  customItem: '',
  rating: 4,
  text: '',
}

const clamp = (value, min, max) => Math.min(max, Math.max(min, value))
const labelOf = (option, language) => option?.labels?.[language] ?? option?.labels?.en ?? ''
const optionById = (options, id) => options.find((option) => option.id === id)
const getAuthorName = (review) => `${review.authorFirstName ?? ''} ${review.authorLastName ?? ''}`.trim()

const optionSets = {
  marketplace: { places: MARKETPLACES, items: MARKETPLACE_PRODUCTS, placeKey: 'marketplace', itemKey: 'marketplaceProduct' },
  store: { places: STORE_PLACES, items: STORE_PRODUCTS, placeKey: 'storePlace', itemKey: 'storeProduct' },
  cafe: { places: CAFE_PLACES, items: CAFE_ITEMS, placeKey: 'cafePlace', itemKey: 'cafeItem' },
  service: { places: SERVICE_PLACES, items: SERVICE_TYPES, placeKey: 'servicePlace', itemKey: 'serviceType' },
}

const getDisplayLabel = ({ options, id, fallback, language }) =>
  labelOf(optionById(options, id), language) || fallback || ''

const getReviewPlace = (review, language) => {
  const set = optionSets[review.category]
  return getDisplayLabel({ options: set?.places ?? [], id: review.placeId, fallback: review.placeName, language })
}

const getReviewItem = (review, language) => {
  const set = optionSets[review.category]
  return getDisplayLabel({ options: set?.items ?? [], id: review.itemId, fallback: review.itemName, language })
}

const getLevelKey = ({ averageQuality, reviewCount, helpfulLikes }) => {
  if (averageQuality >= 90 && reviewCount >= 4 && helpfulLikes >= 16) return 'legend'
  if (averageQuality >= 82 && reviewCount >= 2) return 'expert'
  if (averageQuality >= 65 || helpfulLikes >= 6) return 'trusted'
  return 'beginner'
}

const buildReviewerStats = (reviews, profile) => {
  const grouped = reviews.reduce((groups, review) => {
    const key = getAuthorName(review)
    groups[key] = groups[key] ? [...groups[key], review] : [review]
    return groups
  }, {})

  const profileName = profile ? `${profile.firstName} ${profile.lastName}`.trim() : ''

  if (profileName && !grouped[profileName]) {
    grouped[profileName] = []
  }

  return Object.entries(grouped)
    .map(([name, userReviews]) => {
      const reviewCount = userReviews.length
      const helpfulLikes = userReviews.reduce((sum, review) => sum + review.helpfulLikes, 0)
      const couponsEarned = userReviews.filter((review) => review.couponCode).length
      const averageQuality = reviewCount
        ? Math.round(userReviews.reduce((sum, review) => sum + review.score, 0) / reviewCount)
        : 0
      const reviewCountBonus = Math.min(reviewCount, 6) * 5
      const helpfulBonus = Math.min(helpfulLikes, 24) * 2
      const consistencyBonus = Math.min(userReviews.filter((review) => review.score >= 65).length * 4, 16)
      const monthlyPoints = Math.round(averageQuality * 0.6 + helpfulBonus + reviewCountBonus + consistencyBonus)

      return {
        name,
        isCurrentUser: name === profileName,
        reviewCount,
        helpfulLikes,
        couponsEarned,
        averageQuality,
        monthlyPoints,
        totalPoints: monthlyPoints + couponsEarned * 4,
        levelKey: getLevelKey({ averageQuality, reviewCount, helpfulLikes }),
        badges: [
          averageQuality >= 82 && 'Detail Master',
          userReviews.some((review) => review.rating <= 3 && review.score >= 65) && 'Honest Critic',
          helpfulLikes >= 8 && 'Helpful Voice',
        ].filter(Boolean),
      }
    })
    .sort((left, right) => right.monthlyPoints - left.monthlyPoints)
    .map((reviewer, index) => ({
      ...reviewer,
      rank: index + 1,
      maxBonusPercent: index < 3 ? 15 : 10,
      badges: index < 3 ? [...new Set([...reviewer.badges, 'Top Reviewer'])] : reviewer.badges,
    }))
}

const getDashboardMetrics = (reviews) => {
  const totalReviews = reviews.length
  const averageQuality = Math.round(
    reviews.reduce((sum, review) => sum + review.score, 0) / Math.max(totalReviews, 1),
  )
  const couponsIssued = reviews.filter((review) => review.couponCode).length
  const helpfulLikes = reviews.reduce((sum, review) => sum + review.helpfulLikes, 0)
  const estimatedTrustGrowth = Math.min(44, Math.round(averageQuality * 0.25 + helpfulLikes * 0.25))

  return { totalReviews, averageQuality, couponsIssued, helpfulLikes, estimatedTrustGrowth }
}

const countMatches = (reviews, buckets) =>
  Object.entries(buckets)
    .map(([label, words]) => ({
      label,
      count: reviews.reduce((sum, review) => {
        const text = review.text.toLowerCase()
        return sum + (words.some((word) => text.includes(word)) ? 1 : 0)
      }, 0),
    }))
    .sort((left, right) => right.count - left.count)
    .slice(0, 3)

function SegmentedControl({ value, options, onChange, labelFor }) {
  return (
    <div className="segmented">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          className={value === option ? 'active' : ''}
          onClick={() => onChange(option)}
        >
          {labelFor ? labelFor(option) : option.toUpperCase()}
        </button>
      ))}
    </div>
  )
}

function Field({ label, children }) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
    </label>
  )
}

function SelectField({ value, options, language, onChange }) {
  return (
    <select value={value} onChange={(event) => onChange(event.target.value)}>
      {options.map((option) => (
        <option key={option.id} value={option.id}>
          {labelOf(option, language)}
        </option>
      ))}
    </select>
  )
}

function StarRating({ value, onChange }) {
  return (
    <div className="stars" aria-label="rating">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className={star <= value ? 'active' : ''}
          onClick={() => onChange(star)}
        >
          ★
        </button>
      ))}
    </div>
  )
}

function ProgressBar({ value }) {
  return (
    <div className="progress">
      <span style={{ width: `${clamp(value, 0, 100)}%` }} />
    </div>
  )
}

function App() {
  const [profile, setProfile] = useState(() => loadProfile())
  const [setup, setSetup] = useState(
    () => loadProfile() ?? { firstName: '', lastName: '', language: 'ru', theme: 'dark' },
  )
  const [activeTab, setActiveTab] = useState('home')
  const [reviews, setReviews] = useState(() => loadReviews())
  const [likedReviewIds, setLikedReviewIds] = useState(() => loadLikedReviewIds())
  const [form, setForm] = useState(initialForm)
  const [result, setResult] = useState(null)
  const [processing, setProcessing] = useState(false)
  const [processingStep, setProcessingStep] = useState(0)

  const language = profile?.language ?? setup.language
  const theme = profile?.theme ?? setup.theme
  const t = copy[language]

  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  useEffect(() => {
    saveReviews(reviews)
  }, [reviews])

  useEffect(() => {
    saveLikedReviewIds(likedReviewIds)
  }, [likedReviewIds])

  const reviewers = useMemo(() => buildReviewerStats(reviews, profile), [reviews, profile])
  const currentUserName = profile ? `${profile.firstName} ${profile.lastName}`.trim() : ''
  const currentReviewer = reviewers.find((reviewer) => reviewer.isCurrentUser) ?? {
    name: currentUserName || t.noName,
    reviewCount: 0,
    helpfulLikes: 0,
    couponsEarned: 0,
    averageQuality: 0,
    monthlyPoints: 0,
    totalPoints: 0,
    levelKey: 'beginner',
    rank: reviewers.length + 1,
    badges: [],
    maxBonusPercent: 10,
  }
  const maxBonusPercent = currentReviewer.rank <= 3 ? 15 : 10

  const dashboard = getDashboardMetrics(reviews)
  const topReviews = [...reviews].sort((a, b) => b.score - a.score).slice(0, 3)
  const categoryCounts = CATEGORY_OPTIONS.map((category) => ({
    label: labelOf(category, language),
    count: reviews.filter((review) => review.category === category.id).length,
  })).sort((a, b) => b.count - a.count)
  const complaints = countMatches(reviews, {
    delivery: ['delivery', 'late', 'slow', 'доставка', 'долг', 'жеткізу'],
    battery: ['battery', 'charge', 'microphone', 'батарея', 'заряд', 'микрофон'],
    price: ['expensive', 'price', 'small', 'дорого', 'цена', 'қымбат', 'баға'],
  })
  const praises = countMatches(reviews, {
    quality: ['quality', 'clear', 'clean', 'качеств', 'сапа'],
    speed: ['fast', 'quick', 'minutes', 'быстро', 'тез'],
    comfort: ['comfort', 'comfortable', 'soft', 'удоб', 'ыңғайлы'],
  })

  const setProfileAndPersist = (nextProfile) => {
    setProfile(nextProfile)
    setSetup(nextProfile)
    saveProfile(nextProfile)
  }

  const updateProfile = (patch) => {
    if (!profile) {
      setSetup((current) => ({ ...current, ...patch }))
      return
    }

    setProfileAndPersist({ ...profile, ...patch })
  }

  const handleContinue = () => {
    const nextProfile = {
      ...setup,
      firstName: setup.firstName.trim() || 'Damir',
      lastName: setup.lastName.trim() || 'Torekhan',
    }
    setProfileAndPersist(nextProfile)
  }

  const handleHelpful = (reviewId) => {
    if (likedReviewIds.includes(reviewId)) return

    setLikedReviewIds((ids) => [...ids, reviewId])
    setReviews((currentReviews) =>
      currentReviews.map((review) =>
        review.id === reviewId ? { ...review, helpfulLikes: review.helpfulLikes + 1 } : review,
      ),
    )
  }

  const getSelectedPlaceAndItem = () => {
    const set = optionSets[form.category]
    const placeId = form[set.placeKey]
    const itemId = form[set.itemKey]
    const placeName = placeId === 'other' ? form.customPlace || t.writeOwnOption : labelOf(optionById(set.places, placeId), language)
    const itemName = itemId === 'other' ? form.customItem || t.writeProductName : labelOf(optionById(set.items, itemId), language)

    return { placeId, itemId, placeName, itemName }
  }

  const publishReview = () => {
    const trimmed = form.text.trim()
    if (!trimmed) return

    const { placeId, itemId, placeName, itemName } = getSelectedPlaceAndItem()
    const newReview = createReviewRecord(
      {
        authorFirstName: profile.firstName,
        authorLastName: profile.lastName,
        category: form.category,
        placeId,
        itemId,
        placeName,
        itemName,
        rating: form.rating,
        text: trimmed,
      },
      { maxBonusPercent },
    )

    setProcessing(true)
    setProcessingStep(0)

    processingSteps.forEach((_, index) => {
      window.setTimeout(() => setProcessingStep(index), 140 * index)
    })

    window.setTimeout(() => {
      setReviews((currentReviews) => [newReview, ...currentReviews])
      setResult(newReview)
      setForm(initialForm)
      setProcessing(false)
    }, 650)
  }

  const resetProfile = () => {
    clearProfile()
    setProfile(null)
    setSetup({ firstName: '', lastName: '', language: 'ru', theme: 'dark' })
    setActiveTab('home')
  }

  if (!profile) {
    const setupCopy = copy[setup.language]

    return (
      <main className="app-bg setup-screen">
        <section className="setup-card">
          <div className="brand-mark">
            <Sparkles size={24} />
          </div>
          <h1>{setupCopy.welcomeTitle}</h1>
          <p className="lead">{setupCopy.slogan}</p>
          <p>{setupCopy.welcomeText}</p>

          <div className="setup-grid">
            <Field label={setupCopy.firstName}>
              <input value={setup.firstName} onChange={(event) => setSetup({ ...setup, firstName: event.target.value })} />
            </Field>
            <Field label={setupCopy.lastName}>
              <input value={setup.lastName} onChange={(event) => setSetup({ ...setup, lastName: event.target.value })} />
            </Field>
          </div>

          <Field label={setupCopy.chooseLanguage}>
            <SegmentedControl value={setup.language} options={languages} onChange={(language) => setSetup({ ...setup, language })} />
          </Field>

          <Field label={setupCopy.chooseTheme}>
            <SegmentedControl
              value={setup.theme}
              options={['dark', 'light']}
              onChange={(theme) => setSetup({ ...setup, theme })}
              labelFor={(theme) => (theme === 'dark' ? setupCopy.dark : setupCopy.light)}
            />
          </Field>

          <button type="button" className="primary-button" onClick={handleContinue}>
            {setupCopy.continue}
            <ChevronRight size={18} />
          </button>
        </section>
      </main>
    )
  }

  return (
    <main className="app-bg">
      <div className="phone-shell">
        <div className="app-topbar">
          <div>
            <span>Review Booster</span>
            <strong>{t[activeTab]}</strong>
          </div>
          <button type="button" className="icon-button" onClick={() => updateProfile({ theme: theme === 'dark' ? 'light' : 'dark' })}>
            {theme === 'dark' ? <Sun size={19} /> : <Moon size={19} />}
          </button>
        </div>

        <section className="screen-content">
          {activeTab === 'home' && (
            <HomeScreen
              t={t}
              language={language}
              profile={profile}
              form={form}
              setForm={setForm}
              publishReview={publishReview}
              processing={processing}
              processingStep={processingStep}
            />
          )}
          {activeTab === 'feed' && (
            <FeedScreen
              t={t}
              language={language}
              reviews={reviews}
              likedReviewIds={likedReviewIds}
              handleHelpful={handleHelpful}
            />
          )}
          {activeTab === 'leaderboard' && <LeaderboardScreen t={t} reviewers={reviewers} />}
          {activeTab === 'dashboard' && (
            <DashboardScreen
              t={t}
              dashboard={dashboard}
              categoryCounts={categoryCounts}
              complaints={complaints}
              praises={praises}
              topReviews={topReviews}
              language={language}
            />
          )}
          {activeTab === 'profile' && (
            <ProfileScreen
              t={t}
              profile={profile}
              currentReviewer={currentReviewer}
              updateProfile={updateProfile}
              resetProfile={resetProfile}
            />
          )}
        </section>

        <nav className="bottom-nav" aria-label="Main navigation">
          {navItems.map(([key, Icon]) => (
            <button key={key} type="button" className={activeTab === key ? 'active' : ''} onClick={() => setActiveTab(key)}>
              <Icon size={20} />
              <span>{t[key]}</span>
            </button>
          ))}
        </nav>
      </div>

      {(result || processing) && (
        <ResultModal
          t={t}
          review={result}
          processing={processing}
          processingStep={processingStep}
          language={language}
          onClose={() => setResult(null)}
          onFeed={() => {
            setResult(null)
            setActiveTab('feed')
          }}
        />
      )}
    </main>
  )
}

function HomeScreen({ t, language, profile, form, setForm, publishReview, processing, processingStep }) {
  const currentSet = optionSets[form.category]
  const placeValue = form[currentSet.placeKey]
  const itemValue = form[currentSet.itemKey]

  return (
    <div className="stack">
      <section className="hero-panel">
        <p>{t.hi}, {profile.firstName}</p>
        <h1>{t.purchaseQuestion}</h1>
      </section>

      <div className="category-grid">
        {CATEGORY_OPTIONS.map((category) => (
          <button
            key={category.id}
            type="button"
            className={form.category === category.id ? 'category-card active' : 'category-card'}
            onClick={() => setForm({ ...form, category: category.id, customPlace: '', customItem: '' })}
          >
            <span>{labelOf(category, language)}</span>
            <Check size={18} />
          </button>
        ))}
      </div>

      <section className="panel stack">
        <Field label={t.whereBought}>
          <SelectField
            value={placeValue}
            options={currentSet.places}
            language={language}
            onChange={(value) => setForm({ ...form, [currentSet.placeKey]: value })}
          />
        </Field>

        {placeValue === 'other' && (
          <Field label={t.writeOwnOption}>
            <input
              value={form.customPlace}
              placeholder={t.writeOwnOption}
              onChange={(event) => setForm({ ...form, customPlace: event.target.value })}
            />
          </Field>
        )}

        <Field label={t.chooseProduct}>
          <SelectField
            value={itemValue}
            options={currentSet.items}
            language={language}
            onChange={(value) => setForm({ ...form, [currentSet.itemKey]: value })}
          />
        </Field>

        {itemValue === 'other' && (
          <Field label={t.writeProductName}>
            <input
              value={form.customItem}
              placeholder={t.writeProductName}
              onChange={(event) => setForm({ ...form, customItem: event.target.value })}
            />
          </Field>
        )}

        <Field label={t.yourRating}>
          <StarRating value={form.rating} onChange={(rating) => setForm({ ...form, rating })} />
        </Field>

        <Field label={t.writeReview}>
          <textarea
            value={form.text}
            onChange={(event) => setForm({ ...form, text: event.target.value })}
            placeholder={t.reviewPlaceholder}
            rows={6}
          />
        </Field>

        <button type="button" className="primary-button" onClick={publishReview} disabled={processing || !form.text.trim()}>
          {processing ? t[processingSteps[processingStep]] : t.publishReview}
          <ChevronRight size={18} />
        </button>
      </section>
    </div>
  )
}

function ResultModal({ t, review, processing, processingStep, language, onClose, onFeed }) {
  const displayedScore = review?.score ?? 0
  const hasBonus = (review?.bonusPercent ?? 0) > 0
  const suggestions = review?.suggestions?.[language] ?? []

  return (
    <div className="modal-backdrop">
      <section className="modal-card">
        {!processing && (
          <button type="button" className="modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        )}
        {processing ? (
          <>
            <div className="loader-ring" />
            <h2>{t[processingSteps[processingStep]]}</h2>
            <ProgressBar value={(processingStep + 1) * 25} />
          </>
        ) : (
          <>
            <div className={hasBonus ? 'result-icon success' : 'result-icon'}>
              <Sparkles size={28} />
            </div>
            <h2>{t.published}</h2>
            <p>{hasBonus ? `${t.scoreLine} ${displayedScore}/100.` : t.lowResult}</p>
            <ProgressBar value={displayedScore} />
            <div className="result-grid">
              <div>
                <span>{t.bonus}</span>
                <strong>{review.bonusPercent}%</strong>
              </div>
              <div>
                <span>{t.coupon}</span>
                <strong>{review.couponCode ?? '-'}</strong>
              </div>
            </div>
            <p className="muted">{hasBonus ? t.whyGood : t.improve}</p>
            {suggestions.length > 0 && (
              <div className="modal-suggestions">
                {suggestions.slice(0, 3).map((suggestion) => (
                  <span key={suggestion}>{suggestion}</span>
                ))}
              </div>
            )}
            <button type="button" className="primary-button" onClick={onFeed}>
              {t.goFeed}
              <ChevronRight size={18} />
            </button>
          </>
        )}
      </section>
    </div>
  )
}

function FeedScreen({ t, language, reviews, likedReviewIds, handleHelpful }) {
  return (
    <div className="stack">
      <ScreenTitle title={t.recentReviews} subtitle={t.writeMore} />
      {reviews.map((review) => (
        <ReviewCard
          key={review.id}
          t={t}
          language={language}
          review={review}
          liked={likedReviewIds.includes(review.id)}
          onHelpful={handleHelpful}
        />
      ))}
    </div>
  )
}

function ReviewCard({ t, language, review, liked, onHelpful }) {
  return (
    <article className="review-card">
      <div className="review-head">
        <div>
          <strong>{getAuthorName(review)}</strong>
          <span>{labelOf(optionById(CATEGORY_OPTIONS, review.category), language)} · {getReviewPlace(review, language)}</span>
        </div>
        <div className="score-badge">{review.score}</div>
      </div>
      <div className="review-meta">
        <span>{getReviewItem(review, language)}</span>
        <span>{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</span>
      </div>
      <p>{review.text}</p>
      <ProgressBar value={review.score} />
      <div className="review-actions">
        <span>{review.bonusPercent ? `${t.bonus}: ${review.bonusPercent}% · ${review.couponCode}` : t.bonusLocked}</span>
        <button type="button" onClick={() => onHelpful(review.id)} disabled={liked}>
          <MessageCircle size={16} />
          {liked ? t.counted : t.helpful} · {review.helpfulLikes}
        </button>
      </div>
    </article>
  )
}

function LeaderboardScreen({ t, reviewers }) {
  const maxPoints = Math.max(...reviewers.map((reviewer) => reviewer.monthlyPoints), 1)
  const topThree = reviewers.slice(0, 3)

  return (
    <div className="stack leaderboard-screen">
      <ScreenTitle title={t.topReviewers} subtitle={t.thisMonth} />

      <section className="podium-strip">
        {topThree.map((reviewer) => (
          <div key={reviewer.name} className={`podium-card podium-${reviewer.rank}`}>
            <div className="podium-icon">
              {reviewer.rank === 1 ? <Trophy size={22} /> : <Crown size={20} />}
            </div>
            <span>#{reviewer.rank}</span>
            <strong>{reviewer.name.split(' ')[0]}</strong>
            <em>{reviewer.monthlyPoints}</em>
          </div>
        ))}
      </section>

      <section className="rank-list">
        {reviewers.map((reviewer) => {
          const width = Math.max(8, (reviewer.monthlyPoints / maxPoints) * 100)
          const movement = reviewer.rank % 3 === 0 ? '+2' : reviewer.rank % 2 === 0 ? '+1' : 'new'

          return (
            <article
              key={reviewer.name}
              className={[
                'rank-card',
                reviewer.isCurrentUser ? 'current' : '',
                reviewer.rank <= 3 ? `top-rank top-${reviewer.rank}` : '',
              ].filter(Boolean).join(' ')}
            >
              <div className="rank-card-top">
                <div className="rank-number">
                  {reviewer.rank <= 3 ? <Crown size={20} /> : reviewer.rank}
                </div>
                <div className="rank-info">
                  <strong>{reviewer.name}</strong>
                  <span>{t[levelLabel[reviewer.levelKey]]}</span>
                </div>
                <div className="rank-points">
                  <strong>{reviewer.monthlyPoints}</strong>
                  <span>{t.monthlyPoints}</span>
                </div>
              </div>

              <div className="rank-bar-row">
                <div className="rank-bar" aria-label={`${reviewer.monthlyPoints} ${t.monthlyPoints}`}>
                  <span style={{ width: `${width}%` }} />
                </div>
                <span className={movement === 'new' ? 'move-chip neutral' : 'move-chip'}>{movement}</span>
              </div>

              <div className="rank-detail-row">
                {reviewer.rank <= 3 && (
                  <div className={`rank-badge rank-${reviewer.rank}`}>
                    {reviewer.rank === 1 ? <Trophy size={15} /> : <Crown size={15} />}
                    {t.leaderBonus}
                  </div>
                )}
                <div className="mini-stats">
                  <span>{t.reviews}: {reviewer.reviewCount}</span>
                  <span>{t.averageQuality}: {reviewer.averageQuality}</span>
                  <span>{t.likes}: {reviewer.helpfulLikes}</span>
                  <span>{t.totalPoints}: {reviewer.totalPoints}</span>
                </div>
              </div>
            </article>
          )
        })}
      </section>
    </div>
  )
}

function DashboardScreen({ t, dashboard, categoryCounts, complaints, praises, topReviews, language }) {
  return (
    <div className="stack">
      <ScreenTitle title={t.dashboard} subtitle={t.activityOverview} />
      <div className="metrics-grid">
        <Metric label={t.totalReviews} value={dashboard.totalReviews} />
        <Metric label={t.averageReviewQuality} value={dashboard.averageQuality} />
        <Metric label={t.couponsIssued} value={dashboard.couponsIssued} />
        <Metric label={t.helpfulLikes} value={dashboard.helpfulLikes} />
        <Metric label={t.trustGrowth} value={`${dashboard.estimatedTrustGrowth}%`} />
      </div>
      <InsightList title={t.topCategories} items={categoryCounts} />
      <InsightList title={t.complaints} items={complaints} />
      <InsightList title={t.praised} items={praises} />
      <section className="panel stack">
        <h2>{t.topUseful}</h2>
        {topReviews.map((review) => (
          <div key={review.id} className="compact-review">
            <strong>{getReviewItem(review, language)}</strong>
            <span>{labelOf(optionById(CATEGORY_OPTIONS, review.category), language)} · {review.score}/100</span>
          </div>
        ))}
      </section>
    </div>
  )
}

function ProfileScreen({ t, profile, currentReviewer, updateProfile, resetProfile }) {
  return (
    <div className="stack">
      <section className="profile-card">
        <div className="avatar">{profile.firstName.charAt(0)}{profile.lastName.charAt(0)}</div>
        <h1>{profile.firstName} {profile.lastName}</h1>
        <span>{t.savedDevice}</span>
      </section>
      <div className="metrics-grid">
        <Metric label={t.level} value={t[currentReviewer.levelKey]} />
        <Metric label={t.reviews} value={currentReviewer.reviewCount} />
        <Metric label={t.averageQuality} value={currentReviewer.averageQuality} />
        <Metric label={t.helpfulLikes} value={currentReviewer.helpfulLikes} />
        <Metric label={t.couponsIssued} value={currentReviewer.couponsEarned} />
        <Metric label={t.monthly} value={currentReviewer.monthlyPoints} />
      </div>
      <section className="panel">
        <h2>{t.badges}</h2>
        <div className="badge-row">
          {(currentReviewer.badges.length ? currentReviewer.badges : ['Detail Master']).map((badge) => (
            <span key={badge}>{t[badgeCopyKeys[badge]] ?? badge}</span>
          ))}
        </div>
      </section>
      <section className="panel stack">
        <Field label={t.chooseLanguage}>
          <SegmentedControl value={profile.language} options={languages} onChange={(language) => updateProfile({ language })} />
        </Field>
        <Field label={t.chooseTheme}>
          <SegmentedControl
            value={profile.theme}
            options={['dark', 'light']}
            onChange={(theme) => updateProfile({ theme })}
            labelFor={(theme) => (theme === 'dark' ? t.dark : t.light)}
          />
        </Field>
        <button type="button" className="secondary-button danger" onClick={resetProfile}>
          {t.reset}
        </button>
      </section>
    </div>
  )
}

function ScreenTitle({ title, subtitle }) {
  return (
    <header className="screen-title">
      <h1>{title}</h1>
      <p>{subtitle}</p>
    </header>
  )
}

function Metric({ label, value }) {
  return (
    <div className="metric">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

function InsightList({ title, items }) {
  return (
    <section className="panel">
      <h2>{title}</h2>
      <div className="insight-list">
        {items.map((item) => (
          <div key={item.label}>
            <span>{item.label}</span>
            <strong>{item.count}</strong>
          </div>
        ))}
      </div>
    </section>
  )
}

export default App
