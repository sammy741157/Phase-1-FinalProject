const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('search-input');
const searchResults = document.getElementById('search-results');
const bookList = document.getElementById('book-list');
const themeToggle = document.getElementById('toggle-theme');

const API_URL = 'http://localhost:3000/favorites';
const GOOGLE_BOOKS_API_URL = 'https://www.googleapis.com/books/v1/volumes';

/**
 * Search books from Google Books API by query
 * @param {string} query - The search term
 * @returns {Promise<Array>} - Array of book items
 */
async function searchGoogleBooks(query) {
  try {
    const response = await fetch(`${GOOGLE_BOOKS_API_URL}?q=${encodeURIComponent(query)}&maxResults=10&printType=books`);
    const data = await response.json();
    console.log('Google Books API search results:', data);
    return data.items || [];
  } catch (error) {
    console.error('Google Books API error:', error);
    return [];
  }
}

// Load theme preference
window.addEventListener('DOMContentLoaded', () => {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') {
    document.body.classList.add('dark');
    console.log('Dark theme applied on load.');
  } else {
    console.log('Light theme applied on load.');
  }

  loadBooks();
});

// Toggle theme
themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  const isDark = document.body.classList.contains('dark');
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
  console.log(`Theme toggled to: ${isDark ? 'dark' : 'light'}`);
});

// Handle search
searchForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const query = searchInput.value.trim();
  if (!query) {
    console.log('Search input is empty.');
    return;
  }

  console.log('Searching for:', query);
  const books = await searchGoogleBooks(query);
  displaySearchResults(books);
});

// Display search results
function displaySearchResults(books) {
  searchResults.innerHTML = '';
  console.log(`Displaying ${books.length} search results.`);

  books.forEach(book => {
    const info = book.volumeInfo;

    const bookData = {
      title: info.title,
      author: info.authors ? info.authors.join(', ') : 'Unknown',
      previewLink: info.previewLink || '',
      image: info.imageLinks?.thumbnail || ''
    };

    const bookItem = document.createElement('div');
    bookItem.className = 'book-item';

    bookItem.innerHTML = `
      <img src="${bookData.image}" alt="Cover" style="height: 100px; margin-right: 10px;" />
      <div style="display:inline-block; vertical-align:top;">
        <strong>${bookData.title}</strong><br>
        <em>by ${bookData.author}</em><br>
        <a href="${bookData.previewLink}" target="_blank">Preview</a><br>
        <button class="add-btn">Add</button>
      </div>
    `;

    bookItem.querySelector('.add-btn').addEventListener('click', () => addBook(bookData));
    searchResults.appendChild(bookItem);
  });
}

// Load saved books from JSON server
async function loadBooks() {
  try {
    const res = await fetch(API_URL);
    const books = await res.json();
    console.log('Loaded books from API:', books);
    renderBookList(books);
  } catch (err) {
    console.error('Failed to load books from API:', err);
  }
}

// Add a book to the collection
async function addBook(book) {
  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(book)
    });
    const newBook = await res.json();
    console.log('Book added to API:', newBook);
    loadBooks(); // refresh list
  } catch (err) {
    console.error('Failed to add book:', err);
  }
}

// Remove a book
async function removeBook(id) {
  try {
    await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
    console.log(`Book with id ${id} removed.`);
    loadBooks();
  } catch (err) {
    console.error('Failed to remove book:', err);
  }
}

// Render the saved book list
function renderBookList(books) {
  bookList.innerHTML = '';
  books.forEach(book => {
    const li = document.createElement('li');
    li.innerHTML = `
      <strong>${book.title}</strong> by ${book.author}
      <button class="remove-btn">Remove</button>
    `;
    li.querySelector('.remove-btn').addEventListener('click', () => removeBook(book.id));
    bookList.appendChild(li);
  });
}

