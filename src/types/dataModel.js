/**
 * @file dataModel.js
 * Flat, serializable data shapes for the Smart Study Planner.
 * Designed for pure JSON persistence and direct compatibility with ML services.
 */

/**
 * @typedef {Object} TimetableSession
 * @property {string} id - Unique identifier (uuid/timestamp string)
 * @property {string} day - Day of week: "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun"
 * @property {string} startTime - HH:MM in 24h or 12h format (e.g. "09:00 AM")
 * @property {string} endTime - HH:MM format (e.g. "10:30 AM")
 * @property {string} subjectId - Reference to Subject.id
 * @property {string} subject - Subject name for display cache
 * @property {string} topic - Specific topic/chapter or study objective
 * @property {string} tag - Tag badge e.g. "High priority" | "Revision" | "Practice" | "Deep Work"
 * @property {string} color - Color theme token e.g. "sage" | "sand" | "olive" | "peach" | "lavender"
 * @property {string} notes - Optional notes or reminders
 * @property {boolean} done - Whether completed
 */

/**
 * @typedef {Object} Topic
 * @property {string} id - Unique identifier
 * @property {string} chapterId - Reference to Chapter.id
 * @property {string} title - Topic name
 * @property {"Easy" | "Medium" | "Hard"} difficulty - Rated or ML-predicted difficulty
 * @property {boolean} completed - Completion status
 * @property {number} estimatedMinutes - Estimated study duration
 * @property {string} lastRevised - ISO date string or null
 */

/**
 * @typedef {Object} Chapter
 * @property {string} id - Unique identifier
 * @property {string} subjectId - Reference to Subject.id
 * @property {string} title - Chapter name
 * @property {string[]} topicIds - Array of Topic IDs
 */

/**
 * @typedef {Object} Subject
 * @property {string} id - Unique identifier
 * @property {string} name - Subject name
 * @property {string} code - Course code e.g. "MATH301"
 * @property {string} tone - Theme tone: "sage" | "olive" | "sand" | "peach" | "lavender"
 * @property {string} examDate - ISO date string e.g. "2026-11-18"
 * @property {string} scoreStatus - Quick label e.g. "Needs focus" | "On track" | "Good progress"
 */

/**
 * @typedef {Object} StudyGoal
 * @property {string} id - Unique identifier
 * @property {string} title - Goal description
 * @property {"daily" | "weekly"} type - Goal timeframe
 * @property {"hours" | "tasks"} category - Metric type
 * @property {number} current - Current progress
 * @property {number} target - Target metric
 * @property {string} unit - "hrs" | "tasks" | "sessions"
 * @property {boolean} completed - Status
 */

/**
 * @typedef {Object} FocusLog
 * @property {string} id - Unique identifier
 * @property {string} timestamp - ISO timestamp
 * @property {string} subject - Subject name
 * @property {string} topic - Topic worked on
 * @property {number} durationMinutes - Focus duration completed (e.g. 25)
 * @property {"pomodoro" | "shortBreak" | "longBreak"} sessionType
 */

/**
 * @typedef {Object} RevisionItem
 * @property {string} id - Unique identifier
 * @property {string} subjectId - Reference to Subject
 * @property {string} subject - Subject name
 * @property {string} topic - Topic to revise
 * @property {number} stage - Spaced repetition stage: 1 (1d), 2 (3d), 3 (7d), 4 (14d)
 * @property {string} dueDate - ISO date string (YYYY-MM-DD)
 * @property {string} intervalDays - Current interval in days
 * @property {boolean} completed - Completed status
 * @property {string} completedAt - ISO timestamp or null
 * @property {"Easy" | "Medium" | "Hard"} difficulty
 */

/**
 * @typedef {Object} UserSettings
 * @property {string} preferredStudyTime - "morning" | "afternoon" | "evening" | "night"
 * @property {number} dailyHourTarget - Target study hours per day
 * @property {number} pomodoroMinutes - Focus duration (default: 25)
 * @property {number} shortBreakMinutes - Short break duration (default: 5)
 * @property {number} longBreakMinutes - Long break duration (default: 15)
 * @property {number} longBreakInterval - Pomodoros before long break (default: 4)
 * @property {boolean} soundEnabled - Whether audio notification plays
 * @property {boolean} desktopNotifications - Browser Notification API enabled
 * @property {Record<string, number>} weeklyHourAllocation - Available hours per day
 */

