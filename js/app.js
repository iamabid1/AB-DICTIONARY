/* =====================================================
   AB DICTIONARY
   GLOBAL JAVASCRIPT
===================================================== */

/* =====================================================
   FIREBASE AUTHENTICATION + FIRESTORE
===================================================== */

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";

import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

/* ================= FIREBASE CONFIG ================= */

const firebaseConfig = {
  apiKey: "AIzaSyADn7R4aMXqu6fYkc8q27XV43rZoYQUEI0",
  authDomain: "ab-dictionary.firebaseapp.com",
  projectId: "ab-dictionary",
  storageBucket: "ab-dictionary.firebasestorage.app",
  messagingSenderId: "695665425319",
  appId: "1:695665425319:web:713a16b92a2da0e55cd482",
  measurementId: "G-K8NQFKDT56",
};

/* ================= INITIALIZE FIREBASE ================= */

const firebaseApp = initializeApp(firebaseConfig);

const auth = getAuth(firebaseApp);

const googleProvider = new GoogleAuthProvider();

const db = getFirestore(firebaseApp);

/* =====================================================
   ACCOUNT ELEMENTS
===================================================== */

const accountWrapper = document.getElementById("account-wrapper");

const googleLoginButton = document.getElementById("google-login-button");

const googleLoginText = document.getElementById("google-login-text");

const accountAvatar = document.getElementById("account-avatar");

const accountMenu = document.getElementById("account-menu");

const accountMenuAvatar = document.getElementById("account-menu-avatar");

const accountName = document.getElementById("account-name");

const accountEmail = document.getElementById("account-email");

const accountSignout = document.getElementById("account-signout");

/* =====================================================
   ACCOUNT MENU
===================================================== */

function openAccountMenu() {
  if (!accountWrapper) return;

  accountWrapper.classList.add("open");

  accountMenu?.setAttribute("aria-hidden", "false");
}

function closeAccountMenu() {
  if (!accountWrapper) return;

  accountWrapper.classList.remove("open");

  accountMenu?.setAttribute("aria-hidden", "true");
}

function toggleAccountMenu() {
  if (!accountWrapper) return;

  const isOpen = accountWrapper.classList.contains("open");

  if (isOpen) {
    closeAccountMenu();
  } else {
    openAccountMenu();
  }
}

/* =====================================================
   GOOGLE SIGN IN
===================================================== */

if (googleLoginButton) {
  googleLoginButton.addEventListener("click", async () => {
    /*
        If already signed in:
        open account menu.
      */

    if (auth.currentUser) {
      toggleAccountMenu();
      return;
    }

    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Google Sign-In Error:", error);

      if (error.code === "auth/popup-closed-by-user") {
        return;
      }

      if (error.code === "auth/popup-blocked") {
        alert(
          "Google Sign-In popup was blocked. Please allow popups for this site.",
        );
        return;
      }

      if (error.code === "auth/unauthorized-domain") {
        alert("This website domain is not authorized in Firebase.");
        return;
      }

      alert("Google Sign-In failed. Please try again.");
    }
  });
}

/* =====================================================
   SIGN OUT
===================================================== */

if (accountSignout) {
  accountSignout.addEventListener("click", async () => {
    try {
      await signOut(auth);

      closeAccountMenu();
    } catch (error) {
      console.error("Sign out error:", error);

      alert("Could not sign out. Please try again.");
    }
  });
}

/* =====================================================
   CLOSE ACCOUNT MENU OUTSIDE CLICK
===================================================== */

document.addEventListener("click", (event) => {
  if (!accountWrapper) return;

  if (!accountWrapper.contains(event.target)) {
    closeAccountMenu();
  }
});

/* =====================================================
   ESCAPE KEY
===================================================== */

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeAccountMenu();
  }
});

/* =====================================================
   HOME FAVORITES
   FIRESTORE + LOCAL STORAGE
===================================================== */

const HOME_FAVORITES_KEY = "abDictionaryFavorites";

/* =====================================================
   LOCAL STORAGE
===================================================== */

function getLocalFavorites() {
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

function saveLocalFavorites(favorites) {
  try {
    localStorage.setItem(HOME_FAVORITES_KEY, JSON.stringify(favorites));
  } catch (error) {
    console.error("Could not save local favorites:", error);
  }
}

/* =====================================================
   FIRESTORE FAVORITES
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

async function getHomeFavorites() {
  const user = auth.currentUser;

  /*
    Logged in:
    use Firestore.
  */

  if (user) {
    return await getFirestoreFavorites(user);
  }

  /*
    Logged out:
    use localStorage.
  */

  return getLocalFavorites();
}

