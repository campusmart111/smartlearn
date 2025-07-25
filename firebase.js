// Firebase Configuration - Fixed for proper initialization
const firebaseConfig = {
  apiKey: "AIzaSyCIJvPL0APLWgTXyvS6qQEHkM8kYbOrsIE",
  authDomain: "smartlearn-b0420.firebaseapp.com",
  databaseURL: "https://smartlearn-b0420-default-rtdb.firebaseio.com",
  projectId: "smartlearn-b0420",
  storageBucket: "smartlearn-b0420.firebasestorage.app",
  messagingSenderId: "579725044941",
  appId: "1:579725044941:web:027a24924970cb96c7cd84"
};

// Initialize Firebase only if not already initialized
let app;
if (!firebase.apps.length) {
  app = firebase.initializeApp(firebaseConfig);
} else {
  app = firebase.app();
}

// Initialize services after Firebase is initialized
let auth, database, db;

// Wait for Firebase to be ready
firebase.auth().onAuthStateChanged(function(user) {
  // Initialize services only once
  if (!window.firebaseServicesInitialized) {
    try {
      auth = firebase.auth();
      
      // Check if realtime database is available
      if (firebase.database) {
        database = firebase.database();
      }
      
      // Initialize Firestore
      if (firebase.firestore) {
        db = firebase.firestore();
      }
      
      window.firebaseServicesInitialized = true;
      console.log('Firebase services initialized successfully');
    } catch (error) {
      console.error('Error initializing Firebase services:', error);
    }
  }
});

// Google Auth Provider
const googleProvider = new firebase.auth.GoogleAuthProvider();

