let enrolledCourses = [];
let currentTab = 'all';

// DOM Elements
let authRequired;
let dashboardContent;
let coursesContainer;
let myCoursesLoadingElement;
let noCoursesElement;
let tabButtons;

// Initialize DOM elements when page loads
document.addEventListener('DOMContentLoaded', function () {
  authRequired = document.getElementById('auth-required');
  dashboardContent = document.getElementById('dashboard-content');
  coursesContainer = document.getElementById('courses-container');
  myCoursesLoadingElement = document.getElementById('loading');
  noCoursesElement = document.getElementById('no-courses');
  tabButtons = document.querySelectorAll('.tab-btn');

  // Initialize tab switching
  initializeTabSwitching();

  // Initialize login prompt
  const loginPrompt = document.getElementById('login-prompt');
  if (loginPrompt) {
    loginPrompt.addEventListener('click', function () {
      showLoginModal();
    });
  }
});

// Authentication state listener
firebase.auth().onAuthStateChanged(function (user) {
  updateAuthUI(user);

  if (user) {
    if (authRequired) authRequired.classList.add('hidden');
    if (dashboardContent) dashboardContent.classList.remove('hidden');
    loadEnrolledCourses();
  } else {
    if (authRequired) authRequired.classList.remove('hidden');
    if (dashboardContent) dashboardContent.classList.add('hidden');
  }
});

// Load enrolled courses
async function loadEnrolledCourses() {
  if (!currentUser) return;

  try {
    if (myCoursesLoadingElement) myCoursesLoadingElement.classList.remove('hidden');
    if (coursesContainer) coursesContainer.classList.add('hidden');

    // Get user's enrollments
    const enrollmentsSnapshot = await db.collection('enrollments')
      .where('userId', '==', currentUser.uid)
      .get();

    const enrollmentData = enrollmentsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Get course details for each enrollment
    enrolledCourses = [];
    for (const enrollment of enrollmentData) {
      const courseDoc = await db.collection('courses').doc(enrollment.courseId).get();
      if (courseDoc.exists) {
        enrolledCourses.push({
          ...courseDoc.data(),
          courseId: courseDoc.id,
          enrollmentId: enrollment.id,
          progress: enrollment.progress || 0,
          completed: enrollment.completed || false,
          enrolledAt: enrollment.enrolledAt
        });
      }
    }

    updateStats();
    displayCourses();

    if (myCoursesLoadingElement) myCoursesLoadingElement.classList.add('hidden');
    if (coursesContainer) coursesContainer.classList.remove('hidden');
  } catch (error) {
    console.error('Error loading enrolled courses:', error);
    if (myCoursesLoadingElement) {
      myCoursesLoadingElement.innerHTML = '<p class="text-red-600">Error loading courses. Please refresh the page.</p>';
    }
  }
}

// Update statistics
function updateStats() {
  const totalCourses = enrolledCourses.length;
  const completedCourses = enrolledCourses.filter(course => course.completed).length;
  const progressCourses = enrolledCourses.filter(course => !course.completed && course.progress > 0).length;
  const certificates = completedCourses; // Completed courses = certificates

  const totalCoursesElement = document.getElementById('total-courses');
  const completedCoursesElement = document.getElementById('completed-courses');
  const progressCoursesElement = document.getElementById('progress-courses');
  const certificatesElement = document.getElementById('certificates-count');

  if (totalCoursesElement) totalCoursesElement.textContent = totalCourses;
  if (completedCoursesElement) completedCoursesElement.textContent = completedCourses;
  if (progressCoursesElement) progressCoursesElement.textContent = progressCourses;
  if (certificatesElement) certificatesElement.textContent = certificates;
}

// Display courses based on current tab
function displayCourses() {
  if (!coursesContainer || !noCoursesElement) return;

  let coursesToShow = [];

  switch (currentTab) {
    case 'all':
      coursesToShow = enrolledCourses;
      break;
    case 'in-progress':
      coursesToShow = enrolledCourses.filter(course => !course.completed && course.progress > 0);
      break;
    case 'completed':
      coursesToShow = enrolledCourses.filter(course => course.completed);
      break;
  }

  if (coursesToShow.length === 0) {
    coursesContainer.classList.add('hidden');
    noCoursesElement.classList.remove('hidden');
    return;
  }

  noCoursesElement.classList.add('hidden');
  coursesContainer.classList.remove('hidden');

  coursesContainer.innerHTML = coursesToShow.map(course => createEnrolledCourseCard(course)).join('');
}

