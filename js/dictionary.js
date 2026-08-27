/* =====================================================
   AB DICTIONARY
   DICTIONARY ENGINE
===================================================== */

let allWords = [];

let filteredWords = [];

let currentPage = 1;

const wordsPerPage = 20;

let selectedLetter = "ALL";

/* ================= ELEMENTS ================= */

const wordList = document.getElementById("word-list");

const resultCount = document.getElementById("result-count");

const searchInput = document.getElementById("dictionary-search");

const dictionarySearchButton = document.getElementById(
  "dictionary-search-button",
);

const difficultyFilter = document.getElementById("difficulty-filter");

const categoryFilter = document.getElementById("category-filter");

const alphabet = document.getElementById("alphabet");

const pagination = document.getElementById("pagination");

/* ================= LOAD DATA ================= */

async function loadWords() {
  try {
    const response = await fetch("data/words.json");

    if (!response.ok) {
      throw new Error("Could not load words.json");
    }

    allWords = await response.json();

    allWords.sort((a, b) => a.word.localeCompare(b.word));

    filteredWords = [...allWords];

    createAlphabet();

    createCategories();

    readURLSearch();

    applyFilters();

    renderRecentlyViewed();
  } catch (error) {
    console.error("Dictionary loading error:", error);

    wordList.innerHTML = `

            <div class="empty-state">

                <h3>
                    Unable to load dictionary
                </h3>

                <p>
                    Check that words.json exists
                    inside the data folder.
                </p>

            </div>

        `;
  }
}

/* ================= ALPHABET ================= */

function createAlphabet() {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  letters.forEach((letter) => {
    const button = document.createElement("button");

    button.textContent = letter;

    button.dataset.letter = letter;

    button.addEventListener("click", () => {
      selectedLetter = letter;

      currentPage = 1;

      document
        .querySelectorAll("#alphabet button")
        .forEach((btn) => btn.classList.remove("active"));

      button.classList.add("active");

      applyFilters();
    });

    alphabet.appendChild(button);
  });
}

/* ================= CATEGORIES ================= */

function createCategories() {
  const categories = [...new Set(allWords.map((word) => word.category))].sort();

  categories.forEach((category) => {
    const option = document.createElement("option");

    option.value = category;

    option.textContent = category;

    categoryFilter.appendChild(option);
  });
}

/* ================= URL SEARCH ================= */

function readURLSearch() {
  const params = new URLSearchParams(window.location.search);

  const search = params.get("search");

  if (search) {
    searchInput.value = search;
  }

  const difficulty = params.get("difficulty");

  if (difficulty) {
    const allowedDifficulties = ["Easy", "Medium", "Hard", "Expert"];

    if (allowedDifficulties.includes(difficulty)) {
      difficultyFilter.value = difficulty;
    }
  }
}

/* ================= FILTER ================= */

function applyFilters() {
  const search = searchInput.value.trim().toLowerCase();

  const difficulty = difficultyFilter.value;

  const category = categoryFilter.value;

  filteredWords = allWords.filter((word) => {
    const matchesSearch =
      !search ||
      (word.word || "").toLowerCase().includes(search) ||
      (word.meaning || "").toLowerCase().includes(search) ||
      (word.bangla || "").toLowerCase().includes(search);

    const matchesLetter =
      selectedLetter === "ALL" ||
      (word.word || "").toUpperCase().startsWith(selectedLetter);

    const matchesDifficulty =
      difficulty === "all" || word.difficulty === difficulty;

    const matchesCategory = category === "all" || word.category === category;

    return (
      matchesSearch && matchesLetter && matchesDifficulty && matchesCategory
    );
  });

  currentPage = Math.min(
    currentPage,
    Math.max(1, Math.ceil(filteredWords.length / wordsPerPage)),
  );

  renderWords();

  renderPagination();
}

/* =====================================================
   WORD DETAILS PANEL
===================================================== */

const wordOverlay = document.getElementById("word-overlay");

const wordPanel = document.getElementById("word-panel");

const wordPanelContent = document.getElementById("word-panel-content");

const wordClose = document.getElementById("word-close");

const wordBackdrop = document.getElementById("word-backdrop");

