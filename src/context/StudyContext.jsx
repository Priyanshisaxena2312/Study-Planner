import React, { createContext, useContext, useReducer, useEffect } from "react";
import {
  INITIAL_SETTINGS,
  INITIAL_SUBJECTS,
  INITIAL_CHAPTERS,
  INITIAL_TOPICS,
  INITIAL_TIMETABLE,
  INITIAL_GOALS,
  INITIAL_REVISIONS,
  INITIAL_FOCUS_LOGS,
  INITIAL_STREAK,
} from "../types/dataModel";

const STORAGE_KEY = "smart_study_planner_state_v1";

const initialAppState = {
  settings: INITIAL_SETTINGS,
  subjects: INITIAL_SUBJECTS,
  chapters: INITIAL_CHAPTERS,
  topics: INITIAL_TOPICS,
  timetable: INITIAL_TIMETABLE,
  goals: INITIAL_GOALS,
  revisions: INITIAL_REVISIONS,
  focusLogs: INITIAL_FOCUS_LOGS,
  streak: INITIAL_STREAK,
};

function loadStoredState() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return initialAppState;
    const parsed = JSON.parse(raw);
    return {
      settings: { ...INITIAL_SETTINGS, ...(parsed.settings || {}) },
      subjects: parsed.subjects || INITIAL_SUBJECTS,
      chapters: parsed.chapters || INITIAL_CHAPTERS,
      topics: parsed.topics || INITIAL_TOPICS,
      timetable: parsed.timetable || INITIAL_TIMETABLE,
      goals: parsed.goals || INITIAL_GOALS,
      revisions: parsed.revisions || INITIAL_REVISIONS,
      focusLogs: parsed.focusLogs || INITIAL_FOCUS_LOGS,
      streak: parsed.streak || INITIAL_STREAK,
    };
  } catch (e) {
    console.warn("Failed to load state from localStorage:", e);
    return initialAppState;
  }
}

