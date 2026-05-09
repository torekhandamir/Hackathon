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
  CATEGORY_OPTIONS,
  MARKETPLACE_PRODUCTS,
  MARKETPLACES,
  SERVICE_TYPES,
  STORE_PRODUCTS,
} from './data/sampleData'
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
    role: 'Роль',
    customer: 'Покупатель',
    business: 'Бизнес',
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
    marketplace: 'Маркетплейс',
    store: 'Магазин',
    cafe: 'Кафе / ресторан',
    service: 'Услуга',
    selectMarketplace: 'Маркетплейс',
    product: 'Товар',
    storeName: 'Название магазина',
    cafeName: 'Название кафе / ресторана',
    serviceName: 'Название сервиса',
    serviceType: 'Тип услуги',
    orderedItem: 'Что заказали',
    other: 'Другое',
    writeProductName: 'Напишите название',
    writeReview: 'Напишите отзыв',
    reviewPlaceholder: 'Опишите опыт: что понравилось, что можно улучшить, кому это подойдет.',
    publishReview: 'Опубликовать отзыв',
    publishing: 'Публикуем отзыв',
    checking: 'Проверяем полезные детали',
    calculating: 'Считаем качество',
    rewardReady: 'Решение по бонусу готово',
    published: 'Отзыв опубликован',
    scoreLine: 'Ваш отзыв получил',
    bonus: 'Бонус',
    coupon: 'Купон',
    whyGood: 'Почему: есть опыт использования, конкретные детали и честная обратная связь.',
    lowResult: 'Отзыв опубликован, но бонус пока не разблокирован.',
    improve: 'Добавьте больше деталей, чтобы сделать отзыв полезнее.',
    goFeed: 'Перейти к отзывам',
    close: 'Закрыть',
    recentReviews: 'Последние отзывы',
    helpful: 'Полезно',
    counted: 'Учтено',
    qualityScore: 'Оценка качества',
    bonusUnlocked: 'Бонус открыт',
    bonusLocked: 'Бонус пока не открыт',
    topReviewers: 'Лучшие авторы',
    thisMonth: 'За месяц',
    totalPoints: 'Всего баллов',
    monthlyPoints: 'Баллы за месяц',
    reviews: 'Отзывы',
    likes: 'Лайки',
    averageQuality: 'Среднее качество',
    level: 'Уровень',
    beginner: 'Начинающий автор',
    trusted: 'Надежный автор',
    expert: 'Эксперт отзывов',
    legend: 'Легенда отзывов',
    businessInsights: 'Бизнес-аналитика',
    activityOverview: 'Обзор активности',
    customerSignals: 'Сигналы клиентов',
    totalReviews: 'Всего отзывов',
    averageReviewQuality: 'Среднее качество',
    couponsIssued: 'Выдано купонов',
    helpfulLikes: 'Полезные лайки',
    trustGrowth: 'Рост доверия',
    topCategories: 'Топ категорий',
    complaints: 'Частые жалобы',
    praised: 'Что хвалят',
    topUseful: 'Самые полезные отзывы',
    fullName: 'Имя',
    monthly: 'Месячные баллы',
    badges: 'Бейджи',
    savedDevice: 'Ваш профиль сохранен на этом устройстве.',
    reset: 'Сбросить профиль',
    noName: 'Ваше имя',
    writeMore: 'Добавьте больше деталей, чтобы сделать отзыв полезнее',
  },
  en: {
    welcomeTitle: 'Welcome to Review Booster',
    slogan: 'Better reviews. Smarter rewards.',
    welcomeText: 'Earn rewards for reviews that truly help other customers.',
    firstName: 'First name',
    lastName: 'Last name',
    role: 'Role',
    customer: 'Customer',
    business: 'Business',
    chooseLanguage: 'Choose language',
    chooseTheme: 'Choose theme',
    dark: 'Dark mode',
    light: 'Light mode',
    continue: 'Continue',
    home: 'Home',
    feed: 'Feed',
    leaderboard: 'Leaderboard',
    dashboard: 'Dashboard',
    profile: 'Profile',
    hi: 'Hi',
    purchaseQuestion: 'What did you purchase?',
    marketplace: 'Marketplace',
    store: 'Store',
    cafe: 'Cafe / Restaurant',
    service: 'Service',
    selectMarketplace: 'Marketplace',
    product: 'Product',
    storeName: 'Store name',
    cafeName: 'Cafe / restaurant name',
    serviceName: 'Service name',
    serviceType: 'Service type',
    orderedItem: 'Ordered item',
    other: 'Other',
    writeProductName: 'Write product name',
    writeReview: 'Write your review',
    reviewPlaceholder: 'Describe your experience: what worked, what could improve, and who it is best for.',
    publishReview: 'Publish Review',
    publishing: 'Publishing review',
    checking: 'Checking useful details',
    calculating: 'Calculating quality score',
    rewardReady: 'Reward decision ready',
    published: 'Review published',
    scoreLine: 'Your review scored',
    bonus: 'Bonus',
    coupon: 'Coupon',
    whyGood: 'Why: usage experience, specific details, and honest feedback.',
    lowResult: 'Your review was published, but the bonus is not unlocked yet.',
    improve: 'Add more details to make your review more helpful.',
    goFeed: 'Go to Feed',
    close: 'Close',
    recentReviews: 'Recent reviews',
    helpful: 'Helpful',
    counted: 'Counted',
    qualityScore: 'Quality score',
    bonusUnlocked: 'Bonus unlocked',
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
    businessInsights: 'Business insights',
    activityOverview: 'Activity overview',
    customerSignals: 'Customer signals',
    totalReviews: 'Total reviews',
    averageReviewQuality: 'Average review quality',
    couponsIssued: 'Coupons issued',
    helpfulLikes: 'Helpful likes',
    trustGrowth: 'Estimated trust growth',
    topCategories: 'Top categories',
    complaints: 'Common complaints',
    praised: 'Most praised features',
    topUseful: 'Top useful reviews',
    fullName: 'Full name',
    monthly: 'Monthly points',
    badges: 'Badges',
    savedDevice: 'Your profile is saved on this device.',
    reset: 'Reset profile',
    noName: 'Your name',
    writeMore: 'Add more details to make your review more helpful',
  },
  kz: {
    welcomeTitle: 'Review Booster-ге қош келдіңіз',
    slogan: 'Пайдалы пікірлер. Ақылды бонустар.',
    welcomeText: 'Басқа сатып алушыларға көмектесетін пікірлер үшін бонус алыңыз.',
    firstName: 'Аты',
    lastName: 'Тегі',
    role: 'Рөл',
    customer: 'Сатып алушы',
    business: 'Бизнес',
    chooseLanguage: 'Тіл',
    chooseTheme: 'Тақырып',
    dark: 'Қараңғы',
    light: 'Жарық',
    continue: 'Жалғастыру',
    home: 'Басты',
    feed: 'Пікірлер',
    leaderboard: 'Рейтинг',
    dashboard: 'Аналитика',
    profile: 'Профиль',
    hi: 'Сәлем',
    purchaseQuestion: 'Сіз не сатып алдыңыз?',
    marketplace: 'Маркетплейс',
    store: 'Дүкен',
    cafe: 'Кафе / ресторан',
    service: 'Қызмет',
    selectMarketplace: 'Маркетплейс',
    product: 'Тауар',
    storeName: 'Дүкен атауы',
    cafeName: 'Кафе / ресторан атауы',
    serviceName: 'Қызмет атауы',
    serviceType: 'Қызмет түрі',
    orderedItem: 'Тапсырыс',
    other: 'Басқа',
    writeProductName: 'Атауын жазыңыз',
    writeReview: 'Пікіріңізді жазыңыз',
    reviewPlaceholder: 'Тәжірибеңізді жазыңыз: не ұнады, не жақсартуға болады, кімге қолайлы.',
    publishReview: 'Пікір жариялау',
    publishing: 'Пікір жариялануда',
    checking: 'Пайдалы детальдар тексерілуде',
    calculating: 'Сапа бағасы есептелуде',
    rewardReady: 'Бонус шешімі дайын',
    published: 'Пікір жарияланды',
    scoreLine: 'Сіздің пікіріңіз алды',
    bonus: 'Бонус',
    coupon: 'Купон',
    whyGood: 'Себебі: қолдану тәжірибесі, нақты детальдар және адал пікір бар.',
    lowResult: 'Пікір жарияланды, бірақ бонус әлі ашылған жоқ.',
    improve: 'Пікірді пайдалы ету үшін көбірек деталь қосыңыз.',
    goFeed: 'Пікірлерге өту',
    close: 'Жабу',
    recentReviews: 'Соңғы пікірлер',
    helpful: 'Пайдалы',
    counted: 'Ескерілді',
    qualityScore: 'Сапа бағасы',
    bonusUnlocked: 'Бонус ашылды',
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
    expert: 'Пікір эксперті',
    legend: 'Пікір аңызы',
    businessInsights: 'Бизнес аналитика',
    activityOverview: 'Белсенділік',
    customerSignals: 'Клиент сигналдары',
    totalReviews: 'Барлық пікір',
    averageReviewQuality: 'Орташа сапа',
    couponsIssued: 'Купондар',
    helpfulLikes: 'Пайдалы лайктар',
    trustGrowth: 'Сенім өсімі',
    topCategories: 'Топ санаттар',
    complaints: 'Жиі шағымдар',
    praised: 'Көп мақталған',
    topUseful: 'Ең пайдалы пікірлер',
    fullName: 'Аты-жөні',
    monthly: 'Айлық ұпай',
    badges: 'Белгілер',
    savedDevice: 'Профиль осы құрылғыда сақталды.',
    reset: 'Профильді өшіру',
    noName: 'Сіздің атыңыз',
    writeMore: 'Пікір пайдалы болуы үшін көбірек деталь қосыңыз',
  },
}

