/* =====================================================
   AB DICTIONARY
   QUIZ ENGINE V2
===================================================== */

/* =====================================================
   DATA
===================================================== */

let quizWords = [];

let quizQuestions = [];

let currentQuestion = 0;

let quizScore = 0;

let quizCorrect = 0;

let quizWrong = 0;

let selectedDifficulty = "all";

let missedWords = [];

let answeredCurrentQuestion = false;

/* =====================================================
   SETTINGS
===================================================== */

const TOTAL_QUESTIONS = 10;

const ANSWERS_PER_QUESTION = 4;

const BEST_SCORE_KEY = "abDictionaryQuizBestScore";

const BEST_XP_KEY = "abDictionaryQuizBestXP";

const TOTAL_XP_KEY = "abDictionaryQuizTotalXP";

const QUIZ_STREAK_KEY = "abDictionaryQuizStreak";

const LAST_QUIZ_DATE_KEY = "abDictionaryLastQuizDate";

/* =====================================================
   ELEMENTS
===================================================== */

const quizSetup = document.getElementById("quiz-setup");

const quizContainer = document.getElementById("quiz-container");

const quizResult = document.getElementById("quiz-result");

const startQuizButton = document.getElementById("start-quiz");

const restartQuizButton = document.getElementById("restart-quiz");

const difficultyOptions = document.querySelectorAll(".quiz-option");

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

/* =====================================================
   LOAD WORDS
===================================================== */

async function loadQuizWords() {
  try {
    const response = await fetch("data/words.json");

    if (!response.ok) {
      throw new Error("Could not load words.json");
    }

    const data = await response.json();

    if (!Array.isArray(data)) {
      throw new Error("Dictionary data is not an array.");
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
      throw new Error("Not enough valid dictionary words.");
    }

    console.log(`AB Dictionary Quiz loaded ${quizWords.length} words.`);

    updateQuizSetupStats();
  } catch (error) {
    console.error("Quiz loading error:", error);

    if (quizSetup) {
      quizSetup.innerHTML = `
        <div class="empty-state">
          <h3>Unable to load quiz</h3>

          <p>
            Make sure data/words.json exists
            and contains valid dictionary data.
          </p>
        </div>
      `;
    }
  }
}

/* =====================================================
   HTML ESCAPE
===================================================== */

function escapeQuizHTML(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

/* =====================================================
   SHUFFLE
===================================================== */

function shuffle(array) {
  const copy = [...array];

  for (let i = copy.length - 1; i > 0; i--) {
    const randomIndex = Math.floor(Math.random() * (i + 1));

    [copy[i], copy[randomIndex]] = [copy[randomIndex], copy[i]];
  }

  return copy;
}

/* =====================================================
   DIFFICULTY
===================================================== */

difficultyOptions.forEach((option) => {
  option.addEventListener("click", () => {
    difficultyOptions.forEach((item) => {
      item.classList.remove("active");
    });

    option.classList.add("active");

    selectedDifficulty = option.dataset.difficulty || "all";
  });
});

/* =====================================================
   SETUP INFORMATION
===================================================== */

function updateQuizSetupStats() {
  const stats = {
    all: quizWords.length,
    Easy: quizWords.filter((word) => word.difficulty === "Easy").length,
    Medium: quizWords.filter((word) => word.difficulty === "Medium").length,
    Hard: quizWords.filter((word) => word.difficulty === "Hard").length,
    Expert: quizWords.filter((word) => word.difficulty === "Expert").length,
  };

  Object.entries(stats).forEach(([level, count]) => {
    const element = document.querySelector(`[data-difficulty="${level}"]`);

    if (!element) {
      return;
    }

    const span = element.querySelector("span");

    if (!span) {
      return;
    }

    if (level === "all") {
      span.textContent = `${count.toLocaleString()} words`;
    } else {
      span.textContent = `${count.toLocaleString()} words`;
    }
  });
}

/* =====================================================
   START QUIZ
===================================================== */

if (startQuizButton) {
  startQuizButton.addEventListener("click", startQuiz);
}

function startQuiz() {
  let availableWords = [...quizWords];

  /* Filter difficulty */

  if (selectedDifficulty !== "all") {
    availableWords = availableWords.filter(
      (word) => word.difficulty === selectedDifficulty,
    );
  }

  if (availableWords.length < ANSWERS_PER_QUESTION) {
    alert("There are not enough words for this quiz level.");

    return;
  }

  /* Reset */

  currentQuestion = 0;

  quizScore = 0;

  quizCorrect = 0;

  quizWrong = 0;

  missedWords = [];

  answeredCurrentQuestion = false;

  /* Create fresh questions */

  quizQuestions = createQuestions(availableWords);

  /* Switch screens */

  if (quizSetup) {
    quizSetup.style.display = "none";
  }

  if (quizResult) {
    quizResult.classList.remove("active");
  }

  if (quizContainer) {
    quizContainer.classList.add("active");
  }

  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });

  showQuestion();
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
    const questionTypes = ["meaning", "bangla", "example"];

    /*
      Example questions require example data.
      If unavailable, use meaning/bangla.
    */

    let availableTypes = ["meaning", "bangla"];

    if (typeof word.example === "string" && word.example.trim()) {
      availableTypes.push("example");
    }

    const type =
      availableTypes[Math.floor(Math.random() * availableTypes.length)];

    return {
      word,
      type,
    };
  });
}