/* ================= OPEN WORD ================= */

function openWordDetails(word) {
  saveRecentlyViewed(word.word);
  wordPanelContent.innerHTML = `

        <div class="word-detail-header">

            <span class="word-detail-label">

                ${escapeHTML(word.partOfSpeech || "")}

            </span>


            <h2>

                ${escapeHTML(word.word || "")}

            </h2>


            <div class="word-pronunciation">

                ${escapeHTML(word.pronunciation || "")}

            </div>

        </div>


        <div class="word-detail-section">

            <span class="detail-label">

                ENGLISH MEANING

            </span>


            <p>

                ${escapeHTML(word.meaning || "")}

            </p>

        </div>


        <div
            class="word-detail-section
                   bangla-section">

            <span class="detail-label">

                বাংলা অর্থ

            </span>


            <p>

                ${escapeHTML(word.bangla || "")}

            </p>

        </div>


        <div class="word-detail-section">

            <span class="detail-label">

                EXAMPLE

            </span>


            <div class="example-box">

                “${escapeHTML(word.example || "")}”

            </div>

        </div>


        <div class="word-detail-section">

            <span class="detail-label">

                SYNONYMS

            </span>


            <div class="word-tags">

                ${
                  Array.isArray(word.synonyms)
                    ? word.synonyms
                        .map(
                          (item) => `

                                <span>

                                    ${escapeHTML(item)}

                                </span>

                            `,
                        )
                        .join("")
                    : `<span>None</span>`
                }

            </div>

        </div>


        <div class="word-detail-section">

            <span class="detail-label">

                ANTONYMS

            </span>


            <div class="word-tags">

                ${
                  Array.isArray(word.antonyms)
                    ? word.antonyms
                        .map(
                          (item) => `

                                <span>

                                    ${escapeHTML(item)}

                                </span>

                            `,
                        )
                        .join("")
                    : `<span>None</span>`
                }

            </div>

        </div>


        <div class="word-detail-meta">

            <div>

                <span>

                    DIFFICULTY

                </span>


                <strong>

                    ${escapeHTML(word.difficulty || "")}

                </strong>

            </div>


            <div>

                <span>

                    CATEGORY

                </span>


                <strong>

                    ${escapeHTML(word.category || "")}

                </strong>

            </div>

        </div>


        <div class="word-actions">

            <button
                class="word-action"
                onclick="speakWord(
                    '${escapeHTML(word.word || "")}'
                )">

                🔊 Pronounce

            </button>


            <button
    class="word-action favorite-action"
    onclick="toggleFavorite('${escapeHTML(word.word)}')"
>
    ${isFavorite(word.word) ? "★ Favorited" : "☆ Favorite"}
</button>

        </div>

    `;

  wordOverlay.classList.add("open");

  wordOverlay.setAttribute("aria-hidden", "false");

  document.body.classList.add("panel-open");
  renderRecentlyViewed();
}

/* ================= CLOSE ================= */

function closeWordDetails() {
  wordOverlay.classList.remove("open");

  wordOverlay.setAttribute("aria-hidden", "true");

  document.body.classList.remove("panel-open");
}

if (wordClose) {
  wordClose.addEventListener("click", closeWordDetails);
}

if (wordBackdrop) {
  wordBackdrop.addEventListener("click", closeWordDetails);
}

/* ================= ESCAPE KEY ================= */

document.addEventListener("keydown", (event) => {
  if (
    event.key === "Escape" &&
    wordOverlay &&
    wordOverlay.classList.contains("open")
  ) {
    closeWordDetails();
  }
});

/* ================= PRONUNCIATION ================= */

function speakWord(word) {
  if (!("speechSynthesis" in window)) {
    return;
  }

  window.speechSynthesis.cancel();

  const speech = new SpeechSynthesisUtterance(word);

  speech.lang = "en-US";

  speech.rate = 0.85;

  window.speechSynthesis.speak(speech);
}

/* ================= RENDER WORDS ================= */