// Sample course data structure
const sampleCourses = [
  {
    id: "course_1",
    title: "Complete Web Development Bootcamp",
    description: "Learn HTML, CSS, JavaScript, React, Node.js and MongoDB from scratch",
    instructor: "John Smith",
    instructorImage: "https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=400",
    instructorBio: "Senior Full Stack Developer with 10+ years of experience",
    image: "https://images.pexels.com/photos/11035380/pexels-photo-11035380.jpeg?auto=compress&cs=tinysrgb&w=600",
    price: 89.99,
    rating: 4.8,
    reviews: 1250,
    students: 15420,
    duration: "40 hours",
    level: "Beginner",
    category: "Web Development",
    objectives: [
      "Build responsive websites with HTML, CSS, and JavaScript",
      "Create dynamic web applications with React",
      "Develop backend APIs with Node.js and Express",
      "Work with databases using MongoDB",
      "Deploy applications to production"
    ],
    curriculum: [
      {
        title: "HTML & CSS Fundamentals",
        description: "Learn the building blocks of web development",
        lessons: 12,
        duration: "8 hours"
      },
      {
        title: "JavaScript Essentials",
        description: "Master JavaScript programming concepts",
        lessons: 15,
        duration: "10 hours"
      },
      {
        title: "React Development",
        description: "Build modern user interfaces with React",
        lessons: 18,
        duration: "12 hours"
      },
      {
        title: "Backend with Node.js",
        description: "Create server-side applications",
        lessons: 14,
        duration: "10 hours"
      }
    ],
    createdAt: { seconds: Date.now() / 1000 },
    featured: true
  },
  {
    id: "course_2",
    title: "Python for Data Science",
    description: "Master Python programming and data analysis with pandas, numpy, and matplotlib",
    instructor: "Sarah Johnson",
    instructorImage: "https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=400",
    instructorBio: "Data Scientist at Google with PhD in Computer Science",
    image: "https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg?auto=compress&cs=tinysrgb&w=600",
    price: 69.99,
    rating: 4.9,
    reviews: 890,
    students: 8750,
    duration: "35 hours",
    level: "Intermediate",
    category: "Data Science",
    objectives: [
      "Master Python programming fundamentals",
      "Analyze data with pandas and numpy",
      "Create visualizations with matplotlib and seaborn",
      "Build machine learning models",
      "Work with real-world datasets"
    ],
    curriculum: [
      {
        title: "Python Fundamentals",
        description: "Learn Python syntax and core concepts",
        lessons: 10,
        duration: "8 hours"
      },
      {
        title: "Data Analysis with Pandas",
        description: "Master data manipulation and analysis",
        lessons: 12,
        duration: "10 hours"
      },
      {
        title: "Data Visualization",
        description: "Create compelling charts and graphs",
        lessons: 8,
        duration: "6 hours"
      },
      {
        title: "Machine Learning Basics",
        description: "Introduction to ML algorithms",
        lessons: 15,
        duration: "11 hours"
      }
    ],
    createdAt: { seconds: Date.now() / 1000 },
    featured: true
  },
  {
    id: "course_3",
    title: "Digital Marketing Mastery",
    description: "Complete guide to SEO, social media marketing, and Google Ads",
    instructor: "Mike Wilson",
    instructorImage: "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=400",
    instructorBio: "Digital Marketing Expert with 8+ years at top agencies",
    image: "https://images.pexels.com/photos/265087/pexels-photo-265087.jpeg?auto=compress&cs=tinysrgb&w=600",
    price: 0,
    rating: 4.6,
    reviews: 2100,
    students: 25000,
    duration: "25 hours",
    level: "Beginner",
    category: "Marketing",
    objectives: [
      "Understand digital marketing fundamentals",
      "Master SEO techniques and strategies",
      "Create effective social media campaigns",
      "Run profitable Google Ads campaigns",
      "Analyze marketing performance metrics"
    ],
    curriculum: [
      {
        title: "Digital Marketing Foundations",
        description: "Core concepts and strategies",
        lessons: 8,
        duration: "6 hours"
      },
      {
        title: "Search Engine Optimization",
        description: "Improve website rankings",
        lessons: 10,
        duration: "8 hours"
      },
      {
        title: "Social Media Marketing",
        description: "Build brand presence on social platforms",
        lessons: 9,
        duration: "6 hours"
      },
      {
        title: "Paid Advertising",
        description: "Google Ads and Facebook Ads mastery",
        lessons: 8,
        duration: "5 hours"
      }
    ],
    createdAt: { seconds: Date.now() / 1000 },
    featured: true
  },
  {
    id: "course_4",
    title: "UI/UX Design Fundamentals",
    description: "Learn user interface and user experience design principles and tools",
    instructor: "Emily Chen",
    instructorImage: "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=400",
    instructorBio: "Senior UX Designer at Adobe with 7+ years experience",
    image: "https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg?auto=compress&cs=tinysrgb&w=600",
    price: 79.99,
    rating: 4.7,
    reviews: 650,
    students: 5200,
    duration: "30 hours",
    level: "Beginner",
    category: "Design",
    objectives: [
      "Understand UX design principles",
      "Master Figma and design tools",
      "Create user personas and journey maps",
      "Design responsive interfaces",
      "Conduct user research and testing"
    ],
    curriculum: [
      {
        title: "Design Thinking Process",
        description: "Learn the fundamentals of design thinking",
        lessons: 8,
        duration: "6 hours"
      },
      {
        title: "User Research Methods",
        description: "Understand your users deeply",
        lessons: 10,
        duration: "8 hours"
      },
      {
        title: "Interface Design",
        description: "Create beautiful and functional interfaces",
        lessons: 12,
        duration: "10 hours"
      },
      {
        title: "Prototyping & Testing",
        description: "Build and test your designs",
        lessons: 8,
        duration: "6 hours"
      }
    ],
    createdAt: { seconds: Date.now() / 1000 },
    featured: false
  },
  {
    id: "course_5",
    title: "JavaScript Algorithms & Data Structures",
    description: "Master problem-solving with JavaScript algorithms and data structures",
    instructor: "David Kumar",
    instructorImage: "https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=400",
    instructorBio: "Senior Software Engineer at Microsoft, algorithms expert",
    image: "https://images.pexels.com/photos/1181472/pexels-photo-1181472.jpeg?auto=compress&cs=tinysrgb&w=600",
    price: 0,
    rating: 4.9,
    reviews: 1800,
    students: 12500,
    duration: "45 hours",
    level: "Advanced",
    category: "Programming",
    objectives: [
      "Master common algorithms and data structures",
      "Solve coding interview problems",
      "Optimize code performance",
      "Understand time and space complexity",
      "Practice with real-world examples"
    ],
    curriculum: [
      {
        title: "Arrays and Strings",
        description: "Fundamental data structures",
        lessons: 10,
        duration: "8 hours"
      },
      {
        title: "Linked Lists and Trees",
        description: "Complex data structures",
        lessons: 12,
        duration: "10 hours"
      },
      {
        title: "Sorting and Searching",
        description: "Essential algorithms",
        lessons: 15,
        duration: "12 hours"
      },
      {
        title: "Dynamic Programming",
        description: "Advanced problem-solving techniques",
        lessons: 18,
        duration: "15 hours"
      }
    ],
    createdAt: { seconds: Date.now() / 1000 },
    featured: false
  },
  {
    id: "course_6",
    title: "Mobile App Development with React Native",
    description: "Build cross-platform mobile apps for iOS and Android",
    instructor: "Lisa Rodriguez",
    instructorImage: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=400",
    instructorBio: "Mobile App Developer with 50+ published apps",
    image: "https://images.pexels.com/photos/607812/pexels-photo-607812.jpeg?auto=compress&cs=tinysrgb&w=600",
    price: 99.99,
    rating: 4.5,
    reviews: 420,
    students: 3200,
    duration: "50 hours",
    level: "Intermediate",
    category: "Mobile Development",
    objectives: [
      "Build native mobile apps with React Native",
      "Handle navigation and state management",
      "Integrate with device features",
      "Deploy apps to app stores",
      "Optimize app performance"
    ],
    curriculum: [
      {
        title: "React Native Fundamentals",
        description: "Core concepts and setup",
        lessons: 12,
        duration: "10 hours"
      },
      {
        title: "Navigation & UI Components",
        description: "Build beautiful interfaces",
        lessons: 15,
        duration: "12 hours"
      },
      {
        title: "State Management & APIs",
        description: "Handle data and external services",
        lessons: 18,
        duration: "15 hours"
      },
      {
        title: "Testing & Deployment",
        description: "Quality assurance and publishing",
        lessons: 15,
        duration: "13 hours"
      }
    ],
    createdAt: { seconds: Date.now() / 1000 },
    featured: false
  }
];

