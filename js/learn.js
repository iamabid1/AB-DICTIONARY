/* =====================================================
   AB DICTIONARY
   LEARN ENGINE V3
===================================================== */

let learnWords = [];
let currentLearningWord = null;

/* =====================================================
   STORAGE
===================================================== */

const LEARN_FAVORITES_KEY = "abDictionaryFavorites";
const LEARNED_WORDS_KEY = "abDictionaryLearnedWords";
const LEARN_STREAK_KEY = "abDictionaryLearnStreak";
const LEARN_TODAY_KEY = "abDictionaryTodayProgress";

const DAILY_MISSIONS_KEY = "abDictionaryDailyMissions";
const XP_KEY = "abDictionaryQuizTotalXP";

/* Daily target */
const DAILY_TARGET = 5;

/* =====================================================
   ELEMENTS
===================================================== */

const dailyWordContainer = document.getElementById("daily-word");
const dailyDate = document.getElementById("daily-date");

const randomLearnButton = document.getElementById("random-learn-button");

const nextLearnButton = document.getElementById("next-learn-button");

const learnedCountElement = document.getElementById("learned-count");

const streakCountElement = document.getElementById("streak-count");

const progressCountElement = document.getElementById("today-progress");

const progressBar = document.getElementById("learn-progress");

const resetProgressButton = document.getElementById("reset-learn-progress");

/* =====================================================
   DATE
===================================================== */

