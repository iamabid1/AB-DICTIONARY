/* =====================================================
   AB DICTIONARY
   GLOBAL JAVASCRIPT
===================================================== */

/* ================= MOBILE MENU ================= */

const menuToggle = document.getElementById("menu-toggle");
const mobileMenu = document.getElementById("mobile-menu");

if (menuToggle && mobileMenu) {
  menuToggle.addEventListener("click", () => {
    mobileMenu.classList.toggle("open");
  });
}

/* ================= HOME SEARCH ================= */

const homeSearch = document.getElementById("home-search");
const searchButton = document.getElementById("search-button");

function performSearch() {
  if (!homeSearch) return;

  const word = homeSearch.value.trim();

  if (!word) {
    homeSearch.focus();

    return;
  }

  window.location.href = `dictionary.html?search=${encodeURIComponent(word)}`;
}

if (searchButton) {
  searchButton.addEventListener("click", performSearch);
}

if (homeSearch) {
  homeSearch.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      performSearch();
    }
  });
}

/* ================= EXAMPLE WORDS ================= */

const exampleWords = document.querySelectorAll(".example-word");

exampleWords.forEach((button) => {
  button.addEventListener("click", () => {
    if (!homeSearch) return;

    homeSearch.value = button.textContent.trim();

    homeSearch.focus();
  });
});

/* ================= THEME BUTTON ================= */

const themeToggle = document.getElementById("theme-toggle");

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("light-mode");
  });
}

/* =====================================================
   WORD OF THE DAY
===================================================== */

async function loadWordOfTheDay() {
  /*
       Only run this on pages that actually
       contain the Word of the Day section.
    */

  const wordCard = document.querySelector(".word-card");

  if (!wordCard) return;

  try {
    const response = await fetch("data/words.json");

    if (!response.ok) {
      throw new Error("Could not load words.json");
    }

    const words = await response.json();

    if (!Array.isArray(words) || words.length === 0) {
      throw new Error("Dictionary contains no words");
    }

    /*
           Create a stable number based on
           today's date.

           This means:
           - Same word all day
           - Changes automatically tomorrow
           - No database required
           - Works on Vercel
        */

    const today = new Date();

    const year = today.getFullYear();

    const month = today.getMonth();

    const day = today.getDate();

    const dateNumber = Math.floor(
      new Date(year, month, day).getTime() / 86400000,
    );

    const index = Math.abs(dateNumber) % words.length;

    const word = words[index];

    if (!word) return;

    /* ================= WORD ================= */

    const title = wordCard.querySelector("h3");

    if (title) {
      title.textContent = word.word;
    }

    /* ================= PRONUNCIATION ================= */

    const pronunciation = wordCard.querySelector(".pronunciation");

    if (pronunciation) {
      pronunciation.textContent = word.pronunciation || "";
    }

    /* ================= DIFFICULTY ================= */

    const difficulty = wordCard.querySelector(".word-difficulty");

    if (difficulty) {
      difficulty.textContent = word.difficulty || "";
    }

    /* ================= ENGLISH MEANING ================= */

    const meaning = wordCard.querySelector(".word-meaning p");

    if (meaning) {
      meaning.textContent = word.meaning || "";
    }

    /* ================= BANGLA ================= */

    const bangla = wordCard.querySelector(".word-bangla p");

    if (bangla) {
      bangla.textContent = word.bangla || "";
    }

    /* ================= EXAMPLE ================= */

    const example = wordCard.querySelector(".word-example p");

    if (example) {
      example.textContent = word.example || "";
    }

    /* ================= SYNONYMS ================= */

    const sideSections = wordCard.querySelectorAll(".word-card-side > div");

    const sideTitles = wordCard.querySelectorAll(".side-title");

    if (sideTitles.length >= 2) {
      const synonymList = sideTitles[0].nextElementSibling;

      const antonymList = sideTitles[1].nextElementSibling;

      if (synonymList) {
        synonymList.innerHTML = createTags(word.synonyms);
      }

      if (antonymList) {
        antonymList.innerHTML = createTags(word.antonyms);
      }
    }

    /* ================= EXPLORE BUTTON ================= */

    const exploreButton = wordCard.querySelector(".learn-button");

    if (exploreButton) {
      exploreButton.href = `word.html?word=${encodeURIComponent(word.word)}`;
    }

    /* ================= FAVORITE ================= */

    const favoriteButton = wordCard.querySelector(".favorite-button");

    if (favoriteButton) {
      updateHomeFavoriteButton(favoriteButton, word.word);

      favoriteButton.onclick = () => {
        toggleHomeFavorite(word.word, favoriteButton);
      };
    }
  } catch (error) {
    console.error("Word of the Day error:", error);
  }
}

