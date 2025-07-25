let allCourses = [];
let filteredCourses = [];
let currentFilter = 'all';
let currentSort = 'newest';

let coursesGrid, coursesLoadingElement, noResultsElement, searchInput, sortSelect, filterButtons;

document.addEventListener('DOMContentLoaded', function () {
  coursesGrid = document.getElementById('courses-grid');
  coursesLoadingElement = document.getElementById('loading');
  noResultsElement = document.getElementById('no-results');
  searchInput = document.getElementById('search-input');
  sortSelect = document.getElementById('sort-select');
  filterButtons = document.querySelectorAll('.filter-btn');

  initializeEventListeners();
  waitForFirebaseInit(loadCourses);
});

function waitForFirebaseInit(callback) {
  const interval = setInterval(() => {
    if (window.firebaseServicesInitialized && typeof window.db === 'function') {
      clearInterval(interval);
      callback();
    }
  }, 100);
}

function initializeEventListeners() {
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      applyFiltersAndSort();
      displayCourses();
    });
  }

  if (sortSelect) {
    sortSelect.addEventListener('change', function () {
      currentSort = this.value;
      applyFiltersAndSort();
      displayCourses();
    });
  }

  if (filterButtons) {
    filterButtons.forEach((button) => {
      button.addEventListener('click', function () {
        filterButtons.forEach((btn) =>
          btn.classList.remove('active', 'bg-blue-600', 'text-white')
        );
        filterButtons.forEach((btn) =>
          btn.classList.add('border-gray-300', 'hover:bg-gray-50')
        );

        this.classList.add('active', 'bg-blue-600', 'text-white');
        this.classList.remove('border-gray-300', 'hover:bg-gray-50');

        currentFilter = this.id.replace('filter-', '');
        applyFiltersAndSort();
        displayCourses();
      });
    });
  }
}

async function loadCourses() {
  try {
    if (coursesLoadingElement) coursesLoadingElement.classList.remove('hidden');
    if (coursesGrid) coursesGrid.classList.add('hidden');

    const snapshot = await window.db().collection('courses').get();
    allCourses = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    filteredCourses = [...allCourses];

    applyFiltersAndSort();
    displayCourses();

    if (coursesLoadingElement) coursesLoadingElement.classList.add('hidden');
    if (coursesGrid) coursesGrid.classList.remove('hidden');
  } catch (error) {
    console.error('Error loading courses:', error);
    if (coursesLoadingElement) {
      coursesLoadingElement.innerHTML = '<p class="text-red-600">Error loading courses. Please refresh the page.</p>';
    }
  }
}

function displayCourses() {
  if (!coursesGrid || !noResultsElement) return;

  if (filteredCourses.length === 0) {
    coursesGrid.classList.add('hidden');
    noResultsElement.classList.remove('hidden');
    return;
  }

  noResultsElement.classList.add('hidden');
  coursesGrid.classList.remove('hidden');

  coursesGrid.innerHTML = filteredCourses.map(createCourseCard).join('');
}

function createCourseCard(course) {
  const priceHTML = course.price === 0
    ? '<span class="text-green-600 font-bold text-lg">Free</span>'
    : `<span class="text-blue-600 font-bold text-lg">$${course.price || '—'}</span>`;

  const ratingHTML = generateStarRating(course.rating || 0);
  const instructor = course.instructor || 'Instructor';
  const level = course.level || 'All levels';
  const duration = course.duration || 'N/A';
  const category = course.category || 'General';
  const description = course.description || '';

  return `
    <div class="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 course-card">
      <div class="relative">
        <img src="${course.image}" alt="${course.title}" class="w-full h-48 object-cover">
        <div class="absolute top-4 right-4">
          ${course.price === 0
            ? '<span class="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold">FREE</span>'
            : '<span class="bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-semibold">PREMIUM</span>'}
        </div>
      </div>
      <div class="p-6">
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm text-gray-500">${category}</span>
          <span class="text-sm text-gray-500">${level}</span>
        </div>
        <h3 class="text-xl font-bold mb-2 text-gray-900">${course.title}</h3>
        <p class="text-gray-600 mb-4">${description}</p>

        <div class="flex items-center mb-4">
          <div class="flex text-yellow-400 mr-2">${ratingHTML}</div>
          <span class="text-sm text-gray-600">${course.rating || '0.0'} (${course.reviews || 0} reviews)</span>
        </div>

        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center text-sm text-gray-600">
            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            ${instructor}
          </div>
          <div class="flex items-center text-sm text-gray-600">
            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            ${duration}
          </div>
        </div>

        <div class="flex items-center justify-between">
          ${priceHTML}
          <a href="course-details.html?id=${course.id}" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-semibold">
            Learn More
          </a>
        </div>

        <div class="mt-3 text-xs text-gray-500 flex items-center">
          <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          ${course.students ? course.students.toLocaleString() : '0'} students
        </div>
      </div>
    </div>
  `;
}

function generateStarRating(rating) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
  let starsHTML = '';

  for (let i = 0; i < fullStars; i++) {
    starsHTML += '<svg class="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="..."/></svg>';
  }

  if (hasHalfStar) {
    starsHTML += '<svg class="w-4 h-4 fill-current" viewBox="0 0 20 20"><defs><linearGradient id="half"><stop offset="50%" stop-color="currentColor"/><stop offset="50%" stop-color="transparent"/></linearGradient><path fill="url(#half)" d="..."/></svg>';
  }

  for (let i = 0; i < emptyStars; i++) {
    starsHTML += '<svg class="w-4 h-4 text-gray-300 fill-current" viewBox="0 0 20 20"><path d="..."/></svg>';
  }

  return starsHTML;
}

function applyFiltersAndSort() {
  filteredCourses = allCourses.filter(course => {
    if (currentFilter === 'free' && course.price !== 0) return false;
    if (currentFilter === 'paid' && course.price === 0) return false;

    if (searchInput && searchInput.value) {
      const term = searchInput.value.toLowerCase();
      return (course.title || '').toLowerCase().includes(term) ||
             (course.instructor || '').toLowerCase().includes(term) ||
             (course.category || '').toLowerCase().includes(term) ||
             (course.description || '').toLowerCase().includes(term);
    }

    return true;
  });

  switch (currentSort) {
    case 'newest':
      filteredCourses.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      break;
    case 'popular':
      filteredCourses.sort((a, b) => (b.students || 0) - (a.students || 0));
      break;
    case 'rating':
      filteredCourses.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      break;
    case 'price-low':
      filteredCourses.sort((a, b) => (a.price || 0) - (b.price || 0));
      break;
    case 'price-high':
      filteredCourses.sort((a, b) => (b.price || 0) - (a.price || 0));
      break;
  }
}