function studyReducer(state, action) {
  switch (action.type) {
    // ----------------- TIMETABLE -----------------
    case "ADD_SESSION": {
      return {
        ...state,
        timetable: [action.payload, ...state.timetable],
      };
    }
    case "UPDATE_SESSION": {
      return {
        ...state,
        timetable: state.timetable.map((s) =>
          s.id === action.payload.id ? { ...s, ...action.payload } : s
        ),
      };
    }
    case "DELETE_SESSION": {
      return {
        ...state,
        timetable: state.timetable.filter((s) => s.id !== action.payload),
      };
    }
    case "TOGGLE_SESSION": {
      const updated = state.timetable.map((s) =>
        s.id === action.payload ? { ...s, done: !s.done } : s
      );

      // Also update daily tasks goal if present
      const completedCount = updated.filter((s) => s.done && s.day === "Thu").length;
      const updatedGoals = state.goals.map((g) => {
        if (g.category === "tasks" && g.type === "daily") {
          return {
            ...g,
            current: Math.min(g.target, completedCount),
            completed: completedCount >= g.target,
          };
        }
        return g;
      });

      return {
        ...state,
        timetable: updated,
        goals: updatedGoals,
      };
    }
    case "MOVE_SESSION": {
      const { id, targetDay } = action.payload;
      return {
        ...state,
        timetable: state.timetable.map((s) =>
          s.id === id ? { ...s, day: targetDay } : s
        ),
      };
    }

    // ----------------- SUBJECTS, CHAPTERS, TOPICS -----------------
    case "ADD_SUBJECT": {
      return {
        ...state,
        subjects: [...state.subjects, action.payload],
      };
    }
    case "UPDATE_SUBJECT": {
      return {
        ...state,
        subjects: state.subjects.map((sub) =>
          sub.id === action.payload.id ? { ...sub, ...action.payload } : sub
        ),
      };
    }
    case "DELETE_SUBJECT": {
      const subjectId = action.payload;
      const chaptersToRemove = state.chapters.filter((c) => c.subjectId === subjectId).map((c) => c.id);
      return {
        ...state,
        subjects: state.subjects.filter((sub) => sub.id !== subjectId),
        chapters: state.chapters.filter((c) => c.subjectId !== subjectId),
        topics: state.topics.filter((t) => !chaptersToRemove.includes(t.chapterId)),
        timetable: state.timetable.filter((s) => s.subjectId !== subjectId),
        revisions: state.revisions.filter((r) => r.subjectId !== subjectId),
      };
    }
    case "ADD_CHAPTER": {
      return {
        ...state,
        chapters: [...state.chapters, action.payload],
      };
    }
    case "UPDATE_CHAPTER": {
      return {
        ...state,
        chapters: state.chapters.map((chap) =>
          chap.id === action.payload.id ? { ...chap, ...action.payload } : chap
        ),
      };
    }
    case "DELETE_CHAPTER": {
      const chapterId = action.payload;
      return {
        ...state,
        chapters: state.chapters.filter((c) => c.id !== chapterId),
        topics: state.topics.filter((t) => t.chapterId !== chapterId),
      };
    }
    case "ADD_TOPIC": {
      return {
        ...state,
        topics: [...state.topics, action.payload],
      };
    }
    case "UPDATE_TOPIC": {
      return {
        ...state,
        topics: state.topics.map((t) =>
          t.id === action.payload.id ? { ...t, ...action.payload } : t
        ),
      };
    }
    case "DELETE_TOPIC": {
      return {
        ...state,
        topics: state.topics.filter((t) => t.id !== action.payload),
      };
    }
    case "TOGGLE_TOPIC": {
      const topicId = action.payload;
      return {
        ...state,
        topics: state.topics.map((t) =>
          t.id === topicId ? { ...t, completed: !t.completed } : t
        ),
      };
    }

    // ----------------- STUDY GOALS -----------------
    case "ADD_GOAL": {
      return {
        ...state,
        goals: [...state.goals, action.payload],
      };
    }
    case "UPDATE_GOAL": {
      return {
        ...state,
        goals: state.goals.map((g) =>
          g.id === action.payload.id ? { ...g, ...action.payload } : g
        ),
      };
    }
    case "DELETE_GOAL": {
      return {
        ...state,
        goals: state.goals.filter((g) => g.id !== action.payload),
      };
    }
    case "INCREMENT_GOAL": {
      const { id, amount } = action.payload;
      return {
        ...state,
        goals: state.goals.map((g) => {
          if (g.id !== id) return g;
          const newCurrent = Number((g.current + (amount || 1)).toFixed(1));
          return {
            ...g,
            current: newCurrent,
            completed: newCurrent >= g.target,
          };
        }),
      };
    }

    // ----------------- FOCUS MODE / POMODORO -----------------
    case "LOG_FOCUS_SESSION": {
      const newLog = action.payload;
      const additionalHours = Number((newLog.durationMinutes / 60).toFixed(2));

      // 1. Append focus log
      const updatedFocusLogs = [newLog, ...state.focusLogs];

      // 2. Increment hours on daily & weekly study goals
      const updatedGoals = state.goals.map((g) => {
        if (g.category === "hours") {
          const nextVal = Number((g.current + additionalHours).toFixed(1));
          return {
            ...g,
            current: nextVal,
            completed: nextVal >= g.target,
          };
        }
        return g;
      });

      // 3. Mark corresponding topic completed or revised if applicable
      let updatedTopics = state.topics;
      if (newLog.topicId) {
        updatedTopics = state.topics.map((t) =>
          t.id === newLog.topicId
            ? { ...t, completed: true, lastRevised: new Date().toISOString().split("T")[0] }
            : t
        );
      }

      // 4. Update study streak
      const today = new Date().toISOString().split("T")[0];
      const hasStudiedToday = state.streak.lastActiveDate === today;
      const newStreakCount = hasStudiedToday ? state.streak.currentStreak : state.streak.currentStreak + 1;
      const newLongest = Math.max(state.streak.longestStreak, newStreakCount);

      const updatedStreak = {
        currentStreak: newStreakCount,
        longestStreak: newLongest,
        lastActiveDate: today,
        streakHistory: [
          ...state.streak.streakHistory.filter((h) => h.date !== today),
          { date: today, active: true, minutes: 25 },
        ],
      };

      return {
        ...state,
        focusLogs: updatedFocusLogs,
        goals: updatedGoals,
        topics: updatedTopics,
        streak: updatedStreak,
      };
    }

    // ----------------- REVISION CENTER -----------------
    case "ADD_REVISION": {
      return {
        ...state,
        revisions: [action.payload, ...state.revisions],
      };
    }
    case "COMPLETE_REVISION": {
      const { id, rating } = action.payload; // rating 1..5
      const intervals = [1, 3, 7, 14, 30];

      const updatedRevisions = state.revisions.map((rev) => {
        if (rev.id !== id) return rev;

        const nextStage = rev.stage + 1;
        const isFinished = nextStage > 4;

        if (isFinished) {
          return {
            ...rev,
            completed: true,
            completedAt: new Date().toISOString(),
          };
        }

        const nextInterval = intervals[nextStage - 1] || 14;
        const nextDue = new Date();
        nextDue.setDate(nextDue.getDate() + nextInterval);

        return {
          ...rev,
          stage: nextStage,
          intervalDays: nextInterval,
          dueDate: nextDue.toISOString().split("T")[0],
          completed: false,
          completedAt: new Date().toISOString(),
        };
      });

      // Also increment goals if revising count is tracked
      const updatedGoals = state.goals.map((g) => {
        if (g.title.toLowerCase().includes("revise")) {
          const nextVal = g.current + 1;
          return { ...g, current: nextVal, completed: nextVal >= g.target };
        }
        return g;
      });

      return {
        ...state,
        revisions: updatedRevisions,
        goals: updatedGoals,
      };
    }
    case "DELETE_REVISION": {
      return {
        ...state,
        revisions: state.revisions.filter((r) => r.id !== action.payload),
      };
    }

    // ----------------- SETTINGS & RESET -----------------
    case "UPDATE_SETTINGS": {
      return {
        ...state,
        settings: { ...state.settings, ...action.payload },
      };
    }
    case "RESET_DATA": {
      return {
        settings: INITIAL_SETTINGS,
        subjects: INITIAL_SUBJECTS,
        chapters: INITIAL_CHAPTERS,
        topics: INITIAL_TOPICS,
        timetable: INITIAL_TIMETABLE,
        goals: INITIAL_GOALS,
        revisions: INITIAL_REVISIONS,
        focusLogs: INITIAL_FOCUS_LOGS,
        streak: INITIAL_STREAK,
      };
    }
    case "IMPORT_DATA": {
      return {
        ...initialAppState,
        ...action.payload,
      };
    }

    default:
      return state;
  }
}