/* ================= CREATE TAGS ================= */

function createTags(items) {
  if (!Array.isArray(items)) {
    return "";
  }

  return items
    .slice(0, 6)
    .map((item) => `<span class="tag">${escapeWordHTML(item)}</span>`)
    .join("");
}

/* ================= HTML SAFETY ================= */

function escapeWordHTML(value) {
  return String(value)
    .replaceAll("&", "&amp;")

    .replaceAll("<", "&lt;")

    .replaceAll(">", "&gt;")

    .replaceAll('"', "&quot;")

    .replaceAll("'", "&#039;");
}

/* =====================================================
   HOME FAVORITES
===================================================== */

const HOME_FAVORITES_KEY = "abDictionaryFavorites";

function getHomeFavorites() {
  try {
    const saved = localStorage.getItem(HOME_FAVORITES_KEY);

    if (!saved) {
      return [];
    }

    const parsed = JSON.parse(saved);

    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveHomeFavorites(favorites) {
  localStorage.setItem(HOME_FAVORITES_KEY, JSON.stringify(favorites));
}

function updateHomeFavoriteButton(button, word) {
  const favorites = getHomeFavorites();

  const saved = favorites.some(
    (item) => item.toLowerCase() === word.toLowerCase(),
  );

  button.textContent = saved ? "★" : "☆";

  button.setAttribute(
    "aria-label",
    saved ? "Remove from favorites" : "Add to favorites",
  );

  button.classList.toggle("is-favorite", saved);
}

function toggleHomeFavorite(word, button) {
  let favorites = getHomeFavorites();

  const index = favorites.findIndex(
    (item) => item.toLowerCase() === word.toLowerCase(),
  );

  if (index !== -1) {
    favorites.splice(index, 1);
  } else {
    favorites.push(word);
  }

  saveHomeFavorites(favorites);

  updateHomeFavoriteButton(button, word);
}

/* =====================================================
   HOMEPAGE DICTIONARY STATISTICS
===================================================== */

async function loadDictionaryStats() {
  const wordCount = document.getElementById("word-count");

  const categoryCount = document.getElementById("category-count");

  // Only run on pages containing these stats
  if (!wordCount && !categoryCount) {
    return;
  }

  try {
    const response = await fetch("data/words.json");

    if (!response.ok) {
      throw new Error("Could not load words.json");
    }

    const words = await response.json();

    if (!Array.isArray(words)) {
      throw new Error("Dictionary data is not an array");
    }

    /* ================= WORD COUNT ================= */

    if (wordCount) {
      wordCount.textContent = words.length.toLocaleString();
    }

    /* ================= CATEGORY COUNT ================= */

    if (categoryCount) {
      const categories = new Set(
        words
          .map((word) =>
            String(word.category || "")
              .trim()
              .toLowerCase(),
          )
          .filter(Boolean),
      );

      categoryCount.textContent = categories.size;
    }
  } catch (error) {
    console.error("Dictionary statistics error:", error);

    if (wordCount) {
      wordCount.textContent = "—";
    }

    if (categoryCount) {
      categoryCount.textContent = "—";
    }
  }
}

/* ================= START ================= */

loadWordOfTheDay();
loadDictionaryStats();
