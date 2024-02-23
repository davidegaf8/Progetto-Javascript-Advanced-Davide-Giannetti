import "../CSS/styles.css";
import axios from "axios";
import _ from "lodash";

// Get references to the HTML elements

const searchBar = document.getElementById("search-bar");
const searchButton = document.getElementById("search-button");
const results = document.getElementById("results");
const errorMessage = document.getElementById("error-message");
const searchSection = document.getElementById("search-section");

// Add event listeners for the search bar and search button

searchBar.addEventListener("keyup", (event) => {
  if (event.key === "Enter") {
    searchBooks();
  }
});

searchButton.addEventListener("click", searchBooks);

// Function to make the API call and create the cards

function searchBooks() {
  clearResults();
  hideErrorMessage();
  const subject = getSearchSubject();
  const url = buildSearchUrl(subject);
  showSpinner();
  axios.get(url)
    .then((response) => {
      if (response.data) {
        hideSpinner();
        displayResults(response.data);
      } else {
        handleSearchError();
      }
    })
    .catch((error) => {
      handleSearchError();
    });
}

// Clear the search results and error message

function clearResults() {
  results.innerHTML = "";
  errorMessage.style.display = "none";
  while (results.firstChild) {
    results.removeChild(results.firstChild);
  }
}

// Hide the error message

function hideErrorMessage() {
  errorMessage.style.display = "none";
}

// Get the search subject from the search bar

function getSearchSubject() {
  if (searchBar.value === "") {
    showNoResultsMessage();
    return "";
  } else {
    return searchBar.value.toLowerCase().trim();
  }
}

// Build the search URL based on the search subject

function buildSearchUrl(subject) {
  return `https://openlibrary.org/subjects/${subject}.json?limit=20`;
}

// Display the search results as cards

function displayResults(data) {
  _.forEach(data, (value, key) => {
    if (key === "works") {
      _.forEach(value, (item) => {
        const card = createCard(item);
        results.appendChild(card);
        searchSection.scrollIntoView({ behavior: "smooth" });
      });
    }
    if (value.length === 0) {
      showNoResultsMessage();
    }
  });
}


// Create a card for each search result

function createCard(item) {
  const card = document.createElement("div");
  card.classList.add("card");
  const title = createTitle(item.title);
  const author = createAuthor(item.authors[0].name);
  const image = createImage(item.cover_id);
  card.appendChild(image);
  card.appendChild(title);
  card.appendChild(author);
  card.appendChild(createDescriptionButton(item));

  return card;
}

// Create a title element for the card

function createTitle(titleText) {
  const title = document.createElement("h2");
  title.textContent = truncateTitle(titleText);
  if (titleText.length > 35) {
    addTitleHoverEvent(title, titleText);
  }
  return title;
}

// Truncate the title if it's too long
function truncateTitle(titleText) {
  return titleText.length > 35 ? titleText.slice(0, 35) + "..." : titleText;
}

// Add a hover event to show the full title

function addTitleHoverEvent(title, titleText) {
  title.addEventListener("mouseover", () => {
    title.title = titleText;
  });
}

// Create an author element for the card

function createAuthor(authorName) {
  const author = document.createElement("p");
  author.textContent = authorName;
  return author;
}

// Create an image element for the card

function createImage(coverId) {
  const image = document.createElement("img");
  image.setAttribute(
    "src",
    `https://covers.openlibrary.org/b/id/${coverId}-M.jpg`
  );
  image.setAttribute("alt", "Book Cover");
  image.setAttribute("onerror", "this.src='Img/default-image.jpg'");
  if (coverId === null) {
    image.src = "Img/default-image.jpg";
  }
  return image;
}

// Show a message when no results are found

function showNoResultsMessage() {
  errorMessage.style.display = "flex";
  errorMessage.innerHTML =
    "<box-icon name='x-circle' type='solid' color='#d80a08' ></box-icon>&nbspNo results found. Please try again.";
}

// Handle errors during the search

function handleSearchError() {
  hideSpinner();
  clearResults();
  errorMessage.style.display = "flex";
  errorMessage.innerHTML =
    "<box-icon name='x-circle' type='solid' color='#d80a08' ></box-icon>&nbspAn error occurred. Please try again.";
}

// Add event listener to reset after the search

searchBar.addEventListener("keyup", (event) => {
  if (event.key === "Backspace") {
    if (searchBar.value === "") {
      errorMessage.style.display = "none";
      results.innerHTML = " <h1>Find your next book</h1>";
    }
  }
});

//LOADING SPINNER FUNCTIONS

function showSpinner() {
  const spinner = document.querySelector(".spinner-container");
  spinner.style.display = "block";
}
function hideSpinner() {
  const spinner = document.querySelector(".spinner-container");
  spinner.style.display = "none";
}

//MODAL FUNCTIONS

// Function to create a description button for a book

function createDescriptionButton(item) {
  const descriptionBtn = document.createElement("button");
  descriptionBtn.classList.add("description-btn");
  descriptionBtn.textContent = "Description";
  descriptionBtn.addEventListener("click", () => {
    showModal(item);
  });
  return descriptionBtn;
}

// Function to display the modal for a book

function showModal(book) {
  axios.get(`https://openlibrary.org${book.key}.json`)
    .then((response) => response.data)
    .then((data) => {
      setBodyStyle();
      const modal = document.createElement("div");
      modal.classList.add("modal");
      document.body.appendChild(modal);
      modal.style.display = "flex";
      if (typeof data.description === "object") {
        Object.keys(data.description).forEach((elem) => {
          modal.innerHTML = `<div class="modal-content"><h2>${book.title}</h2>
          <h5>${book.authors[0].name}</h5>
          <p>${data.description[elem]}</p></div>`;
        });
      } else if (typeof data.description === "undefined") {
        modal.innerHTML = `<div class="modal-content"><h2>${book.title}</h2>
          <h5>${book.authors[0].name}</h5>
          <p>No description available</p></div>`;
      } else {
        modal.innerHTML = `<div class="modal-content"><h2>${book.title}</h2>
          <h5>${book.authors[0].name}</h5>
          <p>${data.description}</p></div>`;
      }
      AddCloseButton(modal);
    })
    .catch((error) => {
      alert("An error occurred. Please try again.");
    });
}

//to change the style of the body when modal is opened

function setBodyStyle() {
  document.body.style.overflow = "hidden";
  document.body.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
}

// Function to add a close button to the modal

function AddCloseButton(modal) {
  const closeBtn = document.createElement("button");
      closeBtn.textContent = "Close";
      closeBtn.addEventListener("click", () => {
        modal.style.display = "none";
        document.body.removeChild(modal);
        document.body.style.overflow = "auto";
        document.body.style.backgroundColor = "whitesmoke";
      });
      modal.appendChild(closeBtn);
}