const StudyContext = createContext(null);

export function StudyProvider({ children }) {
  const [state, dispatch] = useReducer(studyReducer, null, loadStoredState);

  // Sync to localStorage on every state change
  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn("Error saving study state to localStorage:", e);
    }
  }, [state]);

  // Derived metrics for UI consumption
  const chapterProgressMap = React.useMemo(() => {
    const map = {};
    state.chapters.forEach((chapter) => {
      const chapterTopics = state.topics.filter((t) => t.chapterId === chapter.id);
      if (chapterTopics.length === 0) {
        map[chapter.id] = 0;
      } else {
        const done = chapterTopics.filter((t) => t.completed).length;
        map[chapter.id] = Math.round((done / chapterTopics.length) * 100);
      }
    });
    return map;
  }, [state.chapters, state.topics]);

  const subjectProgressMap = React.useMemo(() => {
    const map = {};
    state.subjects.forEach((subject) => {
      const subjectChapters = state.chapters.filter((c) => c.subjectId === subject.id);
      const chapterIds = subjectChapters.map((c) => c.id);
      const subjectTopics = state.topics.filter((t) => chapterIds.includes(t.chapterId));
      if (subjectTopics.length === 0) {
        map[subject.id] = 0;
      } else {
        const done = subjectTopics.filter((t) => t.completed).length;
        map[subject.id] = Math.round((done / subjectTopics.length) * 100);
      }
    });
    return map;
  }, [state.subjects, state.chapters, state.topics]);

  // Today's summary (Thursday in sample context)
  const todaySessions = state.timetable.filter((s) => s.day === "Thu");
  const todayCompleted = todaySessions.filter((s) => s.done).length;
  const todayTotal = todaySessions.length;
  const todayCompletionRate = todayTotal === 0 ? 0 : Math.round((todayCompleted / todayTotal) * 100);

  // Weekly study hours calculation
  const weeklyHoursLogged = React.useMemo(() => {
    // Sum focus logs duration in minutes / 60
    const minutes = state.focusLogs.reduce((acc, log) => acc + (log.durationMinutes || 0), 0);
    return Number((minutes / 60).toFixed(1));
  }, [state.focusLogs]);

  const value = {
    state,
    dispatch,
    chapterProgressMap,
    subjectProgressMap,
    todaySessions,
    todayCompleted,
    todayTotal,
    todayCompletionRate,
    weeklyHoursLogged,
  };

  return <StudyContext.Provider value={value}>{children}</StudyContext.Provider>;
}

export function useStudy() {
  const context = useContext(StudyContext);
  if (!context) {
    throw new Error("useStudy must be used within a StudyProvider");
  }
  return context;
}

