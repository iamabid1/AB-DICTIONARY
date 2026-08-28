/* =====================================================
   AB DICTIONARY
   DICTIONARY ENGINE
===================================================== */

"use strict";

/* =====================================================
   CONFIG
===================================================== */

const WORDS_PER_PAGE = 20;
const FAVORITES_KEY = "abDictionaryFavorites";
const RECENTLY_VIEWED_KEY = "abDictionaryRecentlyViewed";
const MAX_RECENTLY_VIEWED = 10;

/* =====================================================
   STATE
===================================================== */

let allWords = [];
let filteredWords = [];
let currentPage = 1;
let selectedLetter = "ALL";

/* =====================================================
   ELEMENTS
===================================================== */

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

const wordOverlay = document.getElementById("word-overlay");
const wordPanelContent = document.getElementById("word-panel-content");
const wordClose = document.getElementById("word-close");
const wordBackdrop = document.getElementById("word-backdrop");

const randomWordButton = document.getElementById("random-word-button");

const recentSection = document.getElementById("recent-section");
const recentList = document.getElementById("recent-list");
const clearRecentButton = document.getElementById("clear-recent");

/* =====================================================
   SAFETY CHECK
===================================================== */

function escapeHTML(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

/* =====================================================
   FAVORITES
===================================================== */

function getFavorites() {
  try {
    const saved = localStorage.getItem(FAVORITES_KEY);

    if (!saved) return [];

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

function isFavorite(word) {
  if (!word) return false;

  return getFavorites().some(
    (item) => String(item).toLowerCase() === String(word).toLowerCase(),
  );
}

function toggleFavorite(word) {
  if (!word) return;

  let favorites = getFavorites();

  const existingIndex = favorites.findIndex(
    (item) => String(item).toLowerCase() === String(word).toLowerCase(),
  );

  if (existingIndex !== -1) {
    favorites.splice(existingIndex, 1);
  } else {
    favorites.push(word);
  }

  saveFavorites(favorites);

  updateFavoriteButton(word);
}

function updateFavoriteButton(word) {
  const button = document.getElementById("favorite-word-button");

  if (!button) return;

  const saved = isFavorite(word);

  button.textContent = saved ? "★ Favorited" : "☆ Favorite";
  button.classList.toggle("is-favorite", saved);
}

/* =====================================================
   RECENTLY VIEWED
===================================================== */

function getRecentlyViewed() {
  try {
    const saved = localStorage.getItem(RECENTLY_VIEWED_KEY);

    if (!saved) return [];

    const parsed = JSON.parse(saved);

    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Could not load recently viewed:", error);
    return [];
  }
}

function saveRecentlyViewed(word) {
  if (!word) return;

  let recent = getRecentlyViewed();

  recent = recent.filter(
    (item) => String(item).toLowerCase() !== String(word).toLowerCase(),
  );

  recent.unshift(word);

  recent = recent.slice(0, MAX_RECENTLY_VIEWED);

  localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(recent));
}

function renderRecentlyViewed() {
  if (!recentSection || !recentList) return;

  const recent = getRecentlyViewed();

  recentList.innerHTML = "";

  if (recent.length === 0) {
    recentSection.style.display = "none";
    return;
  }

  recentSection.style.display = "block";

  recent.forEach((recentWordName) => {
    const word = allWords.find(
      (item) =>
        String(item.word || "").toLowerCase() ===
        String(recentWordName).toLowerCase(),
    );

    if (!word) return;

    const card = document.createElement("button");

    card.type = "button";
    card.className = "recent-word-card";

    card.innerHTML = `
      <span class="recent-word">
        ${escapeHTML(word.word)}
      </span>

      <span class="recent-part">
        ${escapeHTML(word.partOfSpeech)}
      </span>

      <span class="recent-bangla">
        ${escapeHTML(word.bangla)}
      </span>
    `;

    card.addEventListener("click", () => {
      openWordDetails(word);
    });

    recentList.appendChild(card);
  });
}

/* =====================================================
   LOAD DATABASE
===================================================== */

async function loadWords() {
  try {
    const response = await fetch("data/words.json", {
      cache: "no-cache",
    });

    if (!response.ok) {
      throw new Error("Could not load data/words.json");
    }

    const data = await response.json();

    if (!Array.isArray(data)) {
      throw new Error("words.json must contain an array.");
    }

    allWords = data
      .filter((word) => word && word.word)
      .sort((a, b) =>
        String(a.word).localeCompare(String(b.word), undefined, {
          sensitivity: "base",
        }),
      );

    filteredWords = [...allWords];

    createAlphabet();
    createCategories();

    readURLSearch();
    applyFilters();

    renderRecentlyViewed();
  } catch (error) {
    console.error("Dictionary loading error:", error);

    if (wordList) {
      wordList.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">⚠</div>
          <h3>Unable to load dictionary</h3>
          <p>
            Make sure <strong>data/words.json</strong>
            exists and contains valid dictionary data.
          </p>
        </div>
      `;
    }

    if (resultCount) {
      resultCount.textContent = "Dictionary unavailable";
    }
  }
}

/* =====================================================
   ALPHABET
===================================================== */

function createAlphabet() {
  if (!alphabet) return;

  alphabet.innerHTML = "";

  const allButton = document.createElement("button");

  allButton.type = "button";
  allButton.textContent = "ALL";
  allButton.dataset.letter = "ALL";
  allButton.classList.add("active");

  allButton.addEventListener("click", () => {
    selectedLetter = "ALL";
    currentPage = 1;

    updateAlphabetActiveButton(allButton);
    applyFilters();
  });

  alphabet.appendChild(allButton);

  "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").forEach((letter) => {
    const button = document.createElement("button");

    button.type = "button";
    button.textContent = letter;
    button.dataset.letter = letter;

    button.addEventListener("click", () => {
      selectedLetter = letter;
      currentPage = 1;

      updateAlphabetActiveButton(button);
      applyFilters();
    });

    alphabet.appendChild(button);
  });
}

function updateAlphabetActiveButton(activeButton) {
  alphabet.querySelectorAll("button").forEach((button) => {
    button.classList.remove("active");
  });

  activeButton.classList.add("active");
}

/* =====================================================
   CATEGORIES
===================================================== */

function createCategories() {
  if (!categoryFilter) return;

  categoryFilter.innerHTML = `
    <option value="all">All Categories</option>
  `;

  const categories = [
    ...new Set(
      allWords
        .map((word) => String(word.category || "").trim())
        .filter(Boolean),
    ),
  ].sort((a, b) => a.localeCompare(b));

  categories.forEach((category) => {
    const option = document.createElement("option");

    option.value = category;
    option.textContent = category;

    categoryFilter.appendChild(option);
  });
}

/* =====================================================
   URL SEARCH
===================================================== */

function readURLSearch() {
  const params = new URLSearchParams(window.location.search);

  const search = params.get("search");

  if (search && searchInput) {
    searchInput.value = search;
  }

  const difficulty = params.get("difficulty");

  const allowedDifficulties = ["Easy", "Medium", "Hard", "Expert"];

  if (
    difficulty &&
    difficultyFilter &&
    allowedDifficulties.includes(difficulty)
  ) {
    difficultyFilter.value = difficulty;
  }
}

/* =====================================================
   FILTER ENGINE
===================================================== */

function applyFilters() {
  const search = searchInput ? searchInput.value.trim().toLowerCase() : "";

  const difficulty = difficultyFilter ? difficultyFilter.value : "all";

  const category = categoryFilter ? categoryFilter.value : "all";

  filteredWords = allWords.filter((word) => {
    const wordText = String(word.word || "").toLowerCase();
    const meaningText = String(word.meaning || "").toLowerCase();
    const banglaText = String(word.bangla || "").toLowerCase();

    const matchesSearch =
      !search ||
      wordText.includes(search) ||
      meaningText.includes(search) ||
      banglaText.includes(search);

    const matchesLetter =
      selectedLetter === "ALL" ||
      wordText.toUpperCase().startsWith(selectedLetter);

    const matchesDifficulty =
      difficulty === "all" || String(word.difficulty || "") === difficulty;

    const matchesCategory =
      category === "all" || String(word.category || "") === category;

    return (
      matchesSearch && matchesLetter && matchesDifficulty && matchesCategory
    );
  });

  const totalPages = Math.max(
    1,
    Math.ceil(filteredWords.length / WORDS_PER_PAGE),
  );

  currentPage = Math.min(currentPage, totalPages);

  renderWords();
  renderPagination();
}

/* =====================================================
   RENDER WORDS
===================================================== */

function renderWords() {
  if (!wordList) return;

  wordList.innerHTML = "";

  const start = (currentPage - 1) * WORDS_PER_PAGE;
  const end = start + WORDS_PER_PAGE;

  const visibleWords = filteredWords.slice(start, end);

  if (resultCount) {
    if (filteredWords.length === 0) {
      resultCount.textContent = "0 words found";
    } else {
      resultCount.textContent = `Showing ${start + 1}–${Math.min(
        end,
        filteredWords.length,
      )} of ${filteredWords.length} words`;
    }
  }

  if (visibleWords.length === 0) {
    wordList.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">⌕</div>
        <h3>No words found</h3>
        <p>
          Try another search or change your filters.
        </p>
        <button
          type="button"
          class="empty-reset-button"
          id="empty-reset-button"
        >
          Reset filters
        </button>
      </div>
    `;

    const resetButton = document.getElementById("empty-reset-button");

    if (resetButton) {
      resetButton.addEventListener("click", resetFilters);
    }

    return;
  }

  visibleWords.forEach((word, index) => {
    const card = document.createElement("article");

    card.className = "dictionary-word";
    card.tabIndex = 0;

    card.style.animationDelay = `${Math.min(index * 0.025, 0.25)}s`;

    card.innerHTML = `
      <div class="dictionary-word-top">
        <div>
          <h2>
            ${escapeHTML(word.word)}
          </h2>

          <span class="part">
            ${escapeHTML(word.partOfSpeech || "")}
          </span>
        </div>

        ${
          word.difficulty
            ? `
              <span class="difficulty">
                ${escapeHTML(word.difficulty)}
              </span>
            `
            : ""
        }
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

    card.addEventListener("click", () => {
      openWordDetails(word);
    });

    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openWordDetails(word);
      }
    });

    wordList.appendChild(card);
  });
}

/* =====================================================
   WORD DETAILS
===================================================== */

function openWordDetails(word) {
  if (!wordOverlay || !wordPanelContent || !word) return;

  saveRecentlyViewed(word.word);

  const synonyms = Array.isArray(word.synonyms) ? word.synonyms : [];

  const antonyms = Array.isArray(word.antonyms) ? word.antonyms : [];

  wordPanelContent.innerHTML = `
    <div class="word-detail-header">

      <span class="word-detail-label">
        ${escapeHTML(word.partOfSpeech || "WORD")}
      </span>

      <h2>
        ${escapeHTML(word.word || "")}
      </h2>

      ${
        word.pronunciation
          ? `
            <div class="word-pronunciation">
              ${escapeHTML(word.pronunciation)}
            </div>
          `
          : ""
      }

    </div>

    <div class="word-detail-section">

      <span class="detail-label">
        ENGLISH MEANING
      </span>

      <p>
        ${escapeHTML(word.meaning || "No meaning available.")}
      </p>

    </div>

    <div class="word-detail-section bangla-section">

      <span class="detail-label">
        বাংলা অর্থ
      </span>

      <p>
        ${escapeHTML(word.bangla || "বাংলা অর্থ পাওয়া যায়নি।")}
      </p>

    </div>

    ${
      word.example
        ? `
          <div class="word-detail-section">

            <span class="detail-label">
              EXAMPLE
            </span>

            <div class="example-box">
              “${escapeHTML(word.example)}”
            </div>

          </div>
        `
        : ""
    }

    <div class="word-detail-section">

      <span class="detail-label">
        SYNONYMS
      </span>

      <div class="word-tags">

        ${
          synonyms.length
            ? synonyms
                .map((item) => `<span>${escapeHTML(item)}</span>`)
                .join("")
            : "<span>None</span>"
        }

      </div>

    </div>

    <div class="word-detail-section">

      <span class="detail-label">
        ANTONYMS
      </span>

      <div class="word-tags">

        ${
          antonyms.length
            ? antonyms
                .map((item) => `<span>${escapeHTML(item)}</span>`)
                .join("")
            : "<span>None</span>"
        }

      </div>

    </div>

    <div class="word-detail-meta">

      <div>
        <span>DIFFICULTY</span>
        <strong>
          ${escapeHTML(word.difficulty || "—")}
        </strong>
      </div>

      <div>
        <span>CATEGORY</span>
        <strong>
          ${escapeHTML(word.category || "—")}
        </strong>
      </div>

    </div>

    <div class="word-actions">

      <button
        class="word-action"
        id="pronounce-word-button"
        type="button"
      >
        🔊 Pronounce
      </button>

      <button
        class="word-action favorite-action"
        id="favorite-word-button"
        type="button"
      >
        ${isFavorite(word.word) ? "★ Favorited" : "☆ Favorite"}
      </button>

    </div>
  `;

  const pronounceButton = document.getElementById("pronounce-word-button");

  if (pronounceButton) {
    pronounceButton.addEventListener("click", () => {
      speakWord(word.word);
    });
  }

  const favoriteButton = document.getElementById("favorite-word-button");

  if (favoriteButton) {
    favoriteButton.addEventListener("click", () => {
      toggleFavorite(word.word);
    });

    favoriteButton.classList.toggle("is-favorite", isFavorite(word.word));
  }

  wordOverlay.classList.add("open");
  wordOverlay.setAttribute("aria-hidden", "false");

  document.body.classList.add("panel-open");

  renderRecentlyViewed();
}

/* =====================================================
   CLOSE DETAILS
===================================================== */

function closeWordDetails() {
  if (!wordOverlay) return;

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

document.addEventListener("keydown", (event) => {
  if (
    event.key === "Escape" &&
    wordOverlay &&
    wordOverlay.classList.contains("open")
  ) {
    closeWordDetails();
  }
});

/* =====================================================
   PRONUNCIATION
===================================================== */

function speakWord(word) {
  if (!("speechSynthesis" in window) || !word) {
    return;
  }

  window.speechSynthesis.cancel();

  const speech = new SpeechSynthesisUtterance(word);

  speech.lang = "en-US";
  speech.rate = 0.85;
  speech.pitch = 1;

  window.speechSynthesis.speak(speech);
}

/* =====================================================
   PAGINATION
===================================================== */

function renderPagination() {
  if (!pagination) return;

  pagination.innerHTML = "";

  const totalPages = Math.ceil(filteredWords.length / WORDS_PER_PAGE);

  if (totalPages <= 1) return;

  const previous = createPaginationButton("←");

  previous.disabled = currentPage === 1;
  previous.setAttribute("aria-label", "Previous page");

  previous.addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;
      renderWords();
      renderPagination();
      scrollToResults();
    }
  });

  pagination.appendChild(previous);

  const maxButtons = 7;

  let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));

  let endPage = Math.min(totalPages, startPage + maxButtons - 1);

  if (endPage - startPage < maxButtons - 1) {
    startPage = Math.max(1, endPage - maxButtons + 1);
  }

  for (let page = startPage; page <= endPage; page++) {
    const button = createPaginationButton(page);

    if (page === currentPage) {
      button.classList.add("active");
      button.setAttribute("aria-current", "page");
    }

    button.addEventListener("click", () => {
      currentPage = page;

      renderWords();
      renderPagination();
      scrollToResults();
    });

    pagination.appendChild(button);
  }

  const next = createPaginationButton("→");

  next.disabled = currentPage === totalPages;
  next.setAttribute("aria-label", "Next page");

  next.addEventListener("click", () => {
    if (currentPage < totalPages) {
      currentPage++;

      renderWords();
      renderPagination();
      scrollToResults();
    }
  });

  pagination.appendChild(next);
}

function createPaginationButton(text) {
  const button = document.createElement("button");

  button.type = "button";
  button.textContent = text;

  return button;
}

function scrollToResults() {
  const resultsHeader = document.querySelector(".results-header");

  if (!resultsHeader) return;

  const top = resultsHeader.getBoundingClientRect().top + window.scrollY - 90;

  window.scrollTo({
    top: Math.max(0, top),
    behavior: "smooth",
  });
}

/* =====================================================
   RESET FILTERS
===================================================== */

function resetFilters() {
  if (searchInput) {
    searchInput.value = "";
  }

  if (difficultyFilter) {
    difficultyFilter.value = "all";
  }

  if (categoryFilter) {
    categoryFilter.value = "all";
  }

  selectedLetter = "ALL";
  currentPage = 1;

  if (alphabet) {
    const allButton = alphabet.querySelector('[data-letter="ALL"]');

    if (allButton) {
      updateAlphabetActiveButton(allButton);
    }
  }

  applyFilters();
}

/* =====================================================
   SEARCH EVENTS
===================================================== */

if (searchInput) {
  searchInput.addEventListener("input", () => {
    currentPage = 1;
    applyFilters();
  });

  searchInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      currentPage = 1;
      applyFilters();
    }
  });
}

if (dictionarySearchButton) {
  dictionarySearchButton.addEventListener("click", () => {
    currentPage = 1;
    applyFilters();
  });
}

if (difficultyFilter) {
  difficultyFilter.addEventListener("change", () => {
    currentPage = 1;
    applyFilters();
  });
}

if (categoryFilter) {
  categoryFilter.addEventListener("change", () => {
    currentPage = 1;
    applyFilters();
  });
}

/* =====================================================
   RANDOM WORD
===================================================== */

if (randomWordButton) {
  randomWordButton.addEventListener("click", () => {
    if (!allWords.length) return;

    const randomIndex = Math.floor(Math.random() * allWords.length);

    openWordDetails(allWords[randomIndex]);
  });
}

/* =====================================================
   CLEAR RECENT
===================================================== */

if (clearRecentButton) {
  clearRecentButton.addEventListener("click", () => {
    localStorage.removeItem(RECENTLY_VIEWED_KEY);
    renderRecentlyViewed();
  });
}

/* =====================================================
   START
===================================================== */

loadWords();
