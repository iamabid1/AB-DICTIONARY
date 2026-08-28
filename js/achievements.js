/* =====================================================
   AB DICTIONARY
   ACHIEVEMENT ENGINE V3
===================================================== */

const ACHIEVEMENT_KEY = "abDictionaryAchievements";

const LEARNED_WORDS_KEY = "abDictionaryLearnedWords";
const FAVORITES_KEY = "abDictionaryFavorites";
const STREAK_KEY = "abDictionaryLearnStreak";
const MISSIONS_KEY = "abDictionaryDailyMissions";
const XP_KEY = "abDictionaryQuizTotalXP";

const TODAY_PROGRESS_KEY = "abDictionaryTodayProgress";
const TOTAL_MISSIONS_KEY = "abDictionaryTotalMissions";
const RANDOM_USED_KEY = "abDictionaryRandomUsed";

/* =====================================================
   ACHIEVEMENTS
===================================================== */

const ACHIEVEMENTS = [
  /* ================= LEARNING ================= */

  {
    id: "word-1",
    category: "learning",
    icon: "🌱",
    title: "First Step",
    description: "Learn your first word.",
    requirement: "1 word",
    reward: 10,
    check: (s) => s.learned >= 1,
  },

  {
    id: "word-5",
    category: "learning",
    icon: "📖",
    title: "Warm Up",
    description: "Learn 5 words.",
    requirement: "5 words",
    reward: 15,
    check: (s) => s.learned >= 5,
  },

  {
    id: "word-10",
    category: "learning",
    icon: "📚",
    title: "Getting Started",
    description: "Learn 10 words.",
    requirement: "10 words",
    reward: 25,
    check: (s) => s.learned >= 10,
  },

  {
    id: "word-25",
    category: "learning",
    icon: "🧠",
    title: "Word Builder",
    description: "Learn 25 words.",
    requirement: "25 words",
    reward: 35,
    check: (s) => s.learned >= 25,
  },

  {
    id: "word-50",
    category: "learning",
    icon: "🔥",
    title: "Vocabulary Builder",
    description: "Learn 50 words.",
    requirement: "50 words",
    reward: 50,
    check: (s) => s.learned >= 50,
  },

  {
    id: "word-100",
    category: "learning",
    icon: "💯",
    title: "Word Master",
    description: "Learn 100 words.",
    requirement: "100 words",
    reward: 100,
    check: (s) => s.learned >= 100,
  },

  {
    id: "word-250",
    category: "learning",
    icon: "🚀",
    title: "Vocabulary Expert",
    description: "Learn 250 words.",
    requirement: "250 words",
    reward: 175,
    check: (s) => s.learned >= 250,
  },

  {
    id: "word-500",
    category: "learning",
    icon: "🏆",
    title: "Half Thousand",
    description: "Learn 500 words.",
    requirement: "500 words",
    reward: 300,
    check: (s) => s.learned >= 500,
  },

  {
    id: "word-1000",
    category: "learning",
    icon: "👑",
    title: "Dictionary Legend",
    description: "Learn 1,000 words.",
    requirement: "1,000 words",
    reward: 500,
    check: (s) => s.learned >= 1000,
  },

  {
    id: "word-2500",
    category: "learning",
    icon: "💎",
    title: "Word Collector",
    description: "Learn 2,500 words.",
    requirement: "2,500 words",
    reward: 1000,
    check: (s) => s.learned >= 2500,
  },

  /* ================= QUIZ ================= */

  {
    id: "xp-100",
    category: "quiz",
    icon: "✨",
    title: "XP Hunter",
    description: "Earn 100 XP from quizzes.",
    requirement: "100 XP",
    reward: 25,
    check: (s) => s.xp >= 100,
  },

  {
    id: "xp-500",
    category: "quiz",
    icon: "⚡",
    title: "XP Grinder",
    description: "Earn 500 XP from quizzes.",
    requirement: "500 XP",
    reward: 75,
    check: (s) => s.xp >= 500,
  },

  {
    id: "xp-1000",
    category: "quiz",
    icon: "🚀",
    title: "XP Champion",
    description: "Earn 1,000 XP from quizzes.",
    requirement: "1,000 XP",
    reward: 150,
    check: (s) => s.xp >= 1000,
  },

  {
    id: "xp-2500",
    category: "quiz",
    icon: "💎",
    title: "XP Elite",
    description: "Earn 2,500 XP from quizzes.",
    requirement: "2,500 XP",
    reward: 300,
    check: (s) => s.xp >= 2500,
  },

  {
    id: "xp-5000",
    category: "quiz",
    icon: "👑",
    title: "XP King",
    description: "Earn 5,000 XP from quizzes.",
    requirement: "5,000 XP",
    reward: 500,
    check: (s) => s.xp >= 5000,
  },

  {
    id: "xp-10000",
    category: "quiz",
    icon: "💠",
    title: "XP Legend",
    description: "Earn 10,000 XP from quizzes.",
    requirement: "10,000 XP",
    reward: 1000,
    check: (s) => s.xp >= 10000,
  },

  /* ================= STREAK ================= */

  {
    id: "streak-3",
    category: "streak",
    icon: "🔥",
    title: "Three in a Row",
    description: "Reach a 3-day learning streak.",
    requirement: "3 days",
    reward: 20,
    check: (s) => s.streak >= 3,
  },

  {
    id: "streak-7",
    category: "streak",
    icon: "🔥",
    title: "Week Warrior",
    description: "Reach a 7-day streak.",
    requirement: "7 days",
    reward: 75,
    check: (s) => s.streak >= 7,
  },

  {
    id: "streak-14",
    category: "streak",
    icon: "⚡",
    title: "Two Weeks Strong",
    description: "Reach a 14-day streak.",
    requirement: "14 days",
    reward: 125,
    check: (s) => s.streak >= 14,
  },

  {
    id: "streak-30",
    category: "streak",
    icon: "🏆",
    title: "Monthly Master",
    description: "Reach a 30-day streak.",
    requirement: "30 days",
    reward: 300,
    check: (s) => s.streak >= 30,
  },

  {
    id: "streak-60",
    category: "streak",
    icon: "💎",
    title: "Unstoppable",
    description: "Reach a 60-day streak.",
    requirement: "60 days",
    reward: 600,
    check: (s) => s.streak >= 60,
  },

  {
    id: "streak-100",
    category: "streak",
    icon: "👑",
    title: "Century Streak",
    description: "Reach a 100-day streak.",
    requirement: "100 days",
    reward: 1000,
    check: (s) => s.streak >= 100,
  },

  /* ================= FAVORITES ================= */

  {
    id: "fav-1",
    category: "favorites",
    icon: "⭐",
    title: "First Favorite",
    description: "Favorite your first word.",
    requirement: "1 favorite",
    reward: 10,
    check: (s) => s.favorites >= 1,
  },

  {
    id: "fav-5",
    category: "favorites",
    icon: "⭐",
    title: "Collector",
    description: "Save 5 favorite words.",
    requirement: "5 favorites",
    reward: 20,
    check: (s) => s.favorites >= 5,
  },

  {
    id: "fav-10",
    category: "favorites",
    icon: "🌟",
    title: "Favorite Finder",
    description: "Save 10 favorite words.",
    requirement: "10 favorites",
    reward: 35,
    check: (s) => s.favorites >= 10,
  },

  {
    id: "fav-25",
    category: "favorites",
    icon: "💫",
    title: "Word Hoarder",
    description: "Save 25 favorite words.",
    requirement: "25 favorites",
    reward: 75,
    check: (s) => s.favorites >= 25,
  },

  {
    id: "fav-50",
    category: "favorites",
    icon: "💎",
    title: "Favorite Vault",
    description: "Save 50 favorite words.",
    requirement: "50 favorites",
    reward: 150,
    check: (s) => s.favorites >= 50,
  },

  /* ================= SPECIAL / MISSIONS ================= */

  {
    id: "mission-1",
    category: "special",
    icon: "🎯",
    title: "Mission Accepted",
    description: "Complete your first daily mission.",
    requirement: "1 mission",
    reward: 20,
    check: (s) => s.totalMissions >= 1,
  },

  {
    id: "mission-10",
    category: "special",
    icon: "🎯",
    title: "Mission Runner",
    description: "Complete 10 daily missions.",
    requirement: "10 missions",
    reward: 50,
    check: (s) => s.totalMissions >= 10,
  },

  {
    id: "mission-25",
    category: "special",
    icon: "⚔️",
    title: "Mission Hunter",
    description: "Complete 25 daily missions.",
    requirement: "25 missions",
    reward: 100,
    check: (s) => s.totalMissions >= 25,
  },

  {
    id: "mission-50",
    category: "special",
    icon: "🏆",
    title: "Mission Master",
    description: "Complete 50 daily missions.",
    requirement: "50 missions",
    reward: 200,
    check: (s) => s.totalMissions >= 50,
  },

  {
    id: "mission-today",
    category: "special",
    icon: "💥",
    title: "Perfect Day",
    description: "Complete every daily mission today.",
    requirement: "4 / 4",
    reward: 100,
    check: (s) => s.todayMissions >= 4,
  },

  {
    id: "special-night",
    category: "special",
    icon: "🌙",
    title: "Night Learner",
    description: "Learn a word late at night.",
    requirement: "Hidden",
    reward: 30,
    hidden: true,
    check: (s) => s.nightLearner,
  },

  {
    id: "special-early",
    category: "special",
    icon: "🌅",
    title: "Early Bird",
    description: "Learn a word early in the morning.",
    requirement: "Hidden",
    reward: 30,
    hidden: true,
    check: (s) => s.earlyBird,
  },

  {
    id: "special-lucky",
    category: "special",
    icon: "🎲",
    title: "Lucky Word",
    description: "Discover a randomly selected word.",
    requirement: "Hidden",
    reward: 25,
    hidden: true,
    check: (s) => s.randomUsed,
  },

  {
    id: "special-perfect",
    category: "special",
    icon: "💯",
    title: "Perfect Learner",
    description: "Learn 5 words in one day.",
    requirement: "Hidden",
    reward: 100,
    hidden: true,
    check: (s) => s.todayProgress >= 5,
  },
];