function renderWords() {
  wordList.innerHTML = "";

  const start = (currentPage - 1) * wordsPerPage;

  const end = start + wordsPerPage;

  const visibleWords = filteredWords.slice(start, end);

  resultCount.textContent = `Showing ${
    filteredWords.length === 0 ? 0 : start + 1
  }–${Math.min(end, filteredWords.length)} of ${filteredWords.length} words`;

  if (visibleWords.length === 0) {
    wordList.innerHTML = `

            <div class="empty-state">

                <h3>

                    No words found

                </h3>


                <p>

                    Try another search or
                    change your filters.

                </p>

            </div>

        `;

    return;
  }

  visibleWords.forEach((word) => {
    const card = document.createElement("div");

    card.className = "dictionary-word";

    card.setAttribute("tabindex", "0");

    card.addEventListener("click", () => openWordDetails(word));

    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        openWordDetails(word);
      }
    });

    card.innerHTML = `

                <div
                    class="dictionary-word-top">

                    <div>

                        <h2>

                            ${escapeHTML(word.word || "")}

                        </h2>


                        <span class="part">

                            ${escapeHTML(word.partOfSpeech || "")}

                        </span>

                    </div>


                    <span
                        class="difficulty">

                        ${escapeHTML(word.difficulty || "")}

                    </span>

                </div>


                <p class="meaning">

                    ${escapeHTML(word.meaning || "")}

                </p>


                <p class="bangla">

                    ${escapeHTML(word.bangla || "")}

                </p>


                <div class="arrow">

                    View word →

                </div>

            `;

    wordList.appendChild(card);
  });
}

/* ================= PAGINATION ================= */

function renderPagination() {
  pagination.innerHTML = "";

  const totalPages = Math.ceil(filteredWords.length / wordsPerPage);

  if (totalPages <= 1) {
    return;
  }

  const previous = document.createElement("button");

  previous.textContent = "←";

  previous.disabled = currentPage === 1;

  previous.addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;

      renderWords();

      renderPagination();

      window.scrollTo({
        top: 0,

        behavior: "smooth",
      });
    }
  });

  pagination.appendChild(previous);

  const maxButtons = 7;

  let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));

  let endPage = Math.min(totalPages, startPage + maxButtons - 1);

  if (endPage - startPage < maxButtons - 1) {
    startPage = Math.max(1, endPage - maxButtons + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    const button = document.createElement("button");

    button.textContent = i;

    if (i === currentPage) {
      button.classList.add("active");
    }

    button.addEventListener("click", () => {
      currentPage = i;

      renderWords();

      renderPagination();

      window.scrollTo({
        top: 0,

        behavior: "smooth",
      });
    });

    pagination.appendChild(button);
  }

  const next = document.createElement("button");

  next.textContent = "→";

  next.disabled = currentPage === totalPages;

  next.addEventListener("click", () => {
    if (currentPage < totalPages) {
      currentPage++;

      renderWords();

      renderPagination();

      window.scrollTo({
        top: 0,

        behavior: "smooth",
      });
    }
  });

  pagination.appendChild(next);
}

/* ================= EVENTS ================= */

searchInput.addEventListener("input", () => {
  currentPage = 1;

  applyFilters();
});

dictionarySearchButton.addEventListener("click", () => {
  currentPage = 1;

  applyFilters();
});

searchInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    currentPage = 1;

    applyFilters();
  }
});

difficultyFilter.addEventListener("change", () => {
  currentPage = 1;

  applyFilters();
});

categoryFilter.addEventListener("change", () => {
  currentPage = 1;

  applyFilters();
});

/* ================= SECURITY / HTML ================= */

function escapeHTML(value) {
  return String(value)
    .replaceAll("&", "&amp;")

    .replaceAll("<", "&lt;")

    .replaceAll(">", "&gt;")

    .replaceAll('"', "&quot;")

    .replaceAll("'", "&#039;");
}

/* ================= START ================= */

loadWords();

/* =====================================================
   AB DICTIONARY
   FAVORITES SYSTEM
===================================================== */

const FAVORITES_KEY = "abDictionaryFavorites";