/* =====================================================
   QUESTION PROGRESS
===================================================== */

function updateQuestionProgress() {
  const total = quizQuestions.length;

  const completed = currentQuestion;

  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  if (progressText) {
    progressText.textContent = `Question ${currentQuestion + 1} of ${total}`;
  }

  if (progressBar) {
    progressBar.style.width = `${percentage}%`;
  }
}

/* =====================================================
   SHOW QUESTION
===================================================== */

function showQuestion() {
  if (currentQuestion >= quizQuestions.length) {
    finishQuiz();

    return;
  }

  const question = quizQuestions[currentQuestion];

  if (!question || !question.word) {
    finishQuiz();

    return;
  }

  const word = question.word;

  answeredCurrentQuestion = false;

  updateQuestionProgress();

  if (scoreElement) {
    scoreElement.textContent = `Score: ${quizScore}`;
  }

  if (answersContainer) {
    answersContainer.innerHTML = "";
  }

  if (feedback) {
    feedback.classList.remove("show");
  }

  if (nextButton) {
    nextButton.style.display = "none";
  }

  /* Word */

  if (questionElement) {
    questionElement.textContent = word.word;
  }

  /* Question type */

  if (questionSubtitle) {
    if (question.type === "meaning") {
      questionSubtitle.textContent =
        "Which option is the correct English meaning?";
    } else if (question.type === "bangla") {
      questionSubtitle.textContent =
        "Which option is the correct Bangla meaning?";
    } else {
      questionSubtitle.textContent =
        "Which option best matches this word's example?";
    }
  }

  /* Generate answers */

  const answers = generateAnswers(word, quizWords, question.type);

  answers.forEach((answer, index) => {
    const button = document.createElement("button");

    button.type = "button";

    button.className = "quiz-answer";

    button.textContent = answer.text;

    button.dataset.correct = String(answer.correct);

    button.dataset.index = String(index);

    button.addEventListener("click", () => {
      handleAnswer(button, answer);
    });

    answersContainer.appendChild(button);
  });
}

/* =====================================================
   GENERATE ANSWERS
===================================================== */