/* =====================================================
   STORAGE
===================================================== */

function getData(key, fallback) {
  try {
    const value = localStorage.getItem(key);

    if (!value) return fallback;

    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

/* =====================================================
   TODAY
===================================================== */

function getTodayKey() {
  const date = new Date();

  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

/* =====================================================
   STATS
===================================================== */

function getAchievementStats() {
  const learned = getData(LEARNED_WORDS_KEY, []);
  const favorites = getData(FAVORITES_KEY, []);
  const streak = getData(STREAK_KEY, {});
  const missions = getData(MISSIONS_KEY, {});

  const xp = Number(localStorage.getItem(XP_KEY) || 0);

  const todayKey = getTodayKey();

  const todayProgress = getData(TODAY_PROGRESS_KEY, {
    date: todayKey,
    count: 0,
  });

  const todayMissions =
    missions.date === todayKey && Array.isArray(missions.completed)
      ? missions.completed.length
      : 0;

  return {
    learned: Array.isArray(learned) ? learned.length : 0,

    favorites: Array.isArray(favorites) ? favorites.length : 0,

    streak: Number(streak.streak) || 0,

    xp,

    todayProgress:
      todayProgress.date === todayKey ? Number(todayProgress.count) || 0 : 0,

    todayMissions,

    totalMissions: Number(localStorage.getItem(TOTAL_MISSIONS_KEY) || 0),

    randomUsed: localStorage.getItem(RANDOM_USED_KEY) === "true",

    /*
      These are only true when another page tells
      the achievement engine that a word was learned
      during the special time.
    */

    nightLearner: localStorage.getItem("abDictionaryNightLearner") === "true",

    earlyBird: localStorage.getItem("abDictionaryEarlyBird") === "true",
  };
}

/* =====================================================
   UNLOCKED
===================================================== */

function getUnlocked() {
  const saved = getData(ACHIEVEMENT_KEY, []);

  return Array.isArray(saved) ? saved : [];
}

function saveUnlocked(ids) {
  localStorage.setItem(ACHIEVEMENT_KEY, JSON.stringify(ids));
}

/* =====================================================
   REWARD
===================================================== */

function rewardAchievement(achievement) {
  const currentXP = Number(localStorage.getItem(XP_KEY) || 0);

  const newXP = currentXP + achievement.reward;

  localStorage.setItem(XP_KEY, String(newXP));

  window.dispatchEvent(
    new CustomEvent("abDictionaryXPUpdated", {
      detail: {
        amount: achievement.reward,
        totalXP: newXP,
        source: "achievement",
      },
    }),
  );

  showAchievementNotification(achievement);
}

/* =====================================================
   NOTIFICATION
===================================================== */

function showAchievementNotification(achievement) {
  /*
    If your app already has a notification system,
    this can easily be connected to it later.
  */

  const existing = document.querySelector(".achievement-notification");

  if (existing) {
    existing.remove();
  }

  const notification = document.createElement("div");

  notification.className = "achievement-notification";

  notification.innerHTML = `
    <div class="achievement-notification-icon">
      ${achievement.icon}
    </div>

    <div>
      <strong>Achievement Unlocked!</strong>
      <span>${achievement.title}</span>
      <small>+${achievement.reward} XP</small>
    </div>
  `;

  document.body.appendChild(notification);

  requestAnimationFrame(() => {
    notification.classList.add("show");
  });

  setTimeout(() => {
    notification.classList.remove("show");

    setTimeout(() => {
      notification.remove();
    }, 300);
  }, 3500);
}

/* =====================================================
   CHECK ACHIEVEMENTS
===================================================== */

function checkAchievements() {
  const stats = getAchievementStats();

  const unlocked = getUnlocked();

  let changed = false;

  ACHIEVEMENTS.forEach((achievement) => {
    if (!unlocked.includes(achievement.id) && achievement.check(stats)) {
      unlocked.push(achievement.id);

      rewardAchievement(achievement);

      changed = true;
    }
  });

  if (changed) {
    saveUnlocked(unlocked);
  }

  return unlocked;
}

/* =====================================================
   RENDER
===================================================== */

function renderAchievements() {
  const grid = document.getElementById("achievements-grid");

  if (!grid) return;

  const unlocked = checkAchievements();

  grid.innerHTML = "";

  ACHIEVEMENTS.forEach((achievement) => {
    const isUnlocked = unlocked.includes(achievement.id);

    const hidden = achievement.hidden && !isUnlocked;

    const card = document.createElement("article");

    card.className = `achievement-card ${isUnlocked ? "unlocked" : ""}`;

    card.dataset.category = achievement.category;

    card.innerHTML = `

        <span class="achievement-status">
          ${isUnlocked ? "UNLOCKED" : "LOCKED"}
        </span>

        <div class="achievement-icon">
          ${hidden ? "❓" : achievement.icon}
        </div>

        <h3>
          ${hidden ? "Secret Achievement" : achievement.title}
        </h3>

        <p>
          ${
            hidden ? "Keep learning to discover this." : achievement.description
          }
        </p>

        <span class="achievement-reward">
          +${achievement.reward} XP
        </span>

      `;

    grid.appendChild(card);
  });

  updateSummary(unlocked);

  applyCurrentFilter();
}

/* =====================================================
   SUMMARY
===================================================== */

function updateSummary(unlocked) {
  const total = ACHIEVEMENTS.length;

  const count = unlocked.length;

  const percent = total ? Math.round((count / total) * 100) : 0;

  const set = (id, value) => {
    const element = document.getElementById(id);

    if (element) {
      element.textContent = value;
    }
  };

  set("achievement-unlocked", count);

  set("achievement-total", total);

  set("achievement-percent", `${percent}%`);

  set("achievement-progress-count", `${count} / ${total}`);

  const fill = document.getElementById("achievement-progress-fill");

  if (fill) {
    fill.style.width = `${percent}%`;
  }
}

/* =====================================================
   FILTER SYSTEM
===================================================== */

let currentFilter = "all";

function applyCurrentFilter() {
  const cards = document.querySelectorAll(".achievement-card");

  cards.forEach((card) => {
    const category = card.dataset.category;

    const shouldShow = currentFilter === "all" || category === currentFilter;

    card.style.display = shouldShow ? "" : "none";
  });
}

function setupFilters() {
  const buttons = document.querySelectorAll(".achievement-filter");

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      currentFilter = button.dataset.filter;

      buttons.forEach((btn) => btn.classList.remove("active"));

      button.classList.add("active");

      applyCurrentFilter();
    });
  });
}

/* =====================================================
   CROSS-PAGE UPDATE
===================================================== */

function refreshAchievements() {
  renderAchievements();
}

/* =====================================================
   SPECIAL LEARNING EVENTS
===================================================== */

function registerSpecialLearningTime() {
  const hour = new Date().getHours();

  if (hour >= 22) {
    localStorage.setItem("abDictionaryNightLearner", "true");
  }

  if (hour < 7) {
    localStorage.setItem("abDictionaryEarlyBird", "true");
  }
}

/* =====================================================
   GLOBAL EVENT
===================================================== */

window.addEventListener("abDictionaryWordLearned", () => {
  registerSpecialLearningTime();

  refreshAchievements();
});

window.addEventListener("abDictionaryMissionCompleted", refreshAchievements);

window.addEventListener("abDictionaryXPUpdated", refreshAchievements);

window.addEventListener("storage", refreshAchievements);

/* =====================================================
   START
===================================================== */

document.addEventListener("DOMContentLoaded", () => {
  setupFilters();

  renderAchievements();
});
