document.addEventListener('DOMContentLoaded', () => {
    // Wait for Firebase to be initialized by the other scripts
    const interval = setInterval(() => {
        if (window.firebaseServicesInitialized && typeof window.db === 'function' && window.currentUser !== undefined) {
            clearInterval(interval);
            initializeLecturePage();
        }
    }, 100);
});

async function initializeLecturePage() {
    const urlParams = new URLSearchParams(window.location.search);
    const courseId = urlParams.get('id');
    const loadingEl = document.getElementById('loading');
    const contentEl = document.getElementById('course-player-content');

    if (!courseId) {
        window.location.href = 'my-courses.html';
        return;
    }

    // Check if user is logged in
    if (!currentUser) {
        loadingEl.innerHTML = '<p class="text-red-500 text-center">Please log in to view this course.</p>';
        setTimeout(() => (window.location.href = 'my-courses.html'), 2000);
        return;
    }

    try {
        // 1. Verify the user is enrolled in this course
        const enrollmentSnapshot = await db().collection('enrollments')
            .where('userId', '==', currentUser.uid)
            .where('courseId', '==', courseId)
            .limit(1)
            .get();

        if (enrollmentSnapshot.empty) {
            loadingEl.innerHTML = '<p class="text-red-500 text-center">You are not enrolled in this course.</p>';
            setTimeout(() => (window.location.href = 'my-courses.html'), 2000);
            return;
        }

        // 2. Fetch the course data
        const courseDoc = await db().collection('courses').doc(courseId).get();
        if (!courseDoc.exists) {
            throw new Error("Course not found");
        }
        const course = courseDoc.data();
        document.getElementById('course-title').textContent = course.title;

        // 3. Render the modules in the sidebar
        const modulesList = document.getElementById('modules-list');
        modulesList.innerHTML = ''; // Clear existing content

        if (!course.modules || course.modules.length === 0) {
            modulesList.innerHTML = '<div class="p-4 text-gray-500">No course content available yet.</div>';
            loadingEl.classList.add('hidden');
            contentEl.classList.remove('hidden');
            return;
        }

        course.modules.forEach((module, moduleIndex) => {
            const moduleEl = document.createElement('div');
            moduleEl.className = 'border-b border-gray-200';
            
            // Create lectures section
            let lecturesHTML = '';
            if (module.lectures && module.lectures.length > 0) {
                lecturesHTML = `
                    <div class="mb-3">
                        <h4 class="text-sm font-semibold text-gray-600 mb-2 flex items-center">
                            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                            </svg>
                            Lectures
                        </h4>
                        <ul class="space-y-1">
                            ${module.lectures.map((lecture, lectureIndex) => `
                                <li class="flex items-center p-2 rounded hover:bg-blue-50 cursor-pointer transition-colors" onclick="displayContent(${moduleIndex}, ${lectureIndex}, 'lecture')">
                                    <svg class="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path>
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                    </svg>
                                    <div class="flex-1">
                                        <div class="text-sm font-medium text-gray-800">${lecture.title}</div>
                                        <div class="text-xs text-gray-500">${lecture.duration || 'Duration not specified'}</div>
                                    </div>
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                `;
            }

            // Create notes section
            let notesHTML = '';
            if (module.notes && module.notes.length > 0) {
                notesHTML = `
                    <div class="mb-3">
                        <h4 class="text-sm font-semibold text-gray-600 mb-2 flex items-center">
                            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                            </svg>
                            Notes & Materials
                        </h4>
                        <ul class="space-y-1">
                            ${module.notes.map((note, noteIndex) => `
                                <li class="flex items-center p-2 rounded hover:bg-green-50 cursor-pointer transition-colors" onclick="displayContent(${moduleIndex}, ${noteIndex}, 'note')">
                                    <svg class="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                    </svg>
                                    <div class="text-sm font-medium text-gray-800">${note.title}</div>
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                `;
            }

            moduleEl.innerHTML = `
                <div class="p-4">
                    <h3 class="font-bold text-gray-800 mb-3 text-base">${module.title}</h3>
                    ${lecturesHTML}
                    ${notesHTML}
                </div>
            `).join('');

            modulesList.appendChild(moduleEl);
        });
        
        // Store course data globally for the displayContent function
        window.courseData = course;

        loadingEl.classList.add('hidden');
        contentEl.classList.remove('hidden');

    } catch (error) {
        console.error("Error loading course player:", error);
        loadingEl.innerHTML = `<p class="text-red-500 text-center">Error: ${error.message}</p>`;
    }
}

function displayContent(moduleIndex, itemIndex, type) {
    const videoContainer = document.getElementById('video-container');
    const notesContainer = document.getElementById('notes-container');
    const welcomeMessage = document.getElementById('welcome-message');
    
    // Hide all containers first
    videoContainer.classList.add('hidden');
    notesContainer.classList.add('hidden');
    welcomeMessage.classList.add('hidden');

    const module = window.courseData.modules[moduleIndex];

    if (type === 'lecture') {
        const lecture = module.lectures[itemIndex];
        const videoPlayer = document.getElementById('video-player');
        
        // Update video source
        videoPlayer.src = lecture.videoUrl;
        
        // Add lecture title above video
        const lectureTitle = document.createElement('h3');
        lectureTitle.className = 'text-2xl font-bold mb-4 text-gray-800';
        lectureTitle.textContent = lecture.title;
        
        // Clear previous title and add new one
        const existingTitle = videoContainer.querySelector('h3');
        if (existingTitle) {
            existingTitle.remove();
        }
        videoContainer.insertBefore(lectureTitle, videoPlayer);
        
        const videoPlayer = document.getElementById('video-player');
        videoPlayer.src = lecture.videoUrl;
        videoContainer.classList.remove('hidden');
    } else if (type === 'note') {
        const note = module.notes[itemIndex];
        document.getElementById('notes-title').textContent = note.title;
        document.getElementById('notes-content').innerHTML = note.content;
        notesContainer.classList.remove('hidden');
    }
}