export const INITIAL_SETTINGS = {
  preferredStudyTime: "morning",
  dailyHourTarget: 4.5,
  pomodoroMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  longBreakInterval: 4,
  soundEnabled: true,
  desktopNotifications: false,
  mascotEnabled: true,
  weeklyHourAllocation: {
    Mon: 4,
    Tue: 4.5,
    Wed: 3.5,
    Thu: 5,
    Fri: 4,
    Sat: 6,
    Sun: 5,
  },
};

export const INITIAL_SUBJECTS = [
  {
    id: "sub-1",
    name: "Mathematics",
    code: "MATH-204",
    tone: "sage",
    examDate: "2026-11-18",
    scoreStatus: "Needs focus",
  },
  {
    id: "sub-2",
    name: "Computer Networks",
    code: "CS-302",
    tone: "olive",
    examDate: "2026-11-23",
    scoreStatus: "On track",
  },
  {
    id: "sub-3",
    name: "Database Management",
    code: "CS-305",
    tone: "sand",
    examDate: "2026-11-20",
    scoreStatus: "Good progress",
  },
];

export const INITIAL_CHAPTERS = [
  { id: "chap-1", subjectId: "sub-1", title: "Integral Calculus" },
  { id: "chap-2", subjectId: "sub-1", title: "Differential Equations" },
  { id: "chap-3", subjectId: "sub-2", title: "Transport Layer Protocols" },
  { id: "chap-4", subjectId: "sub-2", title: "Network Routing Algorithms" },
  { id: "chap-5", subjectId: "sub-3", title: "Relational Schema Normalization" },
  { id: "chap-6", subjectId: "sub-3", title: "Transaction Management & ACID" },
];

export const INITIAL_TOPICS = [
  { id: "top-1", chapterId: "chap-1", title: "Integration by Parts & Substitution", difficulty: "Medium", completed: true, estimatedMinutes: 45, lastRevised: "2026-11-10" },
  { id: "top-2", chapterId: "chap-1", title: "Improper Integrals & Convergence", difficulty: "Hard", completed: false, estimatedMinutes: 60, lastRevised: null },
  { id: "top-3", chapterId: "chap-1", title: "Definite Integral Applications", difficulty: "Easy", completed: true, estimatedMinutes: 30, lastRevised: "2026-11-08" },
  { id: "top-4", chapterId: "chap-2", title: "First-Order Linear Equations", difficulty: "Easy", completed: false, estimatedMinutes: 40, lastRevised: null },
  { id: "top-5", chapterId: "chap-2", title: "Homogeneous Second-Order Equations", difficulty: "Hard", completed: false, estimatedMinutes: 75, lastRevised: null },
  { id: "top-6", chapterId: "chap-3", title: "TCP 3-Way Handshake & Teardown", difficulty: "Medium", completed: true, estimatedMinutes: 35, lastRevised: "2026-11-12" },
  { id: "top-7", chapterId: "chap-3", title: "Flow Control & Sliding Window", difficulty: "Medium", completed: true, estimatedMinutes: 45, lastRevised: "2026-11-11" },
  { id: "top-8", chapterId: "chap-3", title: "Congestion Avoidance & Tahoe/Reno", difficulty: "Hard", completed: false, estimatedMinutes: 50, lastRevised: null },
  { id: "top-9", chapterId: "chap-4", title: "Dijkstra's Link-State Algorithm", difficulty: "Medium", completed: true, estimatedMinutes: 40, lastRevised: "2026-11-09" },
  { id: "top-10", chapterId: "chap-5", title: "1NF, 2NF and 3NF Normal Forms", difficulty: "Easy", completed: true, estimatedMinutes: 40, lastRevised: "2026-11-11" },
  { id: "top-11", chapterId: "chap-5", title: "Boyce-Codd Normal Form (BCNF)", difficulty: "Hard", completed: false, estimatedMinutes: 50, lastRevised: null },
  { id: "top-12", chapterId: "chap-6", title: "ACID Properties & Serializability", difficulty: "Medium", completed: true, estimatedMinutes: 45, lastRevised: "2026-11-10" },
];