// Database API using Firestore (more reliable than Realtime Database for this use case)
const DatabaseAPI = {
  // Initialize sample data in Firestore
  async initializeSampleData() {
    try {
      if (!db) {
        console.log('Firestore not initialized yet');
        return;
      }

      // Check if data already exists
      const snapshot = await db.collection('courses').limit(1).get();
      if (!snapshot.empty) {
        console.log('Sample data already exists');
        return;
      }

      console.log('Adding sample courses to Firestore...');
      const batch = db.batch();
      
      sampleCourses.forEach(course => {
        const docRef = db.collection('courses').doc(course.id);
        batch.set(docRef, course);
      });
      
      await batch.commit();
      console.log('Sample data added successfully');
    } catch (error) {
      console.error('Error adding sample data:', error);
    }
  },

  // Courses
  async getAllCourses() {
    try {
      if (!db) return sampleCourses; // Fallback to sample data
      
      const snapshot = await db.collection('courses').get();
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting courses:', error);
      return sampleCourses; // Fallback to sample data
    }
  },

  async getCourse(courseId) {
    try {
      if (!db) return sampleCourses.find(c => c.id === courseId) || null;
      
      const doc = await db.collection('courses').doc(courseId).get();
      if (!doc.exists) return null;
      
      return {
        id: doc.id,
        ...doc.data()
      };
    } catch (error) {
      console.error('Error getting course:', error);
      return sampleCourses.find(c => c.id === courseId) || null;
    }
  },

  async getFeaturedCourses() {
    try {
      if (!db) return sampleCourses.filter(c => c.featured).slice(0, 3);
      
      const snapshot = await db.collection('courses').where('featured', '==', true).limit(3).get();
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting featured courses:', error);
      return sampleCourses.filter(c => c.featured).slice(0, 3);
    }
  },

  // Enrollments
  async enrollInCourse(userId, courseId) {
    try {
      if (!db) throw new Error('Database not initialized');
      
      const enrollmentData = {
        userId: userId,
        courseId: courseId,
        enrolledAt: firebase.firestore.FieldValue.serverTimestamp(),
        progress: 0,
        completed: false
      };

      const docRef = await db.collection('enrollments').add(enrollmentData);
      
      // Update course students count
      const courseRef = db.collection('courses').doc(courseId);
      await courseRef.update({
        students: firebase.firestore.FieldValue.increment(1)
      });

      return docRef.id;
    } catch (error) {
      console.error('Error enrolling in course:', error);
      throw error;
    }
  },

  async getUserEnrollments(userId) {
    try {
      if (!db) return [];
      
      const snapshot = await db.collection('enrollments').where('userId', '==', userId).get();
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting user enrollments:', error);
      return [];
    }
  },

  async updateEnrollmentProgress(enrollmentId, progress) {
    try {
      if (!db) throw new Error('Database not initialized');
      
      const completed = progress >= 100;
      await db.collection('enrollments').doc(enrollmentId).update({
        progress: progress,
        completed: completed,
        lastAccessed: firebase.firestore.FieldValue.serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating enrollment progress:', error);
      throw error;
    }
  },

  async checkEnrollment(userId, courseId) {
    try {
      if (!db) return null;
      
      const snapshot = await db.collection('enrollments')
        .where('userId', '==', userId)
        .where('courseId', '==', courseId)
        .limit(1)
        .get();
      
      if (snapshot.empty) return null;
      
      const doc = snapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data()
      };
    } catch (error) {
      console.error('Error checking enrollment:', error);
      return null;
    }
  }
};

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  // Wait a bit for Firebase to initialize
  setTimeout(() => {
    if (window.firebaseServicesInitialized && db) {
      DatabaseAPI.initializeSampleData();
    }
  }, 1000);
});

// Export for global use
window.DatabaseAPI = DatabaseAPI;
window.auth = () => auth;
window.db = () => db;