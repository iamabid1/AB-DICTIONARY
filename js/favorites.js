/* =====================================================
   AB DICTIONARY
   FAVORITES PAGE
   FIRESTORE SYNC
===================================================== */

import {
  initializeApp,
  getApps,
  getApp,
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";

import {
  getAuth,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

/* =====================================================
   FIREBASE CONFIG
===================================================== */

const firebaseConfig = {
  apiKey: "AIzaSyADn7R4aMXqu6fYkc8q27XV43rZoYQUEI0",
  authDomain: "ab-dictionary.firebaseapp.com",
  projectId: "ab-dictionary",
  storageBucket: "ab-dictionary.firebasestorage.app",
  messagingSenderId: "695665425319",
  appId: "1:695665425319:web:713a16b92a2da0e55cd482",
  measurementId: "G-K8NQFKDT56",
};

/* =====================================================
   FIREBASE INITIALIZATION
===================================================== */

/*
  Reuse the existing Firebase app if app.js
  has already initialized it.
*/

const firebaseApp =
  getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

const auth = getAuth(firebaseApp);

const db = getFirestore(firebaseApp);

/* =====================================================
   CONSTANTS
===================================================== */

const FAVORITES_KEY = "abDictionaryFavorites";

/* =====================================================
   DOM ELEMENTS
===================================================== */

const favoritesGrid = document.getElementById("favorites-grid");

const favoritesEmpty = document.getElementById("favorites-empty");

const favoritesToolbar = document.getElementById("favorites-toolbar");

const favoritesCount = document.getElementById("favorites-count");

const favoriteTotal = document.getElementById("favorite-total");

const clearFavoritesButton = document.getElementById("clear-favorites");

/* =====================================================
   LOCAL STORAGE
===================================================== */

function getLocalFavorites() {
  try {
    const saved = localStorage.getItem(FAVORITES_KEY);

    if (!saved) {
      return [];
    }

    const parsed = JSON.parse(saved);

    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Could not load local favorites:", error);

    return [];
  }
}

function saveLocalFavorites(favorites) {
  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  } catch (error) {
    console.error("Could not save local favorites:", error);
  }
}

/* =====================================================
   FIRESTORE
===================================================== */

async function getFirestoreFavorites(user) {
  if (!user) {
    return [];
  }

  try {
    const favoritesRef = doc(db, "users", user.uid, "data", "favorites");

    const snapshot = await getDoc(favoritesRef);

    if (!snapshot.exists()) {
      return [];
    }

    const data = snapshot.data();

    return Array.isArray(data.words) ? data.words : [];
  } catch (error) {
    console.error("Could not load Firestore favorites:", error);

    return [];
  }
}

/* =====================================================
   SAVE FIRESTORE FAVORITES
===================================================== */

async function saveFirestoreFavorites(user, favorites) {
  if (!user) {
    return false;
  }

  try {
    const favoritesRef = doc(db, "users", user.uid, "data", "favorites");

    await setDoc(
      favoritesRef,
      {
        words: favorites,
        updatedAt: new Date().toISOString(),
      },
      {
        merge: true,
      },
    );

    return true;
  } catch (error) {
    console.error("Could not save Firestore favorites:", error);

    return false;
  }
}

/* =====================================================
   GET CURRENT FAVORITES
===================================================== */

async function getFavorites() {
  const user = auth.currentUser;

  /*
    Logged in:
    Firestore is the source of truth.
  */

  if (user) {
    return await getFirestoreFavorites(user);
  }

  /*
    Logged out:
    localStorage is used.
  */

  return getLocalFavorites();
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

    if (!Array.isArray(allWords)) {
      throw new Error("Dictionary data is not an array");
    }

    await renderFavorites(allWords);
  } catch (error) {
    console.error("Favorites loading error:", error);

    if (favoritesGrid) {
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
}

/* =====================================================
   RENDER FAVORITES
===================================================== */

async function renderFavorites(allWords) {
  if (!favoritesGrid) {
    return;
  }

  const favorites = await getFavorites();

  favoritesGrid.innerHTML = "";

  if (favoriteTotal) {
    favoriteTotal.textContent = favorites.length;
  }

  if (favoritesCount) {
    favoritesCount.textContent = `${favorites.length} ${
      favorites.length === 1 ? "saved word" : "saved words"
    }`;
  }

  /* =================================================
     EMPTY STATE
  ================================================= */

  if (favorites.length === 0) {
    favoritesGrid.style.display = "none";

    if (favoritesToolbar) {
      favoritesToolbar.style.display = "none";
    }

    if (favoritesEmpty) {
      favoritesEmpty.style.display = "block";
    }

    return;
  }

  /* =================================================
     HAS FAVORITES
  ================================================= */

  favoritesGrid.style.display = "grid";

  if (favoritesToolbar) {
    favoritesToolbar.style.display = "flex";
  }

  if (favoritesEmpty) {
    favoritesEmpty.style.display = "none";
  }

  favorites.forEach((favoriteWordName, index) => {
    const word = allWords.find(
      (item) =>
        item.word &&
        item.word.toLowerCase() === String(favoriteWordName).toLowerCase(),
    );

    /*
        If a saved word no longer exists
        in words.json, skip it.
      */

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

    /* =================================================
         REMOVE BUTTON
      ================================================= */

    const removeButton = card.querySelector(".favorite-remove");

    if (removeButton) {
      removeButton.addEventListener("click", async (event) => {
        event.stopPropagation();

        await removeFavorite(word.word, allWords);
      });
    }

    /* =================================================
         OPEN WORD
      ================================================= */

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

async function removeFavorite(word, allWords) {
  const user = auth.currentUser;

  let favorites = await getFavorites();

  favorites = favorites.filter(
    (item) => String(item).toLowerCase() !== String(word).toLowerCase(),
  );

  if (user) {
    const saved = await saveFirestoreFavorites(user, favorites);

    if (!saved) {
      alert("Could not remove this favorite. Please try again.");

      return;
    }
  } else {
    saveLocalFavorites(favorites);
  }

  await renderFavorites(allWords);
}

/* =====================================================
   CLEAR ALL FAVORITES
===================================================== */

if (clearFavoritesButton) {
  clearFavoritesButton.addEventListener("click", async () => {
    const favorites = await getFavorites();

    if (favorites.length === 0) {
      return;
    }

    const confirmed = confirm("Remove all favorite words?");

    if (!confirmed) {
      return;
    }

    const user = auth.currentUser;

    if (user) {
      const saved = await saveFirestoreFavorites(user, []);

      if (!saved) {
        alert("Could not clear your favorites. Please try again.");

        return;
      }
    } else {
      localStorage.removeItem(FAVORITES_KEY);
    }

    await loadFavoriteWords();
  });
}

/* =====================================================
   AUTH STATE
===================================================== */

onAuthStateChanged(auth, async (user) => {
  /*
      When the user signs in, load
      their Firestore favorites.
    */

  if (user) {
    await loadFavoriteWords();

    return;
  }

  /*
      When logged out, show local
      favorites if any exist.
    */

  await loadFavoriteWords();
});

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
