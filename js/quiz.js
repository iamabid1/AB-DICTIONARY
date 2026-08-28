/* =====================================================
   AB DICTIONARY
   QUIZ ENGINE V3
===================================================== */

"use strict";

/* =====================================================
   CONFIG
===================================================== */

const TOTAL_QUESTIONS = 10;
const ANSWERS_PER_QUESTION = 4;

const STORAGE = {
  BEST_SCORE: "abDictionaryQuizBestScore",
  BEST_XP: "abDictionaryQuizBestXP",
  TOTAL_XP: "abDictionaryQuizTotalXP",
  STREAK: "abDictionaryQuizStreak",
  LAST_DATE: "abDictionaryLastQuizDate",
  HISTORY: "abDictionaryQuizHistory",
};

/*
   XP required to reach each level.
*/
const XP_LEVELS = [0, 100, 250, 500, 850, 1300, 1850, 2500, 3300, 4250, 5500];

const LEVEL_NAMES = [
  "Beginner",
  "Learner",
  "Explorer",
  "Word Builder",
  "Vocabulary Student",
  "Vocabulary Builder",
  "Word Master",
  "Advanced Learner",
  "Vocabulary Expert",
  "Dictionary Master",
  "Grand Word Master",
];

const DIFFICULTY_XP = {
  all: 10,
  Easy: 10,
  Medium: 15,
  Hard: 20,
  Expert: 30,
};

/* =====================================================
   STATE
===================================================== */

let quizWords = [];
let quizQuestions = [];

let currentQuestion = 0;
let quizCorrect = 0;
let quizWrong = 0;

let selectedDifficulty = "all";

let missedWords = [];
let answeredCurrentQuestion = false;
let quizFinished = false;

/* =====================================================
   DOM
===================================================== */

const quizSetup = document.getElementById("quiz-setup");
const quizContainer = document.getElementById("quiz-container");
const quizResult = document.getElementById("quiz-result");

const startQuizButton = document.getElementById("start-quiz");
const restartQuizButton = document.getElementById("restart-quiz");

const questionElement = document.getElementById("quiz-question");
const questionSubtitle = document.getElementById("quiz-question-subtitle");

const answersContainer = document.getElementById("quiz-answers");

const progressText = document.getElementById("quiz-progress-text");
const progressBar = document.getElementById("quiz-progress-bar");

const scoreElement = document.getElementById("quiz-score");

const feedback = document.getElementById("quiz-feedback");
const feedbackTitle = document.getElementById("quiz-feedback-title");
const feedbackText = document.getElementById("quiz-feedback-text");

const nextButton = document.getElementById("next-question");

const resultScore = document.getElementById("result-score");
const resultCorrect = document.getElementById("result-correct");
const resultWrong = document.getElementById("result-wrong");
const resultBest = document.getElementById("result-best");
const resultMessage = document.getElementById("result-message");

const xpTotalElement = document.getElementById("quiz-xp-total");
const xpBestElement = document.getElementById("quiz-xp-best");
const xpStreakElement = document.getElementById("quiz-xp-streak");

const xpLevelElement = document.getElementById("quiz-xp-level");
const xpProgressElement = document.getElementById("quiz-xp-progress");
const xpNextElement = document.getElementById("quiz-xp-next");

/* =====================================================
   HELPERS
===================================================== */

function shuffle(array) {
  const copy = [...array];

  for (let i = copy.length - 1; i > 0; i--) {
    const random = Math.floor(Math.random() * (i + 1));

    [copy[i], copy[random]] = [copy[random], copy[i]];
  }

  return copy;
}

function normalize(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase();
}

