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

        (course.modules || []).forEach((module, moduleIndex) => {
            const moduleEl = document.createElement('div');
            moduleEl.className = 'p-4';
            
            let lecturesHTML = (module.lectures || []).map((lecture, lectureIndex) => `
                <li class="flex items-center p-2 rounded hover:bg-gray-200 cursor-pointer" onclick="displayContent(${moduleIndex}, ${lectureIndex}, 'lecture')">
                    <svg class="w-5 h-5 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    <span>${lecture.title}</span>
                </li>
            `).join('');

            let notesHTML = (module.notes || []).map((note, noteIndex) => `
                <li class="flex items-center p-2 rounded hover:bg-gray-200 cursor-pointer" onclick="displayContent(${moduleIndex}, ${noteIndex}, 'note')">
                     <svg class="w-5 h-5 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                    <span>${note.title}</span>
                </li>
            `).join('');

            moduleEl.innerHTML = `
                <h3 class="font-bold text-gray-700">${module.title}</h3>
                <ul class="mt-2 space-y-1 text-sm text-gray-600">
                    ${lecturesHTML}
                    ${notesHTML}
                </ul>
            `;
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
        videoPlayer.src = lecture.videoUrl;
        videoContainer.classList.remove('hidden');
    } else if (type === 'note') {
        const note = module.notes[itemIndex];
        document.getElementById('notes-title').textContent = note.title;
        document.getElementById('notes-content').innerHTML = note.content;
        notesContainer.classList.remove('hidden');
    }
}
