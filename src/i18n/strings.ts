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
    purchaseSoon: string;
    discountBadge: string;
    completed: string;
    quiz: string;
    start: string;
    continueLearning: string;
    roadmap: string;
    certificateMeta: string;
    whatsInside: string;
  };
  lesson: {
    markComplete: string;
    completed: string;
    next: string;
    finish: string;
    eyebrow: string;
    contents: string;
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
    // Failure screen (same copy for fail/timeout/violation)
    failedBody: string;
    retryCountdown: string;
  };
  profile: {
    title: string;
    language: string;
    theme: string;
    wallet: string;
    walletSoon: string;
    referral: string;
    referralSoon: string;
    certificates: string;
    certificatesSoon: string;
    premium: string;
    discountReminder: string;
    builtOn: string;
  };
  outside: { title: string; body: string; button: string };
  error: { generic: string };
}

export const screenMessages: Record<Locale, ScreenMessages> = {
  en: {
    home: {
      title: "Learn",
      subtitle: "Courses on TON",
      empty: "No courses yet.",
      courses: "{n} courses",
    },
    section: {
      lessons: "{n} lessons",
      quizzes: "{n} quizzes",
      progress: "{done}/{total} done",
      empty: "No courses in this section yet.",
    },
    course: {
      free: "Free",
      stars: "{n} ⭐",
      lessonsHeading: "Lessons",
      quizzesHeading: "Quizzes",
      getCertificate: "Get certificate",
      certificatePending: "Awaiting on-chain confirmation",
      certificateMinted: "View certificate",
      buy: "Buy for {n} ⭐",
      purchaseSoon: "Purchases open soon",
      discountBadge: "-15%",
      completed: "Completed",
      quiz: "Quiz",
      start: "Start",
      continueLearning: "Continue",
      roadmap: "Course roadmap",
      certificateMeta: "Certificate",
      whatsInside: "What's inside",
    },
    lesson: {
      markComplete: "Mark as complete",
      completed: "Lesson completed",
      next: "Next",
      finish: "Back to course",
      eyebrow: "Lesson {current} of {total}",
      contents: "Contents",
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
    },
    profile: {
      title: "Profile",
      language: "Language",
      theme: "Theme",
      wallet: "Wallet",
      walletSoon: "Wallet connection coming soon",
      referral: "Invite friends",
      referralSoon: "Referral rewards coming soon",
      certificates: "My certificates",
      certificatesSoon: "Finish a course to earn one",
      premium: "Premium",
      discountReminder: "You have -15% on paid courses",
      builtOn: "Built on",
    },
    outside: {
      title: "Open in Telegram",
      body: "Gram Academy runs inside Telegram.",
      button: "Open the bot",
    },
    error: { generic: "Something went wrong." },
  },
  ru: {
    home: {
      title: "Учёба",
      subtitle: "Курсы по TON",
      empty: "Пока нет курсов.",
      courses: "{n} курсов",
    },
    section: {
      lessons: "{n} уроков",
      quizzes: "{n} тестов",
      progress: "{done}/{total} пройдено",
      empty: "В этом разделе пока нет курсов.",
    },
    course: {
      free: "Бесплатно",
      stars: "{n} ⭐",
      lessonsHeading: "Уроки",
      quizzesHeading: "Тесты",
      getCertificate: "Получить сертификат",
      certificatePending: "Ждём подтверждение в сети",
      certificateMinted: "Открыть сертификат",
      buy: "Купить за {n} ⭐",
      purchaseSoon: "Покупка скоро откроется",
      discountBadge: "-15%",
      completed: "Пройдено",
      quiz: "Тест",
      start: "Начать",
      continueLearning: "Продолжить",
      roadmap: "Программа курса",
      certificateMeta: "Сертификат",
      whatsInside: "Что внутри",
    },
    lesson: {
      markComplete: "Урок пройден",
      completed: "Урок пройден",
      next: "Дальше",
      finish: "К курсу",
      eyebrow: "Урок {current} из {total}",
      contents: "Программа",
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
    },
    profile: {
      title: "Профиль",
      language: "Язык",
      theme: "Тема",
      wallet: "Кошелёк",
      walletSoon: "Подключение кошелька скоро",
      referral: "Приглашай друзей",
      referralSoon: "Реферальные награды скоро",
      certificates: "Мои сертификаты",
      certificatesSoon: "Пройди курс, чтобы получить",
      premium: "Premium",
      discountReminder: "У тебя -15% на платные курсы",
      builtOn: "Built on",
    },
    outside: {
      title: "Откройте в Telegram",
      body: "Gram Academy работает внутри Telegram.",
      button: "Открыть бота",
    },
    error: { generic: "Что-то пошло не так." },
  },
  zh: {
    home: {
      title: "学习",
      subtitle: "TON 课程",
      empty: "暂无课程。",
      courses: "{n} 门课程",
    },
    section: {
      lessons: "{n} 节课",
      quizzes: "{n} 个测验",
      progress: "已完成 {done}/{total}",
      empty: "本板块暂无课程。",
    },
    course: {
      free: "免费",
      stars: "{n} ⭐",
      lessonsHeading: "课程",
      quizzesHeading: "测验",
      getCertificate: "领取证书",
      certificatePending: "等待链上确认",
      certificateMinted: "查看证书",
      buy: "{n} ⭐ 购买",
      purchaseSoon: "购买功能即将开放",
      discountBadge: "-15%",
      completed: "已完成",
      quiz: "测验",
      start: "开始",
      continueLearning: "继续",
      roadmap: "课程大纲",
      certificateMeta: "证书",
      whatsInside: "课程内容",
    },
    lesson: {
      markComplete: "标记为已完成",
      completed: "课程已完成",
      next: "下一步",
      finish: "返回课程",
      eyebrow: "第 {current} / {total} 课",
      contents: "目录",
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
    },
    profile: {
      title: "个人中心",
      language: "语言",
      theme: "主题",
      wallet: "钱包",
      walletSoon: "钱包连接即将上线",
      referral: "邀请好友",
      referralSoon: "邀请奖励即将上线",
      certificates: "我的证书",
      certificatesSoon: "完成课程即可获得",
      premium: "Premium",
      discountReminder: "付费课程可享 -15%",
      builtOn: "Built on",
    },
    outside: {
      title: "在 Telegram 中打开",
      body: "Gram Academy 在 Telegram 内运行。",
      button: "打开机器人",
    },
    error: { generic: "出错了。" },
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