function escapeHTML(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

/* =====================================================
   STORAGE HELPERS
===================================================== */

function getNumber(key) {
  return Number(localStorage.getItem(key) || 0);
}

function setNumber(key, value) {
  localStorage.setItem(key, String(value));
}

/* =====================================================
   LOAD DICTIONARY
===================================================== */

async function loadQuizWords() {
  try {
    const response = await fetch("data/words.json");

    if (!response.ok) {
      throw new Error("Could not load words.json");
    }

    const data = await response.json();

    if (!Array.isArray(data)) {
      throw new Error("words.json must contain an array.");
    }

    quizWords = data.filter((word) => {
      return (
        word &&
        typeof word.word === "string" &&
        word.word.trim() &&
        typeof word.meaning === "string" &&
        word.meaning.trim() &&
        typeof word.bangla === "string" &&
        word.bangla.trim()
      );
    });

    if (quizWords.length < ANSWERS_PER_QUESTION) {
      throw new Error("Not enough dictionary words.");
    }

    updateDifficultyCounts();

    console.log(`AB Dictionary Quiz loaded ${quizWords.length} valid words.`);
  } catch (error) {
    console.error("Quiz loading error:", error);

    if (quizSetup) {
      quizSetup.innerHTML = `
        <div class="empty-state">
          <h3>Unable to load quiz</h3>
          <p>
            Make sure <strong>data/words.json</strong> exists
            and contains valid dictionary data.
          </p>
        </div>
      `;
    }
  }
}

/* =====================================================
   DIFFICULTY
===================================================== */

function setupDifficultyButtons() {
  const options = document.querySelectorAll(".quiz-option");

  options.forEach((option) => {
    option.addEventListener("click", () => {
      options.forEach((item) => {
        item.classList.remove("active");
      });

      option.classList.add("active");

      selectedDifficulty = option.dataset.difficulty || "all";
    });
  });
}

function updateDifficultyCounts() {
  const counts = {
    all: quizWords.length,
    Easy: quizWords.filter((word) => word.difficulty === "Easy").length,
    Medium: quizWords.filter((word) => word.difficulty === "Medium").length,
    Hard: quizWords.filter((word) => word.difficulty === "Hard").length,
    Expert: quizWords.filter((word) => word.difficulty === "Expert").length,
  };

  Object.entries(counts).forEach(([level, count]) => {
    const option = document.querySelector(
      `.quiz-option[data-difficulty="${level}"]`,
    );

    if (!option) return;

    const span = option.querySelector("span");

    if (span) {
      span.textContent =
        level === "all"
          ? `${count.toLocaleString()} words`
          : `${count.toLocaleString()} words`;
    }
  });
}

/* =====================================================
   START QUIZ
===================================================== */

function startQuiz() {
  let availableWords = [...quizWords];

  if (selectedDifficulty !== "all") {
    availableWords = availableWords.filter(
      (word) => word.difficulty === selectedDifficulty,
    );
  }

  if (availableWords.length < ANSWERS_PER_QUESTION) {
    alert("There are not enough words for this difficulty level.");

    return;
  }

  currentQuestion = 0;
  quizCorrect = 0;
  quizWrong = 0;

  missedWords = [];
  answeredCurrentQuestion = false;
  quizFinished = false;

  quizQuestions = createQuestions(availableWords);

  if (quizSetup) {
    quizSetup.style.display = "none";
  }

  if (quizResult) {
    quizResult.classList.remove("active");
  }

  if (quizContainer) {
    quizContainer.classList.add("active");
  }

  showQuestion();

  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
}

/* =====================================================
   CREATE QUESTIONS
===================================================== */

function createQuestions(words) {
  const selectedWords = shuffle(words).slice(
    0,
    Math.min(TOTAL_QUESTIONS, words.length),
  );

  return selectedWords.map((word) => {
    const types = ["meaning", "bangla"];

    if (typeof word.example === "string" && word.example.trim()) {
      types.push("example");
    }

    const type = types[Math.floor(Math.random() * types.length)];

    return {
      word,
      type,
    };
  });
}

/* =====================================================
   QUESTION TEXT
===================================================== */

function getAnswerText(word, type) {
  if (type === "meaning") {
    return word.meaning;
  }

  if (type === "bangla") {
    return word.bangla;
  }

  return word.example;
}

function getQuestionSubtitle(type) {
  if (type === "meaning") {
    return "Which option is the correct English meaning?";
  }

  if (type === "bangla") {
    return "Which option is the correct Bangla meaning?";
  }

  return "Which option best matches this example?";
}

/* =====================================================
   GENERATE ANSWERS
===================================================== */

function generateAnswers(correctWord, type) {
  const correctAnswer = getAnswerText(correctWord, type);

  if (!correctAnswer) {
    return [];
  }

  const candidates = quizWords.filter((word) => {
    if (normalize(word.word) === normalize(correctWord.word)) {
      return false;
    }

    if (type === "example") {
      return typeof word.example === "string" && word.example.trim();
    }

    return true;
  });

  const used = new Set([normalize(correctAnswer)]);

  const wrongAnswers = [];

  for (const word of shuffle(candidates)) {
    const text = getAnswerText(word, type);

    if (!text) continue;

    const normalized = normalize(text);

    if (used.has(normalized)) {
      continue;
    }

    used.add(normalized);

    wrongAnswers.push({
      text,
      correct: false,
    });

    if (wrongAnswers.length >= ANSWERS_PER_QUESTION - 1) {
      break;
    }
  }

  return shuffle([
    {
      text: correctAnswer,
      correct: true,
    },
    ...wrongAnswers,
  ]);
}

/* =====================================================
   SHOW QUESTION
===================================================== */

function showQuestion() {
  if (quizFinished || currentQuestion >= quizQuestions.length) {
    finishQuiz();
    return;
  }

  const current = quizQuestions[currentQuestion];

  if (!current || !current.word) {
    finishQuiz();
    return;
  }

  answeredCurrentQuestion = false;

  const word = current.word;

  const answers = generateAnswers(word, current.type);

  if (answers.length < 2) {
    currentQuestion++;

    showQuestion();

    return;
  }

  if (progressText) {
    progressText.textContent = `Question ${currentQuestion + 1} of ${quizQuestions.length}`;
  }

  if (progressBar) {
    const progress = (currentQuestion / quizQuestions.length) * 100;

    progressBar.style.width = `${progress}%`;
  }

  if (scoreElement) {
    scoreElement.textContent = `Score: ${quizCorrect}`;
  }

  if (questionElement) {
    questionElement.textContent = word.word;
  }

  if (questionSubtitle) {
    questionSubtitle.textContent = getQuestionSubtitle(current.type);
  }

  if (answersContainer) {
    answersContainer.innerHTML = "";

    answers.forEach((answer, index) => {
      const button = document.createElement("button");

      button.type = "button";
      button.className = "quiz-answer";

      button.textContent = answer.text;

      button.dataset.correct = String(answer.correct);

      button.dataset.index = String(index);

      button.setAttribute("aria-label", `Answer ${index + 1}: ${answer.text}`);

      button.addEventListener("click", () => {
        handleAnswer(button, answer);
      });

      answersContainer.appendChild(button);
    });
  }

  if (feedback) {
    feedback.classList.remove("show");
  }

  if (nextButton) {
    nextButton.classList.add("is-hidden");
    nextButton.textContent =
      currentQuestion === quizQuestions.length - 1
        ? "Finish Quiz →"
        : "Next Question →";
  }
}

/* =====================================================
   HANDLE ANSWER
===================================================== */

function handleAnswer(clickedButton, answer) {
  if (answeredCurrentQuestion) {
    return;
  }

  answeredCurrentQuestion = true;

  const buttons = document.querySelectorAll(".quiz-answer");

  buttons.forEach((button) => {
    button.disabled = true;

    if (button.dataset.correct === "true") {
      button.classList.add("correct");
    }
  });

  const current = quizQuestions[currentQuestion];

  const word = current.word;

  if (answer.correct) {
    quizCorrect++;

    clickedButton.classList.add("correct");

    if (feedbackTitle) {
      feedbackTitle.textContent = "✓ Correct!";
    }

    if (feedbackText) {
      feedbackText.textContent = `"${word.word}" was correct.`;
    }
  } else {
    quizWrong++;

    missedWords.push(word);

    clickedButton.classList.add("wrong");

    if (feedbackTitle) {
      feedbackTitle.textContent = "✕ Not quite.";
    }

    if (feedbackText) {
      feedbackText.textContent = `Correct answer: ${getAnswerText(
        word,
        current.type,
      )}`;
    }
  }

  if (feedback) {
    feedback.classList.add("show");
  }

  if (scoreElement) {
    scoreElement.textContent = `Score: ${quizCorrect}`;
  }

  if (nextButton) {
    nextButton.classList.remove("is-hidden");

    nextButton.textContent =
      currentQuestion === quizQuestions.length - 1
        ? "Finish Quiz →"
        : "Next Question →";
  }
}

/* =====================================================
   NEXT
===================================================== */

function nextQuestion() {
  if (!answeredCurrentQuestion) {
    return;
  }

  currentQuestion++;

  showQuestion();
}

/* =====================================================
   XP SYSTEM
===================================================== */

function getTotalXP() {
  return getNumber(STORAGE.TOTAL_XP);
}

function getLevel(xp) {
  let level = 1;

  for (let i = 0; i < XP_LEVELS.length; i++) {
    if (xp >= XP_LEVELS[i]) {
      level = i + 1;
    } else {
      break;
    }
  }

  return level;
}

function getLevelData(xp) {
  const level = getLevel(xp);

  if (level >= XP_LEVELS.length) {
    return {
      level,
      name: LEVEL_NAMES[level - 1],
      progress: 100,
      currentXP: xp,
      requiredXP: 0,
      nextXP: xp,
      max: true,
    };
  }

  const currentLevelXP = XP_LEVELS[level - 1];

  const nextLevelXP = XP_LEVELS[level];

  const requiredXP = nextLevelXP - currentLevelXP;

  const currentXP = xp - currentLevelXP;

  return {
    level,
    name: LEVEL_NAMES[level - 1],
    progress: Math.min(100, Math.max(0, (currentXP / requiredXP) * 100)),
    currentXP,
    requiredXP,
    nextXP: nextLevelXP,
    max: false,
  };
}

function calculateQuizXP() {
  const baseXP =
    quizCorrect * (DIFFICULTY_XP[selectedDifficulty] || DIFFICULTY_XP.all);

  let bonusXP = 0;

  /* Perfect bonus */
  if (quizCorrect === quizQuestions.length && quizQuestions.length > 0) {
    bonusXP += 50;
  }

  /* Accuracy bonus */
  const percentage =
    quizQuestions.length > 0 ? (quizCorrect / quizQuestions.length) * 100 : 0;

  if (percentage >= 80) {
    bonusXP += 20;
  }

  /* Streak bonus */
  const currentStreak = getNumber(STORAGE.STREAK);

  if (currentStreak >= 3) {
    bonusXP += Math.min(currentStreak * 5, 50);
  }

  return baseXP + bonusXP;
}

/* =====================================================
   SAVE XP
===================================================== */

function saveXP(xp) {
  const oldXP = getTotalXP();

  const newXP = oldXP + xp;

  setNumber(STORAGE.TOTAL_XP, newXP);

  const oldBest = getNumber(STORAGE.BEST_XP);

  setNumber(STORAGE.BEST_XP, Math.max(oldBest, xp));

  const oldLevel = getLevel(oldXP);
  const newLevel = getLevel(newXP);

  if (newLevel > oldLevel) {
    showLevelUp(newLevel);
  }

  updateXPUI();

  return {
    oldXP,
    newXP,
    bestXP: Math.max(oldBest, xp),
  };
}

/* =====================================================
   XP UI
===================================================== */

function updateXPUI() {
  const xp = getTotalXP();

  const data = getLevelData(xp);

  if (xpTotalElement) {
    xpTotalElement.textContent = xp.toLocaleString();
  }

  if (xpBestElement) {
    xpBestElement.textContent = getNumber(STORAGE.BEST_XP).toLocaleString();
  }

  if (xpStreakElement) {
    xpStreakElement.textContent = getNumber(STORAGE.STREAK);
  }

  if (xpLevelElement) {
    xpLevelElement.textContent = `Level ${data.level} • ${data.name}`;
  }

  if (xpProgressElement) {
    xpProgressElement.style.width = `${data.progress}%`;
  }

  if (xpNextElement) {
    if (data.max) {
      xpNextElement.textContent = "MAX LEVEL";
    } else {
      xpNextElement.textContent = `${data.nextXP - xp} XP until next level`;
    }
  }
}

/* =====================================================
   LEVEL UP
===================================================== */

function showLevelUp(level) {
  const existing = document.querySelector(".xp-level-up");

  if (existing) {
    existing.remove();
  }

  const message = document.createElement("div");

  message.className = "xp-level-up";

  message.innerHTML = `
    <div class="xp-level-up-inner">
      <span class="xp-level-up-icon">🏆</span>

      <strong>LEVEL UP!</strong>

      <span>
        You reached Level ${level}
      </span>

      <small>
        ${escapeHTML(LEVEL_NAMES[level - 1] || "Grand Word Master")}
      </small>
    </div>
  `;

  document.body.appendChild(message);

  requestAnimationFrame(() => {
    message.classList.add("show");
  });

  setTimeout(() => {
    message.classList.remove("show");

    setTimeout(() => {
      message.remove();
    }, 400);
  }, 3000);
}

/* =====================================================
   STREAK
===================================================== */

function getDateString(date = new Date()) {
  const year = date.getFullYear();

  const month = String(date.getMonth() + 1).padStart(2, "0");

  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getYesterday() {
  const date = new Date();

  date.setDate(date.getDate() - 1);

  return getDateString(date);
}

function updateStreak() {
  const today = getDateString();

  const yesterday = getYesterday();

  const lastDate = localStorage.getItem(STORAGE.LAST_DATE);

  let streak = getNumber(STORAGE.STREAK);

  if (lastDate === today) {
    return streak;
  }

  if (lastDate === yesterday) {
    streak++;
  } else {
    streak = 1;
  }

  setNumber(STORAGE.STREAK, streak);

  localStorage.setItem(STORAGE.LAST_DATE, today);

  return streak;
}

/* =====================================================
   QUIZ HISTORY
===================================================== */

function saveQuizHistory(xp, percentage) {
  let history = [];

  try {
    history = JSON.parse(localStorage.getItem(STORAGE.HISTORY) || "[]");

    if (!Array.isArray(history)) {
      history = [];
    }
  } catch {
    history = [];
  }

  history.unshift({
    date: new Date().toISOString(),
    difficulty: selectedDifficulty,
    total: quizQuestions.length,
    correct: quizCorrect,
    wrong: quizWrong,
    percentage,
    xp,
  });

  /*
     Keep the latest 50 quizzes.
  */
  history = history.slice(0, 50);

  localStorage.setItem(STORAGE.HISTORY, JSON.stringify(history));
}

/* =====================================================
   FINISH QUIZ
===================================================== */

function finishQuiz() {
  if (quizFinished) {
    return;
  }

  quizFinished = true;

  if (quizContainer) {
    quizContainer.classList.remove("active");
  }

  if (quizResult) {
    quizResult.classList.add("active");
  }

  const total = quizQuestions.length;

  const percentage = total > 0 ? Math.round((quizCorrect / total) * 100) : 0;

  const earnedXP = calculateQuizXP();

  const streak = updateStreak();

  const xpData = saveXP(earnedXP);

  saveQuizHistory(earnedXP, percentage);

  /* Best score */

  const oldBest = getNumber(STORAGE.BEST_SCORE);

  const best = Math.max(oldBest, percentage);

  setNumber(STORAGE.BEST_SCORE, best);

  /* UI */

  if (resultScore) {
    resultScore.textContent = `${percentage}%`;
  }

  if (resultCorrect) {
    resultCorrect.textContent = quizCorrect;
  }

  if (resultWrong) {
    resultWrong.textContent = quizWrong;
  }

  if (resultBest) {
    resultBest.textContent = `${best}%`;
  }

  if (progressBar) {
    progressBar.style.width = "100%";
  }

  if (resultMessage) {
    resultMessage.textContent = getResultMessage(percentage, earnedXP, streak);
  }

  addResultExtras(earnedXP, xpData.newXP, xpData.bestXP, streak);

  updateXPUI();

  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
}

/* =====================================================
   RESULT MESSAGE
===================================================== */

function getResultMessage(percentage, xp, streak) {
  if (percentage === 100) {
    return `Perfect score. +${xp} XP earned. 🔥 ${streak} quiz streak.`;
  }

  if (percentage >= 80) {
    return `Excellent work. +${xp} XP earned. 🔥 ${streak} quiz streak.`;
  }

  if (percentage >= 60) {
    return `Good job. +${xp} XP earned. Keep building your vocabulary.`;
  }

  if (percentage >= 40) {
    return `You're getting there. +${xp} XP earned. Review your missed words and try again.`;
  }

  return `Keep learning. +${xp} XP earned. Every attempt helps you improve.`;
}

/* =====================================================
   RESULT EXTRAS
===================================================== */

function addResultExtras(earnedXP, totalXP, bestXP, streak) {
  if (!quizResult) {
    return;
  }

  let extras = document.getElementById("quiz-result-extras");

  if (!extras) {
    extras = document.createElement("div");

    extras.id = "quiz-result-extras";

    extras.style.marginTop = "18px";

    extras.style.display = "grid";

    extras.style.gridTemplateColumns = "repeat(2, 1fr)";

    extras.style.gap = "10px";

    const restart = document.getElementById("restart-quiz");

    if (restart) {
      quizResult.insertBefore(extras, restart);
    } else {
      quizResult.appendChild(extras);
    }
  }

  extras.innerHTML = `
    ${createResultBox("XP EARNED", `+${earnedXP} XP`)}

    ${createResultBox("QUIZ STREAK", `🔥 ${streak}`)}

    ${createResultBox("TOTAL XP", totalXP.toLocaleString())}

    ${createResultBox("BEST XP", bestXP.toLocaleString())}
  `;

  addReviewButton();
}

function createResultBox(label, value) {
  return `
    <div
      style="
        padding:14px;
        border:1px solid var(--border);
        border-radius:10px;
        background:var(--surface-2);
      "
    >
      <span
        style="
          display:block;
          color:var(--text-muted);
          font-size:9px;
          margin-bottom:6px;
        "
      >
        ${escapeHTML(label)}
      </span>

      <strong>
        ${escapeHTML(value)}
      </strong>
    </div>
  `;
}

/* =====================================================
   MISSED WORDS BUTTON
===================================================== */

function addReviewButton() {
  let button = document.getElementById("review-missed-words");

  if (button) {
    button.remove();
  }

  if (!missedWords.length) {
    return;
  }

  button = document.createElement("button");

  button.id = "review-missed-words";

  button.type = "button";

  button.className = "back-dictionary-button";

  button.textContent = `Review ${missedWords.length} Missed Word${
    missedWords.length === 1 ? "" : "s"
  } →`;

  button.addEventListener("click", showMissedWords);

  const restart = document.getElementById("restart-quiz");

  if (restart) {
    quizResult.insertBefore(button, restart);
  } else {
    quizResult.appendChild(button);
  }
}

/* =====================================================
   MISSED WORDS
===================================================== */

function showMissedWords() {
  if (!missedWords.length) {
    return;
  }

  if (quizResult) {
    quizResult.classList.remove("active");
  }

  if (quizContainer) {
    quizContainer.classList.remove("active");
  }

  if (!quizSetup) {
    return;
  }

  quizSetup.style.display = "block";

  const wordsHTML = missedWords
    .map((word) => {
      return `
          <div
            style="
              padding:17px;
              border:1px solid var(--border);
              border-radius:12px;
              background:var(--surface-2);
            "
          >
            <strong
              style="
                display:block;
                font-size:18px;
                margin-bottom:6px;
              "
            >
              ${escapeHTML(word.word)}
            </strong>

            ${
              word.pronunciation
                ? `
                  <span
                    style="
                      display:block;
                      color:var(--text-muted);
                      font-size:11px;
                      margin-bottom:8px;
                    "
                  >
                    ${escapeHTML(word.pronunciation)}
                  </span>
                `
                : ""
            }

            <p
              style="
                color:var(--text-secondary);
                font-size:12px;
                line-height:1.6;
                margin-bottom:6px;
              "
            >
              ${escapeHTML(word.meaning)}
            </p>

            <p
              style="
                font-size:14px;
                margin:0;
              "
            >
              ${escapeHTML(word.bangla)}
            </p>
          </div>
        `;
    })
    .join("");

  quizSetup.innerHTML = `
    <div style="margin-bottom:22px;">
      <span class="section-label">
        REVIEW
      </span>

      <h2 style="margin-top:10px;">
        Words you missed
      </h2>

      <p
        style="
          color:var(--text-secondary);
          font-size:13px;
          line-height:1.7;
        "
      >
        Review these words before your next attempt.
      </p>
    </div>

    <div
      style="
        display:grid;
        gap:10px;
      "
    >
      ${wordsHTML}
    </div>

    <button
      class="start-quiz-button"
      id="review-back-button"
      type="button"
      style="margin-top:20px;"
    >
      Back to Quiz →
    </button>
  `;

  const back = document.getElementById("review-back-button");

  if (back) {
    back.addEventListener("click", restoreQuizSetup);
  }

  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
}

/* =====================================================
   RESTORE SETUP
===================================================== */

function restoreQuizSetup() {
  window.location.reload();
}

/* =====================================================
   RESTART
===================================================== */

function restartQuiz() {
  if (quizResult) {
    quizResult.classList.remove("active");
  }

  if (quizContainer) {
    quizContainer.classList.remove("active");
  }

  if (quizSetup) {
    quizSetup.style.display = "block";
  }

  quizFinished = false;

  updateXPUI();

  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
}

/* =====================================================
   KEYBOARD
===================================================== */

function setupKeyboardControls() {
  document.addEventListener("keydown", (event) => {
    if (!quizContainer || !quizContainer.classList.contains("active")) {
      return;
    }

    const answers = document.querySelectorAll(".quiz-answer:not(:disabled)");

    if (!answeredCurrentQuestion && answers.length) {
      const map = {
        1: 0,
        2: 1,
        3: 2,
        4: 3,
      };

      if (Object.prototype.hasOwnProperty.call(map, event.key)) {
        const button = answers[map[event.key]];

        if (button) {
          button.click();
        }
      }
    }

    if (
      event.key === "Enter" &&
      answeredCurrentQuestion &&
      nextButton &&
      !nextButton.classList.contains("is-hidden")
    ) {
      nextButton.click();
    }
  });
}

/* =====================================================
   INIT
===================================================== */

document.addEventListener("DOMContentLoaded", () => {
  setupDifficultyButtons();
  setupKeyboardControls();

  if (startQuizButton) {
    startQuizButton.addEventListener("click", startQuiz);
  }

  if (nextButton) {
    nextButton.addEventListener("click", nextQuestion);
  }

  if (restartQuizButton) {
    restartQuizButton.addEventListener("click", restartQuiz);
  }

  updateXPUI();
  loadQuizWords();
});