function getFavorites() {
  try {
    const saved = localStorage.getItem(FAVORITES_KEY);

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

function saveFavorites(favorites) {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
}

/* ================= CHECK FAVORITE ================= */

function isFavorite(word) {
  const favorites = getFavorites();

  return favorites.some((item) => item.toLowerCase() === word.toLowerCase());
}

/* ================= TOGGLE FAVORITE ================= */

function toggleFavorite(word) {
  let favorites = getFavorites();

  const index = favorites.findIndex(
    (item) => item.toLowerCase() === word.toLowerCase(),
  );

  if (index !== -1) {
    // Remove
    favorites.splice(index, 1);
  } else {
    // Add
    favorites.push(word);
  }

  saveFavorites(favorites);

  updateFavoriteButtons(word);
}

/* ================= UPDATE BUTTON ================= */

function updateFavoriteButtons(word) {
  const buttons = document.querySelectorAll(".favorite-action");

  buttons.forEach((button) => {
    const isSaved = isFavorite(word);

    button.textContent = isSaved ? "★ Favorited" : "☆ Favorite";

    button.classList.toggle("is-favorite", isSaved);
  });
}

/* ================= INITIALIZE FAVORITE BUTTON ================= */

function initializeFavoriteButton(word) {
  updateFavoriteButtons(word);
}

/* =====================================================
   RANDOM WORD
===================================================== */

const randomWordButton = document.getElementById("random-word-button");

if (randomWordButton) {
  randomWordButton.addEventListener("click", () => {
    if (!allWords.length) {
      return;
    }

    const randomIndex = Math.floor(Math.random() * allWords.length);

    const randomWord = allWords[randomIndex];

    if (!randomWord) {
      return;
    }

    openWordDetails(randomWord);
  });
}

/* =====================================================
   RECENTLY VIEWED
===================================================== */

const RECENTLY_VIEWED_KEY = "abDictionaryRecentlyViewed";

const MAX_RECENTLY_VIEWED = 10;

/* ================= GET ================= */

function getRecentlyViewed() {
  try {
    const saved = localStorage.getItem(RECENTLY_VIEWED_KEY);

    if (!saved) {
      return [];
    }

    const parsed = JSON.parse(saved);

    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Could not load recently viewed:", error);

    return [];
  }
}

/* ================= SAVE ================= */

function saveRecentlyViewed(word) {
  if (!word) {
    return;
  }

  let recent = getRecentlyViewed();

  // Remove the word if it already exists
  recent = recent.filter((item) => item.toLowerCase() !== word.toLowerCase());

  // Put newest word at the beginning
  recent.unshift(word);

  // Keep only the latest 10
  recent = recent.slice(0, MAX_RECENTLY_VIEWED);

  localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(recent));
}

/* =====================================================
   RECENTLY VIEWED UI
===================================================== */

const recentSection = document.getElementById("recent-section");

const recentList = document.getElementById("recent-list");

const clearRecentButton = document.getElementById("clear-recent");

/* ================= RENDER ================= */

function renderRecentlyViewed() {
  if (!recentSection || !recentList) {
    return;
  }

  const recent = getRecentlyViewed();

  /* Hide section if empty */

  if (recent.length === 0) {
    recentSection.style.display = "none";

    return;
  }

  recentSection.style.display = "";

  recentList.innerHTML = "";

  recent.forEach((recentWordName) => {
    const word = allWords.find(
      (item) => item.word.toLowerCase() === recentWordName.toLowerCase(),
    );

    if (!word) {
      return;
    }

    const card = document.createElement("button");

    card.type = "button";

    card.className = "recent-word-card";

    card.innerHTML = `

        <span class="recent-word">

          ${escapeHTML(word.word || "")}

        </span>


        <span class="recent-part">

          ${escapeHTML(word.partOfSpeech || "")}

        </span>


        <span class="recent-bangla">

          ${escapeHTML(word.bangla || "")}

        </span>

      `;

    card.addEventListener("click", () => {
      openWordDetails(word);
    });

    recentList.appendChild(card);
  });
}

/* ================= CLEAR ================= */

if (clearRecentButton) {
  clearRecentButton.addEventListener("click", () => {
    localStorage.removeItem(RECENTLY_VIEWED_KEY);

    renderRecentlyViewed();
  });
}

// /* ================= START ================= */

// setTimeout(renderRecentlyViewed, 100);
