import {
  appMessages,
  DEFAULT_LOCALE,
  LOCALES,
  resolveLocale,
  type Locale,
} from "@gram-academy/i18n";

export { appMessages, DEFAULT_LOCALE, LOCALES, resolveLocale };
export type { Locale };

/**
 * Client-local UI chrome. The vendored `@gram-academy/i18n` package (owned by
 * the server) currently ships only app-shell keys (`common`/`nav`/`wallet`);
 * screen-specific chrome lives here until it is promoted into that package.
 * These are UI strings ONLY — course/lesson/quiz CONTENT arrives pre-localized
 * from the API via `?locale=` and is never stored in the client.
 */
export interface ScreenMessages {
  home: { title: string; subtitle: string; empty: string; courses: string };
  /** Marketing landing (Home tab). */
  landing: {
    eyebrow: string;
    heroTitle: string;
    heroSubtitle: string;
    heroCta: string;
    featuresHeading: string;
    learnTitle: string;
    learnBody: string;
    certTitle: string;
    certBody: string;
    referralTitle: string;
    referralBody: string;
    multilingualTitle: string;
    multilingualBody: string;
    sectionsHeading: string;
    sectionsSubtitle: string;
    browseAll: string;
  };
  /** Learning catalog tab + section-detail chrome. */
  learning: {
    tab: string;
    title: string;
    subtitle: string;
    empty: string;
    courses: string;
    hoursMeta: string;
    minutesMeta: string;
    sectionCertHint: string;
  };
  section: { lessons: string; quizzes: string; progress: string; empty: string };
  course: {
    free: string;
    stars: string;
    lessonsHeading: string;
    quizzesHeading: string;
    getCertificate: string;
    certificatePending: string;
    certificateMinted: string;
    buy: string;
    discountBadge: string;
    completed: string;
    quiz: string;
    start: string;
    continueLearning: string;
    roadmap: string;
    certificateMeta: string;
    whatsInside: string;
    // Reworked course landing (reusable template)
    startCourse: string;
    reviewCourse: string;
    whatYouLearn: string;
    durationHours: string;
    durationMinutes: string;
  };
  lesson: {
    markComplete: string;
    completed: string;
    next: string;
    finish: string;
    eyebrow: string;
    contents: string;
    // Reusable lesson template (in-page nav + footer)
    onThisPage: string;
    prev: string;
    toQuiz: string;
    helpfulQuestion: string;
    helpfulYes: string;
    helpfulNo: string;
  };
  quiz: {
    progress: string;
    next: string;
    submit: string;
    passedTitle: string;
    failedTitle: string;
    score: string;
    retry: string;
    continue: string;
    selectAnswer: string;
    // Pre-quiz rules screen (QUIZ-INTEGRITY.md)
    rulesHeading: string;
    ruleTimer: string;
    ruleShuffle: string;
    ruleNoLeave: string;
    ruleNoCopy: string;
    ruleThreshold: string;
    ruleCooldown: string;
    start: string;
    // Per-question countdown
    timeLeft: string;
    timeUp: string;
    // Cooldown gating on the rules screen
    cooldownHeading: string;
    cooldownAvailableAt: string;
    cooldownIn: string;
    // Failure screen — low-score fail
    failedBody: string;
    retryCountdown: string;
    // Failure screen — attempt ended by a broken rule (violation/timeout/bg)
    failedRuleTitle: string;
    failedRuleBody: string;
    // Post-pass: course rating + mint
    rateHeading: string;
    rateHint: string;
    rateThanks: string;
    rateStar: string;
    mintHeading: string;
    backToCourse: string;
  };
  profile: {
    title: string;
    language: string;
    theme: string;
    preferences: string;
    wallet: string;
    referral: string;
    certificates: string;
    certificatesHint: string;
    premium: string;
    discountReminder: string;
  };
  certificates: {
    title: string;
    subtitle: string;
    earned: string;
    topPercent: string;
    firstOne: string;
    unlocked: string;
    inProgress: string;
    locked: string;
  };
  wallet: {
    connecting: string;
    verifying: string;
    network: string;
    mainnet: string;
    testnet: string;
    errorChallenge: string;
    errorDeclined: string;
    errorVerify: string;
    errorDisconnect: string;
    /** Header wallet control (Header.tsx) — short label below the `sm:`
     *  breakpoint; `c.wallet.connect` ("Connect Wallet") is used at `sm:`+. */
    connectShort: string;
    balance: string;
    copyAddress: string;
    copied: string;
  };
  referral: {
    teaser: string;
    copy: string;
    copied: string;
    share: string;
    invited: string;
    walletsConnected: string;
    minted: string;
    earned: string;
    infoTitle: string;
    infoIntro: string;
    infoForYouTitle: string;
    infoForYouBody: string;
    infoForFriendTitle: string;
    infoForFriendBody: string;
    infoClose: string;
  };
  outside: { title: string; body: string; button: string };
  error: { generic: string };
  footer: { builtOn: string; credit: string };
  /** Certificate mint flow (Course screen — docs/05-frontend-spec.md §4.2). */
  mint: {
    walletRequired: string;
    goToProfile: string;
    waitingTitle: string;
    waitingBody: string;
    confirmedTitle: string;
    serial: string;
    viewExplorer: string;
    rejected: string;
    pending: string;
    tryAgain: string;
    errorAlreadyMinted: string;
    errorNotCompleted: string;
    errorWalletRequired: string;
    /** Mint CTA label used at the end of a passed quiz / completed course. */
    mintCta: string;
  };
  /** Telegram Stars purchase flow (Course screen — docs/05-frontend-spec.md §5). */
  purchase: {
    opening: string;
    confirming: string;
    cancelled: string;
    failed: string;
    dismiss: string;
  };
}