export const INITIAL_TIMETABLE = [
  { id: "tt-1", day: "Thu", startTime: "07:00 AM", endTime: "08:00 AM", subjectId: "sub-1", subject: "Mathematics", topic: "Practice integration problems", tag: "High priority", color: "sage", notes: "Focus on trigonometric substitutions", done: true },
  { id: "tt-2", day: "Thu", startTime: "09:30 AM", endTime: "10:15 AM", subjectId: "sub-2", subject: "Computer Networks", topic: "Revise transport layer concepts", tag: "Revision", color: "sand", notes: "Review TCP header flags", done: false },
  { id: "tt-3", day: "Thu", startTime: "04:00 PM", endTime: "05:00 PM", subjectId: "sub-3", subject: "Database Management", topic: "Normalization · 1NF to BCNF", tag: "Medium", color: "olive", notes: "Check functional dependency diagrams", done: false },
  { id: "tt-4", day: "Thu", startTime: "06:30 PM", endTime: "07:15 PM", subjectId: "sub-1", subject: "Mathematics", topic: "Solve a timed practice set", tag: "High priority", color: "sage", notes: "Section B exam format", done: false },
  { id: "tt-5", day: "Fri", startTime: "08:00 AM", endTime: "09:30 AM", subjectId: "sub-2", subject: "Computer Networks", topic: "Congestion control simulation", tag: "Practice", color: "olive", notes: "Hands-on Wireshark lab", done: false },
  { id: "tt-6", day: "Fri", startTime: "10:00 AM", endTime: "11:00 AM", subjectId: "sub-1", subject: "Mathematics", topic: "Differential Equations intro", tag: "High priority", color: "sage", notes: "Solve homogeneous problems", done: false },
  { id: "tt-7", day: "Sat", startTime: "09:00 AM", endTime: "11:00 AM", subjectId: "sub-3", subject: "Database Management", topic: "ACID transactions & locking", tag: "Deep Work", color: "sand", notes: "Read chapter 6 summaries", done: false },
  { id: "tt-8", day: "Sat", startTime: "02:00 PM", endTime: "03:30 PM", subjectId: "sub-1", subject: "Mathematics", topic: "Mock exam: Calculus II", tag: "High priority", color: "sage", notes: "Timed 90 min sprint", done: false },
  { id: "tt-9", day: "Sun", startTime: "10:00 AM", endTime: "11:30 AM", subjectId: "sub-2", subject: "Computer Networks", topic: "Routing Protocols review", tag: "Revision", color: "olive", notes: "OSPF vs BGP comparison", done: false },
  { id: "tt-10", day: "Mon", startTime: "07:30 AM", endTime: "08:45 AM", subjectId: "sub-1", subject: "Mathematics", topic: "Second-order differential equations", tag: "High priority", color: "sage", notes: "Review formulas", done: false },
  { id: "tt-11", day: "Tue", startTime: "09:00 AM", endTime: "10:15 AM", subjectId: "sub-3", subject: "Database Management", topic: "Indexing and B+ Trees", tag: "Practice", color: "sand", notes: "Diagram drawing exercises", done: false },
  { id: "tt-12", day: "Wed", startTime: "04:30 PM", endTime: "05:45 PM", subjectId: "sub-2", subject: "Computer Networks", topic: "DNS and Application Protocols", tag: "Revision", color: "olive", notes: "Flashcards review", done: false },
];

