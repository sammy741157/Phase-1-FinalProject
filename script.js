const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('search-input');
const searchResults = document.getElementById('search-results');
const bookList = document.getElementById('book-list');
const themeToggle = document.getElementById('toggle-theme');

// Load theme preference
window.addEventListener('DOMContentLoaded', () => {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') {
    document.body.classList.add('dark');
    console.log('Dark theme applied on load.');
  } else {
    console.log('Light theme applied on load.');
  }

  favoriteBooks = JSON.parse(localStorage.getItem('favoriteBooks')) || [];
  console.log('Loaded favorite books from localStorage:', favoriteBooks);
  renderBookList();
});

// Toggle dark mode
themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  const isDark = document.body.classList.contains('dark');
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
  console.log(`Theme toggled to: ${isDark ? 'dark' : 'light'}`);
});

let favoriteBooks = [];

searchForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const query = searchInput.value.trim();
  if (!query) {
    console.log('Search input is empty.');
    return;
  }

  console.log('Searching for:', query);

  try {
    const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}`);
    const data = await response.json();
    console.log('API response:', data);
    displaySearchResults(data.items || []);
  } catch (error) {
    console.error('Error fetching books:', error);
  }
});

function displaySearchResults(books) {
  searchResults.innerHTML = '';
  console.log(`Displaying ${books.length} search results.`);
  
  books.forEach(book => {
    const info = book.volumeInfo;
    const bookItem = document.createElement('div');
    bookItem.className = 'book-item';

    const bookData = {
      title: info.title,
      author: info.authors ? info.authors.join(', ') : 'Unknown'
    };

    bookItem.innerHTML = `
      <strong>${bookData.title}</strong> by ${bookData.author}
      <button onclick='addBook(${JSON.stringify(bookData)})'>Add</button>
    `;

    searchResults.appendChild(bookItem);
  });
}

function addBook(book) {
  favoriteBooks.push(book);
  console.log('Book added to favorites:', book);
  saveBooks();
  renderBookList();
}

function removeBook(index) {
  const removed = favoriteBooks.splice(index, 1);
  console.log('Book removed from favorites:', removed[0]);
  saveBooks();
  renderBookList();
}

function saveBooks() {
  localStorage.setItem('favoriteBooks', JSON.stringify(favoriteBooks));
  console.log('Favorite books saved to localStorage.');
}

function renderBookList() {
  bookList.innerHTML = '';
  console.log('Rendering favorite books list:', favoriteBooks);
  
  favoriteBooks.forEach((book, index) => {
    const li = document.createElement('li');
    li.textContent = `${book.title} by ${book.author}`;
    const removeBtn = document.createElement('button');
    removeBtn.textContent = 'Remove';
    removeBtn.className = 'remove-btn';
    removeBtn.onclick = () => removeBook(index);
    li.appendChild(removeBtn);
    bookList.appendChild(li);
  });
}