const categoryLabels = {
  marketplace: { ru: 'Маркетплейс', en: 'Marketplace', kz: 'Маркетплейс' },
  store: { ru: 'Магазин', en: 'Store', kz: 'Дүкен' },
  cafe: { ru: 'Кафе / ресторан', en: 'Cafe / Restaurant', kz: 'Кафе / ресторан' },
  service: { ru: 'Услуга', en: 'Service', kz: 'Қызмет' },
}

const levelKeyByEnglish = {
  'Beginner Reviewer': 'beginner',
  'Trusted Reviewer': 'trusted',
  'Review Expert': 'expert',
  'Review Legend': 'legend',
}

const navItems = [
  ['home', Home],
  ['feed', MessageCircle],
  ['leaderboard', Trophy],
  ['dashboard', BarChart3],
  ['profile', User],
]

const processingSteps = ['publishing', 'checking', 'calculating', 'rewardReady']

const initialForm = {
  category: 'marketplace',
  marketplace: 'Kaspi',
  product: 'Wireless headphones',
  storeName: '',
  storeProduct: 'Clothes',
  cafeName: '',
  cafeItem: 'Coffee',
  serviceName: '',
  serviceType: 'Delivery',
  customItem: '',
  rating: 4,
  text: '',
}

const getAuthorName = (review) => `${review.authorFirstName ?? ''} ${review.authorLastName ?? ''}`.trim()

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

  return Object.entries(grouped)
    .map(([name, userReviews]) => {
      const reviewCount = userReviews.length
      const helpfulLikes = userReviews.reduce((sum, review) => sum + review.helpfulLikes, 0)
      const couponsEarned = userReviews.filter((review) => review.couponCode).length
      const averageQuality = Math.round(
        userReviews.reduce((sum, review) => sum + review.score, 0) / Math.max(reviewCount, 1),
      )
      const reviewCountBonus = Math.min(reviewCount * 2, 10)
      const helpfulBonus = Math.min(helpfulLikes * 0.7, 12)
      const consistencyBonus = Math.min(userReviews.filter((review) => review.score >= 65).length * 2, 8)
      const monthlyPoints = Math.round(averageQuality + helpfulBonus + reviewCountBonus + consistencyBonus)

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
      badges: index < 3 ? [...reviewer.badges, 'Top Reviewer'] : reviewer.badges,
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

const clamp = (value, min, max) => Math.min(max, Math.max(min, value))

function App() {
  const [profile, setProfile] = useState(() => loadProfile())
  const [setup, setSetup] = useState(
    () => loadProfile() ?? { firstName: '', lastName: '', role: 'customer', language: 'ru', theme: 'dark' },
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
    label: categoryLabels[category][language],
    count: reviews.filter((review) => review.category === category).length,
  })).sort((a, b) => b.count - a.count)
  const complaints = countMatches(reviews, {
    delivery: ['delivery', 'late', 'доставка', 'долгой', 'жеткізу'],
    battery: ['battery', 'charge', 'батарея', 'заряд'],
    price: ['expensive', 'price', 'дорого', 'цена', 'қымбат', 'баға'],
  })
  const praises = countMatches(reviews, {
    quality: ['quality', 'качеств', 'сапа'],
    speed: ['fast', 'quick', 'быстро', 'тез'],
    comfort: ['comfort', 'comfortable', 'удоб', 'ыңғайлы'],
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
    if (form.category === 'marketplace') {
      return {
        placeName: form.marketplace === 'Other' ? t.other : form.marketplace,
        itemName: form.product === 'Other' ? form.customItem || t.other : form.product,
      }
    }

    if (form.category === 'store') {
      return {
        placeName: form.storeName || t.store,
        itemName: form.storeProduct === 'Other' ? form.customItem || t.other : form.storeProduct,
      }
    }

    if (form.category === 'cafe') {
      return {
        placeName: form.cafeName || t.cafe,
        itemName: form.cafeItem === 'Other' ? form.customItem || t.other : form.cafeItem,
      }
    }

    return {
      placeName: form.serviceName || t.service,
      itemName: form.serviceType === 'Other' ? form.customItem || t.other : form.serviceType,
    }
  }

  const publishReview = () => {
    const trimmed = form.text.trim()
    if (!trimmed) return

    const { placeName, itemName } = getSelectedPlaceAndItem()
    const newReview = createReviewRecord(
      {
        authorFirstName: profile.firstName,
        authorLastName: profile.lastName,
        category: form.category,
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
    setSetup({ firstName: '', lastName: '', role: 'customer', language: 'ru', theme: 'dark' })
    setActiveTab('home')
  }

  if (!profile) {
    return (
      <main className="app-bg setup-screen">
        <section className="setup-card">
          <div className="brand-mark">
            <Sparkles size={24} />
          </div>
          <h1>{copy[setup.language].welcomeTitle}</h1>
          <p className="lead">{copy[setup.language].slogan}</p>
          <p>{copy[setup.language].welcomeText}</p>

          <div className="setup-grid">
            <Field label={copy[setup.language].firstName}>
              <input value={setup.firstName} onChange={(event) => setSetup({ ...setup, firstName: event.target.value })} />
            </Field>
            <Field label={copy[setup.language].lastName}>
              <input value={setup.lastName} onChange={(event) => setSetup({ ...setup, lastName: event.target.value })} />
            </Field>
          </div>

          <Field label={copy[setup.language].role}>
            <SegmentedControl
              value={setup.role}
              options={['customer', 'business']}
              onChange={(role) => setSetup({ ...setup, role })}
              labelFor={(role) => copy[setup.language][role]}
            />
          </Field>

          <Field label={copy[setup.language].chooseLanguage}>
            <SegmentedControl
              value={setup.language}
              options={languages}
              onChange={(language) => setSetup({ ...setup, language })}
            />
          </Field>

          <Field label={copy[setup.language].chooseTheme}>
            <SegmentedControl
              value={setup.theme}
              options={['dark', 'light']}
              onChange={(theme) => setSetup({ ...setup, theme })}
              labelFor={(theme) => (theme === 'dark' ? copy[setup.language].dark : copy[setup.language].light)}
            />
          </Field>

          <button type="button" className="primary-button" onClick={handleContinue}>
            {copy[setup.language].continue}
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
  const showCustomItem =
    form.product === 'Other' || form.storeProduct === 'Other' || form.cafeItem === 'Other' || form.serviceType === 'Other'

  return (
    <div className="stack">
      <section className="hero-panel">
        <p>{t.hi}, {profile.firstName}</p>
        <h1>{t.purchaseQuestion}</h1>
      </section>

      <div className="category-grid">
        {CATEGORY_OPTIONS.map((category) => (
          <button
            key={category}
            type="button"
            className={form.category === category ? 'category-card active' : 'category-card'}
            onClick={() => setForm({ ...form, category, customItem: '' })}
          >
            <span>{categoryLabels[category][language]}</span>
            <Check size={18} />
          </button>
        ))}
      </div>

      <section className="panel stack">
        {form.category === 'marketplace' && (
          <>
            <Field label={t.selectMarketplace}>
              <select value={form.marketplace} onChange={(event) => setForm({ ...form, marketplace: event.target.value })}>
                {MARKETPLACES.map((item) => <option key={item}>{item}</option>)}
              </select>
            </Field>
            <Field label={t.product}>
              <select value={form.product} onChange={(event) => setForm({ ...form, product: event.target.value })}>
                {MARKETPLACE_PRODUCTS.map((item) => <option key={item}>{item}</option>)}
              </select>
            </Field>
          </>
        )}

        {form.category === 'store' && (
          <>
            <Field label={t.storeName}>
              <input value={form.storeName} onChange={(event) => setForm({ ...form, storeName: event.target.value })} />
            </Field>
            <Field label={t.product}>
              <select value={form.storeProduct} onChange={(event) => setForm({ ...form, storeProduct: event.target.value })}>
                {STORE_PRODUCTS.map((item) => <option key={item}>{item}</option>)}
              </select>
            </Field>
          </>
        )}

        {form.category === 'cafe' && (
          <>
            <Field label={t.cafeName}>
              <input value={form.cafeName} onChange={(event) => setForm({ ...form, cafeName: event.target.value })} />
            </Field>
            <Field label={t.orderedItem}>
              <select value={form.cafeItem} onChange={(event) => setForm({ ...form, cafeItem: event.target.value })}>
                {CAFE_ITEMS.map((item) => <option key={item}>{item}</option>)}
              </select>
            </Field>
          </>
        )}

        {form.category === 'service' && (
          <>
            <Field label={t.serviceName}>
              <input value={form.serviceName} onChange={(event) => setForm({ ...form, serviceName: event.target.value })} />
            </Field>
            <Field label={t.serviceType}>
              <select value={form.serviceType} onChange={(event) => setForm({ ...form, serviceType: event.target.value })}>
                {SERVICE_TYPES.map((item) => <option key={item}>{item}</option>)}
              </select>
            </Field>
          </>
        )}

        {showCustomItem && (
          <Field label={t.writeProductName}>
            <input value={form.customItem} onChange={(event) => setForm({ ...form, customItem: event.target.value })} />
          </Field>
        )}

        <StarRating value={form.rating} onChange={(rating) => setForm({ ...form, rating })} />

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

function ResultModal({ t, review, processing, processingStep, onClose, onFeed }) {
  const displayedScore = review?.score ?? 0
  const hasBonus = (review?.bonusPercent ?? 0) > 0

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
          <span>{categoryLabels[review.category]?.[language]} · {review.placeName}</span>
        </div>
        <div className="score-badge">{review.score}</div>
      </div>
      <div className="review-meta">
        <span>{review.itemName}</span>
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
  return (
    <div className="stack">
      <ScreenTitle title={t.topReviewers} subtitle={t.thisMonth} />
      {reviewers.map((reviewer) => (
        <article key={reviewer.name} className={reviewer.isCurrentUser ? 'rank-card current' : 'rank-card'}>
          <div className="rank-number">
            {reviewer.rank <= 3 ? <Crown size={20} /> : reviewer.rank}
          </div>
          <div className="rank-info">
            <strong>{reviewer.name}</strong>
            <span>{t[levelKeyByEnglish[reviewer.levelKey] ?? reviewer.levelKey] ?? t[reviewer.levelKey]}</span>
          </div>
          <div className="rank-points">
            <strong>{reviewer.monthlyPoints}</strong>
            <span>{t.monthlyPoints}</span>
          </div>
          <div className="mini-stats">
            <span>{t.reviews}: {reviewer.reviewCount}</span>
            <span>{t.averageQuality}: {reviewer.averageQuality}</span>
            <span>{t.likes}: {reviewer.helpfulLikes}</span>
          </div>
        </article>
      ))}
    </div>
  )
}

function DashboardScreen({ t, dashboard, categoryCounts, complaints, praises, topReviews, language }) {
  return (
    <div className="stack">
      <ScreenTitle title={t.businessInsights} subtitle={t.customerSignals} />
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
            <strong>{review.itemName}</strong>
            <span>{categoryLabels[review.category]?.[language]} · {review.score}/100</span>
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
        <p>{profile.role === 'business' ? t.business : t.customer}</p>
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
            <span key={badge}>{badge}</span>
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