export const INITIAL_GOALS = [
  { id: "g-1", title: "Daily study duration", type: "daily", category: "hours", current: 3.2, target: 4.5, unit: "hrs", completed: false },
  { id: "g-2", title: "Complete planned timetable tasks", type: "daily", category: "tasks", current: 3, target: 4, unit: "tasks", completed: false },
  { id: "g-3", title: "Weekly dedicated study time", type: "weekly", category: "hours", current: 18.2, target: 24, unit: "hrs", completed: false },
  { id: "g-4", title: "Complete 10 hard practice questions", type: "weekly", category: "tasks", current: 7, target: 10, unit: "tasks", completed: false },
  { id: "g-5", title: "Daily morning focus sprint", type: "daily", category: "hours", current: 1.5, target: 1.5, unit: "hrs", completed: true },
  { id: "g-6", title: "Revise 4 spaced repetition topics", type: "weekly", category: "tasks", current: 3, target: 4, unit: "tasks", completed: false },
];

export const INITIAL_REVISIONS = [
  { id: "rev-1", subjectId: "sub-1", subject: "Mathematics", topic: "Integration by Parts & Substitution", stage: 2, dueDate: "2026-11-13", intervalDays: 3, completed: false, completedAt: null, difficulty: "Medium" },
  { id: "rev-2", subjectId: "sub-2", subject: "Computer Networks", topic: "TCP 3-Way Handshake", stage: 1, dueDate: "2026-11-13", intervalDays: 1, completed: false, completedAt: null, difficulty: "Medium" },
  { id: "rev-3", subjectId: "sub-3", subject: "Database Management", topic: "1NF, 2NF and 3NF Normal Forms", stage: 3, dueDate: "2026-11-12", intervalDays: 7, completed: false, completedAt: null, difficulty: "Easy" }, // Overdue!
  { id: "rev-4", subjectId: "sub-1", subject: "Mathematics", topic: "Definite Integral Applications", stage: 4, dueDate: "2026-11-16", intervalDays: 14, completed: false, completedAt: null, difficulty: "Easy" },
  { id: "rev-5", subjectId: "sub-2", subject: "Computer Networks", topic: "Dijkstra's Link-State Algorithm", stage: 2, dueDate: "2026-11-15", intervalDays: 3, completed: false, completedAt: null, difficulty: "Medium" },
  { id: "rev-6", subjectId: "sub-3", subject: "Database Management", topic: "ACID Properties & Serializability", stage: 1, dueDate: "2026-11-11", intervalDays: 1, completed: true, completedAt: "2026-11-11T16:30:00.000Z", difficulty: "Medium" },
  { id: "rev-7", subjectId: "sub-1", subject: "Mathematics", topic: "Calculus Limits & Continuity", stage: 4, dueDate: "2026-11-09", intervalDays: 14, completed: true, completedAt: "2026-11-09T18:20:00.000Z", difficulty: "Easy" },
];

export const INITIAL_FOCUS_LOGS = [
  { id: "fl-1", timestamp: "2026-11-13T07:45:00.000Z", subject: "Mathematics", topic: "Integration practice set", durationMinutes: 25, sessionType: "pomodoro" },
  { id: "fl-2", timestamp: "2026-11-13T08:15:00.000Z", subject: "Mathematics", topic: "Integration practice set", durationMinutes: 25, sessionType: "pomodoro" },
  { id: "fl-3", timestamp: "2026-11-13T09:40:00.000Z", subject: "Computer Networks", topic: "TCP flags notes", durationMinutes: 25, sessionType: "pomodoro" },
  { id: "fl-4", timestamp: "2026-11-12T16:00:00.000Z", subject: "Database Management", topic: "Normalization exercises", durationMinutes: 25, sessionType: "pomodoro" },
  { id: "fl-5", timestamp: "2026-11-12T17:00:00.000Z", subject: "Database Management", topic: "Normalization exercises", durationMinutes: 25, sessionType: "pomodoro" },
];

export const INITIAL_STREAK = {
  currentStreak: 6,
  longestStreak: 14,
  lastActiveDate: "2026-11-13",
  streakHistory: [
    { date: "2026-11-08", active: true, minutes: 135 },
    { date: "2026-11-09", active: true, minutes: 190 },
    { date: "2026-11-10", active: true, minutes: 160 },
    { date: "2026-11-11", active: true, minutes: 220 },
    { date: "2026-11-12", active: true, minutes: 175 },
    { date: "2026-11-13", active: true, minutes: 195 },
  ],
};