// Create enrolled course card
function createEnrolledCourseCard(course) {
  const progressPercentage = Math.round(course.progress);
  const progressBarWidth = `${progressPercentage}%`;

  let statusBadge = '';
  let actionButton = '';

  if (course.completed) {
    statusBadge = '<span class="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-semibold">Completed</span>';
    actionButton = `
      <button onclick="downloadCertificate('${course.courseId}')" class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-semibold">
        Download Certificate
      </button>
    `;
  } else if (course.progress > 0) {
    statusBadge = '<span class="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-semibold">In Progress</span>';
   // In my-courses.js, inside createEnrolledCourseCard()
// ADD THIS NEW CODE
if (course.completed) {
    statusBadge = '<span class="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-semibold">Completed</span>';
    actionButton = `
      <a href="lecture.html?id=${course.courseId}" class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-semibold">
        Review Course
      </a>
    `;
  } else if (course.progress > 0) {
    statusBadge = '<span class="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-semibold">In Progress</span>';
    actionButton = `
      <a href="lecture.html?id=${course.courseId}" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold">
        Continue Learning
      </a>
    `;
  } else {
    statusBadge = '<span class="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs font-semibold">Not Started</span>';
    actionButton = `
      <a href="lecture.html?id=${course.courseId}" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold">
        Start Learning
      </a>
    `;
  }
  } else {
    statusBadge = '<span class="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs font-semibold">Not Started</span>';
    actionButton = `
      <button onclick="updateProgress('${course.enrollmentId}', 10)" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold">
        Start Learning
      </button>
    `;
  }

  return `
    <div class="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300">
      <div class="relative">
        <img src="${course.image}" alt="${course.title}" class="w-full h-48 object-cover">
        <div class="absolute top-4 right-4">
          ${statusBadge}
        </div>
      </div>
      
      <div class="p-6">
        <h3 class="text-xl font-bold mb-2 text-gray-900">${course.title}</h3>
        <p class="text-gray-600 mb-4 line-clamp-2">${course.description}</p>
        
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center text-sm text-gray-600">
            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
            </svg>
            ${course.instructor}
          </div>
          <div class="flex items-center text-sm text-gray-600">
            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            ${course.duration}
          </div>
        </div>
        
        <!-- Progress Bar -->
        <div class="mb-4">
          <div class="flex justify-between items-center mb-1">
            <span class="text-sm text-gray-600">Progress</span>
            <span class="text-sm font-semibold text-gray-900">${progressPercentage}%</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div class="bg-blue-600 h-2 rounded-full transition-all duration-300" style="width: ${progressBarWidth}"></div>
          </div>
        </div>
        
        <div class="flex items-center justify-between">
          ${actionButton}
          <a href="course-details.html?id=${course.courseId}" class="text-blue-600 hover:text-blue-700 transition-colors text-sm font-semibold">
            View Details
          </a>
        </div>
      </div>
    </div>
  `;
}

// Update course progress
async function updateProgress(enrollmentId, newProgress) {
  try {
    const progressIncrement = Math.min(newProgress + 25, 100);
    const isCompleted = progressIncrement >= 100;

    await db.collection('enrollments').doc(enrollmentId).update({
      progress: progressIncrement,
      completed: isCompleted,
      lastAccessed: firebase.firestore.FieldValue.serverTimestamp()
    });

    // Reload courses to show updated progress
    loadEnrolledCourses();

    if (isCompleted) {
      alert('Congratulations! You have completed this course. You can now download your certificate.');
    }
  } catch (error) {
    console.error('Error updating progress:', error);
    alert('Error updating progress. Please try again.');
  }
}

// Download certificate
function downloadCertificate(courseId) {
  const course = enrolledCourses.find(c => c.courseId === courseId);
  if (!course || !course.completed) {
    alert('You must complete the course to download the certificate.');
    return;
  }

  // Create certificate data
  const certificateData = {
    studentName: currentUser.displayName,
    courseName: course.title,
    instructor: course.instructor,
    completionDate: new Date().toLocaleDateString(),
    certificateId: `CERT-${courseId}-${currentUser.uid.substring(0, 8)}`
  };

  // Generate and download certificate
  generateCertificate(certificateData);
}

// Generate certificate (simplified version)
function generateCertificate(data) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  // Set canvas size
  canvas.width = 800;
  canvas.height = 600;

  // Background
  ctx.fillStyle = '#f8f9fa';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Border
  ctx.strokeStyle = '#3b82f6';
  ctx.lineWidth = 8;
  ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);

  // Title
  ctx.fillStyle = '#1f2937';
  ctx.font = 'bold 48px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('Certificate of Completion', canvas.width / 2, 120);

  // Student name
  ctx.font = 'bold 36px Arial';
  ctx.fillStyle = '#3b82f6';
  ctx.fillText(data.studentName, canvas.width / 2, 220);

  // Course info
  ctx.font = '24px Arial';
  ctx.fillStyle = '#1f2937';
  ctx.fillText('has successfully completed', canvas.width / 2, 280);

  ctx.font = 'bold 32px Arial';
  ctx.fillStyle = '#059669';
  ctx.fillText(data.courseName, canvas.width / 2, 340);

  // Instructor
  ctx.font = '20px Arial';
  ctx.fillStyle = '#6b7280';
  ctx.fillText(`Instructor: ${data.instructor}`, canvas.width / 2, 400);

  // Date and ID
  ctx.fillText(`Completion Date: ${data.completionDate}`, canvas.width / 2, 450);
  ctx.fillText(`Certificate ID: ${data.certificateId}`, canvas.width / 2, 480);

  // SmartLearn logo text
  ctx.font = 'bold 28px Arial';
  ctx.fillStyle = '#3b82f6';
  ctx.fillText('SmartLearn', canvas.width / 2, 550);

  // Download the certificate
  canvas.toBlob(function (blob) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${data.courseName.replace(/[^a-z0-9]/gi, '_')}_Certificate.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });
}

// Tab switching
function initializeTabSwitching() {
  if (tabButtons) {
    tabButtons.forEach(button => {
      button.addEventListener('click', function () {
        // Update active tab
        tabButtons.forEach(btn => {
          btn.classList.remove('active', 'border-blue-500', 'text-blue-600');
          btn.classList.add('border-transparent', 'text-gray-500', 'hover:text-gray-700', 'hover:border-gray-300');
        });

        this.classList.add('active', 'border-blue-500', 'text-blue-600');
        this.classList.remove('border-transparent', 'text-gray-500', 'hover:text-gray-700', 'hover:border-gray-300');

        // Update current tab and display courses
        currentTab = this.id.replace('tab-', '');
        displayCourses();
      });
    });
  }
}