export const screenMessages: Record<Locale, ScreenMessages> = {
  en: {
    home: {
      title: "Learn",
      subtitle: "Courses on TON",
      empty: "No courses yet.",
      courses: "{n} courses",
    },
    landing: {
      eyebrow: "Learn on TON",
      heroTitle: "Learn TON, earn on-chain certificates, inside Telegram",
      heroSubtitle:
        "Short, hands-on courses that take you from the basics of TON to minting your own soulbound certificate — all without leaving Telegram.",
      heroCta: "Start learning",
      featuresHeading: "Why Gram Academy",
      learnTitle: "Learn by doing",
      learnBody:
        "Bite-sized lessons and a quiz on every course. Read, practice, and prove what you know.",
      certTitle: "Soulbound certificates",
      certBody:
        "Finish a course and mint a certificate NFT to your own wallet — permanent proof, bound to you.",
      referralTitle: "Referral rewards",
      referralBody:
        "Invite friends for a Stars discount, and earn a TON payout when they mint their first certificate.",
      multilingualTitle: "In your language",
      multilingualBody:
        "Every course and lesson is available in English, Russian, and Chinese.",
      sectionsHeading: "Start your journey",
      sectionsSubtitle: "Pick a track and begin.",
      browseAll: "Browse all courses",
    },
    learning: {
      tab: "Learning",
      title: "Learning",
      subtitle: "Browse the catalog by section.",
      empty: "No courses yet.",
      courses: "{n} courses",
      hoursMeta: "{n} hr",
      minutesMeta: "{n} min",
      sectionCertHint:
        "Complete the free courses in this section to earn the {section} certificate.",
    },
    section: {
      lessons: "{n} lessons",
      quizzes: "{n} quizzes",
      progress: "{done}/{total} done",
      empty: "No courses in this section yet.",
    },
    course: {
      free: "Free",
      stars: "{n} {star}",
      lessonsHeading: "Lessons",
      quizzesHeading: "Quizzes",
      getCertificate: "Get certificate",
      certificatePending: "Awaiting on-chain confirmation",
      certificateMinted: "View certificate",
      buy: "Buy for {n} {star}",
      discountBadge: "-15%",
      completed: "Completed",
      quiz: "Quiz",
      start: "Start",
      continueLearning: "Continue",
      roadmap: "Course roadmap",
      certificateMeta: "Certificate",
      whatsInside: "What's inside",
      startCourse: "Start course",
      reviewCourse: "Review course",
      whatYouLearn: "What you'll learn",
      durationHours: "{n} hr",
      durationMinutes: "{n} min",
    },
    lesson: {
      markComplete: "Mark as complete",
      completed: "Lesson completed",
      next: "Next",
      finish: "Back to course",
      eyebrow: "Lesson {current} of {total}",
      contents: "Contents",
      onThisPage: "On this page",
      prev: "Previous",
      toQuiz: "Go to the test",
      helpfulQuestion: "Was this helpful?",
      helpfulYes: "Yes",
      helpfulNo: "No",
    },
    quiz: {
      progress: "Question {current} / {total}",
      next: "Next",
      submit: "Submit",
      passedTitle: "Passed!",
      failedTitle: "Not quite",
      score: "Score: {score}",
      retry: "Try again",
      continue: "Continue",
      selectAnswer: "Pick an answer to continue",
      rulesHeading: "Before you start",
      ruleTimer: "30 seconds per question",
      ruleShuffle: "Questions and answers are shuffled every attempt",
      ruleNoLeave: "Leaving or switching apps fails the attempt immediately",
      ruleNoCopy: "Don't try to copy the questions or answers",
      ruleThreshold: "You need at least {min} out of {total} correct answers to pass",
      ruleCooldown: "If you don't pass, you can try again in about an hour",
      start: "Start quiz",
      timeLeft: "{s}s",
      timeUp: "Time's up",
      cooldownHeading: "On cooldown",
      cooldownAvailableAt: "You can try again at {time}",
      cooldownIn: "in {duration}",
      failedBody:
        "Unfortunately you didn't get enough correct answers to pass this quiz. Try again in about an hour.",
      retryCountdown: "Available again in {duration}",
      failedRuleTitle: "Test ended",
      failedRuleBody:
        "This attempt ended because a quiz rule was broken — you left the app or ran out of time. You can try again in about an hour.",
      rateHeading: "Rate this course",
      rateHint: "How useful was it?",
      rateThanks: "Thanks for your rating!",
      rateStar: "{n} stars",
      mintHeading: "Claim your certificate",
      backToCourse: "Back to course",
    },
    profile: {
      title: "Profile",
      language: "Language",
      theme: "Theme",
      preferences: "Preferences",
      wallet: "Wallet",
      referral: "Invite friends",
      certificates: "My certificates",
      certificatesHint: "See everything you've earned and unlocked",
      premium: "Premium",
      discountReminder: "You have -15% on paid courses",
    },
    certificates: {
      title: "Certificates",
      subtitle: "Everything you've earned, and what's still locked",
      earned: "Certificates earned",
      topPercent: "You're in the top {n}% of learners",
      firstOne: "Earn your first certificate to see how you rank",
      unlocked: "Unlocked",
      inProgress: "Pending",
      locked: "Locked",
    },
    wallet: {
      connecting: "Connecting…",
      verifying: "Verifying…",
      network: "Network",
      mainnet: "Mainnet",
      testnet: "Testnet",
      errorChallenge: "Couldn't start the connection. Try again.",
      errorDeclined: "The wallet didn't confirm ownership. Try again.",
      errorVerify: "Couldn't verify the wallet. Try again.",
      errorDisconnect: "Couldn't fully disconnect. Try again.",
      connectShort: "Connect",
      balance: "Balance",
      copyAddress: "Copy address",
      copied: "Copied!",
    },
    referral: {
      teaser: "Connect your wallet to get your referral link.",
      copy: "Copy",
      copied: "Copied!",
      share: "Share",
      invited: "Invited",
      walletsConnected: "Wallets connected",
      minted: "Certificates minted",
      earned: "GRAM earned",
      infoTitle: "How referrals work",
      infoIntro: "Share your link — when a friend joins Gram Academy through it, you both benefit.",
      infoForYouTitle: "For you",
      infoForYouBody:
        "When your friend mints their first certificate, 0.05 TON is sent to your connected wallet automatically — no extra steps.",
      infoForFriendTitle: "For your friend",
      infoForFriendBody: "They get 15% off any paid course, for as long as they're on Gram Academy.",
      infoClose: "Got it",
    },
    outside: {
      title: "Open in Telegram",
      body: "Gram Academy runs inside Telegram.",
      button: "Open the bot",
    },
    error: { generic: "Something went wrong." },
    footer: { builtOn: "Built on", credit: "© {year} Gram Academy" },
    mint: {
      walletRequired: "Connect a wallet in your profile to mint this certificate.",
      goToProfile: "Go to Profile",
      waitingTitle: "Confirming on-chain",
      waitingBody: "This usually takes under a minute.",
      confirmedTitle: "Certificate minted!",
      serial: "Serial #{n}",
      viewExplorer: "View on TON Explorer",
      rejected: "You cancelled the transaction. You can try again.",
      pending: "Still confirming — this can take a moment. You can try again.",
      tryAgain: "Try again",
      errorAlreadyMinted: "This certificate has already been minted.",
      errorNotCompleted: "Finish the course to unlock your certificate.",
      errorWalletRequired: "Connect a wallet first.",
      mintCta: "Mint Certificate",
    },
    purchase: {
      opening: "Opening payment…",
      confirming: "Confirming your purchase…",
      cancelled: "Payment cancelled.",
      failed: "Payment didn't go through. You can try again.",
      dismiss: "Dismiss",
    },
  },
  ru: {
    home: {
      title: "Учёба",
      subtitle: "Курсы по TON",
      empty: "Пока нет курсов.",
      courses: "{n} курсов",
    },
    landing: {
      eyebrow: "Учись на TON",
      heroTitle: "Изучай TON и получай сертификаты в блокчейне — прямо в Telegram",
      heroSubtitle:
        "Короткие практические курсы: от основ TON до минта собственного soulbound-сертификата — не выходя из Telegram.",
      heroCta: "Начать учиться",
      featuresHeading: "Почему Gram Academy",
      learnTitle: "Учись на практике",
      learnBody:
        "Компактные уроки и тест в каждом курсе. Читай, практикуйся и подтверждай знания.",
      certTitle: "Soulbound-сертификаты",
      certBody:
        "Заверши курс и сминти NFT-сертификат в свой кошелёк — постоянное подтверждение, привязанное к тебе.",
      referralTitle: "Реферальные награды",
      referralBody:
        "Приглашай друзей ради скидки в Stars и получай выплату в TON, когда они минтят первый сертификат.",
      multilingualTitle: "На твоём языке",
      multilingualBody:
        "Каждый курс и урок доступны на английском, русском и китайском.",
      sectionsHeading: "Начни свой путь",
      sectionsSubtitle: "Выбери направление и приступай.",
      browseAll: "Смотреть все курсы",
    },
    learning: {
      tab: "Обучение",
      title: "Обучение",
      subtitle: "Каталог курсов по разделам.",
      empty: "Пока нет курсов.",
      courses: "{n} курсов",
      hoursMeta: "{n} ч",
      minutesMeta: "{n} мин",
      sectionCertHint:
        "Пройди бесплатные курсы этого раздела, чтобы получить сертификат «{section}».",
    },
    section: {
      lessons: "{n} уроков",
      quizzes: "{n} тестов",
      progress: "{done}/{total} пройдено",
      empty: "В этом разделе пока нет курсов.",
    },
    course: {
      free: "Бесплатно",
      stars: "{n} {star}",
      lessonsHeading: "Уроки",
      quizzesHeading: "Тесты",
      getCertificate: "Получить сертификат",
      certificatePending: "Ждём подтверждение в сети",
      certificateMinted: "Открыть сертификат",
      buy: "Купить за {n} {star}",
      discountBadge: "-15%",
      completed: "Пройдено",
      quiz: "Тест",
      start: "Начать",
      continueLearning: "Продолжить",
      roadmap: "Программа курса",
      certificateMeta: "Сертификат",
      whatsInside: "Что внутри",
      startCourse: "Начать курс",
      reviewCourse: "Повторить курс",
      whatYouLearn: "Чему вы научитесь",
      durationHours: "{n} ч",
      durationMinutes: "{n} мин",
    },
    lesson: {
      markComplete: "Урок пройден",
      completed: "Урок пройден",
      next: "Дальше",
      finish: "К курсу",
      eyebrow: "Урок {current} из {total}",
      contents: "Программа",
      onThisPage: "На этой странице",
      prev: "Назад",
      toQuiz: "Перейти к тесту",
      helpfulQuestion: "Было ли это полезно?",
      helpfulYes: "Да",
      helpfulNo: "Нет",
    },
    quiz: {
      progress: "Вопрос {current} / {total}",
      next: "Дальше",
      submit: "Завершить",
      passedTitle: "Сдано!",
      failedTitle: "Почти получилось",
      score: "Результат: {score}",
      retry: "Попробовать ещё раз",
      continue: "Продолжить",
      selectAnswer: "Выбери ответ, чтобы продолжить",
      rulesHeading: "Перед началом",
      ruleTimer: "30 секунд на каждый вопрос",
      ruleShuffle: "Вопросы и варианты перемешиваются при каждой попытке",
      ruleNoLeave:
        "Выход из приложения или переключение на другое сразу проваливает попытку",
      ruleNoCopy: "Не пытайся копировать текст вопросов и ответов",
      ruleThreshold: "Чтобы сдать, нужно минимум {min} правильных ответов из {total}",
      ruleCooldown: "Если не сдашь, следующая попытка будет доступна примерно через час",
      start: "Начать тест",
      timeLeft: "{s} с",
      timeUp: "Время вышло",
      cooldownHeading: "Временная блокировка",
      cooldownAvailableAt: "Сможешь попробовать снова в {time}",
      cooldownIn: "через {duration}",
      failedBody:
        "К сожалению, правильных ответов не хватило, чтобы сдать тест. Попробуй снова примерно через час.",
      retryCountdown: "Снова доступно через {duration}",
      failedRuleTitle: "Тест прерван",
      failedRuleBody:
        "Попытка завершилась, потому что было нарушено правило теста — ты вышел из приложения или закончилось время. Попробовать снова можно примерно через час.",
      rateHeading: "Оцените курс",
      rateHint: "Насколько это было полезно?",
      rateThanks: "Спасибо за оценку!",
      rateStar: "{n} звёзд",
      mintHeading: "Получите сертификат",
      backToCourse: "К курсу",
    },
    profile: {
      title: "Профиль",
      language: "Язык",
      theme: "Тема",
      preferences: "Настройки",
      wallet: "Кошелёк",
      referral: "Приглашай друзей",
      certificates: "Мои сертификаты",
      certificatesHint: "Все полученные и ещё не открытые сертификаты",
      premium: "Premium",
      discountReminder: "У тебя -15% на платные курсы",
    },
    certificates: {
      title: "Сертификаты",
      subtitle: "Всё, что ты уже получил, и что ещё предстоит открыть",
      earned: "Сертификатов получено",
      topPercent: "Ты в топ-{n}% учащихся",
      firstOne: "Получи первый сертификат, чтобы узнать свой рейтинг",
      unlocked: "Получен",
      inProgress: "В обработке",
      locked: "Заблокирован",
    },
    wallet: {
      connecting: "Подключение…",
      verifying: "Проверка…",
      network: "Сеть",
      mainnet: "Mainnet",
      testnet: "Testnet",
      errorChallenge: "Не удалось начать подключение. Попробуй ещё раз.",
      errorDeclined: "Кошелёк не подтвердил владение адресом. Попробуй ещё раз.",
      errorVerify: "Не удалось проверить кошелёк. Попробуй ещё раз.",
      errorDisconnect: "Не удалось полностью отключить кошелёк. Попробуй ещё раз.",
      connectShort: "Подключить",
      balance: "Баланс",
      copyAddress: "Скопировать адрес",
      copied: "Скопировано!",
    },
    referral: {
      teaser: "Подключи кошелёк, чтобы получить реферальную ссылку.",
      copy: "Скопировать",
      copied: "Скопировано!",
      share: "Поделиться",
      invited: "Приглашено",
      walletsConnected: "Подключили кошелёк",
      minted: "Сминтили сертификат",
      earned: "Заработано GRAM",
      infoTitle: "Как работает рефералка",
      infoIntro: "Делись своей ссылкой — когда друг присоединится к Gram Academy по ней, выиграете оба.",
      infoForYouTitle: "Тебе",
      infoForYouBody:
        "Когда твой друг сминтит свой первый сертификат, на твой подключённый кошелёк автоматически придёт 0.05 TON — без лишних действий.",
      infoForFriendTitle: "Твоему другу",
      infoForFriendBody: "Скидка -15% на любой платный курс, пока он на Gram Academy.",
      infoClose: "Понятно",
    },
    outside: {
      title: "Откройте в Telegram",
      body: "Gram Academy работает внутри Telegram.",
      button: "Открыть бота",
    },
    error: { generic: "Что-то пошло не так." },
    footer: { builtOn: "Built on", credit: "© {year} Gram Academy" },
    mint: {
      walletRequired: "Подключите кошелёк в профиле, чтобы получить сертификат.",
      goToProfile: "В профиль",
      waitingTitle: "Подтверждаем в сети",
      waitingBody: "Обычно это занимает меньше минуты.",
      confirmedTitle: "Сертификат получен!",
      serial: "Серийный № {n}",
      viewExplorer: "Открыть в TON Explorer",
      rejected: "Вы отменили транзакцию. Можно попробовать снова.",
      pending: "Всё ещё подтверждается — это может занять немного времени. Можно попробовать снова.",
      tryAgain: "Попробовать снова",
      errorAlreadyMinted: "Этот сертификат уже получен.",
      errorNotCompleted: "Заверши курс, чтобы открыть сертификат.",
      errorWalletRequired: "Сначала подключите кошелёк.",
      mintCta: "Создать сертификат",
    },
    purchase: {
      opening: "Открываем оплату…",
      confirming: "Подтверждаем покупку…",
      cancelled: "Оплата отменена.",
      failed: "Оплата не прошла. Можно попробовать снова.",
      dismiss: "Скрыть",
    },
  },
  zh: {
    home: {
      title: "学习",
      subtitle: "TON 课程",
      empty: "暂无课程。",
      courses: "{n} 门课程",
    },
    landing: {
      eyebrow: "在 TON 上学习",
      heroTitle: "学习 TON，获取链上证书，尽在 Telegram",
      heroSubtitle:
        "简短的实操课程，带你从 TON 基础一路到铸造属于自己的灵魂绑定证书——全程无需离开 Telegram。",
      heroCta: "开始学习",
      featuresHeading: "为什么选择 Gram Academy",
      learnTitle: "在实践中学习",
      learnBody: "精简课程，每门课都配测验。阅读、练习并证明你的掌握程度。",
      certTitle: "灵魂绑定证书",
      certBody: "完成课程即可将证书 NFT 铸造到你自己的钱包——永久留存，与你绑定。",
      referralTitle: "推荐奖励",
      referralBody:
        "邀请好友可享 Stars 折扣；当他们铸造首张证书时，你还能获得 TON 奖励。",
      multilingualTitle: "支持你的语言",
      multilingualBody: "每门课程和课时均提供英文、俄文和中文版本。",
      sectionsHeading: "开启你的旅程",
      sectionsSubtitle: "选择一个方向，即刻开始。",
      browseAll: "浏览全部课程",
    },
    learning: {
      tab: "学习",
      title: "学习",
      subtitle: "按板块浏览课程目录。",
      empty: "暂无课程。",
      courses: "{n} 门课程",
      hoursMeta: "{n} 小时",
      minutesMeta: "{n} 分钟",
      sectionCertHint: "完成本板块的免费课程即可获得「{section}」证书。",
    },
    section: {
      lessons: "{n} 节课",
      quizzes: "{n} 个测验",
      progress: "已完成 {done}/{total}",
      empty: "本板块暂无课程。",
    },
    course: {
      free: "免费",
      stars: "{n} {star}",
      lessonsHeading: "课程",
      quizzesHeading: "测验",
      getCertificate: "领取证书",
      certificatePending: "等待链上确认",
      certificateMinted: "查看证书",
      buy: "{n} {star} 购买",
      discountBadge: "-15%",
      completed: "已完成",
      quiz: "测验",
      start: "开始",
      continueLearning: "继续",
      roadmap: "课程大纲",
      certificateMeta: "证书",
      whatsInside: "课程内容",
      startCourse: "开始课程",
      reviewCourse: "复习课程",
      whatYouLearn: "你将学到",
      durationHours: "{n} 小时",
      durationMinutes: "{n} 分钟",
    },
    lesson: {
      markComplete: "标记为已完成",
      completed: "课程已完成",
      next: "下一步",
      finish: "返回课程",
      eyebrow: "第 {current} / {total} 课",
      contents: "目录",
      onThisPage: "本页内容",
      prev: "上一节",
      toQuiz: "前往测验",
      helpfulQuestion: "这节课有帮助吗？",
      helpfulYes: "有帮助",
      helpfulNo: "没有",
    },
    quiz: {
      progress: "第 {current} / {total} 题",
      next: "下一题",
      submit: "提交",
      passedTitle: "通过！",
      failedTitle: "还差一点",
      score: "得分：{score}",
      retry: "再试一次",
      continue: "继续",
      selectAnswer: "请选择一个答案",
      rulesHeading: "开始之前",
      ruleTimer: "每题限时 30 秒",
      ruleShuffle: "每次尝试题目和选项顺序都会打乱",
      ruleNoLeave: "退出或切换到其他应用会立即导致本次尝试失败",
      ruleNoCopy: "请勿尝试复制题目或答案文本",
      ruleThreshold: "至少需要答对 {total} 题中的 {min} 题才能通过",
      ruleCooldown: "如果未通过，大约一小时后可再次尝试",
      start: "开始测验",
      timeLeft: "{s} 秒",
      timeUp: "时间到",
      cooldownHeading: "冷却中",
      cooldownAvailableAt: "可在 {time} 再次尝试",
      cooldownIn: "{duration} 后",
      failedBody: "很遗憾，正确答案数量不足，未能通过测验。请大约一小时后重试。",
      retryCountdown: "{duration} 后可重试",
      failedRuleTitle: "测验已结束",
      failedRuleBody: "本次测验因违反规则而结束——你离开了应用或答题超时。大约一小时后可再次尝试。",
      rateHeading: "为课程评分",
      rateHint: "它有多大帮助？",
      rateThanks: "感谢你的评分！",
      rateStar: "{n} 星",
      mintHeading: "领取你的证书",
      backToCourse: "返回课程",
    },
    profile: {
      title: "个人中心",
      language: "语言",
      theme: "主题",
      preferences: "偏好设置",
      wallet: "钱包",
      referral: "邀请好友",
      certificates: "我的证书",
      certificatesHint: "查看已获得和待解锁的所有证书",
      premium: "Premium",
      discountReminder: "付费课程可享 -15%",
    },
    certificates: {
      title: "证书",
      subtitle: "已获得的证书，以及尚待解锁的证书",
      earned: "已获得证书",
      topPercent: "你已超过 {n}% 的学员",
      firstOne: "获得第一张证书即可查看你的排名",
      unlocked: "已解锁",
      inProgress: "确认中",
      locked: "未解锁",
    },
    wallet: {
      connecting: "连接中…",
      verifying: "验证中…",
      network: "网络",
      mainnet: "Mainnet",
      testnet: "Testnet",
      errorChallenge: "无法发起连接，请重试。",
      errorDeclined: "钱包未确认所有权，请重试。",
      errorVerify: "钱包验证失败，请重试。",
      errorDisconnect: "未能完全断开连接，请重试。",
      connectShort: "连接",
      balance: "余额",
      copyAddress: "复制地址",
      copied: "已复制！",
    },
    referral: {
      teaser: "连接钱包即可获取你的邀请链接。",
      copy: "复制",
      copied: "已复制！",
      share: "分享",
      invited: "已邀请",
      walletsConnected: "已连接钱包",
      minted: "已铸造证书",
      earned: "已赚取 GRAM",
      infoTitle: "推荐奖励如何运作",
      infoIntro: "分享你的邀请链接——好友通过它加入 Gram Academy 后，你们都会获益。",
      infoForYouTitle: "对你而言",
      infoForYouBody: "好友首次铸造证书后，0.05 TON 会自动发送到你已连接的钱包——无需额外操作。",
      infoForFriendTitle: "对好友而言",
      infoForFriendBody: "只要还在 Gram Academy 学习，任意付费课程都可享 -15% 折扣。",
      infoClose: "知道了",
    },
    outside: {
      title: "在 Telegram 中打开",
      body: "Gram Academy 在 Telegram 内运行。",
      button: "打开机器人",
    },
    error: { generic: "出错了。" },
    footer: { builtOn: "Built on", credit: "© {year} Gram Academy" },
    mint: {
      walletRequired: "请在个人中心连接钱包以领取证书。",
      goToProfile: "前往个人中心",
      waitingTitle: "链上确认中",
      waitingBody: "通常不到一分钟。",
      confirmedTitle: "证书已铸造！",
      serial: "编号 #{n}",
      viewExplorer: "在 TON 浏览器中查看",
      rejected: "你取消了交易，可以重试。",
      pending: "仍在确认中，可能需要一点时间。可以重试。",
      tryAgain: "重试",
      errorAlreadyMinted: "该证书已被铸造。",
      errorNotCompleted: "完成课程后即可领取证书。",
      errorWalletRequired: "请先连接钱包。",
      mintCta: "铸造证书",
    },
    purchase: {
      opening: "正在打开支付…",
      confirming: "正在确认购买…",
      cancelled: "支付已取消。",
      failed: "支付未成功，可以重试。",
      dismiss: "关闭",
    },
  },
};

/** Locale display names for the profile language switcher. */
export const localeLabels: Record<Locale, string> = {
  en: "English",
  ru: "Русский",
  zh: "中文",
};

/** Compact locale labels for the SegmentedControl (DESIGN.md: EN / RU / 中). */
export const localeShortLabels: Record<Locale, string> = {
  en: "EN",
  ru: "RU",
  zh: "中",
};

/** Replaces `{key}` placeholders in a template string. */
export function format(
  template: string,
  vars: Record<string, string | number>,
): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in vars ? String(vars[key]) : match,
  );
}