function getTodayKey() {
  const now = new Date();

  return [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("-");
}

/* =====================================================
   HTML ESCAPE
===================================================== */

function escapeLearnHTML(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

/* =====================================================
   LOAD WORDS
===================================================== */

async function loadLearnWords() {
  try {
    const response = await fetch("data/words.json");

    if (!response.ok) {
      throw new Error("Could not load words.json");
    }

    learnWords = await response.json();

    if (!Array.isArray(learnWords) || !learnWords.length) {
      throw new Error("Dictionary is empty.");
    }

    learnWords.sort((a, b) =>
      String(a.word || "").localeCompare(String(b.word || "")),
    );

    showDailyWord();

    updateDifficultyCounts();
    updateLearningStats();
    updateTodayProgress();
    renderDailyMissions();
  } catch (error) {
    console.error("Learn page error:", error);

    if (dailyWordContainer) {
      dailyWordContainer.innerHTML = `
        <p style="color:var(--text-muted);">
          Unable to load today's word.
        </p>
      `;
    }
  }
}

/* =====================================================
   DAILY WORD
===================================================== */

function getDailyWord() {
  if (!learnWords.length) {
    return null;
  }

  const now = new Date();

  const startOfYear = new Date(now.getFullYear(), 0, 0);

  const difference = now - startOfYear;

  const oneDay = 86400000;

  const dayOfYear = Math.floor(difference / oneDay);

  const index = dayOfYear % learnWords.length;

  return learnWords[index] || null;
}

/* =====================================================
   SHOW WORD
===================================================== */

function showDailyWord(wordOverride = null) {
  if (!learnWords.length || !dailyWordContainer) {
    return;
  }

  const word = wordOverride || getDailyWord();

  if (!word) return;

  currentLearningWord = word;

  const now = new Date();

  if (dailyDate) {
    dailyDate.textContent = now.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  dailyWordContainer.innerHTML = `
    <div class="daily-word-content">

      <h2>
        ${escapeLearnHTML(word.word)}
      </h2>

      ${
        word.partOfSpeech
          ? `
            <div class="daily-part">
              ${escapeLearnHTML(word.partOfSpeech)}
            </div>
          `
          : ""
      }

      ${
        word.pronunciation
          ? `
            <div class="daily-pronunciation">
              ${escapeLearnHTML(word.pronunciation)}
            </div>
          `
          : ""
      }

      ${
        word.meaning
          ? `
            <p class="daily-meaning">
              ${escapeLearnHTML(word.meaning)}
            </p>
          `
          : ""
      }

      ${
        word.bangla
          ? `
            <p class="daily-bangla">
              ${escapeLearnHTML(word.bangla)}
            </p>
          `
          : ""
      }

      ${
        word.example
          ? `
            <div class="daily-example">
              “${escapeLearnHTML(word.example)}”
            </div>
          `
          : ""
      }

      ${
        Array.isArray(word.synonyms) && word.synonyms.length
          ? `
            <div class="daily-extra">
              <span class="daily-extra-label">
                SYNONYMS
              </span>

              <div class="daily-tags">
                ${word.synonyms
                  .map(
                    (item) =>
                      `<span>
                        ${escapeLearnHTML(item)}
                      </span>`,
                  )
                  .join("")}
              </div>
            </div>
          `
          : ""
      }

      ${
        Array.isArray(word.antonyms) && word.antonyms.length
          ? `
            <div class="daily-extra">
              <span class="daily-extra-label">
                ANTONYMS
              </span>

              <div class="daily-tags">
                ${word.antonyms
                  .map(
                    (item) =>
                      `<span>
                        ${escapeLearnHTML(item)}
                      </span>`,
                  )
                  .join("")}
              </div>
            </div>
          `
          : ""
      }

      <div class="daily-meta">

        ${
          word.difficulty
            ? `
              <span>
                ${escapeLearnHTML(word.difficulty)}
              </span>
            `
            : ""
        }

        ${
          word.category
            ? `
              <span>
                ${escapeLearnHTML(word.category)}
              </span>
            `
            : ""
        }

      </div>

      <div class="daily-actions">

        <button
          class="learn-action primary"
          id="daily-pronounce"
          type="button"
        >
          🔊 Pronounce
        </button>

        <button
          class="learn-action"
          id="daily-favorite"
          type="button"
        >
          ☆ Favorite
        </button>

        <button
          class="learn-action"
          id="daily-learned"
          type="button"
        >
          ✓ Mark as Learned
        </button>

        <button
          class="learn-action"
          id="daily-view"
          type="button"
        >
          View in Dictionary →
        </button>

      </div>

    </div>
  `;

  /* Pronounce */

  document.getElementById("daily-pronounce")?.addEventListener("click", () => {
    speakLearnWord(word.word);
  });

  /* Favorite */

  const favoriteButton = document.getElementById("daily-favorite");

  if (favoriteButton) {
    updateDailyFavoriteButton(favoriteButton, word.word);

    favoriteButton.addEventListener("click", () => {
      toggleDailyFavorite(favoriteButton, word.word);
    });
  }

  /* Learned */

  const learnedButton = document.getElementById("daily-learned");

  if (learnedButton) {
    updateLearnedButton(learnedButton, word.word);

    learnedButton.addEventListener("click", () => {
      toggleLearnedWord(learnedButton, word.word);
    });
  }

  /* Dictionary */

  document.getElementById("daily-view")?.addEventListener("click", () => {
    window.location.href = `dictionary.html?search=${encodeURIComponent(
      word.word,
    )}`;
  });
}

/* =====================================================
   SPEECH
===================================================== */

function speakLearnWord(word) {
  if (!("speechSynthesis" in window)) {
    return;
  }

  speechSynthesis.cancel();

  const speech = new SpeechSynthesisUtterance(word);

  speech.lang = "en-US";
  speech.rate = 0.85;

  speechSynthesis.speak(speech);
}

/* =====================================================
   FAVORITES
===================================================== */

function getLearnFavorites() {
  try {
    const saved = localStorage.getItem(LEARN_FAVORITES_KEY);

    if (!saved) return [];

    const parsed = JSON.parse(saved);

    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveLearnFavorites(favorites) {
  localStorage.setItem(LEARN_FAVORITES_KEY, JSON.stringify(favorites));
}

function isLearnFavorite(word) {
  return getLearnFavorites().some(
    (item) => String(item).toLowerCase() === String(word).toLowerCase(),
  );
}

function updateDailyFavoriteButton(button, word) {
  const favorite = isLearnFavorite(word);

  button.textContent = favorite ? "★ Favorited" : "☆ Favorite";

  button.classList.toggle("is-favorite", favorite);
}

function toggleDailyFavorite(button, word) {
  const favorites = getLearnFavorites();

  const index = favorites.findIndex(
    (item) => String(item).toLowerCase() === String(word).toLowerCase(),
  );

  if (index !== -1) {
    favorites.splice(index, 1);
  } else {
    favorites.push(word);

    completeDailyMission("favorite");
  }

  saveLearnFavorites(favorites);

  updateDailyFavoriteButton(button, word);
}

/* =====================================================
   LEARNED WORDS
===================================================== */

function getLearnedWords() {
  try {
    const saved = localStorage.getItem(LEARNED_WORDS_KEY);

    if (!saved) return [];

    const parsed = JSON.parse(saved);

    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveLearnedWords(words) {
  localStorage.setItem(LEARNED_WORDS_KEY, JSON.stringify(words));
}

function isWordLearned(word) {
  return getLearnedWords().some(
    (item) => String(item).toLowerCase() === String(word).toLowerCase(),
  );
}

function updateLearnedButton(button, word) {
  const learned = isWordLearned(word);

  button.textContent = learned ? "✓ Learned" : "✓ Mark as Learned";

  button.classList.toggle("is-learned", learned);
}

/* =====================================================
   MARK WORD LEARNED
===================================================== */

function toggleLearnedWord(button, word) {
  const learned = getLearnedWords();

  const index = learned.findIndex(
    (item) => String(item).toLowerCase() === String(word).toLowerCase(),
  );

  /* UNLEARN */

  if (index !== -1) {
    learned.splice(index, 1);

    saveLearnedWords(learned);

    updateLearnedButton(button, word);

    updateLearningStats();

    return;
  }

  /* LEARN */

  learned.push(word);

  saveLearnedWords(learned);

  /* IMPORTANT:
     Only count this word once.
  */

  recordTodayLearning(word);

  /* Daily mission */

  completeDailyMission("daily-word");

  updateLearningStreak();

  updateLearningStats();
  updateTodayProgress();

  updateLearnedButton(button, word);

  /* Update mission UI */

  renderDailyMissions();
}

/* =====================================================
   TODAY'S PROGRESS
===================================================== */

function getTodayProgress() {
  const today = getTodayKey();

  try {
    const saved = localStorage.getItem(LEARN_TODAY_KEY);

    if (!saved) {
      return {
        date: today,
        words: [],
      };
    }

    const data = JSON.parse(saved);

    if (!data || data.date !== today) {
      return {
        date: today,
        words: [],
      };
    }

    return {
      date: today,
      words: Array.isArray(data.words) ? data.words : [],
    };
  } catch {
    return {
      date: today,
      words: [],
    };
  }
}

/* =====================================================
   RECORD TODAY'S WORD
===================================================== */

function recordTodayLearning(word) {
  const today = getTodayProgress();

  const exists = today.words.some(
    (item) => String(item).toLowerCase() === String(word).toLowerCase(),
  );

  /* Already counted today */

  if (exists) {
    updateTodayProgress();
    return;
  }

  today.words.push(word);

  localStorage.setItem(LEARN_TODAY_KEY, JSON.stringify(today));

  updateTodayProgress();
}

/* =====================================================
   UPDATE PROGRESS UI
===================================================== */

function updateTodayProgress() {
  const today = getTodayProgress();

  const count = today.words.length;

  const percentage = Math.min(100, (count / DAILY_TARGET) * 100);

  if (progressCountElement) {
    progressCountElement.textContent = count.toLocaleString();
  }

  if (progressBar) {
    progressBar.style.width = `${percentage}%`;

    progressBar.setAttribute(
      "aria-valuenow",
      String(Math.min(count, DAILY_TARGET)),
    );
  }

  /* Keep the HTML progress label synced */

  const label = document.getElementById("today-progress-label");

  if (label) {
    label.textContent = count.toLocaleString();
  }

  /* Completion */

  if (count >= DAILY_TARGET) {
    completeDailyMission("daily-word");
  }
}

/* =====================================================
   RESET TODAY
===================================================== */

if (resetProgressButton) {
  resetProgressButton.addEventListener("click", () => {
    const confirmed = window.confirm("Reset today's learning progress?");

    if (!confirmed) return;

    localStorage.setItem(
      LEARN_TODAY_KEY,
      JSON.stringify({
        date: getTodayKey(),
        words: [],
      }),
    );

    updateTodayProgress();
  });
}

/* =====================================================
   LEARNING STATS
===================================================== */

function updateLearningStats() {
  const learned = getLearnedWords();

  if (learnedCountElement) {
    learnedCountElement.textContent = learned.length.toLocaleString();
  }

  if (streakCountElement) {
    streakCountElement.textContent = getLearningStreak().toLocaleString();
  }
}

/* =====================================================
   STREAK
===================================================== */

function getLearningStreak() {
  try {
    const data = JSON.parse(localStorage.getItem(LEARN_STREAK_KEY));

    if (!data) return 0;

    return Number(data.streak) || 0;
  } catch {
    return 0;
  }
}

function updateLearningStreak() {
  const today = getTodayKey();

  let data;

  try {
    data = JSON.parse(localStorage.getItem(LEARN_STREAK_KEY));
  } catch {
    data = null;
  }

  if (!data) {
    data = {
      lastDate: today,
      streak: 1,
    };
  } else if (data.lastDate === today) {
    return;
  } else {
    const last = new Date(data.lastDate);

    const current = new Date(today);

    const difference = Math.round((current - last) / 86400000);

    if (difference === 1) {
      data.streak += 1;
    } else {
      data.streak = 1;
    }

    data.lastDate = today;
  }

  localStorage.setItem(LEARN_STREAK_KEY, JSON.stringify(data));

  updateLearningStats();
}

/* =====================================================
   RANDOM
===================================================== */

function getRandomLearningWord() {
  if (!learnWords.length) {
    return null;
  }

  return learnWords[Math.floor(Math.random() * learnWords.length)];
}

if (randomLearnButton) {
  randomLearnButton.addEventListener("click", () => {
    const word = getRandomLearningWord();

    if (word) {
      showDailyWord(word);
    }
  });
}

/* =====================================================
   NEXT
===================================================== */

if (nextLearnButton) {
  nextLearnButton.addEventListener("click", () => {
    if (!currentLearningWord) {
      showDailyWord();
      return;
    }

    const index = learnWords.findIndex(
      (item) => item.word === currentLearningWord.word,
    );

    const nextIndex = index === -1 ? 0 : (index + 1) % learnWords.length;

    showDailyWord(learnWords[nextIndex]);
  });
}

/* =====================================================
   DIFFICULTY
===================================================== */

function updateDifficultyCounts() {
  const levels = ["Easy", "Medium", "Hard", "Expert"];

  levels.forEach((level) => {
    const count = learnWords.filter((word) => word.difficulty === level).length;

    const element = document.getElementById(`count-${level.toLowerCase()}`);

    if (element) {
      element.textContent = `${count.toLocaleString()} words`;
    }
  });
}

document.querySelectorAll(".difficulty-card").forEach((card) => {
  card.addEventListener("click", () => {
    const level = card.dataset.level;

    if (!level) return;

    window.location.href = `dictionary.html?difficulty=${encodeURIComponent(
      level,
    )}`;
  });

  card.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      card.click();
    }
  });
});

/* =====================================================
   DAILY MISSIONS
===================================================== */

const DAILY_MISSIONS = {
  "daily-word": 10,
  favorite: 15,
  quiz: 25,
  correct: 30,
};

function getMissionDate() {
  return getTodayKey();
}

function getDailyMissionData() {
  const today = getMissionDate();

  try {
    const saved = localStorage.getItem(DAILY_MISSIONS_KEY);

    if (!saved) {
      return {
        date: today,
        completed: [],
      };
    }

    const data = JSON.parse(saved);

    if (!data || data.date !== today) {
      return {
        date: today,
        completed: [],
      };
    }

    return {
      date: today,
      completed: Array.isArray(data.completed) ? data.completed : [],
    };
  } catch {
    return {
      date: today,
      completed: [],
    };
  }
}

function saveDailyMissionData(data) {
  localStorage.setItem(DAILY_MISSIONS_KEY, JSON.stringify(data));
}

/* =====================================================
   XP
===================================================== */

function addMissionXP(amount) {
  const currentXP = Number(localStorage.getItem(XP_KEY) || 0);

  const newXP = currentXP + amount;

  localStorage.setItem(XP_KEY, String(newXP));

  window.dispatchEvent(
    new CustomEvent("abDictionaryXPUpdated", {
      detail: {
        amount,
        totalXP: newXP,
      },
    }),
  );
}

/* =====================================================
   COMPLETE MISSION
===================================================== */

function completeDailyMission(missionId) {
  if (!DAILY_MISSIONS[missionId]) {
    return false;
  }

  const data = getDailyMissionData();

  if (data.completed.includes(missionId)) {
    return false;
  }

  data.completed.push(missionId);

  saveDailyMissionData(data);

  addMissionXP(DAILY_MISSIONS[missionId]);

  renderDailyMissions();

  return true;
}

/* =====================================================
   MISSION RENDER
===================================================== */

function renderDailyMissions() {
  const list = document.getElementById("daily-missions-list");

  const progressText = document.getElementById("missions-progress-text");

  const progressFill = document.getElementById("missions-progress-fill");

  if (!list) return;

  const data = getDailyMissionData();

  const missionIds = Object.keys(DAILY_MISSIONS);

  const completedCount = missionIds.filter((id) =>
    data.completed.includes(id),
  ).length;

  const total = missionIds.length;

  const percentage = total ? (completedCount / total) * 100 : 0;

  if (progressText) {
    progressText.textContent = `${completedCount} / ${total} completed`;
  }

  if (progressFill) {
    progressFill.style.width = `${percentage}%`;
  }

  missionIds.forEach((id) => {
    const item = list.querySelector(`[data-mission="${id}"]`);

    if (!item) return;

    const completed = data.completed.includes(id);

    item.classList.toggle("completed", completed);

    const status = item.querySelector(".mission-status");

    if (status) {
      status.textContent = completed ? "✓" : "○";
    }
  });
}

/* =====================================================
   GLOBAL MISSION HELPERS
===================================================== */

window.completeQuizMission = function () {
  completeDailyMission("quiz");
};

window.completeCorrectAnswersMission = function () {
  completeDailyMission("correct");
};

/* =====================================================
   START
===================================================== */

loadLearnWords();
updateLearningStreak();
renderDailyMissions();