/* =====================================================
   UPDATE FAVORITE BUTTON
===================================================== */

async function updateHomeFavoriteButton(button, word) {
  if (!button || !word) {
    return;
  }

  const favorites = await getHomeFavorites();

  const saved = favorites.some(
    (item) => String(item).toLowerCase() === String(word).toLowerCase(),
  );

  button.textContent = saved ? "★" : "☆";

  button.setAttribute(
    "aria-label",
    saved ? "Remove from favorites" : "Add to favorites",
  );

  button.classList.toggle("is-favorite", saved);
}

/* =====================================================
   TOGGLE FAVORITE
===================================================== */

async function toggleHomeFavorite(word, button) {
  if (!word || !button) {
    return;
  }

  const user = auth.currentUser;

  let favorites = await getHomeFavorites();

  const index = favorites.findIndex(
    (item) => String(item).toLowerCase() === String(word).toLowerCase(),
  );

  /* ================= REMOVE ================= */

  if (index !== -1) {
    favorites.splice(index, 1);
  } else {

  /* ================= ADD ================= */
    favorites.push(word);
  }

  /* ================= SAVE ================= */

  if (user) {
    const saved = await saveFirestoreFavorites(user, favorites);

    if (!saved) {
      alert(
        "Could not save your favorite. Please check your internet connection and try again.",
      );

      return;
    }
  } else {
    saveLocalFavorites(favorites);
  }

  /* ================= UPDATE BUTTON ================= */

  button.textContent = index !== -1 ? "☆" : "★";

  button.setAttribute(
    "aria-label",
    index !== -1 ? "Add to favorites" : "Remove from favorites",
  );

  button.classList.toggle("is-favorite", index === -1);
}

/* =====================================================
   SYNC LOCAL FAVORITES → FIRESTORE
===================================================== */

async function syncFavoritesAfterLogin(user) {
  if (!user) {
    return;
  }

  try {
    const localFavorites = getLocalFavorites();

    const firestoreFavorites = await getFirestoreFavorites(user);

    /*
      Existing account data wins.

      If Firestore already contains
      favorites, keep them.

      If this is a new account and
      local favorites exist, upload them.
    */

    let finalFavorites = firestoreFavorites;

    if (firestoreFavorites.length === 0 && localFavorites.length > 0) {
      finalFavorites = localFavorites;

      await saveFirestoreFavorites(user, finalFavorites);
    }

    /*
      Local favorites are no longer
      needed after account sync.
    */

    localStorage.removeItem(HOME_FAVORITES_KEY);

    /*
      Refresh any favorite button
      currently visible on the page.
    */

    const favoriteButtons = document.querySelectorAll(".favorite-button");

    for (const button of favoriteButtons) {
      const word = button.dataset.word;

      if (word) {
        await updateHomeFavoriteButton(button, word);
      }
    }

    return finalFavorites;
  } catch (error) {
    console.error("Favorite synchronization error:", error);
  }
}

/* =====================================================
   FIREBASE AUTH STATE
===================================================== */

