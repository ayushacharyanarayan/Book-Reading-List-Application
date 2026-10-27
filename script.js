"use strict";

const STORAGE_KEY = "reading-list-books";

// ---------- State ----------
let books = loadBooks();
let currentFilter = "All";

// ---------- Elements ----------
const form = document.getElementById("book-form");
const titleInput = document.getElementById("title");
const authorInput = document.getElementById("author");
const statusInput = document.getElementById("status");
const formError = document.getElementById("form-error");
const bookList = document.getElementById("book-list");
const emptyMessage = document.getElementById("empty-message");
const filterButtons = document.querySelectorAll(".filter");

const counts = {
  total: document.getElementById("count-total"),
  "To Read": document.getElementById("count-to-read"),
  Reading: document.getElementById("count-reading"),
  Finished: document.getElementById("count-finished")
};

const STATUSES = ["To Read", "Reading", "Finished"];

// ---------- Storage ----------
function loadBooks() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    return [];
  }
}

function saveBooks() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
  } catch (error) {
    // Storage may be unavailable; the app still works for this session.
  }
}

// ---------- Actions ----------
function addBook(title, author, status) {
  books.push({
    id: Date.now() + Math.random(),
    title: title,
    author: author,
    status: status
  });
  saveBooks();
  render();
}

function deleteBook(id) {
  books = books.filter(function (book) {
    return book.id !== id;
  });
  saveBooks();
  render();
}

function updateStatus(id, newStatus) {
  books.forEach(function (book) {
    if (book.id === id) book.status = newStatus;
  });
  saveBooks();
  render();
}

// ---------- Rendering ----------
function statusClass(status) {
  return status.toLowerCase().replace(" ", "-");
}

function updateSummary() {
  counts.total.textContent = books.length;
  STATUSES.forEach(function (status) {
    counts[status].textContent = books.filter(function (b) {
      return b.status === status;
    }).length;
  });
}

function createBookItem(book) {
  const li = document.createElement("li");
  li.className = "book " + statusClass(book.status);

  const info = document.createElement("div");
  info.className = "book-info";

  const title = document.createElement("div");
  title.className = "book-title";
  title.textContent = book.title;

  const author = document.createElement("div");
  author.className = "book-author";
  author.textContent = "by " + book.author;

  info.appendChild(title);
  info.appendChild(author);

  const actions = document.createElement("div");
  actions.className = "book-actions";

  const select = document.createElement("select");
  select.setAttribute("aria-label", "Change status of " + book.title);
  STATUSES.forEach(function (status) {
    const option = document.createElement("option");
    option.value = status;
    option.textContent = status;
    if (status === book.status) option.selected = true;
    select.appendChild(option);
  });
  select.addEventListener("change", function () {
    updateStatus(book.id, select.value);
  });

  const del = document.createElement("button");
  del.className = "delete-btn";
  del.textContent = "Delete";
  del.addEventListener("click", function () {
    deleteBook(book.id);
  });

  actions.appendChild(select);
  actions.appendChild(del);

  li.appendChild(info);
  li.appendChild(actions);
  return li;
}

function render() {
  updateSummary();

  const visible = books.filter(function (book) {
    return currentFilter === "All" || book.status === currentFilter;
  });

  bookList.innerHTML = "";
  visible.forEach(function (book) {
    bookList.appendChild(createBookItem(book));
  });

  emptyMessage.classList.toggle("hidden", visible.length > 0);
}

// ---------- Events ----------
form.addEventListener("submit", function (event) {
  event.preventDefault();

  const title = titleInput.value.trim();
  const author = authorInput.value.trim();

  if (!title || !author) {
    formError.textContent = "Please enter both a title and an author.";
    return;
  }

  const duplicate = books.some(function (b) {
    return b.title.toLowerCase() === title.toLowerCase() &&
           b.author.toLowerCase() === author.toLowerCase();
  });
  if (duplicate) {
    formError.textContent = "That book is already in your list.";
    return;
  }

  formError.textContent = "";
  addBook(title, author, statusInput.value);
  form.reset();
  titleInput.focus();
});

filterButtons.forEach(function (button) {
  button.addEventListener("click", function () {
    currentFilter = button.dataset.filter;
    filterButtons.forEach(function (b) {
      b.classList.toggle("active", b === button);
    });
    render();
  });
});

// ---------- Start ----------
render();