function generateAnswers(correctWord, allAvailableWords, type) {
  let correctAnswer = "";

  if (type === "meaning") {
    correctAnswer = correctWord.meaning;
  } else if (type === "bangla") {
    correctAnswer = correctWord.bangla;
  } else {
    correctAnswer = correctWord.example;
  }

  /*
    Find possible wrong answers.

    For example questions, only words with
    examples can be used.
  */

  let candidateWords = allAvailableWords.filter((word) => {
    if (word.word.toLowerCase() === correctWord.word.toLowerCase()) {
      return false;
    }

    if (type === "example") {
      return typeof word.example === "string" && word.example.trim();
    }

    return true;
  });

  candidateWords = shuffle(candidateWords);

  const wrongAnswers = [];

  const usedTexts = new Set();

  usedTexts.add(String(correctAnswer).toLowerCase());

  for (const word of candidateWords) {
    let text = "";

    if (type === "meaning") {
      text = word.meaning;
    } else if (type === "bangla") {
      text = word.bangla;
    } else {
      text = word.example;
    }

    if (!text) {
      continue;
    }

    const normalized = String(text).trim().toLowerCase();

    if (usedTexts.has(normalized)) {
      continue;
    }

    usedTexts.add(normalized);

    wrongAnswers.push({
      text,
      correct: false,
    });

    if (wrongAnswers.length >= ANSWERS_PER_QUESTION - 1) {
      break;
    }
  }

  const answers = [
    {
      text: correctAnswer,
      correct: true,
    },
    ...wrongAnswers,
  ];

  return shuffle(answers);
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
  });

  /*
    Always reveal correct answer.
  */

  buttons.forEach((button) => {
    if (button.dataset.correct === "true") {
      button.classList.add("correct");
    }
  });

  const current = quizQuestions[currentQuestion];

  const correctWord = current.word;

  /* =================================================
     CORRECT
  ================================================= */

  if (answer.correct) {
    clickedButton.classList.add("correct");

    quizCorrect++;

    quizScore++;

    if (feedbackTitle) {
      feedbackTitle.textContent = "✓ Correct!";
    }

    if (feedbackText) {
      feedbackText.textContent = `"${correctWord.word}" was the correct answer.`;
    }
  } else {

  /* =================================================
     WRONG
  ================================================= */
    clickedButton.classList.add("wrong");

    quizWrong++;

    missedWords.push(correctWord);

    if (feedbackTitle) {
      feedbackTitle.textContent = "✕ Not quite.";
    }

    let correctAnswer = "";

    if (current.type === "meaning") {
      correctAnswer = correctWord.meaning;
    } else if (current.type === "bangla") {
      correctAnswer = correctWord.bangla;
    } else {
      correctAnswer = correctWord.example;
    }

    if (feedbackText) {
      feedbackText.textContent = `Correct answer: ${correctAnswer}`;
    }
  }

  if (feedback) {
    feedback.classList.add("show");
  }

  if (scoreElement) {
    scoreElement.textContent = `Score: ${quizScore}`;
  }

  if (nextButton) {
    nextButton.style.display = "block";

    if (currentQuestion === quizQuestions.length - 1) {
      nextButton.textContent = "Finish Quiz →";
    } else {
      nextButton.textContent = "Next Question →";
    }
  }
}

/* =====================================================
   NEXT QUESTION
===================================================== */

if (nextButton) {
  nextButton.addEventListener("click", () => {
    if (!answeredCurrentQuestion) {
      return;
    }

    currentQuestion++;

    showQuestion();
  });
}

/* =====================================================
   XP SYSTEM
===================================================== */

function calculateXP() {
  let xp = 0;

  /*
    Base XP:
    10 points for every correct answer.
  */

  xp += quizCorrect * 10;

  /*
    Difficulty bonus.
  */

  const difficultyBonus = {
    all: 0,
    Easy: 0,
    Medium: 5,
    Hard: 10,
    Expert: 20,
  };

  xp += (difficultyBonus[selectedDifficulty] || 0) * quizCorrect;

  /*
    Perfect quiz bonus.
  */

  if (quizQuestions.length > 0 && quizCorrect === quizQuestions.length) {
    xp += 50;
  }

  return xp;
}

/* =====================================================
   QUIZ STREAK
===================================================== */

