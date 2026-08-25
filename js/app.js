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


    window.location.href =
        `dictionary.html?search=${encodeURIComponent(word)}`;

}


if (searchButton) {

    searchButton.addEventListener(
        "click",
        performSearch
    );

}


if (homeSearch) {

    homeSearch.addEventListener(
        "keydown",
        (event) => {

            if (event.key === "Enter") {

                performSearch();

            }

        }
    );

}


/* ================= EXAMPLE WORDS ================= */

const exampleWords =
    document.querySelectorAll(".example-word");


exampleWords.forEach(button => {

    button.addEventListener("click", () => {

        if (!homeSearch) return;

        homeSearch.value =
            button.textContent.trim();

        homeSearch.focus();

    });

});


/* ================= THEME BUTTON ================= */

const themeToggle =
    document.getElementById("theme-toggle");


if (themeToggle) {

    themeToggle.addEventListener("click", () => {

        document.body.classList.toggle("light-mode");

    });

}