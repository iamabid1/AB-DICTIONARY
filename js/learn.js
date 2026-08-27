/* =====================================================
   AB DICTIONARY
   LEARN ENGINE V2
===================================================== */

/* =====================================================
   DATA
===================================================== */

let learnWords = [];

let currentLearningWord = null;

/* =====================================================
   STORAGE KEYS
===================================================== */

const LEARN_FAVORITES_KEY = "abDictionaryFavorites";

const LEARNED_WORDS_KEY = "abDictionaryLearnedWords";

const LEARN_STREAK_KEY = "abDictionaryLearnStreak";

const LEARN_TODAY_KEY = "abDictionaryTodayProgress";

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
   LOAD WORDS
===================================================== */

async function loadLearnWords() {
  try {
    const response = await fetch("data/words.json");

    if (!response.ok) {
      throw new Error("Could not load words.json");
    }

    learnWords = await response.json();

    if (!Array.isArray(learnWords) || learnWords.length === 0) {
      throw new Error("Dictionary is empty.");
    }

    /*
      Keep the order predictable.
    */

    learnWords.sort((a, b) =>
      String(a.word || "").localeCompare(String(b.word || "")),
    );

    showDailyWord();

    updateDifficultyCounts();

    updateLearningStats();

    updateTodayProgress();
  } catch (error) {
    console.error("Learn page loading error:", error);

    if (dailyWordContainer) {
      dailyWordContainer.innerHTML = `
        <p style="color: var(--text-muted);">
          Unable to load today's word.
        </p>
      `;
    }
  }
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
   DATE HELPERS
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
   WORD OF THE DAY
===================================================== */

function getDailyWord() {
  if (!learnWords.length) {
    return null;
  }

  const now = new Date();

  const startOfYear = new Date(now.getFullYear(), 0, 0);

  const difference = now - startOfYear;

  const oneDay = 1000 * 60 * 60 * 24;

  const dayOfYear = Math.floor(difference / oneDay);

  const index = dayOfYear % learnWords.length;

  return learnWords[index] || null;
}

/* =====================================================
   SHOW DAILY WORD
===================================================== */

function showDailyWord(wordOverride = null) {
  if (!learnWords.length || !dailyWordContainer) {
    return;
  }

  const word = wordOverride || getDailyWord();

  if (!word) {
    return;
  }

  currentLearningWord = word;

  /* =================================================
     DATE
  ================================================= */

  const now = new Date();

  const formattedDate = now.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  if (dailyDate) {
    dailyDate.textContent = formattedDate;
  }

  /* =================================================
     WORD CONTENT
  ================================================= */

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
                    (item) => `
                      <span>
                        ${escapeLearnHTML(item)}
                      </span>
                    `,
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
                    (item) => `
                      <span>
                        ${escapeLearnHTML(item)}
                      </span>
                    `,
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

  /* =================================================
     PRONOUNCE
  ================================================= */

  const pronounceButton = document.getElementById("daily-pronounce");

  if (pronounceButton) {
    pronounceButton.addEventListener("click", () => {
      speakLearnWord(word.word);
    });
  }

  /* =================================================
     FAVORITE
  ================================================= */

  const favoriteButton = document.getElementById("daily-favorite");

  if (favoriteButton) {
    updateDailyFavoriteButton(favoriteButton, word.word);

    favoriteButton.addEventListener("click", () => {
      toggleDailyFavorite(favoriteButton, word.word);
    });
  }

  /* =================================================
     LEARNED
  ================================================= */

  const learnedButton = document.getElementById("daily-learned");

  if (learnedButton) {
    updateLearnedButton(learnedButton, word.word);

    learnedButton.addEventListener("click", () => {
      toggleLearnedWord(learnedButton, word.word);
    });
  }

  /* =================================================
     VIEW IN DICTIONARY
  ================================================= */

  const viewButton = document.getElementById("daily-view");

  if (viewButton) {
    viewButton.addEventListener("click", () => {
      window.location.href = `dictionary.html?search=${encodeURIComponent(
        word.word,
      )}`;
    });
  }
}

/* =====================================================
   PRONUNCIATION
===================================================== */

function speakLearnWord(word) {
  if (!("speechSynthesis" in window)) {
    return;
  }

  window.speechSynthesis.cancel();

  const speech = new SpeechSynthesisUtterance(word);

  speech.lang = "en-US";

  speech.rate = 0.85;

  window.speechSynthesis.speak(speech);
}

/* =====================================================
   FAVORITES
===================================================== */

function getLearnFavorites() {
  try {
    const saved = localStorage.getItem(LEARN_FAVORITES_KEY);

    if (!saved) {
      return [];
    }

    const parsed = JSON.parse(saved);

    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Could not load favorites:", error);

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
  const saved = isLearnFavorite(word);

  button.textContent = saved ? "★ Favorited" : "☆ Favorite";

  button.classList.toggle("is-favorite", saved);
}

function toggleDailyFavorite(button, word) {
  let favorites = getLearnFavorites();

  const index = favorites.findIndex(
    (item) => String(item).toLowerCase() === String(word).toLowerCase(),
  );

  if (index !== -1) {
    favorites.splice(index, 1);
  } else {
    favorites.push(word);
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

    if (!saved) {
      return [];
    }

    const parsed = JSON.parse(saved);

    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Could not load learned words:", error);

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

function toggleLearnedWord(button, word) {
  let learned = getLearnedWords();

  const index = learned.findIndex(
    (item) => String(item).toLowerCase() === String(word).toLowerCase(),
  );

  if (index !== -1) {
    learned.splice(index, 1);
  } else {
    learned.push(word);

    recordTodayLearning();
  }

  saveLearnedWords(learned);

  updateLearnedButton(button, word);

  updateLearningStats();

  updateTodayProgress();
}

/* =====================================================
   LEARNING STATS
===================================================== */

function updateLearningStats() {
  const learned = getLearnedWords();

  if (learnedCountElement) {
    learnedCountElement.textContent = learned.length.toLocaleString();
  }

  const streak = getLearningStreak();

  if (streakCountElement) {
    streakCountElement.textContent = streak.toLocaleString();
  }
}

/* =====================================================
   TODAY'S PROGRESS
===================================================== */

function getTodayProgress() {
  try {
    const saved = localStorage.getItem(LEARN_TODAY_KEY);

    if (!saved) {
      return {
        date: getTodayKey(),
        count: 0,
      };
    }

    const parsed = JSON.parse(saved);

    if (!parsed || parsed.date !== getTodayKey()) {
      return {
        date: getTodayKey(),
        count: 0,
      };
    }

    return {
      date: parsed.date,
      count: Number(parsed.count) || 0,
    };
  } catch {
    return {
      date: getTodayKey(),
      count: 0,
    };
  }
}

function recordTodayLearning() {
  const today = getTodayProgress();

  today.count += 1;

  localStorage.setItem(LEARN_TODAY_KEY, JSON.stringify(today));

  updateTodayProgress();
}

function updateTodayProgress() {
  const today = getTodayProgress();

  if (progressCountElement) {
    progressCountElement.textContent = today.count.toLocaleString();
  }

  /*
    Default daily target = 5.
  */

  const target = 5;

  const percentage = Math.min(100, (today.count / target) * 100);

  if (progressBar) {
    progressBar.style.width = `${percentage}%`;

    progressBar.setAttribute("aria-valuenow", String(today.count));
  }
}

/* =====================================================
   RESET TODAY'S PROGRESS
===================================================== */

if (resetProgressButton) {
  resetProgressButton.addEventListener("click", () => {
    const confirmed = window.confirm("Reset today's learning progress?");

    if (!confirmed) {
      return;
    }

    localStorage.setItem(
      LEARN_TODAY_KEY,
      JSON.stringify({
        date: getTodayKey(),
        count: 0,
      }),
    );

    updateTodayProgress();
  });
}

/* =====================================================
   LEARNING STREAK
===================================================== */

function getLearningStreak() {
  try {
    const saved = localStorage.getItem(LEARN_STREAK_KEY);

    if (!saved) {
      return 0;
    }

    const parsed = JSON.parse(saved);

    return Number(parsed.streak) || 0;
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

    const difference = Math.round((current - last) / (1000 * 60 * 60 * 24));

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
   RANDOM WORD
===================================================== */

function getRandomLearningWord() {
  if (!learnWords.length) {
    return null;
  }

  const index = Math.floor(Math.random() * learnWords.length);

  return learnWords[index];
}

function showRandomLearningWord() {
  const word = getRandomLearningWord();

  if (!word) {
    return;
  }

  showDailyWord(word);
}

if (randomLearnButton) {
  randomLearnButton.addEventListener("click", showRandomLearningWord);
}

/* =====================================================
   NEXT WORD
===================================================== */

if (nextLearnButton) {
  nextLearnButton.addEventListener("click", () => {
    const currentIndex = learnWords.findIndex(
      (item) => item.word === currentLearningWord?.word,
    );

    if (currentIndex === -1) {
      showRandomLearningWord();

      return;
    }

    const nextIndex = (currentIndex + 1) % learnWords.length;

    showDailyWord(learnWords[nextIndex]);
  });
}

/* =====================================================
   DIFFICULTY COUNTS
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

/* =====================================================
   DIFFICULTY NAVIGATION
===================================================== */

document.querySelectorAll(".difficulty-card").forEach((card) => {
  card.addEventListener("click", () => {
    const level = card.dataset.level;

    if (!level) {
      return;
    }

    window.location.href = `dictionary.html?difficulty=${encodeURIComponent(
      level,
    )}`;
  });
});

/* =====================================================
   START
===================================================== */

loadLearnWords();

/*
  Update streak when the Learn page
  is actively used.
*/

updateLearningStreak();