function getTodayString() {
  const now = new Date();

  const year = now.getFullYear();

  const month = String(now.getMonth() + 1).padStart(2, "0");

  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getYesterdayString() {
  const yesterday = new Date();

  yesterday.setDate(yesterday.getDate() - 1);

  const year = yesterday.getFullYear();

  const month = String(yesterday.getMonth() + 1).padStart(2, "0");

  const day = String(yesterday.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function updateQuizStreak() {
  const today = getTodayString();

  const yesterday = getYesterdayString();

  const lastDate = localStorage.getItem(LAST_QUIZ_DATE_KEY);

  let streak = Number(localStorage.getItem(QUIZ_STREAK_KEY) || 0);

  if (lastDate === today) {
    return streak;
  }

  if (lastDate === yesterday) {
    streak++;
  } else {
    streak = 1;
  }

  localStorage.setItem(QUIZ_STREAK_KEY, String(streak));

  localStorage.setItem(LAST_QUIZ_DATE_KEY, today);

  return streak;
}

/* =====================================================
   SAVE XP
===================================================== */

function saveQuizXP(xp) {
  const oldTotal = Number(localStorage.getItem(TOTAL_XP_KEY) || 0);

  const newTotal = oldTotal + xp;

  localStorage.setItem(TOTAL_XP_KEY, String(newTotal));

  const oldBest = Number(localStorage.getItem(BEST_XP_KEY) || 0);

  const bestXP = Math.max(oldBest, xp);

  localStorage.setItem(BEST_XP_KEY, String(bestXP));

  return {
    totalXP: newTotal,
    bestXP,
  };
}

/* =====================================================
   FINISH QUIZ
===================================================== */

function finishQuiz() {
  if (quizContainer) {
    quizContainer.classList.remove("active");
  }

  if (quizResult) {
    quizResult.classList.add("active");
  }

  const total = quizQuestions.length;

  const percentage = total > 0 ? Math.round((quizCorrect / total) * 100) : 0;

  /* Complete progress */

  if (progressBar) {
    progressBar.style.width = "100%";
  }

  /* Basic result */

  if (resultScore) {
    resultScore.textContent = `${percentage}%`;
  }

  if (resultCorrect) {
    resultCorrect.textContent = quizCorrect;
  }

  if (resultWrong) {
    resultWrong.textContent = quizWrong;
  }

  /* Best score */

  const oldBest = Number(localStorage.getItem(BEST_SCORE_KEY) || 0);

  const best = Math.max(oldBest, percentage);

  localStorage.setItem(BEST_SCORE_KEY, String(best));

  if (resultBest) {
    resultBest.textContent = `${best}%`;
  }

  /* XP */

  const earnedXP = calculateXP();

  const xpData = saveQuizXP(earnedXP);

  /* Streak */

  const streak = updateQuizStreak();

  /* Message */

  if (resultMessage) {
    if (percentage === 100) {
      resultMessage.textContent = `Perfect score. +${earnedXP} XP. 🔥 Your vocabulary is seriously strong.`;
    } else if (percentage >= 80) {
      resultMessage.textContent = `Excellent work. +${earnedXP} XP. Keep pushing your vocabulary higher.`;
    } else if (percentage >= 60) {
      resultMessage.textContent = `Good job. +${earnedXP} XP. A little more practice and you'll go even higher.`;
    } else if (percentage >= 40) {
      resultMessage.textContent = `Not bad. +${earnedXP} XP. Review the missed words and try again.`;
    } else {
      resultMessage.textContent = `Keep learning. +${earnedXP} XP earned. Every attempt helps you improve.`;
    }
  }

  addResultExtras(earnedXP, xpData.totalXP, xpData.bestXP, streak);

  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
}

/* =====================================================
   RESULT EXTRA INFORMATION
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

    const restartButton = document.getElementById("restart-quiz");

    if (restartButton) {
      quizResult.insertBefore(extras, restartButton);
    } else {
      quizResult.appendChild(extras);
    }
  }

  extras.innerHTML = `
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
        XP EARNED
      </span>

      <strong>
        +${earnedXP} XP
      </strong>
    </div>

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
        QUIZ STREAK
      </span>

      <strong>
        🔥 ${streak}
      </strong>
    </div>

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
        TOTAL XP
      </span>

      <strong>
        ${totalXP.toLocaleString()}
      </strong>
    </div>

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
        BEST XP
      </span>

      <strong>
        ${bestXP}
      </strong>
    </div>
  `;

  /* Review button */

  let reviewButton = document.getElementById("review-missed-words");

  if (missedWords.length > 0) {
    if (!reviewButton) {
      reviewButton = document.createElement("button");

      reviewButton.id = "review-missed-words";

      reviewButton.type = "button";

      reviewButton.className = "back-dictionary-button";

      const restartButton = document.getElementById("restart-quiz");

      if (restartButton) {
        quizResult.insertBefore(reviewButton, restartButton);
      } else {
        quizResult.appendChild(reviewButton);
      }
    }

    reviewButton.textContent = `Review ${missedWords.length} Missed Word${
      missedWords.length === 1 ? "" : "s"
    } →`;

    reviewButton.onclick = showMissedWords;
  } else if (reviewButton) {
    reviewButton.remove();
  }
}

/* =====================================================
   MISSED WORDS
===================================================== */

function showMissedWords() {
  if (!missedWords.length) {
    return;
  }

  if (quizContainer) {
    quizContainer.classList.remove("active");
  }

  if (quizResult) {
    quizResult.classList.remove("active");
  }

  if (!quizSetup) {
    return;
  }

  quizSetup.style.display = "block";

  const originalContent = quizSetup.dataset.originalContent;

  if (!originalContent) {
    quizSetup.dataset.originalContent = quizSetup.innerHTML;
  }

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
      ${missedWords
        .map(
          (word) => `
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
                ${escapeQuizHTML(word.word)}
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
                      ${escapeQuizHTML(word.pronunciation)}
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
                ${escapeQuizHTML(word.meaning)}
              </p>

              <p
                style="
                  font-size:14px;
                  margin:0;
                "
              >
                ${escapeQuizHTML(word.bangla)}
              </p>
            </div>
          `,
        )
        .join("")}
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

  const backButton = document.getElementById("review-back-button");

  if (backButton) {
    backButton.addEventListener("click", () => {
      quizSetup.innerHTML = quizSetup.dataset.originalContent;

      reinitializeDifficultyOptions();

      quizSetup.style.display = "block";
    });
  }

  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
}

/* =====================================================
   REINITIALIZE DIFFICULTY BUTTONS
===================================================== */

function reinitializeDifficultyOptions() {
  const options = quizSetup.querySelectorAll(".quiz-option");

  options.forEach((option) => {
    option.addEventListener("click", () => {
      options.forEach((item) => item.classList.remove("active"));

      option.classList.add("active");

      selectedDifficulty = option.dataset.difficulty || "all";
    });
  });

  const newStart = quizSetup.querySelector("#start-quiz");

  if (newStart) {
    newStart.addEventListener("click", startQuiz);
  }
}

/* =====================================================
   RESTART
===================================================== */

if (restartQuizButton) {
  restartQuizButton.addEventListener("click", () => {
    if (quizResult) {
      quizResult.classList.remove("active");
    }

    if (quizContainer) {
      quizContainer.classList.remove("active");
    }

    if (quizSetup) {
      quizSetup.style.display = "block";
    }

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  });
}

/* =====================================================
   KEYBOARD SUPPORT
===================================================== */

document.addEventListener("keydown", (event) => {
  if (!quizContainer || !quizContainer.classList.contains("active")) {
    return;
  }

  const answers = document.querySelectorAll(".quiz-answer:not(:disabled)");

  if (!answeredCurrentQuestion && answers.length) {
    const key = event.key.toLowerCase();

    const indexMap = {
      1: 0,
      2: 1,
      3: 2,
      4: 3,
    };

    if (Object.prototype.hasOwnProperty.call(indexMap, key)) {
      const index = indexMap[key];

      if (answers[index]) {
        answers[index].click();
      }
    }
  }

  if (
    event.key === "Enter" &&
    answeredCurrentQuestion &&
    nextButton &&
    nextButton.style.display !== "none"
  ) {
    nextButton.click();
  }
});

/* =====================================================
   START
===================================================== */

loadQuizWords();
