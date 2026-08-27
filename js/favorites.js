/* =====================================================
   AB DICTIONARY
   FAVORITES PAGE
===================================================== */

const FAVORITES_KEY = "abDictionaryFavorites";

const favoritesGrid = document.getElementById("favorites-grid");

const favoritesEmpty = document.getElementById("favorites-empty");

const favoritesToolbar = document.getElementById("favorites-toolbar");

const favoritesCount = document.getElementById("favorites-count");

const favoriteTotal = document.getElementById("favorite-total");

const clearFavoritesButton = document.getElementById("clear-favorites");

/* =====================================================
   GET FAVORITES
===================================================== */

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

/* =====================================================
   SAVE FAVORITES
===================================================== */

function saveFavorites(favorites) {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
}

/* =====================================================
   LOAD WORD DATABASE
===================================================== */

async function loadFavoriteWords() {
  try {
    const response = await fetch("data/words.json");

    if (!response.ok) {
      throw new Error("Could not load words.json");
    }

    const allWords = await response.json();

    renderFavorites(allWords);
  } catch (error) {
    console.error("Favorites loading error:", error);

    favoritesGrid.innerHTML = `
      <div class="favorites-empty">

        <div class="favorites-empty-icon">
          ⚠
        </div>

        <h2>
          Unable to load favorites.
        </h2>

        <p>
          Make sure data/words.json
          is available.
        </p>

      </div>
    `;
  }
}

/* =====================================================
   RENDER FAVORITES
===================================================== */

function renderFavorites(allWords) {
  const favorites = getFavorites();

  favoritesGrid.innerHTML = "";

  favoriteTotal.textContent = favorites.length;

  favoritesCount.textContent = `${favorites.length} ${
    favorites.length === 1 ? "saved word" : "saved words"
  }`;

  /* EMPTY */

  if (favorites.length === 0) {
    favoritesGrid.style.display = "none";

    favoritesToolbar.style.display = "none";

    favoritesEmpty.style.display = "block";

    return;
  }

  /* HAS FAVORITES */

  favoritesGrid.style.display = "grid";

  favoritesToolbar.style.display = "flex";

  favoritesEmpty.style.display = "none";

  favorites.forEach((favoriteWordName, index) => {
    const word = allWords.find(
      (item) =>
        item.word && item.word.toLowerCase() === favoriteWordName.toLowerCase(),
    );

    if (!word) {
      return;
    }

    const card = document.createElement("article");

    card.className = "favorite-card";

    card.style.animationDelay = `${Math.min(index * 0.04, 0.4)}s`;

    card.innerHTML = `

        <div class="favorite-card-top">

          <div>

            <h2 class="favorite-word">
              ${escapeHTML(word.word || "")}
            </h2>

            <span class="favorite-part">
              ${escapeHTML(word.partOfSpeech || "")}
            </span>

          </div>


          <button
            class="favorite-remove"
            type="button"
            title="Remove from favorites"
            aria-label="Remove ${escapeHTML(word.word || "")} from favorites"
          >
            ×
          </button>

        </div>


        <p class="favorite-meaning">
          ${escapeHTML(word.meaning || "")}
        </p>


        <p class="favorite-bangla">
          ${escapeHTML(word.bangla || "")}
        </p>


        <div class="favorite-footer">

          <span class="favorite-difficulty">
            ${escapeHTML(word.difficulty || "")}
          </span>

          <span class="favorite-view">
            View word →
          </span>

        </div>

      `;

    /* REMOVE BUTTON */

    const removeButton = card.querySelector(".favorite-remove");

    removeButton.addEventListener("click", (event) => {
      event.stopPropagation();

      removeFavorite(word.word, allWords);
    });

    /* OPEN WORD */

    card.addEventListener("click", () => {
      window.location.href = `dictionary.html?search=${encodeURIComponent(
        word.word,
      )}`;
    });

    favoritesGrid.appendChild(card);
  });
}

/* =====================================================
   REMOVE ONE FAVORITE
===================================================== */

function removeFavorite(word, allWords) {
  let favorites = getFavorites();

  favorites = favorites.filter(
    (item) => item.toLowerCase() !== word.toLowerCase(),
  );

  saveFavorites(favorites);

  renderFavorites(allWords);
}

/* =====================================================
   CLEAR ALL
===================================================== */

if (clearFavoritesButton) {
  clearFavoritesButton.addEventListener("click", () => {
    const favorites = getFavorites();

    if (favorites.length === 0) {
      return;
    }

    const confirmed = confirm("Remove all favorite words?");

    if (!confirmed) {
      return;
    }

    localStorage.removeItem(FAVORITES_KEY);

    loadFavoriteWords();
  });
}

/* =====================================================
   HTML ESCAPE
===================================================== */

function escapeHTML(value) {
  return String(value)
    .replaceAll("&", "&amp;")

    .replaceAll("<", "&lt;")

    .replaceAll(">", "&gt;")

    .replaceAll('"', "&quot;")

    .replaceAll("'", "&#039;");
}

/* =====================================================
   START
===================================================== */

loadFavoriteWords();