onAuthStateChanged(auth, async (user) => {
  /*
      IMPORTANT:
      Do NOT return here if the login
      button doesn't exist.

      Some pages may not have the
      account UI, but Firestore still
      needs to work.
    */

  if (user) {
    /* =================================================
         USER IS LOGGED IN
      ================================================= */

    await syncFavoritesAfterLogin(user);

    /* ================= ACCOUNT UI ================= */

    if (googleLoginButton) {
      googleLoginButton.classList.add("logged-in");

      const displayName = user.displayName || "Google User";

      const firstName = displayName.split(" ")[0];

      /* ================= BUTTON ================= */

      if (googleLoginText) {
        googleLoginText.textContent = firstName;
      }

      googleLoginButton.title = "Open account menu";

      googleLoginButton.setAttribute(
        "aria-label",
        `Open account menu for ${displayName}`,
      );
    }

    /* ================= ACCOUNT NAME ================= */

    if (accountName) {
      accountName.textContent = user.displayName || "Google User";
    }

    /* ================= EMAIL ================= */

    if (accountEmail) {
      accountEmail.textContent = user.email || "Google account";
    }

    /* ================= PROFILE IMAGE ================= */

    if (user.photoURL) {
      if (accountAvatar) {
        accountAvatar.src = user.photoURL;

        accountAvatar.alt = user.displayName || "Google User";
      }

      if (accountMenuAvatar) {
        accountMenuAvatar.src = user.photoURL;

        accountMenuAvatar.alt = user.displayName || "Google User";
      }
    }

    /* ================= MENU VISIBILITY ================= */

    if (accountWrapper) {
      accountWrapper.classList.add("has-user");
    }
  } else {
    /* =================================================
         USER IS LOGGED OUT
      ================================================= */

    if (googleLoginButton) {
      googleLoginButton.classList.remove("logged-in");

      if (googleLoginText) {
        googleLoginText.textContent = "Sign in";
      }

      googleLoginButton.title = "Sign in with Google";

      googleLoginButton.setAttribute("aria-label", "Sign in with Google");
    }

    /* ================= RESET ACCOUNT ================= */

    if (accountName) {
      accountName.textContent = "Account";
    }

    if (accountEmail) {
      accountEmail.textContent = "Not signed in";
    }

    if (accountAvatar) {
      accountAvatar.removeAttribute("src");
    }

    if (accountMenuAvatar) {
      accountMenuAvatar.removeAttribute("src");
    }

    if (accountWrapper) {
      accountWrapper.classList.remove("has-user");
    }

    closeAccountMenu();
  }
});

/* =====================================================
   MOBILE MENU
===================================================== */

const menuToggle = document.getElementById("menu-toggle");

const mobileMenu = document.getElementById("mobile-menu");

if (menuToggle && mobileMenu) {
  menuToggle.addEventListener("click", () => {
    mobileMenu.classList.toggle("open");

    const isOpen = mobileMenu.classList.contains("open");

    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });
}

/* =====================================================
   HOME SEARCH
===================================================== */

const homeSearch = document.getElementById("home-search");

const searchButton = document.getElementById("search-button");

function performSearch() {
  if (!homeSearch) {
    return;
  }

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

/* =====================================================
   EXAMPLE WORDS
===================================================== */

const exampleWords = document.querySelectorAll(".example-word");

exampleWords.forEach((button) => {
  button.addEventListener("click", () => {
    if (!homeSearch) {
      return;
    }

    homeSearch.value = button.textContent.trim();

    homeSearch.focus();
  });
});

/* =====================================================
   THEME BUTTON
===================================================== */

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
  const wordCard = document.querySelector(".word-card");

  if (!wordCard) {
    return;
  }

  try {
    const response = await fetch("data/words.json");

    if (!response.ok) {
      throw new Error("Could not load words.json");
    }

    const words = await response.json();

    if (!Array.isArray(words) || words.length === 0) {
      throw new Error("Dictionary contains no words");
    }

    const today = new Date();

    const year = today.getFullYear();

    const month = today.getMonth();

    const day = today.getDate();

    const dateNumber = Math.floor(
      new Date(year, month, day).getTime() / 86400000,
    );

    const index = Math.abs(dateNumber) % words.length;

    const word = words[index];

    if (!word) {
      return;
    }

    /* ================= WORD ================= */

    const title = wordCard.querySelector("h3");

    if (title) {
      title.textContent = word.word || "";
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

    /* ================= SYNONYMS / ANTONYMS ================= */

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
      /*
        Store the word on the button.
        This lets the login sync refresh
        the button later.
      */

      favoriteButton.dataset.word = word.word;

      await updateHomeFavoriteButton(favoriteButton, word.word);

      favoriteButton.onclick = async () => {
        await toggleHomeFavorite(word.word, favoriteButton);
      };
    }
  } catch (error) {
    console.error("Word of the Day error:", error);
  }
}

/* =====================================================
   CREATE TAGS
===================================================== */

function createTags(items) {
  if (!Array.isArray(items)) {
    return "";
  }

  return items
    .slice(0, 6)
    .map((item) => `<span class="tag">${escapeWordHTML(item)}</span>`)
    .join("");
}

/* =====================================================
   HTML SAFETY
===================================================== */

function escapeWordHTML(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

/* =====================================================
   HOMEPAGE DICTIONARY STATISTICS
===================================================== */

async function loadDictionaryStats() {
  const wordCount = document.getElementById("word-count");

  const categoryCount = document.getElementById("category-count");

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

/* =====================================================
   START
===================================================== */

loadWordOfTheDay();

loadDictionaryStats();
